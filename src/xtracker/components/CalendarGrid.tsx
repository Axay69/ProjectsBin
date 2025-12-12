import { View, TouchableOpacity, Text, StyleSheet } from "react-native"
import type { DayRecord, DayStatus } from "../types"
import { getTheme } from "../theme"

interface CalendarGridProps {
  days: DayRecord[]
  onDayPress: (date: string, nextStatus: DayStatus) => void
  darkMode?: boolean
}

export default function CalendarGrid({ days, onDayPress, darkMode = false }: CalendarGridProps) {
  const t = getTheme(darkMode)
  const getStatusColor = (status: DayStatus) => {
    switch (status) {
      case "done":
        return t.success
      case "failed":
        return t.error
      case "skip":
        return t.muted
      case "empty":
        return darkMode ? "#374151" : t.border
    }
  }

  const getStatusSymbol = (status: DayStatus) => {
    switch (status) {
      case "done":
        return "✓"
      case "failed":
        return "✕"
      case "skip":
        return "—"
      case "empty":
        return ""
    }
  }

  const getSymbolColor = (status: DayStatus) => {
    return status === "empty" ? "transparent" : "#FFFFFF"
  }

  const cycleStatus = (status: DayStatus): DayStatus => {
    const cycle: Record<DayStatus, DayStatus> = { empty: "done", done: "failed", failed: "skip", skip: "empty" }
    return cycle[status]
  }

  const handlePress = (day: DayRecord) => {
    const nextStatus = cycleStatus(day.status)
    onDayPress(day.date, nextStatus)
  }

  const cellsPerRow = 7
  const rows: DayRecord[][] = []
  for (let i = 0; i < days.length; i += cellsPerRow) {
    rows.push(days.slice(i, i + cellsPerRow))
  }

  return (
    <View style={styles.container}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((day, colIndex) => (
            <TouchableOpacity key={day.date} style={[styles.cell, { backgroundColor: getStatusColor(day.status), marginRight: colIndex % cellsPerRow === cellsPerRow - 1 ? 0 : 8 }]} onPress={() => handlePress(day)} activeOpacity={0.7}>
              <Text style={[styles.cellText, { color: getSymbolColor(day.status) }]}>{getStatusSymbol(day.status)}</Text>
            </TouchableOpacity>
          ))}
          {row.length < cellsPerRow && Array.from({ length: cellsPerRow - row.length }).map((_, i) => (
            <View key={`empty-${i}`} style={[styles.cell, { backgroundColor: darkMode ? "#374151" : t.border }]} />
          ))}
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { marginVertical: 16 },
  row: { flexDirection: "row", marginBottom: 8 },
  cell: { width: 40, height: 40, borderRadius: 8, justifyContent: "center", alignItems: "center", flex: 1 },
  cellText: { fontSize: 16, fontWeight: "600" },
})
