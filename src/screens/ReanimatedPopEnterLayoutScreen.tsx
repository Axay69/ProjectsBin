import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Animated, { Keyframe, Layout } from 'react-native-reanimated';

type RootStackParamList = { ReanimatedPopEnterLayout: undefined };

type Props = NativeStackScreenProps<
  RootStackParamList,
  'ReanimatedPopEnterLayout'
>;

const PopEnter = new Keyframe({
  0: { transform: [{ scale: 0.9 }, { translateY: 20 }], opacity: 0 },
  0.6: { transform: [{ scale: 1.03 }, { translateY: -6 }], opacity: 1 },
  1: { transform: [{ scale: 1 }, { translateY: 0 }], opacity: 1 },
});

export default function ReanimatedPopEnterLayoutScreen(_: Props) {
  const [items, setItems] = useState<number[]>([6, 5, 4, 3, 2, 1]);

  const addItem = () => {
    let max = 1;
    items.forEach(item => {
      if (item > max) {
        max = item;
      }
    });
    const next = max + 1;
    setItems([next, ...items]);
  };
  const shuffle = () => {
    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setItems(arr);
  };
  const removeLast = () => {
    setItems(items.slice(0, -1));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Keyframe Enter + Layout</Text>
      <Text style={styles.desc}>
        Combine a popping keyframe on enter with spring layout transitions.
      </Text>

      <View style={styles.row}>
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.7}
          onPress={addItem}
          style={[styles.btn, styles.btnBlue]}
        >
          <Text style={styles.btnLabel}>Add</Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.7}
          onPress={shuffle}
          style={[styles.btn, styles.btnGreen]}
        >
          <Text style={styles.btnLabel}>Shuffle</Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.7}
          onPress={removeLast}
          style={[styles.btn, styles.btnGray]}
        >
          <Text style={styles.btnLabel}>Remove last</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        {items.map((id, index) => (
          <Animated.View
            key={id}
            entering={PopEnter.duration(500)}
            layout={Layout.springify().stiffness(260).damping(18)}
            style={styles.card}
          >
            <Text style={styles.cardText}>{id}</Text>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  header: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  desc: { fontSize: 13, color: '#6B7280', marginBottom: 12 },
  row: { flexDirection: 'row', gap: 8 },
  btn: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10 },
  btnBlue: { backgroundColor: '#2563eb' },
  btnGreen: { backgroundColor: '#10b981' },
  btnGray: { backgroundColor: '#E5E7EB' },
  btnLabel: { color: '#fff', fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 },
  card: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: '#0EA5A4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardText: {
    color: '#fff',
    fontWeight: '700',
    textAlignVertical: 'center',
    alignSelf: 'center',
    flex: 1,
  },
});
