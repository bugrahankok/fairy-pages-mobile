import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../services/api';

interface User {
    userId: number;
    name: string;
    email: string;
    isPremium: boolean;
    isAdmin: boolean;
    premiumExpiresAt?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
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
            await AsyncStorage.setItem('user', JSON.stringify({
                userId: data.userId,
                name: data.name,
                email: data.email,
                isPremium: data.isPremium,
                isAdmin: data.isAdmin,
                premiumExpiresAt: data.premiumExpiresAt,
            }));

            setToken(data.token);
            setUser({
                userId: data.userId,
                name: data.name,
                email: data.email,
                isPremium: data.isPremium,
                isAdmin: data.isAdmin,
                premiumExpiresAt: data.premiumExpiresAt,
            });

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
            await AsyncStorage.setItem('user', JSON.stringify({
                userId: data.userId,
                name: data.name,
                email: data.email,
                isPremium: data.isPremium,
                isAdmin: data.isAdmin,
            }));

            setToken(data.token);
            setUser({
                userId: data.userId,
                name: data.name,
                email: data.email,
                isPremium: data.isPremium,
                isAdmin: data.isAdmin,
            });

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
        try {
            const response = await authApi.getMe();
            const data = response.data;

            const updatedUser = {
                userId: data.userId,
                name: data.name,
                email: data.email,
                isPremium: data.isPremium,
                isAdmin: data.isAdmin,
                premiumExpiresAt: data.premiumExpiresAt,
            };

            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
        } catch (error) {
            console.error('Failed to refresh user:', error);
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
