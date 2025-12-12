import { useState } from "react"
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native"
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import type { Challenge, DayStatus } from "../types"

interface Props {
  visible: boolean
  onClose: () => void
  onCreate: (challenge: Challenge) => void
  darkMode?: boolean
}

function formatDateYYYYMMDD(date: Date): string {
  const y = date.getFullYear()
  const m = `${date.getMonth() + 1}`.padStart(2, "0")
  const d = `${date.getDate()}`.padStart(2, "0")
  return `${y}-${m}-${d}`
}

function createEmptyDays(duration: number, startDate: Date): { date: string; status: DayStatus }[] {
  const days: { date: string; status: DayStatus }[] = []
  for (let i = 0; i < duration; i++) {
    const d = new Date(startDate)
    d.setDate(d.getDate() + i)
    days.push({ date: formatDateYYYYMMDD(d), status: "empty" })
  }
  return days
}

export default function CreateChallengeModal({ visible, onClose, onCreate, darkMode = false }: Props) {
  const [name, setName] = useState("")
  const [duration, setDuration] = useState("30")
  const [notes, setNotes] = useState("")

  const bgColor = darkMode ? "#1F2937" : "#FFFFFF"
  const overlay = "rgba(0,0,0,0.5)"
  const textColor = darkMode ? "#F3F4F6" : "#1F2937"
  const subTextColor = darkMode ? "#9CA3AF" : "#6B7280"
  const borderColor = darkMode ? "#374151" : "#E5E7EB"

  const handleCreate = () => {
    const dur = Math.max(1, Math.min(365, parseInt(duration || "0", 10) || 30))
    const today = new Date()
    const id = `${Date.now()}`
    const challenge: Challenge = {
      id,
      name: name.trim() || "New Challenge",
      duration: dur,
      startDate: formatDateYYYYMMDD(today),
      createdAt: formatDateYYYYMMDD(today),
      isShared: false,
      sharedWith: [],
      dailyNotes: notes.trim() || undefined,
      days: createEmptyDays(dur, today),
      category: undefined,
    }
    onCreate(challenge)
    setName("")
    setDuration("30")
    setNotes("")
    onClose()
  }

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={[styles.overlay, { backgroundColor: overlay }]}> 
        <View style={[styles.sheet, { backgroundColor: bgColor }]}> 
          <View style={styles.header}> 
            <Text style={[styles.title, { color: textColor }]}>Create Challenge</Text>
            <TouchableOpacity onPress={onClose} style={styles.iconBtn}> 
              <MaterialCommunityIcons name="close" size={20} color={subTextColor} />
            </TouchableOpacity>
          </View>

          <View style={styles.form}> 
            <Text style={[styles.label, { color: subTextColor }]}>Name</Text>
            <TextInput value={name} onChangeText={setName} placeholder="e.g. 10k steps daily" placeholderTextColor={subTextColor} style={[styles.input, { color: textColor, borderColor: borderColor }]} />

            <Text style={[styles.label, { color: subTextColor }]}>Duration (days)</Text>
            <TextInput value={duration} onChangeText={setDuration} keyboardType="number-pad" placeholder="e.g. 30" placeholderTextColor={subTextColor} style={[styles.input, { color: textColor, borderColor: borderColor }]} />

            <Text style={[styles.label, { color: subTextColor }]}>Notes (optional)</Text>
            <TextInput value={notes} onChangeText={setNotes} placeholder="Add a brief note" placeholderTextColor={subTextColor} style={[styles.input, { color: textColor, borderColor: borderColor }]} />
          </View>

          <View style={styles.actions}> 
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#0EA5A4" }]} onPress={handleCreate}>
              <MaterialCommunityIcons name="check" size={20} color="#FFFFFF" />
              <Text style={styles.actionText}>Create</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#374151" }]} onPress={onClose}>
              <MaterialCommunityIcons name="close" size={20} color="#FFFFFF" />
              <Text style={styles.actionText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  sheet: { paddingHorizontal: 20, paddingVertical: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  title: { fontSize: 18, fontWeight: "700" },
  iconBtn: { padding: 8 },
  form: { marginTop: 8 },
  label: { fontSize: 12, marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12, fontSize: 16 },
  actions: { flexDirection: "row", gap: 12, marginTop: 8 },
  actionBtn: { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  actionText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
})

