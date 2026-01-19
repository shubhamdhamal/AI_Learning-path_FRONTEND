import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Light theme colors
const LightColors = {
    primary: {
        start: '#4F46E5', // Indigo-600
        end: '#7C3AED',   // Violet-600
        main: '#4F46E5',
        dark: '#4338ca',
        light: '#818cf8',
    },
    secondary: {
        main: '#10B981', // Emerald-500
        dark: '#059669',
        light: '#34D399',
    },
    accent: {
        orange: '#F59E0B',
        pink: '#EC4899',
        cyan: '#06B6D4',
        yellow: '#FBBF24',
        gold: '#D4AF37',
    },
    background: {
        primary: '#4F46E5',
        secondary: '#F3F4F6', // Gray-100
        card: '#FFFFFF',
        glass: 'rgba(255, 255, 255, 0.7)',
        dark: '#1F2937',
        screen: '#F9FAFB',
    },
    text: {
        primary: '#111827', // Gray-900 (Dark text for light bg)
        secondary: '#4B5563', // Gray-600
        muted: '#9CA3AF',    // Gray-400
        dark: '#111827',
        darkSecondary: '#374151',
    },
    status: {
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6',
    },
    border: {
        light: '#E5E7EB',
        dark: '#D1D5DB',
    },
    gradients: {
        primary: ['#3B82F6', '#0EA5E9'], // Blue to Cyan
        success: ['#10B981', '#059669'], // Emerald
        warning: ['#FBBF24', '#F59E0B'], // Amber
        info: ['#06B6D4', '#0891B2'],    // Cyan to Teal
        pageBackground: ['#F9FAFB', '#F3F4F6'], // Light background
        card: ['#FFFFFF', '#FFFFFF'],
    },
    card: '#FFFFFF',
    inputBackground: '#F9FAFB',
};

// Dark theme colors
const DarkColors = {
    primary: {
        start: '#6366F1', // Indigo-500
        end: '#8B5CF6',   // Violet-500
        main: '#6366F1',
        dark: '#4F46E5',
        light: '#818cf8',
    },
    secondary: {
        main: '#34D399',
        dark: '#10B981',
        light: '#6EE7B7',
    },
    accent: {
        orange: '#FBBF24',
        pink: '#F472B6',
        cyan: '#22D3EE',
        yellow: '#FDE047',
        gold: '#FFD700',
    },
    background: {
        primary: '#111827', // Gray-900
        secondary: '#1F2937', // Gray-800
        card: '#1F2937',      // Dark card
        glass: 'rgba(31, 41, 55, 0.7)',
        dark: '#000000',
        screen: '#111827',
    },
    text: {
        primary: '#F9FAFB', // Gray-50
        secondary: '#D1D5DB', // Gray-300
        muted: '#9CA3AF', // Gray-400
        dark: '#E5E7EB',
        darkSecondary: '#9CA3AF',
    },
    status: {
        success: '#34D399',
        error: '#F87171',
        warning: '#f6ad55',
        info: '#63b3ed',
    },
    border: {
        light: 'rgba(255, 255, 255, 0.15)',
        dark: '#2d3748',
    },
    gradients: {
        primary: ['#0EA5E9', '#06B6D4'], // Cyan to Teal
        success: ['#10B981', '#059669'], // Emerald
        warning: ['#FBBF24', '#F59E0B'], // Amber
        info: ['#3B82F6', '#0284C7'],    // Blue
        pageBackground: ['#111827', '#000000'], // Modern dark background
        card: ['#1F2937', '#111827'],
    },
    card: '#1F2937',
    inputBackground: '#374151',
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadThemePreference();
    }, []);

    const loadThemePreference = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('@dark_mode');
            if (savedTheme !== null) {
                setIsDarkMode(savedTheme === 'true');
            }
        } catch (error) {
            console.error('Error loading theme preference:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleDarkMode = async (value) => {
        try {
            setIsDarkMode(value);
            await AsyncStorage.setItem('@dark_mode', value.toString());
        } catch (error) {
            console.error('Error saving theme preference:', error);
        }
    };

    const colors = isDarkMode ? DarkColors : LightColors;

    const value = {
        isDarkMode,
        toggleDarkMode,
        colors,
        isLoading,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

export { LightColors, DarkColors };
