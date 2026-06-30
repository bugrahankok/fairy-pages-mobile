import React, { useState, useCallback, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    Switch,
    Alert,
    ActivityIndicator,
    StyleSheet,
    Modal,
    TextInput,
    Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { bookApi, API_BASE_URL } from '../../services/api';
import { bookCache } from '../../services/bookCache';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { useFavorites } from '../../context/FavoritesContext';
import BookCoverImage from '../../components/BookCoverImage';
import { Book } from '../../types';

export default function ProfileScreen() {
    const router = useRouter();
    const { user, isAuthenticated, logout, refreshUser, updateUser } = useAuth();
    const { language, setLanguage, notificationsEnabled, setNotificationsEnabled } = useSettings();
    const { favorites } = useFavorites();
    const [books, setBooks] = useState<Book[]>([]);
    const [totalBooks, setTotalBooks] = useState(0);
    const [loading, setLoading] = useState(true);
    const hasLoadedOnce = useRef(false);

    // Edit Profile Modal
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editName, setEditName] = useState('');
    const [savingProfile, setSavingProfile] = useState(false);

    // Language Modal
    const [languageModalVisible, setLanguageModalVisible] = useState(false);

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'tr', name: 'Türkçe' },
        { code: 'de', name: 'Deutsch' },
        { code: 'fr', name: 'Français' },
        { code: 'es', name: 'Español' },
    ];

    useFocusEffect(
        useCallback(() => {
            if (isAuthenticated) {
                // Don't call refreshUser on every focus - it causes 401 errors
                // Only load books from cache if not loaded before
                if (!hasLoadedOnce.current) {
                    loadBooks();
                    hasLoadedOnce.current = true;
                } else {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        }, [isAuthenticated])
    );

    const loadBooks = async () => {
        try {
            // Try to load from cache first
            const cachedBooks = await bookCache.getLibraryBooks();
            if (cachedBooks && cachedBooks.length > 0) {
                console.log('📦 Using cached books for profile');
                setBooks(cachedBooks.slice(0, 5));
                setTotalBooks(cachedBooks.length);
                setLoading(false);
                return;
            }

            console.log('📚 Fetching profile books from API...');
            const response = await bookApi.history();
            const fetchedBooks = response.data || [];
            console.log(`✅ Loaded ${fetchedBooks.length} books for profile`);
            setBooks(fetchedBooks.slice(0, 5));
            setTotalBooks(fetchedBooks.length);

            // Also cache them for library screen
            if (fetchedBooks.length > 0) {
                await bookCache.saveLibraryBooks(fetchedBooks);
            }
        } catch (error: any) {
            console.error('❌ Failed to load profile books:', error.message);
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
        return 'https://picsum.photos/400/600';
    };

    const openEditModal = () => {
        setEditName(user?.name || '');
        setEditModalVisible(true);
    };

    const handleSaveProfile = async () => {
        if (!editName.trim()) {
            Alert.alert('Error', 'Name cannot be empty');
            return;
        }
        setSavingProfile(true);
        const result = await updateUser(editName.trim());
        setSavingProfile(false);
        if (result.success) {
            setEditModalVisible(false);
            Alert.alert('Success', 'Profile updated successfully');
        } else {
            Alert.alert('Error', result.error || 'Failed to update profile');
        }
    };

    const handleLanguageSelect = async (lang: { code: string; name: string }) => {
        await setLanguage(lang.code);
        setLanguageModalVisible(false);
        Alert.alert('Language Changed', `App language set to ${lang.name}`);
    };

    const handleEditAvatar = () => {
        Alert.alert('Avatar Style', 'Your profile avatar is automatically generated based on the first letter of your name.');
    };

    const handleRestorePurchases = () => {
        Alert.alert('Restore Purchases', 'Checking previous purchases... No purchases found.');
    };

    const handleHelpSupport = () => {
        Linking.openURL('mailto:support@fairypages.com?subject=Help Request');
    };

    if (!isAuthenticated) {
        return (
            <SafeAreaView style={styles.centeredContainer}>
                <Ionicons name="person-circle-outline" size={80} color="#d1d5db" />
                <Text style={styles.welcomeTitle}>Welcome to Fairy Pages</Text>
                <Text style={styles.welcomeText}>Login to access your profile</Text>
                <TouchableOpacity
                    onPress={() => router.push('/(auth)/login')}
                    style={styles.loginButton}
                >
                    <Text style={styles.loginButtonText}>Login</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => router.push('/(auth)/register')}
                    style={styles.registerButton}
                >
                    <Text style={styles.registerButtonText}>Create Account</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    if (loading) {
        return (
            <SafeAreaView style={styles.centeredContainer}>
                <ActivityIndicator size="large" color="#a855f7" />
            </SafeAreaView>
        );
    }

    const avatarInitial = user?.name?.charAt(0).toUpperCase() || 'U';
    const selectedLanguageName = languages.find(l => l.code === language)?.name || 'English';

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={24} color="#f9fafb" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>My Profile</Text>
                    <TouchableOpacity onPress={openEditModal}>
                        <Text style={styles.editText}>Edit</Text>
                    </TouchableOpacity>
                </View>

                {/* Avatar Section */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{avatarInitial}</Text>
                        </View>
                        <TouchableOpacity style={styles.editAvatarButton} onPress={handleEditAvatar}>
                            <Ionicons name="pencil" size={14} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.userName}>{user?.name}</Text>
                    <Text style={styles.userRole}>Storyteller</Text>
                    {user?.isPremium && (
                        <View style={styles.premiumBadge}>
                            <Ionicons name="star" size={14} color="#f59e0b" />
                            <Text style={styles.premiumText}>Premium Member</Text>
                        </View>
                    )}
                </View>

                {/* Stats */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{totalBooks}</Text>
                        <Text style={styles.statLabel}>BOOKS</Text>
                    </View>
                    <View style={styles.statCard}>
                        <View style={styles.creditRow}>
                            <Text style={[styles.statNumber, { color: '#a855f7' }]}>5</Text>
                            <Ionicons name="sparkles" size={14} color="#a855f7" />
                        </View>
                        <Text style={styles.statLabel}>CREDITS</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{favorites.length}</Text>
                        <Text style={styles.statLabel}>LIKES</Text>
                    </View>
                </View>

                {/* Created Stories */}
                {books.length > 0 && (
                    <View style={styles.storiesSection}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Created Stories</Text>
                            <TouchableOpacity onPress={() => router.push('/(tabs)/library')}>
                                <Text style={styles.seeAllText}>See All</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <TouchableOpacity
                                onPress={() => router.push('/(tabs)/create')}
                                style={styles.newStoryCard}
                            >
                                <Ionicons name="add-circle" size={32} color="#a855f7" />
                                <Text style={styles.newStoryText}>New Story</Text>
                            </TouchableOpacity>
                            {books.map((book) => (
                                <TouchableOpacity
                                    key={book.bookId}
                                    onPress={() => router.push(`/book/${book.bookId}`)}
                                    style={styles.storyCard}
                                >
                                    <BookCoverImage
                                        bookId={book.bookId}
                                        hasCover={!!book.coverImagePath}
                                        width={100}
                                        height={130}
                                    />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Settings */}
                <View style={styles.settingsCard}>
                    <TouchableOpacity style={styles.settingItem} onPress={openEditModal}>
                        <View style={styles.settingLeft}>
                            <Ionicons name="person-outline" size={20} color="#666" />
                            <Text style={styles.settingText}>Account Details</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#999" />
                    </TouchableOpacity>

                    <View style={styles.settingDivider} />

                    {user?.isPremium ? (
                        <TouchableOpacity style={styles.settingItem} onPress={handleRestorePurchases}>
                            <View style={styles.settingLeft}>
                                <Ionicons name="refresh-outline" size={20} color="#666" />
                                <Text style={styles.settingText}>Restore Purchases</Text>
                            </View>
                            <View style={styles.premiumBadgeSmall}>
                                <Text style={styles.premiumBadgeText}>Premium</Text>
                            </View>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={styles.settingItem}
                            onPress={() => router.push('/paywall')}
                        >
                            <View style={styles.settingLeft}>
                                <Ionicons name="card-outline" size={20} color="#666" />
                                <Text style={styles.settingText}>Upgrade to Premium</Text>
                            </View>
                            <Text style={styles.subscriptionStatus}>Free</Text>
                        </TouchableOpacity>
                    )}

                    <View style={styles.settingDivider} />

                    <View style={styles.settingItem}>
                        <View style={styles.settingLeft}>
                            <Ionicons name="notifications-outline" size={20} color="#666" />
                            <Text style={styles.settingText}>Notifications</Text>
                        </View>
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={setNotificationsEnabled}
                            trackColor={{ true: '#a855f7', false: '#e5e7eb' }}
                            thumbColor="#fff"
                        />
                    </View>

                    <View style={styles.settingDivider} />

                    <TouchableOpacity style={styles.settingItem} onPress={() => setLanguageModalVisible(true)}>
                        <View style={styles.settingLeft}>
                            <Ionicons name="globe-outline" size={20} color="#666" />
                            <Text style={styles.settingText}>App Language</Text>
                        </View>
                        <Text style={styles.languageText}>{selectedLanguageName}</Text>
                    </TouchableOpacity>

                    <View style={styles.settingDivider} />

                    <TouchableOpacity style={styles.settingItem} onPress={handleHelpSupport}>
                        <View style={styles.settingLeft}>
                            <Ionicons name="help-circle-outline" size={20} color="#666" />
                            <Text style={styles.settingText}>Help & Support</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#999" />
                    </TouchableOpacity>
                </View>

                {/* Logout */}
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Edit Profile Modal */}
            <Modal
                visible={editModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Edit Profile</Text>
                        <Text style={styles.modalLabel}>Name</Text>
                        <TextInput
                            style={styles.modalInput}
                            value={editName}
                            onChangeText={setEditName}
                            placeholder="Enter your name"
                            placeholderTextColor="#666"
                            autoCapitalize="words"
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={() => setEditModalVisible(false)}
                            >
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalSaveButton}
                                onPress={handleSaveProfile}
                                disabled={savingProfile}
                            >
                                {savingProfile ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.modalSaveText}>Save</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Language Selection Modal */}
            <Modal
                visible={languageModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setLanguageModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Language</Text>
                        {languages.map((lang) => (
                            <TouchableOpacity
                                key={lang.code}
                                style={[
                                    styles.languageOption,
                                    language === lang.code && styles.languageOptionActive
                                ]}
                                onPress={() => handleLanguageSelect(lang)}
                            >
                                <Text style={[
                                    styles.languageOptionText,
                                    language === lang.code && styles.languageOptionTextActive
                                ]}>
                                    {lang.name}
                                </Text>
                                {language === lang.code && (
                                    <Ionicons name="checkmark" size={20} color="#a855f7" />
                                )}
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            style={styles.modalCancelButton}
                            onPress={() => setLanguageModalVisible(false)}
                        >
                            <Text style={styles.modalCancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
    welcomeTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#3A2E2B',
        marginTop: 16,
        textAlign: 'center',
    },
    welcomeText: {
        fontSize: 15,
        color: '#7A6B66',
        marginTop: 8,
        textAlign: 'center',
    },
    loginButton: {
        backgroundColor: '#FF8E53',
        paddingHorizontal: 48,
        paddingVertical: 14,
        borderRadius: 14,
        marginTop: 24,
    },
    loginButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    registerButton: {
        marginTop: 16,
    },
    registerButtonText: {
        color: '#FF8E53',
        fontWeight: '600',
        fontSize: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3A2E2B',
    },
    editText: {
        color: '#FF8E53',
        fontWeight: '600',
        fontSize: 16,
    },
    avatarSection: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#F5EFE4',
        borderWidth: 2,
        borderColor: '#EADFC9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FF8E53',
    },
    editAvatarButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FF8E53',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#FFFDF9',
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#3A2E2B',
        marginTop: 12,
    },
    userRole: {
        fontSize: 15,
        color: '#7A6B66',
        marginTop: 2,
    },
    premiumBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fef3c7',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginTop: 12,
    },
    premiumText: {
        color: '#b45309',
        fontWeight: 'bold',
        fontSize: 12,
        marginLeft: 6,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        backgroundColor: '#FFFDF9',
        borderRadius: 16,
        paddingHorizontal: 24,
        paddingVertical: 16,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#EADFC9',
        shadowColor: '#FF8E53',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#3A2E2B',
    },
    creditRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statLabel: {
        fontSize: 11,
        color: '#7A6B66',
        marginTop: 4,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    storiesSection: {
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
        fontSize: 16,
        fontWeight: 'bold',
        color: '#3A2E2B',
    },
    seeAllText: {
        color: '#FF8E53',
        fontWeight: '600',
        fontSize: 14,
    },
    newStoryCard: {
        width: 100,
        height: 130,
        backgroundColor: '#FFFDF9',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 20,
        marginRight: 12,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#FF8E53',
    },
    newStoryText: {
        color: '#FF8E53',
        fontSize: 12,
        fontWeight: '600',
        marginTop: 8,
    },
    storyCard: {
        marginRight: 12,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: '#EADFC9',
    },
    storyImage: {
        width: 100,
        height: 130,
        borderRadius: 16,
    },
    settingsCard: {
        backgroundColor: '#FFFDF9',
        marginHorizontal: 20,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: '#EADFC9',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingText: {
        fontSize: 16,
        color: '#3A2E2B',
        marginLeft: 12,
    },
    settingDivider: {
        height: 1,
        backgroundColor: '#EADFC9',
        marginLeft: 48,
    },
    subscriptionStatus: {
        color: '#FF8E53',
        fontWeight: '600',
        fontSize: 14,
    },
    languageText: {
        color: '#7A6B66',
        fontSize: 14,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFDF9',
        marginHorizontal: 20,
        marginTop: 16,
        paddingVertical: 16,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#EADFC9',
    },
    logoutText: {
        color: '#ef4444',
        fontWeight: '600',
        fontSize: 16,
        marginLeft: 8,
    },
    // Premium Badge Small (for settings row)
    premiumBadgeSmall: {
        backgroundColor: '#fef3c7',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    premiumBadgeText: {
        color: '#b45309',
        fontWeight: 'bold',
        fontSize: 12,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(58, 46, 43, 0.65)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#FFFDF9',
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 350,
        borderWidth: 1.5,
        borderColor: '#EADFC9',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#3A2E2B',
        marginBottom: 20,
        textAlign: 'center',
    },
    modalLabel: {
        fontSize: 14,
        color: '#7A6B66',
        marginBottom: 8,
    },
    modalInput: {
        backgroundColor: '#F5EFE4',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        color: '#3A2E2B',
        fontSize: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#EADFC9',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    modalCancelButton: {
        flex: 1,
        backgroundColor: '#F5EFE4',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalCancelText: {
        color: '#7A6B66',
        fontWeight: '600',
        fontSize: 16,
    },
    modalSaveButton: {
        flex: 1,
        backgroundColor: '#FF8E53',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalSaveText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    // Language Option Styles
    languageOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 8,
        backgroundColor: '#FFFDF9',
        borderWidth: 1.5,
        borderColor: '#EADFC9',
    },
    languageOptionActive: {
        backgroundColor: '#FFF0E6',
        borderWidth: 1.5,
        borderColor: '#FF8E53',
    },
    languageOptionText: {
        color: '#3A2E2B',
        fontSize: 16,
    },
    languageOptionTextActive: {
        color: '#FF8E53',
        fontWeight: '600',
    },
});
