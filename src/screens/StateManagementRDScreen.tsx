import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  Home: undefined;
  ContextDemo: undefined;
  ZustandDemo: undefined;
  StateManagementRD: undefined;
  // ... other routes
};

type Props = NativeStackScreenProps<RootStackParamList, 'StateManagementRD'>;

export default function StateManagementRDScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>🔬 State Management R&D</Text>
          <Text style={styles.subtitle}>Zustand vs Context</Text>
          <Text style={styles.description}>
            Compare re-render behavior between React Context and Zustand state management.
            Each screen has the same structure (Header, Counter, Footer) but uses different state management.
          </Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>📋 Test Scenario</Text>
          <View style={styles.scenarioBox}>
            <Text style={styles.scenarioText}>• Screen has Header</Text>
            <Text style={styles.scenarioText}>• Screen has Counter</Text>
            <Text style={styles.scenarioText}>• Screen has Footer</Text>
            <Text style={styles.scenarioText}>• Change same state (counter)</Text>
            <Text style={styles.scenarioText}>• Measure re-render counts</Text>
            <Text style={styles.scenarioText}>• Compare results</Text>
          </View>
        </View>

        <Pressable
          style={[styles.button, styles.contextButton]}
          onPress={() => navigation.navigate('ContextDemo')}
        >
          <Text style={styles.buttonIcon}>⚛️</Text>
          <View style={styles.buttonTextContainer}>
            <Text style={styles.buttonTitle}>React Context</Text>
            <Text style={styles.buttonSubtitle}>
              All consumers re-render when context changes
            </Text>
          </View>
          <Text style={styles.buttonArrow}>›</Text>
        </Pressable>

        <Pressable
          style={[styles.button, styles.zustandButton]}
          onPress={() => navigation.navigate('ZustandDemo')}
        >
          <Text style={styles.buttonIcon}>🐻</Text>
          <View style={styles.buttonTextContainer}>
            <Text style={styles.buttonTitle}>Zustand</Text>
            <Text style={styles.buttonSubtitle}>
              Only subscribed components re-render
            </Text>
          </View>
          <Text style={styles.buttonArrow}>›</Text>
        </Pressable>

        <View style={styles.comparisonBox}>
          <Text style={styles.comparisonTitle}>💡 Key Differences</Text>
          <View style={styles.comparisonRow}>
            <View style={styles.comparisonCol}>
              <Text style={styles.comparisonLabel}>Context</Text>
              <Text style={styles.comparisonText}>
                • All consumers re-render{'\n'}
                • Context value object changes{'\n'}
                • No granular subscriptions{'\n'}
                • Built into React
              </Text>
            </View>
            <View style={styles.comparisonCol}>
              <Text style={styles.comparisonLabel}>Zustand</Text>
              <Text style={styles.comparisonText}>
                • Selective re-renders{'\n'}
                • Shallow equality checks{'\n'}
                • Granular subscriptions{'\n'}
                • External library
              </Text>
            </View>
          </View>
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
  header: {
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  infoSection: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  scenarioBox: {
    gap: 8,
  },
  scenarioText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  contextButton: {
    borderColor: '#3b82f6',
  },
  zustandButton: {
    borderColor: '#10b981',
  },
  buttonIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  buttonSubtitle: {
    fontSize: 13,
    color: '#6b7280',
  },
  buttonArrow: {
    fontSize: 24,
    color: '#9ca3af',
    marginLeft: 12,
  },
  comparisonBox: {
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fbbf24',
    marginTop: 8,
  },
  comparisonTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 16,
  },
  comparisonRow: {
    flexDirection: 'row',
    gap: 16,
  },
  comparisonCol: {
    flex: 1,
  },
  comparisonLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#78350f',
    marginBottom: 8,
  },
  comparisonText: {
    fontSize: 13,
    color: '#92400e',
    lineHeight: 20,
  },
});

