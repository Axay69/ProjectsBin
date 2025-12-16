// import React from 'react'
// import { StyleSheet, View, Text, Dimensions } from 'react-native'
// import { NativeStackScreenProps } from '@react-navigation/native-stack'
// import Carousel from 'react-native-reanimated-carousel'

// type RootStackParamList = { ReanimatedCarouselDemo: undefined }
// type Props = NativeStackScreenProps<RootStackParamList, 'ReanimatedCarouselDemo'>

// const { width } = Dimensions.get('window')

// export default function ReanimatedCarouselDemoScreen({}: Props) {
//   const data = Array.from({ length: 6 }).map((_, i) => i)
//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Reanimated Carousel Demo</Text>
//       <Carousel
//         width={width}
//         height={220}
//         data={data}
//         loop
//         autoPlay
//         autoPlayInterval={2500}
//         scrollAnimationDuration={1200}
//         mode="parallax"
//         modeConfig={{ parallaxScrollingScale: 0.85, parallaxScrollingOffset: 60 }}
//         renderItem={({ index }) => (
//           <View style={[styles.card, { backgroundColor: colors[index % colors.length] }]}>
//             <Text style={styles.cardText}>Item {index + 1}</Text>
//           </View>
//         )}
//       />
//     </View>
//   )
// }

// const colors = ['#0EA5A4', '#111827', '#7C3AED', '#F59E0B', '#EF4444', '#10B981']

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#fff', paddingVertical: 16 },
//   title: { fontSize: 22, fontWeight: '700', marginBottom: 12, paddingHorizontal: 16 },
//   card: { flex: 1, marginHorizontal: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
//   cardText: { color: '#fff', fontSize: 20, fontWeight: '700' },
// })

import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

const ReanimatedCarouselDemoScreen = () => {
  return (
    <View>
      <Text>ReanimatedCarouselDemoScreen</Text>
    </View>
  );
};

export default ReanimatedCarouselDemoScreen;

const styles = StyleSheet.create({});
