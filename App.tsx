/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import GlobalMusicPlayer from './src/xTunes/components/GlobalMusicPlayer';
import { useEffect } from 'react';
import TrackPlayer from 'react-native-track-player';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    (async() => {
      await TrackPlayer.setupPlayer()
    })();
  }, []);
  return (
    <SafeAreaProvider>
      <KeyboardProvider>
        <GestureHandlerRootView>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          <AppNavigator />
          <GlobalMusicPlayer />
        </GestureHandlerRootView>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({});

export default App;
