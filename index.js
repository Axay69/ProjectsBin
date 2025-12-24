/**
 * @format
 */

import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import TrackPlayer from 'react-native-track-player';
import playbackService from './src/xTunes/services/playbackService';


AppRegistry.registerComponent(appName, () => App);

// Register playback service
// TrackPlayer.registerPlaybackService expects a function that returns the service function
TrackPlayer.registerPlaybackService(() => {
  // Handle both direct function import and default export
  if (typeof playbackService === 'function') {
    return playbackService;
  }
  // Fallback for cases where import returns an object
  return playbackService?.default || playbackService;
});
