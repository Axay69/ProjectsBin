import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  NativeModules,
  NativeEventEmitter,
  Platform,
  TouchableOpacity,
  Alert,
  DeviceEventEmitter,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Video from 'react-native-video';

const { PipModule } = NativeModules;

export default function PipDemoScreen() {
  const [isPip, setIsPip] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [paused, setPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef<Video>(null);

  useEffect(() => {
    if (Platform.OS === 'android') {
      checkSupport();
      checkPipStatus();
      try { PipModule.initMediaSession(); } catch {}

      const stateSub = DeviceEventEmitter.addListener('onPipStateChange', (event) => {
        console.log('PiP State Changed:', event);
        setIsPip(event.isInPip);
      });

      const controlSub = DeviceEventEmitter.addListener('pipControl', (event: { action: string }) => {
        const action = event?.action;
        if (!action) return;
        if (action === 'prev10') {
          const seekTo = Math.max(0, currentTime - 10);
          videoRef.current?.seek(seekTo);
        } else if (action === 'next10') {
          const seekTo = Math.max(0, currentTime + 10);
          videoRef.current?.seek(seekTo);
        } else if (action === 'togglePlayPause') {
          const nextPaused = !paused;
          setPaused(nextPaused);
          try { PipModule.updatePipControls(!nextPaused); } catch {}
        }
      });

      return () => {
        stateSub.remove();
        controlSub.remove();
      };
    }
  }, []);

  const checkSupport = async () => {
    try {
      const supported = await PipModule.isPipSupported();
      setIsSupported(supported);
    } catch (e) {
      console.error(e);
    }
  };

  const checkPipStatus = async () => {
    try {
      const status = await PipModule.isInPipMode();
      setIsPip(status);
    } catch (e) {
      console.error(e);
    }
  };

  const enterPip = async () => {
    try {
      // Enter PiP with 16:9 aspect ratio (16, 9)
      // or 1:1 (1, 1)
      await PipModule.enterPip(16, 9);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const videoElement = (
    <Video
      ref={videoRef as any}
      source={{ uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' }}
      style={isPip ? styles.fullScreenVideo : styles.video}
      resizeMode="contain"
      controls={!isPip}
      repeat
      paused={paused}
      onProgress={(p) => {
        setCurrentTime(p.currentTime);
        try { PipModule.updatePlaybackState(!paused, p.currentTime * 1000); } catch {}
      }}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.videoContainer}>{videoElement}</View>

      <View style={styles.controls}>
        <Text style={styles.title}>Picture-in-Picture Demo</Text>
        <Text style={styles.status}>
          PiP Supported: {isSupported ? 'Yes' : 'No'}
        </Text>
        
        <TouchableOpacity
          style={[styles.button, !isSupported && styles.disabledButton]}
          onPress={enterPip}
          disabled={!isSupported}
        >
          <Text style={styles.buttonText}>Enter PiP Mode</Text>
        </TouchableOpacity>

        <Text style={styles.desc}>
          Pressing the Home button or switching apps might also trigger PiP if configured in AndroidManifest (auto-enter).
          Currently, we use manual entry.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  pipContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  fullScreenVideo: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  controls: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  status: {
    fontSize: 16,
    marginBottom: 20,
    color: '#666',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  desc: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
  },
});
