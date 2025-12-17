import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Modal, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useWorkoutStore } from '../store/workoutStore';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function TrainScreen() {
  const navigation = useNavigation<any>();
  const { savedPlans, createPlan } = useWorkoutStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');

  const handleCreatePlan = () => {
    if (!newPlanName.trim()) return;
    createPlan(newPlanName);
    setNewPlanName('');
    setShowCreateModal(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0F14' }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}>
        <View style={{ paddingTop: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#F9FAFB', marginBottom: 6 }}>Training</Text>
            <Text style={{ color: '#9CA3AF' }}>Manage your workouts</Text>
          </View>
          <TouchableOpacity 
            onPress={() => setShowCreateModal(true)}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#0EA5A4', alignItems: 'center', justifyContent: 'center' }}
          >
             <MaterialCommunityIcons name="plus" size={24} color="#0B0F14" />
          </TouchableOpacity>
        </View>

        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#F9FAFB', marginTop: 24, marginBottom: 12 }}>My Workouts</Text>
        
        {savedPlans.length === 0 ? (
          <View style={{ padding: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: '#111827', borderRadius: 16, borderWidth: 1, borderColor: '#1F2937' }}>
            <Text style={{ color: '#9CA3AF', marginBottom: 12 }}>No workouts created yet.</Text>
            <TouchableOpacity onPress={() => setShowCreateModal(true)}>
              <Text style={{ color: '#0EA5A4', fontWeight: '600' }}>Create your first workout</Text>
            </TouchableOpacity>
          </View>
        ) : (
          savedPlans.map(plan => (
            <TouchableOpacity 
              key={plan.id} 
              onPress={() => navigation.navigate('WorkoutPlan', { planId: plan.id })}
              style={{ padding: 16, borderRadius: 12, backgroundColor: '#111827', borderWidth: 1, borderColor: '#1F2937', marginBottom: 12 }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                 <View>
                    <Text style={{ color: '#F9FAFB', fontWeight: '600', fontSize: 16 }}>{plan.name}</Text>
                    <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 4 }}>
                      {plan.exercises.length} Exercises
                    </Text>
                    {plan.exercises.length > 0 && (
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                         {[...new Set(plan.exercises.flatMap(e => e.bodyParts || []))].slice(0, 3).map(bp => (
                           <View key={bp} style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, backgroundColor: '#1F2937' }}>
                              <Text style={{ color: '#9CA3AF', fontSize: 10 }}>{bp}</Text>
                           </View>
                         ))}
                      </View>
                    )}
                 </View>
                 <MaterialCommunityIcons name="chevron-right" size={24} color="#4B5563" />
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Create Modal */}
      <Modal visible={showCreateModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <View style={{ width: '100%', maxWidth: 320, backgroundColor: '#111827', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#1F2937' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#F9FAFB', marginBottom: 16 }}>New Workout</Text>
            <TextInput
              style={{ width: '100%', height: 44, backgroundColor: '#0B0F14', borderRadius: 8, paddingHorizontal: 12, color: '#F9FAFB', borderWidth: 1, borderColor: '#374151', marginBottom: 16 }}
              placeholder="Workout Name (e.g. Push Day)"
              placeholderTextColor="#6B7280"
              value={newPlanName}
              onChangeText={setNewPlanName}
              autoFocus
            />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity 
                onPress={() => setShowCreateModal(false)}
                style={{ flex: 1, height: 40, borderRadius: 8, backgroundColor: '#1F2937', alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ color: '#F9FAFB' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleCreatePlan}
                style={{ flex: 1, height: 40, borderRadius: 8, backgroundColor: '#0EA5A4', alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ color: '#0B0F14', fontWeight: '600' }}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

