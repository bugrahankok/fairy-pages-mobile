import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

export default function RegisterScreen() {
    const router = useRouter();
    const { register } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async () => {
        if (!name.trim() || !email.trim() || !password.trim()) {
            setError('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        setError('');

        const result = await register(name, email, password);
        setLoading(false);

        if (result.success) {
            router.replace('/(tabs)');
        } else {
            setError(result.error || 'Registration failed');
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView className="flex-1 px-6" contentContainerStyle={{ justifyContent: 'center', flexGrow: 1 }}>
                    {/* Header */}
                    <View className="items-center mb-8">
                        <View className="w-20 h-20 rounded-full bg-purple-100 items-center justify-center mb-4">
                            <Ionicons name="person-add" size={36} color="#a855f7" />
                        </View>
                        <Text className="text-3xl font-bold text-gray-900">Create Account</Text>
                        <Text className="text-gray-400 mt-2">Join the magical world of stories</Text>
                    </View>

                    {/* Error */}
                    {error ? (
                        <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                            <Text className="text-red-600 text-center">{error}</Text>
                        </View>
                    ) : null}

                    {/* Name */}
                    <View className="mb-4">
                        <Text className="text-gray-500 text-sm font-medium mb-2">Full Name</Text>
                        <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                            <Ionicons name="person-outline" size={20} color="#999" />
                            <TextInput
                                placeholder="Your name"
                                placeholderTextColor="#999"
                                value={name}
                                onChangeText={setName}
                                className="flex-1 ml-3 text-base"
                            />
                        </View>
                    </View>

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
                    <View className="mb-4">
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

                    {/* Confirm Password */}
                    <View className="mb-6">
                        <Text className="text-gray-500 text-sm font-medium mb-2">Confirm Password</Text>
                        <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                            <Ionicons name="lock-closed-outline" size={20} color="#999" />
                            <TextInput
                                placeholder="••••••••"
                                placeholderTextColor="#999"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showPassword}
                                className="flex-1 ml-3 text-base"
                            />
                        </View>
                    </View>

                    {/* Register Button */}
                    <TouchableOpacity
                        onPress={handleRegister}
                        disabled={loading}
                        className={`bg-purple-500 rounded-xl py-4 items-center ${loading ? 'opacity-70' : ''}`}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text className="text-white font-bold text-lg">Create Account</Text>
                        )}
                    </TouchableOpacity>

                    {/* Login Link */}
                    <View className="flex-row justify-center mt-6 mb-8">
                        <Text className="text-gray-400">Already have an account? </Text>
                        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                            <Text className="text-purple-500 font-bold">Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
