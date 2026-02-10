import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createStyleSheet, useStyles } from 'react-native-unistyles';
import {
    Canvas,
    Rect,
    LinearGradient,
    RadialGradient,
    vec,
} from '@shopify/react-native-skia';

const { width, height } = Dimensions.get('window');

export default function MeshGradientDemoScreen() {
    const { styles } = useStyles(stylesheet);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.header}>Mesh Gradient</Text>
                <Text style={styles.subHeader}>Skia-powered Dynamic Visuals</Text>

                <View style={styles.canvasContainer}>
                    <Canvas style={styles.canvas}>
                        {/* Base gradient */}
                        <Rect x={0} y={0} width={width} height={height}>
                            <LinearGradient
                                start={vec(0, 0)}
                                end={vec(width, height)}
                                colors={['#6d0101d8', '#4eff69a0', '#3200c7c3']}
                            />
                        </Rect>

                        {/* Blob 1 */}
                        <Rect x={0} y={0} width={width} height={height}>
                            <RadialGradient
                                c={vec(width * 0.2, height * 0.3)}
                                r={width * 0.6}
                                colors={['rgba(255,255,255,0.35)', 'transparent']}
                            />
                        </Rect>

                        {/* Blob 2 */}
                        <Rect x={0} y={0} width={width} height={height}>
                            <RadialGradient
                                c={vec(width * 0.8, height * 0.4)}
                                r={width * 0.5}
                                colors={['rgba(0,200,255,0.35)', 'transparent']}
                            />
                        </Rect>

                        {/* Blob 3 */}
                        <Rect x={0} y={0} width={width} height={height}>
                            <RadialGradient
                                c={vec(width * 0.5, height * 0.8)}
                                r={width * 0.6}
                                colors={['rgba(255,100,200,0.25)', 'transparent']}
                            />
                        </Rect>
                    </Canvas>
                    <View style={styles.overlay}>
                        <Text style={styles.overlayText}>Premium Design</Text>
                    </View>
                </View>

                <View style={styles.info}>
                    <Text style={styles.infoTitle}>Why use Skia for gradients?</Text>
                    <Text style={styles.infoText}>
                        React Native Skia allows us to render high-performance 2D graphics directly.
                        By layering RadialGradients over a LinearGradient base, we create a "Mesh" effect that feels organic and alive.
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

const stylesheet = createStyleSheet((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        flex: 1,
        padding: theme.spacing.lg,
    },
    header: {
        fontSize: 28,
        fontWeight: '800',
        color: theme.colors.typography,
    },
    subHeader: {
        fontSize: 16,
        color: theme.colors.subText,
        marginBottom: 24,
    },
    canvasContainer: {
        flex: 1,
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 32,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: '#000',
    },
    canvas: {
        flex: 1,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    overlayText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '900',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 10,
    },
    info: {
        backgroundColor: theme.colors.surface,
        padding: 20,
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
    },
}));
