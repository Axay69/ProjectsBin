import React, { useRef, useState } from 'react'
import { View, Text, Pressable, ScrollView, StatusBar, Platform } from 'react-native'
import { TrueSheet } from '@lodev09/react-native-true-sheet'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

export default function TrueSheetDemoScreen() {
    const { styles, theme } = useStyles(stylesheet)
    const insets = useSafeAreaInsets()
    const [isSheetOpen, setIsSheetOpen] = useState(false)

    const baseSheet = useRef<TrueSheet>(null)
    const blurSheet = useRef<TrueSheet>(null)
    const persistentSheet = useRef<TrueSheet>(null)
    const customGrabberSheet = useRef<TrueSheet>(null)

    const handlePresent = () => {
        setIsSheetOpen(true)
        if (Platform.OS === 'android') {
            StatusBar.setTranslucent(true)
            StatusBar.setBackgroundColor('transparent')
        }
    }

    const handleDismiss = () => {
        setIsSheetOpen(false)
        if (Platform.OS === 'android') {
            StatusBar.setTranslucent(false)
            StatusBar.setBackgroundColor(theme.colors.background)
        }
    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
            {/* <StatusBar
                translucent={true}
                hidden={isSheetOpen}
            /> */}
            <View style={styles.header}>
                <Text style={styles.title}>Advanced True Sheet</Text>
                <Text style={styles.subtitle}>Version 3.x Power Features</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <DemoCard
                    title="Native Blur Material"
                    description="Glassmorphism using native background blur and custom intensity."
                    buttonText="Open Blur Sheet"
                    onPress={() => blurSheet.current?.present()}
                />

                <DemoCard
                    title="Persistent Form"
                    description="Dismissible set to false. Requires explicit action to close."
                    buttonText="Open Persistent Sheet"
                    onPress={() => persistentSheet.current?.present()}
                />

                <DemoCard
                    title="Custom Grabber"
                    description="Fully customized grabber size, color, and positioning."
                    buttonText="Open Grabber Sheet"
                    onPress={() => customGrabberSheet.current?.present()}
                />

                <DemoCard
                    title="Basic Native"
                    description="Standard sheet with auto-height and default behavior."
                    buttonText="Open Basic Sheet"
                    onPress={() => baseSheet.current?.present()}
                />
            </ScrollView>

            {/* 1. Basic Sheet */}
            <TrueSheet
                ref={baseSheet}
                detents={['auto']}
                cornerRadius={24}
                onWillPresent={handlePresent}
                onWillDismiss={handleDismiss}
            >
                <View style={[styles.sheetContent, { paddingBottom: Math.max(insets.bottom + 12, 20) }]}>
                    <Text style={styles.sheetTitle}>Plain & Simple</Text>
                    <Text style={styles.sheetText}>
                        This sheet adjusts its height automatically based on the content and respects safe area insets at the bottom.
                    </Text>
                    <Pressable style={[styles.button, { marginTop: 24 }]} onPress={() => baseSheet.current?.dismiss()}>
                        <Text style={styles.buttonText}>Got it!</Text>
                    </Pressable>
                </View>
            </TrueSheet>

            {/* 2. Advanced Blur Sheet */}
            <TrueSheet
                ref={blurSheet}
                detents={[0.4, 0.9]}
                cornerRadius={32}
                onWillPresent={handlePresent}
                onWillDismiss={handleDismiss}
            >
                <View style={[styles.sheetContent, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                    <Text style={styles.sheetTitle}>Native Blur</Text>
                    <Text style={styles.sheetText}>
                        Using 'backgroundBlur="prominent"' and 'blurOptions' to create a high-quality frosted glass effect.
                    </Text>
                    <View style={styles.blurPreview}>
                        <Text style={{ color: theme.colors.subText }}>Experimental UI</Text>
                    </View>
                </View>
            </TrueSheet>

            {/* 3. Persistent Sheet */}
            <TrueSheet
                ref={persistentSheet}
                detents={['auto', 0.7]}
                cornerRadius={24}
                dismissible={false}
                onWillPresent={handlePresent}
                onWillDismiss={handleDismiss}
                footer={
                    <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 12, 16) }]}>
                        <Pressable
                            style={[styles.footerButton, { backgroundColor: theme.colors.error }]}
                            onPress={() => persistentSheet.current?.dismiss()}
                        >
                            <Text style={styles.buttonText}>Force Close</Text>
                        </Pressable>
                    </View>
                }

            >
                <View style={styles.sheetContent}>
                    <Text style={styles.sheetTitle}>Persistent Interaction</Text>
                    <Text style={styles.sheetText}>
                        This sheet cannot be dismissed by tapping outside or swiping down. Perfect for mandatory forms or critical alerts.
                    </Text>
                    <View style={styles.dummyForm}>
                        <View style={styles.inputPlaceholder} />
                        <View style={styles.inputPlaceholder} />
                    </View>
                </View>
            </TrueSheet>

            {/* 4. Custom Grabber Sheet */}
            <TrueSheet
                ref={customGrabberSheet}
                detents={[0.6]}
                cornerRadius={24}
                grabberOptions={{
                    width: 60,
                    height: 4,
                    color: theme.colors.primary,
                    topMargin: 12,
                }}
                onWillPresent={handlePresent}
                onWillDismiss={handleDismiss}
            >
                <View style={[styles.sheetContent, { paddingBottom: Math.max(insets.bottom + 12, 20) }]}>
                    <Text style={styles.sheetTitle}>Grabber Styling</Text>
                    <Text style={styles.sheetText}>
                        Look at the top! The grabber is wider, thinner, and matches our primary brand color.
                    </Text>
                </View>
            </TrueSheet>
        </SafeAreaView>
    )
}

function DemoCard({ title, description, buttonText, onPress }: any) {
    const { styles } = useStyles(stylesheet)
    return (
        <View style={styles.card}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardText}>{description}</Text>
            <Pressable style={styles.button} onPress={onPress}>
                <Text style={styles.buttonText}>{buttonText}</Text>
            </Pressable>
        </View>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        padding: theme.spacing.lg,
        paddingTop: theme.spacing.xl,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: theme.colors.typography,
    },
    subtitle: {
        fontSize: 16,
        color: theme.colors.subText,
        marginTop: 4,
    },
    content: {
        padding: theme.spacing.lg,
        gap: theme.spacing.lg,
    },
    card: {
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.lg,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.colors.border,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.typography,
        marginBottom: 8,
    },
    cardText: {
        fontSize: 14,
        color: theme.colors.subText,
        lineHeight: 20,
        marginBottom: 16,
    },
    button: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 15,
    },
    sheetContent: {
        paddingHorizontal: theme.spacing.xl,
        paddingTop: theme.spacing.xl,
    },
    sheetTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: theme.colors.typography,
        marginBottom: 12,
    },
    sheetText: {
        fontSize: 16,
        color: theme.colors.subText,
        lineHeight: 24,
    },
    blurPreview: {
        height: 120,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 16,
        marginTop: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    dummyForm: {
        marginTop: 20,
        gap: 12,
    },
    inputPlaceholder: {
        height: 50,
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    footer: {
        padding: theme.spacing.lg,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        backgroundColor: theme.colors.background
    },
    footerButton: {
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
    }
}))
