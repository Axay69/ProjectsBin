import React, { useMemo, useState } from 'react'
import { ScrollView, StyleSheet, View, Text, TouchableOpacity } from 'react-native'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { Table, TableWrapper, Row, Rows, Col, Cell } from 'react-native-table-component'

type Person = { id: number; name: string; status: 'Active' | 'Paused'; score: number }

export default function TableComponentDemoScreen() {
  const [rows, setRows] = useState<Person[]>([
    { id: 1, name: 'Alice', status: 'Active', score: 95 },
    { id: 2, name: 'Bob', status: 'Paused', score: 82 },
    { id: 3, name: 'Charlie', status: 'Active', score: 88 },
    { id: 4, name: 'Diana', status: 'Paused', score: 91 },
    { id: 5, name: 'Evan', status: 'Active', score: 76 },
  ])

  const head = useMemo(() => ['ID', 'Name', 'Status', 'Score'], [])
  const widths = useMemo(() => [64, 140, 120, 90], [])

  const basicHead = useMemo(() => ['Name', 'Age', 'City'], [])
  const basicWidths = useMemo(() => [140, 80, 160], [])
  const basicRows = useMemo(
    () => [
      ['Alice', 28, 'San Francisco'],
      ['Bob', 31, 'New York'],
      ['Charlie', 24, 'Austin'],
      ['Diana', 29, 'Seattle'],
      ['Evan', 26, 'Chicago'],
    ],
    []
  )

  const names = useMemo(() => rows.map(r => r.name), [rows])
  const gradesRows = useMemo(() => rows.map(r => [r.score, r.status]), [rows])

  const toggleStatus = (id: number) => {
    setRows(prev => prev.map(r => (r.id === id ? { ...r, status: r.status === 'Active' ? 'Paused' : 'Active' } : r)))
  }

  const addScore = (id: number, delta = 5) => {
    setRows(prev => prev.map(r => (r.id === id ? { ...r, score: r.score + delta } : r)))
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Interactive status table</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.tableBox}>
          <Table borderStyle={{ borderWidth: 1, borderColor: '#e5e7eb' }}>
            <Row data={head} widthArr={widths} style={styles.head} textStyle={styles.headText} />
            {rows.map((r) => (
              <TableWrapper key={r.id} style={styles.row}>
                <Cell data={r.id} width={widths[0]} textStyle={styles.text} />
                <Cell data={r.name} width={widths[1]} textStyle={styles.text} />
                <Cell
                  width={widths[2]}
                  data={
                    <TouchableOpacity style={[styles.statusChip, r.status === 'Active' ? styles.active : styles.paused]} onPress={() => toggleStatus(r.id)}>
                      <Text style={styles.statusText}>{r.status}</Text>
                    </TouchableOpacity>
                  }
                />
                <Cell data={r.score} width={widths[3]} textStyle={styles.text} />
              </TableWrapper>
            ))}
          </Table>
        </View>
      </ScrollView>

      <Text style={styles.sectionTitle}>Basic rows</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
       
      <View style={styles.tableBox}>
        <Table borderStyle={{ borderWidth: 1, borderColor: '#e5e7eb' }}>
          <Row data={basicHead} widthArr={basicWidths} style={styles.head} textStyle={styles.headText} />
          <Rows data={basicRows} widthArr={basicWidths} textStyle={styles.text} />
        </Table>
      </View>
       </ScrollView>

      <Text style={styles.sectionTitle}>Fixed name column</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.tableBox}>
          <Table borderStyle={{ borderWidth: 1, borderColor: '#e5e7eb' }}>
            <Row data={['Name', 'Score', 'Status']} widthArr={[140, 100, 120]} style={styles.head} textStyle={styles.headText} />
            <TableWrapper style={styles.wrapper}>
              <Col data={names} heightArr={Array(names.length).fill(48)} textStyle={styles.text} width={140} />
              <Rows data={gradesRows} widthArr={[100, 120]} textStyle={styles.text} />
            </TableWrapper>
          </Table>
        </View>
      </ScrollView>

      <Text style={styles.sectionTitle}>Custom action cells</Text>
     <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.tableBox}>
        <Table borderStyle={{ borderWidth: 1, borderColor: '#e5e7eb' }}>
          <Row data={['Name', 'Score', 'Action']} widthArr={[140, 100, 120]} style={styles.head} textStyle={styles.headText} />
          {rows.map(r => (
            <TableWrapper key={`action-${r.id}`} style={styles.row}>
              <Cell data={r.name} width={140} textStyle={styles.text} />
              <Cell data={r.score} width={100} textStyle={styles.text} />
              <Cell
                width={120}
                data={
                  <TouchableOpacity style={styles.addBtn} onPress={() => addScore(r.id)}>
                    <Text style={styles.addBtnText}>+5</Text>
                  </TouchableOpacity>
                }
              />
            </TableWrapper>
          ))}
        </Table>
      </View>
      </ScrollView>

      <Text style={styles.sectionTitle}>Custom styled table</Text>
      <View style={styles.customBox}>
        <View style={styles.customHead}>
          <Text style={[styles.customHeadText, { flex: 1 }]}>ID</Text>
          <Text style={[styles.customHeadText, { flex: 3 }]}>Name</Text>
          <Text style={[styles.customHeadText, { flex: 2 }]}>Status</Text>
          <Text style={[styles.customHeadText, { flex: 1 }]}>Score</Text>
          <Text style={[styles.customHeadText, { flex: 1 }]}>Action</Text>
        </View>
        {rows.map((r, i) => (
          <View key={`custom-${r.id}`} style={[styles.customRow, i % 2 === 1 && styles.customRowAlt]}>
            <Text style={[styles.text, { flex: 1 }]}>{r.id}</Text>
            <View style={{ flex: 3, flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="account" size={18} color="#64748b" />
              <Text style={styles.nameText}> {r.name}</Text>
            </View>
            <View style={{ flex: 2, alignItems: 'center' }}>
              <View style={[styles.badge, r.status === 'Active' ? styles.badgeActive : styles.badgePaused]}>
                <Text style={styles.badgeText}>{r.status}</Text>
              </View>
            </View>
            <Text style={[styles.scoreText, { flex: 1 }]}>{r.score}</Text>
            <TouchableOpacity style={[styles.rowActionBtn, { flex: 1 }]} onPress={() => addScore(r.id)}>
              <Text style={styles.rowActionText}>+5</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, gap: 16 },
  tableBox: { backgroundColor: '#fff' },
  head: { height: 44, backgroundColor: '#f3f4f6' },
  headText: { fontSize: 14, fontWeight: '700', textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  row: { flexDirection: 'row', height: 48, backgroundColor: '#fff' },
  wrapper: { flexDirection: 'row' },
  text: { textAlign: 'center', fontSize: 14 },
  statusChip: { alignSelf: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  statusText: { color: '#fff', fontWeight: '600' },
  active: { backgroundColor: '#10b981' },
  paused: { backgroundColor: '#f59e0b' },
  addBtn: { alignSelf: 'center', backgroundColor: '#0ea5a4', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  addBtnText: { color: '#fff', fontWeight: '700' },
  customBox: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, overflow: 'hidden' },
  customHead: { flexDirection: 'row', backgroundColor: '#0ea5a4', paddingVertical: 12, paddingHorizontal: 12 },
  customHeadText: { color: '#fff', fontWeight: '700', textAlign: 'center' },
  customRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, backgroundColor: '#fff' },
  customRowAlt: { backgroundColor: '#f9fafb' },
  nameText: { fontSize: 14, fontWeight: '600', color: '#111827' },
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  badgeActive: { backgroundColor: '#10b981' },
  badgePaused: { backgroundColor: '#f59e0b' },
  badgeText: { color: '#fff', fontWeight: '700' },
  scoreText: { textAlign: 'center', fontSize: 14, fontWeight: '700', color: '#111827' },
  rowActionBtn: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#0ea5a4', paddingVertical: 8, borderRadius: 999 },
  rowActionText: { color: '#fff', fontWeight: '700' },
})
