// Warna utama PreLove - Purple Premium Theme
export const colors = {
  // Primary - Deep Purple (premium marketplace vibes)
  primary: '#7C3AED',        // Violet 600
  primaryLight: '#A78BFA',   // Violet 400
  primaryLighter: '#C4B5FD', // Violet 300
  primaryDark: '#5B21B6',    // Violet 700
  primaryDeep: '#4C1D95',    // Violet 900
  primarySurface: '#EDE9FE', // Violet 100
  primarySurface2: '#F5F3FF', // Violet 50

  // Gradient colors
  gradientStart: '#7C3AED',
  gradientMid: '#6D28D9',
  gradientEnd: '#4C1D95',

  // Secondary - Pink/Rose (accent pop)
  secondary: '#EC4899',
  secondaryLight: '#F9A8D4',
  secondaryDark: '#BE185D',
  secondarySurface: '#FCE7F3',

  // Accent - Amber (harga, badge promo)
  accent: '#F59E0B',
  accentLight: '#FCD34D',
  accentSurface: '#FEF3C7',
  accentOrange: '#F97316',

  // Neutral
  white: '#FFFFFF',
  black: '#0F0F0F',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray150: '#EDEFF2',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // Semantic
  success: '#10B981',
  successSurface: '#D1FAE5',
  error: '#EF4444',
  errorSurface: '#FEE2E2',
  warning: '#F59E0B',
  warningSurface: '#FEF3C7',
  info: '#3B82F6',
  infoSurface: '#DBEAFE',

  // Background
  background: '#F8F7FF',     // Slight purple tint background
  backgroundDark: '#EEEAF8',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',

  // Text
  textPrimary: '#1A1025',    // Very dark purple-tinted black
  textSecondary: '#6B7280',
  textDisabled: '#9CA3AF',
  textInverse: '#FFFFFF',
  textPrimaryOnPrimary: '#FFFFFF',
  textMuted: '#A0A0B0',

  // Border
  border: '#E8E4F4',         // Purple-tinted border
  borderLight: '#F0EDF8',
  borderFocus: '#7C3AED',
};

export const spacing = {
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

export const fontSizes = {
  xs: 11,
  sm: 12,
  base: 14,
  md: 15,
  lg: 16,
  xl: 18,
  '2xl': 20,
  '3xl': 24,
  '4xl': 28,
  '5xl': 32,
};

export const fontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
  black: '900' as const,
};

export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 8,
  },
  xl: {
    shadowColor: '#4C1D95',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  card: {
    shadowColor: '#6D28D9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
};
