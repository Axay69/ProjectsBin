import React, { useCallback, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useEditorStore } from '../store/editorStore';
import { CropRatio } from '../types/editor';
import { colors, spacing } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PREVIEW_WIDTH = SCREEN_WIDTH - spacing.lg * 2;
const PREVIEW_HEIGHT = PREVIEW_WIDTH * (16 / 9);
const HANDLE_SIZE = 24;
const MIN_SIZE = 50;

interface CropOverlayProps {
  videoWidth: number;
  videoHeight: number;
}

const CropOverlay: React.FC<CropOverlayProps> = ({ videoWidth, videoHeight }) => {
  const { cropPreset, setCropRect, activeMode } = useEditorStore();

  // Shared values for crop box
  const x = useSharedValue(PREVIEW_WIDTH * 0.1);
  const y = useSharedValue(PREVIEW_HEIGHT * 0.1);
  const width = useSharedValue(PREVIEW_WIDTH * 0.8);
  const height = useSharedValue(PREVIEW_HEIGHT * 0.8);

  // Store last context for gestures
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const startWidth = useSharedValue(0);
  const startHeight = useSharedValue(0);

  // Stable callback for runOnJS
  const updateCropRectCallback = useCallback((cropX: number, cropY: number, cropW: number, cropH: number) => {
    const scaleX = videoWidth / PREVIEW_WIDTH;
    const scaleY = videoHeight / PREVIEW_HEIGHT;
    setCropRect({
      x: cropX * scaleX,
      y: cropY * scaleY,
      width: cropW * scaleX,
      height: cropH * scaleY,
    });
  }, [videoWidth, videoHeight, setCropRect]);

  // Calculate dimensions based on aspect ratio
  const getAspectRatioDimensions = useCallback((ratio: CropRatio) => {
    const maxWidth = PREVIEW_WIDTH * 0.9;
    const maxHeight = PREVIEW_HEIGHT * 0.9;

    let targetWidth: number;
    let targetHeight: number;

    switch (ratio) {
      case '1:1':
        targetWidth = targetHeight = Math.min(maxWidth, maxHeight);
        break;
      case '4:5':
        targetHeight = maxHeight;
        targetWidth = (targetHeight * 4) / 5;
        if (targetWidth > maxWidth) {
          targetWidth = maxWidth;
          targetHeight = (targetWidth * 5) / 4;
        }
        break;
      case '16:9':
        targetWidth = maxWidth;
        targetHeight = (targetWidth * 9) / 16;
        if (targetHeight > maxHeight) {
          targetHeight = maxHeight;
          targetWidth = (targetHeight * 16) / 9;
        }
        break;
      case '9:16':
        targetHeight = maxHeight;
        targetWidth = (targetHeight * 9) / 16;
        if (targetWidth > maxWidth) {
          targetWidth = maxWidth;
          targetHeight = (targetWidth * 16) / 9;
        }
        break;
      default:
        targetWidth = maxWidth;
        targetHeight = maxHeight;
    }

    return { width: targetWidth, height: targetHeight };
  }, []);

  // Update crop box when preset changes
  useEffect(() => {
    if (activeMode === 'crop') {
      const dims = getAspectRatioDimensions(cropPreset);
      width.value = withSpring(dims.width);
      height.value = withSpring(dims.height);
      x.value = withSpring((PREVIEW_WIDTH - dims.width) / 2);
      y.value = withSpring((PREVIEW_HEIGHT - dims.height) / 2);
    }
  }, [cropPreset, activeMode, getAspectRatioDimensions, width, height, x, y]);

  // Move crop box gesture
  const moveGesture = Gesture.Pan()
    .onStart(() => {
      'worklet';
      startX.value = x.value;
      startY.value = y.value;
    })
    .onUpdate((event) => {
      'worklet';
      const newX = Math.max(0, Math.min(startX.value + event.translationX, PREVIEW_WIDTH - width.value));
      const newY = Math.max(0, Math.min(startY.value + event.translationY, PREVIEW_HEIGHT - height.value));
      x.value = newX;
      y.value = newY;
    })
    .onEnd(() => {
      'worklet';
      runOnJS(updateCropRectCallback)(x.value, y.value, width.value, height.value);
    });

  // Corner resize gestures
  const createCornerGesture = (corner: 'tl' | 'tr' | 'bl' | 'br') => {
    return Gesture.Pan()
      .onStart(() => {
        'worklet';
        startX.value = x.value;
        startY.value = y.value;
        startWidth.value = width.value;
        startHeight.value = height.value;
      })
      .onUpdate((event) => {
        'worklet';
        let newX = startX.value;
        let newY = startY.value;
        let newWidth = startWidth.value;
        let newHeight = startHeight.value;

        const dx = event.translationX;
        const dy = event.translationY;

        switch (corner) {
          case 'tl':
            newX = Math.min(startX.value + dx, startX.value + startWidth.value - MIN_SIZE);
            newY = Math.min(startY.value + dy, startY.value + startHeight.value - MIN_SIZE);
            newWidth = startWidth.value - dx;
            newHeight = startHeight.value - dy;
            break;
          case 'tr':
            newY = Math.min(startY.value + dy, startY.value + startHeight.value - MIN_SIZE);
            newWidth = startWidth.value + dx;
            newHeight = startHeight.value - dy;
            break;
          case 'bl':
            newX = Math.min(startX.value + dx, startX.value + startWidth.value - MIN_SIZE);
            newWidth = startWidth.value - dx;
            newHeight = startHeight.value + dy;
            break;
          case 'br':
            newWidth = startWidth.value + dx;
            newHeight = startHeight.value + dy;
            break;
        }

        // Constrain
        newX = Math.max(0, newX);
        newY = Math.max(0, newY);
        newWidth = Math.max(MIN_SIZE, Math.min(newWidth, PREVIEW_WIDTH - newX));
        newHeight = Math.max(MIN_SIZE, Math.min(newHeight, PREVIEW_HEIGHT - newY));

        x.value = newX;
        y.value = newY;
        width.value = newWidth;
        height.value = newHeight;
      })
      .onEnd(() => {
        'worklet';
        runOnJS(updateCropRectCallback)(x.value, y.value, width.value, height.value);
      });
  };

  // Animated styles
  const cropBoxStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      left: x.value,
      top: y.value,
      width: width.value,
      height: height.value,
    };
  });

  const overlayTopStyle = useAnimatedStyle(() => {
    'worklet';
    return { height: y.value };
  });

  const overlayBottomStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      top: y.value + height.value,
      height: PREVIEW_HEIGHT - (y.value + height.value),
    };
  });

  const overlayLeftStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      top: y.value,
      height: height.value,
      width: x.value,
    };
  });

  const overlayRightStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      top: y.value,
      height: height.value,
      left: x.value + width.value,
      width: PREVIEW_WIDTH - (x.value + width.value),
    };
  });

  if (activeMode !== 'crop') return null;

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Darkened overlays */}
      <Animated.View style={[styles.overlay, styles.overlayTop, overlayTopStyle]} />
      <Animated.View style={[styles.overlay, styles.overlayBottom, overlayBottomStyle]} />
      <Animated.View style={[styles.overlay, styles.overlayLeft, overlayLeftStyle]} />
      <Animated.View style={[styles.overlay, styles.overlayRight, overlayRightStyle]} />

      {/* Crop box */}
      <GestureDetector gesture={moveGesture}>
        <Animated.View style={[styles.cropBox, cropBoxStyle]}>
          {/* Grid lines */}
          <View style={styles.gridContainer}>
            <View style={[styles.gridLine, styles.gridLineH, { top: '33.33%' }]} />
            <View style={[styles.gridLine, styles.gridLineH, { top: '66.66%' }]} />
            <View style={[styles.gridLine, styles.gridLineV, { left: '33.33%' }]} />
            <View style={[styles.gridLine, styles.gridLineV, { left: '66.66%' }]} />
          </View>

          {/* Corner handles */}
          <GestureDetector gesture={createCornerGesture('tl')}>
            <View style={[styles.handle, styles.handleTL]} />
          </GestureDetector>
          <GestureDetector gesture={createCornerGesture('tr')}>
            <View style={[styles.handle, styles.handleTR]} />
          </GestureDetector>
          <GestureDetector gesture={createCornerGesture('bl')}>
            <View style={[styles.handle, styles.handleBL]} />
          </GestureDetector>
          <GestureDetector gesture={createCornerGesture('br')}>
            <View style={[styles.handle, styles.handleBR]} />
          </GestureDetector>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  overlayTop: {
    top: 0,
    left: 0,
    right: 0,
  },
  overlayBottom: {
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayLeft: {
    left: 0,
  },
  overlayRight: {
    right: 0,
  },
  cropBox: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  gridContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  gridLineH: {
    left: 0,
    right: 0,
    height: 1,
  },
  gridLineV: {
    top: 0,
    bottom: 0,
    width: 1,
  },
  handle: {
    position: 'absolute',
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    backgroundColor: colors.primary,
    borderRadius: HANDLE_SIZE / 2,
  },
  handleTL: {
    top: -HANDLE_SIZE / 2,
    left: -HANDLE_SIZE / 2,
  },
  handleTR: {
    top: -HANDLE_SIZE / 2,
    right: -HANDLE_SIZE / 2,
  },
  handleBL: {
    bottom: -HANDLE_SIZE / 2,
    left: -HANDLE_SIZE / 2,
  },
  handleBR: {
    bottom: -HANDLE_SIZE / 2,
    right: -HANDLE_SIZE / 2,
  },
});

export default CropOverlay;
