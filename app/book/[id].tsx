import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { bookApi, API_BASE_URL } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface BookDetail {
    bookId: number;
    title: string;
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

export default function BookDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { user } = useAuth();
    const [book, setBook] = useState<BookDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBook();
    }, [id]);

    const loadBook = async () => {
        try {
            const response = await bookApi.getById(parseInt(id));
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
                message: `Check out this magical story: ${book.title}`,
                title: book.title,
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
        Alert.alert('Download', 'PDF download will open in browser');
    };

    const isOwner = user?.userId === book?.authorId;

    const getCoverUrl = () => {
        if (book?.coverImagePath) {
            return `${API_BASE_URL}/api/book/${book.bookId}/cover`;
        }
        return 'https://loremflickr.com/400/600/storybook,illustration';
    };

    const stripHtml = (html: string) => {
        return html?.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ') || '';
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#a855f7" />
            </SafeAreaView>
        );
    }

    if (!book) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <Ionicons name="book-outline" size={64} color="#d1d5db" />
                <Text className="text-gray-400 mt-4">Book not found</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 py-3 border-b border-gray-100">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={28} color="#333" />
                </TouchableOpacity>
                <View className="flex-row gap-4">
                    <TouchableOpacity onPress={handleShare}>
                        <Ionicons name="share-outline" size={24} color="#333" />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Ionicons name="heart-outline" size={24} color="#333" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1">
                {/* Cover */}
                <View className="items-center py-6">
                    <Image
                        source={{ uri: getCoverUrl() }}
                        className="w-48 h-64 rounded-2xl shadow-lg"
                        resizeMode="cover"
                    />
                </View>

                {/* Info */}
                <View className="px-5">
                    <Text className="text-2xl font-bold text-gray-900 text-center">{book.title}</Text>
                    <Text className="text-gray-400 text-center mt-1">by {book.authorName || 'Anonymous'}</Text>

                    {/* Stats */}
                    <View className="flex-row justify-center gap-6 mt-4">
                        <View className="items-center">
                            <Ionicons name="eye-outline" size={20} color="#a855f7" />
                            <Text className="text-gray-500 text-xs mt-1">{book.viewCount} views</Text>
                        </View>
                        <View className="items-center">
                            <Ionicons name="download-outline" size={20} color="#a855f7" />
                            <Text className="text-gray-500 text-xs mt-1">{book.downloadCount} downloads</Text>
                        </View>
                        <View className="items-center">
                            <Ionicons name={book.isPublic ? 'globe-outline' : 'lock-closed-outline'} size={20} color="#a855f7" />
                            <Text className="text-gray-500 text-xs mt-1">{book.isPublic ? 'Public' : 'Private'}</Text>
                        </View>
                    </View>

                    {/* Tags */}
                    <View className="flex-row justify-center gap-2 mt-4">
                        <View className="bg-purple-100 px-3 py-1 rounded-full">
                            <Text className="text-purple-600 text-xs font-medium">{book.theme}</Text>
                        </View>
                        <View className="bg-cyan-100 px-3 py-1 rounded-full">
                            <Text className="text-cyan-600 text-xs font-medium">{book.tone}</Text>
                        </View>
                    </View>

                    {/* Content Preview */}
                    <View className="mt-6 bg-gray-50 rounded-xl p-4">
                        <Text className="text-lg font-bold text-gray-900 mb-2">Story Preview</Text>
                        <Text className="text-gray-600 leading-6" numberOfLines={10}>
                            {stripHtml(book.content)}
                        </Text>
                    </View>

                    {/* Actions */}
                    <View className="flex-row gap-3 mt-6 mb-8">
                        <TouchableOpacity
                            onPress={handleDownloadPdf}
                            className="flex-1 bg-purple-500 rounded-xl py-4 flex-row items-center justify-center"
                        >
                            <Ionicons name="download" size={20} color="#fff" />
                            <Text className="text-white font-bold ml-2">Download PDF</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
