import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
    Animated,
    Easing,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface GeneratingBookModalProps {
    visible: boolean;
    progress: number; // 0-100
    currentStep: 'story' | 'cover' | 'pdf' | 'complete';
}

const LOADING_MESSAGES = [
    { text: "Sprinkling fairy dust...", icon: "sparkles" },
    { text: "Waking up the dragons...", icon: "flame" },
    { text: "Opening the magic portal...", icon: "planet" },
    { text: "Gathering starlight...", icon: "star" },
    { text: "Teaching unicorns to read...", icon: "heart" },
    { text: "Mixing imagination potion...", icon: "flask" },
    { text: "Painting rainbow dreams...", icon: "color-palette" },
    { text: "Whispering to moonbeams...", icon: "moon" },
    { text: "Catching dream butterflies...", icon: "bug" },
    { text: "Brewing magical stories...", icon: "cafe" },
];

const STEP_INFO = {
    story: { label: "Creating your story", progress: 30 },
    cover: { label: "Designing magical cover", progress: 70 },
    pdf: { label: "Crafting your book", progress: 90 },
    complete: { label: "Your story is ready!", progress: 100 },
};

export default function GeneratingBookModal({ visible, progress, currentStep }: GeneratingBookModalProps) {
    const [messageIndex, setMessageIndex] = useState(0);
    const spinAnim = useRef(new Animated.Value(0)).current;
    const floatAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(1)).current;

    // Rotate animation
    useEffect(() => {
        if (visible) {
            Animated.loop(
                Animated.timing(spinAnim, {
                    toValue: 1,
                    duration: 3000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            ).start();

            // Float animation
            Animated.loop(
                Animated.sequence([
                    Animated.timing(floatAnim, {
                        toValue: 1,
                        duration: 1500,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(floatAnim, {
                        toValue: 0,
                        duration: 1500,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }
    }, [visible]);

    // Rotate messages
    useEffect(() => {
        if (visible) {
            const interval = setInterval(() => {
                Animated.sequence([
                    Animated.timing(fadeAnim, {
                        toValue: 0,
                        duration: 200,
                        useNativeDriver: true,
                    }),
                    Animated.timing(fadeAnim, {
                        toValue: 1,
                        duration: 200,
                        useNativeDriver: true,
                    }),
                ]).start();

                setTimeout(() => {
                    setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
                }, 200);
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [visible]);

    const spin = spinAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const translateY = floatAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -10],
    });

    const currentMessage = LOADING_MESSAGES[messageIndex];
    const stepInfo = STEP_INFO[currentStep];

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Animated Icon */}
                    <Animated.View style={[styles.iconContainer, { transform: [{ translateY }] }]}>
                        <Animated.View style={{ transform: [{ rotate: spin }] }}>
                            <View style={styles.iconOuter}>
                                <Ionicons name="book" size={48} color="#a855f7" />
                            </View>
                        </Animated.View>

                        {/* Floating sparkles */}
                        <View style={styles.sparkleContainer}>
                            <Ionicons name="sparkles" size={20} color="#f9a8d4" style={styles.sparkle1} />
                            <Ionicons name="star" size={16} color="#fcd34d" style={styles.sparkle2} />
                            <Ionicons name="sparkles" size={18} color="#c084fc" style={styles.sparkle3} />
                        </View>
                    </Animated.View>

                    {/* Title */}
                    <Text style={styles.title}>Creating Magic ✨</Text>

                    {/* Current step */}
                    <Text style={styles.stepText}>{stepInfo.label}</Text>

                    {/* Progress Bar */}
                    <View style={styles.progressContainer}>
                        <View style={styles.progressBackground}>
                            <View style={[styles.progressFill, { width: `${progress}%` }]} />
                        </View>
                        <Text style={styles.progressText}>{Math.round(progress)}%</Text>
                    </View>

                    {/* Rotating Message */}
                    <Animated.View style={[styles.messageContainer, { opacity: fadeAnim }]}>
                        <Ionicons name={currentMessage.icon as any} size={20} color="#a855f7" />
                        <Text style={styles.messageText}>{currentMessage.text}</Text>
                    </Animated.View>

                    {/* Steps indicator */}
                    <View style={styles.stepsContainer}>
                        <View style={[styles.stepDot, currentStep !== 'story' && styles.stepDotDone]}>
                            {currentStep !== 'story' ? (
                                <Ionicons name="checkmark" size={12} color="#fff" />
                            ) : (
                                <View style={styles.stepDotActive} />
                            )}
                        </View>
                        <View style={[styles.stepLine, progress > 30 && styles.stepLineDone]} />
                        <View style={[styles.stepDot, (currentStep === 'pdf' || currentStep === 'complete') && styles.stepDotDone]}>
                            {(currentStep === 'pdf' || currentStep === 'complete') ? (
                                <Ionicons name="checkmark" size={12} color="#fff" />
                            ) : currentStep === 'cover' ? (
                                <View style={styles.stepDotActive} />
                            ) : null}
                        </View>
                        <View style={[styles.stepLine, progress > 70 && styles.stepLineDone]} />
                        <View style={[styles.stepDot, currentStep === 'complete' && styles.stepDotDone]}>
                            {currentStep === 'complete' ? (
                                <Ionicons name="checkmark" size={12} color="#fff" />
                            ) : currentStep === 'pdf' ? (
                                <View style={styles.stepDotActive} />
                            ) : null}
                        </View>
                    </View>

                    <View style={styles.stepsLabels}>
                        <Text style={styles.stepLabel}>Story</Text>
                        <Text style={styles.stepLabel}>Cover</Text>
                        <Text style={styles.stepLabel}>Book</Text>
                    </View>

                    {/* Warning Message */}
                    <View style={styles.warningContainer}>
                        <Ionicons name="time-outline" size={16} color="#fbbf24" />
                        <Text style={styles.warningText}>
                            This process takes 1-2 minutes.{'\n'}Please don't close the app.
                        </Text>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    container: {
        width: width - 48,
        backgroundColor: '#1a1025',
        borderRadius: 28,
        padding: 32,
        alignItems: 'center',
        shadowColor: '#a855f7',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.35,
        shadowRadius: 24,
        elevation: 20,
    },
    iconContainer: {
        position: 'relative',
        marginBottom: 24,
    },
    iconOuter: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#241a35',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#3d2a5c',
    },
    sparkleContainer: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    sparkle1: {
        position: 'absolute',
        top: -5,
        right: 5,
    },
    sparkle2: {
        position: 'absolute',
        bottom: 10,
        left: -5,
    },
    sparkle3: {
        position: 'absolute',
        top: 20,
        left: -10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#f9fafb',
        marginBottom: 8,
    },
    stepText: {
        fontSize: 16,
        color: '#a855f7',
        fontWeight: '600',
        marginBottom: 20,
    },
    progressContainer: {
        width: '100%',
        marginBottom: 24,
    },
    progressBackground: {
        width: '100%',
        height: 12,
        backgroundColor: '#241a35',
        borderRadius: 6,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#a855f7',
        borderRadius: 6,
    },
    progressText: {
        fontSize: 14,
        color: '#a855f7',
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 8,
    },
    messageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#241a35',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 20,
        marginBottom: 24,
    },
    messageText: {
        fontSize: 14,
        color: '#c084fc',
        marginLeft: 10,
        fontWeight: '500',
    },
    stepsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    stepDot: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#3d2a5c',
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepDotDone: {
        backgroundColor: '#a855f7',
    },
    stepDotActive: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#a855f7',
    },
    stepLine: {
        width: 40,
        height: 3,
        backgroundColor: '#3d2a5c',
        marginHorizontal: 4,
    },
    stepLineDone: {
        backgroundColor: '#a855f7',
    },
    stepsLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 180,
    },
    stepLabel: {
        fontSize: 11,
        color: '#9ca3af',
        fontWeight: '600',
    },
    warningContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 20,
        borderWidth: 1,
        borderColor: 'rgba(251, 191, 36, 0.3)',
    },
    warningText: {
        fontSize: 12,
        color: '#fbbf24',
        marginLeft: 8,
        textAlign: 'center',
        lineHeight: 18,
    },
});
