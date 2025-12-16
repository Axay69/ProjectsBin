import React, { useMemo, useState } from 'react';
import { StyleSheet, View, Text, Pressable, StatusBar, useWindowDimensions, ScrollView } from 'react-native';
import Animated, { Layout, useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';

type CustomChildWrapperProps = {
  children: React.ReactNode;
  style?: any;
  index?: number;
  debug?: boolean;
};

function CustomChildWrapper({ children, style, index, debug }: CustomChildWrapperProps) {
  const widthSv = useSharedValue(100);
  const heightSv = useSharedValue(100);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const lastX = useSharedValue(0);
  const lastY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    // transform: [{ scaleX: scaleX.value }, { scaleY: scaleY.value }],
    // width: widthSv.value,
    // height: heightSv.value,
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
  }));



  const onLayout = ({ nativeEvent }: any) => {
    console.log('index', index, nativeEvent.layout);
    const { width, height } = nativeEvent.layout;
    const lastW = widthSv.value || width;
    const lastH = heightSv.value || height;
    widthSv.value = width;
    heightSv.value = height;
    translateX.value = lastX.value;
    translateY.value = lastY.value;
    translateX.value = withTiming(nativeEvent.layout.x, { duration: 3000 });
    translateY.value = withTiming(nativeEvent.layout.y, { duration: 3000 });
   
    lastX.value = nativeEvent.layout.x;
    lastY.value = nativeEvent.layout.y;
    if (debug) {
      console.log('[CustomChildWrapper]', { index, layout: nativeEvent.layout });
    }
  };

  return (
    <Animated.View onLayout={onLayout} style={[style, animatedStyle, { backgroundColor: 'red'}]}>
      {children}
    </Animated.View>
  );
}

export default function CustomChildWrapperScreen() {
  const { width } = useWindowDimensions();
  const [columns, setColumns] = useState<number>(3);

  const padding = 16;
  const gap = 12;
  const contentWidth = width - padding * 2;

  const cardWidth = useMemo(
    () => Math.floor((contentWidth - gap * (columns - 1)) / columns),
    [contentWidth, columns],
  );

  const items = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F14" />
      <Text style={styles.header}>Custom Child Wrapper</Text>
      <Text style={styles.desc}>Child content animates its layout changes smoothly when grid columns change.</Text>

      <View style={styles.controlsContainer}>
        <View style={styles.buttonRow}>
          <Pressable onPress={() => setColumns(c => Math.max(1, c - 1))} style={[styles.btn, styles.btnIcon]}>
            <Text style={styles.btnText}>−</Text>
          </Pressable>
          <View style={styles.valueContainer}>
            <Text style={styles.valueText}>Cols: {columns}</Text>
          </View>
          <Pressable onPress={() => setColumns(c => Math.min(8, c + 1))} style={[styles.btn, styles.btnIcon]}>
            <Text style={styles.btnText}>+</Text>
          </Pressable>
        </View>
      </View>

      <Animated.View style={[styles.grid, { paddingHorizontal: padding, gap }]} layout={Layout.duration(800)}>
        {items.map((id, index) => (
          <Animated.View
            key={`cw-${id}`}
            layout={Layout.duration(3000)}
            style={[styles.card, { width: cardWidth, height: Math.round(cardWidth * 0.75) }]}
          >
            <CustomChildWrapper index={index} style={styles.cardInner}>
              <Text style={styles.cardText}>#{id}</Text>
            </CustomChildWrapper>
          </Animated.View>
        ))}
      </Animated.View>
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
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    paddingHorizontal: 16,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  desc: {
    fontSize: 13,
    color: '#9CA3AF',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  controlsContainer: {
    backgroundColor: '#111827',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#374151',
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
    backgroundColor: '#4B5563',
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
  cardInner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 18,
  },
  cardSubtext: {
    color: '#D1D5DB',
    fontSize: 10,
    fontWeight: '500',
    marginTop: 4,
  },
});
