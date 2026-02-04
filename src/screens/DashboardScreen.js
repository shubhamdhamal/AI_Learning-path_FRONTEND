import React, { useEffect, useCallback, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import Animated, { SlideInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import useLearningPathStore from '../store/learningPathStore';
import { downloadLearningPathPDF } from '../utils/pdfGenerator';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { ScreenWrapper, ModernCard, FadeInView, ModernButton } from '../components';
import { Typography, Spacing, BorderRadius, Shadows } from '../theme';

export default function DashboardScreen({ navigation }) {
  const { colors: Colors, isDarkMode } = useTheme();
  const styles = useMemo(() => createStyles(Colors, isDarkMode), [Colors, isDarkMode]);
  const { user } = useAuth();
  const { savedPaths, isLoading, loadSavedPaths, deletePath } = useLearningPathStore();
  const [downloadingPathId, setDownloadingPathId] = useState(null);

  // Get user ID for storage (use email or id for logged in users, 'guest' for guests)
  const userId = user?.isGuest ? 'guest' : (user?.id || user?.email || 'guest');

  useEffect(() => {
    loadSavedPaths(userId);
  }, [userId]);

  const onRefresh = useCallback(() => {
    loadSavedPaths(userId);
  }, [userId]);

  const handleDownloadPDF = async (path) => {
    try {
      setDownloadingPathId(path.id);
      const result = await downloadLearningPathPDF(path);
      if (result.success) {
        Alert.alert('Success', result.message);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to generate PDF. Please try again.');
    } finally {
      setDownloadingPathId(null);
    }
  };

  const handleDeletePath = (path) => {
    Alert.alert(
      'Delete Learning Path',
      `Are you sure you want to delete "${path.topic || path.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deletePath(path.id),
        },
      ]
    );
  };

  const getCompletionPercentage = (path) => {
    if (!path.milestones || !path.completedMilestones) return 0;
    const completed = Object.values(path.completedMilestones).filter(Boolean).length;
    return Math.round((completed / path.milestones.length) * 100);
  };

  const renderEmptyState = () => {
    return (
      <FadeInView delay={200} duration={800}>
        <View style={styles.emptyContainer}>
          <Ionicons
            name="book-outline"
            size={80}
            color={Colors.text.secondary}
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyTitle}>No Learning Paths Yet</Text>
          <Text style={styles.emptyText}>
            Create your first AI-powered learning path to get started
          </Text>
          <FadeInView delay={400} duration={600}>
            <ModernButton
              variant="primary"
              size="lg"
              onPress={() => navigation.navigate('GenerateTab')}
              style={styles.createButton}
            >
              <View style={styles.createButtonContent}>
                <Ionicons name="add" size={20} color={Colors.white} />
                <Text style={styles.createButtonText}>Create New Path</Text>
              </View>
            </ModernButton>
          </FadeInView>
        </View>
      </FadeInView>
    );
  };

  const renderPathCard = ({ item, index }) => {
    const completion = getCompletionPercentage(item);

    return (
      <View key={item.id} style={{ marginBottom: Spacing.lg }}>
        <FadeInView delay={index * 100}>
          <ModernCard
            variant="filled"
            onPress={() => navigation.navigate('PathDetail', { path: item })}
            style={styles.pathCard}
            activeOpacity={0.7}
          >
            {/* Card Header */}
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleSection}>
                <Text style={styles.pathTitle} numberOfLines={2}>
                  {item.topic || item.title}
                </Text>
                <Text style={styles.pathLevel}>{item.expertise_level || 'Beginner'}</Text>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity
                  onPress={() => handleDownloadPDF(item)}
                  disabled={downloadingPathId === item.id}
                  style={[
                    styles.actionButton,
                    downloadingPathId === item.id && styles.actionButtonDisabled,
                    { zIndex: 10 }
                  ]}
                >
                  <Ionicons
                    name={downloadingPathId === item.id ? 'hourglass' : 'download'}
                    size={20}
                    color={Colors.primary.main}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeletePath(item)}
                  style={[styles.actionButton, { zIndex: 10 }]}
                >
                  <Ionicons
                    name="trash"
                    size={20}
                    color={Colors.status.error}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Card Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="time-outline" size={16} color={Colors.text.secondary} />
                <Text style={styles.statText}>{item.duration_weeks || 0} weeks</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="flag-outline" size={16} color={Colors.text.secondary} />
                <Text style={styles.statText}>{item.milestones?.length || 0} milestones</Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressSection}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${completion}%`,
                      backgroundColor: completion === 100 ? Colors.status.success : Colors.primary.main,
                    },
                  ]}
                />
              </View>
              <View style={styles.progressRow}>
                <Text style={styles.createdDate}>
                  {item.created_at
                    ? new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : 'Recently created'}
                </Text>
                <Text style={styles.progressText}>{completion}% Complete</Text>
              </View>
            </View>
          </ModernCard>
        </FadeInView>
      </View>
    );
  };

  return (
    <ScreenWrapper
      style={styles.screenWrapper}
      colors={Colors.gradients.pageBackground}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Learning Paths</Text>
          <Text style={styles.headerSubtitle}>
            {savedPaths.length} path{savedPaths.length !== 1 ? 's' : ''} saved
          </Text>
        </View>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.navigate('GenerateTab')}
          activeOpacity={0.7}
        >
          <Ionicons name="add-circle" size={32} color={Colors.primary.main} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {savedPaths.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={savedPaths}
          renderItem={(props) => renderPathCard({ ...props, index: props.index })}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={onRefresh}
              tintColor={Colors.primary.main}
            />
          }
        />
      )}
    </ScreenWrapper>
  );
}

const createStyles = (Colors, isDarkMode) => StyleSheet.create({
  screenWrapper: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.base,
  },
  headerTitle: {
    fontSize: Typography.fontSizes['2xl'],
    fontWeight: Typography.fontWeights.bold,
    color: Colors.text.primary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  headerButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: `${Colors.primary.main}15`,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },
  pathCard: {
    marginBottom: Spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.base,
  },
  cardTitleSection: {
    flex: 1,
    marginRight: Spacing.base,
  },
  pathTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.text.primary,
    letterSpacing: -0.3,
  },
  pathLevel: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.primary.main,
    fontWeight: Typography.fontWeights.medium,
    marginTop: Spacing.xs,
  },
  cardActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.lg,
    backgroundColor: `${Colors.primary.main}10`,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 40,
    minWidth: 40,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.base,
    marginBottom: Spacing.base,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    backgroundColor: `${Colors.primary.main}10`,
    borderRadius: BorderRadius.md,
  },
  statText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.text.secondary,
    fontWeight: Typography.fontWeights.medium,
  },
  progressSection: {
    marginTop: Spacing.base,
  },
  progressBar: {
    height: 6,
    backgroundColor: `${Colors.text.primary}10`,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  createdDate: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.text.tertiary || Colors.text.secondary,
    fontWeight: Typography.fontWeights.regular,
  },
  progressText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.text.secondary,
    fontWeight: Typography.fontWeights.medium,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyIcon: {
    marginBottom: Spacing.lg,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: Typography.fontSizes.base,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing['2xl'],
  },
  createButton: {
    marginTop: Spacing.xl,
  },
  createButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  createButtonText: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.white,
    letterSpacing: 0.3,
  },
});
