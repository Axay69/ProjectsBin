import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type StoryItem = { type: 'image' | 'video'; uri: string };

type RootStackParamList = {
  InstaStorySetup: undefined;
  InstaStoryViewer: { items: StoryItem[] };
};

type Props = NativeStackScreenProps<RootStackParamList, 'InstaStorySetup'>;

export default function InstaStorySetupScreen({ navigation }: Props) {
  const [items, setItems] = useState<StoryItem[]>([]);

  const pickMedia = async () => {
    const res = await launchImageLibrary({
      mediaType: 'mixed',
      selectionLimit: 10,
    });
    const assets = res.assets || [];
    const next: StoryItem[] = assets
      .filter(a => !!a.uri)
      .map(a => ({
        type: a.type?.includes('video') ? 'video' : 'image',
        uri: a.uri as string,
      }));
    if (!next.length) {
      Alert.alert(
        'No media selected',
        'Please select at least one image or video.',
      );
      return;
    }
    setItems(next);
  };

  const startViewer = () => {
    if (!items.length) {
      Alert.alert('Add media first', 'Pick images or videos to view.');
      return;
    }
    navigation.navigate('InstaStoryViewer', { items });
  };

  const renderItem = ({ item }: { item: StoryItem }) => (
    <View style={[styles.thumb, { backgroundColor: '#e5e7eb' }]}>
      <Image
        source={{ uri: item.uri }}
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Insta Story Setup</Text>
      <View style={styles.row}>
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.7}
          onPress={pickMedia}
          style={[styles.btn, { backgroundColor: '#2563eb' }]}
        >
          <Text style={styles.btnText}>Pick Media</Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.7}
          onPress={startViewer}
          style={[styles.btn, { backgroundColor: '#10b981' }]}
        >
          <Text style={styles.btnText}>Start Viewer</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={items}
        keyExtractor={(item, idx) => item.uri + idx}
        numColumns={3}
        renderItem={renderItem}
        contentContainerStyle={styles.grid}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
  row: { flexDirection: 'row', gap: 12 },
  btn: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  grid: { marginTop: 16, gap: 8 },
  thumb: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    margin: '1%',
  },
});
