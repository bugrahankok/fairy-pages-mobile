import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Share,
    Alert,
    StyleSheet,
    Dimensions,
    Linking,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { bookApi, API_BASE_URL } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface BookDetail {
    bookId: number;
    name: string;
    theme: string;
    tone: string;
    content: string;
    coverImagePath: string;
    pdfReady: boolean;
    pdfPath: string;
    isPublic: boolean;
    authorId: number;
    authorName: string;
    viewCount: number;
    downloadCount: number;
    createdAt: string;
}

const { width, height } = Dimensions.get('window');

export default function BookDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { user } = useAuth();
    const [book, setBook] = useState<BookDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [showReader, setShowReader] = useState(false);

    useEffect(() => {
        loadBook();
    }, [id]);

    const loadBook = async () => {
        try {
            const response = await bookApi.getById(parseInt(id));
            console.log('Book loaded:', response.data);
            setBook(response.data);
        } catch (error) {
            console.error('Failed to load book:', error);
            Alert.alert('Error', 'Failed to load book details');
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async () => {
        if (!book) return;
        try {
            await Share.share({
                message: `Check out this magical story: ${book.name}`,
                title: book.name,
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
            await Linking.openURL(pdfUrl);
        } catch (error) {
            Alert.alert('Error', 'Could not open PDF');
        }
    };

    const getCoverUrl = () => {
        // Always try to get cover from API
        return `${API_BASE_URL}/api/book/${book?.bookId}/cover`;
    };

    const stripHtml = (html: string) => {
        return html?.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\n\n+/g, '\n\n') || '';
    };

    // Book Reader Mode
    if (showReader && book) {
        return (
            <SafeAreaView style={styles.readerContainer}>
                {/* Reader Header */}
                <View style={styles.readerHeader}>
                    <TouchableOpacity onPress={() => setShowReader(false)} style={styles.readerBackButton}>
                        <Ionicons name="close" size={28} color="#1f2937" />
                    </TouchableOpacity>
                    <View style={styles.readerTitleContainer}>
                        <Text style={styles.readerTitle} numberOfLines={1}>{book.name}</Text>
                    </View>
                    <TouchableOpacity onPress={handleShare}>
                        <Ionicons name="share-outline" size={24} color="#1f2937" />
                    </TouchableOpacity>
                </View>

                {/* Story Content */}
                <ScrollView
                    style={styles.readerScroll}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.readerContent}
                >
                    {/* Cover at top of reader */}
                    <View style={styles.readerCoverContainer}>
                        <Image
                            source={{ uri: getCoverUrl() }}
                            style={styles.readerCover}
                            resizeMode="cover"
                            defaultSource={require('../../assets/images/icon.png')}
                        />
                    </View>

                    {/* Story Title */}
                    <Text style={styles.storyTitle}>{book.name}</Text>
                    <Text style={styles.storyAuthor}>by {book.authorName || 'Fairy Pages'}</Text>

                    {/* Divider */}
                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Ionicons name="sparkles" size={20} color="#a855f7" />
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Story Text */}
                    <Text style={styles.storyText}>{stripHtml(book.content)}</Text>

                    {/* End decoration */}
                    <View style={styles.endDecoration}>
                        <Text style={styles.endText}>~ The End ~</Text>
                        <Ionicons name="heart" size={24} color="#f9a8d4" />
                    </View>

                    <View style={{ height: 60 }} />
                </ScrollView>
            </SafeAreaView>
        );
    }

    if (loading) {
        return (
            <SafeAreaView style={styles.centeredContainer}>
                <ActivityIndicator size="large" color="#a855f7" />
                <Text style={styles.loadingText}>Loading story...</Text>
            </SafeAreaView>
        );
    }

    if (!book) {
        return (
            <SafeAreaView style={styles.centeredContainer}>
                <Ionicons name="book-outline" size={64} color="#d1d5db" />
                <Text style={styles.emptyText}>Book not found</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#333" />
                </TouchableOpacity>
                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
                        <Ionicons name="share-outline" size={24} color="#333" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="heart-outline" size={24} color="#333" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Cover */}
                <View style={styles.coverSection}>
                    <Image
                        source={{ uri: getCoverUrl() }}
                        style={styles.coverImage}
                        resizeMode="cover"
                        defaultSource={require('../../assets/images/icon.png')}
                    />
                </View>

                {/* Info */}
                <View style={styles.infoSection}>
                    <Text style={styles.title}>{book.name}</Text>
                    <Text style={styles.author}>by {book.authorName || 'Fairy Pages'}</Text>

                    {/* Stats */}
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Ionicons name="eye-outline" size={20} color="#a855f7" />
                            <Text style={styles.statText}>{book.viewCount}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name="download-outline" size={20} color="#a855f7" />
                            <Text style={styles.statText}>{book.downloadCount}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name={book.isPublic ? 'globe-outline' : 'lock-closed-outline'} size={20} color="#a855f7" />
                            <Text style={styles.statText}>{book.isPublic ? 'Public' : 'Private'}</Text>
                        </View>
                    </View>

                    {/* Tags */}
                    <View style={styles.tagsRow}>
                        <View style={[styles.tag, { backgroundColor: '#faf5ff' }]}>
                            <Ionicons name="color-palette-outline" size={14} color="#a855f7" />
                            <Text style={[styles.tagText, { color: '#a855f7' }]}>{book.theme}</Text>
                        </View>
                        <View style={[styles.tag, { backgroundColor: '#ecfdf5' }]}>
                            <Ionicons name="happy-outline" size={14} color="#10b981" />
                            <Text style={[styles.tagText, { color: '#10b981' }]}>{book.tone}</Text>
                        </View>
                    </View>

                    {/* Content Preview */}
                    <View style={styles.contentPreview}>
                        <Text style={styles.previewTitle}>Story Preview</Text>
                        <Text style={styles.previewText} numberOfLines={6}>
                            {stripHtml(book.content)}
                        </Text>
                        <TouchableOpacity onPress={() => setShowReader(true)} style={styles.readMoreButton}>
                            <Text style={styles.readMoreText}>Read full story</Text>
                            <Ionicons name="arrow-forward" size={16} color="#a855f7" />
                        </TouchableOpacity>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionButtons}>
                        <TouchableOpacity onPress={() => setShowReader(true)} style={styles.readButton}>
                            <Ionicons name="book" size={20} color="#fff" />
                            <Text style={styles.readButtonText}>Read Story</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleDownloadPdf} style={styles.downloadButton}>
                            <Ionicons name="download" size={20} color="#a855f7" />
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
        backgroundColor: '#0f0a1a',
    },
    centeredContainer: {
        flex: 1,
        backgroundColor: '#0f0a1a',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 12,
        color: '#9ca3af',
        fontSize: 16,
    },
    emptyText: {
        fontSize: 16,
        color: '#9ca3af',
        marginTop: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
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
        width: width * 0.55,
        height: width * 0.75,
        borderRadius: 20,
        backgroundColor: '#241a35',
        shadowColor: '#a855f7',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
    },
    infoSection: {
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#f9fafb',
        textAlign: 'center',
    },
    author: {
        fontSize: 15,
        color: '#9ca3af',
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
        color: '#6b7280',
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
    },
    tagText: {
        fontSize: 13,
        fontWeight: '600',
    },
    contentPreview: {
        marginTop: 24,
        backgroundColor: '#1a1025',
        borderRadius: 20,
        padding: 20,
    },
    previewTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#a855f7',
        marginBottom: 12,
    },
    previewText: {
        fontSize: 15,
        color: '#a1a1aa',
        lineHeight: 24,
    },
    readMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        gap: 6,
    },
    readMoreText: {
        color: '#a855f7',
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
        backgroundColor: '#a855f7',
        borderRadius: 16,
        paddingVertical: 16,
        gap: 8,
        shadowColor: '#a855f7',
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
        backgroundColor: '#1a1025',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#241a35',
    },
    // Reader styles
    readerContainer: {
        flex: 1,
        backgroundColor: '#0f0a1a',
    },
    readerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#1a1025',
        borderBottomWidth: 1,
        borderBottomColor: '#241a35',
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
        color: '#f9fafb',
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
        width: width * 0.5,
        height: width * 0.65,
        borderRadius: 16,
        backgroundColor: '#241a35',
    },
    storyTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#f9fafb',
        textAlign: 'center',
        marginBottom: 8,
    },
    storyAuthor: {
        fontSize: 14,
        color: '#9ca3af',
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
        backgroundColor: '#e5e7eb',
    },
    storyText: {
        fontSize: 18,
        lineHeight: 32,
        color: '#e5e7eb',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    endDecoration: {
        alignItems: 'center',
        marginTop: 40,
        paddingTop: 24,
        borderTopWidth: 1,
        borderTopColor: '#241a35',
    },
    endText: {
        fontSize: 18,
        fontStyle: 'italic',
        color: '#a855f7',
        marginBottom: 12,
    },
});
