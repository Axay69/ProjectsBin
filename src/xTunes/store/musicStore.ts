import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createMMKV } from 'react-native-mmkv';
import { Song, Playlist } from '../types';
import TrackPlayer from 'react-native-track-player';

export const storage = createMMKV({ id: 'xtunes-storage' });

const zustandStorage = {
  setItem: (name: string, value: string) => {
    return storage.set(name, value);
  },
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: (name: string) => {
    return (storage as any).delete(name);
  },
};

interface MusicState {
  currentSong: Song | null;
  playlist: Song[];
  isPlaying: boolean;
  searchQuery: string;
  searchResults: Song[];
  featuredPlaylists: Playlist[];
  trendingPlaylists: Playlist[];
  isLoading: boolean;
  
  // Player Progress
  progress: number; // in seconds
  duration: number; // in seconds

  setCurrentSong: (song: Song) => void;
  setPlaylist: (songs: Song[]) => void;
  setFeaturedPlaylists: (playlists: Playlist[]) => void;
  setTrendingPlaylists: (playlists: Playlist[]) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: Song[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  
  // Playback Actions
  playSong: (song: Song) => void;
  togglePlay: () => void;
  skipToNext: () => void;
  skipToPrevious: () => void;
  
  // Progress Actions (called by the player component)
  updateProgress: (progress: number, duration: number) => void;
  seekTo: (position: number) => void; // Just a signal to the player? Or we update state and player reacts?
  
  // We'll use a specific "seekTarget" state to signal the player (GlobalMusicPlayer) to seek
  seekTarget: number | null;
  setSeekTarget: (time: number | null) => void;
}

export const useMusicStore = create<MusicState>()(
  persist(
    (set, get) => {
      return {
        currentSong: null,
        playlist: [],
        isPlaying: false,
        searchQuery: '',
        searchResults: [],
        featuredPlaylists: [],
        trendingPlaylists: [],
        isLoading: false,
        
        progress: 0,
        duration: 0,
        seekTarget: null,

        setCurrentSong: (song) => set({ currentSong: song }),
        setPlaylist: (songs) => set({ playlist: songs }),
        setFeaturedPlaylists: (playlists) => set({ featuredPlaylists: playlists }),
        setTrendingPlaylists: (playlists) => set({ trendingPlaylists: playlists }),
        setIsPlaying: (isPlaying) => set({ isPlaying }),
        setSearchQuery: (query) => set({ searchQuery: query }),
        setSearchResults: (results) => set({ searchResults: results }),
        setIsLoading: (isLoading) => set({ isLoading }),
        
        updateProgress: (progress, duration) => set({ progress, duration }),
        setSeekTarget: (time) => set({ seekTarget: time }),

        seekTo: async (position) => {
          try {
            await TrackPlayer.seekTo(position);
          } catch (e) {
            console.log('seekTo TrackPlayer error:', e);
          }
          set({ progress: position });
        },

        playSong: async (song) => {
          try {
            // Check if we have a cached version of this song in the store
            let songToPlay = song;
            const playlist = get().playlist;
            const searchResults = get().searchResults;
            
            // Look for cached version in playlist
            const cachedInPlaylist = playlist.find(s => s.id === song.id);
            if (cachedInPlaylist?.cached_media_url) {
              songToPlay = cachedInPlaylist;
            } else {
              // Look for cached version in search results
              const cachedInResults = searchResults.find(s => s.id === song.id);
              if (cachedInResults?.cached_media_url) {
                songToPlay = cachedInResults;
              }
            }
            
            // Use cached URL if available, otherwise fall back to original URLs
            const mediaUrl = songToPlay.cached_media_url || songToPlay.media_url || songToPlay.encrypted_media_url;

            await TrackPlayer.reset();
            await TrackPlayer.add({
              id: songToPlay.id,
              url: mediaUrl,
              title: songToPlay.song,
              artist: songToPlay.primary_artists,
              artwork: songToPlay.image,
            });
            await TrackPlayer.play();

            set({ currentSong: songToPlay, isPlaying: true, progress: 0, duration: 0 });
          } catch (e) {
            console.log('playSong TrackPlayer error:', e);
          }
        },

        togglePlay: async () => {
          const { isPlaying } = get();
          try {
            if (isPlaying) {
              await TrackPlayer.pause();
            } else {
              await TrackPlayer.play();
            }
          } catch (e) {
            console.log('togglePlay TrackPlayer error:', e);
          }
          set({ isPlaying: !isPlaying });
        },

        skipToNext: async () => {
          const { currentSong, playlist, isPlaying } = get();
          if (!currentSong || playlist.length === 0) return;

          const currentIndex = playlist.findIndex(s => s.id === currentSong.id);
          if (currentIndex === -1) return;

          const nextIndex = (currentIndex + 1) % playlist.length;
          const nextSong = playlist[nextIndex];
          await get().playSong(nextSong);
          set({ progress: 0, isPlaying: true });
        },

        skipToPrevious: async () => {
          const { currentSong, playlist, isPlaying } = get();
          if (!currentSong || playlist.length === 0) return;

          const currentIndex = playlist.findIndex(s => s.id === currentSong.id);
          if (currentIndex === -1) return;

          const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
          const prevSong = playlist[prevIndex];
          await get().playSong(prevSong);
          set({ progress: 0, isPlaying: true });
        },
      };
    },
    {
      name: 'music-storage',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        // Only persist these fields
        playlist: state.playlist,
        featuredPlaylists: state.featuredPlaylists,
        trendingPlaylists: state.trendingPlaylists,
        currentSong: state.currentSong,
        // Don't persist playing state or progress
      }),
    }
  )
);
