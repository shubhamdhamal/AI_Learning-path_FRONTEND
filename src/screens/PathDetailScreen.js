import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import Animated, { FadeInDown, SlideInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import useLearningPathStore from '../store/learningPathStore';
import { useTheme } from '../context/ThemeContext';
import { ScreenWrapper, FadeInView, ModernCard, ModernButton } from '../components';
import { Typography, Spacing, BorderRadius, Shadows } from '../theme';

export default function PathDetailScreen({ navigation, route }) {
  const { colors: Colors, isDarkMode } = useTheme();
  const styles = useMemo(() => createStyles(Colors, isDarkMode), [Colors, isDarkMode]);
  const { path } = route.params;
  const { updateMilestoneCompletion } = useLearningPathStore();

  const [expandedMilestones, setExpandedMilestones] = useState([0]);
  const [completedMilestones, setCompletedMilestones] = useState(
    path.completedMilestones || {}
  );
  const [dismissedAssessment, setDismissedAssessment] = useState(false);

  const toggleMilestone = (index) => {
    setExpandedMilestones((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  const toggleCompletion = async (index) => {
    const newValue = !completedMilestones[index];
    setCompletedMilestones((prev) => ({ ...prev, [index]: newValue }));
    await updateMilestoneCompletion(path.id, index, newValue);
  };

  const getCompletionPercentage = () => {
    if (!path.milestones) return 0;
    const completed = Object.values(completedMilestones).filter(Boolean).length;
    return Math.round((completed / path.milestones.length) * 100);
  };

  const openResource = (url) => {
    if (url && url.startsWith('http')) {
      Linking.openURL(url);
    }
  };

  const completion = getCompletionPercentage();

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
        <Text style={styles.headerTitle} numberOfLines={1}>
          {path.topic || path.title}
        </Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
      >
        {/* Progress Card */}
        <FadeInView delay={100} duration={600}>
          <ModernCard variant="glass" style={styles.progressCard}>
            <Text style={styles.progressTitle}>Your Progress</Text>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${completion}%` },
                    completion === 100 && styles.progressComplete,
                  ]}
                />
              </View>
              <Text style={styles.progressPercentage}>{completion}%</Text>
            </View>
            <Text style={styles.progressSubtext}>
              {Object.values(completedMilestones).filter(Boolean).length} of{' '}
              {path.milestones?.length || 0} weeks completed
            </Text>
          </ModernCard>
        </FadeInView>


        {/* Skill Assessment Prompt - Shows when 100% complete */}
        {completion === 100 && !dismissedAssessment && (
          <FadeInView delay={300} duration={600}>
            <ModernCard
              style={styles.assessmentPromptCard}
              colors={['#667eea', '#764ba2']}
            >
              <View style={styles.assessmentContent}>
                <View style={styles.assessmentIconContainer}>
                  <Ionicons name="trophy" size={40} color="#FFD700" />
                </View>
                <Text style={styles.assessmentTitle}>🎉 Congratulations!</Text>
                <Text style={styles.assessmentSubtitle}>
                  You've completed all milestones. Ready to test your knowledge?
                </Text>
                <Text style={styles.assessmentDescription}>
                  Take a 25-question skill assessment to validate your learning and earn a certificate!
                </Text>
                <ModernButton
                  variant="white"
                  style={styles.assessmentButton}
                  onPress={() => navigation.navigate('SkillAssessment', {
                    pathId: path.id,
                    topic: path.topic || path.title,
                    expertiseLevel: path.expertise_level,
                    milestones: path.milestones?.map(m => m.title || m.milestone) || [],
                    skills: path.milestones?.flatMap(m => m.skills || []) || [],
                  })}
                >
                  <View style={styles.assessmentButtonContent}>
                    <Ionicons name="school" size={20} color="#667eea" />
                    <Text style={styles.assessmentButtonText}>Take Skill Assessment</Text>
                  </View>
                </ModernButton>
                <TouchableOpacity
                  style={styles.dismissButton}
                  onPress={() => setDismissedAssessment(true)}
                >
                  <Text style={styles.dismissButtonText}>Maybe Later</Text>
                </TouchableOpacity>
              </View>
            </ModernCard>
          </FadeInView>
        )}

        {/* Path Info */}
        <FadeInView delay={200} duration={600} slideDistance={20}>
          <ModernCard variant="filled" style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="time-outline" size={24} color={Colors.primary.main} />
                <Text style={styles.infoLabel}>Duration</Text>
                <Text style={styles.infoValue}>{path.duration_weeks} weeks</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="trending-up-outline" size={24} color={Colors.primary.main} />
                <Text style={styles.infoLabel}>Level</Text>
                <Text style={styles.infoValue}>{path.expertise_level}</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="hourglass-outline" size={24} color={Colors.primary.main} />
                <Text style={styles.infoLabel}>Hours</Text>
                <Text style={styles.infoValue}>{path.total_hours || '~20'}</Text>
              </View>
            </View>
          </ModernCard>
        </FadeInView>

        {/* Description */}
        {path.description && (
          <FadeInView delay={250} duration={600} slideDistance={20}>
            <ModernCard variant="filled" style={styles.descriptionCard}>
              <Text style={styles.descriptionText}>{path.description}</Text>
            </ModernCard>
          </FadeInView>
        )}

        {/* Weekly Learning Plan */}
        <FadeInView delay={300} duration={600} slideDistance={20}>
          <Text style={styles.milestonesTitle}>
            <Ionicons name="calendar-outline" size={20} /> Weekly Learning Plan
          </Text>
        </FadeInView>

        {path.milestones?.map((milestone, index) => {
          const isCompleted = completedMilestones[index];
          const isExpanded = expandedMilestones.includes(index);

          return (
            <FadeInView
              key={index}
              delay={300 + (index * 100)}
              duration={500}
              slideDistance={30}
            >
              <ModernCard
                variant={isCompleted ? "glass" : "filled"}
                style={[
                  styles.milestoneCard,
                  isCompleted && styles.milestoneCardCompleted,
                ]}
              >
                <TouchableOpacity
                  style={styles.milestoneHeader}
                  onPress={() => toggleMilestone(index)}
                  activeOpacity={0.8}
                >
                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      isCompleted && styles.checkboxCompleted,
                    ]}
                    onPress={() => toggleCompletion(index)}
                  >
                    {isCompleted && (
                      <Ionicons name="checkmark" size={16} color={Colors.white} />
                    )}
                  </TouchableOpacity>

                  <View style={styles.milestoneTitleContainer}>
                    <Text
                      style={[
                        styles.milestoneTitle,
                        isCompleted && styles.milestoneTitleCompleted,
                      ]}
                    >
                      {milestone.title || milestone.milestone}
                    </Text>
                    <Text style={styles.milestoneMeta}>
                      {milestone.estimated_hours || Math.ceil((path.total_hours || 10) / (path.milestones?.length || 1))} hours
                    </Text>
                  </View>

                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={24}
                    color={Colors.text.secondary}
                  />
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.milestoneContent}>
                    {milestone.description && (
                      <Text style={styles.milestoneDescription}>
                        {milestone.description}
                      </Text>
                    )}

                    {milestone.resources && milestone.resources.length > 0 && (
                      <View style={styles.resourcesSection}>
                        <Text style={styles.resourcesTitle}>
                          <Ionicons name="book-outline" size={16} /> Resources
                        </Text>
                        {milestone.resources.map((resource, rIndex) => (
                          <TouchableOpacity
                            key={rIndex}
                            style={styles.resourceItem}
                            onPress={() => openResource(resource.url)}
                          >
                            <Ionicons
                              name={
                                resource.type === 'video'
                                  ? 'videocam-outline'
                                  : resource.type === 'article'
                                    ? 'document-text-outline'
                                    : 'link-outline'
                              }
                              size={18}
                              color={Colors.primary.main}
                            />
                            <Text style={styles.resourceText}>
                              {resource.title || resource.description || resource.url}
                            </Text>
                            <Ionicons
                              name="open-outline"
                              size={16}
                              color={Colors.text.secondary}
                            />
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}

                    {milestone.skills && milestone.skills.length > 0 && (
                      <View style={styles.skillsSection}>
                        <Text style={styles.skillsTitle}>Skills you'll learn</Text>
                        <View style={styles.skillsContainer}>
                          {milestone.skills.map((skill, sIndex) => (
                            <View key={sIndex} style={styles.skillTag}>
                              <Text style={styles.skillText}>{skill}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                )}
              </ModernCard>
            </FadeInView>
          );
        })}

        {/* Study Tips Section */}
        <FadeInView delay={600} duration={600}>
          <ModernCard variant="filled" style={styles.jobMarketCard}>
            <Text style={styles.jobMarketTitle}>
              <Ionicons name="bulb-outline" size={20} /> Study Tips
            </Text>
            <View style={styles.tipsContainer}>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.status.success} />
                <Text style={styles.tipText}>Complete milestones in order for best results</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="time" size={18} color={Colors.primary.main} />
                <Text style={styles.tipText}>Dedicate {Math.ceil((path.total_hours || 10) / (path.duration_weeks || 4))} hours per week to stay on track</Text>
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
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.text.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.text.primary,
    textAlign: 'center',
    marginHorizontal: Spacing.md,
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },
  progressCard: {
    marginBottom: Spacing.lg,
  },
  progressTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 12,
    backgroundColor: `${Colors.text.primary}10`,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginRight: Spacing.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary.main,
    borderRadius: BorderRadius.full,
  },
  progressComplete: {
    backgroundColor: Colors.status.success,
  },
  progressPercentage: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.text.primary,
    width: 50,
    textAlign: 'right',
  },
  progressSubtext: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.text.secondary,
    marginTop: Spacing.sm,
  },
  infoCard: {
    marginBottom: Spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  infoValue: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.text.primary,
    textTransform: 'capitalize',
  },
  descriptionCard: {
    marginBottom: Spacing.lg,
  },
  descriptionText: {
    fontSize: Typography.fontSizes.base,
    color: Colors.text.secondary,
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
    marginTop: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  milestoneCard: {
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  milestoneCardCompleted: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.status.success,
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: `${Colors.text.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: Colors.status.success,
    borderColor: Colors.status.success,
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
  milestoneTitleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.text.secondary,
  },
  milestoneMeta: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  milestoneContent: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.base,
    borderTopWidth: 1,
    borderTopColor: `${Colors.text.primary}10`,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: `${Colors.text.primary}10`,
  },
  resourceText: {
    flex: 1,
    fontSize: Typography.fontSizes.sm,
    color: Colors.primary.main,
    marginLeft: Spacing.sm,
  },
  skillsSection: {
    marginTop: Spacing.lg,
  },
  skillsTitle: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  skillTag: {
    backgroundColor: `${Colors.primary.main}15`,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  skillText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.primary.main,
  },
  jobMarketCard: {
    marginTop: Spacing.md,
  },
  jobMarketTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
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
  jobMarketGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.lg,
  },
  jobMarketItem: {
    alignItems: 'center',
  },
  jobMarketValue: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.text.primary,
    marginTop: Spacing.sm,
  },
  jobMarketLabel: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  relatedRolesContainer: {
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: `${Colors.text.primary}10`,
  },
  relatedRolesTitle: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  relatedRolesText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.primary.main,
    lineHeight: 20,
  },
  // Skill Assessment Prompt Styles
  assessmentPromptCard: {
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    padding: 0,
  },
  assessmentContent: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  assessmentIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  assessmentTitle: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    color: isDarkMode ? '#ffffff' : '#111827',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  assessmentSubtitle: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.semibold,
    color: isDarkMode ? 'rgba(255, 255, 255, 0.95)' : '#374151',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  assessmentDescription: {
    fontSize: Typography.fontSizes.sm,
    color: isDarkMode ? 'rgba(255, 255, 255, 0.85)' : '#4B5563',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  assessmentButton: {
    width: '100%',
  },
  assessmentButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  assessmentButtonText: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
    color: '#667eea',
  },
  dismissButton: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  dismissButtonText: {
    fontSize: Typography.fontSizes.sm,
    color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : '#4B5563',
    textDecorationLine: 'underline',
  },
});
