import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { bookApi, API_BASE_URL } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface Book {
    bookId: number;
    title: string;
    theme: string;
    coverImagePath: string;
    createdAt: string;
    isPublic: boolean;
}

export default function LibraryScreen() {
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        useCallback(() => {
            if (isAuthenticated) {
                loadBooks();
            } else {
                setLoading(false);
            }
        }, [isAuthenticated])
    );

    const loadBooks = async () => {
        try {
            const response = await bookApi.history();
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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 60) return `${minutes} min ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days === 1) return 'Yesterday';
        return `${days} days ago`;
    };

    if (!isAuthenticated) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center px-8">
                <Ionicons name="book-outline" size={64} color="#d1d5db" />
                <Text className="text-xl font-bold text-gray-900 mt-4 text-center">Your Library Awaits</Text>
                <Text className="text-gray-400 text-center mt-2">Login to see your magical stories</Text>
                <TouchableOpacity
                    onPress={() => router.push('/(auth)/login')}
                    className="bg-purple-500 px-8 py-3 rounded-xl mt-6"
                >
                    <Text className="text-white font-bold">Login</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

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
                <View className="px-5 py-4">
                    <Text className="text-2xl font-bold text-gray-900">My Library</Text>
                    <Text className="text-gray-400">Your magical creations</Text>
                </View>

                {/* Books Grid */}
                <View className="px-5 pb-8">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
                        {/* Create New Card */}
                        <TouchableOpacity
                            onPress={() => router.push('/(tabs)/create')}
                            className="w-32 h-44 bg-pink-50 rounded-xl items-center justify-center mr-4 border-2 border-dashed border-pink-200"
                        >
                            <View className="w-12 h-12 rounded-full bg-purple-500 items-center justify-center mb-2">
                                <Ionicons name="add" size={28} color="#fff" />
                            </View>
                            <Text className="text-purple-600 font-medium text-sm">New Story</Text>
                        </TouchableOpacity>

                        {/* Book Cards */}
                        {books.map((book) => (
                            <TouchableOpacity
                                key={book.bookId}
                                onPress={() => router.push(`/book/${book.bookId}`)}
                                className="mr-4"
                            >
                                <Image
                                    source={{ uri: getCoverUrl(book) }}
                                    className="w-32 h-44 rounded-xl"
                                    resizeMode="cover"
                                />
                                <Text className="font-medium text-gray-900 mt-2 w-32" numberOfLines={1}>
                                    {book.title}
                                </Text>
                                <Text className="text-gray-400 text-xs">{formatDate(book.createdAt)}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {books.length === 0 && (
                        <View className="items-center py-12">
                            <Ionicons name="book-outline" size={48} color="#d1d5db" />
                            <Text className="text-gray-400 mt-4 text-center">No stories yet</Text>
                            <Text className="text-gray-300 text-sm text-center">Create your first magical adventure!</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
