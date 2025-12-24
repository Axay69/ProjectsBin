import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import SongScreen from '../screens/SongScreen';
import PlaylistScreen from '../screens/PlaylistScreen';
import { Song, Playlist } from '../types';
import SystemNavigationBar from 'react-native-system-navigation-bar';

export type XTunesStackParamList = {
  XTHome: undefined;
  SongScreen: { song: Song };
  PlaylistScreen: { playlist: Playlist };
};

const Stack = createNativeStackNavigator<XTunesStackParamList>();

export default function XTunesNavigator() {
  useEffect(() => {
    SystemNavigationBar.setNavigationColor('#000');
  }, []);

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      <Stack.Screen name="XTHome" component={HomeScreen} />
      <Stack.Screen name="PlaylistScreen" component={PlaylistScreen} />
      <Stack.Screen
        name="SongScreen"
        component={SongScreen}
        options={{
          animation: 'slide_from_bottom',
          
        }}
      />
    </Stack.Navigator>
  );
}
