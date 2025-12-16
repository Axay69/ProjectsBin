import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MotiView, MotiText, AnimatePresence } from 'moti';

type RootStackParamList = { MotiAnimatedTabBar: undefined };
type Props = NativeStackScreenProps<RootStackParamList, 'MotiAnimatedTabBar'>;

export default function MotiAnimatedTabBarScreen(_: Props) {
  const tabs = useMemo(() => ['Home', 'Search', 'Profile'], []);
  const [active, setActive] = useState(0);
  const { width } = useWindowDimensions();
  const pad = 16;
  const gap = 8;
  const totalGap = gap * (tabs.length - 1);
  const segmentWidth = Math.floor((width - pad * 2 - totalGap) / tabs.length);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Moti: Animated Tab Bar</Text>
      <Text style={styles.desc}>
        sliding indicator, scale + color interpolation
      </Text>

      <View style={[styles.bar, { paddingHorizontal: pad, gap }]}>
        <MotiView
          from={{ left: 0, width: segmentWidth }}
          animate={{ left: active * (segmentWidth + gap), width: segmentWidth }}
          transition={{ type: 'spring', damping: 18, stiffness: 220 }}
          style={[styles.indicator, { width: segmentWidth }]}
        />
        {tabs.map((t, i) => {
          const isActive = i === active;
          return (
            <Pressable
              accessibilityRole="button"
              key={t}
              onPress={() => setActive(i)}
              style={[styles.tab, { width: segmentWidth }]}
            >
              <MotiView
                from={{ scale: 1 }}
                animate={{ scale: isActive ? 1.06 : 1 }}
                transition={{ type: 'spring', damping: 18, stiffness: 220 }}
              >
                <MotiText
                  from={{ color: '#6B7280' }}
                  animate={{ color: isActive ? '#0EA5A4' : '#6B7280' }}
                  transition={{ type: 'timing', duration: 180 }}
                  style={styles.tabText}
                >
                  {t}
                </MotiText>
              </MotiView>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.page}>
        <AnimatePresence>
          <MotiView
            key={tabs[active]}
            from={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', damping: 18, stiffness: 220 }}
            style={styles.card}
          >
            <Text style={styles.cardText}>{tabs[active]} Page</Text>
          </MotiView>
        </AnimatePresence>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  header: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  desc: { fontSize: 13, color: '#6B7280', marginBottom: 16 },
  bar: { flexDirection: 'row', alignItems: 'center', position: 'relative' },
  indicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: '#ECFEFF',
    borderRadius: 12,
  },
  tab: { alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  tabText: { fontSize: 15, fontWeight: '700' },
  page: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#fff',
  },
  cardText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
});
