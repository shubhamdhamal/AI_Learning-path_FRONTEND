import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/api';
import useLearningPathStore from '../store/learningPathStore';

const AuthContext = createContext(null);

const AUTH_TOKEN_KEY = '@auth_token';
const USER_DATA_KEY = '@user_data';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load saved auth state on app start
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      const storedUser = await AsyncStorage.getItem(USER_DATA_KEY);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAuthState = async (authToken, userData) => {
    try {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, authToken);
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving auth state:', error);
    }
  };

  const clearAuthState = async () => {
    try {
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_DATA_KEY]);
    } catch (error) {
      console.error('Error clearing auth state:', error);
    }
  };

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const response = await authService.login(email, password);

      if (response.success) {
        const { token: authToken, user: userData } = response;
        setToken(authToken);
        setUser(userData);
        setIsAuthenticated(true);
        await saveAuthState(authToken, userData);
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Network error. Please try again.'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name, email, password) => {
    try {
      setIsLoading(true);
      const response = await authService.register(name, email, password);

      if (response.success) {
        const { token: authToken, user: userData } = response;
        setToken(authToken);
        setUser(userData);
        setIsAuthenticated(true);
        await saveAuthState(authToken, userData);
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Network error. Please try again.'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      await clearAuthState();
      // Reset learning path store state (doesn't delete user's stored data)
      useLearningPathStore.getState().resetForUserSwitch();
      setIsLoading(false);
    }
  };

  const updateUser = async (userData) => {
    setUser(userData);
    if (token) {
      await saveAuthState(token, userData);
    }
  };

  // Guest mode - allow using app without authentication
  const continueAsGuest = () => {
    setIsAuthenticated(true);
    setUser({ isGuest: true, name: 'Guest' });
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    continueAsGuest,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
