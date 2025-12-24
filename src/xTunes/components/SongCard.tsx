import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../theme';
import { Song } from '../types';
import { getImageColors } from '../utils/colorCache';
import { getCachedUrl } from '../utils/mediaCache';
import { useMusicStore } from '../store/musicStore';

interface SongCardProps {
  song: Song;
  onPress: () => void;
  isPlaying?: boolean;
}

export default function SongCard({ song, onPress, isPlaying }: SongCardProps) {
  const { setCurrentSong, setPlaylist, setSearchResults } = useMusicStore();

  const handlePress = async () => {
    try {
      // Cache media URL before playing
      const mediaUrl = song.media_url || song.encrypted_media_url;
      if (mediaUrl) {
        const cachedUrl = await getCachedUrl(mediaUrl);
        const songWithCachedUrl = { ...song, cached_media_url: cachedUrl };
        
        // Update song in store with cached URL
        const currentPlaylist = useMusicStore.getState().playlist;
        if (currentPlaylist.some(s => s.id === song.id)) {
          const updatedPlaylist = currentPlaylist.map(s => 
            s.id === song.id ? songWithCachedUrl : s
          );
          setPlaylist(updatedPlaylist);
        }
        
        const currentResults = useMusicStore.getState().searchResults;
        if (currentResults.some(s => s.id === song.id)) {
          const updatedResults = currentResults.map(s => 
            s.id === song.id ? songWithCachedUrl : s
          );
          setSearchResults(updatedResults);
        }
        
        // Update currentSong if it matches
        const current = useMusicStore.getState().currentSong;
        if (current?.id === song.id) {
          setCurrentSong(songWithCachedUrl);
        }
        
        // Call onPress with updated song
        onPress();
      } else {
        // No media URL, just call onPress
        onPress();
      }
    } catch (error) {
      console.error('Error caching media URL:', error);
      // Fallback: call onPress even if caching fails
      onPress();
    }

    // Fetch and cache colors on press (in background)
    if (song.image && !song.imageColors) {
      try {
        const colors = await getImageColors(song.image);
        const updatedSong = { ...song, imageColors: colors };
        
        // Update song in store
        const currentPlaylist = useMusicStore.getState().playlist;
        if (currentPlaylist.some(s => s.id === song.id)) {
          const updatedPlaylist = currentPlaylist.map(s => 
            s.id === song.id ? updatedSong : s
          );
          setPlaylist(updatedPlaylist);
        }
        
        const currentResults = useMusicStore.getState().searchResults;
        if (currentResults.some(s => s.id === song.id)) {
          const updatedResults = currentResults.map(s => 
            s.id === song.id ? updatedSong : s
          );
          setSearchResults(updatedResults);
        }
        
        // Update currentSong if it matches
        const current = useMusicStore.getState().currentSong;
        if (current?.id === song.id) {
          setCurrentSong(updatedSong);
        }
      } catch (error) {
        console.error('Error fetching colors:', error);
      }
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.7}>
      <FastImage
        source={{ uri: song.image }}
        style={styles.image}
        resizeMode={FastImage.resizeMode.cover}
      />
      <View style={styles.info}>
        <Text style={[styles.title, isPlaying && styles.activeText]} numberOfLines={1}>
          {song.song}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {song.singers}
        </Text>
      </View>
      <View style={styles.action}>
        {isPlaying ? (
           <MaterialCommunityIcons name="chart-bar" size={24} color={theme.colors.secondary} />
        ) : (
          <MaterialCommunityIcons name="play-circle-outline" size={28} color={theme.colors.primary} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.s,
    // backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.s,
    borderRadius: theme.borderRadius.m,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: theme.borderRadius.s,
  },
  info: {
    flex: 1,
    marginLeft: theme.spacing.m,
    justifyContent: 'center',
    marginRight: 4,
  },
  title: {
    ...theme.typography.body,
    fontWeight: '600',
  },
  activeText: {
    color: theme.colors.secondary,
  },
  artist: {
    ...theme.typography.small,
    marginTop: 2,
  },
  action: {
    padding: theme.spacing.xs,
  },
});
