import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Spacing, BorderRadius, Shadows } from '../../theme';

const ModernCard = ({
    children,
    style,
    variant = 'filled',
    blur = true,
    onPress,
}) => {
    const { colors, isDarkMode } = useTheme();

    const getCardBackgroundColor = () => {
        if (variant === 'glass') {
            return isDarkMode ? 'rgba(22, 33, 62, 0.4)' : 'rgba(255, 255, 255, 0.95)';
        }
        return colors.card;
    };

    const getBorderColor = () => {
        if (variant === 'glass') {
            return isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)';
        }
        return 'transparent';
    };

    const Container = onPress ? TouchableOpacity : View;

    return (
        <Container
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
            style={[
                styles.card,
                {
                    backgroundColor: getCardBackgroundColor(),
                    borderColor: getBorderColor(),
                },
                style,
            ]}
        >
            {children}
        </Container>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        borderWidth: 1,
        ...Shadows.md,
        overflow: 'hidden',
    },
});

export default ModernCard;
