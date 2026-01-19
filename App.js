import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import RootNavigator from './src/navigation/RootNavigator';
import LoadingScreen from './src/screens/LoadingScreen';

function AppContent() {
  const { isLoading } = useAuth();
  const { isDarkMode, isLoading: themeLoading } = useTheme();

  if (isLoading || themeLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <RootNavigator />
      <StatusBar style={isDarkMode ? 'light' : 'light'} />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
