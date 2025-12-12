import { Text, TouchableOpacity, StyleSheet, ScrollView, View } from 'react-native'
import type { ThemeColors } from '../../theme'
import { getTheme } from '../../theme'

type Pill = { key: string; label: string }
type Props = { pills: Pill[]; active: string; onChange: (key: string) => void; theme?: ThemeColors }

export default function FilterPills({ pills, active, onChange, theme }: Props) {
  const palette = theme ?? getTheme(false)
  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {pills.map(p => {
        const isActive = active === p.key
        return (
          <TouchableOpacity
            activeOpacity={0.7}
            accessibilityRole="button"
            key={p.key}
            onPress={() => onChange(p.key)}
            style={[
              styles.pill,
              {
                borderColor: isActive ? palette.primary : palette.border,
                backgroundColor: isActive ? palette.primary : palette.surface,
              },
            ]}
          >
            <Text style={[styles.text, { color: isActive ? '#ffffff' : palette.text }]}>{p.label}</Text>
          </TouchableOpacity>
        )
      })}
    </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  row: { gap: 8,  },
  pill: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, height: 40, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 14 },
})
