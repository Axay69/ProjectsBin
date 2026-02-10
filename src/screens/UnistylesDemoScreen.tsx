import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { createStyleSheet, useStyles, UnistylesRuntime } from 'react-native-unistyles';
import '../styles/unistyles'; // Initialize unistyles
import { SafeAreaView } from 'react-native-safe-area-context';
import { storage, THEME_KEY } from '../styles/storage';
import { Appearance } from 'react-native';

export default function UnistylesDemoScreen() {
    const { styles, theme } = useStyles(stylesheet);

    const themes = ['systemLight', 'systemDark', 'ocean', 'sunset'] as const;

    const setTheme = (t: typeof themes[number] | undefined) => {
        if (t) {
            storage.set(THEME_KEY, t);
            UnistylesRuntime.setTheme(t);
        } else {
            storage.remove(THEME_KEY);
            // Manual fallback to system theme
            const systemTheme = Appearance.getColorScheme();
            UnistylesRuntime.setTheme(systemTheme === 'dark' ? 'systemDark' : 'systemLight');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.header}>Unistyles Custom Themes</Text>
                <Text style={styles.subHeader}>Switch between 4 distinct themes</Text>

                <View style={styles.themeSwitcher}>
                    {themes.map((t) => (
                        <Pressable
                            key={t}
                            onPress={() => setTheme(t)}
                            style={[
                                styles.themeButton,
                                UnistylesRuntime.themeName === t && styles.activeThemeButton
                            ]}
                        >
                            <Text style={[
                                styles.themeButtonText,
                                UnistylesRuntime.themeName === t && styles.activeThemeButtonText
                            ]}>
                                {t.toUpperCase()}
                            </Text>
                        </Pressable>
                    ))}
                    <Pressable
                        onPress={() => setTheme(undefined)}
                        style={[
                            styles.themeButton,
                            !storage.getString(THEME_KEY) && styles.activeThemeButton
                        ]}
                    >
                        <Text style={[
                            styles.themeButtonText,
                            !storage.getString(THEME_KEY) && styles.activeThemeButtonText
                        ]}>
                            SYSTEM
                        </Text>
                    </Pressable>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Dynamic Theming</Text>
                    <Text style={styles.cardText}>
                        Active Theme: <Text style={{ fontWeight: 'bold' }}>{UnistylesRuntime.themeName}</Text>
                        {"\n"}
                        Mode: <Text style={{ fontWeight: 'bold' }}>{storage.getString(THEME_KEY) ? 'Locked (Persistent)' : 'Adaptive (System)'}</Text>
                        {"\n\n"}
                        This selection will now persist even if the app is killed or restarted.
                    </Text>
                </View>

                <View style={styles.responsiveBox}>
                    <Text style={styles.responsiveText}>
                        Breakpoint Aware!
                    </Text>
                    <Text style={styles.smallText}>
                        (Changes padding & background based on device size)
                    </Text>
                </View>

                <View style={styles.info}>
                    <Text style={styles.infoTitle}>Current Palette:</Text>
                    <View style={styles.palette}>
                        {Object.entries(theme.colors).map(([name, color]) => (
                            <View key={name} style={styles.colorItem}>
                                <View style={[styles.colorBox, { backgroundColor: color }]} />
                                <Text style={styles.colorLabel}>{name}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const stylesheet = createStyleSheet((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        padding: theme.spacing.lg,
    },
    header: {
        fontSize: 28,
        fontWeight: '800',
        color: theme.colors.typography,
    },
    subHeader: {
        fontSize: 16,
        color: theme.colors.accent,
        marginBottom: theme.spacing.xl,
    },
    themeSwitcher: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.md,
        marginBottom: theme.spacing.xl,
    },
    themeButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    activeThemeButton: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    themeButtonText: {
        fontSize: 12,
        fontWeight: '700',
        color: theme.colors.typography,
    },
    activeThemeButtonText: {
        color: '#fff',
    },
    card: {
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.lg,
        borderRadius: 12,
        marginBottom: theme.spacing.xl,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.typography,
        marginBottom: theme.spacing.md,
    },
    cardText: {
        fontSize: 15,
        color: theme.colors.typography,
        lineHeight: 22,
        opacity: 0.8,
    },
    responsiveBox: {
        backgroundColor: {
            mobile: theme.colors.primary,
            tablet: theme.colors.accent
        },
        padding: {
            mobile: theme.spacing.lg,
            tablet: theme.spacing.xl
        },
        borderRadius: 16,
        marginBottom: theme.spacing.xl,
        alignItems: 'center',
    },
    responsiveText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '800',
    },
    smallText: {
        color: '#fff',
        fontSize: 12,
        marginTop: 4,
    },
    info: {
        backgroundColor: theme.colors.surface,
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    infoTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.primary,
        marginBottom: 12,
    },
    palette: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    colorItem: {
        alignItems: 'center',
        width: '20%',
    },
    colorBox: {
        width: 30,
        height: 30,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    colorLabel: {
        fontSize: 9,
        color: theme.colors.typography,
        marginTop: 4,
        textAlign: 'center',
    },
}));
