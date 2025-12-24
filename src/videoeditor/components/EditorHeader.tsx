import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useEditorStore } from '../store/editorStore';
import { colors, spacing, radius, layout } from '../theme';

interface EditorHeaderProps {
  onBack: () => void;
  onExport: () => void;
}

const EditorHeader: React.FC<EditorHeaderProps> = ({ onBack, onExport }) => {
  const { project } = useEditorStore();
  const operationsCount = project?.operations.length || 0;

  return (
    <View style={styles.container}>
      {/* Back button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Icon name="arrow-left" size={24} color={colors.textPrimary} />
      </TouchableOpacity>

      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Video Editor</Text>
        {operationsCount > 0 && (
          <Text style={styles.subtitle}>
            {operationsCount} edit{operationsCount !== 1 ? 's' : ''} pending
          </Text>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {/* Export button */}
        <TouchableOpacity
          style={[
            styles.exportButton,
            operationsCount === 0 && styles.exportButtonDisabled,
          ]}
          onPress={onExport}
          disabled={operationsCount === 0}
        >
          <Icon
            name="export-variant"
            size={18}
            color={operationsCount > 0 ? colors.background : colors.textMuted}
          />
          <Text
            style={[
              styles.exportText,
              operationsCount === 0 && styles.exportTextDisabled,
            ]}
          >
            Export
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: layout.headerHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  titleContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionButton: {
    padding: spacing.xs,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    gap: spacing.xs,
  },
  exportButtonDisabled: {
    backgroundColor: colors.surfaceLight,
  },
  exportText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.background,
  },
  exportTextDisabled: {
    color: colors.textMuted,
  },
});

export default EditorHeader;
