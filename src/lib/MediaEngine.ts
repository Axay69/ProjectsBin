import { NativeModules } from 'react-native';

const { NativeMedia3Module } = NativeModules;

export interface EditConfig {
  trim?: { start: number; end: number }; // milliseconds
  speed?: number;
  rotation?: number; // degrees (0, 90, 180, 270, etc)
  crop?: { left: number; top: number; right: number; bottom: number }; // pixels
  flip?: { horizontal: boolean; vertical: boolean };
  overlay?: { text: string; x: number; y: number };
  compression?: 'HEVC_720P' | 'H264_1080P' | 'WHATSAPP';
}

export const MediaEngine = {
  /**
   * The "Universal" method. Does everything in one re-encode.
   */
  process: async (uri: string, config: EditConfig): Promise<string> => {
    // 1. Validation Logic
    if (config.trim && config.trim.start >= config.trim.end) {
      throw new Error("Trim start must be less than end");
    }

    // 2. Preset Mapping / Defaults
    // In a real app, we might map 'WHATSAPP' to specific bitrates here
    // For now, we pass it through to native or handle basic defaults
    
    return NativeMedia3Module.processVideo(uri, config);
  },

  /**
   * Extract a frame at a specific time
   */
  extractFrame: async (uri: string, timeMs: number): Promise<string> => {
     return NativeMedia3Module.extractFrame(uri, timeMs);
  },

  /**
   * Merge two videos
   */
  merge: async (uriA: string, uriB: string, mode: 'side-by-side' | 'top-bottom'): Promise<string> => {
    if (mode === 'side-by-side') {
        return NativeMedia3Module.mergeSideBySide(uriA, uriB);
    } else {
        return NativeMedia3Module.mergeTopBottom(uriA, uriB);
    }
  },

  /**
   * Cut out a middle section (remove segment between startCutMs and endCutMs)
   */
  cut: async (uri: string, startCutMs: number, endCutMs: number): Promise<string> => {
     return NativeMedia3Module.cut(uri, startCutMs, endCutMs);
  },
  
  /**
   * Convert image to video
   */
  imageToVideo: async (uri: string, durationMs: number = 5000): Promise<string> => {
      return NativeMedia3Module.imageToVideo(uri, durationMs);
  },

  /**
   * Quick utility for social sharing compression
   */
  compressForSocial: (uri: string) => 
    MediaEngine.process(uri, { compression: 'HEVC_720P' }),
};
