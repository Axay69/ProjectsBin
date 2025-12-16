import React, { useMemo, useRef, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import HapticFeedback, {
  HapticFeedbackTypes,
} from 'react-native-haptic-feedback';

type RootStackParamList = { BottomSheetDemo: undefined };
type Props = NativeStackScreenProps<RootStackParamList, 'BottomSheetDemo'>;

export default function BottomSheetDemoScreen({}: Props) {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['25%', '50%', '90%'], []);
  const [index, setIndex] = useState(-1);

  const haptic = (type: HapticFeedbackTypes) =>
    HapticFeedback.trigger(type, { enableVibrateFallback: true });

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Post Actions (Real Life Demo)</Text>
        <Text style={styles.subtitle}>
          Like Instagram / Maps style bottom sheet
        </Text>
      </View>

      {/* Trigger buttons (simulate different user intents) */}
      <View style={styles.buttonsRow}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            haptic('impactLight');
            sheetRef.current?.snapToIndex(0);
          }}
        >
          <Text style={styles.buttonText}>Peek Actions (25%)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            haptic('impactMedium');
            sheetRef.current?.snapToIndex(1);
          }}
        >
          <Text style={styles.buttonText}>Browse Options (50%)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            haptic('impactHeavy');
            sheetRef.current?.snapToIndex(2);
          }}
        >
          <Text style={styles.buttonText}>Full Details (90%)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.closeBtn]}
          onPress={() => {
            haptic('selection');
            sheetRef.current?.close();
          }}
        >
          <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet */}
      <BottomSheet
        ref={sheetRef}
        index={index}
        snapPoints={snapPoints}
        enablePanDownToClose
        onChange={i => {
          setIndex(i);
          if (i !== -1) haptic('selection');
        }}
        backgroundStyle={{ backgroundColor: '#daefdbff' }}
      >
        <BottomSheetView style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Post Actions</Text>

          <View style={styles.sheetRow}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => haptic('impactLight')}
            >
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => haptic('selection')}
            >
              <Text style={styles.actionText}>Copy Link</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => haptic('notificationSuccess')}
            >
              <Text style={styles.actionText}>Bookmark</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sheetSubtitle}>
            Drag up for details · Pull down to dismiss
          </Text>
        </BottomSheetView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  /* Header */
  headerRow: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#6b7280',
  },

  /* Buttons */
  buttonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#0EA5A4',
  },
  closeBtn: {
    backgroundColor: '#374151',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

  /* Bottom Sheet */
  sheetContent: {
    padding: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },

  /* Actions */
  sheetRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  actionBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#111827',
  },
  actionText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

  /* Divider */
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 16,
  },

  /* Footer hint */
  sheetSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
  },
});
