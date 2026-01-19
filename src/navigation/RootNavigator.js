import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

// Main App Screens
import DashboardScreen from '../screens/DashboardScreen';
import GeneratePathScreen from '../screens/GeneratePathScreen';
import ProcessingScreen from '../screens/ProcessingScreen';
import PathResultScreen from '../screens/PathResultScreen';
import PathDetailScreen from '../screens/PathDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SkillAssessmentScreen from '../screens/SkillAssessmentScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Stack Navigator
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// Tab Navigator for main app
function MainTabs() {
  const { colors: Colors, isDarkMode } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.primary.main,
        tabBarInactiveTintColor: Colors.text.darkSecondary,
        tabBarStyle: {
          backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
          borderTopWidth: 1,
          borderTopColor: isDarkMode ? '#333' : Colors.border.dark,
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'DashboardTab') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'GenerateTab') {
            iconName = focused ? 'sparkles' : 'sparkles-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{ tabBarLabel: 'My Paths' }}
      />
      <Tab.Screen
        name="GenerateTab"
        component={GeneratePathScreen}
        options={{ tabBarLabel: 'Generate' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

// Main Stack Navigator (includes tabs + detail screens)
function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="Processing" component={ProcessingScreen} />
      <Stack.Screen name="PathResult" component={PathResultScreen} />
      <Stack.Screen name="PathDetail" component={PathDetailScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="SkillAssessment" component={SkillAssessmentScreen} />
    </Stack.Navigator>
  );
}

// Root Navigator
export default function RootNavigator() {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <MainStack /> : <AuthStack />;
}
