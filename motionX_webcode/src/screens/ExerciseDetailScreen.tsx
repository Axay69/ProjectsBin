import { Exercise } from '@/types/fitness';
import { ArrowLeft, Play, Target, Repeat, Layers } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const difficultyColors = {
  beginner: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  intermediate: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  advanced: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
};

interface ExerciseDetailScreenProps {
  exercise: Exercise;
  onBack: () => void;
}

export function ExerciseDetailScreen({ exercise, onBack }: ExerciseDetailScreenProps) {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Video player placeholder */}
      <div className="relative w-full aspect-video bg-card">
        <div className="absolute inset-0 flex items-center justify-center">
          <button className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center card-press group">
            <Play className="w-8 h-8 text-primary ml-1 group-hover:scale-110 transition-transform" />
          </button>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        
        {/* Back button */}
        <button
          onClick={onBack}
          className="absolute top-12 left-4 p-2 rounded-full bg-background/50 backdrop-blur-sm card-press"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 -mt-8 relative z-10 animate-fade-in-up">
        <div className="flex items-center gap-2 mb-2">
          <Badge 
            variant="outline" 
            className={cn('text-xs px-3 py-1 border', difficultyColors[exercise.difficulty])}
          >
            {exercise.difficulty}
          </Badge>
          <Badge variant="outline" className="text-xs px-3 py-1 text-muted-foreground">
            {exercise.equipment}
          </Badge>
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">{exercise.name}</h1>
        <p className="text-muted-foreground mb-6">Target: {exercise.targetMuscle}</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="p-4 rounded-xl bg-card border border-border text-center">
            <Layers className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="text-lg font-bold text-foreground">{exercise.sets}</p>
            <p className="text-xs text-muted-foreground">Sets</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border text-center">
            <Repeat className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="text-lg font-bold text-foreground">{exercise.reps}</p>
            <p className="text-xs text-muted-foreground">Reps</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border text-center">
            <Target className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="text-lg font-bold text-foreground truncate">{exercise.targetMuscle.split('/')[0]}</p>
            <p className="text-xs text-muted-foreground">Focus</p>
          </div>
        </div>

        {/* Instructions */}
        <h2 className="text-lg font-bold text-foreground mb-4">Instructions</h2>
        <div className="space-y-3">
          {exercise.instructions.map((instruction, index) => (
            <div
              key={index}
              className="flex gap-4 p-4 rounded-xl bg-card border border-border animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-primary">{index + 1}</span>
              </div>
              <p className="text-foreground text-sm leading-relaxed">{instruction}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
