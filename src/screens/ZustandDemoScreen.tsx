import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useCounterStore } from '../stores/zustandCounterStore';
import { Header, Counter, Footer } from '../components/CounterComponents';
import { useReRenderCount } from '../components/ReRenderTracker';
import { createStyleSheet, useStyles } from 'react-native-unistyles';
import { SafeAreaView } from 'react-native-safe-area-context';

function ZustandHeader() {
  return <Header title="Zustand State Management" color="#10b981" />;
}

function ZustandCounter() {
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
  const { styles } = useStyles(stylesheet);

  return (
    <SafeAreaView style={styles.container}>
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
    </SafeAreaView>
  );
}

const stylesheet = createStyleSheet((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  infoBox: {
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.accent,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.typography,
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  infoDescription: {
    fontSize: 13,
    color: theme.colors.typography,
    lineHeight: 20,
    opacity: 0.8,
  },
}));

