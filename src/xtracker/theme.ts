export interface Theme {
  bg: string;
  surface: string;
  text: string;
  muted: string;
  primary: string;
  success: string;
  error: string;
  warning: string;
  border: string;
  shadow: string;
}

export function getTheme(darkMode: boolean): Theme {
  if (darkMode) {
    return {
      bg: '#0F1419',
      surface: '#1F2937',
      text: '#F3F4F6',
      muted: '#9CA3AF',
      primary: '#0EA5A4',
      success: '#10B981',
      error: '#EF4444',
      warning: '#F59E0B',
      border: '#374151',
      shadow: '#000000',
    };
  }
  return {
    bg: '#F9FAFB',
    surface: '#FFFFFF',
    text: '#1F2937',
    muted: '#6B7280',
    primary: '#0EA5A4',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    border: '#E5E7EB',
    shadow: '#000000',
  };
}
