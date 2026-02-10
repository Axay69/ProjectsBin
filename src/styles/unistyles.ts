import { UnistylesRegistry } from 'react-native-unistyles';

export const lightTheme = {
    colors: {
        typography: '#111827',
        subText: '#6b7280',
        placeholder: '#9ca3af',
        background: '#ffffff',
        primary: '#3b82f6',
        accent: '#f59e0b',
        surface: '#f3f4f6',
        border: '#e5e7eb',
        error: '#ef4444',
        success: '#10b981',
    },
    spacing: {
        xs: 2,
        sm: 4,
        md: 8,
        lg: 16,
        xl: 24,
    }
} as const;

export const darkTheme = {
    colors: {
        typography: '#f9fafb',
        subText: '#9ca3af',
        placeholder: '#4b5563',
        background: '#111827',
        primary: '#60a5fa',
        accent: '#fbbf24',
        surface: '#1f2937',
        border: '#374151',
        error: '#f87171',
        success: '#34d399',
    },
    spacing: {
        xs: 2,
        sm: 4,
        md: 8,
        lg: 16,
        xl: 24,
    }
} as const;

export const oceanTheme = {
    colors: {
        typography: '#f0f9ff',
        subText: '#7dd3fc',
        placeholder: '#0ea5e9',
        background: '#0c4a6e',
        primary: '#38bdf8',
        accent: '#22d3ee',
        surface: '#075985',
        border: '#0ea5e9',
        error: '#fb7185',
        success: '#2dd4bf',
    },
    spacing: {
        xs: 2,
        sm: 4,
        md: 8,
        lg: 16,
        xl: 24,
    }
} as const;

export const sunsetTheme = {
    colors: {
        typography: '#fff7ed',
        subText: '#fed7aa',
        placeholder: '#f97316',
        background: '#7c2d12',
        primary: '#fb923c',
        accent: '#f43f5e',
        surface: '#9a3412',
        border: '#ea580c',
        error: '#f43f5e',
        success: '#fbbf24',
    },
    spacing: {
        xs: 2,
        sm: 4,
        md: 8,
        lg: 16,
        xl: 24,
    }
} as const;

export type AppThemes = {
    systemLight: typeof lightTheme,
    systemDark: typeof darkTheme,
    ocean: typeof oceanTheme,
    sunset: typeof sunsetTheme
};

export interface AppBreakpoints {
    mobile: number,
    tablet: number
}

const breakpoints: AppBreakpoints = {
    mobile: 0,
    tablet: 768,
};

UnistylesRegistry
    .addConfig({
        adaptiveThemes: false,
        initialTheme: 'ocean'
    }).addThemes({
        systemLight: lightTheme,
        systemDark: darkTheme,
        ocean: oceanTheme,
        sunset: sunsetTheme,
    }).addBreakpoints(breakpoints);

declare module 'react-native-unistyles' {
    export interface UnistylesThemes extends AppThemes { }
    export interface UnistylesBreakpoints extends AppBreakpoints { }
}
