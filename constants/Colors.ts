// Primary purple theme colors - DARK THEME
const tintColorLight = '#a855f7';
const tintColorDark = '#c084fc';

// Purple gradient palette for circles/orbs
export const gradientColors = {
  primary: ['#9333ea', '#a855f7', '#c084fc'],
  secondary: ['#7c3aed', '#8b5cf6', '#a78bfa'],
  accent: ['#6d28d9', '#7c3aed', '#8b5cf6'],
  // For gradient orbs/circles on dark background
  orbLight: ['rgba(168, 85, 247, 0.3)', 'rgba(192, 132, 252, 0.2)', 'transparent'],
  orbDark: ['rgba(147, 51, 234, 0.4)', 'rgba(124, 58, 237, 0.3)', 'transparent'],
};

// Main theme colors - DARK MODE
export const themeColors = {
  primary: '#a855f7',
  primaryLight: '#c084fc',
  primaryDark: '#7c3aed',
  background: '#0f0a1a', // Very dark purple
  surface: '#1a1025',    // Slightly lighter dark purple
  card: '#241a35',       // Card background
  text: '#f9fafb',
  textSecondary: '#a1a1aa',
};

export default {
  light: {
    text: '#f9fafb',
    background: '#0f0a1a',
    tint: tintColorLight,
    tabIconDefault: '#6b7280',
    tabIconSelected: tintColorLight,
    primary: '#a855f7',
    primaryLight: '#c084fc',
    gradientStart: '#9333ea',
    gradientEnd: '#c084fc',
    surface: '#1a1025',
    card: '#241a35',
  },
  dark: {
    text: '#f9fafb',
    background: '#0f0a1a',
    tint: tintColorDark,
    tabIconDefault: '#6b7280',
    tabIconSelected: tintColorDark,
    primary: '#a855f7',
    primaryLight: '#c084fc',
    gradientStart: '#7c3aed',
    gradientEnd: '#a855f7',
    surface: '#1a1025',
    card: '#241a35',
  },
};
