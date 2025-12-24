// Video Editor Types - Operations model for non-destructive editing
// All edits are metadata-only until export time

export type OperationType =
  | 'trim'
  | 'cut'
  | 'crop'
  | 'rotate'
  | 'flip'
  | 'speed'
  | 'audio'
  | 'text'
  | 'sticker'
  | 'merge';

export type CropRatio = '1:1' | '4:5' | '16:9' | '9:16' | 'free';
export type MergeMode = 'append' | 'side-by-side' | 'top-bottom';
export type AudioAction = 'mute' | 'replace' | 'volume';

// Individual operation types
export interface TrimOperation {
  type: 'trim';
  id: string;
  start: number; // seconds
  end: number;   // seconds
}

export interface CutOperation {
  type: 'cut';
  id: string;
  start: number; // start of cut region (seconds)
  end: number;   // end of cut region (seconds)
}

export interface CropOperation {
  type: 'crop';
  id: string;
  x: number;      // pixel from left
  y: number;      // pixel from top
  width: number;  // crop width in pixels
  height: number; // crop height in pixels
  ratio: CropRatio;
}

export interface RotateOperation {
  type: 'rotate';
  id: string;
  degrees: 90 | 180 | 270;
}

export interface FlipOperation {
  type: 'flip';
  id: string;
  horizontal: boolean;
  vertical: boolean;
}

export interface SpeedOperation {
  type: 'speed';
  id: string;
  multiplier: number; // 0.25 to 3.0
}

export interface AudioOperation {
  type: 'audio';
  id: string;
  action: AudioAction;
  volume?: number;         // 0-1 for volume action
  replacementUri?: string; // for replace action
}

export interface TextOverlay {
  type: 'text';
  id: string;
  content: string;
  x: number;          // position as percentage (0-1)
  y: number;          // position as percentage (0-1)
  fontSize: number;
  color: string;
  fontWeight: 'normal' | 'bold';
  startTime: number;  // seconds
  endTime: number;    // seconds
}

export interface StickerOverlay {
  type: 'sticker';
  id: string;
  uri: string;
  x: number;          // position as percentage (0-1)
  y: number;          // position as percentage (0-1)
  scale: number;
  rotation: number;
  startTime: number;
  endTime: number;
}

export interface MergeOperation {
  type: 'merge';
  id: string;
  mode: MergeMode;
  sourceUri: string;
}

// Union type for all operations
export type Operation =
  | TrimOperation
  | CutOperation
  | CropOperation
  | RotateOperation
  | FlipOperation
  | SpeedOperation
  | AudioOperation
  | TextOverlay
  | StickerOverlay
  | MergeOperation;

// Video metadata
export interface VideoMetadata {
  uri: string;
  duration: number;    // seconds
  width: number;
  height: number;
  rotation: number;    // original rotation from metadata
  frameRate?: number;
  bitrate?: number;
}

// Project state
export interface VideoProject {
  id: string;
  source: VideoMetadata;
  operations: Operation[];
  thumbnailUri?: string;
  createdAt: number;
  updatedAt: number;
}

// Edit mode for UI
export type EditMode =
  | 'none'
  | 'trim'
  | 'cut'
  | 'crop'
  | 'rotate'
  | 'speed'
  | 'audio'
  | 'text'
  | 'sticker'
  | 'merge';

// Editor state
export interface EditorState {
  // Project
  project: VideoProject | null;

  // Playback state
  currentTime: number;
  isPlaying: boolean;
  isSeeking: boolean;

  // UI state
  activeMode: EditMode;
  selectedOperationId: string | null;

  // Timeline state
  timelineZoom: number;      // 1.0 = default
  timelineScrollX: number;   // scroll position

  // Trim handles (for trim mode)
  trimStart: number;
  trimEnd: number;

  // Crop state (for crop mode)
  cropPreset: CropRatio;
  cropRect: { x: number; y: number; width: number; height: number } | null;

  // Export state
  isExporting: boolean;
  exportProgress: number;
}

// Tool definition for toolbar
export interface EditorTool {
  id: EditMode;
  icon: string;
  label: string;
}

// Export configuration
export interface ExportConfig {
  quality: 'low' | 'medium' | 'high';
  format: 'mp4' | 'mov';
  resolution?: { width: number; height: number };
}

// Helper to generate unique IDs
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Format time as MM:SS.ms
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
};

// Format time as MM:SS (no ms)
export const formatTimeShort = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
