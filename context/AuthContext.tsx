import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../services/api';
import { User } from '../types';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    updateUser: (name: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStoredAuth();
    }, []);

    const loadStoredAuth = async () => {
        try {
            const storedToken = await AsyncStorage.getItem('token');
            const storedUser = await AsyncStorage.getItem('user');

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error('Failed to load auth state:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await authApi.login(email, password);
            const data = response.data;

            await AsyncStorage.setItem('token', data.token);
            const userObj: User = {
                userId: data.userId,
                name: data.name,
                email: data.email,
                isPremium: data.isPremium,
                isAdmin: data.isAdmin,
                tier: data.tier || (data.isPremium ? 'premium' : 'free'),
                premiumExpiresAt: data.premiumExpiresAt,
            };
            await AsyncStorage.setItem('user', JSON.stringify(userObj));

            setToken(data.token);
            setUser(userObj);

            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.response?.data?.error || 'Login failed' };
        }
    };

    const register = async (name: string, email: string, password: string) => {
        try {
            const response = await authApi.register(name, email, password);
            const data = response.data;

            await AsyncStorage.setItem('token', data.token);
            const userObj: User = {
                userId: data.userId,
                name: data.name,
                email: data.email,
                isPremium: data.isPremium,
                isAdmin: data.isAdmin,
                tier: data.tier || (data.isPremium ? 'premium' : 'free'),
                premiumExpiresAt: data.premiumExpiresAt,
            };
            await AsyncStorage.setItem('user', JSON.stringify(userObj));

            setToken(data.token);
            setUser(userObj);

            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.response?.data?.error || 'Registration failed' };
        }
    };

    const logout = async () => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    const refreshUser = async () => {
        // Only refresh if we have a token
        if (!token) return;

        try {
            console.log('🔄 Refreshing user data...');
            const response = await authApi.getMe();
            const data = response.data;

            const updatedUser: User = {
                userId: data.userId,
                name: data.name,
                email: data.email,
                isPremium: data.isPremium,
                isAdmin: data.isAdmin,
                tier: data.tier || (data.isPremium ? 'premium' : 'free'),
                premiumExpiresAt: data.premiumExpiresAt,
            };

            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            console.log('✅ User data refreshed successfully');
        } catch (error: any) {
            console.warn('⚠️ Could not refresh user data:', error.message);
            // If the error is 401 Unauthorized, log out the user
            if (error.response?.status === 401) {
                console.log('🔐 Session expired (401), logging out...');
                await logout();
            }
        }
    };

    const updateUser = async (name: string) => {
        try {
            const response = await authApi.updateProfile(name);
            const updatedUser = { ...user!, name: response.data.name || name };
            setUser(updatedUser);
            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
            return { success: true };
        } catch (error: any) {
            console.error('Failed to update user:', error.message);
            return { success: false, error: error.message || 'Failed to update profile' };
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            isAuthenticated: !!token,
            loading,
            login,
            register,
            logout,
            refreshUser,
            updateUser,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
