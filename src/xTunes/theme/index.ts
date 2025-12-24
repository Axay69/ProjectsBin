import { TextStyle } from 'react-native';

export const theme = {
  colors: {
    background: '#000000', // Pure Black
    surface: '#121212', // Very dark grey for surface
    primary: '#FFFFFF', // White for primary to keep it minimal black & white mostly
    secondary: '#A1A1AA', // Light Grey
    accent: '#EF4444', // Hot Rod Red (Iron Man Red) - Keep as accent
    text: '#FFFFFF', // White
    textSecondary: '#A1A1AA', // Grey
    border: '#27272A', // Dark Grey border
    success: '#10B981',
    error: '#EF4444',
    card: '#121212',
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
  },
  borderRadius: {
    s: 4,
    m: 8,
    l: 12,
    xl: 16,
    round: 9999,
  },
  typography: {
    h1: { fontSize: 32, fontWeight: '700' as TextStyle['fontWeight'], color: '#F8FAFC' },
    h2: { fontSize: 24, fontWeight: '700' as TextStyle['fontWeight'], color: '#F8FAFC' },
    h3: { fontSize: 20, fontWeight: '600' as TextStyle['fontWeight'], color: '#F8FAFC' },
    body: { fontSize: 16, color: '#F8FAFC' },
    caption: { fontSize: 14, color: '#94A3B8' },
    small: { fontSize: 12, color: '#94A3B8' },
  },
  shadows: {
    glow: {
      shadowColor: '#0EA5E9',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 10,
      elevation: 5,
    },
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
  },
};
