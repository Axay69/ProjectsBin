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
import { Provider as JotaiProvider } from 'jotai';

import { UnistylesRuntime } from 'react-native-unistyles';
import { storage, THEME_KEY } from './src/styles/storage';
import { Appearance } from 'react-native';
import RNBootSplash from 'react-native-bootsplash';

function App() {
  useEffect(() => {
    // Hide bootsplash after app is ready
    RNBootSplash.hide({ fade: true });

    // 1. Initial restoration
    const savedTheme = storage.getString(THEME_KEY);

    if (savedTheme) {
      UnistylesRuntime.setTheme(savedTheme as any);
    } else {
      // Manual "Auto" mode: follow system
      const systemTheme = Appearance.getColorScheme();
      UnistylesRuntime.setTheme(systemTheme === 'dark' ? 'systemDark' : 'systemLight');
    }

    // 2. Appearance listener (for when no theme is locked)
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      const isLocked = storage.contains(THEME_KEY);
      if (!isLocked) {
        UnistylesRuntime.setTheme(colorScheme === 'dark' ? 'systemDark' : 'systemLight');
      }
    });

    (async () => {
      await TrackPlayer.setupPlayer()
    })();

    return () => subscription.remove();
  }, []);

  return (
    <SafeAreaProvider>
      <JotaiProvider>
        <KeyboardProvider>
          <GestureHandlerRootView>
            {/* Note: In a real app, you'd use Unistyles for the status bar color too, 
                but for now we'll keep it simple or use system defaults */}
            <AppNavigator />
            <GlobalMusicPlayer />
          </GestureHandlerRootView>
        </KeyboardProvider>
      </JotaiProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({});

export default App;
