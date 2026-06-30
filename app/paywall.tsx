import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    Alert,
    Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { purchasesService } from '../services/purchases';

export default function PaywallScreen() {
    const router = useRouter();
    const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
    const [loading, setLoading] = useState(false);

    const plans = {
        monthly: { price: '$9.99', period: 'month' },
        yearly: { price: '$79.99', period: 'year', savings: '20%', monthlyEquiv: '$6.67' },
    };

    const features = [
        { icon: 'infinite', title: 'Unlimited Stories', desc: 'Create as many stories as you want' },
        { icon: 'volume-high', title: 'Audio Narration', desc: 'Professional voice narration' },
        { icon: 'image', title: 'HD Illustrations', desc: 'Print-quality images' },
        { icon: 'shield-checkmark', title: 'Ad-Free', desc: 'Uninterrupted experience' },
    ];

    const handlePurchase = async () => {
        setLoading(true);
        try {
            const success = await purchasesService.purchasePackage(selectedPlan);
            if (success) {
                Alert.alert('Success', 'Thank you for upgrading! You are now a Premium Member.', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            } else {
                Alert.alert('Purchase Failed', 'Please try again.');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Purchase process failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async () => {
        setLoading(true);
        try {
            const success = await purchasesService.restorePurchases();
            if (success) {
                Alert.alert('Restored', 'Your subscription status has been verified and restored.');
            } else {
                Alert.alert('Restore Failed', 'No past purchases found.');
            }
        } catch (error) {
            Alert.alert('Error', 'Restoration process failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="close" size={28} color="#3A2E2B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Upgrade to Premium</Text>
                <TouchableOpacity onPress={handleRestore}>
                    <Text style={styles.restoreText}>Restore</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Hero */}
                <View style={styles.heroCard}>
                    <View style={styles.premiumBadge}>
                        <Text style={styles.premiumBadgeText}>✨ PREMIUM</Text>
                    </View>
                    <Text style={styles.heroTitle}>Unlock Limits,</Text>
                    <Text style={styles.heroTitle}>Unleash Imagination!</Text>
                    <View style={styles.heroIconContainer}>
                        <Ionicons name="sparkles" size={48} color="#fff" />
                    </View>
                </View>

                {/* Features */}
                <View style={styles.featuresSection}>
                    {features.map((feature, index) => (
                        <View key={index} style={styles.featureItem}>
                            <View style={styles.featureIcon}>
                                <Ionicons name={feature.icon as any} size={20} color="#FF8E53" />
                            </View>
                            <View style={styles.featureText}>
                                <Text style={styles.featureTitle}>{feature.title}</Text>
                                <Text style={styles.featureDesc}>{feature.desc}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Plans */}
                <View style={styles.plansSection}>
                    <Text style={styles.plansTitle}>SELECT YOUR PLAN</Text>

                    {/* Monthly */}
                    <TouchableOpacity
                        onPress={() => setSelectedPlan('monthly')}
                        style={[
                            styles.planCard,
                            selectedPlan === 'monthly' && styles.planCardSelected
                        ]}
                    >
                        <View>
                            <Text style={styles.planName}>Monthly Plan</Text>
                            <Text style={styles.planSubtext}>Cancel anytime</Text>
                        </View>
                        <Text style={styles.planPrice}>{plans.monthly.price}<Text style={styles.planPeriod}>/mo</Text></Text>
                    </TouchableOpacity>

                    {/* Yearly */}
                    <TouchableOpacity
                        onPress={() => setSelectedPlan('yearly')}
                        style={[
                            styles.planCard,
                            selectedPlan === 'yearly' && styles.planCardSelected
                        ]}
                    >
                        <View style={styles.popularBadge}>
                            <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
                        </View>
                        <View>
                            <Text style={styles.planName}>Yearly Plan</Text>
                            <View style={styles.savingsBadge}>
                                <Text style={styles.savingsBadgeText}>Save {plans.yearly.savings}</Text>
                            </View>
                        </View>
                        <View style={styles.planPriceContainer}>
                            <Text style={styles.planPrice}>{plans.yearly.price}</Text>
                            <Text style={styles.planEquiv}>Only {plans.yearly.monthlyEquiv}/mo</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Trust Badge */}
                <View style={styles.trustBadge}>
                    <Ionicons name="heart" size={16} color="#10b981" />
                    <Text style={styles.trustText}>Trusted by 10,000+ families</Text>
                </View>

                {/* CTA */}
                <TouchableOpacity
                    onPress={handlePurchase}
                    disabled={loading}
                    style={[styles.ctaButton, loading && styles.ctaButtonDisabled]}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.ctaButtonText}>Start Free Trial →</Text>
                    )}
                </TouchableOpacity>

                {/* Terms */}
                <View style={styles.termsRow}>
                    <TouchableOpacity onPress={() => Linking.openURL('https://fairypages.com/terms')}>
                        <Text style={styles.termsText}>Terms of Use</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => Linking.openURL('https://fairypages.com/privacy')}>
                        <Text style={styles.termsText}>Privacy Policy</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAF6EE',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3A2E2B',
    },
    restoreText: {
        color: '#FF8E53',
        fontWeight: '600',
        fontSize: 15,
    },
    scrollView: {
        flex: 1,
    },
    heroCard: {
        marginHorizontal: 20,
        borderRadius: 24,
        backgroundColor: '#FF8E53',
        padding: 24,
        marginBottom: 24,
        shadowColor: '#FF8E53',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 6,
    },
    premiumBadge: {
        backgroundColor: 'rgba(255,255,255,0.25)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        alignSelf: 'flex-start',
        marginBottom: 12,
    },
    premiumBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    heroTitle: {
        color: '#fff',
        fontSize: 26,
        fontWeight: 'bold',
    },
    heroIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.25)',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginTop: 20,
    },
    featuresSection: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    featureIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFFDF9',
        borderWidth: 1.5,
        borderColor: '#EADFC9',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    featureText: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#3A2E2B',
    },
    featureDesc: {
        fontSize: 14,
        color: '#7A6B66',
        marginTop: 2,
    },
    plansSection: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    plansTitle: {
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '700',
        color: '#7A6B66',
        marginBottom: 16,
        letterSpacing: 0.5,
    },
    planCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#EADFC9',
        backgroundColor: '#FFFDF9',
        marginBottom: 12,
        position: 'relative',
    },
    planCardSelected: {
        borderColor: '#FF8E53',
        backgroundColor: '#FFF0E6',
    },
    planName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#3A2E2B',
    },
    planSubtext: {
        fontSize: 13,
        color: '#7A6B66',
        marginTop: 2,
    },
    planPrice: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#3A2E2B',
    },
    planPeriod: {
        fontSize: 14,
        fontWeight: 'normal',
        color: '#7A6B66',
    },
    planPriceContainer: {
        alignItems: 'flex-end',
    },
    planEquiv: {
        fontSize: 12,
        color: '#7A6B66',
        marginTop: 2,
    },
    popularBadge: {
        position: 'absolute',
        top: -10,
        right: 16,
        backgroundColor: '#8ECA94',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    popularBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    savingsBadge: {
        backgroundColor: '#EAF6EC',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        marginTop: 4,
        alignSelf: 'flex-start',
    },
    savingsBadgeText: {
        color: '#8ECA94',
        fontSize: 11,
        fontWeight: 'bold',
    },
    trustBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    trustText: {
        color: '#7A6B66',
        fontSize: 14,
        marginLeft: 6,
    },
    ctaButton: {
        backgroundColor: '#FF8E53',
        marginHorizontal: 20,
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: 'center',
        shadowColor: '#FF8E53',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    ctaButtonDisabled: {
        opacity: 0.7,
    },
    ctaButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    termsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 24,
        marginTop: 20,
    },
    termsText: {
        color: '#7A6B66',
        fontSize: 14,
    },
});
