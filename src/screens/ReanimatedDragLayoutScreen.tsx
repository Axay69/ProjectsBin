

import React, { useState } from "react"
import { StyleSheet, View, Text } from "react-native"
import Animated, {
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from "react-native-reanimated"
import { Gesture, GestureDetector } from "react-native-gesture-handler"

const ITEM_HEIGHT = 56

export default function ReanimatedDragLayoutScreen() {
  const [items, setItems] = useState<number[]>([1, 2, 3, 4])

  // item currently being dragged → dynamic
  const [dragId, setDragId] = useState<number | null>(null)

  const x = useSharedValue(0)
  const y = useSharedValue(0)
  const startY = useSharedValue(0)
  const isDragging = useSharedValue(false)
  const moveSteps = useSharedValue(0)

  const reorder = (yValue: number) => {
    let newItems: number[] = items;
    if (yValue > 0 && dragId) {

      const indexOfDragId = items.indexOf(dragId);
      const isLastIndex = indexOfDragId === items.length - 1;
      newItems = [...items.slice(0, indexOfDragId), ...(isLastIndex ? [] : [items[indexOfDragId + 1]]), items[indexOfDragId],  ...(isLastIndex ? [] : items.slice(indexOfDragId + 2))]   
    } else if (dragId) {
      const indexOfDragId = items.indexOf(dragId);
      const isFirstIndex = indexOfDragId === 0;
      newItems = isFirstIndex
        ? items
        : [...items.slice(0, indexOfDragId - 1), items[indexOfDragId], items[indexOfDragId - 1], ...(items.slice(indexOfDragId + 1))]
    } 


    console.log('newItems',newItems)
    setItems(newItems)
  }

  const animatedStyle = useAnimatedStyle(() => ({
    position: "absolute",
    left: 0,
    right: 0,
    // top: startY.value + y.value,
    zIndex: 10,
    transform: [{translateY: startY.value + y.value }],
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Drag + Layout</Text>
      <Text style={styles.desc}>Drag any item; others animate via layout()</Text>

      <View style={styles.list}>
        {items.map((id, index) => {
          const isActive = id === dragId

          return (
            <GestureDetector
              key={id}
              gesture={Gesture.Pan().onStart(() => {
                runOnJS(setDragId)(id)
                moveSteps.value = 0
                console.log("onStart", id)
              }).onChange((event) => {
                x.value = event.translationX
                y.value = event.translationY
                isDragging.value = true

                const threshold = ITEM_HEIGHT + 8
                const step = Math.floor(event.translationY / threshold)
                if (step > moveSteps.value) {
                  runOnJS(reorder)(threshold)
                  moveSteps.value = moveSteps.value + 1
                } else if (step < moveSteps.value) {
                  runOnJS(reorder)(-threshold)
                  moveSteps.value = moveSteps.value - 1
                }
              }).onEnd((e) => {
                runOnJS(setDragId)(null)
                if (Math.abs(e.translationY) > ITEM_HEIGHT + 8) {
                  console.log('swap');
                  runOnJS(reorder)(e.translationY)
                }
                x.value = withTiming(0)
                y.value = withTiming(0)
                isDragging.value = false
              })}
            >
              <Animated.View
                layout={Layout.springify().stiffness(220).damping(18)}
                style={[styles.item, isActive ? styles.draggedItem : {}]}
              >
                <Text style={styles.itemText}>Item #{id}</Text>
              </Animated.View>
            </GestureDetector>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  header: { fontSize: 24, fontWeight: "700", marginBottom: 4 },
  desc: { fontSize: 13, color: "#6B7280", marginBottom: 12 },
  list: { position: "relative", gap: 8 },
  item: {
    height: ITEM_HEIGHT,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  draggedItem: {
    height: ITEM_HEIGHT,
    borderRadius: 10,
    backgroundColor: "#0EA5A4",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  itemText: { fontWeight: "600", color: "#111" },
  dragText: { fontWeight: "700", color: "white" },
})
