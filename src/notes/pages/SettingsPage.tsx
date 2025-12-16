import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useNotesStore } from '../lib/store';
import { getTheme, notePalette } from '../theme';

export default function SettingsPage() {
  const darkMode = useNotesStore(s => s.darkMode);
  const setThemeState = useNotesStore(s => s.setTheme);
  const colorMode = useNotesStore(s => s.colorMode);
  const fixedColor = useNotesStore(s => s.fixedColor);
  const clearAll = useNotesStore(s => s.clearAll);
  const notesCount = useNotesStore(s => s.notes.length);
  const theme = getTheme(darkMode);

  const confirmClear = () => {
    Alert.alert(
      'Delete all notes?',
      'This will remove every note and attachment.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: clearAll },
      ],
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bg }]}
      contentContainerStyle={{ padding: 16, gap: 12 }}
    >
      <Text style={[styles.header, { color: theme.text }]}>Settings</Text>

      <View
        style={[
          styles.card,
          { borderColor: theme.border, backgroundColor: theme.surface },
        ]}
      >
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.text }]}>Dark Mode</Text>
          <Switch
            value={darkMode}
            onValueChange={v => setThemeState({ darkMode: v })}
          />
        </View>
        <View style={[styles.row, { marginTop: 12 }]}>
          <Text style={[styles.label, { color: theme.text }]}>
            Note color mode
          </Text>
          <View style={styles.row}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setThemeState({ colorMode: 'random' })}
              style={[
                styles.chip,
                {
                  backgroundColor:
                    colorMode === 'random' ? theme.primary : theme.muted,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: colorMode === 'random' ? '#fff' : theme.text },
                ]}
              >
                Random
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                setThemeState({
                  colorMode: 'fixed',
                  fixedColor: fixedColor ?? notePalette[0],
                })
              }
              style={[
                styles.chip,
                {
                  backgroundColor:
                    colorMode === 'fixed' ? theme.primary : theme.muted,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: colorMode === 'fixed' ? '#fff' : theme.text },
                ]}
              >
                Fixed
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {colorMode === 'fixed' ? (
          <View style={{ marginTop: 12 }}>
            <Text
              style={[styles.label, { color: theme.subtext, marginBottom: 8 }]}
            >
              Pick default color
            </Text>
            <View style={styles.paletteRow}>
              {notePalette.map(c => {
                const active = c === fixedColor;
                return (
                  <TouchableOpacity
                    key={c}
                    activeOpacity={0.7}
                    onPress={() => setThemeState({ fixedColor: c })}
                    style={[
                      styles.swatch,
                      {
                        backgroundColor: c,
                        borderColor: active ? theme.text : theme.border,
                        borderWidth: active ? 2 : 1,
                      },
                    ]}
                  />
                );
              })}
            </View>
          </View>
        ) : null}
      </View>

      <View
        style={[
          styles.card,
          { borderColor: theme.border, backgroundColor: theme.surface },
        ]}
      >
        <Text style={[styles.label, { color: theme.text, marginBottom: 8 }]}>
          Data
        </Text>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.action}
          onPress={confirmClear}
        >
          <Text style={[styles.actionText, { color: theme.danger }]}>
            Delete all notes ({notesCount})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.7} style={styles.action}>
          <Text style={[styles.actionText, { color: theme.text }]}>
            Export (coming soon)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.7} style={styles.action}>
          <Text style={[styles.actionText, { color: theme.text }]}>
            Import (coming soon)
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { fontSize: 28, fontWeight: '700', marginBottom: 4 },
  card: { borderRadius: 16, padding: 16, borderWidth: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  label: { fontSize: 16 },
  action: { paddingVertical: 12 },
  actionText: { fontSize: 16 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginLeft: 8,
  },
  chipText: { fontWeight: '700' },
  paletteRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  swatch: { width: 32, height: 32, borderRadius: 16 },
});
