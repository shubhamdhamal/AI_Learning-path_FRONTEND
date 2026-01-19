// Theme colors for the AI Learning Path Generator mobile app
export const Colors = {
  // Primary gradient colors
  primary: {
    start: '#667eea',
    end: '#764ba2',
    main: '#667eea',
    dark: '#5a67d8',
    light: '#7c8be6',
  },
  
  // Secondary colors
  secondary: {
    main: '#48bb78',
    dark: '#38a169',
    light: '#68d391',
  },
  
  // Accent colors
  accent: {
    orange: '#ed8936',
    pink: '#ed64a6',
    cyan: '#0bc5ea',
    yellow: '#ecc94b',
  },
  
  // Background colors
  background: {
    primary: '#667eea',
    secondary: '#f7fafc',
    card: 'rgba(255, 255, 255, 0.1)',
    glass: 'rgba(255, 255, 255, 0.15)',
    dark: '#1a202c',
  },
  
  // Text colors
  text: {
    primary: '#ffffff',
    secondary: 'rgba(255, 255, 255, 0.8)',
    muted: 'rgba(255, 255, 255, 0.6)',
    dark: '#2d3748',
    darkSecondary: '#4a5568',
  },
  
  // Status colors
  status: {
    success: '#48bb78',
    error: '#f56565',
    warning: '#ed8936',
    info: '#4299e1',
  },
  
  // Border colors
  border: {
    light: 'rgba(255, 255, 255, 0.2)',
    dark: '#e2e8f0',
  },
  
  // Gradient definitions
  gradients: {
    primary: ['#667eea', '#764ba2'],
    success: ['#48bb78', '#38a169'],
    warning: ['#ed8936', '#dd6b20'],
    info: ['#4299e1', '#3182ce'],
  },
};

// Typography settings
export const Typography = {
  fontSizes: {
    xs: 10,
    sm: 12,
    md: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  fontWeights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Spacing scale
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
};

// Border radius
export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
};

// Shadow definitions
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
};

export default {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
};
