import { create } from 'zustand';
import { ExerciseListItem, ExerciseDetail } from '../lib/exercisedb';
import { mmkv } from '../lib/mmkv';

export interface WorkoutSet {
  id: string;
  reps: string;
  weight: string;
  completed: boolean;
}

export interface WorkoutExercise {
  id: string; // Unique ID for this instance in the workout
  exercise: ExerciseListItem | ExerciseDetail;
  sets: WorkoutSet[];
}

export interface WorkoutSession {
  id: string;
  startTime: number;
  endTime?: number;
  name: string;
  exercises: WorkoutExercise[];
  durationSeconds: number;
}

// New Interface for Saved Workout Plans
export interface WorkoutPlan {
  id: string;
  name: string;
  exercises: (ExerciseListItem | ExerciseDetail)[];
  // Could add bodyParts here later if needed
}

interface WorkoutState {
  // Active Session State
  activeSession: WorkoutSession | null;
  startWorkout: (name?: string, fromPlan?: WorkoutPlan) => void;
  finishWorkout: () => void;
  addExerciseToSession: (exercise: ExerciseListItem | ExerciseDetail) => void;
  removeExerciseFromSession: (exerciseInstanceId: string) => void;
  addSet: (exerciseInstanceId: string) => void;
  removeSet: (exerciseInstanceId: string, setId: string) => void;
  updateSet: (exerciseInstanceId: string, setId: string, field: 'reps' | 'weight' | 'completed', value: string | boolean) => void;
  cancelWorkout: () => void;

  // Saved Plans State
  savedPlans: WorkoutPlan[];
  createPlan: (name: string) => void;
  deletePlan: (planId: string) => void;
  addExerciseToPlan: (planId: string, exercise: ExerciseListItem | ExerciseDetail) => void;
  removeExerciseFromPlan: (planId: string, exerciseId: string) => void;
  reorderExercisesInPlan: (planId: string, fromIndex: number, toIndex: number) => void;
}

const PLANS_KEY = 'motionx_workout_plans';

export const useWorkoutStore = create<WorkoutState>((set, get) => {
  // Load initial plans
  const loadPlans = () => {
    const json = mmkv.getString(PLANS_KEY);
    return json ? JSON.parse(json) : [];
  };

  return {
    activeSession: null,
    savedPlans: loadPlans(),

    // --- Active Session Actions ---

    startWorkout: (name = 'New Workout', fromPlan) => {
      let initialExercises: WorkoutExercise[] = [];
      
      if (fromPlan) {
        initialExercises = fromPlan.exercises.map(ex => ({
          id: Date.now().toString() + Math.random(),
          exercise: ex,
          sets: [{ id: Date.now().toString() + Math.random(), reps: '', weight: '', completed: false }]
        }));
      }

      set({
        activeSession: {
          id: Date.now().toString(),
          startTime: Date.now(),
          name: fromPlan ? fromPlan.name : name,
          exercises: initialExercises,
          durationSeconds: 0,
        },
      });
    },

    finishWorkout: () => {
      set({ activeSession: null });
    },

    cancelWorkout: () => {
      set({ activeSession: null });
    },

    addExerciseToSession: (exercise) => {
      const { activeSession } = get();
      if (!activeSession) return;

      const newExercise: WorkoutExercise = {
        id: Date.now().toString() + Math.random(),
        exercise,
        sets: [
          { id: Date.now().toString() + Math.random(), reps: '', weight: '', completed: false },
        ],
      };

      set({
        activeSession: {
          ...activeSession,
          exercises: [...activeSession.exercises, newExercise],
        },
      });
    },

    removeExerciseFromSession: (exerciseInstanceId) => {
      const { activeSession } = get();
      if (!activeSession) return;

      set({
        activeSession: {
          ...activeSession,
          exercises: activeSession.exercises.filter(e => e.id !== exerciseInstanceId),
        },
      });
    },

    addSet: (exerciseInstanceId) => {
      const { activeSession } = get();
      if (!activeSession) return;

      const exercises = activeSession.exercises.map(e => {
        if (e.id === exerciseInstanceId) {
          const lastSet = e.sets[e.sets.length - 1];
          return {
            ...e,
            sets: [
              ...e.sets,
              {
                id: Date.now().toString() + Math.random(),
                reps: lastSet ? lastSet.reps : '',
                weight: lastSet ? lastSet.weight : '',
                completed: false,
              },
            ],
          };
        }
        return e;
      });

      set({
        activeSession: {
          ...activeSession,
          exercises,
        },
      });
    },

    removeSet: (exerciseInstanceId, setId) => {
      const { activeSession } = get();
      if (!activeSession) return;

      const exercises = activeSession.exercises.map(e => {
        if (e.id === exerciseInstanceId) {
          return {
            ...e,
            sets: e.sets.filter(s => s.id !== setId),
          };
        }
        return e;
      });

      set({
        activeSession: {
          ...activeSession,
          exercises,
        },
      });
    },

    updateSet: (exerciseInstanceId, setId, field, value) => {
      const { activeSession } = get();
      if (!activeSession) return;

      const exercises = activeSession.exercises.map(e => {
        if (e.id === exerciseInstanceId) {
          return {
            ...e,
            sets: e.sets.map(s => {
              if (s.id === setId) {
                return { ...s, [field]: value };
              }
              return s;
            }),
          };
        }
        return e;
      });

      set({
        activeSession: {
          ...activeSession,
          exercises,
        },
      });
    },

    // --- Saved Plans Actions ---

    createPlan: (name) => {
      const newPlan: WorkoutPlan = {
        id: Date.now().toString(),
        name,
        exercises: [],
      };
      const updatedPlans = [...get().savedPlans, newPlan];
      set({ savedPlans: updatedPlans });
      mmkv.set(PLANS_KEY, JSON.stringify(updatedPlans));
    },

    deletePlan: (planId) => {
      const updatedPlans = get().savedPlans.filter(p => p.id !== planId);
      set({ savedPlans: updatedPlans });
      mmkv.set(PLANS_KEY, JSON.stringify(updatedPlans));
    },

    addExerciseToPlan: (planId, exercise) => {
      const plans = get().savedPlans.map(p => {
        if (p.id === planId) {
          return { ...p, exercises: [...p.exercises, exercise] };
        }
        return p;
      });
      set({ savedPlans: plans });
      mmkv.set(PLANS_KEY, JSON.stringify(plans));
    },

    removeExerciseFromPlan: (planId, exerciseId) => {
      const plans = get().savedPlans.map(p => {
        if (p.id === planId) {
          return { ...p, exercises: p.exercises.filter(e => e.exerciseId !== exerciseId) };
        }
        return p;
      });
      set({ savedPlans: plans });
      mmkv.set(PLANS_KEY, JSON.stringify(plans));
    },

    reorderExercisesInPlan: (planId, fromIndex, toIndex) => {
      const plans = get().savedPlans.map(p => {
        if (p.id === planId) {
          const newExercises = [...p.exercises];
          const [moved] = newExercises.splice(fromIndex, 1);
          newExercises.splice(toIndex, 0, moved);
          return { ...p, exercises: newExercises };
        }
        return p;
      });
      set({ savedPlans: plans });
      mmkv.set(PLANS_KEY, JSON.stringify(plans));
    },
  };
});
