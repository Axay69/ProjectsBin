import React, { useCallback } from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useEditorStore } from '../store/editorStore';
import { TextOverlay, StickerOverlay } from '../types/editor';
import { colors, spacing, radius } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PREVIEW_WIDTH = SCREEN_WIDTH - spacing.lg * 2;
const PREVIEW_HEIGHT = PREVIEW_WIDTH * (16 / 9);

interface TextOverlayItemProps {
  overlay: TextOverlay;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<TextOverlay>) => void;
  onDelete: () => void;
}

const TextOverlayItem: React.FC<TextOverlayItemProps> = ({
  overlay,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
}) => {
  // Shared values for position
  const posX = useSharedValue(overlay.x * PREVIEW_WIDTH);
  const posY = useSharedValue(overlay.y * PREVIEW_HEIGHT);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  // Stable callbacks
  const handleSelect = useCallback(() => {
    onSelect();
  }, [onSelect]);

  const handleUpdate = useCallback((x: number, y: number) => {
    onUpdate({
      x: x / PREVIEW_WIDTH,
      y: y / PREVIEW_HEIGHT,
    });
  }, [onUpdate]);

  const handleDelete = useCallback(() => {
    onDelete();
  }, [onDelete]);

  // Drag gesture
  const dragGesture = Gesture.Pan()
    .onStart(() => {
      'worklet';
      startX.value = posX.value;
      startY.value = posY.value;
      runOnJS(handleSelect)();
    })
    .onUpdate((event) => {
      'worklet';
      posX.value = Math.max(0, Math.min(startX.value + event.translationX, PREVIEW_WIDTH));
      posY.value = Math.max(0, Math.min(startY.value + event.translationY, PREVIEW_HEIGHT));
    })
    .onEnd(() => {
      'worklet';
      runOnJS(handleUpdate)(posX.value, posY.value);
    });

  // Tap gesture for selection
  const tapGesture = Gesture.Tap().onEnd(() => {
    'worklet';
    runOnJS(handleSelect)();
  });

  // Long press for delete
  const longPressGesture = Gesture.LongPress()
    .minDuration(500)
    .onEnd(() => {
      'worklet';
      runOnJS(handleDelete)();
    });

  const combinedGesture = Gesture.Race(dragGesture, tapGesture, longPressGesture);

  // Animated style
  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [
        { translateX: posX.value - 50 },
        { translateY: posY.value - 12 },
        { scale: withSpring(isSelected ? 1.05 : 1) },
      ],
    };
  });

  return (
    <GestureDetector gesture={combinedGesture}>
      <Animated.View
        style={[
          styles.textOverlay,
          animatedStyle,
          isSelected && styles.textOverlaySelected,
        ]}
      >
        <Text
          style={[
            styles.overlayText,
            {
              fontSize: overlay.fontSize,
              color: overlay.color,
              fontWeight: overlay.fontWeight,
            },
          ]}
        >
          {overlay.content}
        </Text>
        {isSelected && (
          <View style={styles.deleteButton}>
            <Icon name="close" size={12} color={colors.textPrimary} />
          </View>
        )}
      </Animated.View>
    </GestureDetector>
  );
};

interface StickerOverlayItemProps {
  overlay: StickerOverlay;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<StickerOverlay>) => void;
  onDelete: () => void;
}

const StickerOverlayItem: React.FC<StickerOverlayItemProps> = ({
  overlay,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
}) => {
  const posX = useSharedValue(overlay.x * PREVIEW_WIDTH);
  const posY = useSharedValue(overlay.y * PREVIEW_HEIGHT);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  // Stable callbacks
  const handleSelect = useCallback(() => {
    onSelect();
  }, [onSelect]);

  const handleUpdate = useCallback((x: number, y: number) => {
    onUpdate({
      x: x / PREVIEW_WIDTH,
      y: y / PREVIEW_HEIGHT,
    });
  }, [onUpdate]);

  // Drag gesture
  const dragGesture = Gesture.Pan()
    .onStart(() => {
      'worklet';
      startX.value = posX.value;
      startY.value = posY.value;
      runOnJS(handleSelect)();
    })
    .onUpdate((event) => {
      'worklet';
      posX.value = Math.max(0, Math.min(startX.value + event.translationX, PREVIEW_WIDTH));
      posY.value = Math.max(0, Math.min(startY.value + event.translationY, PREVIEW_HEIGHT));
    })
    .onEnd(() => {
      'worklet';
      runOnJS(handleUpdate)(posX.value, posY.value);
    });

  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [
        { translateX: posX.value - 40 },
        { translateY: posY.value - 40 },
      ],
    };
  });

  return (
    <GestureDetector gesture={dragGesture}>
      <Animated.View
        style={[
          styles.stickerOverlay,
          animatedStyle,
          isSelected && styles.stickerOverlaySelected,
        ]}
      >
        <Animated.Image
          source={{ uri: overlay.uri }}
          style={styles.stickerImage}
          resizeMode="contain"
        />
        {isSelected && (
          <View style={styles.deleteButton}>
            <Icon name="close" size={12} color={colors.textPrimary} />
          </View>
        )}
      </Animated.View>
    </GestureDetector>
  );
};

// Main Overlay Layer
const OverlayLayer: React.FC = () => {
  const {
    project,
    currentTime,
    selectedOperationId,
    selectOperation,
    updateOperation,
    removeOperation,
  } = useEditorStore();

  // Get visible overlays based on current time
  const textOverlays =
    project?.operations.filter(
      (op): op is TextOverlay =>
        op.type === 'text' &&
        currentTime >= op.startTime &&
        currentTime <= op.endTime
    ) || [];

  const stickerOverlays =
    project?.operations.filter(
      (op): op is StickerOverlay =>
        op.type === 'sticker' &&
        currentTime >= op.startTime &&
        currentTime <= op.endTime
    ) || [];

  const handleSelectOverlay = useCallback(
    (id: string) => {
      selectOperation(id);
    },
    [selectOperation]
  );

  const handleUpdateOverlay = useCallback(
    (id: string, updates: Partial<TextOverlay | StickerOverlay>) => {
      updateOperation(id, updates);
    },
    [updateOperation]
  );

  const handleDeleteOverlay = useCallback(
    (id: string) => {
      removeOperation(id);
    },
    [removeOperation]
  );

  if (!project) return null;

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Text overlays */}
      {textOverlays.map((overlay) => (
        <TextOverlayItem
          key={overlay.id}
          overlay={overlay}
          isSelected={selectedOperationId === overlay.id}
          onSelect={() => handleSelectOverlay(overlay.id)}
          onUpdate={(updates) => handleUpdateOverlay(overlay.id, updates)}
          onDelete={() => handleDeleteOverlay(overlay.id)}
        />
      ))}

      {/* Sticker overlays */}
      {stickerOverlays.map((overlay) => (
        <StickerOverlayItem
          key={overlay.id}
          overlay={overlay}
          isSelected={selectedOperationId === overlay.id}
          onSelect={() => handleSelectOverlay(overlay.id)}
          onUpdate={(updates) => handleUpdateOverlay(overlay.id, updates)}
          onDelete={() => handleDeleteOverlay(overlay.id)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  textOverlay: {
    position: 'absolute',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: radius.sm,
  },
  textOverlaySelected: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  overlayText: {
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  stickerOverlay: {
    position: 'absolute',
    width: 80,
    height: 80,
  },
  stickerOverlaySelected: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: radius.sm,
  },
  stickerImage: {
    width: '100%',
    height: '100%',
  },
  deleteButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default OverlayLayer;
