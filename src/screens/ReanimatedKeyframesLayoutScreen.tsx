import React, { useMemo, useState } from 'react'
import { StyleSheet, View, Text, Pressable, StatusBar, useWindowDimensions, ScrollView } from 'react-native'
import Animated, { Keyframe, Layout } from 'react-native-reanimated'

export default function ReanimatedKeyframesLayoutScreen() {
    const { width } = useWindowDimensions()
    const [items, setItems] = useState<number[]>([1, 2, 3, 4, 5, 6])
    const [columns, setColumns] = useState<number>(3)
    const [useDelay, setUseDelay] = useState<boolean>(true)
    const [chaosItems, setChaosItems] = useState<number[]>([])
    const [chaosColumns, setChaosColumns] = useState<number>(4)
    const givesRandomHexColor = (): string => {
        return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`
    }

    const gap = 10
    const padding = 16
    const contentWidth = width - padding * 2
    const cardWidth = useMemo(() => Math.floor((contentWidth - gap * (columns - 1)) / columns), [contentWidth, columns])
    const chaosCardWidth = useMemo(() => Math.floor((contentWidth - gap * (chaosColumns - 1)) / chaosColumns), [contentWidth, chaosColumns])
    const cardRadius = Math.max(6, 16 - (columns - 1) * 2)

    const popIn = new Keyframe({
        0: { opacity: 0, transform: [{ scale: 0.85 }, { rotate: '-360deg' }], backgroundColor: '#000' },
        90: { opacity: 0.7, transform: [{ scale: 1.5 }, { rotate: '360deg' }], backgroundColor: givesRandomHexColor() },
        100: { opacity: 1, transform: [{ scale: 1 }, { rotate: '0deg' }], backgroundColor: givesRandomHexColor() },
    }).duration(1000)
 const popOut = new Keyframe({
  /* Stable */
  0: {
    opacity: 1,
    transform: [
      { scale: 1 },
      { rotate: '0deg' },
      { translateX: 0 },
      { translateY: 0 },
    ],
  },

  /* Initial push */
  15: {
    opacity: 1,
    transform: [
      { scale: 0.9 },
      { rotate: '120deg' },
      { translateX: -40 },
      { translateY: 0 },
    ],
  },

  /* Roaming phase */
  40: {
    opacity: 0.8,
    transform: [
      { scale: 0.7 },
      { rotate: '360deg' },
      { translateX: -40 },
      { translateY: -40 },
    ],
  },

  /* Spiral away */
  70: {
    opacity: 0.4,
    transform: [
      { scale: 0.35 },
      { rotate: '720deg' },
      { translateX: 40 },
      { translateY: -40 },
    ],
  },

  /* Vanish */
  100: {
    opacity: 0,
    transform: [
      { scale: 0.05 },
      { rotate: '1080deg' },
      { translateX: 40 },
      { translateY: 40 },
    ],
  },
}).duration(1000)



    const warpIn = new Keyframe({
        0: { opacity: 0, transform: [{ scale: 0.2 }, { translateY: -80 }, { rotate: '-720deg' }], backgroundColor: '#000' },
        50: { opacity: 0.9, transform: [{ scale: 1.3 }, { translateY: 12 }, { rotate: '180deg' }], backgroundColor: givesRandomHexColor() },
        100: { opacity: 1, transform: [{ scale: 1 }, { translateY: 0 }, { rotate: '0deg' }], backgroundColor: givesRandomHexColor() },
    }).duration(1200)

    const warpOut = new Keyframe({
        0: { opacity: 1, transform: [{ scale: 1 }, { translateY: 0 }, { rotate: '0deg' }] },
        100: { opacity: 0, transform: [{ scale: 0.6 }, { translateY: 60 }, { rotate: '360deg' }] },
    }).duration(400)

    const addItem = () => setItems((arr) => [...arr, (arr[arr.length - 1] || 0) + 1])
    const removeItem = () => setItems((arr) => (arr.length > 0 ? arr.slice(0, -1) : arr))
    const shuffle = () => setItems((arr) => [...arr].sort(() => Math.random() - 0.5))
    const spawnChaos = () => setChaosItems(Array.from({ length: 18 }, (_, i) => i + 1))
    const clearChaos = () => setChaosItems([])
    const shuffleChaos = () => setChaosItems((arr) => [...arr].sort(() => Math.random() - 0.5))

    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0B0F14" />
            <Text style={styles.header}>Reanimated: Keyframes + Layout.delay()</Text>
            <Text style={styles.desc}>Add, remove, and shuffle to see entering/exiting and layout reflow.</Text>

            <View style={{ width: '100%', height: 100 }}>
                <ScrollView style={{ flex: 1 }} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.controls, { paddingHorizontal: padding, gap: 10, }]}>
                    <View style={styles.row}>
                        <Pressable accessibilityRole="button" onPress={addItem} style={styles.btn}><Text style={styles.btnText}>Add</Text></Pressable>
                        <Pressable accessibilityRole="button" onPress={removeItem} style={styles.btn}><Text style={styles.btnText}>Remove</Text></Pressable>
                    </View>
                    <View style={styles.row}>
                        <Pressable accessibilityRole="button" onPress={() => setColumns((c) => Math.max(1, c - 1))} style={styles.btn}><Text style={styles.btnText}>–</Text></Pressable>
                        <Text style={styles.value}>Cols: {columns}</Text>
                        <Pressable accessibilityRole="button" onPress={() => setColumns((c) => Math.min(6, c + 1))} style={styles.btn}><Text style={styles.btnText}>+</Text></Pressable>
                    </View>
                </ScrollView>
            </View>

            <View style={[styles.grid, { paddingHorizontal: padding, gap }]}>
                {items.map((id, index) => (
                    <Animated.View
                        key={`kf-${id}`}
                        entering={popIn.delay(index * 40)}
                        exiting={popOut}
                        layout={Layout.springify().damping(20).stiffness(140)}
                        style={[styles.card, { width: cardWidth, height: Math.round(cardWidth * 0.75), }]}
                    >
                        <Text style={styles.cardText}>#{id}</Text>
                    </Animated.View>
                ))}
            </View>

            <Animated.View layout={Layout.duration(400)}>

                <Text style={[styles.header, { marginTop: 16 }]}>Chaos Grid</Text>
                <Text style={styles.desc}>Spawn a wild grid with warp-in/out keyframes.</Text>
                <View style={{ width: '100%', height: 100 }}>
                    <ScrollView style={{ flex: 1 }} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.controls, { paddingHorizontal: padding, gap: 10 }]}>
                        <View style={styles.row}>
                            <Pressable accessibilityRole="button" onPress={spawnChaos} style={styles.btn}><Text style={styles.btnText}>Spawn</Text></Pressable>
                            <Pressable accessibilityRole="button" onPress={clearChaos} style={styles.btn}><Text style={styles.btnText}>Clear</Text></Pressable>
                            <Pressable accessibilityRole="button" onPress={shuffleChaos} style={styles.btn}><Text style={styles.btnText}>Shuffle</Text></Pressable>
                        </View>
                        <View style={styles.row}>
                            <Pressable accessibilityRole="button" onPress={() => setChaosColumns((c) => Math.max(1, c - 1))} style={styles.btn}><Text style={styles.btnText}>–</Text></Pressable>
                            <Text style={styles.value}>Cols: {chaosColumns}</Text>
                            <Pressable accessibilityRole="button" onPress={() => setChaosColumns((c) => Math.min(6, c + 1))} style={styles.btn}><Text style={styles.btnText}>+</Text></Pressable>
                        </View>
                    </ScrollView>
                </View>

                <Animated.View layout={Layout.duration(100000)} style={[styles.grid, { paddingHorizontal: padding, gap }]}>
                    {chaosItems.map((id, index) => (
                        <Animated.View
                            key={`cx-${id}`}
                            entering={warpIn}
                            exiting={warpOut}
                            layout={Layout.springify().damping(12).stiffness(220).delay(index * 20)}
                            style={[styles.crazyCard, { width: chaosCardWidth, height: Math.round(chaosCardWidth * 0.75) }]}
                        >
                            <Text style={styles.cardText}>★ {id}</Text>
                        </Animated.View>
                    ))}
                </Animated.View>
            </Animated.View>

        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: '#0B0F14', paddingTop: 16, paddingBottom: 200 },
    header: { fontSize: 20, fontWeight: '700', color: '#fff', paddingHorizontal: 16 },
    desc: { fontSize: 13, color: '#9CA3AF', marginTop: 4, paddingHorizontal: 16, marginBottom: 12 },
    controls: { height: 100, justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    btn: { height: 36, paddingHorizontal: 12, borderRadius: 10, backgroundColor: '#1F2937', alignItems: 'center', justifyContent: 'center' },
    btnText: { color: '#fff', fontWeight: '700' },
    value: { color: '#fff', fontWeight: '700' },
    grid: { flexDirection: 'row', flexWrap: 'wrap' },
    card: { backgroundColor: '#495867ff', alignItems: 'center', justifyContent: 'center', borderRadius: 12, },
    cardText: { color: '#fff', fontWeight: '700' },
    crazyCard: { backgroundColor: '#1F2937', alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
})
