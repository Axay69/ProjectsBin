// import React from 'react';
// import { StyleSheet, Text, View, Dimensions, Image } from 'react-native';
// import Transition from 'react-native-screen-transitions';
// import { createNativeStackNavigator } from 'react-native-screen-transitions/native-stack';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

// const Stack = createNativeStackNavigator();
// const { width } = Dimensions.get('window');

// const DATA = [
//     { id: '1', title: 'Mountain', artist: 'Nature Sounds', image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80', color: '#2c3e50' },
//     { id: '2', title: 'Forest', artist: 'Green Vibes', image: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=800&q=80', color: '#27ae60' },
//     { id: '3', title: 'Desert', artist: 'Sandstorm', image: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?auto=format&fit=crop&w=800&q=80', color: '#e67e22' },
//     { id: '4', title: 'Ocean', artist: 'Deep Blue', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', color: '#2980b9' },
//     { id: '5', title: 'City', artist: 'Urban Life', image: 'https://images.unsplash.com/photo-1449824913929-2b3a620bcb3d?auto=format&fit=crop&w=800&q=80', color: '#8e44ad' },
//     { id: '6', title: 'Space', artist: 'Star Gazer', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80', color: '#2c3e50' },
// ];

// const ListScreen = ({ navigation }: any) => {
//     return (
//         <SafeAreaView style={styles.container}>
//             <Text style={styles.headerTitle}>Listen Now</Text>
//             <View style={styles.grid}>
//                 {DATA.map((item) => (
//                     <Transition.Pressable
//                         key={item.id}
//                         sharedBoundTag={`album-${item.id}`}
//                         style={styles.card}
//                         onPress={() => {
//                             navigation.navigate('Detail', {
//                                 item,
//                                 sharedBoundTag: `album-${item.id}`
//                             });
//                         }}
//                     >
//                         <View style={[styles.imageContainer, { backgroundColor: item.color }]}>
//                             <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
//                             <View style={styles.textOverlay}>
//                                 <Text style={styles.cardTitle}>{item.title}</Text>
//                                 <Text style={styles.cardArtist}>{item.artist}</Text>
//                             </View>
//                         </View>
//                     </Transition.Pressable>
//                 ))}
//             </View>
//         </SafeAreaView>
//     );
// };

// const DetailScreen = ({ route }: any) => {
//     const { item, sharedBoundTag } = route.params;

//     return (
//         <Transition.MaskedView style={{ flex: 1, backgroundColor: '#000' }}>
//             <Transition.View
//                 sharedBoundTag={sharedBoundTag}
//                 style={styles.detailCard}
//             >
//                 <Image source={{ uri: item.image }} style={styles.detailImage} resizeMode="cover" />
//                 <View style={styles.detailTextContainer}>
//                     <Text style={styles.detailTitle}>{item.title}</Text>
//                     <Text style={styles.detailArtist}>{item.artist}</Text>
//                 </View>
//             </Transition.View>

//             <View style={styles.detailContent}>
//                 <View style={styles.controls}>
//                     <FontAwesomeIcon name="backward" size={30} color="#fff" />
//                     <FontAwesomeIcon name="play-circle" size={60} color="#fff" />
//                     <FontAwesomeIcon name="forward" size={30} color="#fff" />
//                 </View>
//                 <Text style={styles.detailDescription}>
//                     Swipe down to dismiss using the Apple Music style gesture.
//                     The card expands from the list and can be thrown back.
//                 </Text>
//             </View>
//         </Transition.MaskedView>
//     );
// };

// const ScreenTransitionsDemoScreen = () => {
//     return (
//         <View style={{ flex: 1, backgroundColor: '#000' }}>
//             <Stack.Navigator
//                 screenOptions={{
//                     headerShown: false,
//                     // presentation: 'card',
//                 }}
//             >
//                 <Stack.Screen name="List" component={ListScreen} />
//                 <Stack.Screen
//                     name="Detail"
//                     component={DetailScreen}
//                     options={({ route }: any) => ({
//                         ...Transition.Presets.SharedAppleMusic({
//                             sharedBoundTag: route.params?.sharedBoundTag ?? "",
//                         }),
//                         // contentStyle: { backgroundColor: '#000' }
//                     })}
//                 />
//             </Stack.Navigator>
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#000',
//     },
//     headerTitle: {
//         fontSize: 34,
//         fontWeight: 'bold',
//         color: '#fff',
//         marginTop: 20,
//         marginBottom: 20,
//         paddingHorizontal: 20,
//     },
//     grid: {
//         flexDirection: 'row',
//         flexWrap: 'wrap',
//         padding: 10,
//         gap: 15,
//         justifyContent: 'center',
//     },
//     card: {
//         width: (width - 45) / 2,
//         aspectRatio: 1,
//         borderRadius: 12,
//         backgroundColor: '#1a1a1a',
//         // Shadow for iOS/Android
//         shadowColor: "#000",
//         shadowOffset: {
//             width: 0,
//             height: 2,
//         },
//         shadowOpacity: 0.25,
//         shadowRadius: 3.84,
//         elevation: 5,
//     },
//     imageContainer: {
//         width: '100%',
//         height: '100%',
//         borderRadius: 12,
//         overflow: 'hidden',
//         justifyContent: 'flex-end',
//     },
//     image: {
//         ...StyleSheet.absoluteFillObject,
//         width: '100%',
//         height: '100%',
//     },
//     textOverlay: {
//         padding: 12,
//         backgroundColor: 'rgba(0,0,0,0.3)',
//     },
//     cardTitle: {
//         color: '#fff',
//         fontSize: 16,
//         fontWeight: 'bold',
//     },
//     cardArtist: {
//         color: '#ddd',
//         fontSize: 14,
//     },
//     // Detail styles
//     detailCard: {
//         width: width * 0.9,
//         aspectRatio: 1,
//         alignSelf: 'center',
//         borderRadius: 12,
//         marginTop: 60,
//         overflow: 'hidden',
//         backgroundColor: '#333',
//     },
//     detailImage: {
//         width: '100%',
//         height: '100%',
//     },
//     detailTextContainer: {
//         position: 'absolute',
//         bottom: 0,
//         left: 0,
//         right: 0,
//         padding: 20,
//         backgroundColor: 'rgba(0,0,0,0.4)',
//     },
//     detailTitle: {
//         color: '#fff',
//         fontSize: 28,
//         fontWeight: 'bold',
//     },
//     detailArtist: {
//         color: '#ddd',
//         fontSize: 20,
//         marginTop: 4,
//     },
//     detailContent: {
//         flex: 1,
//         alignItems: 'center',
//         paddingTop: 40,
//     },
//     controls: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: 40,
//         marginBottom: 30,
//     },
//     detailDescription: {
//         color: '#888',
//         textAlign: 'center',
//         paddingHorizontal: 40,
//         lineHeight: 20,
//     },
// });

// export default ScreenTransitionsDemoScreen;

import { View, Text } from 'react-native'
import React from 'react'

const ScreenTransitionsDemoScreen = () => {
    return (
        <View>
            <Text>ScreenTransitionsDemoScreen</Text>
        </View>
    )
}

export default ScreenTransitionsDemoScreen