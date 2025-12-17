import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0B0F14' }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 80, height: 80, borderRadius: 16, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#1F2937' }}>
        <Text style={{ fontSize: 40, color: '#0EA5A4' }}>⚡️</Text>
      </View>
      <Text style={{ marginTop: 16, fontSize: 28, fontWeight: 'bold', color: '#F9FAFB' }}>
        Motion<Text style={{ color: '#0EA5A4' }}>X</Text>
      </Text>
      <Text style={{ marginTop: 6, fontSize: 12, color: '#9CA3AF' }}>Train. Track. Transform.</Text>
      </View>
    </SafeAreaView>
  );
}
