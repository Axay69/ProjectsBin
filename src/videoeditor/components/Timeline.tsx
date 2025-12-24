import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useEditorStore } from '../store/editorStore';
import { formatTimeShort } from '../types/editor';
import { colors, spacing, timeline as timelineTheme } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TIMELINE_PADDING = spacing.lg;
const TRACK_WIDTH = SCREEN_WIDTH - TIMELINE_PADDING * 2;

interface TimelineProps {
  showTrimHandles?: boolean;
}

const Timeline: React.FC<TimelineProps> = ({ showTrimHandles = false }) => {
  const {
    project,
    currentTime,
    trimStart,
    trimEnd,
    timelineZoom,
    activeMode,
    setCurrentTime,
    setIsSeeking,
    setTrimStart,
    setTrimEnd,
    isPlaying,
    togglePlayback,
    setIsPlaying,
  } = useEditorStore();

  const playheadX = useSharedValue(0);
  const leftHandleX = useSharedValue(0);
  const rightHandleX = useSharedValue(TRACK_WIDTH);

  const duration = project?.source.duration || 1;

  // Memoized callbacks for runOnJS - must be stable
  const updateCurrentTime = useCallback((time: number) => {
    setCurrentTime(time);
  }, [setCurrentTime]);

  const updateSeeking = useCallback((seeking: boolean) => {
    setIsSeeking(seeking);
  }, [setIsSeeking]);

  const pausePlayback = useCallback(() => {
    setIsPlaying(false);
  }, [setIsPlaying]);

  const updateTrimStart = useCallback((time: number) => {
    setTrimStart(time);
  }, [setTrimStart]);

  const updateTrimEnd = useCallback((time: number) => {
    setTrimEnd(time);
  }, [setTrimEnd]);

  // Convert time to X position
  const timeToX = useCallback(
    (time: number) => {
      return (time / duration) * TRACK_WIDTH;
    },
    [duration]
  );

  // Convert X position to time (worklet-safe)
  const xToTime = useCallback(
    (x: number) => {
      'worklet';
      return Math.max(0, Math.min((x / TRACK_WIDTH) * duration, duration));
    },
    [duration]
  );

  // Update playhead position when currentTime changes
  React.useEffect(() => {
    playheadX.value = timeToX(currentTime);
  }, [currentTime, timeToX, playheadX]);

  // Update trim handles when trimStart/trimEnd change
  React.useEffect(() => {
    leftHandleX.value = timeToX(trimStart);
  }, [trimStart, timeToX, leftHandleX]);

  React.useEffect(() => {
    rightHandleX.value = timeToX(trimEnd);
  }, [trimEnd, timeToX, rightHandleX]);

  // Generate time markers
  const timeMarkers = useMemo(() => {
    if (!duration) return [];
    const markers: { time: number; x: number }[] = [];
    const interval = duration <= 10 ? 1 : duration <= 30 ? 2 : duration <= 60 ? 5 : 10;
    for (let t = 0; t <= duration; t += interval) {
      markers.push({ time: t, x: timeToX(t) });
    }
    return markers;
  }, [duration, timeToX]);

  // Playhead gesture
  const playheadGesture = Gesture.Pan()
    .onStart(() => {
      'worklet';
      runOnJS(updateSeeking)(true);
      runOnJS(pausePlayback)();
    })
    .onUpdate((event) => {
      'worklet';
      const newX = Math.max(0, Math.min(event.absoluteX - TIMELINE_PADDING, TRACK_WIDTH));
      playheadX.value = newX;
      const newTime = xToTime(newX);
      runOnJS(updateCurrentTime)(newTime);
    })
    .onEnd(() => {
      'worklet';
      runOnJS(updateSeeking)(false);
    });

  // Timeline tap gesture to seek
  const timelineTapGesture = Gesture.Tap().onEnd((event) => {
    'worklet';
    runOnJS(pausePlayback)();
    const tapX = Math.max(0, Math.min(event.absoluteX - TIMELINE_PADDING, TRACK_WIDTH));
    playheadX.value = withSpring(tapX, { damping: 15 });
    const newTime = xToTime(tapX);
    runOnJS(updateCurrentTime)(newTime);
  });

  // Left trim handle gesture
  const leftHandleGesture = Gesture.Pan()
    .onUpdate((event) => {
      'worklet';
      const maxX = rightHandleX.value - 20;
      const newX = Math.max(0, Math.min(event.absoluteX - TIMELINE_PADDING, maxX));
      leftHandleX.value = newX;
      const newTime = xToTime(newX);
      runOnJS(updateTrimStart)(newTime);
    });

  // Right trim handle gesture
  const rightHandleGesture = Gesture.Pan()
    .onUpdate((event) => {
      'worklet';
      const minX = leftHandleX.value + 20;
      const newX = Math.max(minX, Math.min(event.absoluteX - TIMELINE_PADDING, TRACK_WIDTH));
      rightHandleX.value = newX;
      const newTime = xToTime(newX);
      runOnJS(updateTrimEnd)(newTime);
    });

  // Animated styles
  const playheadStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ translateX: playheadX.value - 1.5 }],
    };
  });

  const leftHandleStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ translateX: leftHandleX.value - timelineTheme.handleWidth }],
    };
  });

  const rightHandleStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ translateX: rightHandleX.value }],
    };
  });

  const leftOverlayStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      width: leftHandleX.value,
    };
  });

  const rightOverlayStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      width: TRACK_WIDTH - rightHandleX.value,
      left: rightHandleX.value,
    };
  });

  if (!project) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No video loaded</Text>
        </View>
      </View>
    );
  }

  const shouldShowTrimHandles = showTrimHandles || activeMode === 'trim';

  return (
    <View style={styles.container}>
      {/* Time Ruler */}
      <View style={styles.ruler}>
        {timeMarkers.map((marker, index) => (
          <View key={index} style={[styles.markerContainer, { left: marker.x }]}>
            <View style={styles.markerTick} />
            <Text style={styles.markerText}>{formatTimeShort(marker.time)}</Text>
          </View>
        ))}
      </View>

      {/* Timeline Track */}
      <GestureDetector gesture={timelineTapGesture}>
        <View style={styles.trackContainer}>
          {/* Track Background */}
          <View style={styles.track}>
            <View style={styles.thumbnailStrip} />
          </View>

          {/* Trim Overlays */}
          {shouldShowTrimHandles && (
            <>
              <Animated.View style={[styles.trimOverlay, styles.trimOverlayLeft, leftOverlayStyle]} />
              <Animated.View style={[styles.trimOverlay, styles.trimOverlayRight, rightOverlayStyle]} />
            </>
          )}

          {/* Trim Handles */}
          {shouldShowTrimHandles && (
            <>
              <GestureDetector gesture={leftHandleGesture}>
                <Animated.View style={[styles.trimHandle, styles.trimHandleLeft, leftHandleStyle]}>
                  <View style={styles.handleBar} />
                  <View style={styles.handleBar} />
                </Animated.View>
              </GestureDetector>

              <GestureDetector gesture={rightHandleGesture}>
                <Animated.View style={[styles.trimHandle, styles.trimHandleRight, rightHandleStyle]}>
                  <View style={styles.handleBar} />
                  <View style={styles.handleBar} />
                </Animated.View>
              </GestureDetector>
            </>
          )}

          {/* Playhead */}
          <GestureDetector gesture={playheadGesture}>
            <Animated.View style={[styles.playhead, playheadStyle]}>
              <View style={styles.playheadHead} />
              <View style={styles.playheadLine} />
            </Animated.View>
          </GestureDetector>
        </View>
      </GestureDetector>

      {/* Time indicator */}
      <View style={styles.timeIndicator}>
        <TouchableOpacity style={styles.playControl} onPress={togglePlayback} activeOpacity={0.8}>
          <Icon name={isPlaying ? 'pause' : 'play'} size={18} color={colors.background} />
        </TouchableOpacity>
        <View style={styles.timeRow}>
          <Text style={styles.currentTimeText}>{formatTimeShort(currentTime)}</Text>
          <Text style={styles.durationText}> / {formatTimeShort(duration)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: TIMELINE_PADDING,
    paddingVertical: spacing.sm,
    backgroundColor: colors.timelineBg,
  },
  emptyState: {
    height: timelineTheme.height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  ruler: {
    height: timelineTheme.rulerHeight,
    position: 'relative',
    marginBottom: spacing.xs,
  },
  markerContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  markerTick: {
    width: 1,
    height: 6,
    backgroundColor: colors.textMuted,
  },
  markerText: {
    color: colors.textMuted,
    fontSize: 9,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  trackContainer: {
    height: timelineTheme.trackHeight,
    position: 'relative',
  },
  track: {
    flex: 1,
    backgroundColor: colors.timelineTrack,
    borderRadius: 6,
    overflow: 'hidden',
  },
  thumbnailStrip: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    opacity: 0.8,
  },
  trimOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: colors.trimOverlay,
  },
  trimOverlayLeft: {
    left: 0,
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
  },
  trimOverlayRight: {
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
  },
  trimHandle: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: timelineTheme.handleWidth,
    backgroundColor: colors.trimHandle,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  trimHandleLeft: {
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
  },
  trimHandleRight: {
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
  },
  handleBar: {
    width: 3,
    height: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 1.5,
    marginVertical: 1,
  },
  playhead: {
    position: 'absolute',
    top: -8,
    bottom: -8,
    width: timelineTheme.playheadWidth,
    alignItems: 'center',
    zIndex: 20,
  },
  playheadHead: {
    width: 12,
    height: 12,
    backgroundColor: colors.playhead,
    borderRadius: 6,
    marginBottom: -4,
  },
  playheadLine: {
    width: timelineTheme.playheadWidth,
    flex: 1,
    backgroundColor: colors.playhead,
    shadowColor: colors.playhead,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  timeIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playControl: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  currentTimeText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  durationText: {
    color: colors.textMuted,
    fontSize: 13,
    fontVariant: ['tabular-nums'],
  },
});

export default Timeline;
