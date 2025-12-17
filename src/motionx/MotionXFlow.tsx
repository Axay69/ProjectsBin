import { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppProvider, useApp } from './context/AppContext';
import SplashScreen from './screens/SplashScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import HomeScreen from './screens/HomeScreen';
import TrainScreen from './screens/TrainScreen';
import SearchScreen from './screens/SearchScreen';
// Removed Profile tab; integrating MuscleWiki in last tab
import MuscleWikiScreen from './screens/MuscleWikiScreen';
import BodyMapScreen from './screens/BodyMapScreen';
import ExerciseDetailScreen from './screens/ExerciseDetailScreen';
import MuscleWikiDetailScreen from './screens/MuscleWikiDetailScreen';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import ExercisesScreen from './screens/ExercisesScreen';
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MotionXTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const iconName = (
            {
              Home: focused ? 'home' : 'home-outline',
              Train: focused ? 'dumbbell' : 'dumbbell',
              Search: focused ? 'magnify' : 'magnify',
              Wiki: focused ? 'book-open-page-variant' : 'book-open-outline',
              Body: focused ? 'human-male' : 'human-male',
            } as Record<string, string>
          )[route.name] || 'home';
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0EA5A4',
        tabBarInactiveTintColor: '#9CA3AF',
        headerShown: false,
        tabBarStyle: {
          height: 70,
          backgroundColor: '#000000',
          borderTopWidth: 0,
        },
        tabBarLabelStyle: { fontSize: 12, marginBottom: 6 },
        tabBarItemStyle: { paddingVertical: 6 },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Train" component={TrainScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Wiki" component={MuscleWikiScreen} />
      <Tab.Screen name="Body" component={BodyMapScreen} />
    </Tab.Navigator>
  );
}

import ExerciseSelectorScreen from './screens/ExerciseSelectorScreen';
import WorkoutSessionScreen from './screens/WorkoutSessionScreen';

import WorkoutPlanScreen from './screens/WorkoutPlanScreen';

function MotionXContent() {
  const [showSplash, setShowSplash] = useState(true);
  const { hasCompletedOnboarding } = useApp();


  useEffect(() =>{
    // SystemNavigationBar.fullScreen(true);    
    // SystemNavigationBar.fullScreen(true);    
    SystemNavigationBar.setNavigationColor('#000');
    // SystemNavigationBar.setNavigationBarDividerColor('yellow');
  },[])

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (!hasCompletedOnboarding) {
    return <OnboardingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Tabs" component={MotionXTabs} />
      <Stack.Screen name="Exercises" component={ExercisesScreen} />
      <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} />
      <Stack.Screen name="WorkoutSession" component={WorkoutSessionScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="WorkoutPlan" component={WorkoutPlanScreen} />
      <Stack.Screen name="ExerciseSelector" component={ExerciseSelectorScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="MuscleWikiDetail" component={MuscleWikiDetailScreen} />
    </Stack.Navigator>
  );
}

import Toast from 'react-native-toast-message';
import { toastConfig } from './lib/toast';

export default function MotionXFlow() {
  return (
    <AppProvider>
      <MotionXContent />
      <Toast config={toastConfig} />
    </AppProvider>
  );
}
