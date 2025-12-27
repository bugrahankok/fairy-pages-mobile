import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface GradientBackgroundProps {
    children: React.ReactNode;
    variant?: 'default' | 'subtle' | 'intense';
}

export default function GradientBackground({
    children,
    variant = 'default'
}: GradientBackgroundProps) {
    const getOrbStyles = () => {
        switch (variant) {
            case 'subtle':
                return {
                    opacity: 0.3,
                    colors: ['#e9d5ff', '#f3e8ff', 'transparent'] as const,
                };
            case 'intense':
                return {
                    opacity: 0.6,
                    colors: ['#c084fc', '#a855f7', 'transparent'] as const,
                };
            default:
                return {
                    opacity: 0.4,
                    colors: ['#d8b4fe', '#e9d5ff', 'transparent'] as const,
                };
        }
    };

    const orbStyle = getOrbStyles();

    return (
        <View style={styles.container}>
            {/* Main gradient background */}
            <LinearGradient
                colors={['#faf5ff', '#f3e8ff', '#faf5ff']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            {/* Decorative gradient orbs */}
            <View style={[styles.orb, styles.orbTopRight, { opacity: orbStyle.opacity }]}>
                <LinearGradient
                    colors={orbStyle.colors}
                    style={styles.orbGradient}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                />
            </View>

            <View style={[styles.orb, styles.orbBottomLeft, { opacity: orbStyle.opacity }]}>
                <LinearGradient
                    colors={['#c084fc', '#d8b4fe', 'transparent']}
                    style={styles.orbGradient}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                />
            </View>

            <View style={[styles.orb, styles.orbMiddle, { opacity: orbStyle.opacity * 0.5 }]}>
                <LinearGradient
                    colors={['#a855f7', '#c084fc', 'transparent']}
                    style={styles.orbGradient}
                    start={{ x: 0.3, y: 0 }}
                    end={{ x: 0.7, y: 1 }}
                />
            </View>

            {/* Content */}
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#faf5ff',
    },
    orb: {
        position: 'absolute',
        borderRadius: 999,
        overflow: 'hidden',
    },
    orbGradient: {
        width: '100%',
        height: '100%',
    },
    orbTopRight: {
        top: -80,
        right: -60,
        width: width * 0.7,
        height: width * 0.7,
    },
    orbBottomLeft: {
        bottom: 60,
        left: -100,
        width: width * 0.8,
        height: width * 0.8,
    },
    orbMiddle: {
        top: height * 0.4,
        right: -40,
        width: width * 0.5,
        height: width * 0.5,
    },
});
