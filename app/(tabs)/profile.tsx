import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Switch, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { userApi, bookApi, API_BASE_URL } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface Book {
    bookId: number;
    title: string;
    coverImagePath: string;
}

export default function ProfileScreen() {
    const router = useRouter();
    const { user, isAuthenticated, logout, refreshUser } = useAuth();
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState(true);

    useFocusEffect(
        useCallback(() => {
            if (isAuthenticated) {
                refreshUser();
                loadBooks();
            } else {
                setLoading(false);
            }
        }, [isAuthenticated])
    );

    const loadBooks = async () => {
        try {
            const response = await bookApi.history();
            setBooks((response.data || []).slice(0, 5));
        } catch (error) {
            console.error('Failed to load books:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', style: 'destructive', onPress: logout },
        ]);
    };

    const getCoverUrl = (book: Book) => {
        if (book.coverImagePath) {
            return `${API_BASE_URL}/api/book/${book.bookId}/cover`;
        }
        return 'https://loremflickr.com/400/600/storybook';
    };

    if (!isAuthenticated) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center px-8">
                <Ionicons name="person-circle-outline" size={80} color="#d1d5db" />
                <Text className="text-xl font-bold text-gray-900 mt-4 text-center">Welcome to Fairy Pages</Text>
                <Text className="text-gray-400 text-center mt-2">Login to access your profile and stories</Text>
                <TouchableOpacity
                    onPress={() => router.push('/(auth)/login')}
                    className="bg-purple-500 px-8 py-3 rounded-xl mt-6"
                >
                    <Text className="text-white font-bold">Login</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => router.push('/(auth)/register')}
                    className="mt-4"
                >
                    <Text className="text-purple-500 font-medium">Create Account</Text>
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

    const avatarInitial = user?.name?.charAt(0).toUpperCase() || 'U';

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView className="flex-1">
                {/* Header */}
                <View className="flex-row items-center justify-between px-5 py-4">
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text className="text-lg font-bold text-gray-900">My Profile</Text>
                    <TouchableOpacity>
                        <Text className="text-purple-500 font-medium">Edit</Text>
                    </TouchableOpacity>
                </View>

                {/* Avatar Section */}
                <View className="items-center py-6">
                    <View className="relative">
                        <View className="w-24 h-24 rounded-full bg-purple-100 items-center justify-center">
                            <Text className="text-3xl font-bold text-purple-600">{avatarInitial}</Text>
                        </View>
                        <TouchableOpacity className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-purple-500 items-center justify-center border-2 border-white">
                            <Ionicons name="pencil" size={14} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    <Text className="text-xl font-bold text-gray-900 mt-3">{user?.name}</Text>
                    <Text className="text-gray-400">Storyteller</Text>
                    {user?.isPremium && (
                        <View className="flex-row items-center mt-2 bg-yellow-100 px-3 py-1 rounded-full">
                            <Ionicons name="star" size={14} color="#f59e0b" />
                            <Text className="text-yellow-700 font-bold text-xs ml-1">Premium Member</Text>
                        </View>
                    )}
                </View>

                {/* Stats */}
                <View className="flex-row justify-around px-5 mb-6">
                    <View className="items-center bg-white rounded-xl px-6 py-3 shadow-sm">
                        <Text className="text-2xl font-bold text-gray-900">{books.length}</Text>
                        <Text className="text-gray-400 text-xs uppercase">Books</Text>
                    </View>
                    <View className="items-center bg-white rounded-xl px-6 py-3 shadow-sm">
                        <View className="flex-row items-center">
                            <Text className="text-2xl font-bold text-purple-500">5</Text>
                            <Ionicons name="sparkles" size={16} color="#a855f7" className="ml-1" />
                        </View>
                        <Text className="text-gray-400 text-xs uppercase">Credits</Text>
                    </View>
                    <View className="items-center bg-white rounded-xl px-6 py-3 shadow-sm">
                        <Text className="text-2xl font-bold text-gray-900">48</Text>
                        <Text className="text-gray-400 text-xs uppercase">Likes</Text>
                    </View>
                </View>

                {/* Created Stories */}
                {books.length > 0 && (
                    <View className="mb-6">
                        <View className="flex-row justify-between items-center px-5 mb-3">
                            <Text className="text-base font-bold text-gray-900">Created Stories</Text>
                            <TouchableOpacity onPress={() => router.push('/(tabs)/library')}>
                                <Text className="text-purple-500 font-medium">See All</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-5">
                            {/* Create New */}
                            <TouchableOpacity
                                onPress={() => router.push('/(tabs)/create')}
                                className="w-24 h-32 bg-pink-50 rounded-xl items-center justify-center mr-3 border-2 border-dashed border-pink-200"
                            >
                                <Ionicons name="add-circle" size={32} color="#a855f7" />
                                <Text className="text-purple-600 text-xs mt-1">New Story</Text>
                            </TouchableOpacity>

                            {books.map((book) => (
                                <TouchableOpacity
                                    key={book.bookId}
                                    onPress={() => router.push(`/book/${book.bookId}`)}
                                    className="mr-3"
                                >
                                    <Image
                                        source={{ uri: getCoverUrl(book) }}
                                        className="w-24 h-32 rounded-xl"
                                        resizeMode="cover"
                                    />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Settings */}
                <View className="bg-white mx-5 rounded-xl overflow-hidden mb-6">
                    <TouchableOpacity className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100">
                        <View className="flex-row items-center">
                            <Ionicons name="person-outline" size={20} color="#666" />
                            <Text className="ml-3 text-gray-900">Account Details</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#999" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push('/paywall')}
                        className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100"
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="card-outline" size={20} color="#666" />
                            <Text className="ml-3 text-gray-900">Subscription</Text>
                        </View>
                        <Text className="text-purple-500 font-medium">{user?.isPremium ? 'Premium' : 'Free'}</Text>
                    </TouchableOpacity>

                    <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100">
                        <View className="flex-row items-center">
                            <Ionicons name="notifications-outline" size={20} color="#666" />
                            <Text className="ml-3 text-gray-900">Notifications</Text>
                        </View>
                        <Switch
                            value={notifications}
                            onValueChange={setNotifications}
                            trackColor={{ true: '#a855f7' }}
                        />
                    </View>

                    <TouchableOpacity className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100">
                        <View className="flex-row items-center">
                            <Ionicons name="globe-outline" size={20} color="#666" />
                            <Text className="ml-3 text-gray-900">App Language</Text>
                        </View>
                        <Text className="text-gray-400">English</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-row items-center justify-between px-4 py-4">
                        <View className="flex-row items-center">
                            <Ionicons name="help-circle-outline" size={20} color="#666" />
                            <Text className="ml-3 text-gray-900">Help & Support</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#999" />
                    </TouchableOpacity>
                </View>

                {/* Logout */}
                <TouchableOpacity
                    onPress={handleLogout}
                    className="flex-row items-center justify-center mx-5 mb-8 py-4 bg-white rounded-xl"
                >
                    <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                    <Text className="ml-2 text-red-500 font-medium">Logout</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
