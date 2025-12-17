import { useState } from 'react';
import { muscleGroups } from '@/data/muscleGroups';
import { MuscleCard } from '@/components/MuscleCard';
import { MuscleGroup, SubMuscleGroup, Exercise } from '@/types/fitness';
import { SubGroupCard } from '@/components/SubGroupCard';
import { ExerciseCard } from '@/components/ExerciseCard';
import { ExerciseDetailScreen } from './ExerciseDetailScreen';
import { ArrowLeft, Zap } from 'lucide-react';

type ViewState = 
  | { type: 'grid' }
  | { type: 'subgroups'; muscle: MuscleGroup }
  | { type: 'exercises'; muscle: MuscleGroup; subGroup: SubMuscleGroup }
  | { type: 'detail'; exercise: Exercise };

export function HomeScreen() {
  const [view, setView] = useState<ViewState>({ type: 'grid' });

  const handleBack = () => {
    if (view.type === 'detail') {
      // Find the muscle and subgroup for this exercise
      for (const muscle of muscleGroups) {
        for (const subGroup of muscle.subGroups || []) {
          if (subGroup.exercises.some(e => e.id === (view as { exercise: Exercise }).exercise.id)) {
            setView({ type: 'exercises', muscle, subGroup });
            return;
          }
        }
      }
      setView({ type: 'grid' });
    } else if (view.type === 'exercises') {
      setView({ type: 'subgroups', muscle: view.muscle });
    } else if (view.type === 'subgroups') {
      setView({ type: 'grid' });
    }
  };

  const renderHeader = () => {
    if (view.type === 'grid') {
      return (
        <header className="p-4 pt-12">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Motion<span className="text-primary">X</span></h1>
              <p className="text-xs text-muted-foreground">Select a muscle group</p>
            </div>
          </div>
        </header>
      );
    }

    let title = '';
    let subtitle = '';
    
    if (view.type === 'subgroups') {
      title = view.muscle.name;
      subtitle = `${view.muscle.subGroups?.length} areas`;
    } else if (view.type === 'exercises') {
      title = view.subGroup.name;
      subtitle = `${view.subGroup.exercises.length} exercises`;
    }

    return (
      <header className="p-4 pt-12">
        <button 
          onClick={handleBack}
          className="flex items-center gap-2 text-muted-foreground mb-4 card-press"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Back</span>
        </button>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </header>
    );
  };

  if (view.type === 'detail') {
    return <ExerciseDetailScreen exercise={view.exercise} onBack={handleBack} />;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {renderHeader()}

      <main className="px-4">
        {view.type === 'grid' && (
          <div className="grid grid-cols-2 gap-3">
            {muscleGroups.map((muscle, index) => (
              <MuscleCard
                key={muscle.id}
                muscle={muscle}
                index={index}
                onClick={() => {
                  if (muscle.subGroups?.length === 1) {
                    setView({ type: 'exercises', muscle, subGroup: muscle.subGroups[0] });
                  } else {
                    setView({ type: 'subgroups', muscle });
                  }
                }}
              />
            ))}
          </div>
        )}

        {view.type === 'subgroups' && (
          <div className="space-y-3">
            {view.muscle.subGroups?.map((subGroup, index) => (
              <SubGroupCard
                key={subGroup.id}
                subGroup={subGroup}
                index={index}
                onClick={() => setView({ type: 'exercises', muscle: view.muscle, subGroup })}
              />
            ))}
          </div>
        )}

        {view.type === 'exercises' && (
          <div className="space-y-3">
            {view.subGroup.exercises.map((exercise, index) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                index={index}
                onClick={() => setView({ type: 'detail', exercise })}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
