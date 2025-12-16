import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';

type RootStackParamList = { ReanimatedList: undefined };

type Props = NativeStackScreenProps<RootStackParamList, 'ReanimatedList'>;

export default function ReanimatedListScreen(_: Props) {
  const [items, setItems] = useState<number[]>([3, 2, 1]);
  const addItem = () => {
    const next = (items[0] ?? 0) + 1;
    setItems([next, ...items]);
  };
  const removeItem = (id: number) => {
    setItems(items.filter(x => x !== id));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Animated List</Text>
      <Text style={styles.desc}>
        Smooth insertions and deletions with entering/exiting/layout.
      </Text>
      <View style={styles.row}>
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.7}
          onPress={addItem}
          style={[styles.btn, styles.btnGreen]}
        >
          <Text style={styles.btnLabel}>Add item</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, gap: 8, paddingBottom: 20 }}
        style={styles.list}
      >
        {items.map((id, index) => (
          <Animated.View
            key={id}
            entering={FadeIn}
            exiting={FadeOut}
            layout={Layout.springify(2500)}
            // entering={FadeIn.delay(index * 100)}
            // exiting={FadeOut}
            // layout={Layout.springify(2500).delay(index * 150)}

            // layout={Layout.delay(1000).springify(2500)}
            style={styles.item}
          >
            <Text style={styles.itemText}>Item {id}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => removeItem(id)}
              style={styles.removeBtn}
            >
              <Text style={styles.removeLabel}>Remove</Text>
            </Pressable>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  header: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  desc: { fontSize: 13, color: '#6B7280', marginBottom: 12 },
  row: { flexDirection: 'row', gap: 8 },
  btn: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10 },
  btnGreen: { backgroundColor: '#10b981' },
  btnLabel: { color: '#fff', fontWeight: '600' },
  list: { gap: 8, paddingTop: 20 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  itemText: { fontSize: 14, fontWeight: '600' },
  removeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#ef4444',
    borderRadius: 8,
  },
  removeLabel: { color: '#fff', fontWeight: '600' },
});
