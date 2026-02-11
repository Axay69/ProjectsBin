import React, { useState, useRef } from 'react'
import {
    View,
    Text,
    Pressable,
    ScrollView,
    StatusBar,
    Dimensions,
} from 'react-native'
import { TypeAnimation } from 'react-native-type-animation'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { SafeAreaView } from 'react-native-safe-area-context'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

export default function TypeAnimationDemoScreen() {
    const { styles, theme } = useStyles(stylesheet)
    const [resetKey, setResetKey] = useState(0)

    const handleRestart = () => {
        setResetKey(prev => prev + 1)
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Type Animation</Text>
                <Pressable onPress={handleRestart} style={styles.restartButton}>
                    <MaterialCommunityIcons name="refresh" size={24} color="#60a5fa" />
                </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Section 1: Dynamic Headlines */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>DYNAMIC HEADLINES</Text>
                    <View style={styles.glassCard}>
                        <TypeAnimation
                            key={`headline-${resetKey}`}
                            sequence={[
                                { text: 'Build faster with ', delayBetweenSequence: 500 },
                                { text: 'React Native', delayBetweenSequence: 1000 },
                                { text: '', deleteCount: 12, delayBetweenSequence: 500 },
                                { text: 'Unistyles', delayBetweenSequence: 1000 },
                                { text: '', deleteCount: 9, delayBetweenSequence: 500 },
                                { text: 'Type Animation', delayBetweenSequence: 2000 },
                            ]}
                            loop
                            cursor
                            style={styles.headlineText}
                            cursorStyle={styles.cursor}
                        />
                    </View>
                </View>

                {/* Section 2: Chat Simulation */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>CHAT SIMULATION</Text>
                    <View style={styles.chatContainer}>
                        <View style={styles.chatBubbleLeft}>
                            <TypeAnimation
                                key={`chat1-${resetKey}`}
                                sequence={[
                                    { text: 'Hey! Have you seen the new demo?', delayBetweenSequence: 1000 },
                                ]}
                                typeSpeed={50}
                                cursor={false}
                                style={styles.chatTextLeft}
                            />
                        </View>
                        <View style={[styles.chatBubbleRight, { marginTop: 12 }]}>
                            <TypeAnimation
                                key={`chat2-${resetKey}`}
                                sequence={[
                                    { text: '', delayBetweenSequence: 1500 },
                                    { text: 'Which one? The Type Animation?', delayBetweenSequence: 500 },
                                ]}
                                typeSpeed={60}
                                cursor={false}
                                style={styles.chatTextRight}
                            />
                        </View>
                        <View style={[styles.chatBubbleLeft, { marginTop: 12 }]}>
                            <TypeAnimation
                                key={`chat3-${resetKey}`}
                                sequence={[
                                    { text: '', delayBetweenSequence: 3500 },
                                    { text: 'Yeah! It looks amazing 🚀', delayBetweenSequence: 500 },
                                ]}
                                typeSpeed={40}
                                cursor={false}
                                style={styles.chatTextLeft}
                            />
                        </View>
                    </View>
                </View>

                {/* Section 3: Code Mockup */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>CODE SNIPPET</Text>
                    <View style={styles.codeCard}>
                        <View style={styles.codeHeader}>
                            <View style={[styles.dot, { backgroundColor: '#ff5f56' }]} />
                            <View style={[styles.dot, { backgroundColor: '#ffbd2e' }]} />
                            <View style={[styles.dot, { backgroundColor: '#27c93f' }]} />
                        </View>
                        <TypeAnimation
                            key={`code-${resetKey}`}
                            sequence={[
                                { text: 'const Greeting = () => {\n  return (\n    <View>\n      <Text>Hello World</Text>\n    </View>\n  );\n};', delayBetweenSequence: 1000 },
                            ]}
                            typeSpeed={100}
                            style={styles.codeText}
                            cursorStyle={styles.codeCursor}
                            initialDelay={4600}
                        />
                    </View>
                </View>


                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#f8fafc',
        letterSpacing: 0.5,
    },
    restartButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(96, 165, 250, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContent: {
        padding: 20,
    },
    section: {
        marginBottom: 30,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '800',
        color: '#94a3b8',
        marginBottom: 10,
        letterSpacing: 2,
    },
    glassCard: {
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        minHeight: 100,
        justifyContent: 'center',
    },
    headlineText: {
        fontSize: 28,
        fontWeight: '800',
        color: '#f8fafc',
        lineHeight: 36,
    },
    cursor: {
        color: '#60a5fa',
        fontSize: 28,
        fontWeight: '300',
    },
    chatContainer: {
        width: '100%',
    },
    chatBubbleLeft: {
        alignSelf: 'flex-start',
        backgroundColor: '#1e293b',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 18,
        borderBottomLeftRadius: 4,
        maxWidth: '80%',
    },
    chatBubbleRight: {
        alignSelf: 'flex-end',
        backgroundColor: '#3b82f6',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 18,
        borderBottomRightRadius: 4,
        maxWidth: '80%',
    },
    chatTextLeft: {
        color: '#e2e8f0',
        fontSize: 15,
        lineHeight: 20,
    },
    chatTextRight: {
        color: '#ffffff',
        fontSize: 15,
        lineHeight: 20,
    },
    codeCard: {
        backgroundColor: '#000000',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        minHeight: 180,
    },
    codeHeader: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 15,
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    codeText: {
        fontFamily: 'Courier',
        fontSize: 14,
        color: '#27c93f',
        lineHeight: 20,
    },
    codeCursor: {
        color: '#27c93f',
        fontSize: 16,
    },
    normalText: {
        fontSize: 18,
        fontWeight: '500',
        color: '#f8fafc',
    },
}))
