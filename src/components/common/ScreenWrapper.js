import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../../context/ThemeContext';

const ScreenWrapper = ({ children, style, edges = ['top', 'left', 'right'] }) => {
    const { colors, isDarkMode } = useTheme();

    return (
        <LinearGradient
            colors={colors.gradients.pageBackground}
            style={styles.container}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <StatusBar style={isDarkMode ? "light" : "dark"} />
            <SafeAreaView style={[styles.safeArea, style]} edges={edges}>
                {children}
            </SafeAreaView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
});

export default ScreenWrapper;
