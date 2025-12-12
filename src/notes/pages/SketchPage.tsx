import { View, StyleSheet, TouchableOpacity, Text } from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { getTheme, pickNoteColor, notePalette } from '../theme'
import { useNotesStore } from '../lib/store'
import { SketchCanvas } from '@terrylinla/react-native-sketch-canvas'
import type { MediaItem } from '../types'
import React, { useState, useRef, useEffect } from 'react'
import { captureRef } from 'react-native-view-shot'
import RNFS from 'react-native-fs'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFocusEffect } from '@react-navigation/native'

type NotesStackParamList = {
  Index: undefined
  NoteDetail: { id: string }
  EditNote: { id?: string }
  Sketch: { id?: string }
}

type Props = NativeStackScreenProps<NotesStackParamList, 'Sketch'>

export default function SketchPage({ route, navigation }: Props) {
  const noteId = route.params?.id
  const add = useNotesStore(s => s.add)
  const update = useNotesStore(s => s.update)
  const get = useNotesStore(s => s.get)
  const darkMode = useNotesStore(s => s.darkMode)
  const colorMode = useNotesStore(s => s.colorMode)
  const fixedColor = useNotesStore(s => s.fixedColor)
  const theme = getTheme(darkMode)
  const [strokeColor, setStrokeColor] = useState(theme.text)
  const [hasDrawn, setHasDrawn] = useState(false)
  const canvasRef = useRef<View>(null)

  // Auto-save sketch when navigating back if user has drawn something
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        // This runs when screen loses focus (user navigates away)
        if (hasDrawn && canvasRef.current) {
          handleAutoSave()
        }
      }
    }, [hasDrawn])
  )

  const handleAutoSave = async () => {
    if (!canvasRef.current || !noteId) return
    try {
      const uri = await captureRef(canvasRef.current, {
        format: 'png',
        quality: 1,
      })
      const dest = `${RNFS.DocumentDirectoryPath}/sketch_${Date.now()}.png`
      await RNFS.copyFile(uri.replace('file://', ''), dest)
      const finalUri = `file://${dest}`
      const item: MediaItem = { id: `${Date.now()}_sketch`, type: 'sketch', uri: finalUri, name: 'Sketch' }
      const existing = get(noteId)
      const media = [...(existing?.media ?? []), item]
      update(noteId, { media })
    } catch (e) {
      console.error('Failed to auto-save sketch:', e)
    }
  }

  const handleSave = async () => {
    if (!canvasRef.current) return
    try {
      const uri = await captureRef(canvasRef.current, {
        format: 'png',
        quality: 1,
      })
      const dest = `${RNFS.DocumentDirectoryPath}/sketch_${Date.now()}.png`
      await RNFS.copyFile(uri.replace('file://', ''), dest)
      const finalUri = `file://${dest}`
      const item: MediaItem = { id: `${Date.now()}_sketch`, type: 'sketch', uri: finalUri, name: 'Sketch' }
      let id = noteId
      if (!id) {
        const created = add({ title: 'Sketch Note', content: '', tags: [], color: pickNoteColor(colorMode, fixedColor), media: [item] })
        id = created.id
      } else {
        const existing = get(id)
        const media = [...(existing?.media ?? []), item]
        update(id, { media })
      }
      navigation.goBack()
    } catch (e) {
      console.error('Failed to save sketch:', e)
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top']}>
      <View style={styles.toolbar}>
        <Text style={[styles.toolbarTitle, { color: theme.text }]}>Sketch</Text>
        <View style={styles.colorPicker}>
          {notePalette.slice(0, 6).map(c => (
            <TouchableOpacity
              key={c}
              activeOpacity={0.7}
              onPress={() => setStrokeColor(c)}
              style={[
                styles.colorSwatch,
                { backgroundColor: c, borderColor: strokeColor === c ? theme.primary : theme.border, borderWidth: strokeColor === c ? 3 : 1 },
              ]}
            />
          ))}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setStrokeColor(theme.text)}
            style={[
              styles.colorSwatch,
              { backgroundColor: theme.text, borderColor: strokeColor === theme.text ? theme.primary : theme.border, borderWidth: strokeColor === theme.text ? 3 : 1 },
            ]}
          />
        </View>
      </View>
      <View style={[styles.canvasContainer, { borderColor: theme.border, backgroundColor: '#FFFFFF' }]}>
        <View ref={canvasRef} collapsable={false} style={[{flex: 1, backgroundColor: '#FFFFFF',}]}>
          <SketchCanvas
            style={styles.canvas}
            strokeColor={strokeColor}
            strokeWidth={4}
            onStrokeEnd={() => setHasDrawn(true)}
          />
        </View>
      </View>
      <SafeAreaView edges={['bottom']} style={[styles.footer, { backgroundColor: theme.bg, borderTopColor: theme.border }]}>
        <TouchableOpacity
          activeOpacity={0.7}
          accessibilityLabel="Save"
          onPress={handleSave}
          style={[styles.btn, { backgroundColor: theme.primary }]}
        >
          <Text style={styles.btnText}>Save</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  toolbar: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  toolbarTitle: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  colorPicker: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  colorSwatch: { width: 32, height: 32, borderRadius: 16 },
  canvasContainer: { flex: 1, margin: 16, borderRadius: 12, borderWidth: 2, overflow: 'hidden' },
  canvas: { flex: 1 },
  footer: { paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1 },
  btn: { height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
})
