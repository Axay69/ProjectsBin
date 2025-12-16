import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useMemo, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useNotesStore } from '../lib/store';
import type { Note } from '../types';
import NoteCard from '../components/ui/NoteCard';
import FilterPills from '../components/ui/FilterPills';
import QuickAddFab from '../components/ui/QuickAddFab';
import { getTheme } from '../theme';

export type NotesStackParamList = {
  Index: undefined;
  NoteDetail: { id: string };
  EditNote: { id?: string };
  Sketch: { id?: string };
};

import type { NotesTabParamList } from '../NotesNavigator';

type Props = CompositeScreenProps<
  BottomTabScreenProps<NotesTabParamList, 'Home'>,
  NativeStackScreenProps<NotesStackParamList, 'Index'>
>;

const pills = [
  { key: 'all', label: 'All' },
  { key: 'image', label: 'Images' },
  { key: 'video', label: 'Videos' },
  { key: 'audio', label: 'Audio' },
  { key: 'sketch', label: 'Sketches' },
];

export default function Index({ navigation }: Props) {
  const notes = useNotesStore(s => s.notes);
  const remove = useNotesStore(s => s.remove);
  const darkMode = useNotesStore(s => s.darkMode);
  const theme = getTheme(darkMode);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<
    'all' | 'image' | 'audio' | 'sketch' | 'video'
  >('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return notes.filter(n => {
      const matchesQuery =
        !q ||
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q);
      const matchesFilter =
        filter === 'all' ? true : (n.media ?? []).some(m => m.type === filter);
      return matchesQuery && matchesFilter;
    });
  }, [notes, query, filter]);

  const confirmDelete = (item: Note) => {
    Alert.alert('Delete note?', `Remove "${item.title || 'Untitled'}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => remove(item.id),
      },
    ]);
  };

  const renderItem = ({ item }: { item: Note }) => (
    <NoteCard
      note={item}
      theme={theme}
      filter={filter}
      onPress={() =>
        navigation.navigate({ name: 'NoteDetail', params: { id: item.id } })
      }
      onLongPress={() => confirmDelete(item)}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.headerBar}>
        <Text style={[styles.logo, { color: theme.text }]}>📝</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Field Notes
          </Text>
          <Text style={[styles.subheader, { color: theme.subtext }]}>
            Capture thoughts, media, and sketches
          </Text>
        </View>
      </View>
      <View style={styles.searchRow}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search title or text"
          placeholderTextColor={theme.subtext}
          style={[
            styles.input,
            {
              borderColor: theme.border,
              backgroundColor: theme.surface,
              color: theme.text,
            },
          ]}
        />
      </View>
      <FilterPills
        pills={pills}
        active={filter}
        onChange={key => setFilter(key as any)}
        theme={theme}
      />
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        style={{ marginTop: 12 }}
        contentContainerStyle={[styles.list, { paddingBottom: 120 }]}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              No notes yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.subtext }]}>
              Create your first note with the plus button.
            </Text>
          </View>
        }
      />
      <QuickAddFab
        onPress={() =>
          navigation.navigate({ name: 'EditNote', params: { id: undefined } })
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  logo: { fontSize: 22 },
  headerTitle: { fontSize: 26, fontWeight: '700' },
  subheader: { fontSize: 13 },
  headerAction: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActionText: { color: '#fff', fontSize: 22, fontWeight: '700' },
  searchRow: { flexDirection: 'row', gap: 8, marginTop: 8, marginBottom: 10 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
  },
  list: { marginTop: 4, gap: 10 },
  empty: { alignItems: 'center', padding: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptySubtitle: { marginTop: 6 },
});
