import React, { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MotiView, MotiText, AnimatePresence } from 'moti';
import Animated, { Layout } from 'react-native-reanimated';

type RootStackParamList = { MotiToastStack: undefined };
type Props = NativeStackScreenProps<RootStackParamList, 'MotiToastStack'>;

type ToastType = 'info' | 'success' | 'error';
type Toast = { id: string; type: ToastType; message: string };

export default function MotiToastStackScreen(_: Props) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);
  const colors = useMemo(
    () => ({ info: '#2563EB', success: '#10B981', error: '#EF4444' }),
    [],
  );

  const pushToast = useCallback((type: ToastType) => {
    const id = `${Date.now()}-${idRef.current++}`;
    const t: Toast = {
      id,
      type,
      message:
        type === 'success'
          ? 'Payment completed'
          : type === 'error'
          ? 'Something went wrong'
          : 'New message received',
    };
    setToasts(prev => [t, ...prev]);
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(x => x.id !== id));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Moti: Toast Stack</Text>
      <Text style={styles.desc}>
        slide + fade in, auto-dismiss, smooth reflow
      </Text>

      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          onPress={() => pushToast('info')}
          style={[styles.controlBtn, { backgroundColor: '#2563EB' }]}
        >
          <Text style={styles.controlText}>Info</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => pushToast('success')}
          style={[styles.controlBtn, { backgroundColor: '#10B981' }]}
        >
          <Text style={styles.controlText}>Success</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => pushToast('error')}
          style={[styles.controlBtn, { backgroundColor: '#EF4444' }]}
        >
          <Text style={styles.controlText}>Error</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ gap: 8 }}
        style={{ flex: 1, marginTop: 16 }}
      >
        <AnimatePresence>
          {toasts.map((t, index) => (
            <Animated.View key={t.id} layout={Layout.duration(200)}>
              <Pressable
                accessibilityRole="button"
                onPress={() => removeToast(t.id)}
              >
                <MotiView
                  from={{ opacity: 0, translateY: -10 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  exit={{ opacity: 0, translateY: -10 }}
                  transition={{ type: 'timing', duration: 250 }}
                  style={[styles.toast, { borderLeftColor: colors[t.type] }]}
                >
                  <MotiText
                    from={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ type: 'timing', duration: 200 }}
                    style={styles.toastText}
                  >
                    {t.message}
                  </MotiText>
                  <Text
                    style={[
                      styles.toastBadge,
                      { backgroundColor: colors[t.type] },
                    ]}
                  >
                    {t.type.toUpperCase()}
                  </Text>
                </MotiView>
              </Pressable>
            </Animated.View>
          ))}
        </AnimatePresence>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  header: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  desc: { fontSize: 13, color: '#6B7280', marginBottom: 12 },
  controls: { flexDirection: 'row', gap: 10 },
  controlBtn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  controlText: { color: '#fff', fontWeight: '700' },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderLeftWidth: 6,
    backgroundColor: '#fff',
  },
  toastText: { fontSize: 14, color: '#111827' },
  toastBadge: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
});
