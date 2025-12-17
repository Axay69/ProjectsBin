import { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FastImage from 'react-native-fast-image';
import { getExercises, ExerciseListItem, getBodyParts, NamedImageItem, getExerciseById } from '../lib/exercisedb';
import { useWorkoutStore } from '../store/workoutStore';
import { showToast } from '../lib/toast';

export default function ExerciseSelectorScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const targetWorkoutId = route.params?.targetWorkoutId;
  
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [exercises, setExercises] = useState<ExerciseListItem[]>([]);
  const [bodyParts, setBodyParts] = useState<NamedImageItem[]>([]);
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);
  const searchTimeout = useRef<any>(null);
  
  const addExerciseToSession = useWorkoutStore(state => state.addExerciseToSession);
  const addExerciseToPlan = useWorkoutStore(state => state.addExerciseToPlan);
  const savedPlans = useWorkoutStore(state => state.savedPlans);
  const activeSession = useWorkoutStore(state => state.activeSession);

  // Get current exercises in the target workout or session
  const existingExerciseIds = targetWorkoutId
    ? savedPlans.find(p => p.id === targetWorkoutId)?.exercises.map(e => e.exerciseId) || []
    : activeSession?.exercises.map(e => e.exercise.exerciseId) || [];

  const search = async (text: string, bodyPart: string | null = selectedBodyPart) => {
    setLoading(true);
    try {
      const params: any = { limit: 20 };
      if (text) params.name = text;
      if (bodyPart) params.bodyParts = [bodyPart];
      
      const res = await getExercises(params);
      setExercises(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load body parts
    (async () => {
      try {
        const parts = await getBodyParts();
        setBodyParts(parts);
      } catch (e) {
        console.error('Failed to load body parts', e);
      }
    })();
    search('');
  }, []);

  const handleTextChange = (text: string) => {
    setQuery(text);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      search(text, selectedBodyPart);
    }, 500);
  };

  const handleBodyPartSelect = (bp: string) => {
    const newValue = selectedBodyPart === bp ? null : bp;
    setSelectedBodyPart(newValue);
    search(query, newValue);
  };

  const handleSelect = async (exercise: ExerciseListItem) => {
    if (existingExerciseIds.includes(exercise.exerciseId)) {
      showToast.info('Already Added', 'This exercise is already in your workout.');
      return;
    }

    setAddingId(exercise.exerciseId);
    try {
      // Fetch full details
      const fullDetails = await getExerciseById(exercise.exerciseId);
      
      if (targetWorkoutId) {
        addExerciseToPlan(targetWorkoutId, fullDetails);
        showToast.success('Success', 'Exercise added to workout plan');
      } else {
        addExerciseToSession(fullDetails);
        showToast.success('Success', 'Exercise added to current session');
      }
      
      // Don't navigate back, just show success
    } catch (e) {
      console.error('Failed to add exercise', e);
      showToast.error('Error', 'Failed to add exercise details');
    } finally {
      setAddingId(null);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0B0F14' }}>
      <View style={{ padding: 16, paddingBottom: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="chevron-left" size={28} color="#F9FAFB" />
          </TouchableOpacity>
          <View style={{ flex: 1, height: 44, backgroundColor: '#111827', borderRadius: 12, borderWidth: 1, borderColor: '#1F2937', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }}>
            <MaterialCommunityIcons name="magnify" size={20} color="#9CA3AF" />
            <TextInput
              style={{ flex: 1, color: '#F9FAFB', marginLeft: 8, fontSize: 16 }}
              placeholder="Search exercises..."
              placeholderTextColor="#6B7280"
              value={query}
              onChangeText={handleTextChange}
              autoFocus={!selectedBodyPart}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => handleTextChange('')}>
                <MaterialCommunityIcons name="close-circle" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Body Parts List */}
        <View style={{ marginBottom: 12 }}>
          <FlatList
            horizontal
            data={bodyParts}
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.name}
            contentContainerStyle={{ gap: 8 }}
            renderItem={({ item }) => {
              const isSelected = selectedBodyPart === item.name;
              return (
                <TouchableOpacity
                  onPress={() => handleBodyPartSelect(item.name)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: isSelected ? '#0EA5A4' : '#111827',
                    borderWidth: 1,
                    borderColor: isSelected ? '#0EA5A4' : '#1F2937',
                  }}
                >
                  <Text style={{ color: isSelected ? '#0B0F14' : '#9CA3AF', fontWeight: '600', fontSize: 13, textTransform: 'capitalize' }}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#0EA5A4" />
        </View>
      ) : (
        <FlatList
          data={exercises}
          keyExtractor={item => item.exerciseId}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
              renderItem={({ item }) => {
                const isAdded = existingExerciseIds.includes(item.exerciseId);
                return (
                  <TouchableOpacity
                    style={{ flexDirection: 'row', gap: 12, padding: 12, borderRadius: 12, backgroundColor: '#111827', borderWidth: 1, borderColor: isAdded ? '#059669' : '#1F2937' }}
                    onPress={() => handleSelect(item)}
                    disabled={isAdded}
                  >
                    {item.imageUrl ? (
                      <FastImage source={{ uri: item.imageUrl }} style={{ width: 64, height: 64, borderRadius: 8, backgroundColor: '#fff' }} resizeMode="contain" />
                    ) : (
                      <View style={{ width: 64, height: 64, borderRadius: 8, backgroundColor: '#1F2937' }} />
                    )}
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                      <Text style={{ color: '#F9FAFB', fontWeight: '600', fontSize: 16 }}>{item.name}</Text>
                      <Text style={{ color: '#9CA3AF', fontSize: 13, marginTop: 4 }}>{item.targetMuscles?.[0] || item.bodyParts?.[0]}</Text>
                    </View>
                    <View style={{ justifyContent: 'center' }}>
                      <MaterialCommunityIcons 
                        name={isAdded ? "check-circle" : "plus-circle-outline"} 
                        size={24} 
                        color={isAdded ? "#10B981" : "#0EA5A4"} 
                      />
                    </View>
                  </TouchableOpacity>
                );
              }}
        />
      )}
    </SafeAreaView>
  );
}
