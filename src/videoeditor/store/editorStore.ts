import { create } from 'zustand';
import {
  EditorState,
  VideoProject,
  VideoMetadata,
  Operation,
  EditMode,
  CropRatio,
  TrimOperation,
  CropOperation,
  RotateOperation,
  SpeedOperation,
  AudioOperation,
  TextOverlay,
  FlipOperation,
  MergeOperation,
  generateId,
} from '../types/editor';

interface EditorActions {
  // Project actions
  initProject: (source: VideoMetadata) => void;
  resetProject: () => void;

  // Playback actions
  setCurrentTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  togglePlayback: () => void;
  setIsSeeking: (seeking: boolean) => void;

  // UI mode actions
  setActiveMode: (mode: EditMode) => void;
  selectOperation: (id: string | null) => void;

  // Timeline actions
  setTimelineZoom: (zoom: number) => void;
  setTimelineScrollX: (scrollX: number) => void;

  // Trim actions
  setTrimStart: (time: number) => void;
  setTrimEnd: (time: number) => void;
  applyTrim: () => void;

  // Crop actions
  setCropPreset: (preset: CropRatio) => void;
  setCropRect: (rect: { x: number; y: number; width: number; height: number } | null) => void;
  applyCrop: () => void;

  // Operation actions
  addOperation: (operation: Operation) => void;
  updateOperation: (id: string, updates: Partial<Operation>) => void;
  removeOperation: (id: string) => void;
  clearOperations: () => void;

  // Convenience operation creators
  addRotation: (degrees: 90 | 180 | 270) => void;
  addFlip: (horizontal: boolean, vertical: boolean) => void;
  addSpeed: (multiplier: number) => void;
  addAudioMute: () => void;
  addTextOverlay: (text: string, x: number, y: number) => void;

  // Export actions
  setExporting: (exporting: boolean) => void;
  setExportProgress: (progress: number) => void;

  // Computed helpers (for UI)
  getEffectiveDuration: () => number;
  getOperationsByType: <T extends Operation>(type: T['type']) => T[];
}

type EditorStore = EditorState & EditorActions;

const initialState: EditorState = {
  project: null,
  currentTime: 0,
  isPlaying: false,
  isSeeking: false,
  activeMode: 'none',
  selectedOperationId: null,
  timelineZoom: 1,
  timelineScrollX: 0,
  trimStart: 0,
  trimEnd: 0,
  cropPreset: '1:1',
  cropRect: null,
  isExporting: false,
  exportProgress: 0,
};

export const useEditorStore = create<EditorStore>((set, get) => ({
  ...initialState,

  // Project actions
  initProject: (source: VideoMetadata) => {
    const project: VideoProject = {
      id: generateId(),
      source,
      operations: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set({
      project,
      currentTime: 0,
      isPlaying: false,
      trimStart: 0,
      trimEnd: source.duration,
      activeMode: 'none',
      selectedOperationId: null,
    });
  },

  resetProject: () => set(initialState),

  // Playback actions
  setCurrentTime: (time: number) => {
    const { project } = get();
    if (!project) return;
    const clampedTime = Math.max(0, Math.min(time, project.source.duration));
    set({ currentTime: clampedTime });
  },

  setIsPlaying: (playing: boolean) => set({ isPlaying: playing }),

  togglePlayback: () => set((state) => ({ isPlaying: !state.isPlaying })),

  setIsSeeking: (seeking: boolean) => set({ isSeeking: seeking }),

  // UI mode actions
  setActiveMode: (mode: EditMode) => {
    const { project } = get();
    set({ activeMode: mode, selectedOperationId: null });

    // Reset trim handles when entering trim mode
    if (mode === 'trim' && project) {
      set({ trimStart: 0, trimEnd: project.source.duration });
    }
  },

  selectOperation: (id: string | null) => set({ selectedOperationId: id }),

  // Timeline actions
  setTimelineZoom: (zoom: number) => {
    const clampedZoom = Math.max(0.5, Math.min(zoom, 3));
    set({ timelineZoom: clampedZoom });
  },

  setTimelineScrollX: (scrollX: number) => set({ timelineScrollX: scrollX }),

  // Trim actions
  setTrimStart: (time: number) => {
    const { project, trimEnd } = get();
    if (!project) return;
    const clampedStart = Math.max(0, Math.min(time, trimEnd - 0.1));
    set({ trimStart: clampedStart });
  },

  setTrimEnd: (time: number) => {
    const { project, trimStart } = get();
    if (!project) return;
    const clampedEnd = Math.max(trimStart + 0.1, Math.min(time, project.source.duration));
    set({ trimEnd: clampedEnd });
  },

  applyTrim: () => {
    const { project, trimStart, trimEnd } = get();
    if (!project) return;

    // Remove existing trim operation and add new one
    const filteredOps = project.operations.filter((op) => op.type !== 'trim');
    const trimOp: TrimOperation = {
      type: 'trim',
      id: generateId(),
      start: trimStart,
      end: trimEnd,
    };

    set({
      project: {
        ...project,
        operations: [...filteredOps, trimOp],
        updatedAt: Date.now(),
      },
      activeMode: 'none',
    });
  },

  // Crop actions
  setCropPreset: (preset: CropRatio) => set({ cropPreset: preset }),

  setCropRect: (rect) => set({ cropRect: rect }),

  applyCrop: () => {
    const { project, cropRect, cropPreset } = get();
    if (!project || !cropRect) return;

    const cropOp: CropOperation = {
      type: 'crop',
      id: generateId(),
      ...cropRect,
      ratio: cropPreset,
    };

    set({
      project: {
        ...project,
        operations: [...project.operations, cropOp],
        updatedAt: Date.now(),
      },
      cropRect: null,
      activeMode: 'none',
    });
  },

  // Operation actions
  addOperation: (operation: Operation) => {
    const { project } = get();
    if (!project) return;

    set({
      project: {
        ...project,
        operations: [...project.operations, operation],
        updatedAt: Date.now(),
      },
    });
  },

  updateOperation: (id: string, updates: Partial<Operation>) => {
    const { project } = get();
    if (!project) return;

    const updatedOps = project.operations.map((op) =>
      op.id === id ? { ...op, ...updates } : op
    );

    set({
      project: {
        ...project,
        operations: updatedOps,
        updatedAt: Date.now(),
      },
    });
  },

  removeOperation: (id: string) => {
    const { project } = get();
    if (!project) return;

    set({
      project: {
        ...project,
        operations: project.operations.filter((op) => op.id !== id),
        updatedAt: Date.now(),
      },
    });
  },

  clearOperations: () => {
    const { project } = get();
    if (!project) return;

    set({
      project: {
        ...project,
        operations: [],
        updatedAt: Date.now(),
      },
    });
  },

  // Convenience operation creators
  addRotation: (degrees: 90 | 180 | 270) => {
    const rotateOp: RotateOperation = {
      type: 'rotate',
      id: generateId(),
      degrees,
    };
    get().addOperation(rotateOp);
  },

  addFlip: (horizontal: boolean, vertical: boolean) => {
    const flipOp: FlipOperation = {
      type: 'flip',
      id: generateId(),
      horizontal,
      vertical,
    };
    get().addOperation(flipOp);
  },

  addSpeed: (multiplier: number) => {
    const { project } = get();
    if (!project) return;

    // Replace existing speed operation
    const filteredOps = project.operations.filter((op) => op.type !== 'speed');
    const speedOp: SpeedOperation = {
      type: 'speed',
      id: generateId(),
      multiplier,
    };

    set({
      project: {
        ...project,
        operations: [...filteredOps, speedOp],
        updatedAt: Date.now(),
      },
    });
  },

  addAudioMute: () => {
    const audioOp: AudioOperation = {
      type: 'audio',
      id: generateId(),
      action: 'mute',
    };
    get().addOperation(audioOp);
  },

  addTextOverlay: (text: string, x: number, y: number) => {
    const { project } = get();
    if (!project) return;

    const textOp: TextOverlay = {
      type: 'text',
      id: generateId(),
      content: text,
      x,
      y,
      fontSize: 24,
      color: '#FFFFFF',
      fontWeight: 'bold',
      startTime: 0,
      endTime: project.source.duration,
    };
    get().addOperation(textOp);
  },

  // Export actions
  setExporting: (exporting: boolean) => set({ isExporting: exporting }),

  setExportProgress: (progress: number) => set({ exportProgress: progress }),

  // Computed helpers
  getEffectiveDuration: () => {
    const { project } = get();
    if (!project) return 0;

    const trimOp = project.operations.find((op) => op.type === 'trim') as TrimOperation | undefined;
    const baseDuration = trimOp ? trimOp.end - trimOp.start : project.source.duration;

    const speedOp = project.operations.find((op) => op.type === 'speed') as SpeedOperation | undefined;
    return speedOp ? baseDuration / speedOp.multiplier : baseDuration;
  },

  getOperationsByType: <T extends Operation>(type: T['type']): T[] => {
    const { project } = get();
    if (!project) return [];
    return project.operations.filter((op) => op.type === type) as T[];
  },
}));
