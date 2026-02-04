import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Typography, Spacing, BorderRadius } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { API_BASE_URL } from '../services/api';
import { ScreenWrapper, ModernButton, ModernCard, FadeInView } from '../components';

export default function SettingsScreen({ navigation }) {
  const { isDarkMode, toggleDarkMode, colors: Colors } = useTheme();
  const styles = useMemo(() => createStyles(Colors, isDarkMode), [Colors, isDarkMode]);
  const [apiUrl, setApiUrl] = useState(API_BASE_URL);
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);

  const handleSaveApiUrl = async () => {
    try {
      await AsyncStorage.setItem('@api_url', apiUrl);
      Alert.alert('Success', 'API URL updated. Please restart the app.');
    } catch (error) {
      Alert.alert('Error', 'Failed to save API URL');
    }
  };

  const handleClearCache = async () => {
    Alert.alert(
      'Clear Cache',
      'This will delete all locally cached data. Your saved paths will remain on the server.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert('Success', 'Cache cleared successfully. Please restart the app.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear cache');
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenWrapper style={styles.container} scrollable={false}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <FadeInView delay={100} duration={600} style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.headerPlaceholder} />
        </FadeInView>

        {/* General Settings */}
        <FadeInView delay={200} duration={600} slideDistance={30}>
          <Text style={styles.sectionTitle}>General</Text>
          <ModernCard variant="glass" style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="notifications-outline" size={22} color={Colors.primary.main} />
                <Text style={styles.settingText}>Push Notifications</Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: isDarkMode ? '#555' : '#ccc', true: Colors.primary.main }}
                thumbColor={notifications ? '#fff' : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="moon-outline" size={22} color={Colors.primary.main} />
                <Text style={styles.settingText}>Dark Mode</Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: isDarkMode ? '#555' : '#ccc', true: Colors.primary.main }}
                thumbColor={isDarkMode ? '#fff' : '#f4f3f4'}
              />
            </View>

            <View style={[styles.settingItem, { borderBottomWidth: 0 }]}>
              <View style={styles.settingInfo}>
                <Ionicons name="save-outline" size={22} color={Colors.primary.main} />
                <Text style={styles.settingText}>Auto-save Progress</Text>
              </View>
              <Switch
                value={autoSave}
                onValueChange={setAutoSave}
                trackColor={{ false: isDarkMode ? '#555' : '#ccc', true: Colors.primary.main }}
                thumbColor={autoSave ? '#fff' : '#f4f3f4'}
              />
            </View>
          </ModernCard>
        </FadeInView>

        {/* API Settings - Commented out
        <FadeInView delay={300} duration={600} slideDistance={30}>
          <Text style={styles.sectionTitle}>Developer</Text>
          <ModernCard variant="filled" style={styles.settingsCard}>
            <View style={styles.apiSetting}>
              <Text style={styles.apiLabel}>API Server URL</Text>
              <TextInput
                style={styles.apiInput}
                value={apiUrl}
                onChangeText={setApiUrl}
                placeholder="http://localhost:5000"
                placeholderTextColor={Colors.text.secondary}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <ModernButton
                title="Save"
                onPress={handleSaveApiUrl}
                variant="primary"
                style={{ alignSelf: 'flex-end', marginTop: Spacing.md }}
                textStyle={{ fontSize: Typography.fontSizes.sm }}
              />
            </View>
          </ModernCard>
        </FadeInView>
        */}

        {/* Data Management - Commented out
        <FadeInView delay={400} duration={600} slideDistance={30}>
          <Text style={styles.sectionTitle}>Data</Text>
          <ModernCard variant="filled" style={styles.settingsCard}>
            <TouchableOpacity
              style={styles.settingButton}
              onPress={handleClearCache}
            >
              <Ionicons name="trash-outline" size={22} color={Colors.status.error} />
              <Text style={[styles.settingText, { color: Colors.status.error }]}>
                Clear Local Cache
              </Text>
            </TouchableOpacity>
          </ModernCard>
        </FadeInView>
        */}

        {/* About */}
        <FadeInView delay={300} duration={600} slideDistance={30}>
          <Text style={styles.sectionTitle}>About</Text>
          <ModernCard variant="glass" style={styles.settingsCard}>
            <View style={styles.aboutItem}>
              <Text style={styles.aboutLabel}>App Version</Text>
              <Text style={styles.aboutValue}>2.0.0</Text>
            </View>
            <View style={styles.aboutItem}>
              <Text style={styles.aboutLabel}>Build</Text>
              <Text style={styles.aboutValue}>2025.01.14</Text>
            </View>
            <View style={[styles.aboutItem, { borderBottomWidth: 0 }]}>
              <Text style={styles.aboutLabel}>Framework</Text>
              <Text style={styles.aboutValue}>React Native + Expo</Text>
            </View>
          </ModernCard>
        </FadeInView>

        {/* Credits */}
        <FadeInView delay={600} duration={600} style={styles.creditsSection}>
          <Text style={styles.creditsText}>
            Made with ❤️ for lifelong learners
          </Text>
          <Text style={styles.creditsSubtext}>
            AI Learning Path Generator
          </Text>
        </FadeInView>
      </ScrollView>
    </ScreenWrapper>
  );
}

const createStyles = (Colors, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginTop: Platform.OS === 'android' ? 10 : 0,
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
  headerPlaceholder: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },
  sectionTitle: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
    marginLeft: Spacing.xs,
  },
  settingsCard: {
    padding: 0,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: Typography.fontSizes.base,
    color: Colors.text.primary,
    marginLeft: Spacing.md,
  },
  settingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  apiSetting: {
    padding: Spacing.lg,
  },
  apiLabel: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  apiInput: {
    backgroundColor: isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.fontSizes.md,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
  },
  aboutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
  },
  aboutLabel: {
    fontSize: Typography.fontSizes.base,
    color: Colors.text.primary,
  },
  aboutValue: {
    fontSize: Typography.fontSizes.base,
    color: Colors.text.secondary,
  },
  creditsSection: {
    alignItems: 'center',
    marginTop: Spacing['3xl'],
  },
  creditsText: {
    fontSize: Typography.fontSizes.base,
    color: Colors.text.secondary,
  },
  creditsSubtext: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
    opacity: 0.7,
  },
});
