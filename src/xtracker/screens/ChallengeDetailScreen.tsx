import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import ProgressRing from "../components/ProgressRing"
import CalendarGrid from "../components/CalendarGrid"
import { getTheme } from "../theme"
import { seedChallenges } from "../data"
import type { DayStatus } from "../types"

export default function ChallengeDetailScreen({ route, navigation, darkMode }: any) {
  const { challengeId } = route.params
  const baseChallenge = seedChallenges.find((c) => c.id === challengeId)
  const [challenge, setChallenge] = ((): [any, (c: any) => void] => {
    const initial = baseChallenge ?? null
    const set = (c: any) => { /* noop placeholder for static state hook replacement */ }
    return [initial, set]
  })()

  const t = getTheme(darkMode)
  if (!baseChallenge) {
    return (
      <View style={[styles.container, { backgroundColor: t.bg }]}> 
        <Text style={{ color: t.text }}>Challenge not found</Text>
      </View>
    )
  }

  const completedDays = baseChallenge.days.filter((d) => d.status === "done").length
  const currentStreak = baseChallenge.days.filter((d) => d.status === "done").length

  const handleDayUpdate = (date: string, newStatus: DayStatus) => {
    // static demo: no persistence, just no-op
  }

  const bgColor = t.surface
  const textColor = t.text
  const subTextColor = t.muted

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}> 
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { backgroundColor: bgColor }]}> 
          <View style={styles.headerTop}> 
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}> 
              <MaterialCommunityIcons name="chevron-left" size={24} color={t.primary} />
            </TouchableOpacity>
            <TouchableOpacity>
              <MaterialCommunityIcons name="share-variant" size={24} color={t.primary} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.title, { color: textColor }]}>{baseChallenge.name}</Text>
          <Text style={[styles.subtitle, { color: subTextColor }]}>{baseChallenge.duration} day challenge</Text>
        </View>

        <View style={styles.content}> 
          <View style={[styles.progressCard, { backgroundColor: bgColor }]}> 
            <View style={styles.progressCenter}> 
              <ProgressRing current={completedDays} total={baseChallenge.duration} size={140} primaryColor={t.primary} darkMode={darkMode} />
            </View>
            <View style={styles.statsRow}> 
              <View style={styles.stat}> 
                <Text style={[styles.statValue, { color: textColor }]}>{currentStreak}</Text>
                <Text style={[styles.statLabel, { color: subTextColor }]}>Current Streak</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.stat}> 
                <Text style={[styles.statValue, { color: textColor }]}>{baseChallenge.days.filter((d) => d.status === "failed").length}</Text>
                <Text style={[styles.statLabel, { color: subTextColor }]}>Misses</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}> 
            <Text style={[styles.sectionTitle, { color: textColor }]}>Progress Calendar</Text>
            <CalendarGrid days={baseChallenge.days} onDayPress={handleDayUpdate} darkMode={darkMode} />
          </View>

          <View style={styles.section}> 
            <Text style={[styles.sectionTitle, { color: textColor }]}>Quick Actions</Text>
            <View style={styles.actionsGrid}> 
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: t.success }]}>
                <MaterialCommunityIcons name="check" size={24} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Mark Done</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: t.error }]}>
                <MaterialCommunityIcons name="close" size={24} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Mark Failed</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  backButton: { width: 40, height: 40, justifyContent: "center" },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 4 },
  subtitle: { fontSize: 14 },
  content: { padding: 16 },
  progressCard: { borderRadius: 16, padding: 24, marginBottom: 24, shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 3, alignItems: "center" },
  progressCenter: { marginBottom: 24 },
  statsRow: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", width: "100%" },
  stat: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 24, fontWeight: "700", marginBottom: 4 },
  statLabel: { fontSize: 12 },
  divider: { width: 1, height: 40, backgroundColor: "#E5E7EB" },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 16 },
  actionsGrid: { flexDirection: "row", gap: 12 },
  actionButton: { flex: 1, borderRadius: 12, padding: 16, alignItems: "center", justifyContent: "center", gap: 8 },
  actionButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
})
