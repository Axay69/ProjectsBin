import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';

const goalLabels: Record<string, string> = {
  muscle: 'Build Muscle',
  strength: 'Build Strength',
  'fat-loss': 'Fat Loss',
  endurance: 'Endurance',
};

const trainingLabels: Record<string, string> = {
  gym: 'Gym Training',
  home: 'Home Training',
  calisthenics: 'Calisthenics',
};

const experienceLabels: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

const menuItems = [
  { label: 'Settings' },
  { label: 'Notifications' },
  { label: 'Help & Support' },
];

export default function ProfileScreen() {
  const { userProfile, setHasCompletedOnboarding } = useApp();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0B0F14' }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
        <View style={{ paddingTop: 48 }}>
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#F9FAFB', marginBottom: 6 }}>Profile</Text>
          <Text style={{ color: '#9CA3AF' }}>Manage your account</Text>
        </View>

        <View style={{ padding: 16, borderRadius: 16, backgroundColor: '#111827', borderWidth: 1, borderColor: '#1F2937', marginTop: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#1F2937', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#9CA3AF', fontSize: 24 }}>👤</Text>
            </View>
            <View>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#F9FAFB' }}>Athlete</Text>
              <Text style={{ color: '#9CA3AF' }}>{experienceLabels[userProfile.experience as string] || 'Not set'}</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#F9FAFB' }}>{userProfile.age || '--'}</Text>
              <Text style={{ color: '#9CA3AF', fontSize: 12 }}>Age</Text>
            </View>
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#F9FAFB' }}>{userProfile.height || '--'}</Text>
              <Text style={{ color: '#9CA3AF', fontSize: 12 }}>Height (cm)</Text>
            </View>
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#F9FAFB' }}>{userProfile.weight || '--'}</Text>
              <Text style={{ color: '#9CA3AF', fontSize: 12 }}>Weight (kg)</Text>
            </View>
          </View>
        </View>

        <View style={{ gap: 12, marginTop: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, backgroundColor: '#111827', borderWidth: 1, borderColor: '#1F2937' }}>
            <Text style={{ color: '#9CA3AF' }}>Goal</Text>
            <Text style={{ color: '#F9FAFB', fontWeight: '600', marginLeft: 'auto' }}>{goalLabels[userProfile.goal as string] || 'Not set'}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, backgroundColor: '#111827', borderWidth: 1, borderColor: '#1F2937' }}>
            <Text style={{ color: '#9CA3AF' }}>Training Type</Text>
            <Text style={{ color: '#F9FAFB', fontWeight: '600', marginLeft: 'auto' }}>{trainingLabels[userProfile.trainingType as string] || 'Not set'}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, backgroundColor: '#111827', borderWidth: 1, borderColor: '#1F2937' }}>
            <Text style={{ color: '#9CA3AF' }}>Experience</Text>
            <Text style={{ color: '#F9FAFB', fontWeight: '600', marginLeft: 'auto' }}>{experienceLabels[userProfile.experience as string] || 'Not set'}</Text>
          </View>
        </View>

        <View style={{ gap: 8, marginTop: 16 }}>
          {menuItems.map(item => (
            <TouchableOpacity key={item.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, backgroundColor: '#111827', borderWidth: 1, borderColor: '#1F2937' }}>
              <Text style={{ color: '#F9FAFB', fontWeight: '500' }}>{item.label}</Text>
              <Text style={{ color: '#9CA3AF', marginLeft: 'auto' }}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          onPress={() => setHasCompletedOnboarding(false)}
          style={{ height: 48, borderRadius: 12, borderWidth: 1, borderColor: '#1F2937', alignItems: 'center', justifyContent: 'center', marginTop: 16 }}
        >
          <Text style={{ color: '#9CA3AF' }}>Reset Onboarding</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
