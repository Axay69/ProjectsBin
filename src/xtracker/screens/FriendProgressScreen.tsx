import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import ProgressRing from "../components/ProgressRing"
import { seedFriends, seedChallenges } from "../data"
import { getTheme } from "../theme"

export default function FriendProgressScreen({ route, navigation, darkMode }: any) {
  const { friendId } = route.params
  const friend = seedFriends.find((f) => f.id === friendId)
  if (!friend) {
    return (
      <View style={[styles.container, { backgroundColor: darkMode ? "#0F1419" : "#F9FAFB" }]}> 
        <Text style={{ color: darkMode ? "#F3F4F6" : "#1F2937" }}>Friend not found</Text>
      </View>
    )
  }

  const sharedChallenges = seedChallenges.filter((c) => c.sharedWith.includes(friend.id) || friend.mutualChallenges.includes(c.id))

  const t = getTheme(darkMode)
  const bgColor = t.surface
  const textColor = t.text
  const subTextColor = t.muted

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}> 
      <View style={[styles.header, { backgroundColor: bgColor }]}> 
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}> 
          <MaterialCommunityIcons name="chevron-left" size={24} color={t.primary} />
        </TouchableOpacity>
        <View style={styles.friendInfo}> 
          <Text style={styles.friendAvatar}>{friend.avatar}</Text>
          <View>
            <Text style={[styles.title, { color: textColor }]}>{friend.name}</Text>
            <Text style={[styles.subtitle, { color: subTextColor }]}>@{friend.username}</Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}> 
        <View style={styles.content}> 
          {sharedChallenges.length === 0 ? (
            <View style={styles.emptyState}> 
              <Text style={[styles.emptyTitle, { color: textColor }]}>No Shared Challenges</Text>
              <Text style={[styles.emptySubtitle, { color: subTextColor }]}>You haven't started any challenges together yet.</Text>
            </View>
          ) : (
            sharedChallenges.map((challenge) => {
              const completed = challenge.days.filter((d) => d.status === "done").length
              return (
                <View key={challenge.id} style={[styles.challengeCard, { backgroundColor: bgColor }]}> 
                  <Text style={[styles.challengeName, { color: textColor }]}>{challenge.name}</Text>
                  <View style={styles.progressComparison}> 
                    <View style={styles.progressColumn}> 
                      <Text style={[styles.label, { color: subTextColor }]}>You</Text>
                      <ProgressRing current={completed} total={challenge.duration} size={100} primaryColor={t.primary} darkMode={darkMode} />
                    </View>
                    <View style={styles.progressColumn}> 
                      <Text style={[styles.label, { color: subTextColor }]}>{friend.name.split(" ")[0]}</Text>
                      <ProgressRing current={Math.floor(Math.random() * challenge.duration * 0.8)} total={challenge.duration} size={100} primaryColor="#06B6D4" darkMode={darkMode} />
                    </View>
                  </View>
                </View>
              )
            })
          )}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  backButton: { width: 40, height: 40, justifyContent: "center", marginRight: 12 },
  friendInfo: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  friendAvatar: { fontSize: 32 },
  title: { fontSize: 18, fontWeight: "600" },
  subtitle: { fontSize: 12, marginTop: 2 },
  content: { padding: 16 },
  emptyState: { alignItems: "center", paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
  emptySubtitle: { fontSize: 14, textAlign: "center" },
  challengeCard: { borderRadius: 16, padding: 20, marginBottom: 16, shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  challengeName: { fontSize: 18, fontWeight: "600", marginBottom: 16, textAlign: "center" },
  progressComparison: { flexDirection: "row", justifyContent: "space-around", alignItems: "center" },
  progressColumn: { alignItems: "center", gap: 8 },
  label: { fontSize: 12 },
})
