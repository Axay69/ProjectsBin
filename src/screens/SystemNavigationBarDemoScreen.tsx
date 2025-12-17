import { useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View, Pressable, StatusBar, Dimensions } from 'react-native';
import SystemNavigationBar, { GetBarColorType } from 'react-native-system-navigation-bar';

export default function SystemNavigationBarDemoScreen() {
  const [barColors, setBarColors] = useState<GetBarColorType | null>(null);
  const isAndroid = Platform.OS === 'android';


  useEffect(() => {
    if (!isAndroid) return;
 
    console.log('SystemNavigationBar', StatusBar.currentHeight, SystemNavigationBar.getBarColor(), Dimensions.get('screen'), Dimensions.get('window'));
    // SystemNavigationBar.setNavigationColor('#0F1419', 'dark', 'both');
    // refreshColors();
  }, [isAndroid]);

  const refreshColors = async () => {
    if (!isAndroid) return;
    const colors = await SystemNavigationBar.getBarColor('both');
    setBarColors(colors);
  };

  const Button = ({ title, onPress }: { title: string; onPress: () => void }) => (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.btn}>
      <Text style={styles.btnText}>{title}</Text>
    </Pressable>
  );

  if (!isAndroid) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>System Navigation Bar Demo</Text>
        <Text style={styles.subtitle}>Android-only feature. Open this on an Android device.</Text>
      </View>
    );
  }

  return (
    <View style={{height: Dimensions.get('screen').height, width: Dimensions.get('screen').width, backgroundColor: 'red'}}>

    <ScrollView contentContainerStyle={styles.container} style={{ flex: 1 }}>
      <Text style={styles.header}>System Navigation Bar Demo</Text>
      <Text style={styles.subtitle}>Customize Android navigation and status bars</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Colors</Text>
        <View style={styles.row}>
          <Button title="Dark Teal" onPress={() => SystemNavigationBar.setNavigationColor('#0EA5A4', 'dark', 'navigation')} />
          <Button title="Light (White)" onPress={() => SystemNavigationBar.setNavigationColor('#FFFFFF', 'light', 'navigation')} />
        </View>
        <View style={styles.row}>
          <Button title="Translucent" onPress={() => SystemNavigationBar.setNavigationColor('translucent', 'dark', 'navigation')} />
          <Button title="Transparent" onPress={() => SystemNavigationBar.setNavigationColor('transparent', 'dark', 'navigation')} />
        </View>
        <Button title="Refresh Colors" onPress={refreshColors} />
        {barColors && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>Status: {(barColors as any).status}</Text>
            <Text style={styles.infoText}>Navigation: {(barColors as any).navigation}</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Visibility & Modes</Text>
        <View style={styles.row}>
          <Button title="Hide Nav" onPress={() => SystemNavigationBar.navigationHide()} />
          <Button title="Show Nav" onPress={() => SystemNavigationBar.navigationShow()} />
        </View>
        <View style={styles.row}>
          <Button title="Lean Back" onPress={() => SystemNavigationBar.leanBack()} />
          <Button title="Immersive" onPress={() => SystemNavigationBar.immersive()} />
        </View>
        <View style={styles.row}>
          <Button title="Sticky Immersive" onPress={() => SystemNavigationBar.stickyImmersive()} />
          <Button title="Full Screen" onPress={() => SystemNavigationBar.fullScreen(true)} />
        </View>
        <View style={styles.row}>
          <Button title="Bar Mode: Light" onPress={() => SystemNavigationBar.setBarMode('light', 'both')} />
          <Button title="Bar Mode: Dark" onPress={() => SystemNavigationBar.setBarMode('dark', 'both')} />
        </View>
        <View style={styles.row}>
          <Button title="FitsSystemWindows ON" onPress={() => SystemNavigationBar.setFitsSystemWindows(true)} />
          <Button title="FitsSystemWindows OFF" onPress={() => SystemNavigationBar.setFitsSystemWindows(false)} />
        </View>
      </View>
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16 },
  header: { fontSize: 22, fontWeight: '700' },
  subtitle: { marginTop: 6, color: '#666' },
  section: { marginTop: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  row: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  btnText: { fontWeight: '600' },
  infoBox: { marginTop: 8, padding: 12, borderRadius: 10, backgroundColor: '#f3f4f6' },
  infoText: { color: '#111' },
});

