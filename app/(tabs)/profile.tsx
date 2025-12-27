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
    StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { bookApi, API_BASE_URL } from '../../services/api';
import { bookCache } from '../../services/bookCache';
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
    const hasLoadedOnce = useRef(false);

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
                setLoading(false);
                return;
            }

            console.log('📚 Fetching profile books from API...');
            const response = await bookApi.history();
            const fetchedBooks = response.data || [];
            console.log(`✅ Loaded ${fetchedBooks.length} books for profile`);
            setBooks(fetchedBooks.slice(0, 5));

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

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>My Profile</Text>
                    <TouchableOpacity>
                        <Text style={styles.editText}>Edit</Text>
                    </TouchableOpacity>
                </View>

                {/* Avatar Section */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{avatarInitial}</Text>
                        </View>
                        <TouchableOpacity style={styles.editAvatarButton}>
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
                        <Text style={styles.statNumber}>{books.length}</Text>
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
                        <Text style={styles.statNumber}>48</Text>
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
                                    <Image
                                        source={{ uri: getCoverUrl(book) }}
                                        style={styles.storyImage}
                                        resizeMode="cover"
                                    />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Settings */}
                <View style={styles.settingsCard}>
                    <TouchableOpacity style={styles.settingItem}>
                        <View style={styles.settingLeft}>
                            <Ionicons name="person-outline" size={20} color="#666" />
                            <Text style={styles.settingText}>Account Details</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#999" />
                    </TouchableOpacity>

                    <View style={styles.settingDivider} />

                    <TouchableOpacity
                        style={styles.settingItem}
                        onPress={() => router.push('/paywall')}
                    >
                        <View style={styles.settingLeft}>
                            <Ionicons name="card-outline" size={20} color="#666" />
                            <Text style={styles.settingText}>Subscription</Text>
                        </View>
                        <Text style={styles.subscriptionStatus}>
                            {user?.isPremium ? 'Premium' : 'Free'}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.settingDivider} />

                    <View style={styles.settingItem}>
                        <View style={styles.settingLeft}>
                            <Ionicons name="notifications-outline" size={20} color="#666" />
                            <Text style={styles.settingText}>Notifications</Text>
                        </View>
                        <Switch
                            value={notifications}
                            onValueChange={setNotifications}
                            trackColor={{ true: '#a855f7', false: '#e5e7eb' }}
                            thumbColor="#fff"
                        />
                    </View>

                    <View style={styles.settingDivider} />

                    <TouchableOpacity style={styles.settingItem}>
                        <View style={styles.settingLeft}>
                            <Ionicons name="globe-outline" size={20} color="#666" />
                            <Text style={styles.settingText}>App Language</Text>
                        </View>
                        <Text style={styles.languageText}>English</Text>
                    </TouchableOpacity>

                    <View style={styles.settingDivider} />

                    <TouchableOpacity style={styles.settingItem}>
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
    centeredContainer: {
        flex: 1,
        backgroundColor: '#0f0a1a',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    welcomeTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#f9fafb',
        marginTop: 16,
        textAlign: 'center',
    },
    welcomeText: {
        fontSize: 15,
        color: '#9ca3af',
        marginTop: 8,
        textAlign: 'center',
    },
    loginButton: {
        backgroundColor: '#a855f7',
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
        color: '#a855f7',
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
        color: '#f9fafb',
    },
    editText: {
        color: '#a855f7',
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
        backgroundColor: '#241a35',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#a855f7',
    },
    editAvatarButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#a855f7',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#fff',
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#f9fafb',
        marginTop: 12,
    },
    userRole: {
        fontSize: 15,
        color: '#9ca3af',
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
        backgroundColor: '#1a1025',
        borderRadius: 16,
        paddingHorizontal: 24,
        paddingVertical: 16,
        alignItems: 'center',
        shadowColor: '#a855f7',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 2,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#f9fafb',
    },
    creditRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statLabel: {
        fontSize: 11,
        color: '#9ca3af',
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
        color: '#f9fafb',
    },
    seeAllText: {
        color: '#a855f7',
        fontWeight: '600',
        fontSize: 14,
    },
    newStoryCard: {
        width: 100,
        height: 130,
        backgroundColor: '#241a35',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 20,
        marginRight: 12,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#a855f7',
    },
    newStoryText: {
        color: '#a855f7',
        fontSize: 12,
        fontWeight: '600',
        marginTop: 8,
    },
    storyCard: {
        marginRight: 12,
    },
    storyImage: {
        width: 100,
        height: 130,
        borderRadius: 16,
    },
    settingsCard: {
        backgroundColor: '#1a1025',
        marginHorizontal: 20,
        borderRadius: 16,
        overflow: 'hidden',
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
        color: '#f9fafb',
        marginLeft: 12,
    },
    settingDivider: {
        height: 1,
        backgroundColor: '#241a35',
        marginLeft: 48,
    },
    subscriptionStatus: {
        color: '#a855f7',
        fontWeight: '600',
        fontSize: 14,
    },
    languageText: {
        color: '#9ca3af',
        fontSize: 14,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1a1025',
        marginHorizontal: 20,
        marginTop: 16,
        paddingVertical: 16,
        borderRadius: 16,
    },
    logoutText: {
        color: '#ef4444',
        fontWeight: '600',
        fontSize: 16,
        marginLeft: 8,
    },
});
