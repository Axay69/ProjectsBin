import { View, Text, StyleSheet } from "react-native"

interface ProgressRingProps {
  current: number
  total: number
  size?: number
  primaryColor?: string
  darkMode?: boolean
}

export default function ProgressRing({ current, total, size = 120, primaryColor = "#0EA5A4", darkMode = false }: ProgressRingProps) {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0
  const ringThickness = Math.max(6, Math.floor(size * 0.08))
  const bg = darkMode ? "#1F2937" : "#FFFFFF"
  const text = darkMode ? "#F3F4F6" : "#1F2937"
  const sub = darkMode ? "#9CA3AF" : "#6B7280"
  const track = darkMode ? "#2A3441" : "#E5E7EB"

  return (
    <View style={[styles.container, { width: size, height: size }]}> 
      <View style={[styles.ring, { borderWidth: ringThickness, borderColor: track, width: size, height: size, borderRadius: size / 2 }]}> 
        <View style={[styles.inner, { backgroundColor: bg, width: size - ringThickness * 2, height: size - ringThickness * 2, borderRadius: (size - ringThickness * 2) / 2 }]}> 
          <Text style={[styles.percent, { color: text }]}>{percent}%</Text>
          <Text style={[styles.subtext, { color: sub }]}>{current} of {total}</Text>
        </View>
      </View>
      <View style={[styles.progressOverlay, { width: size, height: size, borderRadius: size / 2, borderWidth: ringThickness, borderColor: primaryColor, opacity: 0.25 }]} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center" },
  ring: { alignItems: "center", justifyContent: "center" },
  inner: { alignItems: "center", justifyContent: "center" },
  percent: { fontSize: 24, fontWeight: "700" },
  subtext: { fontSize: 12, marginTop: 4 },
  progressOverlay: { position: "absolute", top: 0, left: 0 },
})

