import React from 'react';
import { requireNativeComponent, Platform, View, ViewStyle, ColorValue, NativeSyntheticEvent } from 'react-native';

interface CustomSliderProps {
  style?: ViewStyle;
  min?: number;
  max?: number;
  progress?: number; // in ms
  thumbSize?: number; // in dp
  minimumTrackTintColor?: ColorValue;
  maximumTrackTintColor?: ColorValue;
  thumbTintColor?: ColorValue;
  onStart?: () => void;
  onUpdate?: (value: number) => void;
  onEnd?: (value: number) => void;
  onSlideStart?: (event: NativeSyntheticEvent<any>) => void;
  onSlideEnd?: (event: NativeSyntheticEvent<any>) => void;
  onSliderChange?: (event: NativeSyntheticEvent<any>) => void;
}

const NativeCustomSlider = Platform.OS === 'android' 
  ? requireNativeComponent<CustomSliderProps>('CustomSlider') 
  : View;

const CustomSlider = ({
  style,
  min = 0,
  max = 1000,
  progress = 0,
  thumbSize,
  minimumTrackTintColor = '#FFFFFF',
  maximumTrackTintColor = 'rgba(255,255,255,0.3)',
  thumbTintColor = '#FFFFFF',
  onStart,
  onUpdate,
  onEnd,
}: CustomSliderProps) => {
  const handleSliderChange = (event: NativeSyntheticEvent<any>) => {
    if (onUpdate && event.nativeEvent?.value !== undefined) {
      const value = event.nativeEvent.value;
      onUpdate(value);
    }
  };

  const handleSlideStart = (event: NativeSyntheticEvent<any>) => {
    onStart?.();
  };

  const handleSlideEnd = (event: NativeSyntheticEvent<any>) => {
    if (onEnd && event.nativeEvent?.value !== undefined) {
      const value = event.nativeEvent.value;
      onEnd(value);
    }
  };

  return (
    <NativeCustomSlider
      style={style}
      min={min}
      max={max}
      progress={progress}
      thumbSize={thumbSize}
      minimumTrackTintColor={minimumTrackTintColor}
      maximumTrackTintColor={maximumTrackTintColor}
      thumbTintColor={thumbTintColor}
      onSlideStart={handleSlideStart}
      onSliderChange={handleSliderChange}
      onSlideEnd={handleSlideEnd}
    />
  );
};

CustomSlider.displayName = 'CustomSlider';

export default CustomSlider;

