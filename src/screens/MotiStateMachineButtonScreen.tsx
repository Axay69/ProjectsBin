import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MotiView, MotiText, AnimatePresence } from 'moti';

type RootStackParamList = { MotiStateMachineButton: undefined };
type Props = NativeStackScreenProps<
  RootStackParamList,
  'MotiStateMachineButton'
>;

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function MotiStateMachineButtonScreen(_: Props) {
  const [status, setStatus] = useState<Status>('idle');
  const colors = useMemo(
    () => ({
      idle: '#0EA5A4',
      loading: '#2563EB',
      success: '#10B981',
      error: '#EF4444',
    }),
    [],
  );

  useEffect(() => {
    let t: any;
    if (status === 'loading') {
      t = setTimeout(() => {
        setStatus(Math.random() > 0.5 ? 'success' : 'error');
      }, 1400);
    }
    return () => {
      if (t) clearTimeout(t);
    };
  }, [status]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Moti: State Machine Button</Text>
      <Text style={styles.desc}>
        idle → loading → success/error with AnimatePresence and layout
      </Text>

      <Pressable
        accessibilityRole="button"
        onPress={() => setStatus('loading')}
      >
        <MotiView
          from={{ scale: 1, translateX: 0 }}
          animate={{
            scale: status === 'loading' ? 0.98 : 1,
            translateX: status === 'error' ? ([-8, 8, -8, 8, 0] as any) : 0,
            backgroundColor: colors[status],
            borderRadius: status === 'success' ? 24 : 12,
          }}
          transition={{
            type: 'spring',
            damping: 18,
            stiffness: 220,
            translateX: { type: 'timing', duration: 450 },
          }}
          style={styles.button}
        >
          <AnimatePresence>
            {status === 'idle' && (
              <MotiText
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'timing', duration: 200 }}
                style={styles.buttonText}
              >
                Pay
              </MotiText>
            )}
            {status === 'loading' && (
              <MotiView
                key="spinner"
                from={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1, rotate: '360deg' }}
                transition={{ type: 'timing', duration: 800, loop: true }}
                style={styles.spinner}
              />
            )}
            {status === 'success' && (
              <MotiText
                key="check"
                from={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring' }}
                style={styles.buttonText}
              >
                ✓
              </MotiText>
            )}
            {status === 'error' && (
              <MotiText
                key="error"
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'timing', duration: 200 }}
                style={styles.buttonText}
              >
                Error
              </MotiText>
            )}
          </AnimatePresence>
        </MotiView>
      </Pressable>

      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          onPress={() => setStatus('idle')}
          style={[styles.controlBtn, { backgroundColor: '#111827' }]}
        >
          <Text style={styles.controlText}>Reset</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={status !== 'loading'}
          onPress={() => setStatus('success')}
          style={[
            styles.controlBtn,
            {
              backgroundColor: '#10B981',
              opacity: status === 'loading' ? 1 : 0.5,
            },
          ]}
        >
          <Text style={styles.controlText}>Success</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={status !== 'loading'}
          onPress={() => setStatus('error')}
          style={[
            styles.controlBtn,
            {
              backgroundColor: '#EF4444',
              opacity: status === 'loading' ? 1 : 0.5,
            },
          ]}
        >
          <Text style={styles.controlText}>Error</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  header: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  desc: { fontSize: 13, color: '#6B7280', marginBottom: 20 },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    height: 50,
  },
  buttonText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  spinner: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.7)',
    borderTopColor: '#fff',
  },
  controls: { flexDirection: 'row', gap: 10, marginTop: 16 },
  controlBtn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  controlText: { color: '#fff', fontWeight: '700' },
});
