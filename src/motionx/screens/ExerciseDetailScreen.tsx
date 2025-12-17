import { useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions, StyleSheet, Modal } from 'react-native';
import FastImage from 'react-native-fast-image';
import TurboImage from 'react-native-turbo-image';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Video from 'react-native-video';
import { getExerciseById, ExerciseDetail } from '../lib/exercisedb';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { Layout, FadeIn, FadeOut } from 'react-native-reanimated';
import { useWorkoutStore } from '../store/workoutStore';
import { showToast } from '../lib/toast';

export default function ExerciseDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const exerciseId: string | undefined = route.params?.exerciseId;
  const routeImageUrl: string | undefined = route.params?.imageUrl;
  const [loading, setLoading] = useState(true);
  const [exercise, setExercise] = useState<ExerciseDetail | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [showVariations, setShowVariations] = useState(false);
  
  const { savedPlans, addExerciseToPlan } = useWorkoutStore();
  const [showAddToWorkoutModal, setShowAddToWorkoutModal] = useState(false);
  const [selectedPlanIds, setSelectedPlanIds] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      try {
        if (!exerciseId) return;
        const detail = await getExerciseById(exerciseId);
        setExercise(detail);

      } finally {
        setLoading(false);
      }
    })();

  }, [exerciseId]);

  const togglePlanSelection = (planId: string) => {
    if (selectedPlanIds.includes(planId)) {
      setSelectedPlanIds(prev => prev.filter(id => id !== planId));
    } else {
      setSelectedPlanIds(prev => [...prev, planId]);
    }
  };

  const handleSaveToWorkouts = () => {
    if (!exercise) return;
    selectedPlanIds.forEach(planId => {
      addExerciseToPlan(planId, exercise);
    });
    setShowAddToWorkoutModal(false);
    setSelectedPlanIds([]);
    showToast.success('Success', 'Exercise added to selected workouts');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0B0F14' }}>


      <View style={{ height: 56, backgroundColor: '#000000ff', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8 }}>
            <MaterialCommunityIcons name="chevron-left" size={24} color="#F9FAFB" />
          </TouchableOpacity>
          <Text style={{ color: '#F9FAFB', fontWeight: '700', marginLeft: 8 }}>{exercise?.name || ''}</Text>
        </View>
        <TouchableOpacity 
          onPress={() => setShowAddToWorkoutModal(true)}
          style={{ padding: 8 }}
        >
          <MaterialCommunityIcons name="plus-circle-multiple-outline" size={24} color="#0EA5A4" />
        </TouchableOpacity>
      </View>


      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#0EA5A4" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {exercise && (
            <>
              {exercise.videoUrl ? (
                <Animated.View layout={Layout.duration(600)} style={{ width: '100%', aspectRatio: 16 / 9, borderRadius: 12, overflow: 'hidden', backgroundColor: '#111827', borderWidth: 1, borderColor: '#1F2937', marginBottom: 16 }}>
                  <Video
                    source={{ uri: (exercise.videoUrl || '').replace(/\s/g, '') }}
                    style={{ width: '100%', height: '100%' }}
                    controls={false}
                    repeat
                    muted
                    poster={exercise.imageUrl}
                    resizeMode={'contain'}
                  />
                </Animated.View>
              ) : null}
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#F9FAFB', marginBottom: 8 }}>Targets</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {(exercise.targetMuscles || []).map(m => (
                  <View key={m} style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#1F2937' }}>
                    <Text style={{ color: '#9CA3AF', fontSize: 12 }}>{m}</Text>
                  </View>
                ))}
              </View>

              <Text style={{ fontSize: 16, fontWeight: '700', color: '#F9FAFB', marginBottom: 8 }}>Equipments</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {(exercise.equipments || []).map(eq => (
                  <View key={eq} style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#1F2937' }}>
                    <Text style={{ color: '#9CA3AF', fontSize: 12 }}>{eq}</Text>
                  </View>
                ))}
              </View>

              <Text style={{ fontSize: 16, fontWeight: '700', color: '#F9FAFB', marginBottom: 8 }}>Exercise Type</Text>
              {exercise.exerciseType ? (
                <View style={{ alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#1F2937', marginBottom: 16 }}>
                  <Text style={{ color: '#9CA3AF', fontSize: 12 }}>{exercise.exerciseType}</Text>
                </View>
              ) : null}

              {exercise.overview ? (
                <>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#F9FAFB', marginBottom: 8 }}>Overview</Text>
                  <View style={{ padding: 12, borderRadius: 12, backgroundColor: '#111827', borderWidth: 1, borderColor: '#1F2937', marginBottom: 16 }}>
                    <Text style={{ color: '#F9FAFB', fontWeight: '400', fontSize: 14 }}>{exercise.overview}</Text>
                  </View>
                </>
              ) : null}

              <Animated.View layout={Layout.duration(600)} style={{ overflow: 'hidden' }}>
                <TouchableOpacity onPress={() => setShowInstructions(s => !s)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 }} >
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#F9FAFB' }}>Instructions</Text>
                  <MaterialCommunityIcons name={showInstructions ? 'chevron-up' : 'chevron-down'} size={20} color="#9CA3AF" />
                </TouchableOpacity>
                {showInstructions && (
                  <Animated.View entering={FadeIn.duration(600)} exiting={FadeOut.duration(600)} layout={Layout.duration(600)}>
                    {(exercise.instructions || []).map((instruction, index) => (
                      <Animated.View key={index} layout={Layout.duration(600)} style={{ flexDirection: 'row', gap: 12, padding: 12, borderRadius: 12, backgroundColor: '#111827', borderWidth: 1, borderColor: '#1F2937', marginBottom: 8 }}>
                        <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(14,165,164,0.15)', alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ color: '#0EA5A4', fontWeight: '700' }}>{index + 1}</Text>
                        </View>
                        <View style={{ alignItems: 'center', marginRight: 40 }}>
                          <Text style={{ color: '#F9FAFB', fontWeight: '300', fontSize: 13 }}>{instruction}</Text>
                        </View>
                      </Animated.View>
                    ))}
                  </Animated.View>
                )}
              </Animated.View>

              <Animated.View layout={Layout.duration(600)} style={{ overflow: 'hidden' }}>
                <TouchableOpacity onPress={() => setShowTips(s => !s)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4, marginTop: 8 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#F9FAFB' }}>Exercise Tips</Text>
                  <MaterialCommunityIcons name={showTips ? 'chevron-up' : 'chevron-down'} size={20} color="#9CA3AF" />
                </TouchableOpacity>
                {showTips && (
                  <Animated.View entering={FadeIn.duration(600)} exiting={FadeOut.duration(600)} layout={Layout.duration(600)}>
                    {(exercise.exerciseTips || []).map((tip, index) => (
                      <Animated.View key={index} layout={Layout.duration(600)} style={{ padding: 12, borderRadius: 12, backgroundColor: '#111827', borderWidth: 1, borderColor: '#1F2937', marginBottom: 8 }}>
                        <Text style={{ color: '#F9FAFB', fontWeight: '300', fontSize: 13 }}>{tip}</Text>
                      </Animated.View>
                    ))}
                  </Animated.View>
                )}
              </Animated.View>

              <Animated.View layout={Layout.duration(600)} style={{ overflow: 'hidden' }}>
                <TouchableOpacity onPress={() => setShowVariations(s => !s)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4, marginTop: 8 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#F9FAFB' }}>Variations</Text>
                  <MaterialCommunityIcons name={showVariations ? 'chevron-up' : 'chevron-down'} size={20} color="#9CA3AF" />
                </TouchableOpacity>
                {showVariations && (
                  <Animated.View entering={FadeIn.duration(600)} exiting={FadeOut.duration(600)} layout={Layout.duration(600)}>
                    {(exercise.variations || []).map((variation, index) => (
                      <Animated.View key={index} layout={Layout.duration(600)} style={{ padding: 12, borderRadius: 12, backgroundColor: '#111827', borderWidth: 1, borderColor: '#1F2937', marginBottom: 8 }}>
                        <Text style={{ color: '#F9FAFB', fontWeight: '300', fontSize: 13 }}>{variation}</Text>
                      </Animated.View>
                    ))}
                  </Animated.View>
                )}
              </Animated.View>

                            <Animated.View layout={Layout.duration(600)}>
                {exercise.relatedExerciseIds && exercise.relatedExerciseIds.length ? (
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#F9FAFB', marginTop: 8, marginBottom: 8 }}>Related Exercises</Text>
                ) : null}
                {exercise.relatedExerciseIds && exercise.relatedExerciseIds.length ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 4 }}>
                    {exercise.relatedExerciseIds.map(id => (
                      <TouchableOpacity key={id} activeOpacity={0.7} onPress={() => {
                        navigation.push('ExerciseDetail', { exerciseId: id, imageUrl: routeImageUrl })
                      }}>
                        <View style={{ width: 140, height: 100, marginRight: 12, borderRadius: 12, backgroundColor: '#111827', borderWidth: 1, borderColor: '#1F2937', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: '#9CA3AF', fontSize: 12 }}>Coming Soon</Text>
                        <Text style={{ color: '#F9FAFB', fontWeight: '600', marginTop: 6 }}>{id.slice(0, 10)}…</Text>
                      </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                ) : null}
              </Animated.View>
            </>
          )}
        </ScrollView>
      )}

      {/* Add to Workout Modal */}
      <Modal visible={showAddToWorkoutModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <View style={{ width: '100%', maxWidth: 320, backgroundColor: '#111827', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#1F2937', maxHeight: '80%' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#F9FAFB', marginBottom: 16 }}>Add to Workout</Text>
            
            <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
              {savedPlans.length === 0 ? (
                <Text style={{ color: '#9CA3AF', textAlign: 'center', padding: 20 }}>No custom workouts created yet.</Text>
              ) : (
                savedPlans.map(plan => {
                  const isSelected = selectedPlanIds.includes(plan.id);
                  // Check if exercise is already in this plan
                  // Note: plan.exercises items can be ExerciseListItem or ExerciseDetail. 
                  // Both have exerciseId property.
                  const isAlreadyAdded = plan.exercises.some(e => e.exerciseId === exerciseId);
                  
                  return (
                    <TouchableOpacity 
                      key={plan.id}
                      onPress={() => togglePlanSelection(plan.id)}
                      disabled={isAlreadyAdded}
                      style={{ 
                        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                        padding: 12, borderRadius: 8, 
                        backgroundColor: isAlreadyAdded ? '#1F2937' : (isSelected ? 'rgba(14,165,164,0.1)' : '#0B0F14'),
                        borderWidth: 1, 
                        borderColor: isAlreadyAdded ? '#374151' : (isSelected ? '#0EA5A4' : '#1F2937'), 
                        marginBottom: 8,
                        opacity: isAlreadyAdded ? 0.7 : 1
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: isAlreadyAdded ? '#9CA3AF' : '#F9FAFB', fontWeight: '500' }}>{plan.name}</Text>
                        {isAlreadyAdded && <Text style={{ color: '#10B981', fontSize: 10, marginTop: 2 }}>Already added</Text>}
                      </View>
                      
                      {isSelected && !isAlreadyAdded && <MaterialCommunityIcons name="check" size={20} color="#0EA5A4" />}
                      {isAlreadyAdded && <MaterialCommunityIcons name="check-circle" size={20} color="#10B981" />}
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
              <TouchableOpacity 
                onPress={() => setShowAddToWorkoutModal(false)}
                style={{ flex: 1, height: 44, borderRadius: 8, backgroundColor: '#1F2937', alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ color: '#F9FAFB' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleSaveToWorkouts}
                disabled={selectedPlanIds.length === 0}
                style={{ flex: 1, height: 44, borderRadius: 8, backgroundColor: selectedPlanIds.length === 0 ? '#374151' : '#0EA5A4', alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ color: selectedPlanIds.length === 0 ? '#9CA3AF' : '#0B0F14', fontWeight: '600' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
