import { View, Text, ScrollView } from 'react-native';
import { useApp } from '../context/AppContext';

const stats = [
  { label: 'Workouts', value: '24', change: '+3 this week' },
  { label: 'Calories', value: '8,420', change: '+1,200 this week' },
  { label: "PR's", value: '12', change: '+2 this month' },
  { label: 'Streak', value: '7', change: 'days' },
];

const weeklyActivity = [
  { day: 'Mon', active: true, intensity: 80 },
  { day: 'Tue', active: true, intensity: 60 },
  { day: 'Wed', active: false, intensity: 0 },
  { day: 'Thu', active: true, intensity: 90 },
  { day: 'Fri', active: true, intensity: 70 },
  { day: 'Sat', active: true, intensity: 85 },
  { day: 'Sun', active: false, intensity: 0 },
];

export default function ProgressScreen() {
  const { userProfile } = useApp();

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0F14' }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
        <View style={{ paddingTop: 48 }}>
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#F9FAFB', marginBottom: 6 }}>Progress</Text>
          <Text style={{ color: '#9CA3AF' }}>Track your fitness journey</Text>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 16 }}>
          {stats.map((stat, index) => (
            <View key={stat.label} style={{ width: '48%', padding: 12, borderRadius: 12, backgroundColor: '#111827', borderWidth: 1, borderColor: '#1F2937' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ color: '#0EA5A4' }}>{stat.label}</Text>
                <Text style={{ color: '#9CA3AF', fontSize: 12 }}>{stat.change}</Text>
              </View>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#F9FAFB' }}>{stat.value}</Text>
            </View>
          ))}
        </View>

        <View style={{ padding: 12, borderRadius: 12, backgroundColor: '#111827', borderWidth: 1, borderColor: '#1F2937', marginTop: 16 }}>
          <Text style={{ color: '#F9FAFB', fontWeight: '600', marginBottom: 12 }}>This Week</Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
            {weeklyActivity.map(day => (
              <View key={day.day} style={{ alignItems: 'center', gap: 6 }}>
                <View style={{ width: 28, height: 80, borderRadius: 6, backgroundColor: '#1F2937', overflow: 'hidden' }}>
                  <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${day.intensity}%`, backgroundColor: day.active ? '#0EA5A4' : '#1F2937' }} />
                </View>
                <Text style={{ color: day.active ? '#F9FAFB' : '#9CA3AF', fontSize: 12 }}>{day.day}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ padding: 12, borderRadius: 12, backgroundColor: '#111827', borderWidth: 1, borderColor: '#1F2937', marginTop: 16 }}>
          <Text style={{ color: '#F9FAFB', fontWeight: '600', marginBottom: 12 }}>Body Stats</Text>
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#9CA3AF' }}>Weight</Text>
              <Text style={{ color: '#F9FAFB', fontWeight: '600' }}>{userProfile.weight || '--'} kg</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#9CA3AF' }}>Height</Text>
              <Text style={{ color: '#F9FAFB', fontWeight: '600' }}>{userProfile.height || '--'} cm</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#9CA3AF' }}>Age</Text>
              <Text style={{ color: '#F9FAFB', fontWeight: '600' }}>{userProfile.age || '--'} years</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

