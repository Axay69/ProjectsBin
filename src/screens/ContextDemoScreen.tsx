import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { CounterProvider, useCounterContext } from '../stores/contextCounterStore';
import { Header, Counter, Footer } from '../components/CounterComponents';
import { useReRenderCount } from '../components/ReRenderTracker';

function ContextHeader() {
  // Using context even though we don't need the count - shows re-render behavior
  useCounterContext(); // This causes re-render when context changes
  return <Header title="React Context State Management" color="#3b82f6" />;
}

function ContextCounter() {
  const { count, increment, decrement, reset } = useCounterContext();

  return (
    <Counter
      count={count}
      onIncrement={increment}
      onDecrement={decrement}
      onReset={reset}
      color="#3b82f6"
    />
  );
}

function ContextFooter() {
  // Using context even though we don't need the count - shows re-render behavior
  useCounterContext(); // This causes re-render when context changes
  return (
    <Footer
      subtitle="Using React Context - All consumers re-render when context value changes"
      color="#3b82f6"
    />
  );
}

function ContextScreenContent() {
  const renderCount = useReRenderCount('ContextDemoScreen');

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>🔬 React Context Test</Text>
          <Text style={styles.infoText}>
            Screen Renders: {renderCount}
          </Text>
          <Text style={styles.infoDescription}>
            React Context causes all consumers to re-render when the context value changes, even if they don't use the changed value.
          </Text>
        </View>

        <ContextHeader />
        <ContextCounter />
        <ContextFooter />

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>📊 Expected Behavior</Text>
          <Text style={styles.infoText}>
            • Header: Will re-render when count changes (consumes context)
            {'\n'}
            • Counter: Will re-render when count changes (consumes context)
            {'\n'}
            • Footer: Will re-render when count changes (consumes context)
            {'\n'}
            {'\n'}All components using useCounterContext will re-render even if they don't use the count value.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

export default function ContextDemoScreen() {
  return (
    <CounterProvider>
      <ContextScreenContent />
    </CounterProvider>
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
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1e3a8a',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  infoDescription: {
    fontSize: 13,
    color: '#1e3a8a',
    lineHeight: 20,
  },
});

