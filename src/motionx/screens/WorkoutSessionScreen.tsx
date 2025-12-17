import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useWorkoutStore } from '../store/workoutStore';
import FastImage from 'react-native-fast-image';
import { showToast } from '../lib/toast';

export default function WorkoutSessionScreen() {
  const navigation = useNavigation<any>();
  const { activeSession, finishWorkout, cancelWorkout, addSet, removeSet, updateSet, removeExerciseFromSession } = useWorkoutStore();
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    if (!activeSession) {
      // If no session, go back
      navigation.goBack();
      return;
    }
  }, [activeSession, navigation]);

  const handleFinish = () => {
    setShowFinishModal(true);
  };

  const confirmFinish = () => {
    finishWorkout();
    setShowFinishModal(false);
    navigation.goBack();
    showToast.success('Workout Finished', 'Great job! Your workout has been saved.');
  };

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const confirmCancel = () => {
    cancelWorkout();
    setShowCancelModal(false);
    navigation.goBack();
    showToast.info('Workout Cancelled');
  };

  if (!activeSession) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0B0F14' }}>
      {/* Header */}
      <View style={{ height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#1F2937' }}>
        <TouchableOpacity onPress={handleCancel}>
          <MaterialCommunityIcons name="close" size={24} color="#9CA3AF" />
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: '#F9FAFB', fontWeight: 'bold', fontSize: 16 }}>{activeSession.name}</Text>
        </View>
        <TouchableOpacity onPress={handleFinish} style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#0EA5A4', borderRadius: 8 }}>
          <Text style={{ color: '#0B0F14', fontWeight: '700', fontSize: 12 }}>Finish</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {activeSession.exercises.map((exerciseInstance, index) => (
          <View key={exerciseInstance.id} style={{ marginBottom: 16 }}>
            {/* Exercise Header */}
            <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                 {exerciseInstance.exercise.imageUrl ? (
                    <FastImage source={{ uri: exerciseInstance.exercise.imageUrl }} style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: '#fff' }} resizeMode="contain" />
                  ) : (
                    <View style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: '#1F2937' }} />
                  )}
                <View>
                  <Text style={{ color: '#F9FAFB', fontWeight: 'bold', fontSize: 16 }}>{exerciseInstance.exercise.name}</Text>
                   <Text style={{ color: '#9CA3AF', fontSize: 12 }}>{exerciseInstance.exercise.targetMuscles?.[0]}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => removeExerciseFromSession(exerciseInstance.id)}>
                <MaterialCommunityIcons name="dots-horizontal" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* Sets Header */}
            <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginBottom: 8 }}>
              <Text style={{ color: '#9CA3AF', fontSize: 12, width: 30, textAlign: 'center' }}>Set</Text>
              <Text style={{ color: '#9CA3AF', fontSize: 12, flex: 1, textAlign: 'center' }}>Previous</Text>
              <Text style={{ color: '#9CA3AF', fontSize: 12, width: 60, textAlign: 'center' }}>kg</Text>
              <Text style={{ color: '#9CA3AF', fontSize: 12, width: 60, textAlign: 'center' }}>Reps</Text>
              <View style={{ width: 40 }} />
            </View>

            {/* Sets List */}
            {exerciseInstance.sets.map((set, setIndex) => (
              <View key={set.id} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 8, height: 36 }}>
                <View style={{ width: 30, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#9CA3AF', fontSize: 14 }}>{setIndex + 1}</Text>
                </View>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#6B7280', fontSize: 14 }}>-</Text>
                </View>
                <View style={{ width: 60, alignItems: 'center' }}>
                  <TextInput
                    style={{ width: 50, height: 32, backgroundColor: '#111827', borderRadius: 6, color: '#F9FAFB', textAlign: 'center', fontSize: 14 }}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#4B5563"
                    value={set.weight}
                    onChangeText={(text) => updateSet(exerciseInstance.id, set.id, 'weight', text)}
                  />
                </View>
                <View style={{ width: 60, alignItems: 'center' }}>
                   <TextInput
                    style={{ width: 50, height: 32, backgroundColor: '#111827', borderRadius: 6, color: '#F9FAFB', textAlign: 'center', fontSize: 14 }}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#4B5563"
                    value={set.reps}
                    onChangeText={(text) => updateSet(exerciseInstance.id, set.id, 'reps', text)}
                  />
                </View>
                <TouchableOpacity
                  onPress={() => updateSet(exerciseInstance.id, set.id, 'completed', !set.completed)}
                  style={{ width: 40, alignItems: 'center', justifyContent: 'center' }}
                >
                  <View style={{ width: 24, height: 24, borderRadius: 6, backgroundColor: set.completed ? '#0EA5A4' : '#1F2937', alignItems: 'center', justifyContent: 'center' }}>
                    {set.completed && <MaterialCommunityIcons name="check" size={16} color="#0B0F14" />}
                  </View>
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              onPress={() => addSet(exerciseInstance.id)}
              style={{ marginHorizontal: 16, marginTop: 8, paddingVertical: 8, borderRadius: 8, backgroundColor: '#1F2937', alignItems: 'center' }}
            >
              <Text style={{ color: '#0EA5A4', fontWeight: '600', fontSize: 12 }}>+ Add Set</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity
          onPress={() => navigation.navigate('ExerciseSelector')}
          style={{ margin: 16, padding: 16, borderRadius: 12, backgroundColor: '#0EA5A4', alignItems: 'center' }}
        >
          <Text style={{ color: '#0B0F14', fontWeight: 'bold', fontSize: 16 }}>Add Exercise</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Finish Confirmation Modal */}
      <Modal visible={showFinishModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <View style={{ width: '100%', maxWidth: 320, backgroundColor: '#111827', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#1F2937' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#F9FAFB', marginBottom: 8 }}>Finish Workout</Text>
            <Text style={{ color: '#9CA3AF', marginBottom: 24 }}>Are you sure you want to finish this workout?</Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity 
                onPress={() => setShowFinishModal(false)}
                style={{ flex: 1, height: 44, borderRadius: 8, backgroundColor: '#1F2937', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#374151' }}
              >
                <Text style={{ color: '#F9FAFB' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={confirmFinish}
                style={{ flex: 1, height: 44, borderRadius: 8, backgroundColor: '#0EA5A4', alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ color: '#0B0F14', fontWeight: '600' }}>Finish</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal visible={showCancelModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <View style={{ width: '100%', maxWidth: 320, backgroundColor: '#111827', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#1F2937' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#F9FAFB', marginBottom: 8 }}>Cancel Workout</Text>
            <Text style={{ color: '#9CA3AF', marginBottom: 24 }}>Are you sure you want to cancel? Progress will be lost.</Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity 
                onPress={() => setShowCancelModal(false)}
                style={{ flex: 1, height: 44, borderRadius: 8, backgroundColor: '#1F2937', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#374151' }}
              >
                <Text style={{ color: '#F9FAFB' }}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={confirmCancel}
                style={{ flex: 1, height: 44, borderRadius: 8, backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ color: '#F9FAFB', fontWeight: '600' }}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
