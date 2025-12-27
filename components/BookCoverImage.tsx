import React, { useState, useEffect, useRef } from 'react';
import { View, Image, StyleSheet, ActivityIndicator, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { API_BASE_URL } from '../services/api';

interface BookCoverImageProps {
    bookId: number;
    hasCover?: boolean;
    style?: any;
    width?: number;
    height?: number;
    showOverlay?: boolean; // Add darkening overlay for better text readability
}

export default function BookCoverImage({
    bookId,
    hasCover = false,
    style,
    width = 140,
    height = 200,
    showOverlay = false
}: BookCoverImageProps) {
    // If no cover exists, start in error state (show placeholder)
    const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(hasCover ? 'loading' : 'error');
    const [fadeAnim] = useState(new Animated.Value(0));
    const [retryCount, setRetryCount] = useState(0);
    const [imageKey, setImageKey] = useState(Date.now());
    const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const coverUrl = `${API_BASE_URL}/api/book/${bookId}/cover?t=${imageKey}`;

    useEffect(() => {
        // Reset status when bookId or hasCover changes
        if (hasCover) {
            setStatus('loading');
            setRetryCount(0);
            setImageKey(Date.now());
        } else {
            setStatus('error'); // No cover, show placeholder
        }
    }, [bookId, hasCover]);

    // Cleanup retry timeout on unmount
    useEffect(() => {
        return () => {
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
            }
        };
    }, []);

    const handleLoadEnd = () => {
        setStatus('loaded');
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const handleError = () => {
        // Retry loading up to 10 times (30 seconds total) with 3-second intervals
        if (retryCount < 10) {
            retryTimeoutRef.current = setTimeout(() => {
                setRetryCount(prev => prev + 1);
                setImageKey(Date.now());
                setStatus('loading');
            }, 3000) as unknown as NodeJS.Timeout;
        } else {
            setStatus('error');
        }
    };

    const containerStyle = {
        width,
        height,
        borderRadius: 16,
    };

    // Placeholder/Loading State
    if (status !== 'loaded') {
        return (
            <View style={[styles.placeholder, containerStyle, style]}>
                <View style={styles.placeholderInner}>
                    {/* Book icon */}
                    <View style={styles.iconContainer}>
                        <Ionicons name="book" size={Math.min(width, height) * 0.25} color="#c084fc" />
                    </View>

                    {/* Status text */}
                    <Text style={styles.statusText}>
                        {status === 'error' ? 'Cover unavailable' : 'Creating magic...'}
                    </Text>

                    {/* Loading indicator */}
                    {status === 'loading' && (
                        <ActivityIndicator size="small" color="#a855f7" style={styles.spinner} />
                    )}

                    {/* Decorative sparkles */}
                    <Ionicons name="sparkles" size={16} color="#e9d5ff" style={styles.sparkle1} />
                    <Ionicons name="star" size={12} color="#f3e8ff" style={styles.sparkle2} />
                    <Ionicons name="sparkles" size={14} color="#faf5ff" style={styles.sparkle3} />
                </View>

                {/* Hidden image to trigger loading */}
                <Image
                    key={imageKey}
                    source={{ uri: coverUrl }}
                    style={styles.hiddenImage}
                    onLoad={handleLoadEnd}
                    onError={handleError}
                />
            </View>
        );
    }

    // Loaded State - show actual cover image
    return (
        <Animated.View style={[containerStyle, style, { opacity: fadeAnim, overflow: 'hidden' }]}>
            <Image
                key={imageKey}
                source={{ uri: coverUrl }}
                style={[styles.image, containerStyle]}
                resizeMode="cover"
            />
            {showOverlay && (
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.6)']}
                    style={styles.overlay}
                />
            )}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    placeholder: {
        backgroundColor: '#faf5ff',
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#f3e8ff',
        borderStyle: 'dashed',
    },
    placeholderInner: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
    iconContainer: {
        marginBottom: 8,
    },
    statusText: {
        color: '#a855f7',
        fontSize: 11,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 4,
    },
    spinner: {
        marginTop: 8,
    },
    sparkle1: {
        position: 'absolute',
        top: 12,
        right: 12,
    },
    sparkle2: {
        position: 'absolute',
        bottom: 20,
        left: 12,
    },
    sparkle3: {
        position: 'absolute',
        top: '40%',
        left: 10,
    },
    hiddenImage: {
        width: 1,
        height: 1,
        position: 'absolute',
        opacity: 0,
    },
    image: {
        borderRadius: 16,
    },
    overlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '50%',
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
});
