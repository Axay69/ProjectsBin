import { useApp } from '@/contexts/AppContext';
import { User, Target, Dumbbell, Activity, ChevronRight, Settings, Bell, HelpCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const goalLabels = {
  muscle: 'Build Muscle',
  strength: 'Build Strength',
  'fat-loss': 'Fat Loss',
  endurance: 'Endurance',
};

const trainingLabels = {
  gym: 'Gym Training',
  home: 'Home Training',
  calisthenics: 'Calisthenics',
};

const experienceLabels = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

const menuItems = [
  { icon: Settings, label: 'Settings' },
  { icon: Bell, label: 'Notifications' },
  { icon: HelpCircle, label: 'Help & Support' },
];

export function ProfileScreen() {
  const { userProfile, setHasCompletedOnboarding } = useApp();

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="p-4 pt-12">
        <h1 className="text-2xl font-bold text-foreground mb-1">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your account</p>
      </header>

      <main className="px-4">
        {/* Profile Card */}
        <div className="p-6 rounded-2xl bg-card border border-border mb-6 animate-fade-in">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <User className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Athlete</h2>
              <p className="text-sm text-muted-foreground">
                {experienceLabels[userProfile.experience!] || 'Not set'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xl font-bold text-foreground">{userProfile.age || '--'}</p>
              <p className="text-xs text-muted-foreground">Age</p>
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{userProfile.height || '--'}</p>
              <p className="text-xs text-muted-foreground">Height (cm)</p>
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{userProfile.weight || '--'}</p>
              <p className="text-xs text-muted-foreground">Weight (kg)</p>
            </div>
          </div>
        </div>

        {/* Goals & Training */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border animate-fade-in-up">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Goal</p>
              <p className="font-semibold text-foreground">
                {goalLabels[userProfile.goal!] || 'Not set'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border animate-fade-in-up" style={{ animationDelay: '50ms' }}>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Training Type</p>
              <p className="font-semibold text-foreground">
                {trainingLabels[userProfile.trainingType!] || 'Not set'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Experience</p>
              <p className="font-semibold text-foreground">
                {experienceLabels[userProfile.experience!] || 'Not set'}
              </p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="space-y-2 mb-6">
          {menuItems.map((item, index) => (
            <button
              key={item.label}
              className="flex items-center gap-4 w-full p-4 rounded-xl bg-card border border-border hover:border-primary/40 transition-all duration-200 card-press animate-fade-in-up"
              style={{ animationDelay: `${(index + 3) * 50}ms` }}
            >
              <item.icon className="w-5 h-5 text-muted-foreground" />
              <span className="flex-1 text-left font-medium text-foreground">{item.label}</span>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </div>

        {/* Reset Onboarding (for demo) */}
        <Button
          variant="outline"
          size="full"
          onClick={() => setHasCompletedOnboarding(false)}
          className="text-muted-foreground"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Reset Onboarding
        </Button>
      </main>
    </div>
  );
}
