import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import useLearningPathStore from '../store/learningPathStore';
import GenerationProgress from '../components/GenerationProgress';
import { useTheme } from '../context/ThemeContext';
import { ScreenWrapper, FadeInView, ModernButton, ModernCard } from '../components';
import { Typography, Spacing, BorderRadius, Shadows } from '../theme';

const EXPERTISE_LEVELS = [
  { value: 'beginner', label: 'Beginner', description: 'Just starting out' },
  { value: 'intermediate', label: 'Intermediate', description: 'Some experience' },
  { value: 'advanced', label: 'Advanced', description: 'Looking to specialize' },
];

const TIME_COMMITMENTS = [
  { value: 'minimal', label: 'Minimal', description: 'Few hours/week' },
  { value: 'moderate', label: 'Moderate', description: '5-10 hours/week' },
  { value: 'intensive', label: 'Intensive', description: '15+ hours/week' },
];

const LEARNING_STYLES = [
  { value: 'visual', label: 'Visual', description: 'Images, diagrams & spatial' },
  { value: 'auditory', label: 'Auditory', description: 'Listening & speaking' },
  { value: 'reading', label: 'Reading/Writing', description: 'Written materials & notes' },
  { value: 'kinesthetic', label: 'Kinesthetic', description: 'Hands-on activities' },
];

export default function GeneratePathScreen({ navigation }) {
  const { colors: Colors, isDarkMode } = useTheme();
  const styles = useMemo(() => createStyles(Colors, isDarkMode), [Colors, isDarkMode]);
  const { generatePath, isGenerating, resetGeneration } = useLearningPathStore();

  const [formData, setFormData] = useState({
    topic: '',
    expertise_level: 'beginner',
    duration_weeks: '4',
    time_commitment: 'moderate',
    learning_style: 'visual',
    goals: '',
  });

  const [errors, setErrors] = useState({});
  const [showProgress, setShowProgress] = useState(false);
  const [showExpertiseDropdown, setShowExpertiseDropdown] = useState(false);

  const getSelectedExpertise = () => {
    return EXPERTISE_LEVELS.find(e => e.value === formData.expertise_level) || EXPERTISE_LEVELS[0];
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.topic.trim()) {
      newErrors.topic = 'Please enter a topic';
    }

    const weeks = parseInt(formData.duration_weeks);
    if (isNaN(weeks) || weeks < 1 || weeks > 52) {
      newErrors.duration_weeks = 'Duration must be between 1-52 weeks';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const goals = formData.goals
      .split(',')
      .map(g => g.trim())
      .filter(g => g.length > 0);

    const payload = {
      topic: formData.topic,
      expertise_level: formData.expertise_level,
      duration_weeks: parseInt(formData.duration_weeks),
      time_commitment: formData.time_commitment,
      learning_style: formData.learning_style,
      ...(goals.length > 0 && { goals }),
    };

    // Show progress overlay
    setShowProgress(true);

    const result = await generatePath(payload);

    if (result.success) {
      if (result.immediate && result.result) {
        // Sync mode - go directly to result screen
        setShowProgress(false);
        navigation.navigate('PathResult', { path: result.result });
      } else {
        // Async mode - go to processing screen to poll
        setShowProgress(false);
        navigation.navigate('Processing', { taskId: result.taskId });
      }
    } else {
      setShowProgress(false);
    }
  };

  const handleCancelGeneration = () => {
    setShowProgress(false);
    resetGeneration();
  };

  const renderOptionButton = (option, selectedValue, onSelect, type, idx = 0) => {
    const isSelected = selectedValue === option.value;

    return (
      <FadeInView key={option.value} delay={idx * 50} duration={400} slideDistance={10}>
        <TouchableOpacity
          style={[
            styles.optionButton,
            isSelected && styles.optionButtonSelected,
          ]}
          onPress={() => onSelect(option.value)}
          activeOpacity={0.7}
        >
          <View style={styles.optionContent}>
            <Text
              style={[
                styles.optionLabel,
                isSelected && styles.optionLabelSelected,
              ]}
            >
              {option.label}
            </Text>
            <Text
              style={[
                styles.optionDescription,
                isSelected && styles.optionDescriptionSelected,
              ]}
            >
              {option.description}
            </Text>
          </View>
          {isSelected && (
            <Ionicons name="checkmark-circle" size={20} color={Colors.primary.main} />
          )}
        </TouchableOpacity>
      </FadeInView>
    );
  };

  return (
    <ScreenWrapper
      style={styles.screenWrapper}
      colors={Colors.gradients.pageBackground}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          scrollEventThrottle={16}
        >
          {/* Header */}
          <FadeInView delay={0} duration={600}>
            <View style={styles.header}>
              <Ionicons name="sparkles" size={40} color={Colors.primary.main} />
              <Text style={styles.headerTitle}>Generate Learning Path</Text>
              <Text style={styles.headerSubtitle}>
                AI-powered personalized learning with job market insights
              </Text>
            </View>
          </FadeInView>

          {/* Form Card */}
          <FadeInView delay={100} duration={600}>
            <ModernCard variant="filled" style={styles.formCard}>
              {/* Topic Input */}
              <FadeInView delay={150} duration={500} slideDistance={20}>
                <View style={styles.inputGroup}>
                  <View style={styles.labelContainer}>
                    <Ionicons name="bulb-outline" size={20} color={Colors.primary.main} />
                    <Text style={styles.label}>What do you want to learn?</Text>
                  </View>
                  <TextInput
                    style={[styles.textInput, errors.topic && styles.inputError]}
                    placeholder="e.g., Python Data Analysis, Machine Learning"
                    placeholderTextColor={Colors.text.secondary}
                    value={formData.topic}
                    onChangeText={(text) => setFormData({ ...formData, topic: text })}
                  />
                  {errors.topic && <Text style={styles.errorText}>{errors.topic}</Text>}
                </View>
              </FadeInView>

              {/* Expertise Level Inline Dropdown */}
              <FadeInView delay={200} duration={500} slideDistance={20}>
                <View style={styles.inputGroup}>
                  <View style={styles.labelContainer}>
                    <Ionicons name="trending-up-outline" size={20} color={Colors.primary.main} />
                    <Text style={styles.label}>Current Expertise Level</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.dropdownButton, showExpertiseDropdown && styles.dropdownButtonActive]}
                    onPress={() => setShowExpertiseDropdown(!showExpertiseDropdown)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.dropdownContent}>
                      <Text style={styles.dropdownLabel}>{getSelectedExpertise().label}</Text>
                      <Text style={styles.dropdownDescription}>{getSelectedExpertise().description}</Text>
                    </View>
                    <Ionicons
                      name={showExpertiseDropdown ? "chevron-up" : "chevron-down"}
                      size={20}
                      color={Colors.text.secondary}
                    />
                  </TouchableOpacity>

                  {/* Inline Dropdown Options */}
                  {showExpertiseDropdown && (
                    <View style={styles.inlineDropdownContainer}>
                      {EXPERTISE_LEVELS.map((option) => (
                        <TouchableOpacity
                          key={option.value}
                          style={[
                            styles.inlineDropdownOption,
                            formData.expertise_level === option.value && styles.inlineDropdownOptionSelected,
                          ]}
                          onPress={() => {
                            setFormData({ ...formData, expertise_level: option.value });
                            setShowExpertiseDropdown(false);
                          }}
                          activeOpacity={0.7}
                        >
                          <View style={styles.dropdownOptionContent}>
                            <Text style={[
                              styles.inlineDropdownOptionLabel,
                              formData.expertise_level === option.value && styles.inlineDropdownOptionLabelSelected,
                            ]}>
                              {option.label}
                            </Text>
                            <Text style={[
                              styles.inlineDropdownOptionDescription,
                              formData.expertise_level === option.value && styles.inlineDropdownOptionDescriptionSelected,
                            ]}>
                              {option.description}
                            </Text>
                          </View>
                          {formData.expertise_level === option.value && (
                            <Ionicons name="checkmark-circle" size={22} color={Colors.primary.main} />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </FadeInView>

              {/* Duration */}
              <FadeInView delay={250} duration={500} slideDistance={20}>
                <View style={styles.inputGroup}>
                  <View style={styles.labelContainer}>
                    <Ionicons name="calendar-outline" size={20} color={Colors.primary.main} />
                    <Text style={styles.label}>Duration (weeks)</Text>
                  </View>
                  <TextInput
                    style={[styles.textInput, styles.numberInput, errors.duration_weeks && styles.inputError]}
                    keyboardType="number-pad"
                    value={formData.duration_weeks}
                    onChangeText={(text) => setFormData({ ...formData, duration_weeks: text })}
                    maxLength={2}
                  />
                  {errors.duration_weeks && <Text style={styles.errorText}>{errors.duration_weeks}</Text>}
                </View>
              </FadeInView>

              {/* Time Commitment */}
              <FadeInView delay={300} duration={500} slideDistance={20}>
                <View style={styles.inputGroup}>
                  <View style={styles.labelContainer}>
                    <Ionicons name="time-outline" size={20} color={Colors.primary.main} />
                    <Text style={styles.label}>Time Commitment</Text>
                  </View>
                  <View style={styles.optionsContainer}>
                    {TIME_COMMITMENTS.map((option, idx) =>
                      renderOptionButton(
                        option,
                        formData.time_commitment,
                        (value) => setFormData({ ...formData, time_commitment: value }),
                        'time',
                        idx
                      )
                    )}
                  </View>
                </View>
              </FadeInView>

              {/* Learning Style */}
              <FadeInView delay={350} duration={500} slideDistance={20}>
                <View style={styles.inputGroup}>
                  <View style={styles.labelContainer}>
                    <Ionicons name="school-outline" size={20} color={Colors.primary.main} />
                    <Text style={styles.label}>Your Learning Style</Text>
                  </View>
                  <View style={styles.optionsContainer}>
                    {LEARNING_STYLES.map((option, idx) =>
                      renderOptionButton(
                        option,
                        formData.learning_style,
                        (value) => setFormData({ ...formData, learning_style: value }),
                        'style',
                        idx
                      )
                    )}
                  </View>
                </View>
              </FadeInView>

              {/* Goals (Optional) */}
              <FadeInView delay={400} duration={500} slideDistance={20}>
                <View style={styles.inputGroup}>
                  <View style={styles.labelContainer}>
                    <Ionicons name="flag-outline" size={20} color={Colors.primary.main} />
                    <Text style={styles.label}>Learning Goals (optional)</Text>
                  </View>
                  <TextInput
                    style={[styles.textInput, styles.multilineInput]}
                    placeholder="e.g., Build portfolio projects, Get a job"
                    placeholderTextColor={Colors.text.secondary}
                    value={formData.goals}
                    onChangeText={(text) => setFormData({ ...formData, goals: text })}
                    multiline
                    numberOfLines={3}
                  />
                  <Text style={styles.hintText}>Separate multiple goals with commas</Text>
                </View>
              </FadeInView>

              {/* Submit Button */}
              <FadeInView delay={450} duration={500} slideDistance={20}>
                <ModernButton
                  variant="primary"
                  size="md"
                  onPress={handleSubmit}
                  disabled={isGenerating}
                  style={styles.submitButton}
                >
                  <View style={styles.submitButtonContent}>
                    <Ionicons
                      name="sparkles"
                      size={20}
                      color={Colors.white}
                    />
                    <Text style={styles.submitButtonText}>
                      {isGenerating ? 'Generating...' : 'Generate Learning Path'}
                    </Text>
                  </View>
                </ModernButton>
              </FadeInView>
            </ModernCard>
          </FadeInView>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Generation Progress Overlay */}
      <GenerationProgress
        isVisible={showProgress}
        onCancel={handleCancelGeneration}
        topic={formData.topic}
      />

    </ScreenWrapper>
  );
}

const createStyles = (Colors, isDarkMode) => StyleSheet.create({
  screenWrapper: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.base,
    paddingBottom: Spacing['3xl'],
  },
  header: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  headerTitle: {
    fontSize: Typography.fontSizes['2xl'],
    fontWeight: Typography.fontWeights.bold,
    color: Colors.text.primary,
    marginTop: Spacing.md,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: Typography.fontSizes.base,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  formCard: {
    marginBottom: Spacing.xl,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.text.primary,
    marginLeft: Spacing.sm,
    letterSpacing: -0.2,
  },
  textInput: {
    backgroundColor: `${Colors.text.primary}08`,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.base,
    fontSize: Typography.fontSizes.base,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: `${Colors.text.primary}15`,
  },
  numberInput: {
    width: 100,
    textAlign: 'center',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: Spacing.base,
  },
  inputError: {
    borderColor: Colors.status.error,
    backgroundColor: `${Colors.status.error}08`,
  },
  errorText: {
    color: Colors.status.error,
    fontSize: Typography.fontSizes.sm,
    marginTop: Spacing.sm,
    fontWeight: Typography.fontWeights.medium,
  },
  hintText: {
    color: Colors.text.secondary,
    fontSize: Typography.fontSizes.xs,
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },
  optionsContainer: {
    gap: Spacing.sm,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.primary.main}10`,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionButtonSelected: {
    borderColor: Colors.primary.main,
    backgroundColor: `${Colors.primary.main}20`,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.text.primary,
  },
  optionLabelSelected: {
    color: Colors.primary.main,
  },
  optionDescription: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  optionDescriptionSelected: {
    color: Colors.primary.main,
  },
  submitButton: {
    marginTop: Spacing.lg,
    marginHorizontal: 0,
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.semibold,
    letterSpacing: 0.3,
  },
  // Dropdown styles
  dropdownButton: {
    backgroundColor: `${Colors.text.primary}08`,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.base,
    borderWidth: 1,
    borderColor: `${Colors.text.primary}15`,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownContent: {
    flex: 1,
  },
  dropdownLabel: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.text.primary,
  },
  dropdownDescription: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  dropdownButtonActive: {
    borderColor: Colors.primary.main,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  // Inline dropdown styles
  inlineDropdownContainer: {
    backgroundColor: Colors.background.card,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: Colors.primary.main,
    borderBottomLeftRadius: BorderRadius.lg,
    borderBottomRightRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  inlineDropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: `${Colors.text.primary}10`,
  },
  inlineDropdownOptionSelected: {
    backgroundColor: `${Colors.primary.main}15`,
  },
  inlineDropdownOptionLabel: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.text.primary,
  },
  inlineDropdownOptionLabelSelected: {
    color: Colors.primary.main,
  },
  inlineDropdownOptionDescription: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  inlineDropdownOptionDescriptionSelected: {
    color: Colors.primary.main,
  },
});
