import { useApp } from '@/contexts/AppContext';
import { TrendingUp, Flame, Calendar, Trophy } from 'lucide-react';

const stats = [
  { label: 'Workouts', value: '24', icon: Calendar, change: '+3 this week' },
  { label: 'Calories', value: '8,420', icon: Flame, change: '+1,200 this week' },
  { label: 'PR\'s', value: '12', icon: Trophy, change: '+2 this month' },
  { label: 'Streak', value: '7', icon: TrendingUp, change: 'days' },
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

export function ProgressScreen() {
  const { userProfile } = useApp();

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="p-4 pt-12">
        <h1 className="text-2xl font-bold text-foreground mb-1">Progress</h1>
        <p className="text-sm text-muted-foreground">Track your fitness journey</p>
      </header>

      <main className="px-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="p-4 rounded-xl bg-card border border-border animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <stat.icon className="w-5 h-5 text-primary" />
                <span className="text-xs text-muted-foreground">{stat.change}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Weekly Activity */}
        <div className="p-4 rounded-xl bg-card border border-border mb-6 animate-fade-in">
          <h2 className="font-semibold text-foreground mb-4">This Week</h2>
          <div className="flex justify-between items-end gap-2">
            {weeklyActivity.map((day) => (
              <div key={day.day} className="flex flex-col items-center gap-2 flex-1">
                <div className="w-full h-20 rounded-lg bg-muted relative overflow-hidden">
                  <div
                    className={`absolute bottom-0 left-0 right-0 rounded-lg transition-all duration-500 ${
                      day.active ? 'bg-primary' : 'bg-muted'
                    }`}
                    style={{ height: `${day.intensity}%` }}
                  />
                </div>
                <span className={`text-xs ${day.active ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {day.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Body Stats */}
        <div className="p-4 rounded-xl bg-card border border-border animate-fade-in">
          <h2 className="font-semibold text-foreground mb-4">Body Stats</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Weight</span>
              <span className="font-semibold text-foreground">{userProfile.weight || '--'} kg</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Height</span>
              <span className="font-semibold text-foreground">{userProfile.height || '--'} cm</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Age</span>
              <span className="font-semibold text-foreground">{userProfile.age || '--'} years</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
