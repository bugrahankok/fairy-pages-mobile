import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { bookApi } from '../../services/api';
import { bookCache } from '../../services/bookCache';
import BookCoverImage from '../../components/BookCoverImage';
import { themeColors } from '../../constants/Colors';

interface Book {
  bookId: number;
  name: string;
  theme: string;
  tone: string;
  content: string;
  coverImagePath: string;
  viewCount: number;
  downloadCount: number;
  authorName: string;
  createdAt: string;
}

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'all', label: 'All', icon: 'apps' },
  { id: 'animals', label: 'Animals', icon: 'paw' },
  { id: 'space', label: 'Space', icon: 'planet' },
  { id: 'fantasy', label: 'Fantasy', icon: 'sparkles' },
];

export default function DiscoverScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBooks(false); // Load from cache first
  }, []);

  const loadBooks = async (forceRefresh: boolean = false) => {
    setError(null);
    try {
      // Try to load from cache first (unless forcing refresh)
      if (!forceRefresh) {
        const cachedBooks = await bookCache.getDiscoverBooks();
        if (cachedBooks && cachedBooks.length > 0) {
          setBooks(cachedBooks);
          setLoading(false);
          setRefreshing(false);
          return;
        }
      }

      console.log('📚 Fetching books from API...');
      const response = await bookApi.discover();
      const fetchedBooks = response.data || [];
      console.log(`✅ Loaded ${fetchedBooks.length} books`);

      setBooks(fetchedBooks);

      // Cache the books
      await bookCache.saveDiscoverBooks(fetchedBooks);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to connect to server';
      console.error('❌ Failed to load books:', errorMessage);
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



  const featuredBook = books[0];
  const trendingBooks = books.slice(1, 5);
  const picksForYou = books.slice(5, 11);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9333ea" />
        <Text style={styles.loadingText}>Loading stories...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#9333ea" />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Discover</Text>
            <Text style={styles.headerSubtitle}>Explore magical stories</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={24} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconButton, styles.profileIcon]}
              onPress={() => router.push('/(tabs)/profile')}
            >
              <Ionicons name="person" size={22} color="#9333ea" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for an adventure..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity>
            <Ionicons name="options-outline" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setSelectedCategory(cat.id)}
              style={[
                styles.categoryChip,
                selectedCategory === cat.id && styles.categoryChipActive
              ]}
            >
              <Ionicons
                name={cat.icon as any}
                size={16}
                color={selectedCategory === cat.id ? '#fff' : '#666'}
              />
              <Text style={[
                styles.categoryText,
                selectedCategory === cat.id && styles.categoryTextActive
              ]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

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

        {/* Featured Story */}
        {featuredBook && !error && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Week's Pick</Text>
              <Text style={styles.featuredBadge}>FEATURED</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push(`/book/${featuredBook.bookId}`)}
              style={styles.featuredCard}
            >
              <BookCoverImage
                bookId={featuredBook.bookId}
                hasCover={!!featuredBook.coverImagePath}
                width={width - 40}
                height={200}
              />
              <View style={styles.featuredOverlay}>
                <View style={styles.aiBadge}>
                  <Text style={styles.aiBadgeText}>AI STORY</Text>
                </View>
                <Text style={styles.featuredTitle}>{featuredBook.name}</Text>
                <Text style={styles.featuredReaders}>+{featuredBook.viewCount} readers</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Trending */}
        {trendingBooks.length > 0 && !error && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Trending</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.trendingContainer}
            >
              {trendingBooks.map((book) => (
                <TouchableOpacity
                  key={book.bookId}
                  onPress={() => router.push(`/book/${book.bookId}`)}
                  style={styles.trendingCard}
                >
                  <BookCoverImage
                    bookId={book.bookId}
                    hasCover={!!book.coverImagePath}
                    width={140}
                    height={200}
                  />
                  <TouchableOpacity style={styles.heartButton}>
                    <Ionicons name="heart-outline" size={16} color="#9333ea" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Picks For You */}
        {picksForYou.length > 0 && !error && (
          <View style={[styles.section, styles.picksSection]}>
            <Text style={styles.sectionTitle}>Picks For You</Text>
            <View style={styles.picksGrid}>
              {picksForYou.map((book) => (
                <TouchableOpacity
                  key={book.bookId}
                  onPress={() => router.push(`/book/${book.bookId}`)}
                  style={styles.pickCard}
                >
                  <View style={styles.pickImageContainer}>
                    <BookCoverImage
                      bookId={book.bookId}
                      hasCover={!!book.coverImagePath}
                      width={100}
                      height={100}
                    />
                  </View>
                  <Text style={styles.pickTitle} numberOfLines={1}>{book.name}</Text>
                  <Text style={styles.pickTheme}>{book.theme}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Empty State */}
        {books.length === 0 && !error && !loading && (
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No stories yet</Text>
            <Text style={styles.emptyText}>Be the first to create a magical story!</Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push('/(tabs)/create')}
            >
              <Text style={styles.createButtonText}>Create Story</Text>
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
    backgroundColor: '#0f0a1a',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0f0a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#a1a1aa',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#a855f7',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 2,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1a1025',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIcon: {
    backgroundColor: '#241a35',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1025',
    marginHorizontal: 20,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    color: '#f9fafb',
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#1a1025',
    marginRight: 10,
  },
  categoryChipActive: {
    backgroundColor: '#a855f7',
  },
  categoryText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#a1a1aa',
  },
  categoryTextActive: {
    color: '#fff',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f9fafb',
  },
  featuredBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9333ea',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9333ea',
  },
  featuredCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  featuredImage: {
    width: '100%',
    height: 220,
    borderRadius: 20,
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  aiBadge: {
    backgroundColor: '#9333ea',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  aiBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  featuredTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  featuredReaders: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginTop: 4,
  },
  trendingContainer: {
    paddingLeft: 20,
  },
  trendingCard: {
    marginRight: 16,
    position: 'relative',
  },
  trendingImage: {
    width: 140,
    height: 200,
    borderRadius: 16,
  },
  heartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(26, 16, 37, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  picksSection: {
    paddingHorizontal: 20,
  },
  picksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  pickCard: {
    width: (width - 52) / 2,
    marginBottom: 16,
  },
  pickImageContainer: {
    backgroundColor: '#241a35',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  pickImage: {
    width: 100,
    height: 100,
    borderRadius: 16,
  },
  pickTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f9fafb',
  },
  pickTheme: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f9fafb',
    marginTop: 16,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#a855f7',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f9fafb',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
  },
  createButton: {
    marginTop: 20,
    backgroundColor: '#a855f7',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
