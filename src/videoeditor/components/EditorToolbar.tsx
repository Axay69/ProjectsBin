import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useEditorStore } from '../store/editorStore';
import { EditMode, EditorTool } from '../types/editor';
import { colors, spacing, radius } from '../theme';

// Define available tools
const tools: EditorTool[] = [
  { id: 'trim', icon: 'content-cut', label: 'Trim' },
];

interface ToolButtonProps {
  tool: EditorTool;
  isActive: boolean;
  onPress: () => void;
}

const ToolButton: React.FC<ToolButtonProps> = ({ tool, isActive, onPress }) => {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(isActive ? 1.05 : 1, { damping: 15 }),
      },
    ],
    backgroundColor: withTiming(
      isActive ? colors.primary : colors.surface,
      { duration: 150 }
    ),
  }));

  const iconColor = isActive ? colors.background : colors.textSecondary;
  const textColor = isActive ? colors.primary : colors.textMuted;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View style={styles.toolButtonContainer}>
        <Animated.View style={[styles.toolButton, animatedStyle]}>
          <Icon name={tool.icon} size={22} color={iconColor} />
        </Animated.View>
        <Text style={[styles.toolLabel, { color: textColor }]}>{tool.label}</Text>
        {isActive && <View style={styles.activeIndicator} />}
      </View>
    </TouchableOpacity>
  );
};

interface EditorToolbarProps {
  onToolSelect?: (tool: EditMode) => void;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({ onToolSelect }) => {
  const { activeMode, setActiveMode } = useEditorStore();

  const handleToolPress = (toolId: EditMode) => {
    // Toggle off if already active
    const newMode = activeMode === toolId ? 'none' : toolId;
    setActiveMode(newMode);
    onToolSelect?.(newMode);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {tools.map((tool) => (
          <ToolButton
            key={tool.id}
            tool={tool}
            isActive={activeMode === tool.id}
            onPress={() => handleToolPress(tool.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.lg,
  },
  toolButtonContainer: {
    alignItems: 'center',
    minWidth: 56,
  },
  toolButton: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toolLabel: {
    fontSize: 10,
    marginTop: spacing.xs,
    color: colors.textMuted,
  },
  activeIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginTop: spacing.xs,
  },
});

export default EditorToolbar;
