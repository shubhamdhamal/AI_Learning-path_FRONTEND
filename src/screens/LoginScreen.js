import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Typography, Spacing, BorderRadius } from '../theme';
import { ScreenWrapper, ModernButton, ModernCard, FadeInView } from '../components';

export default function LoginScreen({ navigation }) {
  const { colors: Colors, isDarkMode } = useTheme();
  const styles = useMemo(() => createStyles(Colors, isDarkMode), [Colors, isDarkMode]);
  const { login, continueAsGuest } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (!result.success) {
      Alert.alert('Login Failed', result.error);
    }
  };

  const handleGuestMode = () => {
    continueAsGuest();
  };

  return (
    <ScreenWrapper style={styles.container} scrollable={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <FadeInView delay={100} duration={800} style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="sparkles" size={40} color={Colors.primary.main} />
            </View>
            <Text style={styles.title}>AI Learning Path</Text>
            <Text style={styles.subtitle}>
              Personalized learning paths powered by AI
            </Text>
          </FadeInView>

          {/* Form Card */}
          <FadeInView delay={300} duration={600} slideDistance={50}>
            <ModernCard variant="glass" style={styles.formCard}>
              <Text style={styles.formTitle}>Welcome Back</Text>
              <Text style={styles.formSubtitle}>Sign in to continue</Text>

              {/* Email Input */}
              <View style={[
                styles.inputContainer,
                errors.email && styles.inputError
              ]}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={Colors.text.secondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Email address"
                  placeholderTextColor={Colors.text.secondary}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

              {/* Password Input */}
              <View style={[
                styles.inputContainer,
                errors.password && styles.inputError
              ]}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={Colors.text.secondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor={Colors.text.secondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={Colors.text.secondary}
                  />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

              {/* Login Button */}
              <ModernButton
                title={isLoading ? 'Signing in...' : 'Sign In'}
                onPress={handleLogin}
                disabled={isLoading}
                variant="primary"
                style={styles.loginButton}
              />

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Guest Mode Button */}
              <ModernButton
                title="Continue as Guest"
                onPress={handleGuestMode}
                variant="outline"
                backgroundColor="#F3F4F6"
              />

              {/* Register Link */}
              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text style={styles.registerLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </ModernCard>
          </FadeInView>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const createStyles = (Colors, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSizes['3xl'],
    fontWeight: Typography.fontWeights.bold,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.fontSizes.base,
    color: Colors.text.secondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  formCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
  },
  formTitle: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  formSubtitle: {
    fontSize: Typography.fontSizes.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.7)',
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
  },
  inputError: {
    borderColor: Colors.status.error,
    borderWidth: 1,
  },
  inputIcon: {
    paddingHorizontal: Spacing.base,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: Typography.fontSizes.base,
    color: Colors.text.primary,
  },
  eyeIcon: {
    padding: Spacing.base,
  },
  errorText: {
    color: Colors.status.error,
    fontSize: Typography.fontSizes.sm,
    marginTop: -Spacing.sm,
    marginBottom: Spacing.md,
    marginLeft: Spacing.xs,
  },
  loginButton: {
    marginTop: Spacing.md,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
  },
  dividerText: {
    paddingHorizontal: Spacing.base,
    color: Colors.text.secondary,
    fontSize: Typography.fontSizes.md,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xl,
  },
  registerText: {
    color: Colors.text.secondary,
    fontSize: Typography.fontSizes.md,
  },
  registerLink: {
    color: Colors.primary.main,
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
  },
});
