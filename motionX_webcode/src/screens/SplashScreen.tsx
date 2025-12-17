import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className={`w-64 h-64 rounded-full bg-primary/10 blur-3xl transition-all duration-1000 ${isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} />
      </div>
      
      {/* Logo */}
      <div className={`flex flex-col items-center gap-4 transition-all duration-700 ${isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-card border border-border flex items-center justify-center">
            <Zap className="w-10 h-10 text-primary" strokeWidth={2} />
          </div>
          {/* Glow effect */}
          <div className={`absolute inset-0 rounded-2xl bg-primary/30 blur-xl transition-opacity duration-1000 ${isAnimating ? 'opacity-100 animate-pulse-glow' : 'opacity-0'}`} />
        </div>
        
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Motion<span className="text-primary">X</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Train. Track. Transform.</p>
        </div>
      </div>
    </div>
  );
}
