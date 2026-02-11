import React, { useState, useMemo, useEffect } from 'react'
import {
    View,
    Text,
    Pressable,
    ScrollView,
    StatusBar,
    TextInput,
    Image,
    Dimensions,
    GestureResponderEvent,
    StyleSheet,
} from 'react-native'
import switchTheme from 'react-native-theme-switch-animation'
import { SafeAreaView } from 'react-native-safe-area-context'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { lightTheme, darkTheme, oceanTheme, sunsetTheme } from '../styles/unistyles'
import { UnistylesRuntime } from 'react-native-unistyles'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

const THEMES = {
    systemLight: lightTheme,
    systemDark: darkTheme,
    ocean: oceanTheme,
    sunset: sunsetTheme,
}

type ThemeName = keyof typeof THEMES
const THEME_NAMES: ThemeName[] = ['systemLight', 'systemDark', 'ocean', 'sunset']

export default function ThemeSwitchDemoScreen() {
    const [currentThemeName, setCurrentThemeName] = useState<ThemeName>(UnistylesRuntime.themeName as ThemeName)
    const [animType, setAnimType] = useState<'circular' | 'inverted-circular' | 'fade'>('circular')
    const [duration, setDuration] = useState(800)

    // Sync local state to Unistyles global theme
    useEffect(() => {
        if (UnistylesRuntime.themeName !== currentThemeName) {
            UnistylesRuntime.setTheme(currentThemeName as any)
        }
    }, [currentThemeName])

    const theme = THEMES[currentThemeName]
    const isDark = currentThemeName !== 'systemLight'

    const styles = useMemo(() => getStyles(theme), [currentThemeName])

    const handleNextTheme = (event: GestureResponderEvent) => {
        const { pageX, pageY } = event.nativeEvent

        const currentIndex = THEME_NAMES.indexOf(currentThemeName)
        const nextTheme = THEME_NAMES[(currentIndex + 1) % THEME_NAMES.length]

        switchTheme({
            switchThemeFunction: () => {
                setCurrentThemeName(nextTheme)
            },
            animationConfig: {
                type: animType as any,
                duration: duration,
                startingPoint: {
                    cx: pageX,
                    cy: pageY,
                },
            },
        })
    }

    const handleSelectTheme = (event: GestureResponderEvent, name: ThemeName) => {
        const { pageX, pageY } = event.nativeEvent
        if (name === currentThemeName) return

        switchTheme({
            switchThemeFunction: () => {
                setCurrentThemeName(name)
            },
            animationConfig: {
                type: animType as any,
                duration: duration,
                startingPoint: {
                    cx: pageX,
                    cy: pageY,
                },
            },
        })
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar
                barStyle={isDark ? 'light-content' : 'dark-content'}
                backgroundColor={theme.colors.background}
            />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Playground</Text>
                <View style={styles.headerIcons}>
                    <Pressable onPress={handleNextTheme} style={styles.iconButton}>
                        <MaterialCommunityIcons name="theme-light-dark" size={24} color={theme.colors.typography} />
                    </Pressable>
                    <Pressable onPress={handleNextTheme} style={styles.iconButtonCircle}>
                        <MaterialCommunityIcons name="white-balance-sunny" size={20} color={theme.colors.typography} />
                    </Pressable>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Search Bar */}
                <View style={styles.searchBar}>
                    <MaterialCommunityIcons name="magnify" size={20} color={theme.colors.subText} />
                    <TextInput
                        placeholder="Search"
                        placeholderTextColor={theme.colors.placeholder}
                        style={styles.searchInput}
                    />
                </View>

                {/* Theme Selectors */}
                <View style={styles.themeSelectorScroll}>
                    {THEME_NAMES.map(name => (
                        <Pressable
                            key={name}
                            onPress={(e) => handleSelectTheme(e, name)}
                            style={[
                                styles.themeChip,
                                currentThemeName === name && styles.activeThemeChip
                            ]}
                        >
                            <View style={[styles.chipColor, { backgroundColor: THEMES[name].colors.primary }]} />
                            <Text style={[
                                styles.chipLabel,
                                currentThemeName === name && styles.activeChipLabel
                            ]}>
                                {name.replace('system', '')}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                {/* Configuration Section */}
                <View style={styles.configCard}>
                    <Text style={styles.configTitle}>Animation Settings</Text>
                    <View style={styles.typeSwitcher}>
                        {['circular', 'inverted-circular', 'fade'].map(type => (
                            <Pressable
                                key={type}
                                style={[styles.typeButton, animType === type && styles.activeTypeButton]}
                                onPress={() => setAnimType(type as any)}
                            >
                                <Text style={[styles.typeText, animType === type && styles.activeTypeText]}>
                                    {type.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                    <View style={styles.durationRow}>
                        <Text style={styles.label}>Duration: {duration}ms</Text>
                        <View style={styles.durationButtons}>
                            <Pressable style={styles.stepButton} onPress={() => setDuration(d => Math.max(300, d - 100))}>
                                <Text style={styles.stepText}>-</Text>
                            </Pressable>
                            <Pressable style={styles.stepButton} onPress={() => setDuration(d => Math.min(4000, d + 100))}>
                                <Text style={styles.stepText}>+</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>

                {/* Feature Card */}
                <View style={styles.featureCard}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Lorem ipsum</Text>
                        <Text style={styles.cardSubtitle}>Ipsum lorem</Text>
                    </View>

                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1000&auto=format&fit=crop' }}
                        style={styles.cardImage}
                    />

                    <View style={styles.cardFooter}>
                        <Pressable style={styles.cancelButton}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </Pressable>
                        <Pressable style={styles.okButton}>
                            <Text style={styles.okText}>Ok</Text>
                        </Pressable>
                    </View>
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Floating Theme Toggle */}
            <Pressable onPress={handleNextTheme} style={styles.floatingToggle}>
                <MaterialCommunityIcons name="brush" size={28} color={theme.colors.typography} />
            </Pressable>

            {/* Mock Bottom Nav */}
            <View style={styles.bottomNav}>
                <NavItem icon="home" label="Home" active theme={theme} />
                <NavItem icon="account" label="Settings" theme={theme} />
                <NavItem icon="history" label="Recents" theme={theme} />
                <NavItem icon="bell-outline" label="Notifications" theme={theme} />
            </View>
        </SafeAreaView>
    )
}

function NavItem({ icon, label, active, theme }: { icon: string; label: string; active?: boolean; theme: any }) {
    const itemStyles = getNavItemStyles(theme, active)
    return (
        <View style={styles.navItem}>
            <View style={itemStyles.navIconBox}>
                <MaterialCommunityIcons
                    name={icon}
                    size={24}
                    color={active ? theme.colors.primary : theme.colors.subText}
                />
            </View>
            <Text style={itemStyles.navLabel}>{label}</Text>
        </View>
    )
}

const getNavItemStyles = (theme: any, active?: boolean) => StyleSheet.create({
    navIconBox: {
        width: 48,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: active ? `${theme.colors.primary}20` : 'transparent',
    },
    navLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: active ? theme.colors.primary : theme.colors.subText,
    }
})

const getStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: theme.colors.typography,
    },
    headerIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconButton: {
        padding: 8,
    },
    iconButtonCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: 20,
        paddingHorizontal: 16,
        height: 54,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: 20,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: theme.colors.typography,
    },
    themeSelectorScroll: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    themeChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        gap: 8,
    },
    activeThemeChip: {
        borderColor: theme.colors.primary,
        backgroundColor: `${theme.colors.primary}10`,
    },
    chipColor: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    chipLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.subText,
    },
    activeChipLabel: {
        color: theme.colors.primary,
    },
    configCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: 24,
        padding: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: 20,
    },
    configTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.typography,
        marginBottom: 12,
    },
    typeSwitcher: {
        flexDirection: 'row',
        backgroundColor: theme.colors.background,
        borderRadius: 12,
        padding: 4,
        gap: 4,
        marginBottom: 16,
    },
    typeButton: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 8,
    },
    activeTypeButton: {
        backgroundColor: theme.colors.primary,
    },
    typeText: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.subText,
    },
    activeTypeText: {
        color: '#FFFFFF',
    },
    durationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    label: {
        fontSize: 14,
        color: theme.colors.subText,
    },
    durationButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    stepButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: theme.colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    stepText: {
        fontSize: 20,
        color: theme.colors.typography,
        lineHeight: 24,
    },
    featureCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: 24,
        padding: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: 20,
    },
    cardHeader: {
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.typography,
    },
    cardSubtitle: {
        fontSize: 16,
        color: theme.colors.subText,
        marginTop: 2,
    },
    cardImage: {
        width: '100%',
        height: 180,
        borderRadius: 16,
        marginBottom: 20,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    cancelButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        backgroundColor: `${theme.colors.primary}15`,
    },
    cancelText: {
        color: theme.colors.primary,
        fontWeight: '600',
    },
    okButton: {
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 12,
        backgroundColor: theme.colors.primary,
    },
    okText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    floatingToggle: {
        position: 'absolute',
        bottom: 150,
        left: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: theme.colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    bottomNav: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surface,
        paddingBottom: 20,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        justifyContent: 'space-around',
    },
    navItem: {
        alignItems: 'center',
        gap: 4,
    },
})

const styles = StyleSheet.create({
    navItem: {
        alignItems: 'center',
        gap: 4,
    }
})