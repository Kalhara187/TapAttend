export const colors = {
  primary: '#06b6d4',
  primaryDark: '#0891b2',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  
  // Dark theme
  dark: {
    background: '#071029',
    surface: '#081124',
    card: '#0a151f',
    border: '#1a2a3a',
    text: '#e6eef6',
    textSecondary: '#9fb9c6',
    textTertiary: '#6b7d8a',
  },
  
  // Light theme
  light: {
    background: '#f8fafc',
    surface: '#ffffff',
    card: '#f1f5f9',
    border: '#e2e8f0',
    text: '#0f172a',
    textSecondary: '#475569',
    textTertiary: '#64748b',
  },
};

export const typography = {
  title: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 26,
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 22,
  },
  body: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

export const API_BASE_URL = 'http://10.0.2.2:5000/api';
export const REQUEST_TIMEOUT = 10000;
