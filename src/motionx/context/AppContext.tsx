import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { UserProfile, TabId } from '../types';
import { mmkv } from '../lib/mmkv';

interface AppContextType {
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (value: boolean) => void;
}

const defaultProfile: UserProfile = {
  age: null,
  height: null,
  weight: null,
  experience: null,
  goal: null,
  trainingType: null,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultProfile);
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [hasCompletedOnboarding, _setHasCompletedOnboarding] = useState<boolean>(false);

  useEffect(() => {
    const persisted = mmkv.getBoolean('motionx_onboarding_done');
    _setHasCompletedOnboarding(!!persisted);
  }, []);

  const setHasCompletedOnboarding = (value: boolean) => {
    _setHasCompletedOnboarding(value);
    mmkv.set('motionx_onboarding_done', value);
  };

  return (
    <AppContext.Provider
      value={{
        userProfile,
        setUserProfile,
        activeTab,
        setActiveTab,
        hasCompletedOnboarding,
        setHasCompletedOnboarding,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
