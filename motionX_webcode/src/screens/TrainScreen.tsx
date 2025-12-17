import { Dumbbell, Clock, Flame, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

const workouts = [
  { id: 1, name: 'Push Day', duration: '45 min', calories: 320, exercises: 6 },
  { id: 2, name: 'Pull Day', duration: '50 min', calories: 340, exercises: 7 },
  { id: 3, name: 'Leg Day', duration: '55 min', calories: 400, exercises: 8 },
  { id: 4, name: 'Full Body', duration: '60 min', calories: 450, exercises: 10 },
];

export function TrainScreen() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="p-4 pt-12">
        <h1 className="text-2xl font-bold text-foreground mb-1">Training</h1>
        <p className="text-sm text-muted-foreground">Start a workout session</p>
      </header>

      <main className="px-4">
        {/* Quick Start */}
        <div className="p-6 rounded-2xl bg-card border border-border mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">Quick Start</h2>
              <p className="text-sm text-muted-foreground">Begin an empty workout</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Play className="w-6 h-6 text-primary" />
            </div>
          </div>
          <Button size="full" variant="glow">
            Start Empty Workout
          </Button>
        </div>

        {/* Suggested Workouts */}
        <h2 className="text-lg font-bold text-foreground mb-4">Suggested Workouts</h2>
        <div className="space-y-3">
          {workouts.map((workout, index) => (
            <button
              key={workout.id}
              className="flex items-center gap-4 w-full p-4 rounded-xl bg-card border border-border hover:border-primary/40 transition-all duration-200 card-press group text-left animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <Dumbbell className="w-6 h-6 text-primary" />
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{workout.name}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {workout.duration}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Flame className="w-3 h-3" />
                    {workout.calories} kcal
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {workout.exercises} exercises
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
