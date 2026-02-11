import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createStyleSheet, useStyles } from 'react-native-unistyles';
import {
    Canvas,
    Circle,
    Group,
    Blur,
    ColorMatrix,
    Paint,
} from '@shopify/react-native-skia';
import {
    Gesture,
    GestureDetector,
    GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const CANVAS_WIDTH = width;
const CANVAS_HEIGHT = height * 0.6;
const CIRCLE_RADIUS = 60;

// The magic matrix for Metaballs
// This increases the contrast of the alpha channel enormously, 
// turning a blurred edge into a sharp, sticky one.
const layerPaint = (
    <Paint>
        <Blur blur={20} />
        <ColorMatrix
            matrix={[
                1, 0, 0, 0, 0,
                0, 1, 0, 0, 0,
                0, 0, 1, 0, 0,
                0, 0, 0, 60, -20,
            ]}
        />
    </Paint>
);

export default function SkiaLiquidDemoScreen() {
    const { styles, theme } = useStyles(stylesheet);

    // Position of the movable circle
    const translateX = useSharedValue(CANVAS_WIDTH / 2);
    const translateY = useSharedValue(CANVAS_HEIGHT / 2);

    // Position of the static circle
    const staticX = CANVAS_WIDTH / 2;
    const staticY = CANVAS_HEIGHT / 2 - 100;

    const gesture = Gesture.Pan()
        .onChange((event) => {
            translateX.value = withSpring(event.absoluteX);
            translateY.value = withSpring(event.absoluteY - 100); // Offset for header/safe area
        })
        .onEnd(() => {
            // Optional: Snap back or stay put
        });

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={styles.container}>
                <View style={styles.headerContainer}>
                    <Text style={styles.title}>Liquid Fusion</Text>
                    <Text style={styles.subtitle}>Skia Metaballs + Reanimated</Text>
                </View>

                <GestureDetector gesture={gesture}>
                    <View style={styles.canvasContainer}>
                        <Canvas style={styles.canvas}>
                            <Group layer={layerPaint}>
                                {/* Static Circle */}
                                <Circle cx={staticX} cy={staticY} r={CIRCLE_RADIUS} color={theme.colors.primary} />

                                {/* Movable Circle */}
                                <Circle cx={translateX} cy={translateY} r={CIRCLE_RADIUS} color={theme.colors.primary} />
                            </Group>
                        </Canvas>
                    </View>
                </GestureDetector>

                <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>The R&D Secret</Text>
                    <Text style={styles.infoText}>
                        This "Liquid" look is a visual trick. We apply a heavy Blur to the circles,
                        then use a Color Matrix to crank up the alpha contrast.
                        This makes the blurry edges sharp and "sticky" when they overlap.
                    </Text>
                </View>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
}

const stylesheet = createStyleSheet((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    headerContainer: {
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
        flex: 1,
        backgroundColor: theme.colors.surface,
        marginHorizontal: theme.spacing.md,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    canvas: {
        flex: 1,
    },
    infoBox: {
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.surface,
        margin: theme.spacing.md,
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
}));
