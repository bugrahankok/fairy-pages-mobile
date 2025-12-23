import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
// import Purchases from 'react-native-purchases';

export default function PaywallScreen() {
    const router = useRouter();
    const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
    const [loading, setLoading] = useState(false);

    const plans = {
        monthly: { price: '$9.99', period: 'month', savings: null },
        yearly: { price: '$79.99', period: 'year', savings: '20%', monthlyEquiv: '$6.67' },
    };

    const features = [
        { icon: 'infinite', title: 'Unlimited Stories', desc: 'Create as many AI-powered stories as you want' },
        { icon: 'volume-high', title: 'Audio Narration', desc: 'Professional voice narration for all stories' },
        { icon: 'image', title: 'HD Illustrations', desc: 'Print-quality high resolution images' },
        { icon: 'shield-checkmark', title: 'Ad-Free', desc: '100% safe and uninterrupted experience' },
    ];

    const handlePurchase = async () => {
        setLoading(true);
        // TODO: Implement RevenueCat purchase
        setTimeout(() => {
            setLoading(false);
            router.back();
        }, 2000);
    };

    const handleRestore = async () => {
        // TODO: Implement restore purchases
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 py-3">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="close" size={28} color="#333" />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-purple-600">Upgrade to Premium</Text>
                <TouchableOpacity onPress={handleRestore}>
                    <Text className="text-purple-500 font-medium">Restore</Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1">
                {/* Hero */}
                <View className="mx-5 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-600 to-pink-500 p-6 mb-6">
                    <View className="bg-purple-400/30 px-3 py-1 rounded-full self-start mb-3">
                        <Text className="text-white text-xs font-bold">✨ PREMIUM</Text>
                    </View>
                    <Text className="text-white text-2xl font-bold">Unlock Limits,</Text>
                    <Text className="text-white text-2xl font-bold">Unleash Imagination!</Text>
                    <View className="mt-4 items-center">
                        <View className="w-32 h-32 bg-white/20 rounded-full items-center justify-center">
                            <Ionicons name="sparkles" size={48} color="#fff" />
                        </View>
                    </View>
                </View>

                {/* Features */}
                <View className="px-5 mb-6">
                    {features.map((feature, index) => (
                        <View key={index} className="flex-row items-start mb-4">
                            <View className="w-10 h-10 rounded-full bg-purple-100 items-center justify-center mr-3">
                                <Ionicons name={feature.icon as any} size={20} color="#a855f7" />
                            </View>
                            <View className="flex-1">
                                <Text className="font-bold text-gray-900">{feature.title}</Text>
                                <Text className="text-gray-400 text-sm">{feature.desc}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Plans */}
                <View className="px-5 mb-6">
                    <Text className="text-center font-bold text-gray-500 uppercase text-xs mb-4">SELECT YOUR PLAN</Text>

                    {/* Monthly */}
                    <TouchableOpacity
                        onPress={() => setSelectedPlan('monthly')}
                        className={`flex-row items-center justify-between p-4 rounded-xl mb-3 border-2 ${selectedPlan === 'monthly' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                            }`}
                    >
                        <View>
                            <Text className="font-bold text-gray-900">Monthly Plan</Text>
                            <Text className="text-gray-400 text-sm">Cancel anytime</Text>
                        </View>
                        <Text className="text-xl font-bold text-gray-900">{plans.monthly.price}<Text className="text-sm text-gray-400">/mo</Text></Text>
                    </TouchableOpacity>

                    {/* Yearly */}
                    <TouchableOpacity
                        onPress={() => setSelectedPlan('yearly')}
                        className={`relative flex-row items-center justify-between p-4 rounded-xl border-2 ${selectedPlan === 'yearly' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                            }`}
                    >
                        <View className="absolute -top-2 right-4 bg-green-500 px-2 py-0.5 rounded-full">
                            <Text className="text-white text-xs font-bold">MOST POPULAR</Text>
                        </View>
                        <View>
                            <Text className="font-bold text-gray-900">Yearly Plan</Text>
                            <View className="flex-row items-center">
                                <View className="bg-green-100 px-2 py-0.5 rounded-full mr-2">
                                    <Text className="text-green-600 text-xs font-bold">Save {plans.yearly.savings}</Text>
                                </View>
                            </View>
                        </View>
                        <View className="items-end">
                            <Text className="text-xl font-bold text-gray-900">{plans.yearly.price}</Text>
                            <Text className="text-gray-400 text-xs">Only {plans.yearly.monthlyEquiv}/mo</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Trust Badge */}
                <View className="items-center mb-6">
                    <View className="flex-row items-center">
                        <Ionicons name="heart" size={16} color="#10b981" />
                        <Text className="text-gray-500 text-sm ml-1">Trusted by 10,000+ families</Text>
                    </View>
                </View>

                {/* CTA */}
                <View className="px-5 mb-4">
                    <TouchableOpacity
                        onPress={handlePurchase}
                        disabled={loading}
                        className="bg-purple-500 rounded-2xl py-4 items-center"
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text className="text-white font-bold text-lg">Start Free Trial →</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Terms */}
                <View className="flex-row justify-center gap-4 pb-8">
                    <TouchableOpacity>
                        <Text className="text-gray-400 text-sm">Terms of Use</Text>
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Text className="text-gray-400 text-sm">Privacy Policy</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
