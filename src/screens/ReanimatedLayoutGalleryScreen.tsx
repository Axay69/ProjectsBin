import React, { useEffect, useMemo, useState } from 'react'
import { StyleSheet, View, Text, Pressable, StatusBar, Image, Switch, useWindowDimensions, LayoutAnimation } from 'react-native'
import Animated, { Layout, useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { urlCacheListData } from './data'

type Img = { uri: string; id: string, index: number }

const items: Img[] = urlCacheListData.map((it, index) => ({ uri: it.uri, id: `img-${index}`, index: index + 1 }))

export default function ReanimatedLayoutGalleryScreen() {
  const { width: screenWidth } = useWindowDimensions()
  const [columns, setColumns] = useState(2)
  const [isMasonry, setIsMasonry] = useState(true)

  const gap = 8
  const padding = 16
  const containerWidth = screenWidth - padding * 2
  const itemWidth = (containerWidth - gap * (columns - 1)) / columns
  const cardRadius = Math.max(6, 16 - (columns - 1) * 2)

  const [sizes, setSizes] = useState<Record<string, { w: number; h: number }>>({})

  useEffect(() => {
    items.forEach((item) => {
      if (sizes[item.uri]) return
      Image.getSize(
        item.uri,
        (w, h) => {
          setSizes((prev) => ({ ...prev, [item.uri]: { w, h } }))
        },
        () => {}
      )
    })
  }, [])

  const layout = useMemo(() => {
    const positions: Record<string, { x: number; y: number; height: number }> = {}
    if (!isMasonry) {
      const uniformHeight = Math.round((screenWidth - padding * 2) / columns)
      const rows = Math.ceil(items.length / columns)
      for (let idx = 0; idx < items.length; idx++) {
        const item = items[idx]
        const col = idx % columns
        const row = Math.floor(idx / columns)
        const x = col * (itemWidth + gap)
        const y = row * (uniformHeight + gap)
        positions[item.id] = { x, y, height: uniformHeight }
      }
      const totalHeight = rows * uniformHeight + Math.max(0, rows - 1) * gap
      return { positions, totalHeight }
    }

    const columnHeights = Array(columns).fill(0)
    items.forEach((item) => {
      const size = sizes[item.uri]
      const height = size ? Math.round(itemWidth * (size.h / size.w)) : itemWidth * 1.5
      let minHeight = columnHeights[0]
      let colIndex = 0
      for (let i = 1; i < columns; i++) {
        if (columnHeights[i] < minHeight) {
          minHeight = columnHeights[i]
          colIndex = i
        }
      }
      const x = colIndex * (itemWidth + gap)
      const y = columnHeights[colIndex]
      positions[item.id] = { x, y, height }
      columnHeights[colIndex] += height + gap
    })
    const totalHeight = Math.max(...columnHeights)
    return { positions, totalHeight }
  }, [columns, sizes, itemWidth, isMasonry, screenWidth])

  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F14" />

      <Text style={styles.header}>Smooth Masonry with Layout Animations</Text>
      <Text style={styles.desc}>Now column changes are perfectly smooth!</Text>

      <View style={[styles.controls, { paddingHorizontal: padding }]}>
        <View style={styles.controlGroup}>
          <Text style={styles.controlLabel}>Columns: {columns}</Text>
          <View style={styles.stepper}>
            <Pressable onPress={() => setColumns(c => Math.max(1, c - 1))} style={styles.stepBtn}>
              <Text style={styles.stepText}>–</Text>
            </Pressable>
            <Pressable onPress={() => setColumns(c => Math.min(6, c + 1))} style={styles.stepBtn}>
              <Text style={styles.stepText}>+</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.controlGroup}>
          <Text style={styles.controlLabel}>Masonry</Text>
          <Switch value={isMasonry} onValueChange={setIsMasonry} />
        </View>
      </View>

      <Animated.ScrollView
        contentContainerStyle={{
          marginHorizontal: padding,
          paddingBottom: 20,
          height: layout.totalHeight + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {items.map((item) => {
          const pos = layout.positions[item.id]
          if (!pos) return null

          const animatedStyle = useAnimatedStyle(() => ({
            position: 'absolute',
            left: pos.x, 
            // left: withTiming(pos.x, { duration: 600 }),
            top: pos.y,
            // top: withTiming(pos.y, { duration: 600 }),
            width: itemWidth,
            height: pos.height,
            borderRadius: cardRadius
          }), [pos.x, pos.y, pos.height, itemWidth])

          return (
            // <Animated.View
            //   key={item.id}
            //   layout={Layout.springify().damping(20).stiffness(90)}
            //   style={[styles.card, animatedStyle]}
            // >
            //   <Image source={{ uri: item.uri }} style={styles.image} resizeMode="cover" />
            // </Animated.View>
              <Animated.Image key={item.id} layout={Layout.duration(1000)} source={{ uri: item.uri }} style={[styles.card, animatedStyle, styles.image, {  }]} resizeMode="cover" />
           
          )
        })}
      </Animated.ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F14' },
  header: { fontSize: 20, fontWeight: '700', color: '#fff', paddingHorizontal: 16, marginTop: 20 },
  desc: { fontSize: 13, color: '#9CA3AF', marginTop: 4, paddingHorizontal: 16, marginBottom: 12 },
  controls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  controlGroup: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  controlLabel: { color: '#fff', fontSize: 14, fontWeight: '600' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepBtn: { height: 36, width: 40, borderRadius: 10, backgroundColor: '#1F2937', alignItems: 'center', justifyContent: 'center' },
  stepText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  card: { borderRadius: 16, overflow: 'hidden', backgroundColor: '#1F2937', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  image: { width: '100%', height: '100%' },
})
// import React, { useEffect, useMemo, useState } from 'react'
// import { StyleSheet, View, Text, Pressable, StatusBar, Image, Switch, FlatList, useWindowDimensions, ScrollView } from 'react-native'
// import Animated, { Layout } from 'react-native-reanimated'
// import { urlCacheListData } from './data'

// type Img = { uri: string }

// export default function ReanimatedLayoutGalleryScreen() {
//   const { width: screenWidth } = useWindowDimensions()
//   const [columns, setColumns] = useState<number>(2)
//   const [isMasonry, setIsMasonry] = useState<boolean>(true)
//   const [containerWidth, setContainerWidth] = useState<number>(screenWidth)
//   const gap = 8
//   const horizontalPadding = 16

//   const items: Img[] = urlCacheListData

//   const cardWidth = useMemo(() => {
//     const contentWidth = containerWidth - horizontalPadding * 2
//     return Math.floor((contentWidth - gap * (columns - 1)) / columns)
//   }, [containerWidth, columns])

//   const [sizes, setSizes] = useState<Record<string, { w: number; h: number }>>({})

//   useEffect(() => {
//     items.forEach((item) => {
//       if (sizes[item.uri]) return
//       Image.getSize(item.uri, (w, h) => {
//         setSizes((prev) => ({ ...prev, [item.uri]: { w, h } }))
//       }, () => {})
//     })
//   }, [items, sizes])

//   const columnsData = useMemo(() => {
//     if (!isMasonry) return [] as Img[][]
//     const cols: Img[][] = Array.from({ length: columns }, () => [])
//     const heights = Array.from({ length: columns }, () => 0)
//     items.forEach((itm) => {
//       const size = sizes[itm.uri]
//       const h = size ? Math.round(cardWidth * (size.h / size.w)) : Math.round(cardWidth * 0.75)
//       let idx = 0
//       let min = heights[0]
//       for (let i = 1; i < columns; i++) {
//         if (heights[i] < min) {
//           min = heights[i]
//           idx = i
//         }
//       }
//       cols[idx].push(itm)
//       heights[idx] += h + gap
//     })
//     return cols
//   }, [items, columns, sizes, cardWidth, isMasonry])

//   return (
//     <View style={styles.container} onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}>
//       <StatusBar barStyle="light-content" backgroundColor="#0B0F14" />
//       <Text style={styles.header}>Reanimated: Layout Gallery</Text>
//       <Text style={styles.desc}>Choose columns and list type. Layout animates smoothly.</Text>

//       <View style={[styles.controls, { paddingHorizontal: horizontalPadding }]}>
//         <View style={styles.controlGroup}>
//           <Text style={styles.controlLabel}>Columns</Text>
//           <View style={styles.stepper}>
//             <Pressable accessibilityRole="button" style={styles.stepBtn} onPress={() => setColumns((c) => Math.max(1, c - 1))}>
//               <Text style={styles.stepText}>–</Text>
//             </Pressable>
//             <Text style={styles.stepValue}>{columns}</Text>
//             <Pressable accessibilityRole="button" style={styles.stepBtn} onPress={() => setColumns((c) => Math.min(6, c + 1))}>
//               <Text style={styles.stepText}>+</Text>
//             </Pressable>
//           </View>
//         </View>
//         <View style={styles.controlGroup}>
//           <Text style={styles.controlLabel}>Masonry</Text>
//           <Switch value={isMasonry} onValueChange={setIsMasonry} />
//         </View>
//       </View>

//       {isMasonry ? (
//         <ScrollView style={{flex: 1}} contentContainerStyle={[styles.masonry, { gap, paddingHorizontal: horizontalPadding }]}>
//           {columnsData.map((col, i) => (
//             <View key={`col-${i}`} style={{ width: cardWidth, gap }}>
//               {col.map((item) => {
//                 const size = sizes[item.uri]
//                 const h = size ? Math.round(cardWidth * (size.h / size.w)) : Math.round(cardWidth * 0.75)
//                 return (
//                   <Animated.View key={item.uri} layout={Layout.duration(2000)} style={[styles.card, { width: cardWidth, height: h }]}> 
//                     <Image source={{ uri: item.uri }} style={styles.image} resizeMode="cover" />
//                   </Animated.View>
//                 )
//               })}
//             </View>
//           ))}
//         </ScrollView>
//       ) : (
//         <ScrollView contentContainerStyle={{ paddingHorizontal: horizontalPadding, paddingBottom: 16 }}>
//           <View style={[styles.grid, { gap }]}> 
//             {items.map((item, index) => (
//               <Animated.View key={item.uri} layout={Layout.duration(1500).delay(index*100)} style={[styles.card, { width: cardWidth, height: Math.round(cardWidth * 0.75) }]}> 
//                 <Image source={{ uri: item.uri }} style={styles.image} resizeMode="cover" />
//               </Animated.View>
//             ))}
//           </View>
//         </ScrollView>
//       )}

//     </View>
//   )
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#0B0F14', paddingTop: 16 },
//   header: { fontSize: 20, fontWeight: '700', color: '#fff', paddingHorizontal: 16 },
//   desc: { fontSize: 13, color: '#9CA3AF', marginTop: 4, paddingHorizontal: 16, marginBottom: 12 },
//   controls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
//   controlGroup: { flexDirection: 'row', alignItems: 'center', gap: 12 },
//   controlLabel: { color: '#fff', fontSize: 14, fontWeight: '600' },
//   stepper: { flexDirection: 'row', alignItems: 'center', gap: 8 },
//   stepBtn: { height: 32, width: 36, borderRadius: 8, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center' },
//   stepText: { color: '#fff', fontSize: 18 },
//   stepValue: { color: '#fff', fontSize: 16, fontWeight: '700', minWidth: 24, textAlign: 'center' },
//   masonry: { flexGrow: 1, flexDirection: 'row', alignItems: 'flex-start' },
//   grid: { flexDirection: 'row', flexWrap: 'wrap' },
//   card: { borderRadius: 12, overflow: 'hidden', backgroundColor: '#0F1419' },
//   image: { width: '100%', height: '100%' },
// })
