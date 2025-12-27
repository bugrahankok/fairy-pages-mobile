import React, { useState } from 'react';
import { View, Image, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../services/api';

interface BookCoverProps {
    bookId: number;
    coverImagePath?: string | null;
    style?: any;
    size?: 'small' | 'medium' | 'large';
}

export default function BookCover({ bookId, coverImagePath, style, size = 'medium' }: BookCoverProps) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const coverUrl = `${API_BASE_URL}/api/book/${bookId}/cover`;

    const sizeStyles = {
        small: { width: 80, height: 110 },
        medium: { width: 140, height: 200 },
        large: { width: 200, height: 280 },
    };

    const iconSize = {
        small: 24,
        medium: 40,
        large: 56,
    };

    const textSize = {
        small: 9,
        medium: 11,
        large: 13,
    };

    if (error || !coverImagePath) {
        // Show placeholder when no cover or error loading
        return (
            <View style={[styles.placeholder, sizeStyles[size], style]}>
                <View style={styles.placeholderContent}>
                    <Ionicons name="image-outline" size={iconSize[size]} color="#c084fc" />
                    <Text style={[styles.placeholderText, { fontSize: textSize[size] }]}>
                        {error ? 'Image not available' : 'Creating cover...'}
                    </Text>
                    {!error && <ActivityIndicator size="small" color="#a855f7" style={styles.spinner} />}
                </View>
                <View style={styles.sparkles}>
                    <Ionicons name="sparkles" size={16} color="#e9d5ff" style={styles.sparkle1} />
                    <Ionicons name="star" size={12} color="#f3e8ff" style={styles.sparkle2} />
                </View>
            </View>
        );
    }

    return (
        <View style={[sizeStyles[size], style]}>
            {loading && (
                <View style={[styles.loadingOverlay, sizeStyles[size]]}>
                    <ActivityIndicator size="small" color="#a855f7" />
                </View>
            )}
            <Image
                source={{ uri: coverUrl }}
                style={[styles.image, sizeStyles[size]]}
                resizeMode="cover"
                onLoadStart={() => setLoading(true)}
                onLoadEnd={() => setLoading(false)}
                onError={() => {
                    setLoading(false);
                    setError(true);
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    placeholder: {
        backgroundColor: '#faf5ff',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#f3e8ff',
        borderStyle: 'dashed',
        overflow: 'hidden',
    },
    placeholderContent: {
        alignItems: 'center',
        padding: 12,
    },
    placeholderText: {
        color: '#a855f7',
        fontWeight: '600',
        marginTop: 8,
        textAlign: 'center',
    },
    spinner: {
        marginTop: 8,
    },
    sparkles: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    sparkle1: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
    sparkle2: {
        position: 'absolute',
        bottom: 15,
        left: 10,
    },
    loadingOverlay: {
        position: 'absolute',
        zIndex: 1,
        backgroundColor: 'rgba(250, 245, 255, 0.8)',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
    },
    image: {
        borderRadius: 16,
    },
});
