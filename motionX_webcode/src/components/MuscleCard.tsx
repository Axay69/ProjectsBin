import { MuscleGroup } from '@/types/fitness';
import { MuscleIcon } from './MuscleIcon';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

interface MuscleCardProps {
  muscle: MuscleGroup;
  onClick: () => void;
  index: number;
}

export function MuscleCard({ muscle, onClick, index }: MuscleCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex flex-col items-center justify-center p-4 rounded-2xl',
        'bg-card border border-border hover:border-primary/40',
        'transition-all duration-200 card-press',
        'group overflow-hidden animate-fade-in-up'
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Subtle accent line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative mb-3">
        <MuscleIcon type={muscle.icon} className="w-8 h-8 text-primary" />
        <div className="absolute inset-0 blur-xl bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <span className="text-sm font-semibold text-foreground mb-1">{muscle.name}</span>
      <span className="text-xs text-muted-foreground">
        {muscle.subGroups?.length} areas
      </span>
      
      <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
    </button>
  );
}
