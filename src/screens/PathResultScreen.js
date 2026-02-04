import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import useLearningPathStore from '../store/learningPathStore';
import { downloadLearningPathPDF } from '../utils/pdfGenerator';
import { useTheme } from '../context/ThemeContext';
import { ScreenWrapper, FadeInView, ModernCard, ModernButton } from '../components';
import { Typography, Spacing, BorderRadius, Shadows } from '../theme';

export default function PathResultScreen({ navigation, route }) {
  const { colors: Colors, isDarkMode } = useTheme();
  const styles = useMemo(() => createStyles(Colors, isDarkMode), [Colors, isDarkMode]);
  const { currentPath, savePath, resetGeneration, setCurrentPath } = useLearningPathStore();
  const [expandedMilestones, setExpandedMilestones] = useState([0]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);

  // If path is passed via navigation params, set it in store
  useEffect(() => {
    if (route?.params?.path && !currentPath) {
      setCurrentPath(route.params.path);
    }
  }, [route?.params?.path]);

  // Use path from params if currentPath not yet set
  const pathData = currentPath || route?.params?.path;

  if (!pathData) {
    return (
      <ScreenWrapper colors={Colors.gradients.pageBackground}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={60} color={Colors.text.secondary} />
          <Text style={styles.errorText}>No learning path available</Text>
          <ModernButton
            variant="primary"
            onPress={() => {
              resetGeneration();
              navigation.navigate('GenerateTab');
            }}
            style={styles.errorButton}
          >
            <Text style={styles.errorButtonText}>Generate New Path</Text>
          </ModernButton>
        </View>
      </ScreenWrapper>
    );
  }

  const toggleMilestone = (index) => {
    setExpandedMilestones((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');

    const result = await savePath();

    setIsSaving(false);
    if (result.success) {
      setSaveMessage('Saved successfully!');
      Alert.alert('Success', 'Learning path saved to your dashboard.', [
        {
          text: 'View Dashboard',
          onPress: () => {
            resetGeneration();
            // Navigate to MainTabs and then to DashboardTab
            navigation.navigate('MainTabs', { screen: 'DashboardTab' });
          },
        },
        { text: 'Stay Here' },
      ]);
    } else {
      setSaveMessage('Failed to save');
    }
  };

  const handleCreateNew = () => {
    resetGeneration();
    navigation.navigate('MainTabs', { screen: 'GenerateTab' });
  };

  const handleDownloadPDF = async () => {
    if (!pathData) return;

    setIsDownloadingPDF(true);
    try {
      const result = await downloadLearningPathPDF(pathData);
      if (result.success) {
        Alert.alert('Success', result.message);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  return (
    <ScreenWrapper
      style={styles.screenWrapper}
      colors={Colors.gradients.pageBackground}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Learning Path</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleDownloadPDF}
            disabled={isDownloadingPDF}
          >
            <Ionicons
              name={isDownloadingPDF ? 'hourglass-outline' : 'download-outline'}
              size={24}
              color={Colors.text.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, { marginLeft: 8 }]}
            onPress={handleSave}
            disabled={isSaving}
          >
            <Ionicons
              name={saveMessage === 'Saved successfully!' ? 'checkmark-circle' : 'bookmark-outline'}
              size={24}
              color={Colors.text.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Card */}
        <FadeInView delay={100} duration={600}>
          <ModernCard variant="filled" style={styles.summaryCard}>
            <Text style={styles.pathTitle}>
              {pathData.title || `${pathData.topic} Learning Path`}
            </Text>
            {pathData.description && (
              <Text style={styles.pathDescription}>{pathData.description}</Text>
            )}

            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Ionicons name="time-outline" size={24} color={Colors.primary.main} />
                <Text style={styles.statValue}>{pathData.total_hours || 0}</Text>
                <Text style={styles.statLabel}>Hours</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="calendar-outline" size={24} color={Colors.primary.main} />
                <Text style={styles.statValue}>{pathData.duration_weeks || 0}</Text>
                <Text style={styles.statLabel}>Weeks</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="trending-up-outline" size={24} color={Colors.primary.main} />
                <Text style={styles.statValue}>{pathData.expertise_level}</Text>
                <Text style={styles.statLabel}>Level</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="flag-outline" size={24} color={Colors.primary.main} />
                <Text style={styles.statValue}>{pathData.milestones?.length || 0}</Text>
                <Text style={styles.statLabel}>Milestones</Text>
              </View>
            </View>
          </ModernCard>
        </FadeInView>

        {/* Save Prompt Banner */}
        <FadeInView delay={150} duration={500}>
          <View style={styles.savePromptBanner}>
            <Ionicons name="information-circle" size={20} color={Colors.primary.main} />
            <Text style={styles.savePromptText}>
              Click <Text style={styles.savePromptBold}>Save Path</Text> below to save this learning path and complete it later!
            </Text>
          </View>
        </FadeInView>

        {/* Weekly Learning Plan */}
        <FadeInView delay={200} duration={600} slideDistance={20}>
          <Text style={styles.milestonesTitle}>
            <Ionicons name="calendar-outline" size={20} color={Colors.text.primary} /> Weekly Learning Plan
          </Text>
        </FadeInView>

        {pathData.milestones?.map((milestone, index) => (
          <FadeInView
            key={index}
            delay={300 + (index * 100)}
            duration={500}
            slideDistance={30}
          >
            <ModernCard
              variant="filled"
              onPress={() => toggleMilestone(index)}
              style={styles.milestoneCard}
            >
              <View style={styles.milestoneHeader}>
                <View style={styles.milestoneNumber}>
                  <Text style={styles.milestoneNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.milestoneTitleContainer}>
                  <Text style={styles.milestoneTitle}>{milestone.title || milestone.milestone}</Text>
                  <Text style={styles.milestoneDuration}>
                    {milestone.estimated_hours || Math.ceil((pathData.total_hours || 10) / (pathData.milestones?.length || 1))} hours
                  </Text>
                </View>
                <Ionicons
                  name={expandedMilestones.includes(index) ? 'chevron-up' : 'chevron-down'}
                  size={24}
                  color={Colors.text.secondary}
                />
              </View>

              {expandedMilestones.includes(index) && (
                <View style={styles.milestoneContent}>
                  {milestone.description && (
                    <Text style={styles.milestoneDescription}>{milestone.description}</Text>
                  )}

                  {milestone.resources && milestone.resources.length > 0 && (
                    <View style={styles.resourcesSection}>
                      <Text style={styles.resourcesTitle}>Resources</Text>
                      {milestone.resources.map((resource, rIndex) => (
                        <TouchableOpacity key={rIndex} style={styles.resourceItem} activeOpacity={0.7}>
                          <Ionicons
                            name={
                              resource.type === 'video' ? 'videocam-outline' :
                                resource.type === 'article' ? 'document-text-outline' :
                                  'link-outline'
                            }
                            size={16}
                            color={Colors.primary.main}
                          />
                          <Text style={styles.resourceText}>
                            {resource.title || resource.description || resource.url}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </ModernCard>
          </FadeInView>
        ))}

        {/* Study Tips Section */}
        <FadeInView delay={600} duration={600}>
          <ModernCard variant="filled" style={styles.insightsCard}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="bulb-outline" size={20} color={Colors.primary.main} /> Study Tips
            </Text>
            <View style={styles.tipsContainer}>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.status.success} />
                <Text style={styles.tipText}>Complete milestones in order for best results</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="time" size={18} color={Colors.primary.main} />
                <Text style={styles.tipText}>Dedicate {Math.ceil((pathData.total_hours || 10) / (pathData.duration_weeks || 4))} hours per week to stay on track</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="book" size={18} color={Colors.status.warning} />
                <Text style={styles.tipText}>Practice with hands-on projects after each milestone</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="repeat" size={18} color={Colors.secondary?.main || Colors.primary.main} />
                <Text style={styles.tipText}>Review previous topics regularly to reinforce learning</Text>
              </View>
            </View>
          </ModernCard>
        </FadeInView>

        {/* Action Buttons */}
        <FadeInView delay={700} duration={600} style={styles.actionButtonsContainer}>
          <ModernButton
            title={isSaving ? 'Saving...' : 'Save Path'}
            onPress={handleSave}
            disabled={isSaving || isDownloadingPDF}
            icon="bookmark-outline"
            style={{ flex: 1 }}
            variant="primary"
          />

          <ModernButton
            title={isDownloadingPDF ? 'Generating...' : 'Download PDF'}
            onPress={handleDownloadPDF}
            disabled={isSaving || isDownloadingPDF}
            icon="document-text-outline"
            style={{ flex: 1 }}
            variant="secondary"
          />
        </FadeInView>

        <FadeInView delay={800} duration={600} style={{ width: '100%' }}>
          <ModernButton
            title="Create New Path"
            onPress={handleCreateNew}
            icon="add-circle-outline"
            variant="outline"
            style={{ marginTop: Spacing.md }}
          />
        </FadeInView>
      </ScrollView>
    </ScreenWrapper>
  );
}

const createStyles = (Colors, isDarkMode) => StyleSheet.create({
  screenWrapper: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    marginTop: Platform.OS === 'android' ? 10 : 0,
    marginBottom: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.text.primary,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },
  summaryCard: {
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  pathTitle: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  pathDescription: {
    fontSize: Typography.fontSizes.md,
    color: Colors.text.secondary,
    marginBottom: Spacing.lg,
    lineHeight: 22,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.text.primary,
    marginTop: Spacing.sm,
    textTransform: 'capitalize',
  },
  statLabel: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  milestonesTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
    marginTop: Spacing.md,
  },
  milestoneCard: {
    padding: 0,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  milestoneNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  milestoneNumberText: {
    color: '#ffffff',
    fontWeight: Typography.fontWeights.bold,
    fontSize: Typography.fontSizes.md,
  },
  milestoneTitleContainer: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  milestoneTitle: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.text.primary,
  },
  milestoneDuration: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  milestoneContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
  },
  milestoneDescription: {
    fontSize: Typography.fontSizes.md,
    color: Colors.text.secondary,
    lineHeight: 22,
    marginTop: Spacing.md,
  },
  resourcesSection: {
    marginTop: Spacing.lg,
  },
  resourcesTitle: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  resourceText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.primary.main,
    marginLeft: Spacing.sm,
    flex: 1,
  },
  insightsCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  savePromptBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDarkMode ? 'rgba(6, 182, 212, 0.15)' : 'rgba(6, 182, 212, 0.1)',
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(6, 182, 212, 0.3)' : 'rgba(6, 182, 212, 0.2)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  savePromptText: {
    flex: 1,
    fontSize: Typography.fontSizes.sm,
    color: Colors.text.primary,
    lineHeight: 20,
  },
  savePromptBold: {
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primary.main,
  },
  tipsContainer: {
    gap: Spacing.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  tipText: {
    flex: 1,
    fontSize: Typography.fontSizes.sm,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  insightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: Spacing.md,
  },
  insightItem: {
    alignItems: 'center',
    minWidth: 80,
  },
  insightItemWide: {
    alignItems: 'center',
    width: '100%',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
  },
  insightValue: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.text.primary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  insightLabel: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.text.secondary,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  errorText: {
    fontSize: Typography.fontSizes.lg,
    color: Colors.text.secondary,
    marginTop: Spacing.lg,
  },
  errorButton: {
    marginTop: Spacing.xl,
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.semibold,
  },
});
