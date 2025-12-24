import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
  Dimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useEditorStore } from '../store/editorStore';
import { EditMode, CropRatio, formatTimeShort } from '../types/editor';
import { colors, spacing, radius } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Crop presets
const cropPresets: { ratio: CropRatio; label: string; icon: string }[] = [
  { ratio: '1:1', label: '1:1', icon: 'crop-square' },
  { ratio: '4:5', label: '4:5', icon: 'crop-portrait' },
  { ratio: '16:9', label: '16:9', icon: 'crop-landscape' },
  { ratio: '9:16', label: '9:16', icon: 'crop-portrait' },
  { ratio: 'free', label: 'Free', icon: 'crop-free' },
];

// Rotation options
const rotationOptions: { degrees: 90 | 180 | 270; label: string; icon: string }[] = [
  { degrees: 90, label: '90°', icon: 'rotate-right' },
  { degrees: 180, label: '180°', icon: 'autorenew' },
  { degrees: 270, label: '270°', icon: 'rotate-left' },
];

// Speed options
const speedOptions: { multiplier: number; label: string }[] = [
  { multiplier: 0.25, label: '0.25x' },
  { multiplier: 0.5, label: '0.5x' },
  { multiplier: 0.75, label: '0.75x' },
  { multiplier: 1, label: '1x' },
  { multiplier: 1.5, label: '1.5x' },
  { multiplier: 2, label: '2x' },
  { multiplier: 2.5, label: '2.5x' },
  { multiplier: 3, label: '3x' },
];

// Merge modes
const mergeModes: { mode: 'append' | 'side-by-side' | 'top-bottom'; label: string; icon: string }[] = [
  { mode: 'append', label: 'Append', icon: 'arrow-right-bold' },
  { mode: 'side-by-side', label: 'Side', icon: 'view-column' },
  { mode: 'top-bottom', label: 'Stack', icon: 'view-stream' },
];

// Chip button component
interface ChipButtonProps {
  label: string;
  icon?: string;
  isActive?: boolean;
  onPress: () => void;
  small?: boolean;
}

const ChipButton: React.FC<ChipButtonProps> = ({ label, icon, isActive, onPress, small }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.chip,
        isActive && styles.chipActive,
        small && styles.chipSmall,
      ]}
    >
      {icon && (
        <Icon
          name={icon}
          size={small ? 14 : 16}
          color={isActive ? colors.background : colors.textSecondary}
          style={styles.chipIcon}
        />
      )}
      <Text
        style={[
          styles.chipLabel,
          isActive && styles.chipLabelActive,
          small && styles.chipLabelSmall,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

// Trim Panel
const TrimPanel: React.FC = () => {
  const { trimStart, trimEnd, project, applyTrim, setActiveMode } = useEditorStore();
  const duration = project?.source.duration || 0;

  return (
    <View style={styles.panelContent}>
      <View style={styles.trimInfo}>
        <View style={styles.trimTimeBox}>
          <Text style={styles.trimLabel}>Start</Text>
          <Text style={styles.trimValue}>{formatTimeShort(trimStart)}</Text>
        </View>
        <Icon name="arrow-right" size={16} color={colors.textMuted} />
        <View style={styles.trimTimeBox}>
          <Text style={styles.trimLabel}>End</Text>
          <Text style={styles.trimValue}>{formatTimeShort(trimEnd)}</Text>
        </View>
        <View style={styles.trimDurationBox}>
          <Text style={styles.trimLabel}>Duration</Text>
          <Text style={styles.trimDurationValue}>
            {formatTimeShort(trimEnd - trimStart)}
          </Text>
        </View>
      </View>
      <Text style={styles.hintText}>Drag handles on timeline to trim</Text>
      <View style={styles.panelActions}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => setActiveMode('none')}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.applyButton} onPress={applyTrim}>
          <Icon name="check" size={16} color={colors.background} />
          <Text style={styles.applyText}>Apply</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Crop Panel
const CropPanel: React.FC = () => {
  const { cropPreset, setCropPreset, applyCrop, setActiveMode } = useEditorStore();

  return (
    <View style={styles.panelContent}>
      <Text style={styles.sectionTitle}>Aspect Ratio</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        <View style={styles.chipRow}>
          {cropPresets.map((preset) => (
            <ChipButton
              key={preset.ratio}
              label={preset.label}
              icon={preset.icon}
              isActive={cropPreset === preset.ratio}
              onPress={() => setCropPreset(preset.ratio)}
              small
            />
          ))}
        </View>
      </ScrollView>
      <View style={styles.panelActions}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => setActiveMode('none')}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.applyButton} onPress={applyCrop}>
          <Icon name="check" size={16} color={colors.background} />
          <Text style={styles.applyText}>Apply</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Rotate Panel
const RotatePanel: React.FC = () => {
  const { addRotation, addFlip, setActiveMode } = useEditorStore();

  return (
    <View style={styles.panelContent}>
      <View style={styles.rotateRow}>
        <View style={styles.rotateSection}>
          <Text style={styles.sectionTitleSmall}>Rotate</Text>
          <View style={styles.chipRowCompact}>
            {rotationOptions.map((option) => (
              <ChipButton
                key={option.degrees}
                label={option.label}
                icon={option.icon}
                onPress={() => {
                  addRotation(option.degrees);
                  setActiveMode('none');
                }}
                small
              />
            ))}
          </View>
        </View>
        <View style={styles.rotateSection}>
          <Text style={styles.sectionTitleSmall}>Flip</Text>
          <View style={styles.chipRowCompact}>
            <ChipButton
              label="H"
              icon="flip-horizontal"
              onPress={() => {
                addFlip(true, false);
                setActiveMode('none');
              }}
              small
            />
            <ChipButton
              label="V"
              icon="flip-vertical"
              onPress={() => {
                addFlip(false, true);
                setActiveMode('none');
              }}
              small
            />
          </View>
        </View>
      </View>
    </View>
  );
};

// Speed Panel
const SpeedPanel: React.FC = () => {
  const { project, addSpeed, setActiveMode } = useEditorStore();
  const currentSpeed = project?.operations.find((op) => op.type === 'speed');
  const activeMultiplier = currentSpeed?.type === 'speed' ? currentSpeed.multiplier : 1;

  return (
    <View style={styles.panelContent}>
      <Text style={styles.sectionTitle}>Playback Speed</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        <View style={styles.chipRow}>
          {speedOptions.map((option) => (
            <ChipButton
              key={option.multiplier}
              label={option.label}
              isActive={activeMultiplier === option.multiplier}
              onPress={() => {
                addSpeed(option.multiplier);
                setActiveMode('none');
              }}
              small
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

// Audio Panel
const AudioPanel: React.FC = () => {
  const { addAudioMute, setActiveMode } = useEditorStore();

  return (
    <View style={styles.panelContent}>
      <Text style={styles.sectionTitle}>Audio Options</Text>
      <View style={styles.chipRow}>
        <ChipButton
          label="Mute"
          icon="volume-off"
          onPress={() => {
            addAudioMute();
            setActiveMode('none');
          }}
        />
        <ChipButton
          label="Replace"
          icon="music-note"
          onPress={() => {
            setActiveMode('none');
          }}
        />
      </View>
    </View>
  );
};

// Text Panel
const TextPanel: React.FC = () => {
  const { addTextOverlay, setActiveMode } = useEditorStore();

  return (
    <View style={styles.panelContent}>
      <Text style={styles.sectionTitle}>Add Text Overlay</Text>
      <TouchableOpacity
        style={styles.addTextButton}
        onPress={() => {
          addTextOverlay('Sample Text', 0.5, 0.5);
          setActiveMode('none');
        }}
      >
        <Icon name="format-text" size={20} color={colors.primary} />
        <Text style={styles.addTextLabel}>Tap to add text</Text>
      </TouchableOpacity>
    </View>
  );
};

// Merge Panel
const MergePanel: React.FC = () => {
  const { setActiveMode } = useEditorStore();

  return (
    <View style={styles.panelContent}>
      <Text style={styles.sectionTitle}>Merge Videos</Text>
      <View style={styles.mergeGrid}>
        {mergeModes.map((mode) => (
          <TouchableOpacity
            key={mode.mode}
            style={styles.mergeOption}
            onPress={() => {
              setActiveMode('none');
            }}
          >
            <View style={styles.mergeIconBox}>
              <Icon name={mode.icon} size={24} color={colors.primary} />
            </View>
            <Text style={styles.mergeLabel}>{mode.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// Main Tool Panel
interface ToolPanelProps {
  activeMode: EditMode;
}

const ToolPanel: React.FC<ToolPanelProps> = ({ activeMode }) => {
  if (activeMode !== 'trim') return null;

  return (
    <Animated.View
      style={styles.container}
      entering={SlideInDown.duration(200)}
      exiting={SlideOutDown.duration(150)}
    >
      <TrimPanel />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    maxHeight: 180,
  },
  panelContent: {
    padding: spacing.md,
  },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  sectionTitleSmall: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  chipScroll: {
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  chipRowCompact: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceLight,
  },
  chipSmall: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chipActive: {
    backgroundColor: colors.primary,
  },
  chipIcon: {
    marginRight: spacing.xs,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  chipLabelSmall: {
    fontSize: 12,
  },
  chipLabelActive: {
    color: colors.background,
  },

  // Trim panel
  trimInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  trimTimeBox: {
    alignItems: 'center',
  },
  trimLabel: {
    color: colors.textMuted,
    fontSize: 9,
    marginBottom: 2,
  },
  trimValue: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  trimDurationBox: {
    alignItems: 'center',
    paddingLeft: spacing.md,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  trimDurationValue: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },

  // Actions
  panelActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  cancelText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    gap: spacing.xs,
  },
  applyText: {
    color: colors.background,
    fontSize: 13,
    fontWeight: '600',
  },

  // Rotate
  rotateRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  rotateSection: {
    flex: 1,
  },

  // Merge options
  mergeGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  mergeOption: {
    alignItems: 'center',
    padding: spacing.sm,
  },
  mergeIconBox: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  mergeLabel: {
    color: colors.textSecondary,
    fontSize: 11,
  },

  // Text
  addTextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceLight,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    gap: spacing.sm,
  },
  addTextLabel: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },

  // Hint
  hintText: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
});

export default ToolPanel;
