import React, { useMemo, useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Image,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { ScreenWrapper, FadeInView, ModernCard, ModernButton } from '../components';
import { Typography, Spacing, BorderRadius } from '../theme';
import { trendingService } from '../services/api';

const { width } = Dimensions.get('window');

const FEATURES = [
    {
        icon: 'sparkles',
        title: 'AI-Powered Paths',
        description: 'Get personalized learning paths tailored to your goals',
        color: '#8B5CF6',
    },
    {
        icon: 'trending-up',
        title: 'Track Progress',
        description: 'Monitor your learning journey with detailed analytics',
        color: '#06B6D4',
    },
    {
        icon: 'book',
        title: 'Curated Resources',
        description: 'Access hand-picked courses, articles, and tutorials',
        color: '#10B981',
    },
    {
        icon: 'trophy',
        title: 'Skill Assessment',
        description: 'Test your knowledge with AI-generated quizzes',
        color: '#F59E0B',
    },
];

export default function HomeScreen({ navigation }) {
    const { colors: Colors, isDarkMode } = useTheme();
    const { user } = useAuth();
    const styles = useMemo(() => createStyles(Colors, isDarkMode), [Colors, isDarkMode]);

    const [trendingTechs, setTrendingTechs] = useState([]);
    const [isLoadingTrending, setIsLoadingTrending] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);

    const userName = user?.name || user?.username || 'Learner';
    const greeting = getGreeting();

    function getGreeting() {
        return 'Hey! there';
    }

    // Fetch trending technologies on mount
    useEffect(() => {
        fetchTrendingTechnologies();
    }, []);

    const fetchTrendingTechnologies = async () => {
        try {
            setIsLoadingTrending(true);
            const data = await trendingService.getTrendingTechnologies(10);
            setTrendingTechs(data);
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Error fetching trending:', error);
        } finally {
            setIsLoadingTrending(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        trendingService.clearCache(); // Clear cache to get fresh data
        await fetchTrendingTechnologies();
        setRefreshing(false);
    };

    const formatLastUpdated = () => {
        if (!lastUpdated) return '';
        return `Updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    };

    return (
        <ScreenWrapper colors={Colors.gradients.pageBackground}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={Colors.primary.main}
                        colors={[Colors.primary.main]}
                    />
                }
            >
                {/* Header Section */}
                <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.header}>
                    <View style={styles.greetingContainer}>
                        <Text style={styles.greeting}>{greeting},</Text>
                        <Text style={styles.userName}>{userName}! 👋</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.notificationButton}
                        onPress={() => navigation.navigate('Settings')}
                    >
                        <Ionicons name="settings-outline" size={24} color={Colors.text.primary} />
                    </TouchableOpacity>
                </Animated.View>

                {/* Hero Card */}
                <Animated.View entering={FadeInDown.delay(200).duration(600)}>
                    <LinearGradient
                        colors={['#06B6D4', '#0891B2', '#0E7490']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.heroCard}
                    >
                        <View style={styles.heroContent}>
                            <Text style={styles.heroTitle}>Start Your Learning Journey</Text>
                            <Text style={styles.heroSubtitle}>
                                Create personalized AI-powered learning paths and master new skills
                            </Text>
                            <TouchableOpacity
                                style={styles.heroButton}
                                onPress={() => navigation.navigate('MainTabs', { screen: 'GenerateTab' })}
                            >
                                <Text style={styles.heroButtonText}>Create Learning Path</Text>
                                <Ionicons name="arrow-forward" size={20} color="#06B6D4" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.heroIconContainer}>
                            <Ionicons name="rocket" size={80} color="rgba(255,255,255,0.3)" />
                        </View>
                    </LinearGradient>
                </Animated.View>

                {/* Quick Actions */}
                <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.quickActions}>
                    <TouchableOpacity
                        style={[styles.quickActionCard, { backgroundColor: isDarkMode ? '#1e3a2f' : '#dcfce7' }]}
                        onPress={() => navigation.navigate('MainTabs', { screen: 'DashboardTab' })}
                    >
                        <View style={[styles.quickActionIcon, { backgroundColor: '#22c55e' }]}>
                            <Ionicons name="library" size={24} color="#fff" />
                        </View>
                        <Text style={styles.quickActionText}>My Paths</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.quickActionCard, { backgroundColor: isDarkMode ? '#1e293b' : '#fef3c7' }]}
                        onPress={() => navigation.navigate('MainTabs', { screen: 'GenerateTab' })}
                    >
                        <View style={[styles.quickActionIcon, { backgroundColor: '#F59E0B' }]}>
                            <Ionicons name="add-circle" size={24} color="#fff" />
                        </View>
                        <Text style={styles.quickActionText}>New Path</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.quickActionCard, { backgroundColor: isDarkMode ? '#1e293b' : '#fce7f3' }]}
                        onPress={() => navigation.navigate('MainTabs', { screen: 'ProfileTab' })}
                    >
                        <View style={[styles.quickActionIcon, { backgroundColor: '#EC4899' }]}>
                            <Ionicons name="person" size={24} color="#fff" />
                        </View>
                        <Text style={styles.quickActionText}>Profile</Text>
                    </TouchableOpacity>
                </Animated.View>

                {/* Trending Technologies Section */}
                <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleRow}>
                            <Text style={styles.sectionTitle}>🔥 Trending Technologies</Text>
                            <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
                                <Ionicons name="refresh" size={18} color={Colors.text.secondary} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.sectionSubtitle}>
                            Based on Stack Overflow activity • {formatLastUpdated()}
                        </Text>
                    </View>

                    <ModernCard variant="glass" style={styles.trendingCard}>
                        {isLoadingTrending ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={Colors.primary.main} />
                                <Text style={styles.loadingText}>Fetching trending data...</Text>
                            </View>
                        ) : trendingTechs.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="cloud-offline" size={40} color={Colors.text.secondary} />
                                <Text style={styles.emptyText}>Unable to load trends</Text>
                                <TouchableOpacity onPress={onRefresh} style={styles.retryButton}>
                                    <Text style={styles.retryText}>Tap to retry</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            trendingTechs.map((tech, index) => (
                                <View
                                    key={tech.tag || tech.name}
                                    style={[
                                        styles.trendingItem,
                                        index === trendingTechs.length - 1 && styles.trendingItemLast,
                                    ]}
                                >
                                    <View style={styles.trendingLeft}>
                                        <Text style={styles.trendingRank}>#{index + 1}</Text>
                                        <View style={[styles.trendingIconContainer, { backgroundColor: tech.color + '20' }]}>
                                            <Ionicons name={tech.icon} size={20} color={tech.color} />
                                        </View>
                                        <View style={styles.trendingInfo}>
                                            <Text style={styles.trendingName}>{tech.name}</Text>
                                            {tech.count && (
                                                <Text style={styles.trendingCount}>
                                                    {(tech.count / 1000000).toFixed(1)}M+ questions
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                    <View style={styles.trendingRight}>
                                        <View style={styles.progressBarContainer}>
                                            <View
                                                style={[
                                                    styles.progressBar,
                                                    { width: `${tech.growth}%`, backgroundColor: tech.color }
                                                ]}
                                            />
                                        </View>
                                        <Text style={[styles.trendingGrowth, { color: tech.color }]}>
                                            {tech.growth}%
                                        </Text>
                                    </View>
                                </View>
                            ))
                        )}
                    </ModernCard>
                </Animated.View>

                {/* Features Section */}
                <Animated.View entering={FadeInDown.delay(500).duration(600)} style={styles.section}>
                    <Text style={styles.sectionTitle}>✨ Features</Text>

                    <View style={styles.featuresGrid}>
                        {FEATURES.map((feature, index) => (
                            <ModernCard key={feature.title} variant="glass" style={styles.featureCard}>
                                <View style={[styles.featureIcon, { backgroundColor: feature.color + '20' }]}>
                                    <Ionicons name={feature.icon} size={24} color={feature.color} />
                                </View>
                                <Text style={styles.featureTitle}>{feature.title}</Text>
                                <Text style={styles.featureDescription}>{feature.description}</Text>
                            </ModernCard>
                        ))}
                    </View>
                </Animated.View>

                {/* CTA Section */}
                <Animated.View entering={FadeInDown.delay(600).duration(600)} style={styles.ctaSection}>
                    <ModernCard variant="elevated" style={styles.ctaCard}>
                        <Text style={styles.ctaTitle}>Ready to level up your skills?</Text>
                        <Text style={styles.ctaSubtitle}>
                            Create your first AI-powered learning path today
                        </Text>
                        <ModernButton
                            title="Get Started"
                            onPress={() => navigation.navigate('MainTabs', { screen: 'GenerateTab' })}
                            variant="primary"
                            size="large"
                            icon="arrow-forward"
                            style={styles.ctaButton}
                        />
                    </ModernCard>
                </Animated.View>

                <View style={styles.bottomSpacing} />
            </ScrollView>
        </ScreenWrapper>
    );
}

const createStyles = (Colors, isDarkMode) =>
    StyleSheet.create({
        scrollContent: {
            paddingHorizontal: Spacing.lg,
            paddingTop: Spacing.xl,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: Spacing.xl,
        },
        greetingContainer: {
            flex: 1,
        },
        greeting: {
            fontSize: Typography.fontSizes.md,
            color: Colors.text.secondary,
            fontWeight: '500',
        },
        userName: {
            fontSize: Typography.fontSizes['2xl'],
            color: Colors.text.primary,
            fontWeight: '700',
        },
        notificationButton: {
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        heroCard: {
            borderRadius: BorderRadius.xl,
            padding: Spacing.xl,
            marginBottom: Spacing.xl,
            flexDirection: 'row',
            overflow: 'hidden',
        },
        heroContent: {
            flex: 1,
            zIndex: 1,
        },
        heroTitle: {
            fontSize: Typography.fontSizes.xl,
            fontWeight: '700',
            color: '#fff',
            marginBottom: Spacing.sm,
        },
        heroSubtitle: {
            fontSize: Typography.fontSizes.sm,
            color: 'rgba(255,255,255,0.8)',
            marginBottom: Spacing.lg,
            lineHeight: 20,
        },
        heroButton: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#fff',
            paddingHorizontal: Spacing.lg,
            paddingVertical: Spacing.md,
            borderRadius: BorderRadius.lg,
            alignSelf: 'flex-start',
            gap: Spacing.sm,
        },
        heroButtonText: {
            fontSize: Typography.fontSizes.sm,
            fontWeight: '600',
            color: '#06B6D4',
        },
        heroIconContainer: {
            position: 'absolute',
            right: -10,
            bottom: -10,
        },
        quickActions: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: Spacing.xl,
            gap: Spacing.md,
        },
        quickActionCard: {
            flex: 1,
            alignItems: 'center',
            padding: Spacing.lg,
            borderRadius: BorderRadius.lg,
        },
        quickActionIcon: {
            width: 48,
            height: 48,
            borderRadius: 24,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: Spacing.sm,
        },
        quickActionText: {
            fontSize: Typography.fontSizes.xs,
            fontWeight: '600',
            color: Colors.text.primary,
        },
        section: {
            marginBottom: Spacing.xl,
        },
        sectionHeader: {
            marginBottom: Spacing.md,
        },
        sectionTitleRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        sectionTitle: {
            fontSize: Typography.fontSizes.lg,
            fontWeight: '700',
            color: Colors.text.primary,
            marginBottom: Spacing.xs,
        },
        sectionSubtitle: {
            fontSize: Typography.fontSizes.xs,
            color: Colors.text.secondary,
        },
        refreshButton: {
            padding: Spacing.xs,
        },
        trendingCard: {
            padding: Spacing.lg,
            marginTop: Spacing.sm,
        },
        loadingContainer: {
            padding: Spacing.xl,
            alignItems: 'center',
        },
        loadingText: {
            marginTop: Spacing.md,
            fontSize: Typography.fontSizes.sm,
            color: Colors.text.secondary,
        },
        emptyContainer: {
            padding: Spacing.xl,
            alignItems: 'center',
        },
        emptyText: {
            marginTop: Spacing.md,
            fontSize: Typography.fontSizes.sm,
            color: Colors.text.secondary,
        },
        retryButton: {
            marginTop: Spacing.md,
            padding: Spacing.sm,
        },
        retryText: {
            fontSize: Typography.fontSizes.sm,
            color: Colors.primary.main,
            fontWeight: '600',
        },
        trendingItem: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: Spacing.md,
            paddingHorizontal: Spacing.xs,
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
        },
        trendingItemLast: {
            borderBottomWidth: 0,
        },
        trendingLeft: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
        },
        trendingRank: {
            fontSize: Typography.fontSizes.xs,
            fontWeight: '700',
            color: Colors.text.secondary,
            width: 24,
        },
        trendingIconContainer: {
            width: 36,
            height: 36,
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: Spacing.sm,
        },
        trendingInfo: {
            flex: 1,
        },
        trendingName: {
            fontSize: Typography.fontSizes.sm,
            fontWeight: '600',
            color: Colors.text.primary,
        },
        trendingCount: {
            fontSize: Typography.fontSizes.xs,
            color: Colors.text.secondary,
            marginTop: 2,
        },
        trendingRight: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
            justifyContent: 'flex-end',
        },
        progressBarContainer: {
            width: 80,
            height: 6,
            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            borderRadius: 3,
            marginRight: Spacing.sm,
            overflow: 'hidden',
        },
        progressBar: {
            height: '100%',
            borderRadius: 3,
        },
        trendingGrowth: {
            fontSize: Typography.fontSizes.sm,
            fontWeight: '700',
            width: 50,
            textAlign: 'right',
        },
        featuresGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            gap: Spacing.md,
        },
        featureCard: {
            width: (width - Spacing.lg * 2 - Spacing.md) / 2,
            padding: Spacing.lg,
            alignItems: 'center',
        },
        featureIcon: {
            width: 48,
            height: 48,
            borderRadius: 16,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: Spacing.md,
        },
        featureTitle: {
            fontSize: Typography.fontSizes.sm,
            fontWeight: '700',
            color: Colors.text.primary,
            marginBottom: Spacing.xs,
            textAlign: 'center',
        },
        featureDescription: {
            fontSize: Typography.fontSizes.xs,
            color: Colors.text.secondary,
            textAlign: 'center',
            lineHeight: 16,
        },
        ctaSection: {
            marginTop: Spacing.md,
        },
        ctaCard: {
            padding: Spacing.xl,
            alignItems: 'center',
        },
        ctaTitle: {
            fontSize: Typography.fontSizes.lg,
            fontWeight: '700',
            color: Colors.text.primary,
            textAlign: 'center',
            marginBottom: Spacing.sm,
        },
        ctaSubtitle: {
            fontSize: Typography.fontSizes.sm,
            color: Colors.text.secondary,
            textAlign: 'center',
            marginBottom: Spacing.lg,
        },
        ctaButton: {
            minWidth: 200,
        },
        bottomSpacing: {
            height: 40,
        },
    });
