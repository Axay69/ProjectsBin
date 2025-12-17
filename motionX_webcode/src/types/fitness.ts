export interface UserProfile {
  age: number | null;
  height: number | null;
  weight: number | null;
  experience: 'beginner' | 'intermediate' | 'advanced' | null;
  goal: 'muscle' | 'strength' | 'fat-loss' | 'endurance' | null;
  trainingType: 'gym' | 'home' | 'calisthenics' | null;
}

export interface MuscleGroup {
  id: string;
  name: string;
  icon: string;
  subGroups?: SubMuscleGroup[];
}

export interface SubMuscleGroup {
  id: string;
  name: string;
  exercises: Exercise[];
}

export interface Exercise {
  id: string;
  name: string;
  targetMuscle: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  equipment: string;
  sets: number;
  reps: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  instructions: string[];
}

export type TabId = 'home' | 'train' | 'progress' | 'profile';
