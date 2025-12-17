import { Home, Dumbbell, TrendingUp, User } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { TabId } from '@/types/fitness';
import { cn } from '@/lib/utils';

const tabs: { id: TabId; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'train', label: 'Train', icon: Dumbbell },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
  { id: 'profile', label: 'Profile', icon: User },
];

export function BottomNav() {
  const { activeTab, setActiveTab } = useApp();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 card-press',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <tab.icon
                className={cn(
                  'w-5 h-5 mb-1 transition-all duration-200',
                  isActive && 'drop-shadow-[0_0_8px_hsl(var(--primary))]'
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={cn(
                'text-[10px] font-medium transition-all duration-200',
                isActive && 'text-primary'
              )}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
