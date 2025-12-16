import { useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';

type CounterButtonProps = { label: string; onPress: () => void };

function CounterButton({ label, onPress }: CounterButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      style={styles.button}
      onPress={onPress}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

export default function CounterScreen() {
  const [count, setCount] = useState<number>(0);

  const increment = () => setCount(c => c + 1);
  const reset = () => setCount(0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Count: {count}</Text>
      <View style={styles.row}>
        <CounterButton label="+" onPress={increment} />
        <CounterButton label="Reset" onPress={reset} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 16 },
  title: { fontSize: 24, fontWeight: '700' },
  row: { flexDirection: 'row', gap: 12 },
  button: {
    backgroundColor: '#0a84ff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
