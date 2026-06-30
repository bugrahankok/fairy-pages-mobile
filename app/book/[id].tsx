import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Image,
    Platform,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';
import { API_BASE_URL, bookApi } from '../../services/api';
import { Book } from '../../types';

const { width, height } = Dimensions.get('window');

export default function BookDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { user, token } = useAuth();
    const { isFavorite, toggleFavorite } = useFavorites();
    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);
    const [showReader, setShowReader] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        loadBook();
    }, [id]);

    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        if (book && !book.coverImagePath && !book.pdfReady) {
            console.log('Cover image/PDF not ready, starting polling...');
            intervalId = setInterval(async () => {
                try {
                    const response = await bookApi.getById(parseInt(id));
                    if (response.data.coverImagePath || response.data.pdfReady) {
                        console.log('Polling finished. Cover ready:', !!response.data.coverImagePath, 'PDF ready:', response.data.pdfReady);
                        setBook(response.data);
                        clearInterval(intervalId);
                    }
                } catch (error) {
                    console.error('Error polling cover image status:', error);
                }
            }, 4000);
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [book?.coverImagePath, book?.pdfReady, id]);

    const loadBook = async () => {
        try {
            const response = await bookApi.getById(parseInt(id));
            console.log('Book loaded:', response.data);
            setBook(response.data);

            // Increment view count via API silently
            try {
                await bookApi.incrementView(parseInt(id));
            } catch (err) {
                // Ignore silent counter error
            }
        } catch (error) {
            console.error('Failed to load book:', error);
            Alert.alert('Error', 'Failed to load book details');
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async () => {
        if (!book) return;
        const displayTitle = book.title || `${book.name}'s Adventure`;
        try {
            await Share.share({
                message: `Check out this magical story "${displayTitle}" created on Fairy Pages!`,
                title: displayTitle,
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const handleDownloadPdf = async () => {
        if (!book?.pdfReady) {
            Alert.alert('Not Ready', 'PDF is still being generated. Please try again later.');
            return;
        }

        const pdfUrl = `${API_BASE_URL}/api/book/${book.bookId}/pdf`;
        
        try {
            // Try to increment download count
            try {
                await bookApi.incrementDownload(book.bookId);
            } catch {
                // Ignore silent download count increment error
            }

            Alert.alert('Downloading', 'Preparing your magical PDF...', [], { cancelable: false });
            
            const fileUri = `${FileSystem.documentDirectory}FairyPages_${book.bookId}.pdf`;
            const downloadRes = await FileSystem.downloadAsync(pdfUrl, fileUri, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (downloadRes.status !== 200) {
                throw new Error('Failed to download file');
            }

            const canShare = await Sharing.isAvailableAsync();
            if (canShare) {
                await Sharing.shareAsync(fileUri, {
                    mimeType: 'application/pdf',
                    dialogTitle: 'Save or Share your Magical Story'
                });
            } else {
                Alert.alert('Success', `File downloaded to: ${fileUri}`);
            }
        } catch (error) {
            console.error('Download error:', error);
            Alert.alert('Error', 'Could not download PDF. Please try again.');
        }
    };

    const getCoverUrl = () => {
        return `${API_BASE_URL}/api/book/${book?.bookId}/cover`;
    };

    const stripHtml = (html: string) => {
        if (!html) return '';
        let cleaned = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
        cleaned = cleaned.replace(/[━─═╼╾─━▬─_▬-]{4,}/g, '');
        return cleaned.replace(/\n\n+/g, '\n\n').trim();
    };

    const getPages = (text: string) => {
        const plainText = stripHtml(text);
        const paragraphs = plainText.split('\n\n').filter(p => p.trim().length > 0);
        const pages = [];
        let currentPageText = '';
        
        for (const p of paragraphs) {
            if (currentPageText.length + p.length > 500 && currentPageText.length > 0) {
                pages.push(currentPageText.trim());
                currentPageText = p;
            } else {
                currentPageText += (currentPageText ? '\n\n' : '') + p;
            }
        }
        if (currentPageText) pages.push(currentPageText.trim());
        return pages;
    };

    const getIllustrationUrl = (index: number) => {
        return `${API_BASE_URL}/api/book/${book?.bookId}/illustration/${index}`;
    };

    const handleToggleVisibility = async () => {
        if (!book) return;
        try {
            const nextVisibility = !book.isPublic;
            const response = await bookApi.updateVisibility(book.bookId, nextVisibility);
            setBook(response.data);
            Alert.alert('Success', `Story is now ${nextVisibility ? 'public' : 'private'}.`);
        } catch (error) {
            Alert.alert('Error', 'Failed to update visibility.');
        }
    };

    const handleDeleteBook = () => {
        if (!book) return;
        Alert.alert(
            'Delete Story',
            'Are you sure you want to permanently delete this magical story?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await bookApi.delete(book.bookId);
                            Alert.alert('Deleted', 'Story deleted successfully.', [
                                { text: 'OK', onPress: () => router.back() }
                            ]);
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete story.');
                        }
                    }
                }
            ]
        );
    };

    const isOwner = user && book && (book.authorId === user.userId || user.isAdmin);
    const displayTitle = book ? (book.title || `${book.name}'s Adventure`) : '';

    // Book Reader Mode
    if (showReader && book) {
        const storyPages = getPages(book.content);
        
        // Distribute illustrations
        const hasIllustrations = book.illustrations && book.illustrations.length > 0;
        const totalStoryPages = storyPages.length;
        const illustrationIndices = new Set<number>();
        const indexToIllIndex: Record<number, number> = {};

        if (hasIllustrations && book.illustrations) {
            const illCount = book.illustrations.length;
            const step = Math.max(1, Math.floor(totalStoryPages / (illCount + 1)));
            for (let i = 0; i < illCount; i++) {
                let targetIndex = (i + 1) * step;
                if (targetIndex >= totalStoryPages) {
                    targetIndex = totalStoryPages - 1;
                }
                illustrationIndices.add(targetIndex);
                indexToIllIndex[targetIndex] = i;
            }
        }

        const innerPages: Array<{ type: 'text' | 'illustration'; content?: string; illIndex?: number }> = [];
        for (let i = 0; i < storyPages.length; i++) {
            innerPages.push({ type: 'text', content: storyPages[i] });
            if (illustrationIndices.has(i)) {
                innerPages.push({ type: 'illustration', illIndex: indexToIllIndex[i] });
            }
        }

        const totalPages = innerPages.length + 2; // Cover + Inner Pages + End

        const renderAnimatedPage = (children: React.ReactNode, index: number) => {
            const inputRange = [
                (index - 1) * width,
                index * width,
                (index + 1) * width
            ];

            // 3D rotation around the left edge to simulate page fold
            const rotateY = scrollX.interpolate({
                inputRange,
                outputRange: ['0deg', '0deg', '-180deg'],
                extrapolate: 'clamp'
            });

            // Translate to keep the page in place while it flips leftwards
            const translateX = scrollX.interpolate({
                inputRange,
                outputRange: [0, 0, width],
                extrapolate: 'clamp'
            });

            // Slight scale down as it flips
            const scale = scrollX.interpolate({
                inputRange,
                outputRange: [1, 1, 0.95],
                extrapolate: 'clamp'
            });

            // Fade out as it flips past 90 degrees
            const opacity = scrollX.interpolate({
                inputRange: [
                    (index - 1) * width,
                    index * width,
                    index * width + width / 2,
                    (index + 1) * width
                ],
                outputRange: [1, 1, 0, 0],
                extrapolate: 'clamp'
            });

            return (
                <Animated.View
                    key={index}
                    style={{
                        width,
                        opacity,
                        transform: [
                            { perspective: 1500 },
                            { translateX },
                            { scale },
                            { translateX: -width / 2 },
                            { rotateY },
                            { translateX: width / 2 }
                        ],
                        backgroundColor: '#FAF6EE',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    {children}
                </Animated.View>
            );
        };

        return (
            <SafeAreaView style={styles.readerContainer}>
                {/* Reader Header */}
                <View style={styles.readerHeader}>
                    <TouchableOpacity 
                        onPress={() => {
                            setShowReader(false);
                            setCurrentPage(0);
                        }} 
                        style={styles.readerBackButton}
                    >
                        <Ionicons name="close" size={28} color="#3A2E2B" />
                    </TouchableOpacity>
                    <View style={styles.readerTitleContainer}>
                        <Text style={styles.readerTitle} numberOfLines={1}>{displayTitle}</Text>
                    </View>
                    <TouchableOpacity onPress={handleShare}>
                        <Ionicons name="share-outline" size={24} color="#3A2E2B" />
                    </TouchableOpacity>
                </View>

                {/* Horizontal Pager */}
                <Animated.ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                        { useNativeDriver: true }
                    )}
                    scrollEventThrottle={16}
                    onMomentumScrollEnd={(e) => {
                        const newPage = Math.round(e.nativeEvent.contentOffset.x / width);
                        setCurrentPage(newPage);
                    }}
                    style={styles.readerScroll}
                >
                    {/* Page 0: Cover */}
                    {renderAnimatedPage(
                        <View style={{ width: '100%', padding: 24, justifyContent: 'center', alignItems: 'center' }}>
                            <Image
                                source={{ uri: getCoverUrl() }}
                                style={styles.readerCover}
                                resizeMode="contain"
                                defaultSource={require('../../assets/images/icon.png')}
                            />
                            <Text style={[styles.storyTitle, { marginTop: 24 }]}>{displayTitle}</Text>
                            <Text style={styles.storyAuthor}>by {book.authorName || 'Fairy Pages'}</Text>
                        </View>,
                        0
                    )}

                    {/* Inner Pages (Text & Illustrations) */}
                    {innerPages.map((page, index) => {
                        if (page.type === 'text') {
                            return renderAnimatedPage(
                                <View style={{ width: '100%', paddingHorizontal: 32, justifyContent: 'center' }}>
                                    <Text style={styles.storyTextLarge}>{page.content}</Text>
                                </View>,
                                index + 1
                            );
                        } else {
                            return renderAnimatedPage(
                                <View style={{ width: '100%', padding: 24, justifyContent: 'center', alignItems: 'center' }}>
                                    <Image
                                        source={{ uri: getIllustrationUrl(page.illIndex!) }}
                                        style={styles.readerIllustration}
                                        resizeMode="contain"
                                        defaultSource={require('../../assets/images/icon.png')}
                                    />
                                </View>,
                                index + 1
                            );
                        }
                    })}

                    {/* Last Page: The End */}
                    {renderAnimatedPage(
                        <View style={{ width: '100%', padding: 24, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={styles.endTextLarge}>~ The End ~</Text>
                            <Ionicons name="heart" size={64} color="#FF8E53" style={{ marginTop: 24 }} />
                        </View>,
                        innerPages.length + 1
                    )}
                </Animated.ScrollView>

                {/* Page Indicator */}
                <View style={styles.pageIndicatorContainer}>
                    <Text style={styles.pageIndicatorText}>Page {currentPage + 1} of {totalPages}</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (loading) {
        return (
            <SafeAreaView style={styles.centeredContainer}>
                <ActivityIndicator size="large" color="#FF8E53" />
                <Text style={styles.loadingText}>Loading story...</Text>
            </SafeAreaView>
        );
    }

    if (!book) {
        return (
            <SafeAreaView style={styles.centeredContainer}>
                <Ionicons name="book-outline" size={64} color="#7A6B66" />
                <Text style={styles.emptyText}>Book not found</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#3A2E2B" />
                </TouchableOpacity>
                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
                        <Ionicons name="share-outline" size={24} color="#3A2E2B" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => toggleFavorite(book.bookId)}
                    >
                        <Ionicons
                            name={isFavorite(book.bookId) ? "heart" : "heart-outline"}
                            size={24}
                            color={isFavorite(book.bookId) ? "#FF8E53" : "#3A2E2B"}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.coverSection}>
                    {!book.coverImagePath ? (
                        !book.pdfReady ? (
                            <View style={styles.coverLoadingContainer}>
                                <ActivityIndicator size="large" color="#FF8E53" />
                                <Text style={styles.coverLoadingText}>Creating Cover Art...</Text>
                                <Text style={styles.coverLoadingSubtext}>Magical paintbrushes are at work, please wait a moment! ✨</Text>
                            </View>
                        ) : (
                            <View style={styles.coverFallbackContainer}>
                                <LinearGradient
                                    colors={['#FF8E53', '#FF6B6B']}
                                    style={styles.coverFallbackGradient}
                                >
                                    <Ionicons name="image-outline" size={48} color="#fff" style={styles.fallbackIcon} />
                                    <Text style={styles.fallbackTitle} numberOfLines={2}>{displayTitle}</Text>
                                    <Text style={styles.fallbackAuthor}>by {book.authorName || 'Fairy Pages'}</Text>
                                </LinearGradient>
                            </View>
                        )
                    ) : (
                        <Image
                            source={{ uri: getCoverUrl() }}
                            style={styles.coverImage}
                            resizeMode="contain"
                            defaultSource={require('../../assets/images/icon.png')}
                        />
                    )}
                </View>

                {/* Info */}
                <View style={styles.infoSection}>
                    <Text style={styles.title}>{displayTitle}</Text>
                    <Text style={styles.author}>by {book.authorName || 'Fairy Pages'}</Text>

                    {/* Stats */}
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Ionicons name="eye-outline" size={20} color="#FF8E53" />
                            <Text style={styles.statText}>{book.viewCount}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name="download-outline" size={20} color="#FF8E53" />
                            <Text style={styles.statText}>{book.downloadCount}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name={book.isPublic ? 'globe-outline' : 'lock-closed-outline'} size={20} color="#FF8E53" />
                            <Text style={styles.statText}>{book.isPublic ? 'Public' : 'Private'}</Text>
                        </View>
                    </View>

                    {/* Tags */}
                    <View style={styles.tagsRow}>
                        <View style={styles.tag}>
                            <Ionicons name="color-palette-outline" size={14} color="#FF8E53" />
                            <Text style={[styles.tagText, { color: '#FF8E53' }]}>{book.theme}</Text>
                        </View>
                        <View style={styles.tag}>
                            <Ionicons name="happy-outline" size={14} color="#8ECA94" />
                            <Text style={[styles.tagText, { color: '#8ECA94' }]}>{book.tone}</Text>
                        </View>
                    </View>

                    {/* Owner Actions */}
                    {isOwner && (
                        <View style={styles.ownerActionsContainer}>
                            <Text style={styles.ownerActionsTitle}>Author Controls</Text>
                            <View style={styles.ownerActionsRow}>
                                <TouchableOpacity
                                    style={[styles.ownerButton, styles.visibilityButton]}
                                    onPress={handleToggleVisibility}
                                >
                                    <Ionicons
                                        name={book.isPublic ? 'eye-off-outline' : 'eye-outline'}
                                        size={20}
                                        color="#fff"
                                    />
                                    <Text style={styles.ownerButtonText}>
                                        {book.isPublic ? 'Make Private' : 'Make Public'}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.ownerButton, styles.deleteButton]}
                                    onPress={handleDeleteBook}
                                >
                                    <Ionicons name="trash-outline" size={20} color="#fff" />
                                    <Text style={styles.ownerButtonText}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* Content Preview */}
                    <View style={styles.contentPreview}>
                        <Text style={styles.previewTitle}>Story Preview</Text>
                        <Text style={styles.previewText} numberOfLines={6}>
                            {stripHtml(book.content)}
                        </Text>
                        <TouchableOpacity onPress={() => setShowReader(true)} style={styles.readMoreButton}>
                            <Text style={styles.readMoreText}>Read full story</Text>
                            <Ionicons name="arrow-forward" size={16} color="#FF8E53" />
                        </TouchableOpacity>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionButtons}>
                        <TouchableOpacity onPress={() => setShowReader(true)} style={styles.readButton}>
                            <Ionicons name="book" size={20} color="#fff" />
                            <Text style={styles.readButtonText}>Read Story</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleDownloadPdf} style={styles.downloadButton}>
                            <Ionicons name="download" size={20} color="#FF8E53" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAF6EE',
    },
    centeredContainer: {
        flex: 1,
        backgroundColor: '#FAF6EE',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 12,
        color: '#7A6B66',
        fontSize: 16,
    },
    emptyText: {
        fontSize: 16,
        color: '#7A6B66',
        marginTop: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1.5,
        borderBottomColor: '#EADFC9',
        backgroundColor: '#FFFDF9',
    },
    backButton: {
        padding: 4,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        padding: 4,
    },
    scrollView: {
        flex: 1,
    },
    coverSection: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    coverImage: {
        width: width * 0.48,
        height: width * 0.84,
        borderRadius: 20,
        backgroundColor: '#FFFDF9',
        borderWidth: 2.5,
        borderColor: '#EADFC9',
        shadowColor: '#FF8E53',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
    },
    coverLoadingContainer: {
        width: width * 0.48,
        height: width * 0.84,
        borderRadius: 20,
        backgroundColor: '#FFFDF9',
        borderWidth: 2.5,
        borderColor: '#EADFC9',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        shadowColor: '#FF8E53',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
    },
    coverLoadingText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#FF8E53',
        marginTop: 16,
        textAlign: 'center',
    },
    coverLoadingSubtext: {
        fontSize: 11,
        color: '#7A6B66',
        marginTop: 8,
        textAlign: 'center',
        lineHeight: 16,
    },
    coverFallbackContainer: {
        width: width * 0.48,
        alignItems: 'center',
    },
    coverFallbackGradient: {
        width: width * 0.48,
        height: width * 0.84,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        borderWidth: 2.5,
        borderColor: '#EADFC9',
        shadowColor: '#FF8E53',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
    },
    fallbackIcon: {
        marginBottom: 12,
    },
    fallbackTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 4,
    },
    fallbackAuthor: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
    },
    fallbackWarning: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF8F2',
        borderWidth: 1,
        borderColor: '#FFEAD6',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginTop: 12,
        gap: 6,
    },
    fallbackWarningText: {
        fontSize: 11,
        color: '#D47500',
        flex: 1,
        lineHeight: 14,
    },
    infoSection: {
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#3A2E2B',
        textAlign: 'center',
    },
    author: {
        fontSize: 15,
        color: '#7A6B66',
        textAlign: 'center',
        marginTop: 4,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 28,
        marginTop: 20,
    },
    statItem: {
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        fontSize: 13,
        color: '#7A6B66',
        fontWeight: '500',
    },
    tagsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        marginTop: 20,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#FFFDF9',
        borderWidth: 1.5,
        borderColor: '#EADFC9',
    },
    tagText: {
        fontSize: 13,
        fontWeight: '600',
    },
    ownerActionsContainer: {
        marginTop: 24,
        padding: 16,
        backgroundColor: '#FFFDF9',
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#EADFC9',
    },
    ownerActionsTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FF8E53',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    ownerActionsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    ownerButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 6,
    },
    visibilityButton: {
        backgroundColor: '#8ECA94',
    },
    deleteButton: {
        backgroundColor: '#dc2626',
    },
    ownerButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    contentPreview: {
        marginTop: 24,
        backgroundColor: '#FFFDF9',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1.5,
        borderColor: '#EADFC9',
    },
    previewTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF8E53',
        marginBottom: 12,
    },
    previewText: {
        fontSize: 15,
        color: '#7A6B66',
        lineHeight: 24,
    },
    readMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        gap: 6,
    },
    readMoreText: {
        color: '#FF8E53',
        fontWeight: '600',
        fontSize: 14,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },
    readButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FF8E53',
        borderRadius: 16,
        paddingVertical: 16,
        gap: 8,
        shadowColor: '#FF8E53',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    readButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    downloadButton: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: '#FFFDF9',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: '#EADFC9',
    },
    // Reader styles
    readerContainer: {
        flex: 1,
        backgroundColor: '#FAF6EE',
    },
    readerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFDF9',
        borderBottomWidth: 1.5,
        borderBottomColor: '#EADFC9',
    },
    readerBackButton: {
        padding: 4,
    },
    readerTitleContainer: {
        flex: 1,
        marginHorizontal: 16,
    },
    readerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#3A2E2B',
        textAlign: 'center',
    },
    readerScroll: {
        flex: 1,
    },
    readerContent: {
        padding: 24,
    },
    readerCoverContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    readerCover: {
        width: width * 0.65,
        height: width * 1.1375,
        borderRadius: 20,
        backgroundColor: '#FFFDF9',
        borderWidth: 2,
        borderColor: '#EADFC9',
        shadowColor: '#3A2E2B',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 15,
        elevation: 10,
    },
    readerIllustration: {
        width: width * 0.65,
        height: width * 1.1375,
        borderRadius: 20,
        backgroundColor: '#FFFDF9',
        borderWidth: 2,
        borderColor: '#EADFC9',
        shadowColor: '#3A2E2B',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 15,
        elevation: 10,
    },
    storyTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#3A2E2B',
        textAlign: 'center',
        marginBottom: 8,
    },
    storyAuthor: {
        fontSize: 14,
        color: '#7A6B66',
        textAlign: 'center',
        marginBottom: 24,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#EADFC9',
    },
    storyText: {
        fontSize: 18,
        lineHeight: 32,
        color: '#3A2E2B',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    endDecoration: {
        alignItems: 'center',
        marginTop: 40,
        paddingTop: 24,
        borderTopWidth: 1.5,
        borderTopColor: '#EADFC9',
    },
    endText: {
        fontSize: 18,
        fontStyle: 'italic',
        color: '#FF8E53',
        marginBottom: 12,
    },
    storyTextLarge: {
        fontSize: 16,
        lineHeight: 26,
        color: '#3A2E2B',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        textAlign: 'left',
    },
    endTextLarge: {
        fontSize: 36,
        fontStyle: 'italic',
        color: '#FF8E53',
        fontWeight: 'bold',
    },
    pageIndicatorContainer: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    pageIndicatorText: {
        fontSize: 14,
        color: '#7A6B66',
        fontWeight: '500',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#EADFC9',
    },
});
