/**
 * Video Export Engine
 *
 * This module bridges the UI operations model with the native Media3 module.
 * It converts the operations stack into native module calls at export time.
 *
 * IMPORTANT: All video processing happens only at export time.
 * During editing, we only maintain metadata (operations array).
 */

import { NativeModules } from 'react-native';
import {
  VideoProject,
  Operation,
  TrimOperation,
  CropOperation,
  RotateOperation,
  FlipOperation,
  SpeedOperation,
  AudioOperation,
  TextOverlay,
  MergeOperation,
} from '../types/editor';

// Native module interface
interface NativeMedia3ModuleInterface {
  processVideo: (inputUri: string, config: any) => Promise<string>;
  trim: (inputUri: string, startMs: number, endMs: number) => Promise<string>;
  crop: (inputUri: string, left: number, top: number, right: number, bottom: number) => Promise<string>;
  rotate: (inputUri: string, degrees: number) => Promise<string>;
  flip: (inputUri: string, horizontal: boolean, vertical: boolean) => Promise<string>;
  changeSpeed: (inputUri: string, speed: number, preservePitch: boolean) => Promise<string>;
  cut: (inputUri: string, startCutMs: number, endCutMs: number) => Promise<string>;
  mergeSideBySide: (inputA: string, inputB: string) => Promise<string>;
  mergeTopBottom: (inputA: string, inputB: string) => Promise<string>;
  addTextOverlay: (inputUri: string, text: string, x: number, y: number, startMs: number, endMs: number) => Promise<string>;
  extractFrame: (inputUri: string, timeMs: number) => Promise<string>;
  transcode: (inputUri: string, width: number, height: number, bitrate: number) => Promise<string>;
}

const NativeMedia3Module = NativeModules.NativeMedia3Module as NativeMedia3ModuleInterface;

export interface ExportProgressCallback {
  (progress: number, step: string): void;
}

/**
 * Converts operations array to native module config for processVideo
 * This is the preferred method as it applies all effects in a single pass
 */
function operationsToConfig(operations: Operation[], videoWidth: number, videoHeight: number): any {
  const config: any = {};

  for (const op of operations) {
    switch (op.type) {
      case 'trim':
        config.trim = {
          start: op.start * 1000, // Convert to ms
          end: op.end * 1000,
        };
        break;

      case 'crop':
        // Convert to pixel coordinates for native module
        config.crop = {
          left: op.x,
          top: op.y,
          right: op.x + op.width,
          bottom: op.y + op.height,
        };
        break;

      case 'rotate':
        config.rotation = op.degrees;
        break;

      case 'flip':
        config.flip = {
          horizontal: op.horizontal,
          vertical: op.vertical,
        };
        break;

      case 'speed':
        config.speed = op.multiplier;
        break;

      case 'audio':
        if (op.action === 'mute') {
          config.muteAudio = true;
        } else if (op.action === 'volume' && op.volume !== undefined) {
          config.audioVolume = op.volume;
        }
        break;

      case 'text':
        // Text overlays need separate processing in native
        config.overlay = {
          text: op.content,
          x: op.x * videoWidth,
          y: op.y * videoHeight,
        };
        break;
    }
  }

  return config;
}

/**
 * Export video with all operations applied
 *
 * Strategy:
 * 1. For simple operations (trim, crop, rotate, flip, speed, audio), use processVideo
 * 2. For complex operations (merge, multiple text overlays), chain multiple calls
 */
export async function exportVideo(
  project: VideoProject,
  onProgress?: ExportProgressCallback
): Promise<string> {
  if (!project.operations.length) {
    // No operations, return original
    return project.source.uri;
  }

  let currentUri = project.source.uri;
  const totalSteps = calculateTotalSteps(project.operations);
  let currentStep = 0;

  const updateProgress = (step: string) => {
    currentStep++;
    const progress = Math.round((currentStep / totalSteps) * 100);
    onProgress?.(progress, step);
  };

  try {
    // Separate operations by type
    const simpleOps = project.operations.filter(
      (op) => !['merge', 'text', 'sticker'].includes(op.type)
    );
    const textOps = project.operations.filter((op) => op.type === 'text') as TextOverlay[];
    const mergeOps = project.operations.filter((op) => op.type === 'merge') as MergeOperation[];

    // Step 1: Apply simple operations via processVideo (single pass)
    if (simpleOps.length > 0) {
      updateProgress('Processing video effects...');

      const config = operationsToConfig(
        simpleOps,
        project.source.width,
        project.source.height
      );

      currentUri = await NativeMedia3Module.processVideo(currentUri, config);
    }

    // Step 2: Apply text overlays (each requires separate pass for timing)
    for (const textOp of textOps) {
      updateProgress(`Adding text: "${textOp.content.substring(0, 20)}..."`);

      currentUri = await NativeMedia3Module.addTextOverlay(
        currentUri,
        textOp.content,
        textOp.x * project.source.width,
        textOp.y * project.source.height,
        textOp.startTime * 1000,
        textOp.endTime * 1000
      );
    }

    // Step 3: Apply merge operations
    for (const mergeOp of mergeOps) {
      updateProgress(`Merging videos: ${mergeOp.mode}`);

      switch (mergeOp.mode) {
        case 'side-by-side':
          currentUri = await NativeMedia3Module.mergeSideBySide(
            currentUri,
            mergeOp.sourceUri
          );
          break;
        case 'top-bottom':
          currentUri = await NativeMedia3Module.mergeTopBottom(
            currentUri,
            mergeOp.sourceUri
          );
          break;
        case 'append':
          // For append, we'd need to use a composition approach
          // This would require extending the native module
          console.warn('Append merge not yet implemented in native module');
          break;
      }
    }

    updateProgress('Finalizing...');

    return currentUri;
  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  }
}

/**
 * Calculate total export steps for progress tracking
 */
function calculateTotalSteps(operations: Operation[]): number {
  let steps = 1; // Initial processing

  // Simple ops are batched into one step
  const hasSimpleOps = operations.some(
    (op) => !['merge', 'text', 'sticker'].includes(op.type)
  );
  if (hasSimpleOps) steps++;

  // Each text overlay is a separate step
  steps += operations.filter((op) => op.type === 'text').length;

  // Each merge is a separate step
  steps += operations.filter((op) => op.type === 'merge').length;

  steps++; // Finalizing

  return steps;
}

/**
 * Extract a thumbnail frame from video
 */
export async function extractThumbnail(
  videoUri: string,
  timeMs: number = 0
): Promise<string> {
  return NativeMedia3Module.extractFrame(videoUri, timeMs);
}

/**
 * Generate multiple thumbnails for timeline
 */
export async function generateTimelineThumbnails(
  videoUri: string,
  count: number = 10,
  durationMs: number
): Promise<string[]> {
  const thumbnails: string[] = [];
  const interval = durationMs / count;

  for (let i = 0; i < count; i++) {
    const timeMs = i * interval;
    try {
      const thumbnail = await NativeMedia3Module.extractFrame(videoUri, timeMs);
      thumbnails.push(thumbnail);
    } catch (error) {
      console.warn(`Failed to extract thumbnail at ${timeMs}ms:`, error);
    }
  }

  return thumbnails;
}

/**
 * Quick transcode for preview/sharing
 */
export async function quickCompress(
  videoUri: string,
  targetWidth: number = 720,
  targetHeight: number = 1280
): Promise<string> {
  return NativeMedia3Module.transcode(videoUri, targetWidth, targetHeight, 0);
}
