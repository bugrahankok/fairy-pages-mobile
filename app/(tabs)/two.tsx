import React, { useState, useCallback } from 'react';
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
import { useFavorites } from '../../context/FavoritesContext';
import BookCoverImage from '../../components/BookCoverImage';
import { Book } from '../../types';

const { width } = Dimensions.get('window');

export default function FavoritesScreen() {
    const router = useRouter();
    const { favorites, toggleFavorite } = useFavorites();
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadFavoriteBooks = useCallback(async () => {
        if (favorites.length === 0) {
            setBooks([]);
            setLoading(false);
            setRefreshing(false);
            return;
        }

        try {
            // Step 1: Collect discover and library caches to find cached books
            const cachedDiscover = await bookCache.getDiscoverBooks() || [];
            const cachedLibrary = await bookCache.getLibraryBooks() || [];
            const allCached = [...cachedDiscover, ...cachedLibrary];

            // Step 2: Try to resolve cached items for each favorite ID
            const resolvedBooks: Book[] = [];
            const idsToFetch: number[] = [];

            favorites.forEach(id => {
                const found = allCached.find(b => b.bookId === id);
                if (found) {
                    resolvedBooks.push(found);
                } else {
                    idsToFetch.push(id);
                }
            });

            // Step 3: Fetch missing books from the backend parallelly
            if (idsToFetch.length > 0) {
                console.log(`🔍 Favorites Cache Miss: Fetching ${idsToFetch.length} books from API`);
                const apiResults = await Promise.allSettled(
                    idsToFetch.map(id => bookApi.getById(id))
                );

                apiResults.forEach(result => {
                    if (result.status === 'fulfilled' && result.value.data) {
                        resolvedBooks.push(result.value.data);
                    }
                });
            }

            // Step 4: Sort resolved books according to order of favorites array
            const sortedBooks = favorites
                .map(id => resolvedBooks.find(b => b.bookId === id))
                .filter((b): b is Book => !!b);

            setBooks(sortedBooks);
        } catch (error) {
            console.error('Failed to load favorite books:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [favorites]);

    useFocusEffect(
        useCallback(() => {
            loadFavoriteBooks();
        }, [loadFavoriteBooks])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadFavoriteBooks();
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.centeredContainer}>
                <ActivityIndicator size="large" color="#a855f7" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a855f7" />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Favorites</Text>
                    <Text style={styles.headerSubtitle}>Stories you loved most</Text>
                </View>

                {/* Grid list of books */}
                {books.length > 0 ? (
                    <View style={styles.booksContainer}>
                        {books.map((book) => (
                            <View key={book.bookId} style={styles.bookCardWrapper}>
                                <TouchableOpacity
                                    onPress={() => router.push(`/book/${book.bookId}`)}
                                    style={styles.bookCard}
                                >
                                    <BookCoverImage
                                        bookId={book.bookId}
                                        hasCover={!!book.coverImagePath}
                                        width={(width - 48) / 2}
                                        height={180}
                                    />
                                    <Text style={styles.bookTitle} numberOfLines={1}>
                                        {book.title || `${book.name}'s Adventure`}
                                    </Text>
                                    <Text style={styles.bookTheme}>{book.theme}</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    style={styles.heartButton}
                                    onPress={() => toggleFavorite(book.bookId)}
                                >
                                    <Ionicons name="heart" size={16} color="#FF8E53" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="heart-outline" size={64} color="#7A6B66" />
                        <Text style={styles.emptyStateTitle}>No favorites yet</Text>
                        <Text style={styles.emptyStateText}>Explore stories in discover and click heart to save them!</Text>
                        <TouchableOpacity
                            onPress={() => router.push('/(tabs)')}
                            style={styles.discoverButton}
                        >
                            <Text style={styles.discoverButtonText}>Discover Stories</Text>
                        </TouchableOpacity>
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
    bookCardWrapper: {
        width: (width - 48) / 2,
        margin: 8,
        position: 'relative',
        backgroundColor: '#FFFDF9',
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: '#EADFC9',
        paddingBottom: 8,
    },
    bookCard: {
        width: '100%',
    },
    bookTitle: {
        fontWeight: '600',
        color: '#3A2E2B',
        marginTop: 8,
        fontSize: 14,
        paddingHorizontal: 8,
    },
    bookTheme: {
        color: '#7A6B66',
        fontSize: 12,
        marginTop: 2,
        paddingHorizontal: 8,
    },
    heartButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#3A2E2B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        paddingHorizontal: 40,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#3A2E2B',
        marginTop: 16,
        textAlign: 'center',
    },
    emptyStateText: {
        fontSize: 15,
        color: '#7A6B66',
        marginTop: 8,
        textAlign: 'center',
        lineHeight: 22,
    },
    discoverButton: {
        backgroundColor: '#FF8E53',
        paddingHorizontal: 40,
        paddingVertical: 14,
        borderRadius: 14,
        marginTop: 24,
    },
    discoverButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
