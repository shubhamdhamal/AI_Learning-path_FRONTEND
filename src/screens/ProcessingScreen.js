import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import useLearningPathStore from '../store/learningPathStore';
import { useTheme } from '../context/ThemeContext';
import { Typography, Spacing, BorderRadius } from '../theme';
import { ScreenWrapper, ModernCard, ModernButton } from '../components';

const POLL_INTERVAL = 3000; // 3 seconds

const STEPS = [
  { id: 'queued', label: 'Request Received', icon: 'checkmark-circle' },
  { id: 'started', label: 'AI Processing', icon: 'cog' },
  { id: 'analyzing', label: 'Analyzing Topic', icon: 'analytics' },
  { id: 'generating', label: 'Generating Path', icon: 'sparkles' },
  { id: 'finished', label: 'Complete!', icon: 'trophy' },
];

export default function ProcessingScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors: Colors, isDarkMode } = useTheme();

  const { taskId } = route.params || {};
  const { pollStatus, taskStatus, error, resetGeneration } = useLearningPathStore();

  const [currentStep, setCurrentStep] = useState(0);
  const spinAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  // Spinning animation
  useEffect(() => {
    const spin = Animated.loop(
      Animated.timing(spinAnimation, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );
    spin.start();
    return () => spin.stop();
  }, []);

  // Pulse animation
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // Poll for status
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      const result = await pollStatus();

      if (result.status === 'finished') {
        setCurrentStep(4);
        clearInterval(pollInterval);
        // Navigate to result after a brief delay
        setTimeout(() => {
          navigation.replace('PathResult');
        }, 1500);
      } else if (result.status === 'failed' || result.status === 'error') {
        clearInterval(pollInterval);
      } else if (result.status === 'started') {
        setCurrentStep(1);
      } else if (result.status === 'queued') {
        setCurrentStep(0);
      }
    }, POLL_INTERVAL);

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setCurrentStep((prev) => {
        // Cap visual progress at step 3 (generating) until actually finished
        if (prev < 3) {
          return prev + 1;
        }
        return prev;
      });
    }, 5000);

    return () => {
      clearInterval(pollInterval);
      clearInterval(progressInterval);
    };
  }, [taskId]);

  const spin = spinAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleCancel = () => {
    resetGeneration();
    navigation.goBack();
  };

  if (error) {
    return (
      <ScreenWrapper>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={80} color={Colors.status.error} />
          <Text style={[styles.errorTitle, { color: Colors.text.primary }]}>Generation Failed</Text>
          <Text style={[styles.errorMessage, { color: Colors.text.secondary }]}>{error}</Text>
          <ModernButton
            title="Try Again"
            onPress={handleCancel}
            style={{ width: 200 }}
          />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.content}>
        {/* Animated Icon */}
        <View style={styles.iconContainer}>
          <Animated.View
            style={[
              styles.spinningIcon,
              {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                transform: [{ rotate: spin }, { scale: pulseAnimation }]
              },
            ]}
          >
            <Ionicons name="sparkles" size={60} color={Colors.text.primary} />
          </Animated.View>
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: Colors.text.primary }]}>Generating Your Learning Path</Text>
        <Text style={[styles.subtitle, { color: Colors.text.secondary }]}>
          Our AI is crafting a personalized path just for you
        </Text>

        {/* Progress Steps */}
        <ModernCard style={styles.stepsContainer}>
          {STEPS.map((step, index) => {
            const isActive = index <= currentStep;
            const isCurrent = index === currentStep;

            return (
              <View key={step.id} style={styles.stepRow}>
                <View
                  style={[
                    styles.stepIcon,
                    { backgroundColor: isDarkMode ? '#333' : '#eee' },
                    isActive && { backgroundColor: Colors.primary.main },
                  ]}
                >
                  <Ionicons
                    name={index < currentStep ? 'checkmark' : step.icon}
                    size={20}
                    color={isActive ? '#ffffff' : Colors.text.muted}
                  />
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    { color: Colors.text.muted },
                    isActive && { color: Colors.text.primary },
                    isCurrent && { fontWeight: Typography.fontWeights.bold, color: Colors.primary.main },
                  ]}
                >
                  {step.label}
                </Text>
                {isCurrent && currentStep < 4 && (
                  <View style={styles.loadingDots}>
                    <Text style={[styles.dots, { color: Colors.primary.main }]}>...</Text>
                  </View>
                )}
              </View>
            );
          })}
        </ModernCard>

        {/* Cancel Button */}
        <View style={{ marginTop: Spacing['3xl'], width: '100%' }}>
          <ModernButton
            title="Cancel"
            onPress={handleCancel}
            variant="outline"
          />
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  iconContainer: {
    marginBottom: Spacing['2xl'],
  },
  spinningIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: Typography.fontSizes['2xl'],
    fontWeight: Typography.fontWeights.bold,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.fontSizes.base,
    textAlign: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing['3xl'],
  },
  stepsContainer: {
    width: '100%',
    padding: Spacing.xl,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepLabel: {
    fontSize: Typography.fontSizes.base,
    marginLeft: Spacing.base,
    flex: 1,
  },
  loadingDots: {
    marginLeft: Spacing.sm,
  },
  dots: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  errorTitle: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    marginTop: Spacing.lg,
  },
  errorMessage: {
    fontSize: Typography.fontSizes.base,
    textAlign: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
});
