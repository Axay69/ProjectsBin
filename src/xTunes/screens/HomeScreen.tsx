import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { XTunesStackParamList } from '../navigation/XTunesNavigator';
import { useMusicStore } from '../store/musicStore';
import { DEFAULT_PLAYLISTS, TRENDING_PLAYLISTS, getPlaylist, searchSongs } from '../services/api';
import { theme } from '../theme';
import PlaylistCard from '../components/PlaylistCard';
import SongCard from '../components/SongCard';
import SearchBar from '../components/SearchBar';
import MiniPlayer from '../components/MiniPlayer';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<XTunesStackParamList>>();
  const {
    currentSong,
    searchResults,
    playlist,
    featuredPlaylists,
    playSong,
    setSearchResults,
    setIsLoading,
    isLoading,
    setPlaylist,
    setFeaturedPlaylists,
    setTrendingPlaylists,
  } = useMusicStore();
  
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Load initial data (Fetch all default playlists)
  useEffect(() => {
    const loadInitialData = async () => {
      // Only show loading if we don't have data yet
      if (featuredPlaylists.length === 0) {
        setIsLoading(true);
      }
      
      try {
        const defaultPromises = DEFAULT_PLAYLISTS.map(url => getPlaylist(url));
        const trendingPromises = TRENDING_PLAYLISTS.map(url => getPlaylist(url));

        console.log('Fetching playlists...');
        
        const [defaultResults, trendingResults] = await Promise.all([
          Promise.all(defaultPromises),
          Promise.all(trendingPromises)
        ]);

        const validDefault = defaultResults.filter(pl => pl !== null);
        const validTrending = trendingResults.filter(pl => pl !== null);

        setFeaturedPlaylists(validDefault);
        setTrendingPlaylists(validTrending);
        
        // Set the first trending playlist as the default "Trending" list
        if (validTrending.length > 0 && validTrending[0].songs) {
            setPlaylist(validTrending[0].songs);
        } else if (validDefault.length > 0 && validDefault[0].songs) {
            setPlaylist(validDefault[0].songs);
        }
      } catch (error) {
        console.error("Failed to load playlists", error);
      }
      setIsLoading(false);
    };
    
    // Always refresh on mount, but data from store shows immediately
    loadInitialData();
  }, []);

  // Clear search results when query is cleared
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [query]);

  const handleSearch = async () => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchSongs(trimmedQuery);
      setSearchResults(results || []); 
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const renderContent = () => {
    // Initial loading state (when app first loads)
    if (isLoading && featuredPlaylists.length === 0 && searchResults.length === 0 && !query.trim()) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      );
    }

    // Search mode - show search results or loading/empty states
    if (query.trim().length > 0) {
      if (isSearching) {
        return (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        );
      }

      if (searchResults.length === 0) {
        return (
          <View style={styles.center}>
            <MaterialIcons name="search-off" size={48} color={theme.colors.textSecondary} />
            <Text style={styles.emptyText}>No results found</Text>
            <Text style={styles.emptySubtext}>Try searching for a different song</Text>
          </View>
        );
      }

      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Results ({searchResults.length})
          </Text>
          {searchResults.map((song) => (
            <SongCard
              key={song.id}
              song={song}
              onPress={() => {
                playSong(song);
                // navigation.navigate('SongScreen', { song });
              }}
              isPlaying={currentSong?.id === song.id}
            />
          ))}
        </View>
      );
    }

    return (
      <>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Playlists</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.playlistScroll}>
            {featuredPlaylists.map((pl) => (
              <PlaylistCard
                key={pl.listid}
                title={pl.listname}
                subtitle={pl.firstname || (pl.subtitle_desc ? pl.subtitle_desc.join(' • ') : '')}
                image={pl.image}
                onPress={() => {
                  navigation.navigate('PlaylistScreen', { playlist: pl });
                }}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trending</Text>
          {playlist.map((song) => (
            <SongCard
              key={song.id}
              song={song}
              onPress={() => {
                playSong(song);
                // togglePlay();
              }}
              isPlaying={currentSong?.id === song.id}
            />
          ))}
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView contentContainerStyle={{ flex: 1 }}
      keyboardShouldPersistTaps="always"
      showsVerticalScrollIndicator={false}
      // extraKeyboardSpace={20}

      >

      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      
      <View style={styles.header}>
        <Text style={styles.appTitle}>xTunes</Text>
      </View>
      
      <View style={styles.padding}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          onSubmit={handleSearch}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {renderContent()}
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
      </KeyboardAwareScrollView>
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
    paddingHorizontal: theme.spacing.m,
    paddingTop: theme.spacing.m,
    marginBottom: theme.spacing.s,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -1,
  },
  padding: {
    paddingHorizontal: theme.spacing.m,
    marginBottom: theme.spacing.m,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    marginBottom: theme.spacing.l,
    paddingHorizontal: theme.spacing.m,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.m,
    letterSpacing: 0.5,
  },
  playlistScroll: {
    paddingRight: theme.spacing.m,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 300,
    paddingVertical: theme.spacing.xl,
  },
  loadingText: {
    marginTop: theme.spacing.m,
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  emptyText: {
    marginTop: theme.spacing.m,
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtext: {
    marginTop: theme.spacing.s,
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
});
