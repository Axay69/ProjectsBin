import { SubMuscleGroup } from '@/types/fitness';
import { cn } from '@/lib/utils';
import { ChevronRight, Dumbbell } from 'lucide-react';

interface SubGroupCardProps {
  subGroup: SubMuscleGroup;
  onClick: () => void;
  index: number;
}

export function SubGroupCard({ subGroup, onClick, index }: SubGroupCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center justify-between w-full p-4 rounded-xl',
        'bg-card border border-border hover:border-primary/40',
        'transition-all duration-200 card-press',
        'group animate-fade-in-up'
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-200">
          <Dumbbell className="w-5 h-5 text-primary" strokeWidth={1.5} />
        </div>
        <div className="text-left">
          <h3 className="font-semibold text-foreground">{subGroup.name}</h3>
          <p className="text-sm text-muted-foreground">
            {subGroup.exercises.length} exercises
          </p>
        </div>
      </div>
      
      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200" />
    </button>
  );
}
