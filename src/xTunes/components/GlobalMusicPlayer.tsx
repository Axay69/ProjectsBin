import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import TrackPlayer, { Event, useTrackPlayerEvents, useProgress, State } from 'react-native-track-player';
import { useMusicStore } from '../store/musicStore';

const GlobalMusicPlayer = () => {
  const { currentSong, isPlaying, updateProgress, skipToNext, setIsPlaying } = useMusicStore();
  const isSyncingRef = useRef(false); // Prevent circular updates

  // Progress updates (throttled by hook interval) - get this first to use in other handlers
  const progress = useProgress(0.5); // ~500ms

  // Keep TrackPlayer play/pause in sync with store flag (when changed from UI)
  useEffect(() => {
    if (isSyncingRef.current) return; // Skip if syncing from TrackPlayer events
    
    (async () => {
      try {
        const state = await TrackPlayer.getPlaybackState();
        const shouldBePlaying = isPlaying;
        // State.Playing is a number, compare with state directly
        const isCurrentlyPlaying = state === (State.Playing as any);

        // Only update TrackPlayer if state doesn't match
        if (shouldBePlaying && !isCurrentlyPlaying) {
          await TrackPlayer.play();
        } else if (!shouldBePlaying && isCurrentlyPlaying) {
          await TrackPlayer.pause();
        }
      } catch (e) {
        console.log('GlobalMusicPlayer play/pause sync error:', e);
      }
    })();
  }, [isPlaying]);

  // Listen to playback state changes from notification controls
  useTrackPlayerEvents([Event.PlaybackState], async (event) => {
    if (isSyncingRef.current) return;
    
    try {
      isSyncingRef.current = true;
      const state = event.state;
      
      // Compare state values directly
      if (state === (State.Playing as any)) {
        setIsPlaying(true);
      } else if (state === (State.Paused as any) || state === (State.Ready as any)) {
        setIsPlaying(false);
      }
    } catch (e) {
      console.log('PlaybackState event error:', e);
    } finally {
      // Reset flag after a short delay to allow state to settle
      setTimeout(() => {
        isSyncingRef.current = false;
      }, 100);
    }
  });

  // Listen to play/pause button events from notification
  useTrackPlayerEvents([Event.RemotePlay], async () => {
    try {
      console.log('Remote play event called');
      
      // Get current state after remote play/pause
      const state = await TrackPlayer.getPlaybackState();
      const isCurrentlyPlaying = state === (State.Playing as any);
      setIsPlaying(isCurrentlyPlaying);
    } catch (e) {
      console.log('Remote play event error:', e);
    }
  });

  useTrackPlayerEvents([Event.RemotePause], async () => {
    try {
      console.log('Remote pause event called');
    } catch (e) {
      console.log('Remote pause event error:', e);
    }
  });

  // Update progress from useProgress hook
  useEffect(() => {
    if (!currentSong) return;
    updateProgress(progress.position, progress.duration || 0);
  }, [progress.position, progress.duration, currentSong, updateProgress]);

  // Queue end → skipToNext
  useTrackPlayerEvents([Event.PlaybackQueueEnded], async (event) => {
    if (event.position > 0) {
      skipToNext();
    }
  });

  // Listen to remote seek events (from notification controls)
  useTrackPlayerEvents([Event.RemoteSeek], async (event) => {
    try {
      console.log('Remote seek event:', event);
      
      const position = event.position;
      updateProgress(position, progress.duration || 0);
    } catch (e) {
      console.log('Remote seek event error:', e);
    }
  });

  return <View style={styles.container} />;
};

const styles = StyleSheet.create({
  container: {
    width: 0,
    height: 0,
    position: 'absolute',
  },
});

export default GlobalMusicPlayer;
