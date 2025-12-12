import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import type { Challenge } from "../types"
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import { getTheme } from "../theme"

interface ChallengeCardProps {
  challenge: Challenge
  onPress: () => void
  onShare: () => void
  darkMode?: boolean
}

export default function ChallengeCard({ challenge, onPress, onShare, darkMode = false }: ChallengeCardProps) {
  const completedDays = challenge.days.filter((d) => d.status === "done").length
  const percentage = Math.round((completedDays / challenge.duration) * 100)

  const t = getTheme(darkMode)
  const cardBg = t.surface
  const textColor = t.text
  const subTextColor = t.muted

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: cardBg, shadowColor: t.shadow }]} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>{challenge.name}</Text>
          <Text style={[styles.duration, { color: subTextColor }]}>{challenge.duration} days</Text>
        </View>
        <TouchableOpacity onPress={onShare} style={styles.shareButton}>
          <MaterialCommunityIcons name="share-variant" size={20} color={t.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: darkMode ? "#1E2A32" : "#E5F7F7" }]}>
            <View style={[styles.progressFill, { width: `${percentage}%`, backgroundColor: t.primary }]} />
          </View>
          <Text style={[styles.percentText, { color: subTextColor }]}>{percentage}%</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: textColor }]}>{completedDays}</Text>
            <Text style={[styles.statLabel, { color: subTextColor }]}>Completed</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: textColor }]}>{challenge.sharedWith.length}</Text>
            <Text style={[styles.statLabel, { color: subTextColor }]}>Friends</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  titleContainer: { flex: 1 },
  title: { fontSize: 18, fontWeight: "600", marginBottom: 4 },
  duration: { fontSize: 12 },
  shareButton: { padding: 8 },
  content: { gap: 12 },
  progressContainer: { flexDirection: "row", alignItems: "center", gap: 8 },
  progressBar: { flex: 1, height: 6, backgroundColor: "#E5F7F7", borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#0EA5A4" },
  percentText: { fontSize: 12, fontWeight: "600", minWidth: 35 },
  statsContainer: { flexDirection: "row", gap: 16 },
  stat: { flex: 1 },
  statValue: { fontSize: 20, fontWeight: "700", marginBottom: 2 },
  statLabel: { fontSize: 11 },
})
