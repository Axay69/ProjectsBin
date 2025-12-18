import { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Video from 'react-native-video';
import { getExerciseDetail, MuscleWikiExerciseDetail, cacheMuscleWikiVideo } from '../lib/musclewiki';

export default function MuscleWikiDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const id: number = route.params?.id;

  const [loading, setLoading] = useState(true);
  const [videoLoading, setVideoLoading] = useState(true);
  const [detail, setDetail] = useState<MuscleWikiExerciseDetail | null>(null);
  const [videoIndex, setVideoIndex] = useState(0);
  const [videoPaths, setVideoPaths] = useState<string[]>([]);

  useEffect(() => {
    load();
  }, [id]);

  const load = async () => {
    setLoading(true);
    setVideoLoading(true);
    try {
      const d = await getExerciseDetail(id);
      console.log(d);
      
      setDetail(d);
      setLoading(false);

      const urls = d.videos?.map(v => v.url) || [];
      if (urls.length) {
        const paths = await Promise.all(urls.map(u => cacheMuscleWikiVideo(u)));
        setVideoPaths(paths);
      } else {
        setVideoPaths([]);
      }
      setVideoIndex(0);
    } catch (e) {
    } finally {
      setLoading(false);
      setVideoLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0B0F14' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 8 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8 }}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#E5E7EB" />
        </TouchableOpacity>
        <Text numberOfLines={1} style={{ color: '#F9FAFB', fontWeight: '700', fontSize: 16, marginLeft: 8 }}>
          {detail?.name || 'Exercise'}
        </Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#0EA5A4" />
          <Text style={{ color: '#9CA3AF', marginTop: 8 }}>Loading details...</Text>
        </View>
      ) : !detail ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#9CA3AF' }}>Failed to load exercise</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {detail.videos && detail.videos.length > 0 && (videoLoading || videoPaths.length > 0) ? (
            <View style={{ backgroundColor: '#0F172A', borderColor: '#1F2937', borderWidth: 1, borderRadius: 12, overflow: 'hidden' }}>
              {videoLoading ? (
                <View style={{ height: 220, alignItems: 'center', justifyContent: 'center' }}>
                  <ActivityIndicator color="#0EA5A4" size="large" />
                  <Text style={{ color: '#9CA3AF', marginTop: 8 }}>Loading video...</Text>
                </View>
              ) : (
                <>
                  <Video
                    source={{ uri: videoPaths[videoIndex] }}
                    style={{ width: '100%', height: 220 }}
                    controls={false}
                    repeat={true}
                    muted={true}
                    resizeMode="contain"
                  />
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 8 }}>
                    <Text style={{ color: '#9CA3AF' }}>
                      {detail.videos[videoIndex].gender ? detail.videos[videoIndex].gender : ''} {detail.videos[videoIndex].angle ? `• ${detail.videos[videoIndex].angle}` : ''}
                    </Text>
                    <View style={{ flexDirection: 'row' }}>
                      <TouchableOpacity disabled={videoIndex <= 0} onPress={() => setVideoIndex(i => Math.max(0, i - 1))} style={{ padding: 6, opacity: videoIndex <= 0 ? 0.5 : 1 }}>
                        <MaterialCommunityIcons name="chevron-left" size={24} color="#E5E7EB" />
                      </TouchableOpacity>
                      <TouchableOpacity disabled={videoIndex >= (detail.videos?.length || 1) - 1} onPress={() => setVideoIndex(i => Math.min((detail.videos?.length || 1) - 1, i + 1))} style={{ padding: 6, opacity: videoIndex >= (detail.videos?.length || 1) - 1 ? 0.5 : 1 }}>
                        <MaterialCommunityIcons name="chevron-right" size={24} color="#E5E7EB" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              )}
            </View>
          ) : null}

          <View style={{ marginTop: 12, backgroundColor: '#0F172A', borderColor: '#1F2937', borderWidth: 1, borderRadius: 12, padding: 12 }}>
            <Text style={{ color: '#F9FAFB', fontWeight: '700', fontSize: 16 }}>{detail.name}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
              {detail.primary_muscles?.map(m => (
                <View key={m} style={{ backgroundColor: 'rgba(14,165,164,0.12)', borderColor: '#0EA5A4', borderWidth: 1, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 16, marginRight: 8, marginBottom: 8 }}>
                  <Text style={{ color: '#0EA5A4', fontSize: 12 }}>{m}</Text>
                </View>
              ))}
              {detail.category ? (
                <View style={{ backgroundColor: 'rgba(59, 130, 246, 0.12)', borderColor: '#3B82F6', borderWidth: 1, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 16, marginRight: 8, marginBottom: 8 }}>
                  <Text style={{ color: '#60A5FA', fontSize: 12 }}>Category: {detail.category}</Text>
                </View>
              ) : null}
              {detail.difficulty ? (
                <View style={{ backgroundColor: 'rgba(245, 158, 11, 0.12)', borderColor: '#F59E0B', borderWidth: 1, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 16, marginRight: 8, marginBottom: 8 }}>
                  <Text style={{ color: '#FBBF24', fontSize: 12 }}>Difficulty: {detail.difficulty}</Text>
                </View>
              ) : null}
            </View>
          </View>

          {detail.steps && detail.steps.length > 0 ? (
            <View style={{ marginTop: 12, backgroundColor: '#0F172A', borderColor: '#1F2937', borderWidth: 1, borderRadius: 12, padding: 12 }}>
              <Text style={{ color: '#F9FAFB', fontWeight: '700', marginBottom: 8 }}>Steps</Text>
              {detail.steps.map((s, idx) => (
                <View key={idx} style={{ flexDirection: 'row', marginBottom: 8 }}>
                  <Text style={{ color: '#9CA3AF' }}>{idx + 1}.</Text>
                  <Text style={{ color: '#E5E7EB', marginLeft: 8, flex: 1 }}>{s}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
