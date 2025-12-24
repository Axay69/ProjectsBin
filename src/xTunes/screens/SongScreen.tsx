import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Platform,
  ActivityIndicator,
  BackHandler,
  ScrollView,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import FastImage from 'react-native-fast-image';
import { useMusicStore } from '../store/musicStore';
import { getImageColors } from '../utils/colorCache';
import CustomSlider from '../components/CustomSlider';
import { Song } from '../types';
import { useProgress } from 'react-native-track-player';
import { getLyrics } from '../services/api';

const { width } = Dimensions.get('window');

export default function SongScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { song: paramSong } = route.params as { song: Song };

  const isSlidingRef = useRef(false);
  const isInitialMountRef = useRef(false);
  const [temp, setTemp] = useState<number | null>(null);
  const setTempTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Modal visibility states
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showLyricsModal, setShowLyricsModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  
  const {
    currentSong,
    isPlaying: storeIsPlaying,
    playSong,
    togglePlay,
    duration: storeDuration,
    seekTo,
    progress: storeProgress,
  } = useMusicStore();

  const [isPlaying, setIsPlaying] = useState(false);
  const progress = useProgress(100);
  const [duration, setDuration] = useState(0);
  const [colors, setColors] = useState<any>(null);
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [loadingLyrics, setLoadingLyrics] = useState(false);

  // On mount: ensure TrackPlayer is on this song and sync local state
  useEffect(() => {
    if (!currentSong || currentSong.id !== paramSong.id) {
      // Start playback for this song via global player
      playSong(paramSong);
    }
    // Initialize from store values
    setIsPlaying(storeIsPlaying);
    // setProgress(storeProgress);
    setDuration(storeDuration || Number(paramSong.duration) || 0);
    isInitialMountRef.current = true;
  }, []);

  // Sync isPlaying with store state (handles rapid clicks)
  useEffect(() => {
    if (currentSong?.id === paramSong.id) {
      setIsPlaying(storeIsPlaying);
    }
  }, [storeIsPlaying, currentSong?.id, paramSong.id]);

  // Handle back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });
    return () => backHandler.remove();
  }, [navigation]);

  // Extract colors from image
  useEffect(() => {
    if (paramSong?.image) {
      if (paramSong.imageColors) {
        setColors(paramSong.imageColors);
        return;
      }
      getImageColors(paramSong.image).then((result) => {
        setColors(result);
      });
    }
  }, [paramSong]);

  // Keep local progress/duration in sync with global store (when not sliding)
  // useEffect(() => {
  //   if (!isSlidingRef.current) {
  //     setProgress(storeProgress);
  //   }
  //   if (storeDuration > 0 && storeDuration !== duration) {
  //     setDuration(storeDuration);
  //   }
  // }, [storeProgress, storeDuration]);

  // Toggle play/pause
  const handleTogglePlay = () => {
    // Only update store - local state will sync via useEffect
    togglePlay();
  };

  // Handle slider start
  const handleSliderStart = () => {
    isSlidingRef.current = true;
  };

  // Handle slider update
  const handleSliderUpdate = (value: number) => {
    if (isSlidingRef.current) {
      // setProgress(value);
    }
  };

  // Handle slider end
  const handleSliderEnd = (value: number) => {
    isSlidingRef.current = false;
    setTemp(value);
    if (setTempTimeoutRef.current) {
      clearTimeout(setTempTimeoutRef.current);
    }
    setTempTimeoutRef.current = setTimeout(() => {
      setTemp(null);
      setTempTimeoutRef.current = null;
    }, 1000);
    const seekTime = Math.floor(value);
    // setProgress(seekTime);
    seekTo(seekTime);
  };

  // Time formatter
  const formatTime = (sec: number) => {
    if (!sec && sec !== 0) return '0:00';
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const primaryColor = Platform.OS === 'ios' ? colors?.primary : colors?.average;
  const bgColor = primaryColor || '#121212';
  const gradientColors = [bgColor, '#000000', '#000000'];

  const handleGoBack = () => {
    navigation.goBack();
  };

  // Menu handlers
  const handleMenuPress = () => {
    setShowMenuModal(true);
  };

  const fetchLyrics = async () => {
    if (lyrics) return; // Already loaded
    
    // Check if lyrics are already in song object
    const songWithLyrics = paramSong as any;
    if (songWithLyrics.lyrics) {
      setLyrics(songWithLyrics.lyrics);
      return;
    }
    
    setLoadingLyrics(true);
    try {
      const lyricsData = await getLyrics(paramSong.perma_url);
      if (lyricsData?.lyrics) {
        setLyrics(lyricsData.lyrics);
      } else {
        setLyrics('Lyrics not available');
      }
    } catch (error) {
      console.error('Error fetching lyrics:', error);
      setLyrics('Failed to load lyrics');
    } finally {
      setLoadingLyrics(false);
    }
  };

  const handleShowLyrics = async () => {
    setShowMenuModal(false);
    await fetchLyrics();
    setShowLyricsModal(true);
  };

  const handleShowInfo = () => {
    setShowMenuModal(false);
    setShowInfoModal(true);
  };

  // Format lyrics - replace <br> with newlines
  const formatLyrics = (lyricsText: string | null) => {
    if (!lyricsText) return 'No lyrics available';
    return lyricsText.replace(/<br\s*\/?>/gi, '\n').trim();
  };

  // Get song info fields
  const songInfo = paramSong as any;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={gradientColors[0] + '8f'} />
      
      <LinearGradient
        colors={gradientColors}
        style={styles.backgroundGradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.8 }}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.iconButton}>
            <MaterialIcons name="keyboard-arrow-down" size={32} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={handleMenuPress}
          >
            <MaterialIcons name="more-horiz" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.artworkContainer}>
            <FastImage
              source={{ uri: paramSong.image.replace('150x150', '500x500') }}
              style={styles.artwork}
              resizeMode={FastImage.resizeMode.cover}
            />
          </View>

          <View style={styles.songInfo}>
            <View style={{ flex: 1, paddingRight: 16, alignItems: 'center' }}>
              <Text style={[styles.songTitle, {color: colors?.lightMuted || '#fff'}]} numberOfLines={1}>
                {paramSong.song}
              </Text>
              <Text style={[styles.artistName, {color: colors?.muted || '#fff'}]} numberOfLines={1}>
                {paramSong.primary_artists}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSection}>
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatTime(temp || progress.position)}</Text>
            <CustomSlider
              style={styles.slider}
              min={0}
              max={duration || 100}
              progress={Math.floor(temp || progress.position)}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#FFFFFF"
              thumbTintColor="#FFFFFF"
              thumbSize={12}
              onStart={handleSliderStart}
              onUpdate={handleSliderUpdate}
              onEnd={handleSliderEnd}
            />
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
          <View  style={styles.controls}>
            <TouchableOpacity 
              onPress={handleTogglePlay}
              style={styles.playButton}
              activeOpacity={0.8}
            >
              <MaterialIcons 
                name={isPlaying ? "pause" : "play-arrow"} 
                size={35} 
                color="#000" 
              />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* Menu Modal */}
      <Modal
        visible={showMenuModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenuModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMenuModal(false)}
        >
          <View style={styles.modalContainer} onStartShouldSetResponder={() => true}>
            <View style={styles.modalContent}>
              {paramSong.has_lyrics === 'true' && (
                <TouchableOpacity 
                  style={[styles.menuItem, styles.menuItemBorder]}
                  onPress={handleShowLyrics}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="queue-music" size={24} color="#FFF" />
                  <Text style={styles.menuItemText}>Lyrics</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={handleShowInfo}
                activeOpacity={0.7}
              >
                <MaterialIcons name="info-outline" size={24} color="#FFF" />
                <Text style={styles.menuItemText}>Info</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Lyrics Modal */}
      <Modal
        visible={showLyricsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLyricsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.actionSheetHeader}>
                <Text style={styles.actionSheetTitle}>Lyrics</Text>
                <TouchableOpacity 
                  onPress={() => setShowLyricsModal(false)}
                  style={styles.closeButton}
                >
                  <MaterialIcons name="close" size={24} color="#FFF" />
                </TouchableOpacity>
              </View>
              
              {loadingLyrics ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#FFF" />
                  <Text style={styles.loadingText}>Loading lyrics...</Text>
                </View>
              ) : (
                <ScrollView 
                  style={styles.lyricsScrollView}
                  contentContainerStyle={{flexGrow: 1}}
                  showsVerticalScrollIndicator={false}
                >
                  <Text style={styles.lyricsText}>{formatLyrics(lyrics)}</Text>
                </ScrollView>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Info Modal */}
      <Modal
        visible={showInfoModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowInfoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.actionSheetHeader}>
                <Text style={styles.actionSheetTitle}>Song Info</Text>
                <TouchableOpacity 
                  onPress={() => setShowInfoModal(false)}
                  style={styles.closeButton}
                >
                  <MaterialIcons name="close" size={24} color="#FFF" />
                </TouchableOpacity>
              </View>
              
              <ScrollView 
                style={{maxHeight: 500}}
                contentContainerStyle={{flexGrow: 1}}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.infoContainer}>
                  <InfoRow label="Song" value={songInfo.song || paramSong.song} />
                  <InfoRow label="Artist" value={songInfo.primary_artists || paramSong.primary_artists} />
                  <InfoRow label="Album" value={songInfo.album || 'Unknown'} />
                  <InfoRow 
                    label="Duration" 
                    value={formatTime(parseInt(songInfo.duration || duration.toString() || '0'))} 
                  />
                  <InfoRow label="Year" value={songInfo.year || paramSong.year || 'Unknown'} />
                  <InfoRow label="Language" value={songInfo.language || paramSong.language || 'Unknown'} />
                  {songInfo.label && <InfoRow label="Label" value={songInfo.label} />}
                  {songInfo.copyright_text && <InfoRow label="Copyright" value={songInfo.copyright_text} />}
                  {songInfo.music && <InfoRow label="Music" value={songInfo.music} />}
                  {songInfo.singers && songInfo.singers !== songInfo.primary_artists && (
                    <InfoRow label="Singers" value={songInfo.singers} />
                  )}
                  {songInfo.starring && <InfoRow label="Starring" value={songInfo.starring} />}
                  {songInfo.play_count && <InfoRow label="Play Count" value={parseInt(songInfo.play_count).toLocaleString()} />}
                  {songInfo.release_date && <InfoRow label="Release Date" value={songInfo.release_date} />}
                  {songInfo.explicit_content !== undefined && (
                    <InfoRow label="Explicit" value={songInfo.explicit_content === 1 ? 'Yes' : 'No'} />
                  )}
                  {songInfo.has_lyrics && <InfoRow label="Has Lyrics" value={songInfo.has_lyrics === 'true' ? 'Yes' : 'No'} />}
                  {songInfo.album_url && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Album URL</Text>
                      <Text style={styles.infoValue} numberOfLines={1}>{songInfo.album_url}</Text>
                    </View>
                  )}
                </View>
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Info Row Component
const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  hiddenVideo: {
    width: 0,
    height: 0,
    position: 'absolute',
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  iconButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '600',
    opacity: 0.7,
  },
  content: {
    paddingHorizontal: 24,
    justifyContent: 'flex-start',
    flex: 1,
    paddingBottom: 48,

  },
  artworkContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 32,
  },
  artwork: {
    width: width - 60,
    height: width - 60,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',

  },
  songInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  songTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  artistName: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // gap: 12,
    marginBottom: 30,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  timeText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    fontVariant: ['tabular-nums'],
    width: 40,
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 36,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#121212',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalContent: {
    padding: 20,
    paddingBottom: 40,
  },
  actionSheetContent: {
    padding: 20,
    paddingBottom: 40,
  },
  actionSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  actionSheetTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
  },
  closeButton: {
    padding: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  menuItemText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    color: '#999',
    fontSize: 14,
  },
  lyricsScrollView: {
    maxHeight: 500,
  },
  lyricsText: {
    color: '#FFF',
    fontSize: 16,
    lineHeight: 28,
    textAlign: 'left',
  },
  infoScrollView: {
    flex: 1
  },
  infoContainer: {
    paddingVertical: 8,
  },
  infoRow: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '500',
  },
});

// import React, { useEffect, useRef, useState, useMemo } from 'react';
// import {
//   StyleSheet,
//   Text,
//   View,
//   TouchableOpacity,
//   StatusBar,
//   Dimensions,
//   Platform,
//   ScrollView,
//   ActivityIndicator,
//   BackHandler,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useRoute, useNavigation } from '@react-navigation/native';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import LinearGradient from 'react-native-linear-gradient';
// import FastImage from 'react-native-fast-image';
// import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import BottomSheet, { BottomSheetView, BottomSheetScrollView } from '@gorhom/bottom-sheet';

// import { Song } from '../types';
// import { useMusicStore } from '../store/musicStore';
// import { getLyrics } from '../services/api';
// import { getImageColors } from '../utils/colorCache';
// import CustomSlider from '../components/CustomSlider';

// const { width } = Dimensions.get('window');
// export default function SongScreen() {
  
//   const route = useRoute();
//   const navigation = useNavigation();
//   const sliderRef = useRef<any>(null);
//   const { song: paramSong } = route.params as { song: Song };

//   const {
//     currentSong,
//     isPlaying: storeIsPlaying,
//     playSong,
//     togglePlay,
//     duration: storeDuration,
//     seekTo,
//   } = useMusicStore();
  
//   // Use selector to avoid re-renders on every progress update
//   const storeProgress = useMusicStore((state) => state.progress);

//   const songToDisplay = (currentSong as Song) || paramSong;
//   const [colors, setColors] = useState<any>(null);

//   // Local state for immediate UI updates
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [progressValue, setProgressValue] = useState(0);
//   const [duration, setDuration] = useState(0);

//   // Bottom sheet refs and state
//   const menuSheetRef = useRef<BottomSheet>(null);
//   const lyricsSheetRef = useRef<BottomSheet>(null);
//   const infoSheetRef = useRef<BottomSheet>(null);
//   const [lyrics, setLyrics] = useState<string | null>(null);
//   const [loadingLyrics, setLoadingLyrics] = useState(false);
  
//   const menuSnapPoints = useMemo(() => ['25%'], []);
//   const lyricsSnapPoints = useMemo(() => ['75%', '90%'], []);
//   const infoSnapPoints = useMemo(() => ['60%', '90%'], []);

//   // --- PROGRESS & SLIDER ---
//   const isSlidingRef = useRef(false);

//   // Initialize local state from store ONCE when track changes
//   useEffect(() => {
//     console.log(paramSong);
    
//     if (currentSong && (currentSong as Song).id === paramSong.id) {
//       setIsPlaying(storeIsPlaying);
//       setProgressValue(storeProgress);
//       setDuration(storeDuration);
//     }
//   }, [currentSong?.id]); // Only when track ID changes

//   useEffect(() => {
//     const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
//       navigation.goBack();
//       return true;
//     });
//     return () => backHandler.remove();
//   }, [])
//   // Sync duration from store (for new tracks)
//   useEffect(() => {
//     if (storeDuration > 0 && storeDuration !== duration) {
//       setDuration(storeDuration);
//     }
//   }, [storeDuration]);

//   // Sync progress from store (no polling needed - store updates from video player)
//   useEffect(() => {
//     let interval: any;
//     setProgressValue(storeProgress);
//     if (isPlaying) {
      
//       interval = setInterval(() => {
//         // Update from store progress (GlobalMusicPlayer updates it)
//         // To get the latest progress value from the store inside this callback,
//         // use the function form of useMusicStore (not the hook call).
//         const progressOrg = useMusicStore.getState().progress;
//         setProgressValue(progressOrg);
//       }, 500); // Fast local updates (100ms for smooth UI)
//     } else {
//       // When paused, sync once from store
//       if (!isSlidingRef.current) {
//         setProgressValue(storeProgress);
//       }
//     }

//     return () => {
//       if (interval) clearInterval(interval);
//     };
//   }, [isPlaying, currentSong, duration]);

//   // Handle track finish
//   useEffect(() => {
//     if (duration > 0 && Math.floor(progressValue) >= Math.floor(duration) && isPlaying) {
//       setIsPlaying(false);
//       // Store will handle skipToNext via GlobalMusicPlayer's onEnd
//     }
//   }, [progressValue, duration, isPlaying]);

//   // Sync isPlaying from store (but don't override if user just toggled)
//   useEffect(() => {
//     // Only sync if it's a different state (e.g., track changed externally)
//     if (storeIsPlaying !== isPlaying && currentSong?.id === paramSong.id) {
//       setIsPlaying(storeIsPlaying);
//     }
//   }, [storeIsPlaying, currentSong?.id]);

//   // --- COLOR EXTRACTION & AUTO-PLAY via global store/engine ---
//   useEffect(() => {
//     if (!paramSong) return;
//     if (!currentSong || (currentSong as Song).id !== paramSong.id) {
//       playSong(paramSong);
//     }
//   }, [paramSong, currentSong, playSong]);

//   useEffect(() => {
//     if (songToDisplay?.image) {
//       // Use pre-fetched colors if available
//       if (songToDisplay.imageColors) {
//         console.log('songToDisplay.imageColors found------');
//         setColors(songToDisplay.imageColors);
//         return;
//       }
      
//       // Otherwise fetch colors from MMKV cache or fetch and cache
//       getImageColors(songToDisplay.image).then((result) => {
//         console.log('colors', result);
//         setColors(result);
//         // Update the song with colors for future use
//         if (currentSong && (currentSong as Song).id === songToDisplay.id) {
//           const updatedSong = { ...songToDisplay, imageColors: result };
//           useMusicStore.getState().setCurrentSong(updatedSong);
//         }
//       });
//     }
//   }, [songToDisplay]);

//   // Time Formatter [cite: 19-20]
//   const formatTime = (sec: number) => {
//     if (!sec && sec !== 0) return '0:00';
//     const mins = Math.floor(sec / 60);
//     const secs = Math.floor(sec % 60);
//     return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
//   };

//   // Handle play/pause with immediate local state update
//   const handleTogglePlay = () => {
//     const newPlayingState = !isPlaying;
//     setIsPlaying(newPlayingState); // Immediate local update
//     togglePlay(); // Update store (which controls GlobalMusicPlayer)
//   };

//   // Fetch lyrics
//   const fetchLyrics = async () => {
//     if (lyrics) return; // Already loaded
    
//     // Check if lyrics are already in song object
//     const songWithLyrics = songToDisplay as any;
//     if (songWithLyrics.lyrics) {
//       setLyrics(songWithLyrics.lyrics);
//       return;
//     }
    
//     setLoadingLyrics(true);
//     try {
//       console.log('fetching lyrics', songToDisplay.perma_url);
      
//       const lyricsData = await getLyrics(songToDisplay.perma_url);
//       console.log('lyrics data', lyricsData);
      
//       if (lyricsData?.lyrics) {
//         setLyrics(lyricsData.lyrics);
//       } else {
//         setLyrics('Lyrics not available');
//       }
//     } catch (error) {
//       console.error('Error fetching lyrics:', error);
//       setLyrics('Failed to load lyrics');
//     } finally {
//       setLoadingLyrics(false);
//     }
//   };

//   // Menu handlers (bottom action sheet)
//   const handleMenuPress = () => {
//     menuSheetRef.current?.snapToIndex(0);
//   };

//   const handleShowLyrics = async () => {
//     menuSheetRef.current?.close();
//     await fetchLyrics();
//     lyricsSheetRef.current?.snapToIndex(0);
//   };

//   const handleShowInfo = () => {
//     menuSheetRef.current?.close();
//     infoSheetRef.current?.snapToIndex(0);
//   };

//   const primaryColor = Platform.OS === 'ios' ? colors?.primary : colors?.average;
//   const bgColor = primaryColor || '#121212';
//   const gradientColors = [bgColor, '#000000', '#000000'];

//   // Format lyrics - replace <br> with newlines
//   const formatLyrics = (lyricsText: string | null) => {
//     if (!lyricsText) return 'No lyrics available';
//     return lyricsText.replace(/<br\s*\/?>/gi, '\n').trim();
//   };

//   // Get song info fields
//   const songInfo = songToDisplay as any;

//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <View style={styles.container}>
//       <StatusBar barStyle="light-content" backgroundColor={gradientColors[0] + '8f'} />
      
//       <LinearGradient
//         colors={gradientColors}
//         style={styles.backgroundGradient}
//         start={{ x: 0.5, y: 0 }}
//         end={{ x: 0.5, y: 0.8 }}
//       />

//       <SafeAreaView style={styles.safeArea}>
//         <View style={styles.header}>
//           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
//             <MaterialIcons name="keyboard-arrow-down" size={32} color="#FFF" />
//           </TouchableOpacity>
//           {/* <Text style={styles.headerTitle}>NOW PLAYING</Text> */}
//           <TouchableOpacity 
//             style={styles.iconButton}
//             onPress={handleMenuPress}
//           >
//             <MaterialIcons name="more-horiz" size={24} color="#FFF" />
//           </TouchableOpacity>
//         </View>

//         <View style={styles.content}>
//           <View style={styles.artworkContainer}>
//             <FastImage
//               source={{ uri: songToDisplay.image.replace('150x150', '500x500') }}
//               style={styles.artwork}
//               resizeMode={FastImage.resizeMode.cover}
//             />
//           </View>

//           <View style={styles.songInfo}>
//             <View style={{ flex: 1, paddingRight: 16, alignItems: 'center' }}>
//               <Text style={[styles.songTitle, {color: colors?.lightMuted || '#fff'}]} numberOfLines={1}>{songToDisplay.song}</Text>
//               <Text style={[styles.artistName, {color: colors?.muted || '#fff'}]} numberOfLines={1}>{songToDisplay.primary_artists}</Text>
//             </View>
//             {/* <TouchableOpacity>
//               <MaterialIcons name="favorite-border" size={24} color="#FFF" />
//             </TouchableOpacity> */}
//           </View>
//         </View>

//         <View style={styles.bottomSection}>
//           <View style={styles.timeRow}>
//             <Text style={styles.timeText}>{formatTime(progressValue)}</Text>
//             <CustomSlider
//               style={styles.slider}
//               min={0}
//               max={duration || 100}
//               progress={progressValue}
//               minimumTrackTintColor="#FFFFFF"
//               maximumTrackTintColor="rgba(255,255,255,0.3)"
//               thumbTintColor="#FFFFFF"
//               onStart={() => {
//                 console.log('onStart');
//                 isSlidingRef.current = true;
//               }}
//               onUpdate={(value) => {
//                 console.log('onUpdate', value);
//                 if (isSlidingRef.current && value !== undefined) {
//                   setProgressValue(value);
//                 }
//               }}
//               onEnd={(value) => {
//                 console.log('onEnd', value);
//                 isSlidingRef.current = false;
//                 if (value !== undefined) {
//                   const newTime = parseInt(value.toFixed(1));
//                   setProgressValue(newTime);
//                   seekTo(newTime);
//                 }
//               }}
//             />
//             <Text style={styles.timeText}>{formatTime(duration)}</Text>
//           </View>
//           <View style={styles.controls}>
//             <TouchableOpacity 
//               onPress={handleTogglePlay}
//               style={styles.playButton}
//             >
//               <MaterialIcons 
//                 name={isPlaying ? "pause" : "play-arrow"} 
//                 size={35} 
//                 color="#000" 
//               />
//             </TouchableOpacity>
//           </View>
//         </View>
//       </SafeAreaView>
//       </View>

//       {/* Menu Bottom Sheet (Options) */}
//       <BottomSheet
//         ref={menuSheetRef}
//         index={-1}
//         // snapPoints={menuSnapPoints}
//         enableDynamicSizing={true}
        
//         enablePanDownToClose
//         backgroundStyle={styles.bottomSheetBackground}
//         handleIndicatorStyle={styles.bottomSheetIndicator}
//       >
//         <BottomSheetView style={styles.bottomSheetContent}>
// {songToDisplay.has_lyrics === 'true' && (          <TouchableOpacity 
//             style={styles.menuItem}
//             onPress={handleShowLyrics}
//           >
//             <MaterialIcons name="queue-music" size={20} color="#FFF" />
//             <Text style={styles.menuItemText}>Lyrics</Text>
//           </TouchableOpacity>)}
//           <TouchableOpacity 
//             style={styles.menuItem}
//             onPress={handleShowInfo}
//           >
//             <MaterialIcons name="info-outline" size={20} color="#FFF" />
//             <Text style={styles.menuItemText}>Info</Text>
//           </TouchableOpacity>
//         </BottomSheetView>
//       </BottomSheet>

//       {/* Lyrics Bottom Sheet */}
//       <BottomSheet
//         ref={lyricsSheetRef}
//         index={-1}
//         snapPoints={lyricsSnapPoints}
//         enablePanDownToClose
//         backgroundStyle={styles.bottomSheetBackground}
//         handleIndicatorStyle={styles.bottomSheetIndicator}
//       >
//         <BottomSheetScrollView contentContainerStyle={styles.bottomSheetContent} showsVerticalScrollIndicator={false}>
//           <View style={styles.bottomSheetHeader}>
//             <Text style={styles.bottomSheetTitle}>Lyrics</Text>
//             <TouchableOpacity onPress={() => lyricsSheetRef.current?.close()}>
//               <MaterialIcons name="close" size={24} color="#FFF" />
//             </TouchableOpacity>
//           </View>
          
//           {loadingLyrics ? (
//             <View style={styles.loadingContainer}>
//               <ActivityIndicator size="large" color="#FFF" />
//               <Text style={styles.loadingText}>Loading lyrics...</Text>
//             </View>
//           ) : (
//             <View style={styles.lyricsContainer}>
//               <Text style={styles.lyricsText}>{formatLyrics(lyrics)}</Text>
//             </View>
//           )}
//         </BottomSheetScrollView>
//       </BottomSheet>

//       {/* Info Bottom Sheet */}
//       <BottomSheet
//         ref={infoSheetRef}
//         index={-1}
//         snapPoints={infoSnapPoints}
//         enablePanDownToClose
//         backgroundStyle={styles.bottomSheetBackground}
//         handleIndicatorStyle={styles.bottomSheetIndicator}
//       >
//         <BottomSheetScrollView contentContainerStyle={styles.bottomSheetContent} showsVerticalScrollIndicator={false}>
//           <View style={styles.bottomSheetHeader}>
//             <Text style={styles.bottomSheetTitle}>Song Info</Text>
//             <TouchableOpacity onPress={() => infoSheetRef.current?.close()}>
//               <MaterialIcons name="close" size={24} color="#FFF" />
//             </TouchableOpacity>
//           </View>
          
//           <View style={styles.infoContainer}>
//             <InfoRow label="Song" value={songInfo.song || songToDisplay.song} />
//             <InfoRow label="Artist" value={songInfo.primary_artists || songToDisplay.primary_artists} />
//             <InfoRow label="Album" value={songInfo.album || 'Unknown'} />
//             <InfoRow 
//               label="Duration" 
//               value={formatTime(parseInt(songInfo.duration || duration.toString() || '0'))} 
//             />
//             <InfoRow label="Year" value={songInfo.year || songToDisplay.year || 'Unknown'} />
//             <InfoRow label="Language" value={songInfo.language || songToDisplay.language || 'Unknown'} />
//             {songInfo.label && <InfoRow label="Label" value={songInfo.label} />}
//             {songInfo.copyright_text && <InfoRow label="Copyright" value={songInfo.copyright_text} />}
//             {songInfo.music && <InfoRow label="Music" value={songInfo.music} />}
//             {songInfo.singers && songInfo.singers !== songInfo.primary_artists && (
//               <InfoRow label="Singers" value={songInfo.singers} />
//             )}
//             {songInfo.starring && <InfoRow label="Starring" value={songInfo.starring} />}
//             {songInfo.play_count && <InfoRow label="Play Count" value={parseInt(songInfo.play_count).toLocaleString()} />}
//             {songInfo.release_date && <InfoRow label="Release Date" value={songInfo.release_date} />}
//             {songInfo.explicit_content !== undefined && (
//               <InfoRow label="Explicit" value={songInfo.explicit_content === 1 ? 'Yes' : 'No'} />
//             )}
//             {songInfo.has_lyrics && <InfoRow label="Has Lyrics" value={songInfo.has_lyrics === 'true' ? 'Yes' : 'No'} />}
//             {songInfo.album_url && (
//               <View style={styles.infoRow}>
//                 <Text style={styles.infoLabel}>Album URL</Text>
//                 <Text style={styles.infoValue} numberOfLines={1}>{songInfo.album_url}</Text>
//               </View>
//             )}
//           </View>
//         </BottomSheetScrollView>
//       </BottomSheet>
//     </GestureHandlerRootView>
//   );
// }

// // Info Row Component
// const InfoRow = ({ label, value }: { label: string; value: string }) => (
//   <View style={styles.infoRow}>
//     <Text style={styles.infoLabel}>{label}</Text>
//     <Text style={styles.infoValue}>{value}</Text>
//   </View>
// );

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#000000',
//   },
//   backgroundGradient: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     height: '60%',
//   },
//   safeArea: {
//     flex: 1,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 24,
//     paddingTop: 16,
//   },
//   iconButton: {
//     padding: 8,
//   },
//   headerTitle: {
//     color: '#FFF',
//     fontSize: 10,
//     letterSpacing: 2,
//     fontWeight: '600',
//     opacity: 0.7,
//   },
//   content: {
//     paddingHorizontal: 24,
//     justifyContent: 'flex-start',
//     flex: 1,
//     paddingBottom: 48,

//   },
//   artworkContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginVertical: 32,
//   },
//   artwork: {
//     width: width - 60,
//     height: width - 60,
//     borderRadius: 12,
//     backgroundColor: '#1A1A1A',

//   },
//   songInfo: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 32,
//   },
//   songTitle: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: '#FFF',
//     marginBottom: 4,
//   },
//   artistName: {
//     fontSize: 16,
//     color: 'rgba(255,255,255,0.6)',
//     fontWeight: '500',
//   },
//   bottomSection: {
//     paddingHorizontal: 24,
//     paddingBottom: 40,
//   },
//   timeRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     gap: 12,
//     marginBottom: 30,
//   },
//   slider: {
//     flex: 1,
//     height: 40,
//   },
//   timeText: {
//     fontSize: 12,
//     color: 'rgba(255,255,255,0.6)',
//     fontVariant: ['tabular-nums'],
//     width: 40,
//     textAlign: 'center',
//   },
//   controls: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-around',
//     paddingHorizontal: 20,
//   },
//   playButton: {
//     width: 60,
//     height: 60,
//     borderRadius: 36,
//     backgroundColor: '#FFF',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   menuItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     gap: 12,
//   },
//   menuItemText: {
//     color: '#FFF',
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   bottomSheetBackground: {
//     backgroundColor: '#121212',
//   },
//   bottomSheetIndicator: {
//     backgroundColor: '#666',
//   },
//   bottomSheetContent: {
//     padding: 20,
//     paddingBottom: 40,
//   },
//   bottomSheetHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 20,
//     paddingBottom: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#333',
//   },
//   bottomSheetTitle: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: '#FFF',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingVertical: 60,
//   },
//   loadingText: {
//     marginTop: 16,
//     color: '#999',
//     fontSize: 14,
//   },
//   lyricsContainer: {
//     paddingVertical: 8,
//   },
//   lyricsText: {
//     color: '#FFF',
//     fontSize: 16,
//     lineHeight: 28,
//     textAlign: 'left',
//   },
//   infoContainer: {
//     paddingVertical: 8,
//   },
//   infoRow: {
//     marginBottom: 20,
//     paddingBottom: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#1A1A1A',
//   },
//   infoLabel: {
//     fontSize: 12,
//     color: '#999',
//     marginBottom: 6,
//     textTransform: 'uppercase',
//     letterSpacing: 0.5,
//   },
//   infoValue: {
//     fontSize: 16,
//     color: '#FFF',
//     fontWeight: '500',
//   },
// });

// import React, { useEffect, useRef, useState } from 'react';
// import {
//   StyleSheet,
//   Text,
//   View,
//   TouchableOpacity,
//   SafeAreaView,
//   StatusBar,
//   Dimensions,
//   Platform,
// } from 'react-native';
// import { useRoute, useNavigation } from '@react-navigation/native';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import LinearGradient from 'react-native-linear-gradient';
// import { getColors } from 'react-native-image-colors';
// import FastImage from 'react-native-fast-image';

// import { useSharedValue } from 'react-native-reanimated';
// import { Slider } from 'react-native-awesome-slider';
// import { Song } from '../types';
// import { useMusicStore } from '../store/musicStore';

// const { width } = Dimensions.get('window');

// export default function SongScreen() {
//   const route = useRoute();
//   const navigation = useNavigation();
//   const { song: paramSong } = route.params as { song: Song };
  
//   const { 
//     currentSong, 
//     isPlaying, 
//     playSong, 
//     togglePlay, 
//     skipToNext, 
//     skipToPrevious,
//     duration,
//     seekTo,
//     soundRef // Ensure your store/provider exposes the actual soundRef/instance [cite: 6, 86]
//   } = useMusicStore();
  
//   const songToDisplay = currentSong || paramSong;
//   const [colors, setColors] = useState<any>(null);

//   // --- PROGRESS & SLIDER SHARED VALUES [cite: 9] ---
//   const [progressValue, setProgressValue] = useState(0);
//   const min = useSharedValue(0);
//   const max = useSharedValue(100);
//   const progress = useSharedValue(0);
//   const isSlidingRef = useRef(false);

//   // Sync Max Duration to Slider [cite: 10]
//   useEffect(() => {
//     if (duration > 0) {
//       max.value = duration;
//     }
//   }, [duration]);

//   // --- MANUAL PROGRESS UPDATE INTERVAL [cite: 16-17] ---
//   useEffect(() => {
//     let interval: any;
    

//     // If sound exists and is playing, start interval to poll current time
//     if (soundRef?.current && isPlaying) {
//       console.log('inside');
      
//       interval = setInterval(() => {
//         console.log('updating progress value---');
        
//         if (!soundRef.current) {
//           // clearInterval(interval);
//           return;
//         }

//         soundRef.current.getCurrentTime((sec: number) => {
//           // Only update if user isn't actively dragging the slider 
//           console.log(sec);

//           if (!isSlidingRef.current) {
//             progress.value = sec;
//           }
//           setProgressValue(sec); // Update state for the text display 
//         });
//       }, 500); // Polling every 500ms for efficiency 
      
//     } else if (soundRef?.current) {
//       // If paused, do a one-time sync to ensure UI matches [cite: 17]
//       soundRef.current.getCurrentTime((sec: number) => {
//         if (!isSlidingRef.current) {
//           progress.value = sec;
//         }
//         setProgressValue(sec);
//       });
//     }

//     return () => {
//       if (interval) clearInterval(interval);
//     };
//   }, [isPlaying, soundRef, duration]);

//   // Handle auto-next when track finishes [cite: 25]
//   useEffect(() => {
//     if (duration > 0 && Math.floor(progressValue) >= Math.floor(duration) && isPlaying) {
//       skipToNext();
//     }
//   }, [progressValue]);

//   // --- COLOR EXTRACTION & AUTO-PLAY ---
//   useEffect(() => {
//     if (paramSong && (!currentSong || currentSong.id !== paramSong.id)) {
//       playSong(paramSong);
//     }
//   }, [paramSong]);

//   useEffect(() => {
//     if (songToDisplay?.image) {
//       const url = songToDisplay.image.replace('150x150', '500x500');
//       getColors(url, {
//         fallback: '#000000',
//         cache: true,
//         key: url,
//       }).then((result) => {
//         setColors(result);
//       });
//     }
//   }, [songToDisplay]);

//   // Time Formatter [cite: 19-20]
//   const formatTime = (sec: number) => {
//     if (!sec && sec !== 0) return '0:00';
//     const mins = Math.floor(sec / 60);
//     const secs = Math.floor(sec % 60);
//     return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
//   };

//   const primaryColor = Platform.OS === 'ios' ? colors?.primary : colors?.average;
//   const bgColor = primaryColor || '#121212';
//   const gradientColors = [bgColor, '#000000', '#000000'];

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="light-content" backgroundColor={gradientColors[0] + '8f'} />
      
//       <LinearGradient
//         colors={gradientColors}
//         style={styles.backgroundGradient}
//         start={{ x: 0.5, y: 0 }}
//         end={{ x: 0.5, y: 0.8 }}
//       />

//       <SafeAreaView style={styles.safeArea}>
//         {/* Header */}
//         <View style={styles.header}>
//           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
//             <MaterialIcons name="keyboard-arrow-left" size={32} color="#FFF" />
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>NOW PLAYING</Text>
//           <TouchableOpacity style={styles.iconButton}>
//             <MaterialIcons name="more-horiz" size={24} color="#FFF" />
//           </TouchableOpacity>
//         </View>

//         <View style={styles.content}>
//           <View style={styles.artworkContainer}>
//             <FastImage
//               source={{ uri: songToDisplay.image.replace('150x150', '500x500') }}
//               style={styles.artwork}
//               resizeMode={FastImage.resizeMode.cover}
//             />
//           </View>

//           <View style={styles.songInfo}>
//             <View style={{ flex: 1, paddingRight: 16 }}>
//               <Text style={styles.songTitle} numberOfLines={1}>{songToDisplay.song}</Text>
//               <Text style={styles.artistName} numberOfLines={1}>{songToDisplay.primary_artists}</Text>
//             </View>
//             <TouchableOpacity>
//               <MaterialIcons name="favorite-border" size={24} color="#FFF" />
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* BOTTOM CONTROLS SECTION [cite: 44] */}
//         <View style={styles.bottomSection}>
//           {/* Progress Slider Row [cite: 45-51] */}
//           <View style={styles.timeRow}>
//             <Text style={styles.timeText}>{formatTime(progressValue)}</Text>
//             <Slider
//               style={styles.slider}
//               minimumValue={min}
//               maximumValue={max}
//               progress={progress}
//               theme={{
//                 minimumTrackTintColor: '#FFFFFF',
//                 maximumTrackTintColor: 'rgba(255,255,255,0.3)',
//                 bubbleBackgroundColor: '#FFFFFF',
//                 bubbleTextColor: '#000000',
//               }}
//               onSlidingStart={() => {
//                 isSlidingRef.current = true; // Pause interval updates [cite: 48]
//               }}
//               onSlidingComplete={(value) => {
//                 isSlidingRef.current = false;
//                 seekTo(value); // Seek in audio engine [cite: 49]
//                 setProgressValue(value);
//               }}
//               bubble={(value) => formatTime(value)}
//               containerStyle={{ borderRadius: 20 }}
//               // heartbeat={true}
//             />
//             <Text style={styles.timeText}>{formatTime(duration)}</Text>
//           </View>
          
//           {/* Playback Controls [cite: 55-58] */}
//           <View style={styles.controls}>
//             <TouchableOpacity onPress={() => skipToPrevious()}>
//               <MaterialIcons name="skip-previous" size={40} color="#FFF" />
//             </TouchableOpacity>

//             <TouchableOpacity 
//               onPress={() => togglePlay()}
//               style={styles.playButton}
//             >
//               <MaterialIcons 
//                 name={isPlaying ? "pause" : "play-arrow"} 
//                 size={40} 
//                 color="#000" 
//               />
//             </TouchableOpacity>

//             <TouchableOpacity onPress={() => skipToNext()}>
//               <MaterialIcons name="skip-next" size={40} color="#FFF" />
//             </TouchableOpacity>
//           </View>
//         </View>
//       </SafeAreaView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#000000',
//   },
//   backgroundGradient: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     height: '60%',
//   },
//   safeArea: {
//     flex: 1,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 24,
//     paddingTop: 16,
//   },
//   iconButton: {
//     padding: 8,
//   },
//   headerTitle: {
//     color: '#FFF',
//     fontSize: 10,
//     letterSpacing: 2,
//     fontWeight: '600',
//     opacity: 0.7,
//   },
//   content: {
//     paddingHorizontal: 24,
//     justifyContent: 'flex-end',
//     flex: 1,
//     paddingBottom: 48,
//   },
//   artworkContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginVertical: 32,
//   },
//   artwork: {
//     width: width - 48,
//     height: width - 48,
//     borderRadius: 12,
//     backgroundColor: '#1A1A1A',
//   },
//   songInfo: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 32,
//   },
//   songTitle: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: '#FFF',
//     marginBottom: 4,
//   },
//   artistName: {
//     fontSize: 16,
//     color: 'rgba(255,255,255,0.6)',
//     fontWeight: '500',
//   },
//   bottomSection: {
//     paddingHorizontal: 24,
//     paddingBottom: 40,
//   },
//   timeRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     gap: 12,
//     marginBottom: 30,
//   },
//   slider: {
//     flex: 1,
//   },
//   timeText: {
//     fontSize: 12,
//     color: 'rgba(255,255,255,0.4)',
//     fontVariant: ['tabular-nums'],
//     width: 40,
//     textAlign: 'center',
//   },
//   controls: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-around',
//     paddingHorizontal: 20,
//   },
//   playButton: {
//     width: 72,
//     height: 72,
//     borderRadius: 36,
//     backgroundColor: '#FFF',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });

/////////////////////////////////////////////////////////////

// import React, { useEffect, useRef, useState } from 'react';
// import {
//   StyleSheet,
//   Text,
//   View,
//   TouchableOpacity,
//   StatusBar,
//   Dimensions,
//   Platform,
//   ActivityIndicator,
//   BackHandler,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useRoute, useNavigation } from '@react-navigation/native';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import LinearGradient from 'react-native-linear-gradient';
// import FastImage from 'react-native-fast-image';
// import { useMusicStore } from '../store/musicStore';
// import { getImageColors } from '../utils/colorCache';
// import CustomSlider from '../components/CustomSlider';
// import { Song } from '../types';
// import { useProgress } from 'react-native-track-player';

// const { width } = Dimensions.get('window');

// export default function SongScreen() {
//   const route = useRoute();
//   const navigation = useNavigation();
//   const { song: paramSong } = route.params as { song: Song };

//   const isSlidingRef = useRef(false);
//   const isInitialMountRef = useRef(false);

//   const {
//     currentSong,
//     isPlaying: storeIsPlaying,
//     playSong,
//     togglePlay,
//     duration: storeDuration,
//     seekTo,
//     progress: storeProgress,
//   } = useMusicStore();

//   const [isPlaying, setIsPlaying] = useState(false);
//   const progress = useProgress(500);
//   const [slideProgress, setSlideProgress] = useState(null);
//   const [duration, setDuration] = useState(0);
//   const [colors, setColors] = useState<any>(null);

//   // On mount: ensure TrackPlayer is on this song and sync local state
//   useEffect(() => {
//     if (!currentSong || currentSong.id !== paramSong.id) {
//       // Start playback for this song via global player
//       playSong(paramSong);
//     }
//     // Initialize from store values
//     setIsPlaying(storeIsPlaying);
//     // setProgress(storeProgress);
//     setDuration(storeDuration || Number(paramSong.duration) || 0);
//     isInitialMountRef.current = true;
//   }, []);

//   // Handle back button
//   useEffect(() => {
//     const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
//       navigation.goBack();
//       return true;
//     });
//     return () => backHandler.remove();
//   }, [navigation]);

//   // Extract colors from image
//   useEffect(() => {
//     if (paramSong?.image) {
//       if (paramSong.imageColors) {
//         setColors(paramSong.imageColors);
//         return;
//       }
//       getImageColors(paramSong.image).then((result) => {
//         setColors(result);
//       });
//     }
//   }, [paramSong]);

//   // Keep local progress/duration in sync with global store (when not sliding)
//   // useEffect(() => {
//   //   if (!isSlidingRef.current) {
//   //     setProgress(storeProgress);
//   //   }
//   //   if (storeDuration > 0 && storeDuration !== duration) {
//   //     setDuration(storeDuration);
//   //   }
//   // }, [storeProgress, storeDuration]);

//   // Toggle play/pause
//   const handleTogglePlay = () => {
//     // Update both local and global state
//     togglePlay();
//     setIsPlaying((prev) => !prev);
//   };

//   // Handle slider start
//   const handleSliderStart = () => {
//     isSlidingRef.current = true;
//   };

//   // Handle slider update
//   const handleSliderUpdate = (value: number) => {
//     if (isSlidingRef.current) {
//       // setProgress(value);
//       setSlideProgress(value);
//     }
//   };

//   // Handle slider end
//   const handleSliderEnd = (value: number) => {
//     isSlidingRef.current = false;
//     const seekTime = Math.floor(value);
//     // setProgress(seekTime);
//     seekTo(seekTime);
//     setSlideProgress(null);
//   };

//   // Time formatter
//   const formatTime = (sec: number) => {
//     if (!sec && sec !== 0) return '0:00';
//     const mins = Math.floor(sec / 60);
//     const secs = Math.floor(sec % 60);
//     return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
//   };

//   const primaryColor = Platform.OS === 'ios' ? colors?.primary : colors?.average;
//   const bgColor = primaryColor || '#121212';
//   const gradientColors = [bgColor, '#000000', '#000000'];

//   const handleGoBack = () => {
//     navigation.goBack();
//   };

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="light-content" backgroundColor={gradientColors[0] + '8f'} />
      
//       <LinearGradient
//         colors={gradientColors}
//         style={styles.backgroundGradient}
//         start={{ x: 0.5, y: 0 }}
//         end={{ x: 0.5, y: 0.8 }}
//       />

//       <SafeAreaView style={styles.safeArea}>
//         <View style={styles.header}>
//           <TouchableOpacity onPress={handleGoBack} style={styles.iconButton}>
//             <MaterialIcons name="keyboard-arrow-down" size={32} color="#FFF" />
//           </TouchableOpacity>
//         </View>

//         <View style={styles.content}>
//           <View style={styles.artworkContainer}>
//             <FastImage
//               source={{ uri: paramSong.image.replace('150x150', '500x500') }}
//               style={styles.artwork}
//               resizeMode={FastImage.resizeMode.cover}
//             />
//           </View>

//           <View style={styles.songInfo}>
//             <View style={{ flex: 1, paddingRight: 16, alignItems: 'center' }}>
//               <Text style={[styles.songTitle, {color: colors?.lightMuted || '#fff'}]} numberOfLines={1}>
//                 {paramSong.song}
//               </Text>
//               <Text style={[styles.artistName, {color: colors?.muted || '#fff'}]} numberOfLines={1}>
//                 {paramSong.primary_artists}
//               </Text>
//             </View>
//           </View>
//         </View>

//         <View style={styles.bottomSection}>
//           <View style={styles.timeRow}>
//             <Text style={styles.timeText}>{formatTime(slideProgress ? slideProgress : progress.position)}</Text>
//             <CustomSlider
//               style={styles.slider}
//               min={0}
//               max={duration || 100}
//               progress={Math.floor(progress.position)}
//               minimumTrackTintColor="#FFFFFF"
//               maximumTrackTintColor="#FFFFFF"
//               thumbTintColor="#FFFFFF"
//               thumbSize={12}
//               onStart={handleSliderStart}
//               onUpdate={handleSliderUpdate}
//               onEnd={handleSliderEnd}
//             />
//             <Text style={styles.timeText}>{formatTime(duration)}</Text>
//           </View>
//           <View style={styles.controls}>
//             <TouchableOpacity 
//               onPress={handleTogglePlay}
//               style={styles.playButton}
//             >
//               <MaterialIcons 
//                 name={isPlaying ? "pause" : "play-arrow"} 
//                 size={35} 
//                 color="#000" 
//               />
//             </TouchableOpacity>
//           </View>
//         </View>
//       </SafeAreaView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   hiddenVideo: {
//     width: 0,
//     height: 0,
//     position: 'absolute',
//   },
//   container: {
//     flex: 1,
//     backgroundColor: '#000000',
//   },
//   backgroundGradient: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     height: '60%',
//   },
//   safeArea: {
//     flex: 1,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 24,
//     paddingTop: 16,
//   },
//   iconButton: {
//     padding: 8,
//   },
//   headerTitle: {
//     color: '#FFF',
//     fontSize: 10,
//     letterSpacing: 2,
//     fontWeight: '600',
//     opacity: 0.7,
//   },
//   content: {
//     paddingHorizontal: 24,
//     justifyContent: 'flex-start',
//     flex: 1,
//     paddingBottom: 48,

//   },
//   artworkContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginVertical: 32,
//   },
//   artwork: {
//     width: width - 60,
//     height: width - 60,
//     borderRadius: 12,
//     backgroundColor: '#1A1A1A',

//   },
//   songInfo: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 32,
//   },
//   songTitle: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: '#FFF',
//     marginBottom: 4,
//   },
//   artistName: {
//     fontSize: 16,
//     color: 'rgba(255,255,255,0.6)',
//     fontWeight: '500',
//   },
//   bottomSection: {
//     paddingHorizontal: 24,
//     paddingBottom: 40,
//   },
//   timeRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     // gap: 12,
//     marginBottom: 30,
//   },
//   slider: {
//     flex: 1,
//     height: 40,
//   },
//   timeText: {
//     fontSize: 12,
//     color: 'rgba(255,255,255,0.6)',
//     fontVariant: ['tabular-nums'],
//     width: 40,
//     textAlign: 'center',
//   },
//   controls: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-around',
//     paddingHorizontal: 20,
//   },
//   playButton: {
//     width: 60,
//     height: 60,
//     borderRadius: 36,
//     backgroundColor: '#FFF',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });

