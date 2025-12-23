import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen() {
    const router = useRouter();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError('');

        const result = await login(email, password);
        setLoading(false);

        if (result.success) {
            router.replace('/(tabs)');
        } else {
            setError(result.error || 'Login failed');
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <View className="flex-1 px-6 justify-center">
                    {/* Header */}
                    <View className="items-center mb-10">
                        <View className="w-20 h-20 rounded-full bg-purple-100 items-center justify-center mb-4">
                            <Ionicons name="sparkles" size={40} color="#a855f7" />
                        </View>
                        <Text className="text-3xl font-bold text-gray-900">Welcome Back</Text>
                        <Text className="text-gray-400 mt-2">Sign in to continue creating magic</Text>
                    </View>

                    {/* Error */}
                    {error ? (
                        <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                            <Text className="text-red-600 text-center">{error}</Text>
                        </View>
                    ) : null}

                    {/* Email */}
                    <View className="mb-4">
                        <Text className="text-gray-500 text-sm font-medium mb-2">Email</Text>
                        <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                            <Ionicons name="mail-outline" size={20} color="#999" />
                            <TextInput
                                placeholder="your@email.com"
                                placeholderTextColor="#999"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                className="flex-1 ml-3 text-base"
                            />
                        </View>
                    </View>

                    {/* Password */}
                    <View className="mb-6">
                        <Text className="text-gray-500 text-sm font-medium mb-2">Password</Text>
                        <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                            <Ionicons name="lock-closed-outline" size={20} color="#999" />
                            <TextInput
                                placeholder="••••••••"
                                placeholderTextColor="#999"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                className="flex-1 ml-3 text-base"
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#999" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Login Button */}
                    <TouchableOpacity
                        onPress={handleLogin}
                        disabled={loading}
                        className={`bg-purple-500 rounded-xl py-4 items-center ${loading ? 'opacity-70' : ''}`}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text className="text-white font-bold text-lg">Sign In</Text>
                        )}
                    </TouchableOpacity>

                    {/* Register Link */}
                    <View className="flex-row justify-center mt-6">
                        <Text className="text-gray-400">Don't have an account? </Text>
                        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                            <Text className="text-purple-500 font-bold">Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
