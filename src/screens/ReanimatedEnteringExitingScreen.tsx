import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

type RootStackParamList = { ReanimatedEnteringExiting: undefined };

type Props = NativeStackScreenProps<
  RootStackParamList,
  'ReanimatedEnteringExiting'
>;

export default function ReanimatedEnteringExitingScreen(_: Props) {
  const [showBox, setShowBox] = useState(true);
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Entering / Exiting</Text>
      <Text style={styles.desc}>
        Animate mount and unmount to avoid pop-in.
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
            entering={FadeIn}
            exiting={FadeOut}
            style={styles.box}
          />
        )}
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
  btnLabel: { color: '#fff', fontWeight: '600' },
  boxArea: { height: 120, justifyContent: 'center', alignItems: 'center' },
  box: { width: 80, height: 80, borderRadius: 12, backgroundColor: '#0EA5A4' },
});
