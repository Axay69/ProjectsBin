import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, StatusBar, StatusBarProps } from 'react-native'
import { useEffect, useRef, useState } from 'react'
import Video from 'react-native-video'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { MediaItem } from '../types'
import { getTheme } from '../theme'
import { useNotesStore } from '../lib/store'

type NotesStackParamList = {
  MediaPreview: { media: MediaItem }
}

type Props = NativeStackScreenProps<NotesStackParamList, 'MediaPreview'>

export default function MediaPreviewScreen({ route, navigation }: Props) {
  const { media } = route.params
  const darkMode = useNotesStore(s => s.darkMode)
  const theme = getTheme(darkMode)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const videoRef = useRef<any>(null)
  const audioRef = useRef<any>(null)

  useEffect(() => {
    let entry: StatusBarProps;
    entry = StatusBar.pushStackEntry({
      // hidden: true,
      translucent: true,
    })
    setTimeout(() => {entry = StatusBar.pushStackEntry({
      hidden: true,
      translucent: true,
    })}, 100);

    return () => {
      StatusBar.popStackEntry(entry);
    }
  }, [])

  const handlePlayPause = () => {
    setPlaying(p => !p)
  }

  const handleReplay = () => {
    if (videoRef.current) videoRef.current.seek(0)
    if (audioRef.current) audioRef.current.seek(0)
    setCurrentTime(0)
    setPlaying(true)
  }

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const renderContent = () => {
    if (media.type === 'image' || media.type === 'sketch') {
      return (
        <View style={styles.imageContainer}>
          <Image source={{ uri: media.uri }} style={styles.fullImage} resizeMode="contain" />
        </View>
      )
    }
    if (media.type === 'video') {
      return (
        <View style={styles.videoContainer}>
          <Video
            ref={videoRef}
            source={{ uri: media.uri }}
            style={styles.video}
            paused={!playing}
            onLoad={(data) => setDuration(data.duration * 1000)}
            onProgress={(data) => setCurrentTime(data.currentTime * 1000)}
            onEnd={() => setPlaying(false)}
            resizeMode="contain"
          />
          <View style={styles.videoControls}>
            <TouchableOpacity activeOpacity={0.7} onPress={handlePlayPause} style={[styles.controlBtn, { backgroundColor: theme.surface }]}> 
              <Text style={[styles.controlText, { color: theme.text }]}>{playing ? '⏸' : '▶'}</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.7} onPress={handleReplay} style={[styles.controlBtn, { backgroundColor: theme.surface }]}> 
              <Text style={[styles.controlText, { color: theme.text }]}>↻</Text>
            </TouchableOpacity>
            <Text style={[styles.timeText, { color: theme.text, }]}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </Text>
          </View>
        </View>
      )
    }
    if (media.type === 'audio') {
      return (
        <View style={[styles.audioContainer, { backgroundColor: theme.surface }]}> 
          <Text style={[styles.audioTitle, { color: theme.text }]}>{media.name ?? 'Audio'}</Text>
          <Video
            ref={audioRef}
            source={{ uri: media.uri }}
            paused={!playing}
            onLoad={(data) => setDuration(data.duration * 1000)}
            onProgress={(data) => setCurrentTime(data.currentTime * 1000)}
            onEnd={() => setPlaying(false)}
            style={{ width: 0, height: 0, position: 'absolute' }}
            resizeMode="contain"
          />
          <View style={styles.audioControls}>
            <TouchableOpacity activeOpacity={0.7} onPress={handlePlayPause} style={[styles.audioBtn, { backgroundColor: theme.primary }]}> 
              <Text style={styles.audioBtnText}>{playing ? '⏸' : '▶'}</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.7} onPress={handleReplay} style={[styles.audioBtn, { backgroundColor: theme.muted }]}> 
              <Text style={[styles.audioBtnText, { color: theme.text }]}>↻</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.timeText, { color: theme.subtext }]}>
            {formatTime(currentTime)} / {formatTime(duration || (media.durationMs ?? 0))}
          </Text>
        </View>
      )
    }
    return null
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}> 
    
      <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.goBack()} style={[styles.closeIconBtn, { backgroundColor: theme.surface }]}> 
        <Text style={[styles.closeIconText, { color: theme.text }]}>X</Text>
      </TouchableOpacity>
      <View style={styles.content}>{renderContent()}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  imageContainer: { width: '100%', height: '100%' },
  fullImage: { width: '100%', height: '100%' },
  videoContainer: { width: '100%', height: '100%', justifyContent: 'center' },
  video: { width: '100%', height: '100%' },
  videoControls: { position: 'absolute',bottom: 24, left: 12, right: 12, flexDirection:  'row', alignItems: 'center', gap: 12, marginTop: 16, paddingHorizontal: 16 },
  controlBtn: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  controlText: { fontSize: 20 },
  audioContainer: { width: '100%', padding: 24, borderRadius: 16, alignItems: 'center', gap: 16 },
  audioTitle: { fontSize: 18, fontWeight: '700' },
  audioControls: { flexDirection: 'row', gap: 16 },
  audioBtn: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  audioBtnText: { fontSize: 24, color: '#fff' },
  timeText: { fontSize: 14, fontWeight: 'bold' },
  closeIconBtn: { position: 'absolute', top: 24 + (StatusBar.currentHeight || 0), right: 30, width: 34, height: 34, borderRadius: 22, alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  closeIconText: { fontSize: 20, fontWeight: '700' },
})

