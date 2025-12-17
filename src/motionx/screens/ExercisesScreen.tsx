import { useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Dimensions, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getExercises, ExerciseListItem, ListMeta } from '../lib/exercisedb';
import TurboImage from 'react-native-turbo-image';
import {LinearGradient} from 'react-native-linear-gradient';

export default function ExercisesScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const bodyPart = route.params?.bodyPart;
  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState<ExerciseListItem[]>([]);
  const [meta, setMeta] = useState<ListMeta | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showStickyHeader, setShowStickyHeader] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        if (!bodyPart) {
          setExercises([]);
          return;
        }
        const res = await getExercises({ bodyParts: [bodyPart?.name], limit: 30 });
        setExercises(res.data);
        setMeta(res.meta);
      } finally {
        setLoading(false);
      }
    })();
  }, [bodyPart]);

  const loadMore = async () => {
    if (loadingMore) return;
    if (!meta?.hasNextPage || !meta.nextCursor) return;
    setLoadingMore(true);
    try {
      const res = await getExercises({ bodyParts: [bodyPart?.name], limit: 30, after: meta.nextCursor });
      setExercises(prev => [...prev, ...res.data]);
      setMeta(res.meta);
    } finally {
      setLoadingMore(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await getExercises({ bodyParts: [bodyPart?.name], limit: 30 });
      setExercises(res.data);
      setMeta(res.meta);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0B0F14' }}>


        <LinearGradient
          colors={['#000000ff', '#000000a5', 'rgba(0, 0, 0, 0)']}
          style={{ zIndex: 1, position: 'absolute', top: 0, left: 0, right: 0, height: 70, }}>

        <View style={{ zIndex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8 }}>
            <MaterialCommunityIcons name="chevron-left" size={24} color="#F9FAFB" />
          </TouchableOpacity>
          <Text style={{ color: '#F9FAFB', fontWeight: '700', marginLeft: 8 }}>{bodyPart?.name || ''}</Text>
        </View>
          </LinearGradient>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', }}>
          <ActivityIndicator color="#0EA5A4" />
        </View>
      ) : (
        <FlatList
          ListHeaderComponent={() => (<View style={{ width: '100%', height: Math.round(Dimensions.get('window').height * 0.4), backgroundColor: '#111827', marginBottom: 20 }}>
            {bodyPart?.imageUrl ? (
              <TurboImage
                source={{ uri: bodyPart.imageUrl }}
                style={{ width: '100%', height: '100%' }}
                resizeMode={FastImage.resizeMode.cover}
                cachePolicy='urlCache'
                blur={10}
              />
            ) : null}
            <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: '#000000a2' }}></View>
          </View>)}
          data={exercises}
          keyExtractor={(item) => item.exerciseId}
          contentContainerStyle={{ paddingBottom: 24 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          scrollEventThrottle={16}
          onScroll={(e) => {
            const y = e.nativeEvent.contentOffset.y;
            const threshold = Math.round(Dimensions.get('window').height * 0.35);
            if (!showStickyHeader && y > threshold) setShowStickyHeader(true);
            else if (showStickyHeader && y <= threshold) setShowStickyHeader(false);
          }}
          ListFooterComponent={loadingMore ? (
            <View style={{ paddingVertical: 16 }}>
              <ActivityIndicator color="#0EA5A4" />
            </View>
          ) : null}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{ flexDirection: 'row', gap: 12, marginHorizontal: 12, padding: 12, borderRadius: 12, backgroundColor: '#111827', borderWidth: 1, borderColor: '#1F2937' }}
              onPress={() => navigation.navigate('ExerciseDetail', { exerciseId: item.exerciseId, imageUrl: item.imageUrl })}
            >
              {item.imageUrl ? (
                <FastImage source={{ uri: item.imageUrl }} style={{ width: 96, height: 96, borderRadius: 10, backgroundColor: '#fff' }} resizeMode={FastImage.resizeMode.contain} />
              ) : (
                <View style={{ width: 96, height: 96, borderRadius: 10, backgroundColor: '#1F2937' }} />
              )}
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#F9FAFB', fontWeight: '600' }}>{item.name}</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                  {item.exerciseType ? (
                    <View style={{ alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: '#1F2937' }}>
                      <Text style={{ color: '#9CA3AF', fontSize: 12 }}>{item.exerciseType}</Text>
                    </View>
                  ) : null}
                  {item.equipments?.[0] ? (
                    <View style={{ alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: '#1F2937' }}>
                      <Text style={{ color: '#9CA3AF', fontSize: 12 }}>{item.equipments[0]}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}
