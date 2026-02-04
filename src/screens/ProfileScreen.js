import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import useLearningPathStore from '../store/learningPathStore';
import { Typography, Spacing, BorderRadius } from '../theme';
import { ScreenWrapper, ModernButton, ModernCard, FadeInView } from '../components';

export default function ProfileScreen({ navigation }) {
  const { colors: Colors, isDarkMode } = useTheme();
  const styles = useMemo(() => createStyles(Colors, isDarkMode), [Colors, isDarkMode]);
  const { user, logout } = useAuth();
  const { savedPaths } = useLearningPathStore();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const getCompletedPathsCount = () => {
    return savedPaths.filter((path) => {
      // Logic from store/utils should be robust.
      // Based on previous code:
      if (!path.milestones || !path.completedMilestones) return false;
      const completed = Object.values(path.completedMilestones).filter(Boolean).length;
      return completed === path.milestones.length;
    }).length;
  };

  const getTotalMilestonesCompleted = () => {
    return savedPaths.reduce((total, path) => {
      if (!path.completedMilestones) return total;
      return total + Object.values(path.completedMilestones).filter(Boolean).length;
    }, 0);
  };

  const isGuest = user?.isGuest;

  return (
    <ScreenWrapper style={styles.container} scrollable={false}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <FadeInView delay={100} duration={600} style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="settings-outline" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
        </FadeInView>

        {/* Profile Card */}
        <FadeInView delay={200} duration={600}>
          <ModernCard variant="glass" style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <View style={[styles.avatar, { backgroundColor: Colors.primary.main }]}>
                <Ionicons
                  name={isGuest ? 'person-outline' : 'person'}
                  size={40}
                  color="#fff"
                />
              </View>
            </View>
            <Text style={styles.userName}>
              {isGuest ? 'Guest User' : (user?.display_name || user?.username || user?.name || 'User')}
            </Text>
            {!isGuest && user?.email && (
              <Text style={styles.userEmail}>{user.email}</Text>
            )}
            {isGuest && (
              <View style={[styles.guestBadge, { backgroundColor: Colors.status.warning }]}>
                <Text style={styles.guestBadgeText}>Guest Mode</Text>
              </View>
            )}
          </ModernCard>
        </FadeInView>

        {/* Stats Card */}
        <FadeInView delay={300} duration={600} slideDistance={30}>
          <ModernCard variant="filled" style={styles.statsCard}>
            <Text style={styles.statsTitle}>Learning Statistics</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{savedPaths.length}</Text>
                <Text style={styles.statLabel}>Paths Started</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{getCompletedPathsCount()}</Text>
                <Text style={styles.statLabel}>Paths Completed</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{getTotalMilestonesCompleted()}</Text>
                <Text style={styles.statLabel}>Milestones Done</Text>
              </View>
            </View>
          </ModernCard>
        </FadeInView>

        {/* Menu Items */}
        <FadeInView delay={400} duration={600} slideDistance={30}>
          <ModernCard variant="filled" style={{ padding: 0, overflow: 'hidden' }}>
            {[
              { title: 'My Learning Paths', icon: 'book-outline', target: 'DashboardTab' },
              { title: 'Generate New Path', icon: 'sparkles-outline', target: 'GenerateTab' },
              { title: 'Settings', icon: 'settings-outline', target: 'Settings' },
              { title: 'Help & Support', icon: 'help-circle-outline', action: () => Alert.alert('Help', 'Visit our website for support.') }
            ].map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  index < 3 && styles.menuItemBorder
                ]}
                onPress={() => item.action ? item.action() : navigation.navigate(item.target)}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                  <Ionicons name={item.icon} size={22} color={Colors.primary.main} />
                </View>
                <Text style={styles.menuText}>{item.title}</Text>
                <Ionicons name="chevron-forward" size={20} color={Colors.text.secondary} />
              </TouchableOpacity>
            ))}
          </ModernCard>
        </FadeInView>

        {/* Guest Upgrade Card */}
        {isGuest && (
          <FadeInView delay={500} duration={600}>
            <ModernCard variant="glass" style={styles.upgradeCard}>
              <Ionicons name="person-add" size={40} color={Colors.primary.main} />
              <Text style={styles.upgradeTitle}>Create an Account</Text>
              <Text style={styles.upgradeText}>
                Sign up to save your learning paths and track progress across devices.
              </Text>
              <ModernButton
                title="Sign Up Now"
                onPress={logout}
                variant="primary"
                style={{ width: '100%' }}
              />
            </ModernCard>
          </FadeInView>
        )}

        {/* Logout Button */}
        <FadeInView delay={600} duration={600}>
          <ModernButton
            title={isGuest ? 'Exit Guest Mode' : 'Logout'}
            onPress={handleLogout}
            icon="log-out-outline"
            variant="primary"
            style={styles.logoutButton}
          />
        </FadeInView>

        {/* Version */}
        <Text style={styles.versionText}>Version 2.0.0</Text>
      </ScrollView>
    </ScreenWrapper>
  );
}

const createStyles = (Colors, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    marginTop: Platform.OS === 'android' ? 10 : 0,
  },
  headerTitle: {
    fontSize: Typography.fontSizes['2xl'],
    fontWeight: Typography.fontWeights.bold,
    color: Colors.text.primary,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    alignItems: 'center',
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  avatarContainer: {
    marginBottom: Spacing.lg,
    shadowColor: Colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.text.primary,
  },
  userEmail: {
    fontSize: Typography.fontSizes.md,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  guestBadge: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  guestBadgeText: {
    fontSize: Typography.fontSizes.sm,
    color: '#fff',
    fontWeight: Typography.fontWeights.medium,
  },
  statsCard: {
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  statsTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: Typography.fontSizes['2xl'],
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primary.main,
  },
  statLabel: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    flex: 1,
    fontSize: Typography.fontSizes.base,
    color: Colors.text.primary,
    marginLeft: Spacing.md,
  },
  upgradeCard: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
    padding: Spacing.xl,
  },
  upgradeTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.text.primary,
    marginTop: Spacing.md,
  },
  upgradeText: {
    fontSize: Typography.fontSizes.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  logoutButton: {
    marginTop: Spacing['5xl'] + 20, // Significantly increased margin
    marginBottom: Spacing.lg,
  },
  versionText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
    opacity: 0.6,
  },
});
