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

type RootStackParamList = {
  ReanimatedLayoutDemos: undefined;
};

type Props = NativeStackScreenProps<
  RootStackParamList,
  'ReanimatedLayoutDemos'
>;

export default function ReanimatedLayoutDemosScreen(_: Props) {
  const [showBox, setShowBox] = useState(true);
  const [items, setItems] = useState<number[]>([1, 2, 3]);
  const [open, setOpen] = useState(false);

  const addItem = () => {
    const next = (items[0] ?? 0) + 1;
    setItems([next, ...items]);
  };
  const removeItem = (id: number) => {
    setItems(items.filter(x => x !== id));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Reanimated v3 — Layout Animations</Text>
      <Text style={styles.desc}>
        Three focused demos that run entirely on the UI thread: Enter/Exit, List
        add/remove, and automatic Layout transitions.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>1) Beginner — Entering / Exiting</Text>
        <Text style={styles.cardDesc}>
          Avoid “pop-in” by animating mount and unmount. Uses `entering` and
          `exiting` props.
        </Text>
        <View style={styles.row}>
          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.7}
            onPress={() => setShowBox(s => !s)}
            style={[styles.btn, styles.btnBlue]}
          >
            <Text style={styles.btnLabel}>{showBox ? 'Hide' : 'Show'} Box</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.boxArea}>
          {showBox && (
            <Animated.View
              entering={FadeIn.duration(250)}
              exiting={FadeOut.duration(250)}
              style={styles.demoBox}
            />
          )}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          2) Practical — Animated list add/remove
        </Text>
        <Text style={styles.cardDesc}>
          Smooth insertions and deletions. Each item defines `entering`,
          `exiting` and `layout` for reordering.
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
        <View style={styles.list}>
          {items.map(id => (
            <Animated.View
              key={id}
              entering={FadeIn}
              exiting={FadeOut}
              layout={Layout.springify()}
              style={styles.listItem}
            >
              <Text style={styles.listText}>Item {id}</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => removeItem(id)}
                style={styles.removeBtn}
              >
                <Text style={styles.removeLabel}>Remove</Text>
              </Pressable>
            </Animated.View>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          3) Intermediate — Layout transitions
        </Text>
        <Text style={styles.cardDesc}>
          Animate position and size changes automatically with `layout=
          {Layout.springify()}`.
        </Text>
        <Pressable accessibilityRole="button" onPress={() => setOpen(s => !s)}>
          <Animated.View layout={Layout.springify()} style={styles.expander}>
            <Text style={styles.expanderHeader}>
              Tap to {open ? 'collapse' : 'expand'}
            </Text>
            {open && (
              <Animated.View
                entering={FadeIn.duration(200)}
                layout={Layout.springify()}
                style={styles.expanderBody}
              >
                <Text style={styles.expanderText}>
                  Expanded content… This area grows and shrinks with animated
                  layout.
                </Text>
              </Animated.View>
            )}
          </Animated.View>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, paddingBottom: 32 },
  header: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  desc: { fontSize: 13, color: '#6B7280', marginBottom: 12 },
  card: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  cardDesc: { fontSize: 13, color: '#6B7280', marginBottom: 8 },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  btn: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10 },
  btnBlue: { backgroundColor: '#2563eb' },
  btnGreen: { backgroundColor: '#10b981' },
  btnLabel: { color: '#fff', fontWeight: '600' },
  boxArea: { height: 80, justifyContent: 'center', alignItems: 'center' },
  demoBox: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#0EA5A4',
  },
  list: { gap: 8 },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  listText: { fontSize: 14, fontWeight: '600' },
  removeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#ef4444',
    borderRadius: 8,
  },
  removeLabel: { color: '#fff', fontWeight: '600' },
  expander: {
    width: '100%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
  },
  expanderHeader: { fontSize: 14, fontWeight: '700' },
  expanderBody: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  expanderText: { fontSize: 13, color: '#374151' },
});
