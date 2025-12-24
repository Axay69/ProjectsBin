import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FastImage from 'react-native-fast-image';
import { XTunesStackParamList } from '../navigation/XTunesNavigator';
import { useMusicStore } from '../store/musicStore';

export default function MiniPlayer() {
  const navigation = useNavigation<NativeStackNavigationProp<XTunesStackParamList>>();
  const { currentSong, isPlaying, togglePlay, progress, duration } = useMusicStore();

  if (!currentSong) return null;

  const progressPercent =
    duration > 0 ? Math.min(100, Math.max(0, (progress / duration) * 100)) : 0;

  const handleNavigateToSong = () => {
    // Now MiniPlayer is rendered inside screens (HomeScreen/PlaylistScreen),
    // so useNavigation() will return the XTunesStack navigation
    navigation.navigate('SongScreen', { song: currentSong });
  };

  return (
    <View style={styles.miniPlayer}>
     
      <TouchableOpacity 
        style={styles.miniPlayerContent}
        onPress={handleNavigateToSong}
        activeOpacity={0.9}
      >
        <FastImage 
          source={{ uri: currentSong.image }}
          style={styles.miniPlayerImage}
        />
         {/* Top progress indicator */}
         <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progressPercent}%`, borderRadius: 6 }]} />
      </View>
        <View style={styles.miniPlayerInfo}>
          <Text style={styles.miniPlayerTitle} numberOfLines={1}>{currentSong.song}</Text>
          <Text style={styles.miniPlayerArtist} numberOfLines={1}>{currentSong.primary_artists}</Text>
        </View>
        <TouchableOpacity 
          style={styles.miniPlayerAction}
          onPress={() => togglePlay()}
          activeOpacity={0.8}
        >
          <MaterialIcons name={isPlaying ? "pause" : "play-arrow"} size={28} color="#FFF" />
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  miniPlayer: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 1000,
    overflow: 'hidden',
  },
  progressTrack: {
    position: 'absolute',
    top: 0,
    left: 6,
    right: 6,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    zIndex: 1000,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF91',
  },
  miniPlayerContent: {
    overflow: 'hidden',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  miniPlayerImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#333',
  },
  miniPlayerInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  miniPlayerTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  miniPlayerArtist: {
    color: '#999',
    fontSize: 12,
    marginTop: 2,
  },
  miniPlayerAction: {
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

