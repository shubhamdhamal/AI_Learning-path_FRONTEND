import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const GENERATION_STEPS = [
    {
        id: 'analyzing',
        label: 'Analyzing Topic',
        icon: 'search-outline',
        description: 'Understanding your learning goals...',
        duration: 3000,
    },
    {
        id: 'researching',
        label: 'Researching Resources',
        icon: 'library-outline',
        description: 'Finding the best learning materials...',
        duration: 4000,
    },
    {
        id: 'market',
        label: 'Job Market Analysis',
        icon: 'briefcase-outline',
        description: 'Gathering industry insights...',
        duration: 3500,
    },
    {
        id: 'generating',
        label: 'Generating Path',
        icon: 'sparkles-outline',
        description: 'Creating your personalized curriculum...',
        duration: 4500,
    },
    {
        id: 'finalizing',
        label: 'Finalizing',
        icon: 'checkmark-circle-outline',
        description: 'Putting finishing touches...',
        duration: 2000,
    },
];

export default function GenerationProgress({ isVisible, onCancel, topic }) {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    // Animation values
    const overlayOpacity = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const progressWidth = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const spinAnim = useRef(new Animated.Value(0)).current;
    const stepAnimations = useRef(GENERATION_STEPS.map(() => new Animated.Value(0))).current;

    // Show/hide overlay
    useEffect(() => {
        if (isVisible) {
            setCurrentStepIndex(0);
            setIsComplete(false);
            progressWidth.setValue(0);
            stepAnimations.forEach(anim => anim.setValue(0));

            Animated.parallel([
                Animated.timing(overlayOpacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 8,
                    tension: 40,
                    useNativeDriver: true,
                }),
            ]).start();

            startStepAnimation(0);
        } else {
            Animated.timing(overlayOpacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [isVisible]);

    // Pulse animation for current step
    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.15,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, []);

    // Spin animation for loading icon
    useEffect(() => {
        const spin = Animated.loop(
            Animated.timing(spinAnim, {
                toValue: 1,
                duration: 1500,
                useNativeDriver: true,
            })
        );
        spin.start();
        return () => spin.stop();
    }, []);

    const startStepAnimation = (stepIndex) => {
        if (stepIndex >= GENERATION_STEPS.length) {
            setIsComplete(true);
            return;
        }

        const step = GENERATION_STEPS[stepIndex];
        const progressPerStep = 100 / GENERATION_STEPS.length;
        const targetProgress = (stepIndex + 1) * progressPerStep;

        // Animate step icon appearing
        Animated.spring(stepAnimations[stepIndex], {
            toValue: 1,
            friction: 6,
            tension: 50,
            useNativeDriver: true,
        }).start();

        // Animate progress bar
        Animated.timing(progressWidth, {
            toValue: targetProgress,
            duration: step.duration,
            useNativeDriver: false,
        }).start(() => {
            if (stepIndex < GENERATION_STEPS.length - 1) {
                setCurrentStepIndex(stepIndex + 1);
                startStepAnimation(stepIndex + 1);
            } else {
                setIsComplete(true);
            }
        });
    };

    const spin = spinAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    if (!isVisible) return null;

    return (
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
            <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
                {/* Header with spinning icon */}
                <View style={styles.header}>
                    <Animated.View style={{ transform: [{ rotate: spin }] }}>
                        <LinearGradient
                            colors={Colors.gradients.primary}
                            style={styles.iconContainer}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Ionicons name="sync" size={32} color={Colors.text.primary} />
                        </LinearGradient>
                    </Animated.View>
                    <Text style={styles.title}>
                        {isComplete ? 'Almost Done!' : 'Generating Your Path'}
                    </Text>
                    <Text style={styles.topicText} numberOfLines={1}>
                        {topic}
                    </Text>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressBarContainer}>
                    <View style={styles.progressBarBackground}>
                        <Animated.View
                            style={[
                                styles.progressBarFill,
                                {
                                    width: progressWidth.interpolate({
                                        inputRange: [0, 100],
                                        outputRange: ['0%', '100%'],
                                    }),
                                },
                            ]}
                        >
                            <LinearGradient
                                colors={Colors.gradients.primary}
                                style={styles.progressGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            />
                        </Animated.View>
                    </View>
                    <Animated.Text style={styles.progressPercent}>
                        {progressWidth.interpolate({
                            inputRange: [0, 100],
                            outputRange: ['0%', '100%'],
                            extrapolate: 'clamp',
                        })}
                    </Animated.Text>
                </View>

                {/* Steps List */}
                <View style={styles.stepsContainer}>
                    {GENERATION_STEPS.map((step, index) => {
                        const isActive = index <= currentStepIndex;
                        const isCurrent = index === currentStepIndex;
                        const isCompleted = index < currentStepIndex || isComplete;

                        return (
                            <Animated.View
                                key={step.id}
                                style={[
                                    styles.stepRow,
                                    {
                                        opacity: stepAnimations[index].interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0.4, 1],
                                        }),
                                        transform: [
                                            {
                                                translateX: stepAnimations[index].interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [-20, 0],
                                                }),
                                            },
                                        ],
                                    },
                                ]}
                            >
                                <Animated.View
                                    style={[
                                        styles.stepIconContainer,
                                        isActive && styles.stepIconActive,
                                        isCompleted && styles.stepIconCompleted,
                                        isCurrent && !isComplete && { transform: [{ scale: pulseAnim }] },
                                    ]}
                                >
                                    <Ionicons
                                        name={isCompleted ? 'checkmark' : step.icon}
                                        size={18}
                                        color={isActive ? Colors.text.primary : Colors.text.muted}
                                    />
                                </Animated.View>
                                <View style={styles.stepContent}>
                                    <Text style={[
                                        styles.stepLabel,
                                        isActive && styles.stepLabelActive,
                                        isCurrent && !isComplete && styles.stepLabelCurrent,
                                    ]}>
                                        {step.label}
                                    </Text>
                                    {isCurrent && !isComplete && (
                                        <Text style={styles.stepDescription}>{step.description}</Text>
                                    )}
                                </View>
                                {isCompleted && (
                                    <Ionicons name="checkmark-circle" size={20} color={Colors.status.success} />
                                )}
                            </Animated.View>
                        );
                    })}
                </View>

                {/* Cancel Button */}
                <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                    <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>

                {/* Fun fact / tip */}
                <View style={styles.tipContainer}>
                    <Ionicons name="bulb-outline" size={16} color={Colors.text.darkSecondary} />
                    <Text style={styles.tipText}>
                        Tip: Learning paths include resources from courses, tutorials, and documentation
                    </Text>
                </View>
            </Animated.View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    container: {
        backgroundColor: '#ffffff',
        borderRadius: BorderRadius.xl,
        padding: Spacing.xl,
        width: SCREEN_WIDTH - 48,
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    title: {
        fontSize: Typography.fontSizes.xl,
        fontWeight: Typography.fontWeights.bold,
        color: Colors.text.dark,
        marginBottom: Spacing.xs,
    },
    topicText: {
        fontSize: Typography.fontSizes.md,
        color: Colors.primary.main,
        fontWeight: Typography.fontWeights.medium,
    },
    progressBarContainer: {
        marginBottom: Spacing.xl,
    },
    progressBarBackground: {
        height: 8,
        backgroundColor: Colors.background.secondary,
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: Spacing.sm,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressGradient: {
        flex: 1,
    },
    progressPercent: {
        fontSize: Typography.fontSizes.sm,
        color: Colors.text.darkSecondary,
        textAlign: 'right',
        fontWeight: Typography.fontWeights.semibold,
    },
    stepsContainer: {
        marginBottom: Spacing.lg,
    },
    stepRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.background.secondary,
    },
    stepIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.background.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    stepIconActive: {
        backgroundColor: Colors.primary.main,
    },
    stepIconCompleted: {
        backgroundColor: Colors.status.success,
    },
    stepContent: {
        flex: 1,
    },
    stepLabel: {
        fontSize: Typography.fontSizes.base,
        color: Colors.text.muted,
        fontWeight: Typography.fontWeights.medium,
    },
    stepLabelActive: {
        color: Colors.text.dark,
    },
    stepLabelCurrent: {
        color: Colors.primary.main,
        fontWeight: Typography.fontWeights.semibold,
    },
    stepDescription: {
        fontSize: Typography.fontSizes.sm,
        color: Colors.text.darkSecondary,
        marginTop: 2,
    },
    cancelButton: {
        alignItems: 'center',
        paddingVertical: Spacing.md,
        marginBottom: Spacing.md,
    },
    cancelText: {
        fontSize: Typography.fontSizes.base,
        color: Colors.status.error,
        fontWeight: Typography.fontWeights.medium,
    },
    tipContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background.secondary,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
    },
    tipText: {
        flex: 1,
        fontSize: Typography.fontSizes.sm,
        color: Colors.text.darkSecondary,
        marginLeft: Spacing.sm,
        lineHeight: 18,
    },
});
