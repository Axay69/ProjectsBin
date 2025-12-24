import React, { useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  withRepeat,
  Easing,
  interpolate,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useEditorStore } from '../store/editorStore';
import { Operation } from '../types/editor';
import { colors, spacing, radius } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MODAL_WIDTH = SCREEN_WIDTH - spacing.xl * 2;
const CIRCLE_SIZE = 120;
const STROKE_WIDTH = 8;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Get operation label for display
const getOperationLabel = (op: Operation): string => {
  switch (op.type) {
    case 'trim':
      return `Trim: ${op.start.toFixed(1)}s - ${op.end.toFixed(1)}s`;
    case 'crop':
      return `Crop: ${op.ratio}`;
    case 'rotate':
      return `Rotate: ${op.degrees}°`;
    case 'flip':
      return `Flip: ${op.horizontal ? 'H' : ''}${op.vertical ? 'V' : ''}`;
    case 'speed':
      return `Speed: ${op.multiplier}x`;
    case 'audio':
      return `Audio: ${op.action}`;
    case 'text':
      return `Text: "${op.content.substring(0, 15)}..."`;
    case 'sticker':
      return 'Sticker';
    case 'merge':
      return `Merge: ${op.mode}`;
    default:
      return 'Unknown';
  }
};

// Get operation icon
const getOperationIcon = (type: Operation['type']): string => {
  const icons: Record<Operation['type'], string> = {
    trim: 'content-cut',
    cut: 'scissors-cutting',
    crop: 'crop',
    rotate: 'rotate-right',
    flip: 'flip-horizontal',
    speed: 'speedometer',
    audio: 'volume-high',
    text: 'format-text',
    sticker: 'sticker-emoji',
    merge: 'view-grid-plus',
  };
  return icons[type] || 'help-circle';
};

interface ExportModalProps {
  visible: boolean;
  onClose: () => void;
  onExport: () => Promise<void>;
}

const ExportModal: React.FC<ExportModalProps> = ({
  visible,
  onClose,
  onExport,
}) => {
  const { project, exportProgress, isExporting, setExporting, setExportProgress } =
    useEditorStore();

  const progress = useSharedValue(0);
  const rotation = useSharedValue(0);
  const checkScale = useSharedValue(0);

  const operations = project?.operations || [];
  const isComplete = exportProgress >= 100;

  // Update progress animation
  useEffect(() => {
    progress.value = withTiming(exportProgress / 100, {
      duration: 300,
      easing: Easing.out(Easing.ease),
    });

    if (isComplete) {
      checkScale.value = withSpring(1, { damping: 10 });
    }
  }, [exportProgress, isComplete, progress, checkScale]);

  // Spinning animation while exporting
  useEffect(() => {
    if (isExporting && !isComplete) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 2000, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      rotation.value = withTiming(0);
    }
  }, [isExporting, isComplete, rotation]);

  // Start export
  const handleStartExport = useCallback(async () => {
    setExporting(true);
    setExportProgress(0);

    try {
      await onExport();
    } catch (error) {
      console.error('Export failed:', error);
      setExporting(false);
    }
  }, [onExport, setExporting, setExportProgress]);

  // Handle close
  const handleClose = () => {
    setExporting(false);
    setExportProgress(0);
    onClose();
  };

  // Animated styles
  const circleStyle = useAnimatedStyle(() => {
    const strokeDashoffset = interpolate(
      progress.value,
      [0, 1],
      [CIRCUMFERENCE, 0]
    );
    return {
      strokeDashoffset,
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkScale.value,
  }));

  const progressTextStyle = useAnimatedStyle(() => ({
    opacity: isComplete ? 0 : 1,
  }));

  // Export steps
  const exportSteps = [
    { label: 'Preparing', icon: 'file-document-outline', threshold: 10 },
    { label: 'Processing', icon: 'cog-outline', threshold: 40 },
    { label: 'Encoding', icon: 'video-outline', threshold: 80 },
    { label: 'Finalizing', icon: 'check-circle-outline', threshold: 100 },
  ];

  const currentStep = exportSteps.findIndex(
    (step) => exportProgress < step.threshold
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={styles.modal}
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {isExporting ? (isComplete ? 'Export Complete!' : 'Exporting...') : 'Export Video'}
            </Text>
            {!isExporting && (
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Icon name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Progress Circle */}
          <View style={styles.progressContainer}>
            <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
              {/* Background circle */}
              <Circle
                cx={CIRCLE_SIZE / 2}
                cy={CIRCLE_SIZE / 2}
                r={RADIUS}
                stroke={colors.surfaceLight}
                strokeWidth={STROKE_WIDTH}
                fill="none"
              />
              {/* Progress circle */}
              <AnimatedCircle
                cx={CIRCLE_SIZE / 2}
                cy={CIRCLE_SIZE / 2}
                r={RADIUS}
                stroke={colors.primary}
                strokeWidth={STROKE_WIDTH}
                fill="none"
                strokeDasharray={CIRCUMFERENCE}
                strokeLinecap="round"
                style={circleStyle}
                transform={`rotate(-90 ${CIRCLE_SIZE / 2} ${CIRCLE_SIZE / 2})`}
              />
            </Svg>

            {/* Progress text / Check icon */}
            <View style={styles.progressTextContainer}>
              <Animated.Text style={[styles.progressText, progressTextStyle]}>
                {Math.round(exportProgress)}%
              </Animated.Text>
              <Animated.View style={[styles.checkContainer, checkStyle]}>
                <Icon name="check" size={40} color={colors.primary} />
              </Animated.View>
            </View>
          </View>

          {/* Export steps */}
          {isExporting && (
            <View style={styles.stepsContainer}>
              {exportSteps.map((step, index) => {
                const isActive = index === currentStep;
                const isCompleted = index < currentStep || isComplete;

                return (
                  <View key={step.label} style={styles.stepItem}>
                    <View
                      style={[
                        styles.stepIcon,
                        isActive && styles.stepIconActive,
                        isCompleted && styles.stepIconCompleted,
                      ]}
                    >
                      <Icon
                        name={isCompleted ? 'check' : step.icon}
                        size={16}
                        color={
                          isCompleted
                            ? colors.background
                            : isActive
                            ? colors.primary
                            : colors.textMuted
                        }
                      />
                    </View>
                    <Text
                      style={[
                        styles.stepLabel,
                        isActive && styles.stepLabelActive,
                        isCompleted && styles.stepLabelCompleted,
                      ]}
                    >
                      {step.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* Operations summary */}
          {!isExporting && operations.length > 0 && (
            <View style={styles.operationsContainer}>
              <Text style={styles.operationsTitle}>
                {operations.length} edit{operations.length !== 1 ? 's' : ''} will be applied:
              </Text>
              <View style={styles.operationsList}>
                {operations.slice(0, 4).map((op, index) => (
                  <View key={op.id} style={styles.operationChip}>
                    <Icon
                      name={getOperationIcon(op.type)}
                      size={14}
                      color={colors.primary}
                    />
                    <Text style={styles.operationLabel}>
                      {getOperationLabel(op)}
                    </Text>
                  </View>
                ))}
                {operations.length > 4 && (
                  <Text style={styles.moreOps}>
                    +{operations.length - 4} more
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            {isComplete ? (
              <>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handleClose}
                >
                  <Text style={styles.secondaryButtonText}>Close</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.primaryButton}>
                  <Icon name="content-save" size={18} color={colors.background} />
                  <Text style={styles.primaryButtonText}>Save to Gallery</Text>
                </TouchableOpacity>
              </>
            ) : isExporting ? (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleClose}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handleClose}
                >
                  <Text style={styles.secondaryButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    operations.length === 0 && styles.primaryButtonDisabled,
                  ]}
                  onPress={handleStartExport}
                  disabled={operations.length === 0}
                >
                  <Icon name="export-variant" size={18} color={colors.background} />
                  <Text style={styles.primaryButtonText}>Export</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: MODAL_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  closeButton: {
    padding: spacing.xs,
  },

  // Progress
  progressContainer: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  progressTextContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  checkContainer: {
    position: 'absolute',
  },

  // Steps
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.md,
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  stepIconActive: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  stepIconCompleted: {
    backgroundColor: colors.primary,
  },
  stepLabel: {
    fontSize: 10,
    color: colors.textMuted,
  },
  stepLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  stepLabelCompleted: {
    color: colors.textSecondary,
  },

  // Operations
  operationsContainer: {
    marginVertical: spacing.md,
  },
  operationsTitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  operationsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  operationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    gap: spacing.xs,
  },
  operationLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  moreOps: {
    fontSize: 11,
    color: colors.textMuted,
    alignSelf: 'center',
    marginLeft: spacing.xs,
  },

  // Actions
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  secondaryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  secondaryButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    gap: spacing.xs,
  },
  primaryButtonDisabled: {
    backgroundColor: colors.surfaceLight,
  },
  primaryButtonText: {
    fontSize: 14,
    color: colors.background,
    fontWeight: '600',
  },
  cancelButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  cancelButtonText: {
    fontSize: 14,
    color: colors.textMuted,
  },
});

export default ExportModal;
