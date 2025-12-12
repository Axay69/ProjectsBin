import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Image, Alert } from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React, { useEffect, useMemo, useState, useRef } from 'react'
import { useNotesStore } from '../lib/store'
import type { NotesStackParamList } from './Index'
import { getTheme, notePalette, pickNoteColor } from '../theme'
import { launchImageLibrary } from 'react-native-image-picker'
import RNFS from 'react-native-fs'
import type { MediaItem } from '../types'
import { SafeAreaView } from 'react-native-safe-area-context'
import ActionSheet from 'react-native-actions-sheet'
import AudioRecorderPlayer from 'react-native-audio-recorder-player'
import { useFocusEffect } from '@react-navigation/native'
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions'
import NoteWrapper from '../components/ui/NoteWrapper'

type Props = NativeStackScreenProps<NotesStackParamList, 'EditNote'>

export default function EditNotePage({ route, navigation }: Props) {
  const id = route.params?.id
  const get = useNotesStore(s => s.get)
  const add = useNotesStore(s => s.add)
  const update = useNotesStore(s => s.update)
  const darkMode = useNotesStore(s => s.darkMode)
  const colorMode = useNotesStore(s => s.colorMode)
  const fixedColor = useNotesStore(s => s.fixedColor)
  const setTheme = useNotesStore(s => s.setTheme)

  const existing = id ? get(id) : undefined
  const [title, setTitle] = useState(existing?.title ?? '')
  const [content, setContent] = useState(existing?.content ?? '')
  const [tags, setTags] = useState<string>((existing?.tags ?? []).join(', '))
  const [attachments, setAttachments] = useState<MediaItem[]>(existing?.media ?? [])
  const [color, setColor] = useState(existing?.color ?? pickNoteColor(colorMode, fixedColor))
  const [saving, setSaving] = useState(false)
  const [recording, setRecording] = useState(false)
  const audioActionSheetRef = useRef<any>(null)
  const audioRecorderPlayer = useRef<any>(null)

  useEffect(() => {
    // AudioRecorderPlayer - initialize as instance
    try {
      // @ts-ignore - AudioRecorderPlayer constructor signature
      audioRecorderPlayer.current = AudioRecorderPlayer;
    } catch (e) {
      console.error('AudioRecorderPlayer init error:', e)
      // Fallback: try using default export directly
      audioRecorderPlayer.current = AudioRecorderPlayer
    }
    return () => {
      if (audioRecorderPlayer.current && typeof audioRecorderPlayer.current.stopRecorder === 'function') {
        audioRecorderPlayer.current.stopRecorder().catch(() => {})
        if (typeof audioRecorderPlayer.current.removeRecordBackListener === 'function') {
          audioRecorderPlayer.current.removeRecordBackListener()
        }
      }
    }
  }, [])

  const theme = useMemo(() => getTheme(darkMode), [darkMode])

  useEffect(() => {
    if (existing) {
      setTitle(existing.title)
      setContent(existing.content)
      setTags((existing.tags ?? []).join(', '))
      setAttachments(existing.media ?? [])
      setColor(existing.color)
    }
  }, [id])

  // Refresh attachments when returning from sketch screen
  useFocusEffect(
    React.useCallback(() => {
      if (id) {
        const updated = get(id)
        if (updated) {
          setAttachments(updated.media ?? [])
        }
      }
    }, [id])
  )

  const parsedTags = useMemo(
    () => tags.split(',').map(t => t.trim()).filter(Boolean),
    [tags],
  )

  const ensureNoteId = () => {
    if (id) return id
    const created = add({ title: title || 'Untitled', content, tags: parsedTags, color, media: attachments })
    navigation.setParams({ id: created.id })
    return created.id
  }

  const save = async () => {
    if (!title.trim() && !content.trim()) {
      Alert.alert('Add a title or text', 'Please add at least a title or some content before saving.')
      return
    }
    setSaving(true)
    try {
    if (existing && id) {
        update(id, { title: title.trim() || 'Untitled', content: content.trim(), tags: parsedTags, color, media: attachments })
        navigation.goBack()
    } else {
        const n = add({ title, content, tags: parsedTags, color, media: attachments })
        navigation.goBack()
      }
    } finally {
      setSaving(false)
    }
  }

  const pickMedia = async (type: 'photo' | 'video') => {
    const res = await launchImageLibrary({ mediaType: type === 'photo' ? 'photo' : 'video', selectionLimit: 1 })
    const asset = res.assets?.[0]
    if (!asset || !asset.uri) return
    const src = asset.uri
    const dest = `${RNFS.DocumentDirectoryPath}/${Date.now()}_${asset.fileName ?? 'media'}`
    try {
      await RNFS.copyFile(src.replace('file://', ''), dest)
      const mediaType = type === 'photo' ? 'image' : 'video'
      const uri = `file://${dest}`
      const item: MediaItem = { id: `${Date.now()}_${mediaType}`, type: mediaType, uri, name: asset.fileName ?? mediaType }
      setAttachments(prev => [...prev, item])
    } catch (e) {
      Alert.alert('Unable to attach', 'Please try again after granting storage permission.')
    }
  }

  const showAudioOptions = () => {
    audioActionSheetRef.current?.show()
  }

  const pickAudioFile = async () => {
    audioActionSheetRef.current?.hide()
    // For now, create placeholder - user needs to add react-native-audio-recorder-player for recording
    const dest = `${RNFS.DocumentDirectoryPath}/${Date.now()}_audio.m4a`
    try {
      // Placeholder - in real implementation, use audio picker library
      await RNFS.writeFile(dest, '', 'utf8')
      const item: MediaItem = { id: `${Date.now()}_audio`, type: 'audio', uri: `file://${dest}`, name: 'Audio clip' }
      setAttachments(prev => [...prev, item])
      Alert.alert('Audio added', 'Audio file placeholder added. Install react-native-audio-recorder-player for full recording support.')
    } catch (e) {
      Alert.alert('Error', 'Could not add audio file.')
    }
  }

  const recordAudio = async () => {
    audioActionSheetRef.current?.hide()
    if (!audioRecorderPlayer.current) {
      Alert.alert('Error', 'Audio recorder not initialized')
      return
    }
    
    try {
      // Request microphone permission
      const permissionResult = await request(PERMISSIONS.ANDROID.RECORD_AUDIO)
      if (permissionResult !== RESULTS.GRANTED) {
        Alert.alert('Permission Required', 'Microphone permission is required to record audio.')
        return
      }

      if (recording) {
        // Stop recording
        const result = await audioRecorderPlayer.current.stopRecorder()
        audioRecorderPlayer.current.removeRecordBackListener()
        setRecording(false)
        
        if (result) {
          const item: MediaItem = { 
            id: `${Date.now()}_audio`, 
            type: 'audio', 
            uri: result, 
            name: `Recording ${new Date().toLocaleTimeString()}` 
          }
          setAttachments(prev => [...prev, item])
          Alert.alert('Success', 'Recording saved!')
        }
      } else {
        // Start recording
        const path = `${RNFS.DocumentDirectoryPath}/audio_${Date.now()}.m4a`
        const msg = await audioRecorderPlayer.current.startRecorder(path)
        audioRecorderPlayer.current.addRecordBackListener((e: any) => {
          // Recording progress callback - can be used to show duration
          console.log('Recording progress:', e.currentPosition)
        })
        setRecording(true)
        Alert.alert('Recording', 'Recording started. Tap "Stop Recording" to finish.', [
          {
            text: 'Stop Recording',
            onPress: async () => {
              if (!audioRecorderPlayer.current) return
              try {
                const result = await audioRecorderPlayer.current.stopRecorder()
                audioRecorderPlayer.current.removeRecordBackListener()
                setRecording(false)
                
                if (result) {
                  const item: MediaItem = { 
                    id: `${Date.now()}_audio`, 
                    type: 'audio', 
                    uri: result, 
                    name: `Recording ${new Date().toLocaleTimeString()}` 
                  }
                  setAttachments(prev => [...prev, item])
                  Alert.alert('Success', 'Recording saved!')
                }
              } catch (err) {
                console.error('Stop recording error:', err)
                Alert.alert('Error', 'Failed to stop recording')
                setRecording(false)
              }
            },
          },
        ])
      }
    } catch (error: any) {
      console.error('Recording error:', error)
      Alert.alert('Error', `Failed to record audio: ${error.message || 'Unknown error'}`)
      setRecording(false)
    }
  }

  const removeAttachment = (mid: string) => {
    setAttachments(prev => prev.filter(m => m.id !== mid))
  }

  const startSketch = async () => {
    const targetId = ensureNoteId()
    navigation.navigate('Sketch' as any, { id: targetId })
  }

  const rollColor = () => {
    const newColor = pickNoteColor(colorMode, fixedColor)
    setColor(newColor)
    // Apply color immediately to note if it exists
    if (id) {
      update(id, { color: newColor })
    }
  }

  const handleColorSelect = (selected: string) => {
    setColor(selected)
    // Apply color immediately to note if it exists
    if (id) {
      update(id, { color: selected })
    }
  }

  const setDefaultColor = (selected: string) => {
    setColor(selected)
    setTheme({ colorMode: 'fixed', fixedColor: selected })
    // Apply color immediately to note if it exists
    if (id) {
      update(id, { color: selected })
    }
  }

  const paletteRow = (
    <View style={styles.paletteRow}>
      {notePalette.map(c => {
        const isActive = c === color
        return (
          <TouchableOpacity
            key={c}
            activeOpacity={0.7}
            onPress={() => handleColorSelect(c)}
            onLongPress={() => setDefaultColor(c)}
            style={[styles.swatch, { backgroundColor: c, borderColor: isActive ? theme.text : theme.border, borderWidth: isActive ? 2 : 1 }]}
          />
        )
      })}
      <TouchableOpacity activeOpacity={0.7} onPress={rollColor} style={[styles.swatch, styles.randomSwatch, { borderColor: theme.border }]}>
        <Text style={[styles.randomText, { color: theme.text }]}>🎲</Text>
      </TouchableOpacity>
    </View>
  )

  const renderAttachment = (item: MediaItem) => {
    return (
      <View key={item.id} style={[styles.attachmentCard, { borderColor: theme.border, backgroundColor: theme.surface }]}>
        <View style={styles.attachmentRow}>
          {item.type === 'image' || item.type === 'sketch' ? (
            <Image source={{ uri: item.uri }} style={styles.attachmentThumb} />
          ) : (
            <View style={[styles.attachmentThumb, styles.attachmentPlaceholder, { backgroundColor: theme.muted }]}>
              <Text style={{ color: theme.text }}>{item.type === 'video' ? '🎞️' : '🎧'}</Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={[styles.attachmentTitle, { color: theme.text }]} numberOfLines={1}>{item.name ?? item.type}</Text>
            <Text style={[styles.attachmentMeta, { color: theme.subtext }]}>{item.type.toUpperCase()}</Text>
          </View>
          <TouchableOpacity activeOpacity={0.7} onPress={() => removeAttachment(item.id)} style={[styles.removeBtn, { backgroundColor: theme.muted }]}>
            <Text style={[styles.removeBtnText, { color: theme.text }]}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <NoteWrapper noteColor={color} darkMode={darkMode}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Fixed Header */}
        <View style={[styles.headerContainer, { borderBottomColor: theme.border }]}>
          <Text style={[styles.header, { color: theme.text }]}>{existing ? 'Edit Note' : 'New Note'}</Text>
        </View>

      <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.label, { color: theme.subtext }]}>Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Title"
          placeholderTextColor={theme.subtext}
          style={[styles.input, { borderColor: theme.border, backgroundColor: theme.surface, color: theme.text }]}
        />
        <Text style={[styles.label, { color: theme.subtext }]}>Content</Text>
        <TextInput
          value={content}
          onChangeText={setContent}
          placeholder="Write here"
          placeholderTextColor={theme.subtext}
          style={[{borderWidth: 1, borderRadius: 12, paddingHorizontal: 12,}, styles.textarea, { borderColor: theme.border, backgroundColor: theme.surface, color: theme.text }]}
          multiline
          textAlignVertical="top"
        />
        <Text style={[styles.label, { color: theme.subtext }]}>Tags (comma separated)</Text>
        <TextInput
          value={tags}
          onChangeText={setTags}
          placeholder="Work, Personal"
          placeholderTextColor={theme.subtext}
          style={[styles.input, { borderColor: theme.border, backgroundColor: theme.surface, color: theme.text }]}
        />

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Background color</Text>
          <Text style={[styles.sectionHint, { color: theme.subtext }]}>Tap to pick, long-press to set default</Text>
        </View>
        {paletteRow}

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Attachments</Text>
          <Text style={[styles.sectionHint, { color: theme.subtext }]}>Add media and remove before saving</Text>
        </View>
        <View style={styles.attachRow}>
          <TouchableOpacity activeOpacity={0.7} accessibilityLabel="Attach Image" onPress={() => pickMedia('photo')} style={[styles.attachBtn, { backgroundColor: theme.primary }]}>
            <Text style={styles.attachText}>Image</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7} accessibilityLabel="Attach Video" onPress={() => pickMedia('video')} style={[styles.attachBtn, { backgroundColor: theme.primary }]}>
            <Text style={styles.attachText}>Video</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7} accessibilityLabel="Attach Audio" onPress={showAudioOptions} style={[styles.attachBtn, { backgroundColor: theme.primary }]}>
            <Text style={styles.attachText}>Audio</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7} accessibilityLabel="Sketch" onPress={startSketch} style={[styles.attachBtn, { backgroundColor: theme.primary }]}>
            <Text style={styles.attachText}>Sketch</Text>
          </TouchableOpacity>
        </View>

        {attachments.length ? (
          <View style={styles.attachmentsList}>
            {attachments.map(renderAttachment)}
          </View>
        ) : (
          <Text style={[styles.placeholder, { color: theme.subtext }]}>No attachments yet.</Text>
        )}

      </ScrollView>
      </View>

      {/* Fixed Footer with Save Button */}
      <SafeAreaView edges={['bottom']} style={[styles.footerContainer, { borderTopColor: theme.border }]}>
        <TouchableOpacity
          activeOpacity={0.7}
          accessibilityRole="button"
          onPress={save}
          disabled={saving}
          style={[styles.save, { backgroundColor: theme.primary, opacity: saving ? 0.8 : 1 }]}
        >
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Save</Text>}
        </TouchableOpacity>
      </SafeAreaView>

      {/* Audio Action Sheet */}
      <ActionSheet
        ref={audioActionSheetRef}
        containerStyle={{ backgroundColor: theme.surface }}
        gestureEnabled={true}
      >
        <View style={[styles.actionSheetContent, { backgroundColor: theme.surface }]}>
          <Text style={[styles.actionSheetTitle, { color: theme.text }]}>Add Audio</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={pickAudioFile}
            style={[styles.actionSheetOption, { borderBottomColor: theme.border }]}
          >
            <Text style={[styles.actionSheetOptionText, { color: theme.text }]}>📁 Pick from Library</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={recordAudio}
            style={styles.actionSheetOption}
          >
            <Text style={[styles.actionSheetOptionText, { color: theme.text }]}>
              {recording ? '⏹ Stop Recording' : '🎤 Record Audio'}
            </Text>
          </TouchableOpacity>
        </View>
        </ActionSheet>
      </SafeAreaView>
    </NoteWrapper>
    )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  header: { fontSize: 28, fontWeight: '700' },
  scrollView: { flex: 1 },
  scroll: { padding: 16, gap: 10, flexGrow: 1, paddingBottom: 20 },
  footerContainer: { paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1 },
  label: { marginTop: 6, marginBottom: 4, fontSize: 13, fontWeight: '600' },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, height: 46 },
  textarea: { minHeight: 200, paddingVertical: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  sectionHint: { fontSize: 12 },
  paletteRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
  swatch: { width: 36, height: 36, borderRadius: 18, borderWidth: 1 },
  randomSwatch: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  randomText: { fontSize: 16 },
  attachRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  attachBtn: { borderRadius: 12, paddingHorizontal: 12, height: 42, alignItems: 'center', justifyContent: 'center' },
  attachText: { color: '#fff', fontWeight: '700' },
  attachmentsList: { gap: 10, marginTop: 8 },
  attachmentCard: { borderWidth: 1, borderRadius: 12, padding: 8 },
  attachmentRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  attachmentThumb: { width: 52, height: 52, borderRadius: 12, backgroundColor: '#E5E7EB' },
  attachmentPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  attachmentTitle: { fontSize: 14, fontWeight: '700' },
  attachmentMeta: { fontSize: 12 },
  removeBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  removeBtnText: { fontSize: 14, fontWeight: '700' },
  placeholder: { marginTop: 4 },
  save: { borderRadius: 14, alignItems: 'center', justifyContent: 'center', height: 48 },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  actionSheetContent: { padding: 20 },
  actionSheetTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  actionSheetOption: { paddingVertical: 16, borderBottomWidth: 1 },
  actionSheetOptionText: { fontSize: 16 },
})
