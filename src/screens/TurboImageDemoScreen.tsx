// TurboImageUltimateDemo.tsx

import { Dimensions, FlatList, StyleSheet } from 'react-native';
import TurboImage from 'react-native-turbo-image';
import React from 'react';
import { dataCachelistData } from './data';

const size = Dimensions.get('window').width / 3 - 2;
const DataCacheScreen = () => {
  const renderItem = ({
    item,
  }: {
    item: { uri: string; blurhash: string };
  }) => {
    return (
      <TurboImage
        source={{
          uri: item.uri,
        }}
        style={styles.card}
        placeholder={{ blurhash: item.blurhash }}
        resize={size}
        // blur={Math.floor(Math.random() * 10) + 10}
        cachePolicy="dataCache"
      />
    );
  };
  return (
    <FlatList
      keyExtractor={(item) => item.uri}
      data={dataCachelistData}
      numColumns={3}
      getItemLayout={(_, index) => ({
        length: size,
        offset: size * index,
        index,
      })}
      renderItem={renderItem}
    />
  );
};

export default DataCacheScreen;

const styles = StyleSheet.create({
  card: {
    width: size,
    height: size,
    margin: 1,
    borderRadius: 0,
  },
});

// import { Dimensions, FlatList, Image, StyleSheet } from 'react-native';
// import React from 'react';
// import { dataCachelistData } from './data';

// const size = Dimensions.get('window').width / 3 - 2;
// const ImageScreen = () => {
//   const renderItem = ({
//     item,
//   }: {
//     item: { uri: string; blurhash: string };
//   }) => {
//     return <Image src={item.uri} style={styles.card} />;
//   };
//   return (
//     <FlatList
//       keyExtractor={(item) => item.uri}
//       data={dataCachelistData}
//       numColumns={3}
//       getItemLayout={(_, index) => ({
//         length: size,
//         offset: size * index,
//         index,
//       })}
//       renderItem={renderItem}
//     />
//   );
// };

// export default ImageScreen;

// const styles = StyleSheet.create({
//   card: {
//     width: size,
//     height: size,
//     margin: 1,
//   },
// });

// import React, { useMemo, useState, useCallback } from 'react';
// import {
//   StyleSheet,
//   View,
//   Text,
//   TouchableOpacity,
//   ScrollView,
//   FlatList,
//   Dimensions,
//   Alert,
//   ActivityIndicator,
//   Platform,
// } from 'react-native';
// import TurboImage, { TurboImageProps } from 'react-native-turbo-image';
// import { BlurView } from '@react-native-community/blur';

// const { width } = Dimensions.get('window');
// const ITEM_SIZE = (width - 32 - 48) / 3; // 3 columns

// // High-quality test images
// const HERO_BLURHASH = 'LEHV6nWB2yk8pyo0adR*.7kCMdnj';
// const HERO_URL = 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=1200';
// const ALT_URL = 'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?auto=format&fit=crop&q=80&w=1200';
// const GIF_URL = 'https://media.giphy.com/media/3o7TKMt1VVNkHV2Xbc/giphy.gif';
// const WEBP_URL = 'https://res.cloudinary.com/demo/image/upload/w_600/sample.webp';
// const AVIF_URL = 'https://raw.githubusercontent.com/mrousavy/react-native-vision-camera/main/assets/avif-example.avif';

// const GRID_IMAGES = Array.from({ length: 30 }, (_, i) => ({
//   id: i,
//   uri: `https://placedog.net/500/500?id=${i + 100}&random=${Date.now()}`,
// }));

// export default function TurboImageUltimateDemo() {
//   const [cachePolicy, setCachePolicy] = useState<'urlCache' | 'dataCache'>('dataCache');
//   const [rounded, setRounded] = useState(false);
//   const [tint, setTint] = useState(false);
//   const [progress, setProgress] = useState<string>('Ready');
//   const [cacheStatus, setCacheStatus] = useState<string>('Ready');
//   const [reloadKey, setReloadKey] = useState(0);

//   const heroSource = useMemo(() => ({
//     uri: `${HERO_URL}&v=${reloadKey}`,
//     cacheKey: 'hero-main',
//   }), [reloadKey]);

//   const altSource = useMemo(() => ({
//     uri: `${ALT_URL}&v=${reloadKey}`,
//   }), [reloadKey]);

//   const reloadAll = () => {
//     setReloadKey(k => k + 1);
//     setProgress('Reloading...');
//   };

//   const prefetchGrid = async () => {
//     setCacheStatus('Prefetching...');
//     try {
//       await TurboImage.prefetch(GRID_IMAGES.map(img => ({ uri: img.uri })));
//       setCacheStatus('Prefetched 30 images');
//     } catch (e) {
//       setCacheStatus('Prefetch failed');
//     }
//   };

//   const clearCaches = async () => {
//     try {
//       await Promise.all([
//         TurboImage.clearMemoryCache(),
//         TurboImage.clearDiskCache(),
//       ]);
//       setCacheStatus('All caches cleared');
//     } catch {
//       setCacheStatus('Clear failed');
//     }
//   };

//   const showCacheInfo = () => {
//     Alert.alert(
//       'TurboImage Cache Info',
//       `Policy: ${cachePolicy}\nMemory + Disk caching enabled\nAVIF/WebP/GIF supported`,
//       [{ text: 'OK' }]
//     );
//   };

//   const TurboImageWrapper = useCallback((props: TurboImageProps) => (
//     <TurboImage
//       {...props}
//       cachePolicy={cachePolicy}
//       fadeDuration={400}
//       onStart={() => setProgress('Downloading...')}
//       onProgress={(p) => {
//         console.log('Progress:', p);
//         // setProgress(`${Math.round((p) * 100)}%`)
//       }}
//       // placeholder={{blurhash: HERO_BLURHASH}}
//       onSuccess={() => setProgress('Loaded')}
//       onError={() => setProgress('Failed')}
//     />
//   ), [cachePolicy]);

//   return (
//     <ScrollView style={styles.container} contentContainerStyle={styles.content}>
//       <Text style={styles.title}>react-native-turbo-image</Text>
//       <Text style={styles.subtitle}>The fastest image component in React Native</Text>

//       {/* Controls */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Controls</Text>
//         <View style={styles.row}>
//           <TouchableOpacity
//             style={[styles.chip, cachePolicy === 'dataCache' && styles.chipActive]}
//             onPress={() => setCachePolicy('dataCache')}
//           >
//             <Text style={cachePolicy === 'dataCache' ? styles.chipTextActive : styles.chipText}>Data Cache</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.chip, cachePolicy === 'urlCache' && styles.chipActive]}
//             onPress={() => setCachePolicy('urlCache')}
//           >
//             <Text style={cachePolicy === 'urlCache' ? styles.chipTextActive : styles.chipText}>URL Cache</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={[styles.chip, rounded && styles.chipActive]} onPress={() => setRounded(!rounded)}>
//             <Text style={rounded ? styles.chipTextActive : styles.chipText}>Rounded</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={[styles.chip, tint && styles.chipActive]} onPress={() => setTint(!tint)}>
//             <Text style={tint ? styles.chipTextActive : styles.chipText}>Tint</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.chip} onPress={reloadAll}>
//             <Text style={styles.chipText}>Reload</Text>
//           </TouchableOpacity>
//         </View>
//         <Text style={styles.status}>Cache: {cachePolicy} • {progress} • {cacheStatus}</Text>
//       </View>

//       {/* Hero with BlurHash + Reuse Placeholder */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>BlurHash + Memory Reuse Placeholder</Text>
//         <View style={styles.heroRow}>
//           <TurboImageWrapper
//             source={heroSource}
//             placeholder={{ blurhash: HERO_BLURHASH }}
//             style={[styles.heroImage, rounded && styles.rounded]}
//             resizeMode="cover"
//             indicator={{ style: 'large', color: '#0EA5E4' }}
//             tint={tint ? '#8b5cf6' : undefined}
//           />
//           <TurboImageWrapper
//             source={altSource}
//             placeholder={{ memoryCacheKey: 'hero-main' }}
//             style={[styles.heroImage, rounded && styles.rounded]}
//             resizeMode="cover"
//             indicator={{ style: 'large', color: '#10b981' }}
//           />
//         </View>
//       </View>

//       {/* Format Support */}
//       <View style={ [styles.section, styles.formatGrid]}>
//         <Text style={styles.sectionTitle}>Format Support</Text>
//         <View style={styles.formatRow}>
//           <View style={styles.formatItem}>
//             <Text style={styles.formatLabel}>GIF</Text>
//             <TurboImageWrapper source={{ uri: GIF_URL }} style={styles.formatImage} resizeMode="cover" />
//           </View>
//           <View style={styles.formatItem}>
//             <Text style={styles.formatLabel}>WebP</Text>
//             <TurboImageWrapper source={{ uri: WEBP_URL }} style={styles.formatImage} resizeMode="cover" />
//           </View>
//           {Platform.OS === 'android' && (
//             <View style={styles.formatItem}>
//               <Text style={styles.formatLabel}>AVIF (Android)</Text>
//               <TurboImageWrapper source={{ uri: AVIF_URL }} style={styles.formatImage} resizeMode="cover" />
//             </View>
//           )}
//         </View>
//       </View>

//       {/* Performance Grid */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Performance Grid (30 images)</Text>
//         <View style={styles.gridHeader}>
//           <TouchableOpacity style={styles.actionBtn} onPress={prefetchGrid}>
//             <Text style={styles.actionText}>Prefetch All</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.actionBtn} onPress={clearCaches}>
//             <Text style={styles.actionText}>Clear Caches</Text>
//           </TouchableOpacity>
//         </View>

//         <FlatList
//           data={GRID_IMAGES}
//           numColumns={3}
//           columnWrapperStyle={styles.gridRow}
//           keyExtractor={item => item.id.toString()}
//           renderItem={({ item }) => (
//             <TurboImageWrapper
//               source={{ uri: item.uri }}
//               style={[styles.gridImage, rounded && styles.rounded]}
//               resizeMode="cover"
//               placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
//               // indicator={{ style: 'small' }}
//             />
//           )}
//         />
//       </View>

//       {/* Fancy Blur Background */}
//       <View style={styles.blurSection}>
//         <TurboImage
//           source={heroSource}
//           style={StyleSheet.absoluteFillObject}
//           resizeMode="cover"
//           blur={0.5}
//         />
//         {/* <BlurView style={StyleSheet.absoluteFillObject} blurType="dark" blurAmount={10} /> */}
//         <View style={styles.blurContent}>
//           <Text style={styles.blurTitle}>Blur Background</Text>
//           <Text style={styles.blurText}>Native blur + cached image</Text>
//         </View>
//       </View>

//       <TouchableOpacity style={styles.infoBtn} onPress={showCacheInfo}>
//         <Text style={styles.infoText}>Tap for Cache Info</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#0f172a' },
//   content: { padding: 16, paddingBottom: 40 },
//   title: { fontSize: 28, fontWeight: '800', color: '#fff', textAlign: 'center' },
//   subtitle: { fontSize: 16, color: '#94a3b8', textAlign: 'center', marginBottom: 24 },
//   section: { marginBottom: 24, backgroundColor: '#1e293b', borderRadius: 16, padding: 16 },
//   sectionTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 12 },
//   row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
//   chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, backgroundColor: '#334155' },
//   chipActive: { backgroundColor: '#0ea5e4' },
//   chipText: { color: '#cbd5e1', fontWeight: '600' },
//   chipTextActive: { color: '#fff' },
//   status: { color: '#94a3b8', fontSize: 13 },
//   heroRow: { flexDirection: 'row', gap: 12 },
//   heroImage: { flex: 1, height: 200, borderRadius: 16 },
//   rounded: { borderRadius: 999 },
//   formatGrid: { padding: 0 },
//   formatRow: { flexDirection: 'row', gap: 12 },
//   formatItem: { flex: 1, alignItems: 'center' },
//   formatLabel: { color: '#e2e8f0', marginBottom: 8, fontWeight: '600' },
//   formatImage: { width: '100%', height: 120, borderRadius: 12 },
//   gridHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
//   actionBtn: { backgroundColor: '#0ea5e4', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
//   actionText: { color: '#fff', fontWeight: '600' },
//   gridRow: { gap: 8, justifyContent: 'space-between', marginBottom: 8 },
//   gridImage: { width: ITEM_SIZE, height: ITEM_SIZE, borderRadius: 12 },
//   blurSection: { height: 300, borderRadius: 24, overflow: 'hidden', marginBottom: 24 },
//   blurContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
//   blurTitle: { fontSize: 32, fontWeight: '800', color: '#fff' },
//   blurText: { fontSize: 16, color: '#e2e8f0', marginTop: 8 },
//   infoBtn: { alignSelf: 'center', padding: 16 },
//   infoText: { color: '#0ea5e4', fontWeight: '600' },
// });