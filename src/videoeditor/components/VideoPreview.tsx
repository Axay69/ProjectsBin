import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Text,
} from 'react-native';
import Video, { VideoRef, OnProgressData, OnLoadData } from 'react-native-video';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useEditorStore } from '../store/editorStore';
import { formatTime } from '../types/editor';
import { colors, spacing, radius } from '../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PREVIEW_WIDTH = SCREEN_WIDTH - spacing.lg * 2;
// Limit height to ensure space for timeline and controls
const MAX_PREVIEW_HEIGHT = SCREEN_HEIGHT * 0.45;
const PREVIEW_HEIGHT = Math.min(PREVIEW_WIDTH * (16 / 9), MAX_PREVIEW_HEIGHT);

interface VideoPreviewProps {
  onVideoLoad?: (data: OnLoadData) => void;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ onVideoLoad }) => {
  const videoRef = useRef<VideoRef>(null);
  const {
    project,
    currentTime,
    isPlaying,
    isSeeking,
    setCurrentTime,
    setIsPlaying,
    setIsSeeking,
  } = useEditorStore();

  const isLoading = useSharedValue(true);

  // Seek video when currentTime changes externally
  useEffect(() => {
    if (isSeeking && videoRef.current) {
      videoRef.current.seek(currentTime);
    }
  }, [currentTime, isSeeking]);

  // Handle video progress
  const handleProgress = useCallback(
    (data: OnProgressData) => {
      if (!isSeeking) {
        setCurrentTime(data.currentTime);
      }
    },
    [isSeeking, setCurrentTime]
  );

  // Handle video load
  const handleLoad = useCallback(
    (data: OnLoadData) => {
      isLoading.value = false;
      onVideoLoad?.(data);
  }, [isLoading, onVideoLoad]
  );

  // Handle video end
  const handleEnd = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, [setIsPlaying, setCurrentTime]);

  // Handle seek complete
  const handleSeek = useCallback(() => {
    setIsSeeking(false);
  }, [setIsSeeking]);

  // Animated styles
  const loadingStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      opacity: withTiming(isLoading.value ? 1 : 0, { duration: 200 }),
    };
  });

  if (!project) {
    return (
      <View style={styles.container}>
        <View style={styles.placeholder}>
          <Icon name="video-outline" size={48} color={colors.textMuted} />
          <Text style={styles.placeholderText}>Select a video</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Video Player */}
      <View style={styles.videoContainer}>
        <Video
          ref={videoRef}
          source={{ uri: project.source.uri }}
          style={styles.video}
          resizeMode="contain"
          paused={!isPlaying}
          onProgress={handleProgress}
          onLoad={handleLoad}
          onEnd={handleEnd}
          onSeek={handleSeek}
          repeat={false}
          progressUpdateInterval={100}
        />

        {/* Loading Overlay */}
        <Animated.View style={[styles.loadingOverlay, loadingStyle]} pointerEvents="none">
          <ActivityIndicator size="large" color={colors.primary} />
        </Animated.View>

        {/* Time Display */}
        {/* <View style={styles.timeDisplay}>
          <Text style={styles.timeText}>
            {formatTime(currentTime)}
          </Text>
          <Text style={styles.timeSeparator}>/</Text>
          <Text style={styles.durationText}>
            {formatTime(project.source.duration)}
          </Text>
        </View> */}

        {/* Progress Bar */}
        {/* <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${(currentTime / project.source.duration) * 100}%`,
              },
            ]}
          />
        </View> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: PREVIEW_WIDTH,
    height: PREVIEW_HEIGHT,
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  videoContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  video: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  placeholderText: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: spacing.sm,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  timeDisplay: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  timeText: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  timeSeparator: {
    color: colors.textMuted,
    fontSize: 11,
    marginHorizontal: 2,
  },
  durationText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontVariant: ['tabular-nums'],
  },
  progressBarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
  },
});

export default VideoPreview;
