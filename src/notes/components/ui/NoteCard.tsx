import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import type { Note } from '../../types';
import type { ThemeColors } from '../../theme';
import { getTheme } from '../../theme';
import NoteWrapper from './NoteWrapper';
import { useNotesStore } from '../../lib/store';

type Props = {
  note: Note;
  onPress: () => void;
  onShare?: () => void;
  onDelete?: () => void;
  onLongPress?: () => void;
  theme?: ThemeColors;
  filter?: 'all' | 'image' | 'video' | 'audio' | 'sketch';
};

export default function NoteCard({
  note,
  onPress,
  onShare,
  onDelete,
  onLongPress,
  theme,
  filter = 'all',
}: Props) {
  const palette = theme ?? getTheme(false);
  const darkMode = useNotesStore(s => s.darkMode);
  const media = note.media ?? [];
  let previewType: 'image' | 'video' | 'audio' | 'sketch' | null = null;
  let previewUri: string | undefined;

  if (filter !== 'all') {
    const m = media.find(item => item.type === filter);
    if (m) {
      previewType = m.type;
      previewUri =
        m.type === 'image' || m.type === 'sketch' ? m.uri : m.thumbnailUri;
    } else if (note.thumbnailUri) {
      previewType = 'image';
      previewUri = note.thumbnailUri;
    }
  } else {
    if (note.thumbnailUri) {
      previewType = 'image';
      previewUri = note.thumbnailUri;
    } else {
      const m =
        media.find(item => item.type === 'image') ??
        media.find(item => item.type === 'sketch') ??
        media.find(item => item.type === 'video') ??
        media.find(item => item.type === 'audio');
      if (m) {
        previewType = m.type;
        previewUri =
          m.type === 'image' || m.type === 'sketch' ? m.uri : m.thumbnailUri;
      }
    }
  }
  const showThumb = !!previewType;
  return (
    <NoteWrapper
      noteColor={note.color || palette.surface}
      darkMode={darkMode}
      style={{ borderRadius: 16 }}
    >
      <TouchableOpacity
        accessibilityRole="button"
        activeOpacity={0.7}
        onPress={onPress}
        onLongPress={onLongPress}
        style={[styles.card, { borderColor: palette.border }]}
      >
        <View style={styles.row}>
          {showThumb ? (
            <View
              style={[styles.thumbBox, { backgroundColor: palette.surface }]}
            >
              {(previewType === 'image' || previewType === 'sketch') &&
              previewUri ? (
                <Image
                  source={{ uri: previewUri }}
                  style={styles.thumb}
                  accessibilityLabel={note.title}
                />
              ) : previewType === 'video' && previewUri ? (
                <Image
                  source={{ uri: previewUri }}
                  style={styles.thumb}
                  accessibilityLabel={`${note.title} video`}
                />
              ) : previewType === 'video' ? (
                <View style={[styles.thumbIcon]}>
                  <Text style={{ fontSize: 24 }}>🎞️</Text>
                </View>
              ) : previewType === 'audio' ? (
                <View style={[styles.thumbIcon]}>
                  <Text style={{ fontSize: 24 }}>🎧</Text>
                </View>
              ) : null}
            </View>
          ) : null}
          <View style={styles.content}>
            <Text
              style={[styles.title, { color: palette.text }]}
              numberOfLines={1}
            >
              {note.title || 'Untitled'}
            </Text>
            <Text
              numberOfLines={2}
              style={[styles.preview, { color: palette.subtext }]}
            >
              {note.content || 'No content yet'}
            </Text>
            <View style={styles.metaRow}>
              <Text style={[styles.dateText, { color: palette.subtext }]}>
                {formatRelative(note.createdAt)}
              </Text>
              {note.tags?.length ? (
                <Text
                  style={[styles.tagsText, { color: palette.text }]}
                  numberOfLines={1}
                >
                  {note.tags.join(', ')}
                </Text>
              ) : null}
              {!!note.media?.length && (
                <View
                  style={[
                    styles.mediaBadge,
                    {
                      backgroundColor: palette.surface,
                      borderColor: palette.border,
                    },
                  ]}
                >
                  <Text style={[styles.mediaText, { color: palette.text }]}>
                    {note.media.length} file{note.media.length > 1 ? 's' : ''}
                  </Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.actions}>
            {onShare ? (
              <TouchableOpacity
                accessibilityLabel="Share"
                activeOpacity={0.7}
                onPress={onShare}
                style={[styles.iconBtn, styles.share]}
              >
                <Text style={styles.iconLabel}>⇪</Text>
              </TouchableOpacity>
            ) : null}
            {onDelete ? (
              <TouchableOpacity
                accessibilityLabel="Delete"
                activeOpacity={0.7}
                onPress={onDelete}
                style={[styles.iconBtn, styles.delete]}
              >
                <Text style={styles.iconLabel}>✕</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    </NoteWrapper>
  );
}

function formatRelative(ts: number) {
  const delta = Date.now() - ts;
  const d = Math.floor(delta / 86400000);
  if (d <= 0) return 'Today';
  if (d === 1) return '1 day ago';
  return `${d} days ago`;
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  thumbBox: {
    width: 64,
    height: 64,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
    marginRight: 12,
  },
  thumb: { width: '100%', height: '100%' },
  thumbIcon: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, gap: 4 },
  title: { fontSize: 16, fontWeight: '700' },
  preview: { fontSize: 14 },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  dateText: { fontSize: 12 },
  tagsText: { fontSize: 12 },
  mediaBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  mediaText: { fontSize: 12, fontWeight: '600' },
  actions: { gap: 6 },
  iconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLabel: { fontSize: 14, color: '#111827' },
  share: { backgroundColor: '#ECFEFF' },
  delete: { backgroundColor: '#FFF1F2' },
});
