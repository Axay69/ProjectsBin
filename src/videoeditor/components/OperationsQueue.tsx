import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  Layout,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useEditorStore } from '../store/editorStore';
import { Operation } from '../types/editor';
import { colors, spacing, radius } from '../theme';

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

// Get short label for operation
const getOperationShortLabel = (op: Operation): string => {
  switch (op.type) {
    case 'trim':
      return `${op.start.toFixed(1)}s - ${op.end.toFixed(1)}s`;
    case 'crop':
      return op.ratio;
    case 'rotate':
      return `${op.degrees}°`;
    case 'flip':
      return `${op.horizontal ? 'H' : ''}${op.vertical ? 'V' : ''}`;
    case 'speed':
      return `${op.multiplier}x`;
    case 'audio':
      return op.action;
    case 'text':
      return op.content.substring(0, 10) + (op.content.length > 10 ? '...' : '');
    case 'sticker':
      return 'Sticker';
    case 'merge':
      return op.mode;
    default:
      return '';
  }
};

interface OperationChipProps {
  operation: Operation;
  onRemove: () => void;
}

const OperationChip: React.FC<OperationChipProps> = ({ operation, onRemove }) => {
  return (
    <Animated.View
      style={styles.chip}
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
      layout={Layout.springify()}
    >
      <Icon
        name={getOperationIcon(operation.type)}
        size={14}
        color={colors.primary}
      />
      <View style={styles.chipContent}>
        <Text style={styles.chipType}>{operation.type}</Text>
        <Text style={styles.chipLabel}>{getOperationShortLabel(operation)}</Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={onRemove}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Icon name="close" size={12} color={colors.textMuted} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const OperationsQueue: React.FC = () => {
  const { project, removeOperation, clearOperations } = useEditorStore();
  const operations = project?.operations || [];

  if (operations.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {operations.length} edit{operations.length !== 1 ? 's' : ''}
        </Text>
        <TouchableOpacity onPress={clearOperations}>
          <Text style={styles.clearText}>Clear all</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {operations.map((op) => (
          <OperationChip
            key={op.id}
            operation={op}
            onRemove={() => removeOperation(op.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  clearText: {
    fontSize: 12,
    color: colors.error,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    paddingLeft: spacing.sm,
    paddingRight: spacing.xs,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    gap: spacing.xs,
  },
  chipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  chipType: {
    fontSize: 11,
    color: colors.textPrimary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  chipLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  removeButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default OperationsQueue;
