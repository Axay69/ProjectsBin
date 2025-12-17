import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';

const experienceLevels = [
  { id: 'beginner', label: 'Beginner', description: 'New to training' },
  { id: 'intermediate', label: 'Intermediate', description: '1-3 years experience' },
  { id: 'advanced', label: 'Advanced', description: '3+ years experience' },
] as const;

const goals = [
  { id: 'muscle', label: 'Build Muscle', description: 'Increase size and definition' },
  { id: 'strength', label: 'Build Strength', description: 'Lift heavier weights' },
  { id: 'fat-loss', label: 'Fat Loss', description: 'Lean out and burn fat' },
  { id: 'endurance', label: 'Endurance', description: 'Improve stamina' },
] as const;

const trainingTypes = [
  { id: 'gym', label: 'Gym', description: 'Full equipment access' },
  { id: 'home', label: 'Home', description: 'Minimal equipment' },
  { id: 'calisthenics', label: 'Calisthenics', description: 'Bodyweight training' },
] as const;

export default function OnboardingScreen() {
  const { userProfile, setUserProfile, setHasCompletedOnboarding } = useApp();
  const [step, setStep] = useState(1);
  const totalSteps = 6;

  const [localAge, setLocalAge] = useState('');
  const [localHeight, setLocalHeight] = useState('');
  const [localWeight, setLocalWeight] = useState('');

  const canProceed = () => {
    switch (step) {
      case 1:
        return localAge !== '' && parseInt(localAge) > 0;
      case 2:
        return localHeight !== '' && parseInt(localHeight) > 0;
      case 3:
        return localWeight !== '' && parseInt(localWeight) > 0;
      case 4:
        return userProfile.experience !== null;
      case 5:
        return userProfile.goal !== null;
      case 6:
        return userProfile.trainingType !== null;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step === 1) setUserProfile(p => ({ ...p, age: parseInt(localAge) }));
    if (step === 2) setUserProfile(p => ({ ...p, height: parseInt(localHeight) }));
    if (step === 3) setUserProfile(p => ({ ...p, weight: parseInt(localWeight) }));

    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      setHasCompletedOnboarding(true);
    }
  };

  const card = (
    item: { id: any; label: string; description: string },
    selected: boolean,
    onPress: () => void,
  ) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: selected ? '#0EA5A4' : '#1F2937',
        backgroundColor: '#111827',
        marginBottom: 12,
      }}
    >
      <Text style={{ color: '#F9FAFB', fontWeight: '600' }}>{item.label}</Text>
      <Text style={{ color: '#9CA3AF', marginTop: 4, fontSize: 12 }}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0B0F14' }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 120 }}>
        {step === 1 && (
          <View>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#F9FAFB', marginBottom: 8 }}>How old are you?</Text>
            <Text style={{ color: '#9CA3AF', marginBottom: 16 }}>This helps us personalize your training</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <TextInput
                keyboardType="numeric"
                placeholder="25"
                placeholderTextColor="#6B7280"
                value={localAge}
                onChangeText={setLocalAge}
                returnKeyType="next"
                style={{
                  flex: 0,
                  width: 120,
                  textAlign: 'center',
                  fontSize: 32,
                  fontWeight: 'bold',
                  color: '#F9FAFB',
                  backgroundColor: '#111827',
                  borderWidth: 1,
                  borderColor: '#1F2937',
                  borderRadius: 12,
                  height: 64,
                }}
              />
              <Text style={{ color: '#9CA3AF', fontSize: 16 }}>years</Text>
            </View>
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#F9FAFB', marginBottom: 8 }}>What's your height?</Text>
            <Text style={{ color: '#9CA3AF', marginBottom: 16 }}>We'll use this to track your progress</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <TextInput
                keyboardType="numeric"
                placeholder="175"
                placeholderTextColor="#6B7280"
                value={localHeight}
                onChangeText={setLocalHeight}
                returnKeyType="next"
                style={{
                  width: 120,
                  textAlign: 'center',
                  fontSize: 32,
                  fontWeight: 'bold',
                  color: '#F9FAFB',
                  backgroundColor: '#111827',
                  borderWidth: 1,
                  borderColor: '#1F2937',
                  borderRadius: 12,
                  height: 64,
                }}
              />
              <Text style={{ color: '#9CA3AF', fontSize: 16 }}>cm</Text>
            </View>
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#F9FAFB', marginBottom: 8 }}>What's your weight?</Text>
            <Text style={{ color: '#9CA3AF', marginBottom: 16 }}>Track changes over time</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <TextInput
                keyboardType="numeric"
                placeholder="70"
                placeholderTextColor="#6B7280"
                value={localWeight}
                onChangeText={setLocalWeight}
                returnKeyType="next"
                style={{
                  width: 120,
                  textAlign: 'center',
                  fontSize: 32,
                  fontWeight: 'bold',
                  color: '#F9FAFB',
                  backgroundColor: '#111827',
                  borderWidth: 1,
                  borderColor: '#1F2937',
                  borderRadius: 12,
                  height: 64,
                }}
              />
              <Text style={{ color: '#9CA3AF', fontSize: 16 }}>kg</Text>
            </View>
          </View>
        )}

        {step === 4 && (
          <View>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#F9FAFB', marginBottom: 8 }}>Your experience level</Text>
            <Text style={{ color: '#9CA3AF', marginBottom: 16 }}>We'll tailor exercises accordingly</Text>
            {experienceLevels.map(level =>
              card(level, userProfile.experience === level.id, () =>
                setUserProfile(p => ({ ...p, experience: level.id })),
              ),
            )}
          </View>
        )}

        {step === 5 && (
          <View>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#F9FAFB', marginBottom: 8 }}>What's your goal?</Text>
            <Text style={{ color: '#9CA3AF', marginBottom: 16 }}>Focus your training</Text>
            {goals.map(goal =>
              card(goal, userProfile.goal === goal.id, () =>
                setUserProfile(p => ({ ...p, goal: goal.id })),
              ),
            )}
          </View>
        )}

        {step === 6 && (
          <View>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#F9FAFB', marginBottom: 8 }}>Where do you train?</Text>
            <Text style={{ color: '#9CA3AF', marginBottom: 16 }}>We'll customize your exercises</Text>
            {trainingTypes.map(type =>
              card(type, userProfile.trainingType === type.id, () =>
                setUserProfile(p => ({ ...p, trainingType: type.id })),
              ),
            )}
          </View>
        )}
      </ScrollView>

      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, backgroundColor: '#0B0F14' }}>
        <TouchableOpacity
          onPress={handleNext}
          disabled={!canProceed()}
          style={{
            opacity: canProceed() ? 1 : 0.5,
            height: 52,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0EA5A4',
          }}
        >
          <Text style={{ color: '#0B0F14', fontWeight: '700' }}>{step === totalSteps ? 'Get Started' : 'Continue'}</Text>
        </TouchableOpacity>
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
