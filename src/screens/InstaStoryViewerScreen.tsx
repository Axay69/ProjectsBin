import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
  StatusBar,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Video from 'react-native-video';
import { useEffect, useRef, useState } from 'react';
import ImmersiveMode from 'react-native-immersive-mode';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  GestureHandlerRootView,
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import RNFetchBlob from 'rn-fetch-blob';

type StoryItem = { type: 'image' | 'video'; uri: string };

type RootStackParamList = {
  InstaStoryViewer: { items: StoryItem[] };
};

type Props = NativeStackScreenProps<RootStackParamList, 'InstaStoryViewer'>;

export default function InstaStoryViewerScreen({ route, navigation }: Props) {
  const { items } = route.params;
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [videoDurationMs, setVideoDurationMs] = useState<number>(0);
  const [videoCache, setVideoCache] = useState<Record<string, string>>({});
  const videoRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);
  const preloadingRef = useRef<Set<string>>(new Set());
  const { width } = Dimensions.get('window');

  useEffect(() => {
    if (Platform.OS === 'android') {
      ImmersiveMode.fullLayout(true);
      ImmersiveMode.setBarMode('FullSticky');
    }
    return () => {
      if (Platform.OS === 'android') {
        ImmersiveMode.setBarMode('Normal');
        ImmersiveMode.fullLayout(false);
      }
    };
  }, []);

  const next = () => {
    setIndex(i => Math.min(i + 1, items.length - 1));
  };

  const prev = () => {
    setIndex(i => Math.max(i - 1, 0));
  };

  const current = items[index];
  const durationMs =
    current.type === 'image' ? 10000 : Math.min(videoDurationMs || 0, 60000);

  const resolveUri = (item: StoryItem) => {
    if (item.type === 'video') {
      const cached = videoCache[item.uri];
      if (cached) return cached;
      return item.uri;
    }
    return item.uri;
  };

  const cacheVideo = async (uri: string) => {
    if (videoCache[uri] || preloadingRef.current.has(uri)) return;
    preloadingRef.current.add(uri);
    try {
      const extGuess = (() => {
        const clean = uri.split('?')[0];
        const parts = clean.split('.');
        const ext = parts[parts.length - 1];
        if (!ext || ext.length > 5) return 'mp4';
        return ext;
      })();
      const res = await RNFetchBlob.config({
        fileCache: true,
        appendExt: extGuess,
      }).fetch('GET', uri);
      const path = res.path();
      const local = path.startsWith('file://') ? path : `file://${path}`;
      setVideoCache(prev => ({ ...prev, [uri]: local }));
    } catch {
    } finally {
      preloadingRef.current.delete(uri);
    }
  };

  const preloadAround = (center: number) => {
    const ahead = items.slice(center + 1, center + 3);
    const images = ahead
      .filter(i => i.type === 'image')
      .map(i => ({ uri: i.uri }));
    if (images.length) FastImage.preload(images);
    ahead.filter(i => i.type === 'video').forEach(i => cacheVideo(i.uri));
  };

  useEffect(() => {
    setProgress(0);
    setPlaying(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (current.type === 'image') {
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        const p = Math.min(elapsed / durationMs, 1);
        setProgress(p);
        if (p >= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          next();
        }
      }, 100);
    }
    preloadAround(index);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [index, current.type]);

  useEffect(() => {
    if (current.type === 'image') {
      if (playing) {
        startTimeRef.current = Date.now() - progress * durationMs;
        if (!timerRef.current) {
          timerRef.current = setInterval(() => {
            const elapsed = Date.now() - startTimeRef.current;
            const p = Math.min(elapsed / durationMs, 1);
            setProgress(p);
            if (p >= 1) {
              clearInterval(timerRef.current);
              timerRef.current = null;
              next();
            }
          }, 100);
        }
      } else {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    }
  }, [playing]);

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.goBack()} style={[styles.closeIconBtn, { backgroundColor: '#111827' }]}> 
        <Text style={[styles.closeIconText, { color: '#fff' }]}>X</Text>
      </TouchableOpacity> */}

      <View style={styles.content}>
        {current.type === 'image' ? (
          <FastImage
            source={{ uri: resolveUri(current) }}
            style={styles.media}
            resizeMode={FastImage.resizeMode.contain}
          />
        ) : (
          <Video
            ref={videoRef}
            source={{ uri: resolveUri(current) }}
            style={styles.media}
            paused={!playing}
            controls={false}
            resizeMode="contain"
            onLoad={data =>
              setVideoDurationMs(Math.min(data.duration * 1000, 60000))
            }
            onProgress={data => {
              const d =
                durationMs ||
                Math.min(
                  (data.seekableDuration || data.playableDuration || 0) * 1000,
                  60000,
                );
              const c = data.currentTime * 1000;
              setProgress(Math.min(c / (d || 1), 1));
              if (c >= (d || 0)) next();
            }}
            onEnd={next}
          />
        )}
      </View>

      <View style={styles.progressRow}>
        {items.map((_, i) => {
          const p = i < index ? 1 : i === index ? progress : 0;
          return (
            <View key={i} style={styles.progressSegment}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.max(0, Math.min(1, p)) * 100}%` },
                ]}
              />
            </View>
          );
        })}
      </View>

      {(() => {
        const tap = Gesture.Tap().onEnd(e => {
          if (e.x < width / 2) runOnJS(prev)();
          else runOnJS(next)();
        });
        const longPress = Gesture.LongPress()
          .minDuration(300)
          .onStart(() => runOnJS(setPlaying)(false))
          .onEnd(() => runOnJS(setPlaying)(true));
        tap.requireExternalGestureToFail(longPress);
        const pan = Gesture.Pan().onEnd(e => {
          if (e.translationY > 100) runOnJS(navigation.goBack)();
        });
        const composed = Gesture.Simultaneous(pan, longPress, tap);
        return (
          <GestureDetector gesture={composed}>
            <View style={styles.gestureLayer} />
          </GestureDetector>
        );
      })()}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  media: { width: '100%', height: '100%' },
  closeIconBtn: {
    position: 'absolute',
    top: StatusBar.currentHeight || 0,
    right: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  closeIconText: { fontSize: 22, fontWeight: '700' },
  progressRow: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    gap: 6,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#ffffff' },
  gestureLayer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
});
