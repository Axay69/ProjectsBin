import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { getBodyParts, NamedImageItem } from '../lib/exercisedb';
import FastImage from 'react-native-fast-image';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [bodyParts, setBodyParts] = useState<NamedImageItem[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await getBodyParts();
        setBodyParts(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const Header = () => (
    <View style={{ paddingHorizontal: 16, paddingTop: 16, marginBottom: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#1F2937' }}>
          <Text style={{ color: '#0EA5A4' }}>⚡️</Text>
        </View>
        <View>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#F9FAFB' }}>Motion<Text style={{ color: '#0EA5A4' }}>X</Text></Text>
          <Text style={{ fontSize: 12, color: '#9CA3AF' }}>Select a body part</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0B0F14' }}>
      <Header />
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#0EA5A4" />
        </View>
      ) : (
        <FlatList
          data={bodyParts}
          keyExtractor={item => item.name}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          columnWrapperStyle={{ gap: 12 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{ flex: 1, padding: 12, borderRadius: 12, backgroundColor: '#111827', borderWidth: 1, borderColor: '#1F2937' }}
              onPress={() => navigation.navigate('Exercises', { bodyPart: item })}
            >
              {item.imageUrl ? (
                <FastImage source={{ uri: item.imageUrl }} resizeMode="contain" style={{ width: '100%', aspectRatio: 1, borderRadius: 10, marginBottom: 8, backgroundColor: '#fff' }} />
              ) : (
                <View style={{ width: '100%', height: 90, borderRadius: 10, backgroundColor: '#1F2937', marginBottom: 8 }} />
              )}
              <Text style={{ color: '#F9FAFB', fontWeight: '600' }}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}
