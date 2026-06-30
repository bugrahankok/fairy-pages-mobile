import React, { useState, useCallback, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    StyleSheet,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { bookApi } from '../../services/api';
import { bookCache } from '../../services/bookCache';
import { useAuth } from '../../context/AuthContext';
import BookCoverImage from '../../components/BookCoverImage';
import { Book } from '../../types';

const { width } = Dimensions.get('window');

export default function LibraryScreen() {
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const hasLoadedOnce = useRef(false);

    useFocusEffect(
        useCallback(() => {
            if (isAuthenticated) {
                // Only load from API if we haven't loaded before
                if (!hasLoadedOnce.current) {
                    loadBooks(false);
                    hasLoadedOnce.current = true;
                }
            } else {
                setLoading(false);
            }
        }, [isAuthenticated])
    );

    const loadBooks = async (forceRefresh: boolean = false) => {
        setError(null);
        try {
            // Try to load from cache first (unless forcing refresh)
            if (!forceRefresh) {
                const cachedBooks = await bookCache.getLibraryBooks();
                if (cachedBooks && cachedBooks.length > 0) {
                    console.log('📦 Using cached library books');
                    setBooks(cachedBooks);
                    setLoading(false);
                    setRefreshing(false);
                    return;
                }
            }

            console.log('📚 Fetching user library from API...');
            const response = await bookApi.history();
            const fetchedBooks = response.data || [];
            console.log(`✅ Loaded ${fetchedBooks.length} books from library`);

            setBooks(fetchedBooks);

            // Cache the books
            await bookCache.saveLibraryBooks(fetchedBooks);
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to connect to server';
            console.error('❌ Failed to load library:', errorMessage);
            setError(errorMessage);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadBooks(true); // Force refresh from API
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days === 1) return 'Yesterday';
        return `${days}d ago`;
    };

    if (!isAuthenticated) {
        return (
            <SafeAreaView style={styles.centeredContainer}>
                <Ionicons name="book-outline" size={64} color="#7A6B66" />
                <Text style={styles.emptyTitle}>Your Library Awaits</Text>
                <Text style={styles.emptyText}>Login to see your magical stories</Text>
                <TouchableOpacity
                    onPress={() => router.push('/(auth)/login')}
                    style={styles.loginButton}
                >
                    <Text style={styles.loginButtonText}>Login</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    if (loading) {
        return (
            <SafeAreaView style={styles.centeredContainer}>
                <ActivityIndicator size="large" color="#FF8E53" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF8E53" />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>My Library</Text>
                    <Text style={styles.headerSubtitle}>Your magical creations</Text>
                </View>

                {/* Error State */}
                {error && (
                    <View style={styles.errorContainer}>
                        <Ionicons name="cloud-offline-outline" size={48} color="#ef4444" />
                        <Text style={styles.errorText}>Connection Error</Text>
                        <Text style={styles.errorSubtext}>{error}</Text>
                        <TouchableOpacity style={styles.retryButton} onPress={() => loadBooks(true)}>
                            <Text style={styles.retryText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Books */}
                {!error && (
                    <View style={styles.booksContainer}>
                        {/* Create New Card */}
                        <TouchableOpacity
                            onPress={() => router.push('/(tabs)/create')}
                            style={styles.createCard}
                        >
                            <View style={styles.createIcon}>
                                <Ionicons name="add" size={32} color="#fff" />
                            </View>
                            <Text style={styles.createText}>New Story</Text>
                        </TouchableOpacity>

                        {/* Book Cards */}
                        {books.map((book) => (
                            <TouchableOpacity
                                key={book.bookId}
                                onPress={() => router.push(`/book/${book.bookId}`)}
                                style={styles.bookCard}
                            >
                                <BookCoverImage
                                    bookId={book.bookId}
                                    hasCover={!!book.coverImagePath}
                                    width={(width - 48) / 2}
                                    height={180}
                                />
                                <Text style={styles.bookTitle} numberOfLines={1}>{book.title || `${book.name}'s Adventure`}</Text>
                                <Text style={styles.bookDate}>{formatDate(book.createdAt)}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {books.length === 0 && !error && (
                    <View style={styles.emptyState}>
                        <Ionicons name="book-outline" size={48} color="#d1d5db" />
                        <Text style={styles.emptyStateTitle}>No stories yet</Text>
                        <Text style={styles.emptyStateText}>Create your first magical adventure!</Text>
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAF6EE',
    },
    scrollView: {
        flex: 1,
    },
    centeredContainer: {
        flex: 1,
        backgroundColor: '#FAF6EE',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FF8E53',
    },
    headerSubtitle: {
        fontSize: 15,
        color: '#7A6B66',
        marginTop: 4,
    },
    booksContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
    },
    createCard: {
        width: (width - 48) / 2,
        height: 180,
        backgroundColor: '#FFFDF9',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 8,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#FF8E53',
    },
    createIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#FF8E53',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    createText: {
        color: '#FF8E53',
        fontWeight: '600',
        fontSize: 14,
    },
    bookCard: {
        width: (width - 48) / 2,
        margin: 8,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: '#EADFC9',
        backgroundColor: '#FFFDF9',
        paddingBottom: 8,
    },
    bookImage: {
        width: '100%',
        height: 180,
        borderRadius: 16,
    },
    bookTitle: {
        fontWeight: '600',
        color: '#3A2E2B',
        marginTop: 8,
        paddingHorizontal: 8,
        fontSize: 14,
    },
    bookDate: {
        color: '#7A6B66',
        fontSize: 12,
        marginTop: 2,
        paddingHorizontal: 8,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#3A2E2B',
        marginTop: 16,
        textAlign: 'center',
    },
    emptyText: {
        fontSize: 15,
        color: '#7A6B66',
        marginTop: 8,
        textAlign: 'center',
    },
    loginButton: {
        backgroundColor: '#FF8E53',
        paddingHorizontal: 40,
        paddingVertical: 14,
        borderRadius: 14,
        marginTop: 24,
    },
    loginButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyStateTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#3A2E2B',
        marginTop: 12,
    },
    emptyStateText: {
        fontSize: 14,
        color: '#7A6B66',
        marginTop: 4,
    },
    errorContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        paddingHorizontal: 40,
    },
    errorText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3A2E2B',
        marginTop: 16,
    },
    errorSubtext: {
        fontSize: 14,
        color: '#7A6B66',
        textAlign: 'center',
        marginTop: 8,
    },
    retryButton: {
        marginTop: 20,
        backgroundColor: '#FF8E53',
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 12,
    },
    retryText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});
