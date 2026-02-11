import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createStyleSheet, useStyles } from 'react-native-unistyles';
import {
    Canvas,
    Path,
    Skia,
} from '@shopify/react-native-skia';
import Animated, {
    useSharedValue,
    useFrameCallback,
    useDerivedValue,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const CANVAS_HEIGHT = 400;

export default function SkiaAudioVisualizerScreen() {
    const { styles, theme } = useStyles(stylesheet);

    const phase1 = useSharedValue(0);
    const phase2 = useSharedValue(0);
    const phase3 = useSharedValue(0);

    // Drive animation
    useFrameCallback((frameInfo) => {
        const time = (frameInfo.timestamp || 0) / 1000;
        phase1.value = time * 2;
        phase2.value = time * 3;
        phase3.value = time * 1.5;
    });

    const generateWavePath = (A: number, B: number, C: number, offset: number) => {
        'worklet';
        const path = Skia.Path.Make();
        path.moveTo(0, offset);

        for (let x = 0; x <= width + 20; x += 10) {
            const y = A * Math.sin(B * (x / width) * Math.PI * 2 + C) + offset;
            path.lineTo(x, y);
        }

        path.lineTo(width, CANVAS_HEIGHT);
        path.lineTo(0, CANVAS_HEIGHT);
        path.close();
        return path;
    };

    const path1 = useDerivedValue(() => generateWavePath(40, 1, phase1.value, 200));
    const path2 = useDerivedValue(() => generateWavePath(30, 2, phase2.value, 220));
    const path3 = useDerivedValue(() => generateWavePath(50, 0.5, phase3.value, 180));

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Audio Visualizer</Text>
                <Text style={styles.subtitle}>Animated Sine Waves with Skia</Text>
            </View>

            <View style={styles.canvasContainer}>
                <Canvas style={{ flex: 1 }}>
                    <Path path={path3} color={theme.colors.primary} opacity={0.2} />
                    <Path path={path1} color={theme.colors.primary} opacity={0.4} />
                    <Path path={path2} color={theme.colors.primary} opacity={0.6} />
                </Canvas>
            </View>

            <View style={styles.infoBox}>
                <Text style={styles.infoTitle}>The R&D Secret</Text>
                <Text style={styles.infoText}>
                    We don't just move a line. We calculate the Y coordinates using the sine wave formula:
                </Text>
                <Text style={styles.formula}>y = A * sin(B * x + C)</Text>
                <Text style={styles.infoText}>
                    Where <Text style={{ fontWeight: 'bold' }}>A</Text> is amplitude, <Text style={{ fontWeight: 'bold' }}>B</Text> is frequency, and <Text style={{ fontWeight: 'bold' }}>C</Text> is the phase (driven by time). Overlapping waves with different properties create this depth.
                </Text>
            </View>
        </SafeAreaView>
    );
}

const stylesheet = createStyleSheet((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        padding: theme.spacing.lg,
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
    canvasContainer: {
        height: CANVAS_HEIGHT,
        backgroundColor: theme.colors.surface,
        marginVertical: theme.spacing.xl,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: theme.colors.border,
    },
    infoBox: {
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.surface,
        marginHorizontal: theme.spacing.md,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.accent,
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        color: theme.colors.typography,
        lineHeight: 20,
        opacity: 0.8,
    },
    formula: {
        fontSize: 18,
        fontFamily: 'monospace',
        color: theme.colors.primary,
        textAlign: 'center',
        marginVertical: 12,
        fontWeight: '600',
    },
}));
