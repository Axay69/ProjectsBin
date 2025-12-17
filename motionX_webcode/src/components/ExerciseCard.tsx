import { Exercise } from '@/types/fitness';
import { cn } from '@/lib/utils';
import { ChevronRight, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ExerciseCardProps {
  exercise: Exercise;
  onClick: () => void;
  index: number;
}

const difficultyColors = {
  beginner: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  intermediate: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  advanced: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
};

export function ExerciseCard({ exercise, onClick, index }: ExerciseCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-4 w-full p-4 rounded-xl',
        'bg-card border border-border hover:border-primary/40',
        'transition-all duration-200 card-press',
        'group text-left animate-fade-in-up'
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Thumbnail placeholder */}
      <div className="relative w-16 h-16 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
        <Play className="w-6 h-6 text-primary" />
        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground truncate mb-1">
          {exercise.name}
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge 
            variant="outline" 
            className={cn('text-[10px] px-2 py-0 border', difficultyColors[exercise.difficulty])}
          >
            {exercise.difficulty}
          </Badge>
          <Badge variant="outline" className="text-[10px] px-2 py-0 text-muted-foreground">
            {exercise.equipment}
          </Badge>
        </div>
      </div>
      
      <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200" />
    </button>
  );
}
