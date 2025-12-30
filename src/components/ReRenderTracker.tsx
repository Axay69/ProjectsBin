import { useEffect, useRef } from 'react';
import { Text, StyleSheet, View } from 'react-native';

interface ReRenderTrackerProps {
  componentName: string;
  color?: string;
}

export function useReRenderCount(componentName: string) {
  const renderCount = useRef(0);
  
  useEffect(() => {
    renderCount.current += 1;
  });

  return renderCount.current;
}

export function ReRenderTracker({ componentName, color = '#666' }: ReRenderTrackerProps) {
  const count = useReRenderCount(componentName);
  
  return (
    <View style={styles.container}>
      <Text style={[styles.text, { color }]}>
        {componentName}: {count} renders
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
});

