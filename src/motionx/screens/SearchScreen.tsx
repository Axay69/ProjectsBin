import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FastImage from 'react-native-fast-image';
import Modal from 'react-native-modal';
import {
  getExercises,
  getBodyParts,
  getEquipments,
  getExerciseTypes,
  ExerciseListItem,
  NamedImageItem
} from '../lib/exercisedb';
import { showToast } from '../lib/toast';

type FilterCategory = 'bodyPart' | 'equipment' | 'type';

export default function SearchScreen() {
  const navigation = useNavigation<any>();

  // Data State
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ExerciseListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);

  // Filter Data State
  const [allBodyParts, setAllBodyParts] = useState<NamedImageItem[]>([]);
  const [allEquipments, setAllEquipments] = useState<NamedImageItem[]>([]);
  const [allTypes, setAllTypes] = useState<NamedImageItem[]>([]);

  // Selected Filters
  const [selectedBodyParts, setSelectedBodyParts] = useState<string[]>([]);
  const [selectedEquipments, setSelectedEquipments] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // UI State
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('bodyPart');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Debounce Search
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadFilterData();
    performSearch(true);
  }, []);

  const loadFilterData = async () => {
    try {
      const [bp, eq, tp] = await Promise.all([
        getBodyParts(),
        getEquipments(),
        getExerciseTypes()
      ]);
      setAllBodyParts(bp);
      setAllEquipments(eq);
      setAllTypes(tp);
    } catch (e) {
      console.error('Failed to load filter data', e);
      showToast.error('Error', 'Failed to load filter options');
    }
  };

  const performSearch = async (reset: boolean = false, queryOverride?: string) => {
    if (loading && !reset) return;

    setLoading(true);
    try {
      const cursor = reset ? undefined : nextCursor;
      const res = await getExercises({
        name: queryOverride !== undefined ? queryOverride : query,
        bodyParts: selectedBodyParts,
        equipments: selectedEquipments,
        exerciseType: selectedType || undefined,
        limit: 20,
        after: cursor
      });

      if (reset) {
        setResults(res.data);
      } else {
        setResults(prev => [...prev, ...res.data]);
      }

      setNextCursor(res.meta.nextCursor);
    } catch (e) {
      console.error('Search failed', e);
      showToast.error('Error', 'Failed to search exercises');
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  };

  const handleSearchChange = (text: string) => {
    setQuery(text);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      performSearch(true, text);
    }, 500);
  };

  const handleFilterChange = () => {
    performSearch(true);
  };

  const toggleBodyPart = (bp: string) => {
    setSelectedBodyParts(prev =>
      prev.includes(bp) ? prev.filter(p => p !== bp) : [...prev, bp]
    );
  };

  const toggleEquipment = (eq: string) => {
    setSelectedEquipments(prev =>
      prev.includes(eq) ? prev.filter(e => e !== eq) : [...prev, eq]
    );
  };

  const toggleType = (tp: string) => {
    setSelectedType(prev => prev === tp ? null : tp);
  };

  const openFilterModal = (category: FilterCategory) => {
    setActiveCategory(category);
    setTimeout(() => setFilterModalVisible(true), 100);
  };

  const renderExerciseItem = ({ item }: { item: ExerciseListItem }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => navigation.navigate('ExerciseDetail', { exerciseId: item.exerciseId, imageUrl: item.imageUrl })}
      style={{
        flexDirection: 'row',
        padding: 12,
        backgroundColor: '#111827',
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#1F2937'
      }}
    >
      <View style={{ width: 80, height: 80, borderRadius: 8, backgroundColor: '#fff', overflow: 'hidden' }}>
        {item.imageUrl ? (
          <FastImage source={{ uri: item.imageUrl }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
        ) : (
          <View style={{ flex: 1, backgroundColor: '#1F2937' }} />
        )}
      </View>

      <View style={{ flex: 1, marginLeft: 12, justifyContent: 'center' }}>
        <Text style={{ color: '#F9FAFB', fontSize: 16, fontWeight: '600', marginBottom: 4 }} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {item.bodyParts?.slice(0, 2).map(bp => (
            <View key={bp} style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, backgroundColor: '#1F2937', borderWidth: 1, borderColor: '#374151' }}>
              <Text style={{ color: '#9CA3AF', fontSize: 10 }}>{bp}</Text>
            </View>
          ))}
          {item.equipments?.slice(0, 1).map(eq => (
            <View key={eq} style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, backgroundColor: 'rgba(14,165,164,0.1)', borderWidth: 1, borderColor: 'rgba(14,165,164,0.3)' }}>
              <Text style={{ color: '#0EA5A4', fontSize: 10 }}>{eq}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ justifyContent: 'center' }}>
        <MaterialCommunityIcons name="chevron-right" size={24} color="#4B5563" />
      </View>
    </TouchableOpacity>
  );

  const closeModal = () => {
    setFilterModalVisible(false);
    handleFilterChange();
  }

  const renderFilterModal = () => (
    <Modal isVisible={filterModalVisible} style={{ margin: 0, justifyContent: 'flex-end', }} onBackdropPress={() => {}} onBackButtonPress={closeModal} useNativeDriver={true} useNativeDriverForBackdrop={true} animationIn="slideInUp" onDismiss={closeModal}>
      <View style={{ justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: '#111827', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%', paddingBottom: 30 }}>
          <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#1F2937', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: '#F9FAFB', fontSize: 18, fontWeight: 'bold' }}>
              Select {activeCategory === 'bodyPart' ? 'Body Parts' : activeCategory === 'equipment' ? 'Equipments' : 'Exercise Type'}
            </Text>
            <TouchableOpacity onPress={() => { setFilterModalVisible(false); handleFilterChange(); }}>
              <Text style={{ color: '#0EA5A4', fontWeight: '600' }}>Done</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {activeCategory === 'bodyPart' && allBodyParts.map(item => {
                const isSelected = selectedBodyParts.includes(item.name);
                return (
                  <TouchableOpacity
                    key={item.name}
                    onPress={() => toggleBodyPart(item.name)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 8,
                      backgroundColor: isSelected ? 'rgba(14,165,164,0.2)' : '#1F2937',
                      borderWidth: 1,
                      borderColor: isSelected ? '#0EA5A4' : '#374151',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8
                    }}
                  >
                    <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff', overflow: 'hidden' }}>
                      <FastImage source={{ uri: item.imageUrl }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                    </View>
                    <Text style={{ color: isSelected ? '#0EA5A4' : '#9CA3AF', fontWeight: isSelected ? '600' : '400' }}>{item.name}</Text>
                  </TouchableOpacity>
                );
              })}

              {activeCategory === 'equipment' && allEquipments.map(item => {
                const isSelected = selectedEquipments.includes(item.name);
                return (
                  <TouchableOpacity
                    key={item.name}
                    onPress={() => toggleEquipment(item.name)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 8,
                      backgroundColor: isSelected ? 'rgba(14,165,164,0.2)' : '#1F2937',
                      borderWidth: 1,
                      borderColor: isSelected ? '#0EA5A4' : '#374151',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8
                    }}
                  >
                    <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff', overflow: 'hidden' }}>
                      <FastImage source={{ uri: item.imageUrl }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                    </View>
                    <Text style={{ color: isSelected ? '#0EA5A4' : '#9CA3AF', fontWeight: isSelected ? '600' : '400' }}>{item.name}</Text>
                  </TouchableOpacity>
                );
              })}

              {activeCategory === 'type' && allTypes.map(item => {
                const isSelected = selectedType === item.name;
                return (
                  <TouchableOpacity
                    key={item.name}
                    onPress={() => toggleType(item.name)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 8,
                      backgroundColor: isSelected ? 'rgba(14,165,164,0.2)' : '#1F2937',
                      borderWidth: 1,
                      borderColor: isSelected ? '#0EA5A4' : '#374151',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8
                    }}
                  >
                    <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff', overflow: 'hidden' }}>
                      <FastImage source={{ uri: item.imageUrl }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                    </View>
                    <Text style={{ color: isSelected ? '#0EA5A4' : '#9CA3AF', fontWeight: isSelected ? '600' : '400' }}>{item.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0B0F14' }}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#F9FAFB', marginBottom: 16 }}>Search Exercises</Text>

        {/* Search Bar */}
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#1F2937', borderRadius: 12, paddingHorizontal: 12, height: 48, marginBottom: 12 }}>
          <MaterialCommunityIcons name="magnify" size={24} color="#9CA3AF" />
          <TextInput
            style={{ flex: 1, color: '#F9FAFB', marginLeft: 8, fontSize: 16 }}
            placeholder="Search by name..."
            placeholderTextColor="#6B7280"
            value={query}
            onChangeText={handleSearchChange}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => handleSearchChange('')}>
              <MaterialCommunityIcons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
          <TouchableOpacity
            onPress={() => openFilterModal('bodyPart')}
            style={{
              flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
              backgroundColor: selectedBodyParts.length ? 'rgba(14,165,164,0.2)' : '#1F2937',
              borderWidth: 1, borderColor: selectedBodyParts.length ? '#0EA5A4' : '#374151'
            }}
          >
            <Text style={{ color: selectedBodyParts.length ? '#0EA5A4' : '#9CA3AF', fontWeight: '500' }}>Body Parts</Text>
            {selectedBodyParts.length > 0 && (
              <View style={{ marginLeft: 6, backgroundColor: '#0EA5A4', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1 }}>
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>{selectedBodyParts.length}</Text>
              </View>
            )}
            <MaterialCommunityIcons name="chevron-down" size={16} color={selectedBodyParts.length ? '#0EA5A4' : '#9CA3AF'} style={{ marginLeft: 4 }} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => openFilterModal('equipment')}
            style={{
              flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
              backgroundColor: selectedEquipments.length ? 'rgba(14,165,164,0.2)' : '#1F2937',
              borderWidth: 1, borderColor: selectedEquipments.length ? '#0EA5A4' : '#374151'
            }}
          >
            <Text style={{ color: selectedEquipments.length ? '#0EA5A4' : '#9CA3AF', fontWeight: '500' }}>Equipments</Text>
            {selectedEquipments.length > 0 && (
              <View style={{ marginLeft: 6, backgroundColor: '#0EA5A4', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1 }}>
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>{selectedEquipments.length}</Text>
              </View>
            )}
            <MaterialCommunityIcons name="chevron-down" size={16} color={selectedEquipments.length ? '#0EA5A4' : '#9CA3AF'} style={{ marginLeft: 4 }} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => openFilterModal('type')}
            style={{
              flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
              backgroundColor: selectedType ? 'rgba(14,165,164,0.2)' : '#1F2937',
              borderWidth: 1, borderColor: selectedType ? '#0EA5A4' : '#374151'
            }}
          >
            <Text style={{ color: selectedType ? '#0EA5A4' : '#9CA3AF', fontWeight: '500' }}>Type</Text>
            {selectedType && (
              <View style={{ marginLeft: 6, backgroundColor: '#0EA5A4', borderRadius: 4, width: 8, height: 8 }} />
            )}
            <MaterialCommunityIcons name="chevron-down" size={16} color={selectedType ? '#0EA5A4' : '#9CA3AF'} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </ScrollView>
      </View>

      <FlatList
        data={results}
        renderItem={renderExerciseItem}
        keyExtractor={(item, index) => item.exerciseId + index}
        contentContainerStyle={{ padding: 16, paddingTop: 0 }}
        onEndReached={() => {
          if (nextCursor) performSearch();
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading ? <ActivityIndicator color="#0EA5A4" style={{ marginVertical: 20 }} /> : null}
        ListEmptyComponent={!loading && !isInitialLoad ? (
          <View style={{ alignItems: 'center', justifyContent: 'center', padding: 40 }}>
            <MaterialCommunityIcons name="dumbbell" size={48} color="#374151" />
            <Text style={{ color: '#9CA3AF', marginTop: 12 }}>No exercises found</Text>
          </View>
        ) : null}
      />

      {filterModalVisible && renderFilterModal()}
    </SafeAreaView>
  );
}