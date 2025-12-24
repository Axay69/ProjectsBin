import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CustomSlider from '../xTunes/components/CustomSlider';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CustomSliderDemoScreen() {
  const navigation = useNavigation();
  const [progress, setProgress] = useState(0);
  const [min] = useState(0);
  const [max, setMax] = useState(20000);
  const [maxInput, setMaxInput] = useState('20000');
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Auto-play interval effect
  useEffect(() => {
    if (isAutoPlaying) {
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          const next = prev + 500;
          if (next >= max) {
            setIsAutoPlaying(false);
            return max;
          }
          return next;
        });
      }, 500);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoPlaying, max]);

  const handleMaxChange = (text: string) => {
    setMaxInput(text);
    const numValue = parseInt(text, 10);
    if (!isNaN(numValue) && numValue > 0) {
      setMax(numValue);
      // Reset progress if it exceeds new max
      if (progress > numValue) {
        setProgress(numValue);
      }
    }
  };

  const handleStart = () => {
    setIsAutoPlaying(true);
  };

  const handleStop = () => {
    setIsAutoPlaying(false);
  };

  const handleReset = () => {
    setIsAutoPlaying(false);
    setProgress(0);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Custom Slider Demo</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Native Custom Slider</Text>
          <Text style={styles.description}>
            This is a custom native slider built with JSI and Android native
            components. It provides smooth, performant slider interactions.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuration</Text>
          <View style={styles.configRow}>
            <Text style={styles.configLabel}>Max Duration (ms):</Text>
            <TextInput
              style={styles.configInput}
              value={maxInput}
              onChangeText={handleMaxChange}
              keyboardType="numeric"
              placeholder="Enter max value"
            />
          </View>
          <Text style={styles.configHint}>
            Current max: {max.toLocaleString()} ms ({formatTime(max)})
          </Text>
        </View>

        <View style={styles.sliderContainer}>
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatTime(progress)}</Text>
            <View style={styles.sliderWrapper}>
              <CustomSlider
                style={styles.slider}
                min={min}
                max={max}
                progress={progress}
                minimumTrackTintColor="#007AFF"
                maximumTrackTintColor="rgba(0,122,255,0.3)"
                thumbTintColor="#007AFF"
                onStart={() => {
                  console.log('[Demo] Slider started');
                }}
                onUpdate={(value) => {
                  console.log('[Demo] Slider updating:', value);
                  setProgress(value);
                }}
                onEnd={(value) => {
                  console.log('[Demo] Slider ended:', value);
                  setProgress(value);
                }}
              />
            </View>
            <Text style={styles.timeText}>{formatTime(max)}</Text>
          </View>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Current Progress:</Text>
            <Text style={styles.infoValue}>{progress} ms</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Min:</Text>
            <Text style={styles.infoValue}>{min} ms</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Max:</Text>
            <Text style={styles.infoValue}>{max} ms</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Progress %:</Text>
            <Text style={styles.infoValue}>
              {max > 0 ? ((progress / max) * 100).toFixed(1) : 0}%
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Programmatic Controls</Text>
          <View style={styles.buttonRow}>
            {!isAutoPlaying ? (
              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary]}
                onPress={handleStart}
              >
                <MaterialIcons name="play-arrow" size={20} color="#FFF" />
                <Text style={styles.buttonText}>Start Auto-Play</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.button, styles.buttonStop]}
                onPress={handleStop}
              >
                <MaterialIcons name="stop" size={20} color="#FFF" />
                <Text style={styles.buttonText}>Stop</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={handleReset}
            >
              <MaterialIcons name="refresh" size={20} color="#FFF" />
              <Text style={styles.buttonText}>Reset</Text>
            </TouchableOpacity>
          </View>
          {isAutoPlaying && (
            <Text style={styles.autoPlayStatus}>
              Auto-playing: +500ms every 500ms
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Jump Controls</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={() => setProgress(0)}
            >
              <Text style={styles.buttonText}>0%</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={() => setProgress(Math.floor(max / 4))}
            >
              <Text style={styles.buttonText}>25%</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={() => setProgress(Math.floor(max / 2))}
            >
              <Text style={styles.buttonText}>50%</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={() => setProgress(Math.floor(max * 0.75))}
            >
              <Text style={styles.buttonText}>75%</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={() => setProgress(max)}
            >
              <Text style={styles.buttonText}>100%</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featureList}>
            <Text style={styles.featureItem}>✓ Native Android SeekBar</Text>
            <Text style={styles.featureItem}>✓ Smooth touch interactions</Text>
            <Text style={styles.featureItem}>✓ Customizable colors</Text>
            <Text style={styles.featureItem}>✓ onStart, onUpdate, onEnd callbacks</Text>
            <Text style={styles.featureItem}>✓ Progress updates in milliseconds</Text>
            <Text style={styles.featureItem}>✓ Prevents override during user interaction</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  sliderContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  timeText: {
    fontSize: 14,
    color: '#666',
    fontVariant: ['tabular-nums'],
    minWidth: 50,
    textAlign: 'center',
  },
  sliderWrapper: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
  },
  slider: {
    flex: 1,
  },
  infoContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  button: {
    flex: 1,
    minWidth: 100,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  buttonPrimary: {
    backgroundColor: '#34C759',
  },
  buttonStop: {
    backgroundColor: '#FF3B30',
  },
  buttonSecondary: {
    backgroundColor: '#007AFF',
    flex: 0,
    minWidth: 60,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  configRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  configLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    minWidth: 140,
  },
  configInput: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#000',
  },
  configHint: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 4,
  },
  autoPlayStatus: {
    marginTop: 12,
    fontSize: 14,
    color: '#34C759',
    fontWeight: '600',
    textAlign: 'center',
  },
  featureList: {
    gap: 8,
  },
  featureItem: {
    fontSize: 14,
    color: '#333',
    lineHeight: 24,
  },
});

