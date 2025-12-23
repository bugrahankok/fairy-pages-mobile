import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { bookApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
    STORY_THEMES,
    STORY_AGES,
    STORY_TONES,
    COVER_STYLES,
    LANGUAGES,
    GENDERS,
    USER_TIERS,
    TIER_LEVELS
} from '../../constants/StoryOptions';

export default function CreateScreen() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        bookTitle: '',
        mainTopic: '',
        name: '',
        gender: 'neutral',
        age: '5',
        language: 'en',
        theme: 'Space Explorer',
        tone: 'Playful',
        coverStyle: 'storybook',
        giver: 'Parent',
        isPublic: false,
    });

    const userTier = user?.isPremium ? USER_TIERS.PREMIUM : USER_TIERS.FREE;

    const isLocked = (minTier: string) => {
        return TIER_LEVELS[minTier] > TIER_LEVELS[userTier];
    };

    const handleCreate = async () => {
        if (!isAuthenticated) {
            Alert.alert('Login Required', 'Please login to create a story.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Login', onPress: () => router.push('/(auth)/login') },
            ]);
            return;
        }

        if (!formData.name.trim()) {
            Alert.alert('Missing Info', 'Please enter a character name.');
            return;
        }

        setLoading(true);
        try {
            const response = await bookApi.generate({
                ...formData,
                age: parseInt(formData.age),
                length: 'Short',
            });

            Alert.alert('Success!', 'Your story is being created. Check your library when done!', [
                { text: 'OK', onPress: () => router.push('/(tabs)/library') },
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to create story');
        } finally {
            setLoading(false);
        }
    };

    const OptionChip = ({
        label,
        selected,
        locked,
        onPress
    }: {
        label: string;
        selected: boolean;
        locked?: boolean;
        onPress: () => void;
    }) => (
        <TouchableOpacity
            onPress={() => locked ? router.push('/paywall') : onPress()}
            className={`px-4 py-2 rounded-full mr-2 mb-2 flex-row items-center ${selected ? 'bg-purple-500' : 'bg-gray-100'
                } ${locked ? 'opacity-60' : ''}`}
        >
            {locked && <Ionicons name="lock-closed" size={12} color="#999" className="mr-1" />}
            <Text className={selected ? 'text-white font-medium' : 'text-gray-600'}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1 px-5">
                {/* Header */}
                <View className="flex-row items-center justify-between py-4">
                    <View className="flex-row items-center">
                        <View className="w-8 h-8 rounded-full bg-purple-100 items-center justify-center mr-2">
                            <Ionicons name="sparkles" size={18} color="#a855f7" />
                        </View>
                        <Text className="text-xl font-bold text-purple-600">Create Book</Text>
                    </View>
                    <TouchableOpacity>
                        <Ionicons name="time-outline" size={24} color="#666" />
                    </TouchableOpacity>
                </View>

                {/* Title */}
                <View className="mb-6">
                    <Text className="text-2xl font-bold text-gray-900">Unleash Your</Text>
                    <Text className="text-2xl font-bold text-gray-900">Imagination ✨</Text>
                    <Text className="text-gray-400 mt-2">Create a unique world with AI for your child.</Text>
                </View>

                {/* Book Title */}
                <View className="mb-4">
                    <Text className="text-xs font-bold text-gray-500 uppercase mb-2">BOOK TITLE</Text>
                    <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                        <Ionicons name="pencil" size={18} color="#999" />
                        <TextInput
                            placeholder="Ex: Space Cat Pamuk"
                            placeholderTextColor="#999"
                            value={formData.bookTitle}
                            onChangeText={(text) => setFormData({ ...formData, bookTitle: text })}
                            className="flex-1 ml-3 text-base"
                        />
                    </View>
                </View>

                {/* Story Topic */}
                <View className="mb-4">
                    <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-xs font-bold text-gray-500 uppercase">STORY TOPIC</Text>
                        <View className="bg-purple-100 px-2 py-1 rounded-full">
                            <Text className="text-purple-600 text-xs font-bold">AI Assistant</Text>
                        </View>
                    </View>
                    <View className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                        <TextInput
                            placeholder="What should the story be about? What should characters do?..."
                            placeholderTextColor="#999"
                            multiline
                            numberOfLines={3}
                            value={formData.mainTopic}
                            onChangeText={(text) => setFormData({ ...formData, mainTopic: text })}
                            className="text-base min-h-[80px]"
                            textAlignVertical="top"
                        />
                        <TouchableOpacity className="absolute bottom-3 right-3">
                            <Ionicons name="mic" size={22} color="#a855f7" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Character Name & Gender */}
                <View className="flex-row mb-4">
                    <View className="flex-1 mr-2">
                        <Text className="text-xs font-bold text-gray-500 uppercase mb-2">CHARACTER</Text>
                        <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                            <Ionicons name="person-circle-outline" size={18} color="#999" />
                            <TextInput
                                placeholder="Name"
                                placeholderTextColor="#999"
                                value={formData.name}
                                onChangeText={(text) => setFormData({ ...formData, name: text })}
                                className="flex-1 ml-3 text-base"
                            />
                        </View>
                    </View>
                    <View className="flex-1 ml-2">
                        <Text className="text-xs font-bold text-gray-500 uppercase mb-2">GENDER</Text>
                        <TouchableOpacity className="flex-row items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                            <Text className="text-gray-600">{GENDERS.find(g => g.value === formData.gender)?.label}</Text>
                            <Ionicons name="chevron-down" size={18} color="#999" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Age & Language */}
                <View className="flex-row mb-4">
                    <View className="flex-1 mr-2">
                        <Text className="text-xs font-bold text-gray-500 uppercase mb-2">AGE GROUP</Text>
                        <TouchableOpacity className="flex-row items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                            <Text className="text-gray-600">{STORY_AGES.find(a => a.value === formData.age)?.label}</Text>
                            <Ionicons name="chevron-down" size={18} color="#999" />
                        </TouchableOpacity>
                    </View>
                    <View className="flex-1 ml-2">
                        <Text className="text-xs font-bold text-gray-500 uppercase mb-2">LANGUAGE</Text>
                        <TouchableOpacity className="flex-row items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                            <Text className="text-gray-600">{LANGUAGES.find(l => l.value === formData.language)?.label}</Text>
                            <Ionicons name="chevron-down" size={18} color="#999" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Theme */}
                <View className="mb-4">
                    <Text className="text-xs font-bold text-gray-500 uppercase mb-2">THEME</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {STORY_THEMES.map((theme) => (
                            <OptionChip
                                key={theme.value}
                                label={theme.label}
                                selected={formData.theme === theme.value}
                                locked={isLocked(theme.minTier)}
                                onPress={() => setFormData({ ...formData, theme: theme.value })}
                            />
                        ))}
                    </ScrollView>
                </View>

                {/* Tone */}
                <View className="mb-4">
                    <Text className="text-xs font-bold text-gray-500 uppercase mb-2">TONE</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {STORY_TONES.map((tone) => (
                            <OptionChip
                                key={tone.value}
                                label={tone.label}
                                selected={formData.tone === tone.value}
                                locked={isLocked(tone.minTier)}
                                onPress={() => setFormData({ ...formData, tone: tone.value })}
                            />
                        ))}
                    </ScrollView>
                </View>

                {/* Cover Style */}
                <View className="mb-6">
                    <Text className="text-xs font-bold text-gray-500 uppercase mb-2">VISUAL STYLE</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {COVER_STYLES.map((style) => (
                            <OptionChip
                                key={style.value}
                                label={style.label}
                                selected={formData.coverStyle === style.value}
                                locked={isLocked(style.minTier)}
                                onPress={() => setFormData({ ...formData, coverStyle: style.value })}
                            />
                        ))}
                    </ScrollView>
                </View>

                {/* Create Button */}
                <TouchableOpacity
                    onPress={handleCreate}
                    disabled={loading}
                    className={`bg-purple-500 rounded-2xl py-4 mb-8 flex-row items-center justify-center ${loading ? 'opacity-70' : ''}`}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Ionicons name="book" size={20} color="#fff" />
                            <Text className="text-white font-bold text-lg ml-2">Create Book</Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
