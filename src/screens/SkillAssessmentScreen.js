import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Animated,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import { useTheme } from '../context/ThemeContext';
import { Typography, Spacing, BorderRadius, Shadows } from '../theme';
import { assessmentService } from '../services/api';
import { ScreenWrapper, ModernCard, ModernButton, FadeInView } from '../components';

const TOTAL_QUESTIONS = 25;

export default function SkillAssessmentScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { colors: Colors, isDarkMode } = useTheme();

    // Support both formats: individual params or path object
    const params = route.params || {};
    const pathData = params.path || {
        id: params.pathId,
        topic: params.topic,
        expertise_level: params.expertiseLevel || params.expertise_level,
        milestones: params.milestones || [],
        skills: params.skills || [],
    };

    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);
    const [error, setError] = useState(null);

    const progressAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        loadQuestions();
    }, []);

    useEffect(() => {
        // Animate progress bar
        Animated.timing(progressAnim, {
            toValue: ((currentQuestionIndex + 1) / (questions.length || 1)) * 100, // Prevent div by zero
            duration: 300,
            useNativeDriver: false,
        }).start();
    }, [currentQuestionIndex, questions.length]);

    const loadQuestions = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await assessmentService.generateQuestions({
                topic: pathData.topic || 'General',
                expertise_level: pathData.expertise_level || 'beginner',
                milestones: Array.isArray(pathData.milestones)
                    ? pathData.milestones.map(m => typeof m === 'string' ? m : (m.title || m.milestone || ''))
                    : [],
                skills: pathData.skills || [],
                num_questions: TOTAL_QUESTIONS,
            });

            if (response.questions && response.questions.length > 0) {
                setQuestions(response.questions);
            } else {
                throw new Error('No questions received');
            }
        } catch (err) {
            console.error('Error loading questions:', err);
            setError('Failed to generate assessment questions. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectAnswer = (questionIndex, optionIndex) => {
        setSelectedAnswers((prev) => ({
            ...prev,
            [questionIndex]: optionIndex,
        }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prev) => prev - 1);
        }
    };

    const handleSubmit = async () => {
        const answeredCount = Object.keys(selectedAnswers).length;

        if (answeredCount < questions.length) {
            Alert.alert(
                'Incomplete Assessment',
                `You have answered ${answeredCount} of ${questions.length} questions. Do you want to submit anyway?`,
                [
                    { text: 'Continue', style: 'cancel' },
                    { text: 'Submit', onPress: calculateScore },
                ]
            );
        } else {
            calculateScore();
        }
    };

    const calculateScore = async () => {
        setIsSubmitting(true);

        let correct = 0;
        questions.forEach((q, index) => {
            if (selectedAnswers[index] === q.correctAnswer) {
                correct++;
            }
        });

        const percentage = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
        setScore(percentage);

        // Save results to backend
        try {
            await assessmentService.saveResult({
                path_id: pathData.id,
                score: percentage,
                correct_answers: correct,
                total_questions: questions.length,
                answers: selectedAnswers,
            });
        } catch (err) {
            console.error('Error saving assessment result:', err);
        }

        setIsSubmitting(false);
        setShowResults(true);
    };

    const getScoreColor = () => {
        if (score >= 80) return Colors.status.success;
        if (score >= 60) return Colors.accent.orange;
        return Colors.status.error;
    };

    const getScoreMessage = () => {
        if (score >= 90) return { title: 'Excellent! 🏆', message: 'You have mastered this learning path!' };
        if (score >= 80) return { title: 'Great Job! 🌟', message: 'You have a strong understanding of the concepts.' };
        if (score >= 70) return { title: 'Good Work! 👍', message: 'You have a solid grasp of the material.' };
        if (score >= 60) return { title: 'Keep Going! 💪', message: 'Consider reviewing some topics for better mastery.' };
        return { title: 'Keep Learning! 📚', message: 'We recommend revisiting the milestones before retrying.' };
    };

    const handleRetry = () => {
        setShowResults(false);
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setScore(0);
        loadQuestions();
    };

    const handleFinish = () => {
        navigation.goBack();
    };

    // --- RENDER STATES ---

    if (isLoading) {
        return (
            <ScreenWrapper>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={Colors.text.primary} />
                    <Text style={[styles.loadingText, { color: Colors.text.primary }]}>Generating Assessment...</Text>
                    <Text style={[styles.loadingSubtext, { color: Colors.text.secondary }]}>
                        Creating {TOTAL_QUESTIONS} questions based on your learning path
                    </Text>
                </View>
            </ScreenWrapper>
        );
    }

    if (error) {
        return (
            <ScreenWrapper>
                <View style={styles.centerContainer}>
                    <Ionicons name="alert-circle" size={60} color={Colors.status.error} />
                    <Text style={[styles.errorTitle, { color: Colors.text.primary }]}>Oops!</Text>
                    <Text style={[styles.errorText, { color: Colors.text.secondary }]}>{error}</Text>

                    <ModernButton
                        title="Try Again"
                        onPress={loadQuestions}
                        style={styles.retryButton}
                    />

                    <TouchableOpacity style={styles.backLink} onPress={() => navigation.goBack()}>
                        <Text style={[styles.backLinkText, { color: Colors.text.secondary }]}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </ScreenWrapper>
        );
    }

    if (showResults) {
        const { title, message } = getScoreMessage();

        return (
            <ScreenWrapper>
                <ScrollView contentContainerStyle={styles.resultsContainer} showsVerticalScrollIndicator={false}>
                    <FadeInView>
                        <ModernCard style={styles.resultsCard}>
                            <View style={[styles.scoreCircle, { borderColor: getScoreColor() }]}>
                                <Text style={[styles.scoreText, { color: getScoreColor() }]}>{score}%</Text>
                            </View>

                            <Text style={[styles.resultsTitle, { color: Colors.text.primary }]}>{title}</Text>
                            <Text style={[styles.resultsMessage, { color: Colors.text.secondary }]}>{message}</Text>

                            <View style={styles.statsRow}>
                                <View style={styles.statItem}>
                                    <Ionicons name="checkmark-circle" size={24} color={Colors.status.success} />
                                    <Text style={[styles.statValue, { color: Colors.text.primary }]}>
                                        {Object.keys(selectedAnswers).filter(i => selectedAnswers[i] === questions[i]?.correctAnswer).length}
                                    </Text>
                                    <Text style={[styles.statLabel, { color: Colors.text.secondary }]}>Correct</Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Ionicons name="close-circle" size={24} color={Colors.status.error} />
                                    <Text style={[styles.statValue, { color: Colors.text.primary }]}>
                                        {questions.length - Object.keys(selectedAnswers).filter(i => selectedAnswers[i] === questions[i]?.correctAnswer).length}
                                    </Text>
                                    <Text style={[styles.statLabel, { color: Colors.text.secondary }]}>Incorrect</Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Ionicons name="help-circle" size={24} color={Colors.text.secondary} />
                                    <Text style={[styles.statValue, { color: Colors.text.primary }]}>{questions.length}</Text>
                                    <Text style={[styles.statLabel, { color: Colors.text.secondary }]}>Total</Text>
                                </View>
                            </View>

                            {score >= 70 && (
                                <View style={[styles.certificateBanner, { backgroundColor: 'rgba(251, 191, 36, 0.1)' }]}>
                                    <Ionicons name="ribbon" size={24} color={Colors.accent.gold} />
                                    <Text style={[styles.certificateText, { color: Colors.text.primary }]}>
                                        Congratulations! You've earned a skill badge for {pathData.topic}!
                                    </Text>
                                </View>
                            )}
                        </ModernCard>

                        <View style={styles.resultsActions}>
                            {score < 70 && (
                                <ModernButton
                                    title="Retry Assessment"
                                    onPress={handleRetry}
                                    variant="outline"
                                    icon="refresh"
                                />
                            )}
                            <ModernButton
                                title="Finish"
                                onPress={handleFinish}
                                icon="checkmark"
                            />
                        </View>
                    </FadeInView>
                </ScrollView>
            </ScreenWrapper>
        );
    }

    // Quiz State
    const currentQuestion = questions[currentQuestionIndex];

    return (
        <ScreenWrapper>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={[styles.closeButton, { backgroundColor: 'rgba(255,255,255,0.1)' }]}
                    onPress={() => {
                        Alert.alert(
                            'Exit Assessment',
                            'Are you sure you want to exit? Your progress will be lost.',
                            [
                                { text: 'Cancel', style: 'cancel' },
                                { text: 'Exit', style: 'destructive', onPress: () => navigation.goBack() },
                            ]
                        );
                    }}
                >
                    <Ionicons name="close" size={24} color={Colors.text.primary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: Colors.text.primary }]}>Skill Assessment</Text>
                <Text style={[styles.questionCounter, { color: Colors.text.secondary }]}>
                    {currentQuestionIndex + 1}/{questions.length}
                </Text>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
                <View style={[styles.progressBarBg, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                    <Animated.View
                        style={[
                            styles.progressBarFill,
                            {
                                backgroundColor: Colors.primary.main,
                                width: progressAnim.interpolate({
                                    inputRange: [0, 100],
                                    outputRange: ['0%', '100%'],
                                }),
                            },
                        ]}
                    />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <FadeInView key={currentQuestionIndex}>
                    <ModernCard style={styles.questionCard}>
                        <Text style={[styles.questionText, { color: Colors.text.primary }]}>{currentQuestion?.question}</Text>

                        <View style={styles.optionsContainer}>
                            {currentQuestion?.options?.map((option, index) => {
                                const isSelected = selectedAnswers[currentQuestionIndex] === index;

                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.optionButton,
                                            {
                                                backgroundColor: isDarkMode ? '#2a2a2a' : Colors.background.secondary,
                                                borderColor: isSelected ? Colors.primary.main : 'transparent',
                                            },
                                            isSelected && { backgroundColor: isDarkMode ? 'rgba(102, 126, 234, 0.2)' : 'rgba(102, 126, 234, 0.1)' }
                                        ]}
                                        onPress={() => handleSelectAnswer(currentQuestionIndex, index)}
                                        activeOpacity={0.8}
                                    >
                                        <View style={[
                                            styles.optionCircle,
                                            {
                                                borderColor: isDarkMode ? '#555' : Colors.border.dark,
                                                backgroundColor: isDarkMode ? '#333' : '#ffffff'
                                            },
                                            isSelected && { backgroundColor: Colors.primary.main, borderColor: Colors.primary.main }
                                        ]}>
                                            <Text style={[
                                                styles.optionLetter,
                                                { color: Colors.text.primary },
                                                isSelected && { color: '#fff' }
                                            ]}>
                                                {String.fromCharCode(65 + index)}
                                            </Text>
                                        </View>
                                        <Text style={[
                                            styles.optionText,
                                            { color: Colors.text.primary },
                                            isSelected && { color: Colors.primary.main, fontWeight: Typography.fontWeights.medium }
                                        ]}>
                                            {option}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </ModernCard>
                </FadeInView>
            </ScrollView>

            <View style={styles.footer}>
                <View style={styles.navigationContainer}>
                    <TouchableOpacity
                        style={[
                            styles.navButton,
                            { backgroundColor: 'rgba(255,255,255,0.1)' },
                            currentQuestionIndex === 0 && { opacity: 0.5 }
                        ]}
                        onPress={handlePrevious}
                        disabled={currentQuestionIndex === 0}
                    >
                        <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
                        <Text style={[styles.navButtonText, { color: Colors.text.primary }]}>Previous</Text>
                    </TouchableOpacity>

                    {currentQuestionIndex === questions.length - 1 ? (
                        <TouchableOpacity
                            style={{ flex: 1, marginLeft: Spacing.md }}
                            onPress={handleSubmit}
                            disabled={isSubmitting}
                        >
                            <ModernButton
                                title="Submit Assessment"
                                icon={!isSubmitting ? "checkmark-circle" : null}
                                loading={isSubmitting}
                                onPress={handleSubmit}
                            />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={[
                                styles.navButton,
                                styles.nextButton,
                                { backgroundColor: 'rgba(255,255,255,0.2)' }
                            ]}
                            onPress={handleNext}
                        >
                            <Text style={[styles.navButtonText, { color: Colors.text.primary }]}>Next</Text>
                            <Ionicons name="chevron-forward" size={24} color={Colors.text.primary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    loadingText: {
        fontSize: Typography.fontSizes.xl,
        fontWeight: Typography.fontWeights.bold,
        marginTop: Spacing.lg,
    },
    loadingSubtext: {
        fontSize: Typography.fontSizes.md,
        marginTop: Spacing.sm,
        textAlign: 'center',
    },
    errorTitle: {
        fontSize: Typography.fontSizes.xl,
        fontWeight: Typography.fontWeights.bold,
        marginTop: Spacing.lg,
    },
    errorText: {
        fontSize: Typography.fontSizes.md,
        marginTop: Spacing.sm,
        textAlign: 'center',
        marginBottom: Spacing.xl,
    },
    retryButton: {
        width: 200,
    },
    backLink: {
        marginTop: Spacing.lg,
    },
    backLinkText: {
        fontSize: Typography.fontSizes.base,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: Typography.fontSizes.lg,
        fontWeight: Typography.fontWeights.semibold,
    },
    questionCounter: {
        fontSize: Typography.fontSizes.md,
        fontWeight: Typography.fontWeights.medium,
    },
    progressContainer: {
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
    },
    progressBarBg: {
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: Spacing.lg,
        paddingBottom: 100, // Space for footer
    },
    questionCard: {
        borderRadius: BorderRadius.xl,
        padding: Spacing.xl,
    },
    questionText: {
        fontSize: Typography.fontSizes.lg,
        fontWeight: Typography.fontWeights.semibold,
        lineHeight: 28,
        marginBottom: Spacing.xl,
    },
    optionsContainer: {
        gap: Spacing.md,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: BorderRadius.lg,
        padding: Spacing.base, // Reduced padding
        paddingVertical: 12, // Ensure good touch target but cleaner look
        borderWidth: 2,
    },
    optionCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
        borderWidth: 2,
    },
    optionLetter: {
        fontSize: Typography.fontSizes.base,
        fontWeight: Typography.fontWeights.bold,
    },
    optionText: {
        flex: 1,
        fontSize: Typography.fontSizes.base,
        lineHeight: 22,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: Spacing.lg,
        paddingBottom: Spacing.xl, // Safe area
    },
    navigationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    navButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.lg,
    },
    navButtonText: {
        fontSize: Typography.fontSizes.base,
        fontWeight: Typography.fontWeights.medium,
        marginHorizontal: Spacing.xs,
    },
    nextButton: {
        marginLeft: 'auto',
    },

    // Results
    resultsContainer: {
        flexGrow: 1,
        padding: Spacing.lg,
    },
    resultsCard: {
        padding: Spacing.xl,
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    scoreCircle: {
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    scoreText: {
        fontSize: 48,
        fontWeight: Typography.fontWeights.bold,
        color: '#111827', // Dark gray for visibility in light/dark modes
    },
    resultsTitle: {
        fontSize: Typography.fontSizes['2xl'],
        fontWeight: Typography.fontWeights.bold,
        marginBottom: Spacing.sm,
        color: '#111827',
    },
    resultsMessage: {
        fontSize: Typography.fontSizes.md,
        textAlign: 'center',
        marginBottom: Spacing.xl,
        color: '#4B5563',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: Spacing.lg,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: Typography.fontSizes.xl,
        fontWeight: Typography.fontWeights.bold,
        marginTop: Spacing.xs,
        color: '#111827',
    },
    statLabel: {
        fontSize: Typography.fontSizes.sm,
        color: '#4B5563',
    },
    certificateBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.base,
        borderRadius: BorderRadius.lg,
        marginTop: Spacing.md,
    },
    certificateText: {
        flex: 1,
        marginLeft: Spacing.sm,
        fontSize: Typography.fontSizes.sm,
        fontWeight: Typography.fontWeights.medium,
    },
    resultsActions: {
        gap: Spacing.md,
    },
});

