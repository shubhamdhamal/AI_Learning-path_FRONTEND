import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ScreenWrapper } from '../components';

export default function LoadingScreen() {
  const { colors: Colors } = useTheme();

  return (
    <ScreenWrapper>
      <View style={styles.content}>
        <ActivityIndicator size="large" color={Colors.text.primary} />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
