import React, { useMemo, useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  StatusBar,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import Animated, {
  Keyframe,
  Layout,
  ReanimatedKeyframe,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { ValidKeyframeProps } from 'react-native-reanimated/lib/typescript/commonTypes';

type PopPreset = { in: ReanimatedKeyframe; out: ReanimatedKeyframe };

// Helper function to generate random hex color
const getRandomHexColor = (): string => {
  return `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, '0')}`;
};

// Generate random colors for each frame
const getRandomColors = () => ({
  start: '#0000',
  mid: getRandomHexColor(),
  end: getRandomHexColor(),
});

const createPopInA = () => {
  const colors = getRandomColors();
  return new Keyframe({
    0: {
      opacity: 0,
      transform: [{ scale: 0.3 }, { rotate: '-360deg' }, { translateY: 80 }],
      backgroundColor: colors.start,
    },
    30: {
      opacity: 0.5,
      transform: [{ scale: 0.8 }, { rotate: '180deg' }, { translateY: -20 }],
      backgroundColor: getRandomHexColor(),
    },
    60: {
      opacity: 0.9,
      transform: [{ scale: 1.25 }, { rotate: '-40deg' }, { translateY: 10 }],
      backgroundColor: getRandomHexColor(),
    },
    85: {
      opacity: 1,
      transform: [{ scale: 0.95 }, { rotate: '10deg' }, { translateY: -2 }],
      backgroundColor: getRandomHexColor(),
    },
    100: {
      opacity: 1,
      transform: [{ scale: 1 }, { rotate: '0deg' }, { translateY: 0 }],
      backgroundColor: colors.end,
    },
  }).duration(900);
};

const createPopOutA = () => {
  return new Keyframe({
    0: {
      opacity: 1,
      transform: [{ scale: 1 }, { rotate: '0deg' }, { translateY: 0 }],
    },
    40: {
      opacity: 0.7,
      transform: [{ scale: 1.2 }, { rotate: '-90deg' }, { translateY: -30 }],
    },
    70: {
      opacity: 0.3,
      transform: [{ scale: 0.5 }, { rotate: '270deg' }, { translateY: 20 }],
    },
    100: {
      opacity: 0,
      transform: [{ scale: 0.1 }, { rotate: '540deg' }, { translateY: -80 }],
    },
  }).duration(800);
};

const createPopInB = () => {
  const colors = getRandomColors();
  return new Keyframe({
    0: {
      opacity: 0,
      transform: [{ scale: 0.1 }, { rotate: '-720deg' }, { translateX: -100 }],
      backgroundColor: colors.start,
    },
    30: {
      opacity: 0.4,
      transform: [{ scale: 0.6 }, { rotate: '360deg' }, { translateX: 40 }],
      backgroundColor: getRandomHexColor(),
    },
    60: {
      opacity: 0.8,
      transform: [{ scale: 1.3 }, { rotate: '-180deg' }, { translateX: -15 }],
      backgroundColor: getRandomHexColor(),
    },
    85: {
      opacity: 1,
      transform: [{ scale: 0.9 }, { rotate: '45deg' }, { translateX: 5 }],
      backgroundColor: getRandomHexColor(),
    },
    100: {
      opacity: 1,
      transform: [{ scale: 1 }, { rotate: '0deg' }, { translateX: 0 }],
      backgroundColor: colors.end,
    },
  }).duration(1000);
};

const createPopOutB = () => {
  return new Keyframe({
    0: {
      opacity: 1,
      transform: [{ scale: 1 }, { rotate: '0deg' }, { translateY: 0 }],
    },
    30: {
      opacity: 0.8,
      transform: [{ scale: 1.4 }, { rotate: '180deg' }, { translateY: -25 }],
    },
    60: {
      opacity: 0.4,
      transform: [{ scale: 0.3 }, { rotate: '-360deg' }, { translateY: 40 }],
    },
    100: {
      opacity: 0,
      transform: [{ scale: 0.05 }, { rotate: '720deg' }, { translateY: -60 }],
    },
  }).duration(850);
};

const createPopInC = () => {
  const colors = getRandomColors();
  return new Keyframe({
    0: {
      opacity: 0,
      transform: [{ scale: 0.2 }, { translateY: 120 }, { rotate: '180deg' }],
      backgroundColor: colors.start,
    },
    25: {
      opacity: 0.3,
      transform: [{ scale: 0.5 }, { translateY: 60 }, { rotate: '-90deg' }],
      backgroundColor: getRandomHexColor(),
    },
    50: {
      opacity: 0.7,
      transform: [{ scale: 1.4 }, { translateY: -40 }, { rotate: '270deg' }],
      backgroundColor: getRandomHexColor(),
    },
    75: {
      opacity: 0.9,
      transform: [{ scale: 0.8 }, { translateY: 20 }, { rotate: '-45deg' }],
      backgroundColor: getRandomHexColor(),
    },
    100: {
      opacity: 1,
      transform: [{ scale: 1 }, { translateY: 0 }, { rotate: '0deg' }],
      backgroundColor: colors.end,
    },
  }).duration(950);
};

const createPopInD = () => {
  const colors = getRandomColors();
  return new Keyframe({
    0: {
      opacity: 0,
      transform: [
        { scale: 0.05 },
        { rotate: '-1080deg' },
        { translateX: 80 },
        { translateY: 80 },
      ],
      backgroundColor: colors.start,
    },
    20: {
      opacity: 0.2,
      transform: [
        { scale: 0.3 },
        { rotate: '540deg' },
        { translateX: -50 },
        { translateY: -30 },
      ],
      backgroundColor: getRandomHexColor(),
    },
    50: {
      opacity: 0.6,
      transform: [
        { scale: 1.5 },
        { rotate: '-360deg' },
        { translateX: 30 },
        { translateY: 20 },
      ],
      backgroundColor: getRandomHexColor(),
    },
    80: {
      opacity: 0.9,
      transform: [
        { scale: 0.7 },
        { rotate: '180deg' },
        { translateX: -10 },
        { translateY: -5 },
      ],
      backgroundColor: getRandomHexColor(),
    },
    100: {
      opacity: 1,
      transform: [
        { scale: 1 },
        { rotate: '0deg' },
        { translateX: 0 },
        { translateY: 0 },
      ],
      backgroundColor: colors.end,
    },
  }).duration(1100);
};

const createPopInE = () => {
  const colors = getRandomColors();
  return new Keyframe({
    0: {
      opacity: 0,
      transform: [{ scale: 0.4 }, { rotate: '-540deg' }, { translateX: -120 }],
      backgroundColor: colors.start,
    },
    20: {
      opacity: 0.2,
      transform: [{ scale: 0.7 }, { rotate: '360deg' }, { translateX: 80 }],
      backgroundColor: getRandomHexColor(),
    },
    40: {
      opacity: 0.5,
      transform: [{ scale: 1.6 }, { rotate: '-270deg' }, { translateX: -40 }],
      backgroundColor: getRandomHexColor(),
    },
    70: {
      opacity: 0.8,
      transform: [{ scale: 0.85 }, { rotate: '135deg' }, { translateX: 15 }],
      backgroundColor: getRandomHexColor(),
    },
    100: {
      opacity: 1,
      transform: [{ scale: 1 }, { rotate: '0deg' }, { translateX: 0 }],
      backgroundColor: colors.end,
    },
  }).duration(1200);
};

// Cache presets to avoid recreating them on every render
const POP_PRESETS = [
  { in: createPopInA(), out: createPopOutA() },
  { in: createPopInB(), out: createPopOutB() },
  { in: createPopInC(), out: createPopInC() },
  { in: createPopInD(), out: createPopOutB() },
  { in: createPopInE(), out: createPopOutA() },
];

const getRandomPopPreset = (): PopPreset => {
  return POP_PRESETS[Math.floor(Math.random() * POP_PRESETS.length)];
};

const GridLayout = Layout.springify()
  .damping(20)
  .stiffness(150)
  .mass(0.9)
  .easing(Easing.bezier(0.22, 1, 0.36, 1))
  .duration(600);

const CardLayout = Layout.duration(2000);

export default function ReanimatedKeyframesLayoutScreen() {
  const { width } = useWindowDimensions();
  const [items, setItems] = useState<{ id: number; key: string }[]>([
    { id: 1, key: 'item-1' },
  ]);
  const [columns, setColumns] = useState<number>(3);
  const [nextId, setNextId] = useState<number>(7);

  const gap = 12;
  const padding = 16;
  const contentWidth = width - padding * 2;

  const cardWidth = useMemo(
    () => Math.floor((contentWidth - gap * (columns - 1)) / columns),
    [contentWidth, columns],
  );

  const mainFontSv = useSharedValue(Math.max(16, Math.round(cardWidth * 0.18)));
  const subFontSv = useSharedValue(Math.max(10, Math.round(cardWidth * 0.1)));

  useEffect(() => {
    const mainTarget = Math.max(16, Math.round(cardWidth * 0.18));
    const subTarget = Math.max(10, Math.round(cardWidth * 0.1));
    mainFontSv.value = withTiming(mainTarget, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
    subFontSv.value = withTiming(subTarget, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
  }, [cardWidth]);

  const mainTextAnimStyle = useAnimatedStyle(() => ({ fontSize: mainFontSv.value }));
  const subTextAnimStyle = useAnimatedStyle(() => ({ fontSize: subFontSv.value }));

  const addItem = () => {
    const newId = nextId;
    setNextId(prev => prev + 1);
    setItems(arr => [...arr, { id: newId, key: `item-${newId}` }]);
  };

  const removeItem = (id: number) => {
    setItems(arr => arr.filter(item => item.id !== id));
  };

  const shuffle = () => {
    setItems(arr => [...arr].sort(() => Math.random() - 0.5));
  };

  const clearAll = () => {
    setItems([]);
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0B0F14" />

      <Text style={styles.header}>🌀 Animated Chaos Grid</Text>
      <Text style={styles.desc}>
        Add, remove, and shuffle to see wild entering/exiting animations with random colors!
      </Text>

      {/* Controls Section */}
      <View style={styles.controlsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.controlsScrollContent}
        >
          <View style={styles.controlsGroup}>
            <Text style={styles.controlsLabel}>Grid Actions</Text>
            <View style={styles.buttonRow}>
              <Pressable
                onPress={addItem}
                style={[styles.btn, styles.btnPrimary]}
              >
                <Text style={styles.btnText}>➕ Add</Text>
              </Pressable>
              <Pressable
                onPress={clearAll}
                style={[styles.btn, styles.btnDanger]}
              >
                <Text style={styles.btnText}>🗑️ Clear All</Text>
              </Pressable>
              <Pressable
                onPress={shuffle}
                style={[styles.btn, styles.btnSecondary]}
              >
                <Text style={styles.btnText}>🔀 Shuffle</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.controlsGroup}>
            <Text style={styles.controlsLabel}>Grid Size</Text>
            <View style={styles.buttonRow}>
              <Pressable
                onPress={() => setColumns(c => Math.max(1, c - 1))}
                style={[styles.btn, styles.btnIcon]}
              >
                <Text style={styles.btnText}>−</Text>
              </Pressable>
              <View style={styles.valueContainer}>
                <Text style={styles.valueText}>Cols: {columns}</Text>
              </View>
              <Pressable
                onPress={() => setColumns(c => Math.min(8, c + 1))}
                style={[styles.btn, styles.btnIcon]}
              >
                <Text style={styles.btnText}>+</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Main Grid */}
      <Animated.View
        style={[styles.grid, { paddingHorizontal: padding, gap }]}
        layout={GridLayout}
      >
        {items.map((item, index) => {
          const preset = getRandomPopPreset();
          return (
            <Animated.View
              key={item.key} // Use stable key based on item ID
              entering={preset.in.delay(index * 30)}
              exiting={preset.out}
              layout={Layout.duration(2000)}
              style={[
                styles.card,
                {
                  width: cardWidth,
                  height: Math.round(cardWidth * 0.75),
                },
              ]}
            >
              <Animated.View layout={Layout.duration(2000)}>

                <Pressable
                  style={styles.cardPressable}
                  onPress={() => removeItem(item.id)}
                >
                  <Text style={styles.cardText}>#{item.id}</Text>
                  <Text style={styles.cardSubtext}>Tap to remove</Text>
                </Pressable>
              </Animated.View>
            </Animated.View>
          );
        })}
      </Animated.View>

      {items.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No items yet. Add some!</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0B0F14',
    paddingTop: 24,
    paddingBottom: 40,
  },
  header: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    paddingHorizontal: 16,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  desc: {
    fontSize: 14,
    color: '#9CA3AF',
    paddingHorizontal: 16,
    marginBottom: 24,
    lineHeight: 20,
  },
  controlsContainer: {
    backgroundColor: '#111827',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#374151',
  },
  controlsScrollContent: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
  },
  controlsGroup: {
    alignItems: 'center',
    gap: 8,
  },
  controlsLabel: {
    color: '#D1D5DB',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  btn: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  btnPrimary: {
    backgroundColor: '#3B82F6',
  },
  btnSecondary: {
    backgroundColor: '#8B5CF6',
  },
  btnDanger: {
    backgroundColor: '#EF4444',
  },
  btnIcon: {
    minWidth: 44,
    paddingHorizontal: 0,
    backgroundColor: '#4B5563',
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  valueContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#1F2937',
    borderRadius: 10,
    minWidth: 90,
    alignItems: 'center',
  },
  valueText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  card: {
    backgroundColor: '#495867',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6B7280',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardPressable: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 18,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  cardSubtext: {
    color: '#D1D5DB',
    fontSize: 10,
    fontWeight: '500',
    marginTop: 4,
    opacity: 0.8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
});
