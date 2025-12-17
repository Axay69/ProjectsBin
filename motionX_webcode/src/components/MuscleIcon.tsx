import { 
  Heart, 
  Footprints, 
  Zap,
  Target,
  Shield,
  CircleDot,
  Hexagon,
  Activity,
  Flame
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MuscleIconProps {
  type: string;
  className?: string;
}

const iconMap: Record<string, typeof Heart> = {
  chest: Shield,
  back: Hexagon,
  shoulders: Target,
  biceps: Zap,
  triceps: CircleDot,
  forearms: Activity,
  legs: Footprints,
  core: Heart,
  cardio: Flame,
};

export function MuscleIcon({ type, className }: MuscleIconProps) {
  const Icon = iconMap[type] || Target;
  
  return (
    <Icon className={cn('w-6 h-6', className)} strokeWidth={1.5} />
  );
}
