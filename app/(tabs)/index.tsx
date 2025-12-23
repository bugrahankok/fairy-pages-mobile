import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { bookApi, API_BASE_URL } from '../../services/api';

interface Book {
  bookId: number;
  title: string;
  theme: string;
  coverImagePath: string;
  viewCount: number;
  authorName: string;
}

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

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const response = await bookApi.discover();
      setBooks(response.data || []);
    } catch (error) {
      console.error('Failed to load books:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadBooks();
  };

  const getCoverUrl = (book: Book) => {
    if (book.coverImagePath) {
      return `${API_BASE_URL}/api/book/${book.bookId}/cover`;
    }
    return 'https://loremflickr.com/400/600/storybook,illustration';
  };

  const featuredBook = books[0];
  const trendingBooks = books.slice(1, 5);
  const picksForYou = books.slice(5, 11);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#a855f7" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a855f7" />}
      >
        {/* Header */}
        <View className="px-5 pt-2 pb-4 flex-row justify-between items-center">
          <View>
            <Text className="text-3xl font-bold text-purple-600">Discover</Text>
            <Text className="text-gray-400 text-sm">Explore magical stories</Text>
          </View>
          <View className="flex-row gap-3">
            <TouchableOpacity className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
              <Ionicons name="notifications-outline" size={22} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/profile')}
              className="w-10 h-10 rounded-full bg-purple-100 items-center justify-center"
            >
              <Ionicons name="person" size={22} color="#a855f7" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}
        <View className="px-5 mb-4">
          <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
            <Ionicons name="search" size={20} color="#999" />
            <TextInput
              placeholder="Search for an adventure..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 ml-3 text-base"
            />
            <TouchableOpacity>
              <Ionicons name="options-outline" size={20} color="#999" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-5 mb-6">
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setSelectedCategory(cat.id)}
              className={`mr-3 px-4 py-2 rounded-full flex-row items-center ${selectedCategory === cat.id ? 'bg-purple-500' : 'bg-gray-100'
                }`}
            >
              <Ionicons
                name={cat.icon as any}
                size={16}
                color={selectedCategory === cat.id ? '#fff' : '#666'}
              />
              <Text
                className={`ml-2 font-medium ${selectedCategory === cat.id ? 'text-white' : 'text-gray-600'
                  }`}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured Story */}
        {featuredBook && (
          <View className="px-5 mb-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-lg font-bold text-gray-900">Week's Pick</Text>
              <Text className="text-purple-500 font-medium">FEATURED</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push(`/book/${featuredBook.bookId}`)}
              className="bg-gradient-to-br rounded-2xl overflow-hidden"
            >
              <Image
                source={{ uri: getCoverUrl(featuredBook) }}
                className="w-full h-48 rounded-2xl"
                resizeMode="cover"
              />
              <View className="absolute bottom-0 left-0 right-0 p-4 bg-black/40">
                <View className="flex-row items-center mb-1">
                  <View className="bg-purple-500 px-2 py-0.5 rounded-full mr-2">
                    <Text className="text-white text-xs font-bold">AI STORY</Text>
                  </View>
                </View>
                <Text className="text-white text-xl font-bold">{featuredBook.title}</Text>
                <Text className="text-white/70 text-sm">+{featuredBook.viewCount} readers</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Trending */}
        {trendingBooks.length > 0 && (
          <View className="mb-6">
            <View className="flex-row justify-between items-center px-5 mb-3">
              <Text className="text-lg font-bold text-gray-900">Trending</Text>
              <TouchableOpacity>
                <Text className="text-purple-500 font-medium">See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-5">
              {trendingBooks.map((book) => (
                <TouchableOpacity
                  key={book.bookId}
                  onPress={() => router.push(`/book/${book.bookId}`)}
                  className="mr-4"
                >
                  <Image
                    source={{ uri: getCoverUrl(book) }}
                    className="w-28 h-40 rounded-xl"
                    resizeMode="cover"
                  />
                  <TouchableOpacity className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 items-center justify-center">
                    <Ionicons name="heart-outline" size={16} color="#a855f7" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Picks For You */}
        {picksForYou.length > 0 && (
          <View className="px-5 pb-8">
            <Text className="text-lg font-bold text-gray-900 mb-3">Picks For You</Text>
            <View className="flex-row flex-wrap justify-between">
              {picksForYou.map((book) => (
                <TouchableOpacity
                  key={book.bookId}
                  onPress={() => router.push(`/book/${book.bookId}`)}
                  className="w-[48%] mb-4"
                >
                  <View className="bg-pink-50 rounded-xl p-3 items-center mb-2">
                    <Image
                      source={{ uri: getCoverUrl(book) }}
                      className="w-20 h-20 rounded-lg"
                      resizeMode="cover"
                    />
                  </View>
                  <Text className="font-semibold text-gray-900 text-sm" numberOfLines={1}>
                    {book.title}
                  </Text>
                  <Text className="text-gray-400 text-xs">{book.theme}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
