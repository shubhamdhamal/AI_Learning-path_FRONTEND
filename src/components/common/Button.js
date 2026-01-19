import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';

export default function Button({
  title,
  onPress,
  variant = 'primary', // 'primary', 'secondary', 'outline', 'ghost'
  size = 'medium', // 'small', 'medium', 'large'
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
}) {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: Spacing.sm,
          paddingHorizontal: Spacing.md,
          fontSize: Typography.fontSizes.sm,
        };
      case 'large':
        return {
          paddingVertical: Spacing.lg,
          paddingHorizontal: Spacing.xl,
          fontSize: Typography.fontSizes.lg,
        };
      default:
        return {
          paddingVertical: Spacing.base,
          paddingHorizontal: Spacing.lg,
          fontSize: Typography.fontSizes.base,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        style={[styles.button, style, disabled && styles.disabled]}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={disabled ? ['#a0aec0', '#718096'] : Colors.gradients.primary}
          style={[styles.gradient, { paddingVertical: sizeStyles.paddingVertical, paddingHorizontal: sizeStyles.paddingHorizontal }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {loading ? (
            <ActivityIndicator color={Colors.text.primary} />
          ) : (
            <>
              {icon}
              <Text style={[styles.primaryText, { fontSize: sizeStyles.fontSize }, textStyle]}>
                {title}
              </Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'secondary') {
    return (
      <TouchableOpacity
        style={[
          styles.button,
          styles.secondaryButton,
          { paddingVertical: sizeStyles.paddingVertical, paddingHorizontal: sizeStyles.paddingHorizontal },
          style,
          disabled && styles.disabled,
        ]}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color={Colors.primary.main} />
        ) : (
          <>
            {icon}
            <Text style={[styles.secondaryText, { fontSize: sizeStyles.fontSize }, textStyle]}>
              {title}
            </Text>
          </>
        )}
      </TouchableOpacity>
    );
  }

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        style={[
          styles.button,
          styles.outlineButton,
          { paddingVertical: sizeStyles.paddingVertical, paddingHorizontal: sizeStyles.paddingHorizontal },
          style,
          disabled && styles.disabled,
        ]}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color={Colors.primary.main} />
        ) : (
          <>
            {icon}
            <Text style={[styles.outlineText, { fontSize: sizeStyles.fontSize }, textStyle]}>
              {title}
            </Text>
          </>
        )}
      </TouchableOpacity>
    );
  }

  // Ghost variant
  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles.ghostButton,
        { paddingVertical: sizeStyles.paddingVertical, paddingHorizontal: sizeStyles.paddingHorizontal },
        style,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.6}
    >
      {loading ? (
        <ActivityIndicator color={Colors.text.secondary} />
      ) : (
        <>
          {icon}
          <Text style={[styles.ghostText, { fontSize: sizeStyles.fontSize }, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    color: Colors.text.primary,
    fontWeight: Typography.fontWeights.semibold,
    marginLeft: Spacing.sm,
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    color: Colors.primary.main,
    fontWeight: Typography.fontWeights.semibold,
    marginLeft: Spacing.sm,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary.main,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineText: {
    color: Colors.primary.main,
    fontWeight: Typography.fontWeights.semibold,
    marginLeft: Spacing.sm,
  },
  ghostButton: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostText: {
    color: Colors.text.secondary,
    fontWeight: Typography.fontWeights.medium,
    marginLeft: Spacing.sm,
  },
  disabled: {
    opacity: 0.6,
  },
});
