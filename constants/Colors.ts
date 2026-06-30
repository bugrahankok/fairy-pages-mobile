// Storybook Theme Colors: Cozy Orange, Soft Sage Green, and Cream Pastels

const tintColorLight = '#FF8E53'; // Warm Pastel Orange
const tintColorDark = '#8ECA94'; // Warm Sage Green

export const gradientColors = {
  primary: ['#FFB085', '#FF8E53', '#E67E45'], // Orange gradient
  secondary: ['#A1DAB4', '#8ECA94', '#78B87E'], // Green gradient
  accent: ['#FFF0E6', '#EAF6EC', '#FAF5EC'], // Soft pastel cream backgrounds
  orbLight: ['rgba(255, 142, 83, 0.15)', 'rgba(255, 176, 133, 0.1)', 'transparent'],
  orbDark: ['rgba(142, 202, 148, 0.15)', 'rgba(161, 218, 180, 0.1)', 'transparent'],
};

export const themeColors = {
  primary: '#FF8E53',      // Cozy Orange
  secondary: '#8ECA94',    // Soft Green
  primaryLight: '#FFB085',
  secondaryLight: '#A1DAB4',
  background: '#FAF6EE',   // Warm soft cream paper background
  surface: '#FFFDF9',      // White paper surface
  card: '#F5EFE4',         // Warm sand card background
  text: '#3A2E2B',         // Deep charcoal brown for soft readability
  textSecondary: '#7A6B66', // Muted brown-gray
  border: '#EADFC9',       // Soft vintage border
};

export default {
  light: {
    text: '#3A2E2B',
    background: '#FAF6EE',
    tint: tintColorLight,
    tabIconDefault: '#8D7D77',
    tabIconSelected: tintColorLight,
    primary: '#FF8E53',
    secondary: '#8ECA94',
    gradientStart: '#FFB085',
    gradientEnd: '#FF8E53',
    surface: '#FFFDF9',
    card: '#F5EFE4',
  },
  dark: { // Since we want a consistent cozy pastel look, even "dark" is styled as warm sepia/dark cream
    text: '#FFFDF9',
    background: '#2B211F',  // Very deep warm brown for cozy night reading
    tint: tintColorDark,
    tabIconDefault: '#8D7D77',
    tabIconSelected: tintColorDark,
    primary: '#8ECA94',
    secondary: '#FF8E53',
    gradientStart: '#A1DAB4',
    gradientEnd: '#8ECA94',
    surface: '#3A2E2B',
    card: '#4E3E39',
  },
};
