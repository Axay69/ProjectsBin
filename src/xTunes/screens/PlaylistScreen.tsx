import React, { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { XTunesStackParamList } from '../navigation/XTunesNavigator';
import { useMusicStore } from '../store/musicStore';
import { theme } from '../theme';
import SongCard from '../components/SongCard';
import MiniPlayer from '../components/MiniPlayer';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Playlist } from '../types';
import LinearGradient from 'react-native-linear-gradient';

export default function PlaylistScreen() {
  const route = useRoute();
  const navigation = useNavigation<NativeStackNavigationProp<XTunesStackParamList>>();
  const { playlist: routePlaylist } = route.params as { playlist: Playlist };
  
  const { currentSong, playSong, setPlaylist } = useMusicStore();

  const songs = routePlaylist.songs || [];

  // Set playlist in store when screen loads so skip next/previous works
  useEffect(() => {
    if (songs.length > 0) {
      setPlaylist(songs);
    }
  }, [songs, setPlaylist]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <MaterialIcons name="keyboard-arrow-left" size={32} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {routePlaylist.listname || routePlaylist.title || 'Playlist'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {songs.length} {songs.length === 1 ? 'song' : 'songs'}
          </Text>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {songs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="queue-music" size={48} color={theme.colors.textSecondary} />
            <Text style={styles.emptyText}>No songs in this playlist</Text>
          </View>
        ) : (
          <View style={styles.songsContainer}>
            {songs.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                onPress={() => playSong(song)}
                isPlaying={currentSong?.id === song.id}
              />
            ))}
          </View>
        )}
      </ScrollView>
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 120,
        }}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <MiniPlayer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.m,
    paddingTop: theme.spacing.s,
    paddingBottom: theme.spacing.m,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  songsContainer: {
    paddingHorizontal: theme.spacing.m,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: theme.spacing.m,
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
});

