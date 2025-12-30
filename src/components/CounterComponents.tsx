import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ReRenderTracker } from './ReRenderTracker';

// Header Component
interface HeaderProps {
  title: string;
  color?: string;
}

export function Header({ title, color = '#0a84ff' }: HeaderProps) {
  return (
    <View style={[styles.header, { borderColor: color }]}>
      <Text style={[styles.headerText, { color }]}>{title}</Text>
      <ReRenderTracker componentName="Header" color={color} />
    </View>
  );
}

// Counter Component
interface CounterProps {
  count: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onReset: () => void;
  color?: string;
}

export function Counter({ count, onIncrement, onDecrement, onReset, color = '#0a84ff' }: CounterProps) {
  return (
    <View style={[styles.counter, { borderColor: color }]}>
      <Text style={[styles.counterValue, { color }]}>Count: {count}</Text>
      <ReRenderTracker componentName="Counter" color={color} />
      <View style={styles.buttonRow}>
        <Pressable
          style={[styles.button, { backgroundColor: color }]}
          onPress={onDecrement}
        >
          <Text style={styles.buttonText}>-</Text>
        </Pressable>
        <Pressable
          style={[styles.button, { backgroundColor: color }]}
          onPress={onReset}
        >
          <Text style={styles.buttonText}>Reset</Text>
        </Pressable>
        <Pressable
          style={[styles.button, { backgroundColor: color }]}
          onPress={onIncrement}
        >
          <Text style={styles.buttonText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

// Footer Component
interface FooterProps {
  subtitle: string;
  color?: string;
}

export function Footer({ subtitle, color = '#0a84ff' }: FooterProps) {
  return (
    <View style={[styles.footer, { borderColor: color }]}>
      <Text style={[styles.footerText, { color }]}>{subtitle}</Text>
      <ReRenderTracker componentName="Footer" color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 16,
    borderWidth: 2,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#f9fafb',
  },
  headerText: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  counter: {
    padding: 16,
    borderWidth: 2,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#f9fafb',
    flex: 1,
    justifyContent: 'center',
  },
  counterValue: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 80,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    borderWidth: 2,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
  },
  footerText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
});

