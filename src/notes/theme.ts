import { useMemo } from 'react'

export const notePalette = [
  '#FDE68A',
  '#FBCFE8',
  '#BFDBFE',
  '#BBF7D0',
  '#FCD34D',
  '#C7D2FE',
  '#FECACA',
  '#A5F3FC',
  '#F3F4F6',
  '#E0F2FE',
]

const lightColors = {
  primary: '#0EA5A4',
  accent: '#06B6D4',
  bg: '#F7FAFC',
  surface: '#FFFFFF',
  text: '#0F172A',
  subtext: '#6B7280',
  border: '#E5E7EB',
  muted: '#F3F4F6',
  danger: '#EF4444',
  success: '#22C55E',
}

const darkColors: typeof lightColors = {
  primary: '#22D3EE',
  accent: '#0EA5A4',
  bg: '#0F1419',
  surface: '#111827',
  text: '#F9FAFB',
  subtext: '#9CA3AF',
  border: '#1F2937',
  muted: '#0B1220',
  danger: '#F87171',
  success: '#22C55E',
}

export type ThemeColors = typeof lightColors

export function getTheme(darkMode: boolean): ThemeColors {
  return darkMode ? darkColors : lightColors
}

export function useThemeColors(darkMode: boolean) {
  return useMemo(() => getTheme(darkMode), [darkMode])
}

export function pickNoteColor(mode: 'random' | 'fixed', fixedColor?: string) {
  if (mode === 'fixed' && fixedColor) return fixedColor
  const index = Math.floor(Math.random() * notePalette.length)
  return notePalette[index] ?? notePalette[0]
}

