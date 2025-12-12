import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useNotesStore } from '../lib/store'
import type { NotesStackParamList } from './Index'
import { getTheme } from '../theme'
import { useState, useCallback } from 'react'
import type { MediaItem } from '../types'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFocusEffect } from '@react-navigation/native'
import NoteWrapper from '../components/ui/NoteWrapper'

type Props = NativeStackScreenProps<NotesStackParamList, 'NoteDetail'>

export default function NoteDetailPage({ route, navigation }: Props) {
  const { id } = route.params
  const get = useNotesStore(s => s.get)
  const remove = useNotesStore(s => s.remove)
  const darkMode = useNotesStore(s => s.darkMode)
  const theme = getTheme(darkMode)
  const [note, setNote] = useState(get(id))
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null)

  // Refresh note data when screen comes into focus (e.g., after editing)
  useFocusEffect(
    useCallback(() => {
      const updated = get(id)
      if (updated) {
        setNote(updated)
      }
    }, [id, get])
  )

  if (!note) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        <Text style={[styles.empty, { color: theme.text }]}>Note not found</Text>
      </View>
    )
  }

  const confirmDelete = () => {
    Alert.alert('Delete note?', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          remove(id)
          navigation.goBack()
        },
      },
    ])
  }

  const openMediaPreview = (media: MediaItem) => {
    navigation.navigate('MediaPreview' as any, { media })
  }

  return (
    <NoteWrapper noteColor={note.color} darkMode={darkMode}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <View style={styles.hero}>
          <Text style={[styles.heroTitle, { color: theme.text }]} numberOfLines={2}>{note.title || 'Untitled'}</Text>
          <Text style={[styles.heroMeta, { color: theme.subtext }]}>
            {new Date(note.createdAt).toLocaleString()}
            {note.updatedAt ? ` • Updated ${new Date(note.updatedAt).toLocaleTimeString()}` : ''}
          </Text>
        </View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.contentCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.body, { color: theme.text }]}>{note.content || 'No content yet.'}</Text>
            {note.tags?.length ? (
              <View style={styles.tagsRow}>
                {note.tags.map(tag => (
                  <View key={tag} style={[styles.tag, { borderColor: theme.border, backgroundColor: theme.muted }]}>
                    <Text style={[styles.tagText, { color: theme.text }]}>#{tag}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
          {note.media?.length ? (
            <View style={styles.mediaGrid}>
              {note.media.map(m => (
                <TouchableOpacity
                  key={m.id}
                  activeOpacity={0.7}
                  onPress={() => openMediaPreview(m)}
                  style={[styles.mediaCard, { borderColor: theme.border, backgroundColor: theme.surface }]}
                >
                  {m.type === 'image' || m.type === 'sketch' ? (
                    <Image source={{ uri: m.uri }} style={styles.mediaImage} />
                  ) : (
                    <View style={[styles.mediaPlaceholder, { backgroundColor: theme.muted }]}>
                      <Text style={{ color: theme.text, fontSize: 24 }}>{m.type === 'video' ? '🎞️' : '🎧'}</Text>
                      <Text style={{ color: theme.text, fontSize: 12, marginTop: 4 }}>{m.type === 'video' ? 'Video' : 'Audio'}</Text>
                    </View>
                  )}
                  <Text style={[styles.mediaLabel, { color: theme.text }]} numberOfLines={1}>{m.name ?? m.type}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
        </ScrollView>
        <SafeAreaView edges={['bottom']} style={[styles.row, { borderTopColor: theme.border }]}>
          <TouchableOpacity activeOpacity={0.7} accessibilityRole="button" style={[styles.btn, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={() => navigation.navigate('EditNote', { id })}>
            <Text style={[styles.btnText, { color: theme.text }]}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7} accessibilityRole="button" style={[styles.btn, { backgroundColor: theme.danger }]} onPress={confirmDelete}>
            <Text style={[styles.btnText, { color: '#fff' }]}>Delete</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </SafeAreaView>

      
    </NoteWrapper>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: { padding: 16 },
  heroTitle: { fontSize: 24, fontWeight: '800' },
  heroMeta: { marginTop: 4, fontSize: 12 },
  content: { padding: 16, gap: 12, flexGrow: 1 },
  contentCard: { padding: 16, borderRadius: 12, marginBottom: 12 },
  body: { fontSize: 16, lineHeight: 24 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1 },
  tagText: { fontSize: 13, fontWeight: '600' },
  mediaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 },
  mediaCard: { width: '47%', borderWidth: 1, borderRadius: 12, padding: 8 },
  mediaImage: { width: '100%', height: 120, borderRadius: 10, marginBottom: 8 },
  mediaPlaceholder: { height: 120, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  mediaLabel: { fontSize: 13, fontWeight: '600' },
  row: { flexDirection: 'row', gap: 12, padding: 16, borderTopWidth: 1 },
  btn: { flex: 1, borderRadius: 10, alignItems: 'center', justifyContent: 'center', height: 46, borderWidth: 1 },
  btnText: { fontWeight: '700' },
  empty: { textAlign: 'center', marginTop: 40, fontSize: 16 },
})
