import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FastImage from 'react-native-fast-image';
import { useWorkoutStore, WorkoutPlan } from '../store/workoutStore';
import { showToast } from '../lib/toast';

export default function WorkoutPlanScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const planId = route.params?.planId;
  const { savedPlans, deletePlan, removeExerciseFromPlan, reorderExercisesInPlan } = useWorkoutStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const plan = savedPlans.find(p => p.id === planId);

  console.log('plan', plan);
  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    deletePlan(planId);
    setShowDeleteModal(false);
    navigation.goBack();
    showToast.success('Success', 'Workout deleted successfully');
  };

  const moveExercise = (index: number, direction: 'up' | 'down') => {
    if (!plan) return;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= plan.exercises.length) return;
    reorderExercisesInPlan(planId, index, newIndex);
  };

  if (!plan) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0B0F14' }}>
      <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="chevron-left" size={28} color="#F9FAFB" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#F9FAFB' }}>{plan.name}</Text>
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
            <Text style={{ color: '#0EA5A4', fontWeight: '600', fontSize: 16 }}>
              {isEditing ? 'Done' : 'Edit'}
            </Text>
          </TouchableOpacity>
          {isEditing && (
            <TouchableOpacity onPress={handleDelete}>
              <MaterialCommunityIcons name="trash-can-outline" size={24} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }} overScrollMode='never' showsVerticalScrollIndicator={false}>
        <Text style={{ color: '#9CA3AF', marginBottom: 16 }}>
          {plan.exercises.length} Exercises
        </Text>

        {plan.exercises.map((exercise, index) => {
          return (
            <TouchableOpacity 
              key={exercise.exerciseId + index} 
              onPress={() => navigation.navigate('ExerciseDetail', { exerciseId: exercise.exerciseId, imageUrl: exercise.imageUrl })}
              disabled={isEditing}
              style={{ flexDirection: 'row', gap: 12, padding: 12, borderRadius: 12, backgroundColor: '#111827', borderWidth: 1, borderColor: '#1F2937', marginBottom: 12 }}
            >
              <View style={{ width: 64, height: 64, borderRadius: 8, overflow: 'hidden', backgroundColor: '#fff' }}>
                {exercise.imageUrl ? (
                  <FastImage source={{ uri: exercise.imageUrl }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                ) : (
                  <View style={{ width: '100%', height: '100%', backgroundColor: '#1F2937' }} />
                )}
              </View>
              
              <View style={{ flex: 1, justifyContent: 'center' }}>
                <Text style={{ color: '#F9FAFB', fontWeight: '600' }}>{exercise.name}</Text>
                <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 4 }}>{exercise.targetMuscles?.[0]}</Text>
              </View>
              
              {isEditing && (
                <View style={{ alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {index > 0 && (
                      <TouchableOpacity onPress={() => moveExercise(index, 'up')}>
                        <MaterialCommunityIcons name="arrow-up" size={20} color="#9CA3AF" />
                      </TouchableOpacity>
                    )}
                    {index < plan.exercises.length - 1 && (
                      <TouchableOpacity onPress={() => moveExercise(index, 'down')}>
                        <MaterialCommunityIcons name="arrow-down" size={20} color="#9CA3AF" />
                      </TouchableOpacity>
                    )}
                  </View>
                  <TouchableOpacity onPress={() => removeExerciseFromPlan(planId, exercise.exerciseId)}>
                    <MaterialCommunityIcons name="close" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          onPress={() => navigation.navigate('ExerciseSelector', { targetWorkoutId: planId })}
          style={{ padding: 16, borderRadius: 12, borderStyle: 'dashed', borderWidth: 1, borderColor: '#0EA5A4', alignItems: 'center', marginTop: 8 }}
        >
          <Text style={{ color: '#0EA5A4', fontWeight: '600' }}>+ Add Exercise</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <View style={{ width: '100%', maxWidth: 320, backgroundColor: '#111827', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#1F2937' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#F9FAFB', marginBottom: 8 }}>Delete Workout</Text>
            <Text style={{ color: '#9CA3AF', marginBottom: 24 }}>Are you sure you want to delete this workout? This action cannot be undone.</Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity 
                onPress={() => setShowDeleteModal(false)}
                style={{ flex: 1, height: 44, borderRadius: 8, backgroundColor: '#1F2937', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#374151' }}
              >
                <Text style={{ color: '#F9FAFB' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={confirmDelete}
                style={{ flex: 1, height: 44, borderRadius: 8, backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ color: '#F9FAFB', fontWeight: '600' }}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}