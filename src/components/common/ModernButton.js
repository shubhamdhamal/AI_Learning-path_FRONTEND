import React from 'react';
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { Typography, Spacing, BorderRadius } from '../../theme';

const ModernButton = ({
    onPress,
    title,
    variant = 'primary',
    size = 'md',
    disabled = false,
    icon,
    style,
    children,
    backgroundColor,
}) => {
    const { colors, isDarkMode } = useTheme();
    const isGradient = !['outline', 'white', 'ghost'].includes(variant);

    const getVariantColors = () => {
        switch (variant) {
            case 'primary':
                return colors.gradients.primary;
            case 'success':
                return colors.gradients.success;
            case 'warning':
                return colors.gradients.warning;
            case 'info':
                return colors.gradients.info;
            default:
                return colors.gradients.primary;
        }
    };

    const getSizeStyles = () => {
        switch (size) {
            case 'sm':
                return {
                    paddingVertical: Spacing.sm,
                    paddingHorizontal: Spacing.md,
                    fontSize: Typography.fontSizes.sm,
                };
            case 'lg':
                return {
                    paddingVertical: Spacing.lg,
                    paddingHorizontal: Spacing['2xl'],
                    fontSize: Typography.fontSizes.lg,
                };
            default: // md
                return {
                    paddingVertical: Spacing.base,
                    paddingHorizontal: Spacing.xl,
                    fontSize: Typography.fontSizes.base,
                };
        }
    };

    const sizeStyles = getSizeStyles();

    const getTextColor = () => {
        if (disabled) {
            if (['outline', 'white', 'ghost'].includes(variant)) {
                return colors.text.muted;
            }
            return 'rgba(255, 255, 255, 0.6)';
        }
        if (variant === 'outline' || variant === 'ghost') return colors.primary.main;
        if (variant === 'white') return colors.primary.main;
        return '#ffffff';
    };

    const renderContent = () => (
        children ? children : (
            <Text
                style={[
                    styles.text,
                    {
                        fontSize: sizeStyles.fontSize,
                        color: getTextColor()
                    }
                ]}
            >
                {title}
            </Text>
        )
    );

    if (isGradient) {
        return (
            <TouchableOpacity
                onPress={onPress}
                disabled={disabled}
                style={[styles.container, style, disabled && styles.disabled]}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={getVariantColors()}
                    style={[styles.gradient, sizeStyles]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    {renderContent()}
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    // Non-gradient variants (outline, white, ghost)
    const getBackgroundColor = () => {
        if (backgroundColor) return backgroundColor;
        if (variant === 'white') return '#FFFFFF';
        return 'transparent';
    };

    const getBorderStyles = () => {
        if (variant === 'outline') {
            return {
                borderWidth: 1.5,
                borderColor: disabled ? colors.border.dark : colors.primary.main,
            };
        }
        return {};
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            style={[
                styles.container,
                { backgroundColor: getBackgroundColor() },
                getBorderStyles(),
                style,
                disabled && styles.disabled
            ]}
            activeOpacity={0.8}
        >
            <View style={[styles.gradient, sizeStyles]}>
                {renderContent()}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    gradient: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: BorderRadius.lg,
    },
    text: {
        color: '#ffffff',
        fontWeight: Typography.fontWeights.semibold,
        letterSpacing: 0.5,
    },
    disabled: {
        opacity: 0.6,
    },
    disabledText: {
        color: 'rgba(255, 255, 255, 0.6)',
    },
});

export default ModernButton;
