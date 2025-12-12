import { TouchableOpacity, StyleSheet, Text } from 'react-native'
import { getTheme } from '../../theme'
import { useNotesStore } from '../../lib/store'

type Props = { onPress: () => void }

export default function QuickAddFab({ onPress }: Props) {
  const darkMode = useNotesStore(s => s.darkMode)
  const theme = getTheme(darkMode)
  return (
    <TouchableOpacity accessibilityRole="button" activeOpacity={0.7} onPress={onPress} style={[styles.fab, { backgroundColor: theme.primary }]}>
      <Text style={styles.label}>＋</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  label: { color: '#fff', fontSize: 24, fontWeight: '700' },
})
