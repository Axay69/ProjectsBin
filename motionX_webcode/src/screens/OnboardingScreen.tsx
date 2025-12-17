import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { ProgressIndicator } from '@/components/ProgressIndicator';
import { SelectableCard } from '@/components/SelectableCard';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ArrowRight, Target, Dumbbell, Home, Activity, Flame, Zap, TrendingUp, Scale } from 'lucide-react';
import { cn } from '@/lib/utils';

const experienceLevels = [
  { id: 'beginner', label: 'Beginner', description: 'New to training', icon: <Activity className="w-5 h-5" /> },
  { id: 'intermediate', label: 'Intermediate', description: '1-3 years experience', icon: <TrendingUp className="w-5 h-5" /> },
  { id: 'advanced', label: 'Advanced', description: '3+ years experience', icon: <Zap className="w-5 h-5" /> },
] as const;

const goals = [
  { id: 'muscle', label: 'Build Muscle', description: 'Increase size and definition', icon: <Dumbbell className="w-5 h-5" /> },
  { id: 'strength', label: 'Build Strength', description: 'Lift heavier weights', icon: <Target className="w-5 h-5" /> },
  { id: 'fat-loss', label: 'Fat Loss', description: 'Lean out and burn fat', icon: <Flame className="w-5 h-5" /> },
  { id: 'endurance', label: 'Endurance', description: 'Improve stamina', icon: <Activity className="w-5 h-5" /> },
] as const;

const trainingTypes = [
  { id: 'gym', label: 'Gym', description: 'Full equipment access', icon: <Dumbbell className="w-5 h-5" /> },
  { id: 'home', label: 'Home', description: 'Minimal equipment', icon: <Home className="w-5 h-5" /> },
  { id: 'calisthenics', label: 'Calisthenics', description: 'Bodyweight training', icon: <Activity className="w-5 h-5" /> },
] as const;

export function OnboardingScreen() {
  const { userProfile, setUserProfile, setHasCompletedOnboarding } = useApp();
  const [step, setStep] = useState(1);
  const totalSteps = 6;

  const [localAge, setLocalAge] = useState('');
  const [localHeight, setLocalHeight] = useState('');
  const [localWeight, setLocalWeight] = useState('');

  const canProceed = () => {
    switch (step) {
      case 1: return localAge !== '' && parseInt(localAge) > 0;
      case 2: return localHeight !== '' && parseInt(localHeight) > 0;
      case 3: return localWeight !== '' && parseInt(localWeight) > 0;
      case 4: return userProfile.experience !== null;
      case 5: return userProfile.goal !== null;
      case 6: return userProfile.trainingType !== null;
      default: return false;
    }
  };

  const handleNext = () => {
    if (step === 1) setUserProfile(p => ({ ...p, age: parseInt(localAge) }));
    if (step === 2) setUserProfile(p => ({ ...p, height: parseInt(localHeight) }));
    if (step === 3) setUserProfile(p => ({ ...p, weight: parseInt(localWeight) }));
    
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      setHasCompletedOnboarding(true);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 pt-12">
        <div className="flex items-center gap-4 mb-6">
          {step > 1 && (
            <button onClick={handleBack} className="p-2 -ml-2 card-press">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
          )}
          <div className="flex-1">
            <ProgressIndicator currentStep={step} totalSteps={totalSteps} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-32">
        {step === 1 && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-bold text-foreground mb-2">How old are you?</h1>
            <p className="text-muted-foreground mb-8">This helps us personalize your training</p>
            <div className="flex items-center gap-4">
              <Input
                type="number"
                placeholder="25"
                value={localAge}
                onChange={(e) => setLocalAge(e.target.value)}
                className="text-4xl font-bold h-16 text-center bg-card border-border"
              />
              <span className="text-xl text-muted-foreground">years</span>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-bold text-foreground mb-2">What's your height?</h1>
            <p className="text-muted-foreground mb-8">We'll use this to track your progress</p>
            <div className="flex items-center gap-4">
              <Input
                type="number"
                placeholder="175"
                value={localHeight}
                onChange={(e) => setLocalHeight(e.target.value)}
                className="text-4xl font-bold h-16 text-center bg-card border-border"
              />
              <span className="text-xl text-muted-foreground">cm</span>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-bold text-foreground mb-2">What's your weight?</h1>
            <p className="text-muted-foreground mb-8">Track changes over time</p>
            <div className="flex items-center gap-4">
              <Input
                type="number"
                placeholder="70"
                value={localWeight}
                onChange={(e) => setLocalWeight(e.target.value)}
                className="text-4xl font-bold h-16 text-center bg-card border-border"
              />
              <span className="text-xl text-muted-foreground">kg</span>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-bold text-foreground mb-2">Your experience level</h1>
            <p className="text-muted-foreground mb-8">We'll tailor exercises accordingly</p>
            <div className="space-y-3">
              {experienceLevels.map((level) => (
                <SelectableCard
                  key={level.id}
                  label={level.label}
                  description={level.description}
                  icon={level.icon}
                  isSelected={userProfile.experience === level.id}
                  onClick={() => setUserProfile(p => ({ ...p, experience: level.id }))}
                />
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-bold text-foreground mb-2">What's your goal?</h1>
            <p className="text-muted-foreground mb-8">Focus your training</p>
            <div className="space-y-3">
              {goals.map((goal) => (
                <SelectableCard
                  key={goal.id}
                  label={goal.label}
                  description={goal.description}
                  icon={goal.icon}
                  isSelected={userProfile.goal === goal.id}
                  onClick={() => setUserProfile(p => ({ ...p, goal: goal.id }))}
                />
              ))}
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-bold text-foreground mb-2">Where do you train?</h1>
            <p className="text-muted-foreground mb-8">We'll customize your exercises</p>
            <div className="space-y-3">
              {trainingTypes.map((type) => (
                <SelectableCard
                  key={type.id}
                  label={type.label}
                  description={type.description}
                  icon={type.icon}
                  isSelected={userProfile.trainingType === type.id}
                  onClick={() => setUserProfile(p => ({ ...p, trainingType: type.id }))}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fixed bottom button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-8">
        <Button 
          size="full"
          onClick={handleNext}
          disabled={!canProceed()}
          className={cn(!canProceed() && 'opacity-50')}
        >
          {step === totalSteps ? 'Get Started' : 'Continue'}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
