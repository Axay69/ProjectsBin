import { View, Text, StyleSheet, TextInput, FlatList } from 'react-native';
import { useMemo, useState } from 'react';
import { useNotesStore } from '../lib/store';
import type { Note } from '../types';
import NoteCard from '../components/ui/NoteCard';
import { getTheme } from '../theme';
import { useNavigation } from '@react-navigation/native';

export default function SearchPage() {
  const notes = useNotesStore(s => s.notes);
  const darkMode = useNotesStore(s => s.darkMode);
  const theme = getTheme(darkMode);
  const navigation = useNavigation<any>();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return notes.filter(
      n =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q),
    );
  }, [notes, query]);

  const renderItem = ({ item }: { item: Note }) => (
    <NoteCard
      note={item}
      theme={theme}
      onPress={() => navigation.navigate('NoteDetail', { id: item.id })}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Text style={[styles.header, { color: theme.text }]}>Search</Text>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search notes"
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
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={[styles.list, { paddingBottom: 60 }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 28, fontWeight: '700', marginBottom: 12 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, height: 44 },
  list: { marginTop: 16, gap: 10 },
});
