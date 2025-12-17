import { useState, useEffect } from 'react';
import { AppProvider, useApp } from '@/contexts/AppContext';
import { SplashScreen } from '@/screens/SplashScreen';
import { OnboardingScreen } from '@/screens/OnboardingScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { TrainScreen } from '@/screens/TrainScreen';
import { ProgressScreen } from '@/screens/ProgressScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { BottomNav } from '@/components/BottomNav';

function AppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const { hasCompletedOnboarding, activeTab } = useApp();

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (!hasCompletedOnboarding) {
    return <OnboardingScreen />;
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'train':
        return <TrainScreen />;
      case 'progress':
        return <ProgressScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderScreen()}
      <BottomNav />
    </div>
  );
}

const Index = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default Index;
