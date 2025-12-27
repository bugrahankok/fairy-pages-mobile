import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Modal,
    FlatList,
    Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { bookApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import GeneratingBookModal from '../../components/GeneratingBookModal';
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

interface PickerModalProps {
    visible: boolean;
    title: string;
    options: { value: string; label: string; minTier?: string }[];
    selectedValue: string;
    onSelect: (value: string) => void;
    onClose: () => void;
    userTier: string;
}

const PickerModal = ({ visible, title, options, selectedValue, onSelect, onClose, userTier }: PickerModalProps) => {
    const isLocked = (minTier?: string) => {
        if (!minTier) return false;
        return TIER_LEVELS[minTier] > TIER_LEVELS[userTier];
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={modalStyles.overlay}>
                <View style={modalStyles.container}>
                    <View style={modalStyles.header}>
                        <Text style={modalStyles.title}>{title}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={options}
                        keyExtractor={(item) => item.value}
                        renderItem={({ item }) => {
                            const locked = isLocked(item.minTier);
                            const selected = item.value === selectedValue;
                            return (
                                <TouchableOpacity
                                    style={[modalStyles.option, selected && modalStyles.optionSelected]}
                                    onPress={() => {
                                        if (!locked) {
                                            onSelect(item.value);
                                            onClose();
                                        }
                                    }}
                                >
                                    <Text style={[modalStyles.optionText, selected && modalStyles.optionTextSelected]}>
                                        {item.label}
                                    </Text>
                                    {locked && <Ionicons name="lock-closed" size={16} color="#9ca3af" />}
                                    {selected && !locked && <Ionicons name="checkmark-circle" size={20} color="#a855f7" />}
                                </TouchableOpacity>
                            );
                        }}
                    />
                </View>
            </View>
        </Modal>
    );
};

const modalStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: '#1a1025',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '70%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#241a35',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#f9fafb',
    },
    option: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#241a35',
    },
    optionSelected: {
        backgroundColor: '#241a35',
    },
    optionText: {
        fontSize: 16,
        color: '#a1a1aa',
    },
    optionTextSelected: {
        color: '#a855f7',
        fontWeight: '600',
    },
});

export default function CreateScreen() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();

    // Generation states
    const [generating, setGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState<'story' | 'cover' | 'pdf' | 'complete'>('story');
    const pollingRef = useRef<NodeJS.Timeout | null>(null);
    const createdBookIdRef = useRef<number | null>(null);

    // Modal states
    const [genderModalVisible, setGenderModalVisible] = useState(false);
    const [ageModalVisible, setAgeModalVisible] = useState(false);
    const [languageModalVisible, setLanguageModalVisible] = useState(false);
    const [themeModalVisible, setThemeModalVisible] = useState(false);
    const [toneModalVisible, setToneModalVisible] = useState(false);
    const [styleModalVisible, setStyleModalVisible] = useState(false);

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

    // Cleanup polling on unmount
    useEffect(() => {
        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
            }
        };
    }, []);

    const pollBookStatus = async (bookId: number) => {
        try {
            const response = await bookApi.checkStatus(bookId);
            const { pdfReady, coverReady } = response.data;

            if (coverReady && !pdfReady) {
                setCurrentStep('pdf');
                setProgress(70);
            } else if (pdfReady) {
                setCurrentStep('complete');
                setProgress(100);

                // Stop polling and close modal
                if (pollingRef.current) {
                    clearInterval(pollingRef.current);
                    pollingRef.current = null;
                }

                setTimeout(() => {
                    setGenerating(false);
                    router.push(`/book/${bookId}`);
                }, 1500);
            }
        } catch (error) {
            console.error('Failed to poll status:', error);
        }
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

        // Start generation
        setGenerating(true);
        setProgress(10);
        setCurrentStep('story');

        try {
            // Simulate story progress
            setProgress(20);

            console.log('Creating book...');
            const response = await bookApi.generate({
                ...formData,
                age: parseInt(formData.age),
                length: 'Short',
            });

            const bookId = response.data.bookId;
            console.log('Book created with ID:', bookId);
            createdBookIdRef.current = bookId;

            // Story created, now generating cover
            setProgress(40);
            setCurrentStep('cover');

            // Start polling for status
            let pollCount = 0;
            const maxPolls = 60; // 3 minutes (60 * 3 seconds)

            pollingRef.current = setInterval(async () => {
                pollCount++;
                console.log(`Polling status... (${pollCount}/${maxPolls})`);

                if (pollCount >= maxPolls) {
                    // Timeout - stop polling and show result anyway
                    console.log('Timeout reached, showing book anyway');
                    if (pollingRef.current) {
                        clearInterval(pollingRef.current);
                        pollingRef.current = null;
                    }
                    setGenerating(false);
                    Alert.alert(
                        'Taking Longer Than Expected',
                        'Your book may still be generating. Check your library!',
                        [{ text: 'OK', onPress: () => router.push('/(tabs)/library') }]
                    );
                    return;
                }

                await pollBookStatus(bookId);
            }, 3000);

            // Simulate gradual progress
            setTimeout(() => setProgress(50), 2000);
            setTimeout(() => setProgress(60), 5000);

        } catch (error: any) {
            console.error('Book creation error:', error);
            setGenerating(false);
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
            }
            Alert.alert('Error', error.response?.data?.error || 'Failed to create story');
        }
    };

    const getLabel = (options: any[], value: string) => {
        return options.find(o => o.value === value)?.label || value;
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerIcon}>
                            <Ionicons name="sparkles" size={24} color="#a855f7" />
                        </View>
                        <Text style={styles.headerTitle}>Create Story</Text>
                    </View>

                    {/* Title Section */}
                    <View style={styles.titleSection}>
                        <Text style={styles.mainTitle}>Unleash Your</Text>
                        <Text style={styles.mainTitleAccent}>Imagination ✨</Text>
                        <Text style={styles.subtitle}>Create a unique world with AI for your child</Text>
                    </View>

                    {/* Book Title */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>BOOK TITLE</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="book" size={18} color="#a855f7" />
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: Space Cat Pamuk"
                                placeholderTextColor="#9ca3af"
                                value={formData.bookTitle}
                                onChangeText={(text) => setFormData({ ...formData, bookTitle: text })}
                            />
                        </View>
                    </View>

                    {/* Story Topic */}
                    <View style={styles.inputGroup}>
                        <View style={styles.labelRow}>
                            <Text style={styles.label}>STORY TOPIC</Text>
                            <View style={styles.aiBadge}>
                                <Ionicons name="sparkles" size={12} color="#a855f7" />
                                <Text style={styles.aiBadgeText}>AI Assistant</Text>
                            </View>
                        </View>
                        <View style={[styles.inputContainer, styles.textAreaContainer]}>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="What should the story be about?..."
                                placeholderTextColor="#9ca3af"
                                multiline
                                numberOfLines={3}
                                value={formData.mainTopic}
                                onChangeText={(text) => setFormData({ ...formData, mainTopic: text })}
                                textAlignVertical="top"
                            />
                        </View>
                    </View>

                    {/* Character Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>CHILD'S NAME</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="person" size={18} color="#a855f7" />
                            <TextInput
                                style={styles.input}
                                placeholder="Hero's name"
                                placeholderTextColor="#9ca3af"
                                value={formData.name}
                                onChangeText={(text) => setFormData({ ...formData, name: text })}
                            />
                        </View>
                    </View>

                    {/* Row: Gender & Age */}
                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                            <Text style={styles.label}>GENDER</Text>
                            <TouchableOpacity
                                style={styles.selectContainer}
                                onPress={() => setGenderModalVisible(true)}
                            >
                                <Text style={styles.selectText}>{getLabel(GENDERS, formData.gender)}</Text>
                                <Ionicons name="chevron-down" size={18} color="#a855f7" />
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                            <Text style={styles.label}>AGE</Text>
                            <TouchableOpacity
                                style={styles.selectContainer}
                                onPress={() => setAgeModalVisible(true)}
                            >
                                <Text style={styles.selectText}>{getLabel(STORY_AGES, formData.age)}</Text>
                                <Ionicons name="chevron-down" size={18} color="#a855f7" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Language */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>LANGUAGE</Text>
                        <TouchableOpacity
                            style={styles.selectContainer}
                            onPress={() => setLanguageModalVisible(true)}
                        >
                            <View style={styles.selectContent}>
                                <Ionicons name="globe" size={18} color="#a855f7" />
                                <Text style={[styles.selectText, { marginLeft: 10 }]}>{getLabel(LANGUAGES, formData.language)}</Text>
                            </View>
                            <Ionicons name="chevron-down" size={18} color="#a855f7" />
                        </TouchableOpacity>
                    </View>

                    {/* Theme */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>THEME</Text>
                        <TouchableOpacity
                            style={styles.selectContainer}
                            onPress={() => setThemeModalVisible(true)}
                        >
                            <View style={styles.selectContent}>
                                <Ionicons name="color-palette" size={18} color="#a855f7" />
                                <Text style={[styles.selectText, { marginLeft: 10 }]}>{formData.theme}</Text>
                            </View>
                            <Ionicons name="chevron-down" size={18} color="#a855f7" />
                        </TouchableOpacity>
                    </View>

                    {/* Tone */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>TONE</Text>
                        <TouchableOpacity
                            style={styles.selectContainer}
                            onPress={() => setToneModalVisible(true)}
                        >
                            <View style={styles.selectContent}>
                                <Ionicons name="happy" size={18} color="#a855f7" />
                                <Text style={[styles.selectText, { marginLeft: 10 }]}>{formData.tone}</Text>
                            </View>
                            <Ionicons name="chevron-down" size={18} color="#a855f7" />
                        </TouchableOpacity>
                    </View>

                    {/* Cover Style */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>VISUAL STYLE</Text>
                        <TouchableOpacity
                            style={styles.selectContainer}
                            onPress={() => setStyleModalVisible(true)}
                        >
                            <View style={styles.selectContent}>
                                <Ionicons name="image" size={18} color="#a855f7" />
                                <Text style={[styles.selectText, { marginLeft: 10 }]}>{getLabel(COVER_STYLES, formData.coverStyle)}</Text>
                            </View>
                            <Ionicons name="chevron-down" size={18} color="#a855f7" />
                        </TouchableOpacity>
                    </View>

                    {/* Public/Private Toggle */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>VISIBILITY</Text>
                        <View style={styles.toggleContainer}>
                            <View style={styles.toggleInfo}>
                                <Ionicons
                                    name={formData.isPublic ? 'globe' : 'lock-closed'}
                                    size={20}
                                    color={formData.isPublic ? '#22c55e' : '#6b7280'}
                                />
                                <View style={styles.toggleTextContainer}>
                                    <Text style={styles.toggleTitle}>
                                        {formData.isPublic ? 'Public' : 'Private'}
                                    </Text>
                                    <Text style={styles.toggleDescription}>
                                        {formData.isPublic
                                            ? 'Anyone can discover your story'
                                            : 'Only you can see this story'}
                                    </Text>
                                </View>
                            </View>
                            <Switch
                                value={formData.isPublic}
                                onValueChange={(value) => setFormData({ ...formData, isPublic: value })}
                                trackColor={{ false: '#e5e7eb', true: '#bbf7d0' }}
                                thumbColor={formData.isPublic ? '#22c55e' : '#9ca3af'}
                            />
                        </View>
                    </View>

                    {/* Create Button */}
                    <TouchableOpacity
                        onPress={handleCreate}
                        disabled={generating}
                        style={[styles.createButton, generating && styles.createButtonDisabled]}
                    >
                        <Ionicons name="sparkles" size={22} color="#fff" />
                        <Text style={styles.createButtonText}>Create Magic ✨</Text>
                    </TouchableOpacity>

                    <View style={{ height: 120 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Generation Modal */}
            <GeneratingBookModal
                visible={generating}
                progress={progress}
                currentStep={currentStep}
            />

            {/* Picker Modals */}
            <PickerModal
                visible={genderModalVisible}
                title="Select Gender"
                options={GENDERS}
                selectedValue={formData.gender}
                onSelect={(value) => setFormData({ ...formData, gender: value })}
                onClose={() => setGenderModalVisible(false)}
                userTier={userTier}
            />
            <PickerModal
                visible={ageModalVisible}
                title="Select Age"
                options={STORY_AGES}
                selectedValue={formData.age}
                onSelect={(value) => setFormData({ ...formData, age: value })}
                onClose={() => setAgeModalVisible(false)}
                userTier={userTier}
            />
            <PickerModal
                visible={languageModalVisible}
                title="Select Language"
                options={LANGUAGES}
                selectedValue={formData.language}
                onSelect={(value) => setFormData({ ...formData, language: value })}
                onClose={() => setLanguageModalVisible(false)}
                userTier={userTier}
            />
            <PickerModal
                visible={themeModalVisible}
                title="Select Theme"
                options={STORY_THEMES}
                selectedValue={formData.theme}
                onSelect={(value) => setFormData({ ...formData, theme: value })}
                onClose={() => setThemeModalVisible(false)}
                userTier={userTier}
            />
            <PickerModal
                visible={toneModalVisible}
                title="Select Tone"
                options={STORY_TONES}
                selectedValue={formData.tone}
                onSelect={(value) => setFormData({ ...formData, tone: value })}
                onClose={() => setToneModalVisible(false)}
                userTier={userTier}
            />
            <PickerModal
                visible={styleModalVisible}
                title="Select Visual Style"
                options={COVER_STYLES}
                selectedValue={formData.coverStyle}
                onSelect={(value) => setFormData({ ...formData, coverStyle: value })}
                onClose={() => setStyleModalVisible(false)}
                userTier={userTier}
            />
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
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
    },
    headerIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#241a35',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#a855f7',
    },
    titleSection: {
        marginBottom: 28,
    },
    mainTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#f9fafb',
    },
    mainTitleAccent: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#a855f7',
    },
    subtitle: {
        fontSize: 15,
        color: '#9ca3af',
        marginTop: 8,
    },
    inputGroup: {
        marginBottom: 18,
    },
    label: {
        fontSize: 11,
        fontWeight: '700',
        color: '#a1a1aa',
        marginBottom: 8,
        letterSpacing: 0.8,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    aiBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#241a35',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    aiBadgeText: {
        color: '#a855f7',
        fontSize: 11,
        fontWeight: '700',
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1025',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderWidth: 1.5,
        borderColor: '#241a35',
    },
    textAreaContainer: {
        alignItems: 'flex-start',
        minHeight: 100,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#f9fafb',
        marginLeft: 10,
    },
    textArea: {
        minHeight: 70,
        textAlignVertical: 'top',
        marginLeft: 0,
    },
    row: {
        flexDirection: 'row',
    },
    selectContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#1a1025',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderWidth: 1.5,
        borderColor: '#241a35',
    },
    selectContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    selectText: {
        fontSize: 16,
        color: '#a1a1aa',
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#a855f7',
        borderRadius: 20,
        paddingVertical: 18,
        marginTop: 12,
        shadowColor: '#a855f7',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 8,
    },
    createButtonDisabled: {
        opacity: 0.7,
    },
    createButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    toggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#1a1025',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderWidth: 1.5,
        borderColor: '#241a35',
    },
    toggleInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    toggleTextContainer: {
        marginLeft: 12,
        flex: 1,
    },
    toggleTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#f9fafb',
    },
    toggleDescription: {
        fontSize: 12,
        color: '#9ca3af',
        marginTop: 2,
    },
});
