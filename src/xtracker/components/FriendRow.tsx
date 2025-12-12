import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import type { Friend } from "../types"
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import { getTheme } from "../theme"

interface FriendRowProps {
  friend: Friend
  onPress: () => void
  darkMode?: boolean
}

export default function FriendRow({ friend, onPress, darkMode = false }: FriendRowProps) {
  const t = getTheme(darkMode)
  const cardBg = t.surface
  const textColor = t.text
  const subTextColor = t.muted

  return (
    <TouchableOpacity style={[styles.container, { backgroundColor: cardBg }]} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.avatarContainer, { backgroundColor: darkMode ? "#0B2323" : "#F0FDFD" }]}>
        <Text style={styles.avatar}>{friend.avatar}</Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, { color: textColor }]}>{friend.name}</Text>
        <Text style={[styles.username, { color: subTextColor }]}>@{friend.username}</Text>
        <Text style={[styles.mutual, { color: subTextColor }]}>\
{friend.mutualChallenges.length} mutual challenge{friend.mutualChallenges.length !== 1 ? "s" : ""}
        </Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color={subTextColor} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F0FDFD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatar: { fontSize: 24 },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: "600", marginBottom: 2 },
  username: { fontSize: 12, marginBottom: 4 },
  mutual: { fontSize: 11 },
})
