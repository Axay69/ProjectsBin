import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface SelectableCardProps {
  label: string;
  description?: string;
  isSelected: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}

export function SelectableCard({ label, description, isSelected, onClick, icon }: SelectableCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex items-center gap-4 w-full p-4 rounded-xl',
        'border transition-all duration-200 card-press text-left',
        isSelected 
          ? 'bg-primary/10 border-primary' 
          : 'bg-card border-border hover:border-primary/40'
      )}
    >
      {icon && (
        <div className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
          isSelected ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
        )}>
          {icon}
        </div>
      )}
      
      <div className="flex-1">
        <h3 className={cn(
          'font-semibold',
          isSelected ? 'text-primary' : 'text-foreground'
        )}>
          {label}
        </h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      
      <div className={cn(
        'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200',
        isSelected 
          ? 'bg-primary border-primary' 
          : 'border-muted-foreground/30'
      )}>
        {isSelected && <Check className="w-3 h-3 text-background" strokeWidth={3} />}
      </div>
    </button>
  );
}
