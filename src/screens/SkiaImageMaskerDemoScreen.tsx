import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Image as RNImage,
    Dimensions,
} from 'react-native';
import {
    Canvas,
    Image,
    useImage,
    Mask,
    Rect,
    Group,
    useCanvasRef,
    Skia,
    ImageFormat,
    Circle,
    BlurMask,
    vec,
    Shadow,
    Fill,
    RoundedRect,
    Turbulence,
    DisplacementMap,
    Path,
} from '@shopify/react-native-skia';
import { launchImageLibrary } from 'react-native-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createStyleSheet, useStyles } from 'react-native-unistyles';
import FaceDetection, { Face } from '@react-native-ml-kit/face-detection';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CANVAS_SIZE = 300;

const SkiaImageMaskerDemoScreen = () => {
    const { styles, theme } = useStyles(stylesheet);
    const canvasRef = useCanvasRef();
    const openaiMaskRef = useCanvasRef();
    const [userPhotoUri, setUserPhotoUri] = useState<string | null>(null);
    const [exportedImage, setExportedImage] = useState<string | null>(null);
    const [faces, setFaces] = useState<Face[]>([]);
    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
    const image = useImage(userPhotoUri);

    const CANVAS_WIDTH = SCREEN_WIDTH - 40;
    const aspectRatio = imageDimensions.width > 0 ? imageDimensions.height / imageDimensions.width : 1;
    const dynamicCanvasHeight = CANVAS_WIDTH * aspectRatio;

    const detectFaces = async (uri: string) => {
        try {
            const result = await FaceDetection.detect(uri, {
                performanceMode: 'accurate',
                landmarkMode: 'all',                 // eyes, nose, mouth, ears
                contourMode: 'all',                  // full face outline
                classificationMode: 'all',           // smile, eyes open
            });
            console.log('result', JSON.stringify(result));

            setFaces(result);
        } catch (error) {
            console.error('Face detection failed:', error);
        }
    };

    const handleSelectImage = async () => {
        const result = await launchImageLibrary({ mediaType: 'photo', quality: 1 });
        if (result.assets?.[0]?.uri) {
            const selectedUri = result.assets[0].uri;
            setUserPhotoUri(selectedUri);
            setExportedImage(null);
            setImageDimensions({
                width: result.assets[0].width || 0,
                height: result.assets[0].height || 0,
            });
            detectFaces(selectedUri);
        }
    };

    const handleExportMask = async () => {
        if (!openaiMaskRef.current) return;
        const snapshot = openaiMaskRef.current.makeImageSnapshot();
        if (snapshot) {
            const base64Mask = snapshot.encodeToBase64(ImageFormat.PNG, 100);
            setExportedImage(`data:image/png;base64,${base64Mask}`);
        }
    };

    const handleDownloadMask = async () => {
        if (!exportedImage) return;

        try {
            const base64Data = exportedImage.replace(/^data:image\/png;base64,/, '');
            const filePath = `${RNFS.CachesDirectoryPath}/openai_mask_${Date.now()}.png`;

            await RNFS.writeFile(filePath, base64Data, 'base64');

            await Share.open({
                url: `file://${filePath}`,
                type: 'image/png',
                title: 'Save OpenAI Mask',
            });
        } catch (error) {
            console.error('Download failed:', error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>AI Clothing Masker</Text>
                    <Text style={styles.subtitle}>The black area becomes transparent for the AI to "paint" clothes.</Text>
                </View>

                {!userPhotoUri ? (
                    <TouchableOpacity style={styles.selectButton} onPress={handleSelectImage}>
                        <Text style={styles.buttonLabelPrimary}>Upload Subject Photo</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.demoContainer}>
                        <Text style={styles.sectionTitle}>1. Masking Preview</Text>
                        <View style={[styles.canvasWrapper, { height: dynamicCanvasHeight }]}>
                            <Canvas style={styles.skiaCanvas} ref={canvasRef}>
                                <Mask
                                    mode="alpha"
                                    mask={
                                        <Group>
                                            <Rect x={0} y={0} width={CANVAS_WIDTH} height={dynamicCanvasHeight} color="white" />
                                            <Circle
                                                cx={CANVAS_WIDTH / 2}
                                                cy={dynamicCanvasHeight / 2}
                                                r={Math.min(CANVAS_WIDTH, dynamicCanvasHeight) * 0.35}
                                                color="black"
                                            />
                                        </Group>
                                    }
                                >
                                    {image && (
                                        <Image
                                            image={image}
                                            fit="contain"
                                            x={0} y={0}
                                            width={CANVAS_WIDTH}
                                            height={dynamicCanvasHeight}
                                        />
                                    )}
                                </Mask>
                                {faces.map((face, index) => {
                                    // Calculate scaling factor
                                    const scale = CANVAS_WIDTH / imageDimensions.width;

                                    const x = face.frame.left * scale;
                                    const y = face.frame.top * scale;
                                    const w = face.frame.width * scale;
                                    const h = face.frame.height * scale;

                                    return (
                                        <Group key={index}>
                                            <RoundedRect
                                                x={x}
                                                y={y}
                                                width={w}
                                                height={h}
                                                r={8}
                                                color="rgba(0, 255, 0, 0.3)"
                                                style="stroke"
                                                strokeWidth={2}
                                            />
                                            {/* Visualize all contours */}
                                            {Object.entries(face.contours || {}).map(([key, contour]) => {
                                                if (!contour?.points) return null;
                                                const path = Skia.Path.Make();
                                                contour.points.forEach((p, i) => {
                                                    const tx = p.x * scale;
                                                    const ty = p.y * scale;
                                                    if (i === 0) path.moveTo(tx, ty);
                                                    else path.lineTo(tx, ty);
                                                });
                                                // Close loop for features like eyes and lips
                                                if (['leftEye', 'rightEye', 'upperLipTop', 'lowerLipBottom', 'face'].includes(key)) {
                                                    path.close();
                                                }
                                                return (
                                                    <Path
                                                        key={key}
                                                        path={path}
                                                        color={key === 'face' ? "rgba(0, 255, 0, 0.5)" : "cyan"}
                                                        style="stroke"
                                                        strokeWidth={1.5}
                                                    />
                                                );
                                            })}
                                            {/* Highlight landmarks */}
                                            {Object.entries(face.landmarks || {}).map(([key, landmark]) => (
                                                <Circle
                                                    key={key}
                                                    cx={landmark.position.x * scale}
                                                    cy={landmark.position.y * scale}
                                                    r={3}
                                                    color="yellow"
                                                />
                                            ))}
                                        </Group>
                                    );
                                })}
                            </Canvas>
                            {faces.length > 0 && (
                                <View style={styles.faceCountBadge}>
                                    <Text style={styles.faceCountText}>{faces.length} Face{faces.length > 1 ? 's' : ''} Detected</Text>
                                </View>
                            )}
                        </View>

                        <View style={styles.controls}>
                            <TouchableOpacity style={styles.button} onPress={handleSelectImage}>
                                <Text style={styles.buttonLabel}>New Photo</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.button, styles.exportButton]} onPress={handleExportMask}>
                                <Text style={styles.exportLabel}>Prepare for AI</Text>
                            </TouchableOpacity>
                        </View>

                        {exportedImage && (
                            <View style={styles.resultContainer}>
                                <View style={styles.resultHeader}>
                                    <Text style={styles.sectionTitle}>2. OpenAI-Ready Mask (Solid B&W)</Text>
                                    <TouchableOpacity style={styles.downloadButton} onPress={handleDownloadMask}>
                                        <MaterialCommunityIcons name="download" size={20} color={theme.colors.primary} />
                                        <Text style={styles.downloadLabel}>Save Mask</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.checkerboard}>
                                    <RNImage source={{ uri: exportedImage }} style={styles.resultImage} />
                                </View>
                                <Text style={styles.infoText}>
                                    WHITE = Protected (Face) | BLACK = AI Editable (Clothes/Background)
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                <Text style={styles.sectionTitle}>3. Blur Mask Example</Text>
                <View style={styles.exampleWrapper}>
                    <Canvas style={{ height: 300, width: SCREEN_WIDTH - 40 }}>
                        <Circle c={vec(150, 150)} r={100} color={theme.colors.primary}>
                            <BlurMask blur={20} style="normal" />
                        </Circle>
                    </Canvas>
                </View>

                <Text style={styles.sectionTitle}>4. Drop Shadow (Neumorphism)</Text>
                <View style={styles.exampleWrapper}>
                    <Canvas style={{ width: SCREEN_WIDTH - 40, height: 256 }}>
                        <Fill color={theme.colors.surface} />
                        <RoundedRect
                            x={(SCREEN_WIDTH - 40 - 192) / 2}
                            y={32}
                            width={192}
                            height={192}
                            r={32}
                            color={theme.colors.surface}
                        >
                            <Shadow dx={12} dy={12} blur={25} color={theme.colors.border} />
                            <Shadow dx={-12} dy={-12} blur={25} color={theme.colors.border} />
                        </RoundedRect>
                    </Canvas>
                </View>

                <Text style={styles.sectionTitle}>5. Inner Shadow (Neumorphism)</Text>
                <View style={styles.exampleWrapper}>
                    <Canvas style={{ width: SCREEN_WIDTH - 40, height: 256 }}>
                        <Fill color={theme.colors.surface} />
                        <RoundedRect
                            x={(SCREEN_WIDTH - 40 - 192) / 2}
                            y={32}
                            width={192}
                            height={192}
                            r={32}
                            color={theme.colors.surface}
                        >
                            <Shadow dx={12} dy={12} blur={25} color={theme.colors.border} inner />
                            <Shadow dx={-12} dy={-12} blur={25} color={theme.colors.border} inner />
                        </RoundedRect>
                    </Canvas>
                </View>

                <Text style={styles.sectionTitle}>6. Displacement Map (Turbulence)</Text>
                <View style={styles.exampleWrapper}>
                    {image ? (
                        <>
                            <Canvas style={{ width: CANVAS_WIDTH, height: dynamicCanvasHeight }}>
                                <Image
                                    image={image}
                                    x={0}
                                    y={0}
                                    width={CANVAS_WIDTH}
                                    height={dynamicCanvasHeight}
                                    fit="contain"
                                >
                                    <DisplacementMap channelX="g" channelY="a" scale={20}>
                                        <Turbulence freqX={0.01} freqY={0.05} octaves={2} seed={2} />
                                    </DisplacementMap>
                                </Image>
                            </Canvas>
                            <Canvas style={{ width: CANVAS_WIDTH, height: dynamicCanvasHeight, marginTop: 20 }}>
                                <Image
                                    image={image}
                                    x={0}
                                    y={0}
                                    width={CANVAS_WIDTH}
                                    height={dynamicCanvasHeight}
                                    fit="contain"
                                >
                                    <DisplacementMap channelX="r" channelY="r" scale={10}>
                                        <Turbulence freqX={0.5} freqY={1} octaves={2} seed={2} />
                                    </DisplacementMap>
                                </Image>
                            </Canvas>
                        </>
                    ) : (
                        <View style={{ height: 100, justifyContent: 'center' }}>
                            <Text style={styles.infoText}>Select an image to see the distortion effect</Text>
                        </View>
                    )}
                </View>

                <Text style={styles.sectionTitle}>7. Face Contour Preview (Cyan = Expanded)</Text>
                <View style={styles.exampleWrapper}>
                    {image && faces.length > 0 ? (
                        <Canvas style={{ width: CANVAS_WIDTH, height: dynamicCanvasHeight }}>
                            <Image
                                image={image}
                                x={0}
                                y={0}
                                width={CANVAS_WIDTH}
                                height={dynamicCanvasHeight}
                                fit="contain"
                                opacity={0.5}
                            />
                            {faces.map((face, index) => {
                                if (!face.contours?.face?.points) return null;
                                const scale = CANVAS_WIDTH / imageDimensions.width;

                                // Base path
                                const path = Skia.Path.Make();
                                face.contours.face.points.forEach((p, i) => {
                                    const tx = p.x * scale;
                                    const ty = p.y * scale;
                                    if (i === 0) path.moveTo(tx, ty);
                                    else path.lineTo(tx, ty);
                                });
                                path.close();

                                // Inflated path (5% expansion)
                                const inflatedPath = path.copy();
                                const bounds = inflatedPath.getBounds();
                                const centerX = bounds.x + bounds.width / 2;
                                const centerY = bounds.y + bounds.height / 2;

                                const matrix = Skia.Matrix();
                                matrix.translate(centerX, centerY);
                                matrix.scale(1.05, 1.05); // 5% buffer
                                matrix.translate(-centerX, -centerY);
                                inflatedPath.transform(matrix);

                                return (
                                    <Group key={index}>
                                        <Path path={path} color="green" style="stroke" strokeWidth={1} />
                                        <Path path={inflatedPath} color="cyan" style="stroke" strokeWidth={2} />
                                    </Group>
                                );
                            })}
                        </Canvas>
                    ) : (
                        <View style={{ height: 100, justifyContent: 'center' }}>
                            <Text style={styles.infoText}>Select an image to see the expanded face path</Text>
                        </View>
                    )}
                </View>

                {/* HIDDEN CANVAS FOR OPENAI MASK EXPORT */}
                <View style={{ height: 0, overflow: 'hidden', position: 'absolute', opacity: 0 }}>
                    <Canvas ref={openaiMaskRef} style={{ width: CANVAS_WIDTH, height: dynamicCanvasHeight }}>
                        <Rect x={0} y={0} width={CANVAS_WIDTH} height={dynamicCanvasHeight} color="black" />
                        {faces.map((face, index) => {
                            if (!face.contours?.face?.points) return null;
                            const scale = CANVAS_WIDTH / imageDimensions.width;

                            const path = Skia.Path.Make();
                            face.contours.face.points.forEach((p, i) => {
                                const tx = p.x * scale;
                                const ty = p.y * scale;
                                if (i === 0) path.moveTo(tx, ty);
                                else path.lineTo(tx, ty);
                            });
                            path.close();

                            // Inflated path for safety buffer
                            const bounds = path.getBounds();
                            const centerX = bounds.x + bounds.width / 2;
                            const centerY = bounds.y + bounds.height / 2;

                            const matrix = Skia.Matrix();
                            matrix.translate(centerX, centerY);
                            matrix.scale(1.05, 1.05);
                            matrix.translate(-centerX, -centerY);
                            path.transform(matrix);

                            return <Path key={index} path={path} color="white" />;
                        })}
                    </Canvas>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const stylesheet = createStyleSheet((theme) => ({
    container: { flex: 1, backgroundColor: theme.colors.background },
    scrollContent: { padding: 20 },
    header: { marginBottom: 24 },
    title: { fontSize: 26, fontWeight: '800', color: theme.colors.typography },
    subtitle: { fontSize: 14, color: theme.colors.subText, marginTop: 4 },
    selectButton: { backgroundColor: theme.colors.primary, padding: 20, borderRadius: 14, alignItems: 'center' },
    demoContainer: { marginTop: 10 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.typography, marginBottom: 10, marginTop: 24 },
    canvasWrapper: {
        width: SCREEN_WIDTH - 40,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: theme.colors.surface,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    skiaCanvas: { flex: 1 },
    controls: { flexDirection: 'row', gap: 12, marginTop: 24 },
    button: { flex: 1, height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.surface },
    exportButton: { backgroundColor: theme.colors.typography },
    buttonLabel: { color: theme.colors.typography, fontWeight: '600' },
    buttonLabelPrimary: { color: '#FFF', fontWeight: '600' },
    exportLabel: { color: theme.colors.background, fontWeight: '600' },
    resultContainer: { marginTop: 32 },
    checkerboard: {
        height: 300,
        backgroundColor: theme.colors.border,
        borderRadius: 16,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center'
    },
    resultImage: { width: '100%', height: '100%', resizeMode: 'contain' },
    infoText: { fontSize: 12, color: theme.colors.subText, textAlign: 'center', marginTop: 12, fontStyle: 'italic' },
    exampleWrapper: {
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: theme.colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    faceCountBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0, 255, 0, 0.8)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    faceCountText: {
        color: '#000',
        fontSize: 12,
        fontWeight: '700',
    },
    resultHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        marginTop: 24
    },
    downloadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
    downloadLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.primary,
    },
}));

export default SkiaImageMaskerDemoScreen;