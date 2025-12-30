import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useCounterStore } from '../stores/zustandCounterStore';
import { Header, Counter, Footer } from '../components/CounterComponents';
import { useReRenderCount } from '../components/ReRenderTracker';

function ZustandHeader() {
  return <Header title="Zustand State Management" color="#10b981" />;
}

function ZustandCounter() {
  // Zustand only re-renders when selected state changes
  // Functions are stable, so selecting them doesn't cause re-renders
  const count = useCounterStore((state) => state.count);
  const increment = useCounterStore((state) => state.increment);
  const decrement = useCounterStore((state) => state.decrement);
  const reset = useCounterStore((state) => state.reset);

  return (
    <Counter
      count={count}
      onIncrement={increment}
      onDecrement={decrement}
      onReset={reset}
      color="#10b981"
    />
  );
}

function ZustandFooter() {
  return (
    <Footer
      subtitle="Using Zustand Store - Only components that subscribe to count will re-render"
      color="#10b981"
    />
  );
}

export default function ZustandDemoScreen() {
  const renderCount = useReRenderCount('ZustandDemoScreen');

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>🔬 Zustand Test</Text>
          <Text style={styles.infoText}>
            Screen Renders: {renderCount}
          </Text>
          <Text style={styles.infoDescription}>
            Zustand uses selector-based subscriptions. Only components that select specific state slices will re-render when that slice changes.
          </Text>
        </View>

        <ZustandHeader />
        <ZustandCounter />
        <ZustandFooter />

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>📊 Expected Behavior</Text>
          <Text style={styles.infoText}>
            • Header: Should not re-render when count changes (doesn't subscribe to count)
            {'\n'}
            • Counter: Should re-render when count changes (subscribes to count)
            {'\n'}
            • Footer: Should not re-render when count changes (doesn't subscribe to count)
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  infoBox: {
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#065f46',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#047857',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  infoDescription: {
    fontSize: 13,
    color: '#047857',
    lineHeight: 20,
  },
});

