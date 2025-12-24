// Video Editor Theme Constants

export const colors = {
  // Primary colors
  primary: '#00CED1',       // Cyan - playhead, active elements
  primaryDark: '#008B8B',
  accent: '#7C3AED',        // Purple for secondary actions

  // Background colors
  background: '#0A0A0B',    // Main dark background
  surface: '#141416',       // Card/panel background
  surfaceLight: '#1C1C1F',  // Lighter surface

  // Timeline colors
  timelineBg: '#0D0D0E',
  timelineTrack: '#1A1A1D',
  playhead: '#00CED1',
  trimHandle: '#F59E0B',    // Amber for trim handles
  trimOverlay: 'rgba(0, 0, 0, 0.6)',

  // Text colors
  textPrimary: '#FFFFFF',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',

  // Status colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',

  // Tool colors
  toolActive: '#00CED1',
  toolInactive: '#6B7280',

  // Border
  border: '#27272A',
  borderLight: '#3F3F46',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const typography = {
  // Font sizes
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 24,

  // Font weights
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

// Timeline constants
export const timeline = {
  height: 80,
  trackHeight: 50,
  rulerHeight: 20,
  handleWidth: 16,
  playheadWidth: 3,
  pixelsPerSecond: 50, // base scale
  thumbnailHeight: 40,
  thumbnailWidth: 40,
};

// Editor layout constants
export const layout = {
  headerHeight: 56,
  toolbarHeight: 64,
  controlsHeight: 200,
  previewAspectRatio: 9 / 16, // Portrait video
};
