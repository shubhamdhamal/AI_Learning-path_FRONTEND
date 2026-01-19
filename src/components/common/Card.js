import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, BorderRadius, Shadows, Spacing } from '../../theme';

export default function Card({
  children,
  variant = 'default', // 'default', 'glass', 'elevated'
  style,
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'glass':
        return styles.glassCard;
      case 'elevated':
        return styles.elevatedCard;
      default:
        return styles.defaultCard;
    }
  };

  return (
    <View style={[styles.card, getVariantStyles(), style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  defaultCard: {
    backgroundColor: '#ffffff',
    ...Shadows.sm,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  elevatedCard: {
    backgroundColor: '#ffffff',
    ...Shadows.lg,
  },
});
