import { StyleSheet, Text, View, Pressable, StatusBar, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  Home: undefined;
  Counter: undefined;
  Todos: undefined;
  XTracker: undefined;
  Notes: undefined;
  InstaStorySetup: undefined;
  KeyboardControllerDemo: undefined;
  TextRecognitionDemo: undefined;
  BlobCourierDemo: undefined;
  TurboImageDemo: undefined;
  ReanimatedEnteringExiting: undefined;
  ReanimatedList: undefined;
  ReanimatedExpander: undefined;
  ReanimatedPopEnterLayout: undefined;
  ReanimatedDragLayout: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Projects Bin</Text>
      {/* <StatusBar backgroundColor={'red'} /> */}
      <ScrollView contentContainerStyle={{flexGrow: 1, gap: 10, paddingBottom: 20}} style={styles.list}>
        <TaskItem title="Task 1: Counter" subtitle="useState and typed props" onPress={() => navigation.navigate('Counter')} />
        <TaskItem title="Task 2: Todos" subtitle="Typed list and FlatList" onPress={() => navigation.navigate('Todos')} />
        <TaskItem title="xTracker" subtitle="Fitness challenge tracker" onPress={() => navigation.navigate('XTracker')} />
        <TaskItem title="Notes" subtitle="Simple note taking app" onPress={() => navigation.navigate('Notes')} />
        <TaskItem title="InstaStoryViewer" subtitle="Pick media and view stories" onPress={() => navigation.navigate('InstaStorySetup')} />
        <TaskItem title="KeyboardController Demo" subtitle="Keyboard-aware scroll + toolbar" onPress={() => navigation.navigate('KeyboardControllerDemo')} />
        <TaskItem title="Text Recognition Demo" subtitle="Camera text recognition & translation" onPress={() => navigation.navigate('TextRecognitionDemo')} />
        <TaskItem title="Blob Courier Demo" subtitle="File upload/download with progress" onPress={() => navigation.navigate('BlobCourierDemo')} />
        <TaskItem title="Turbo Image Demo" subtitle="Fast caching, placeholders, prefetch" onPress={() => navigation.navigate('TurboImageDemo')} />
        <TaskItem title="Reanimated: Entering/Exiting" subtitle="Animate mount/unmount" onPress={() => navigation.navigate('ReanimatedEnteringExiting')} />
        <TaskItem title="Reanimated: Animated List" subtitle="Insertions and deletions" onPress={() => navigation.navigate('ReanimatedList')} />
        <TaskItem title="Reanimated: Expander" subtitle="Animated layout transitions" onPress={() => navigation.navigate('ReanimatedExpander')} />
        <TaskItem title="Reanimated: PopEnter + Layout" subtitle="Keyframe entering + layout spring" onPress={() => navigation.navigate('ReanimatedPopEnterLayout')} />
        <TaskItem title="Reanimated: Drag + Layout" subtitle="Drag one; others layout" onPress={() => navigation.navigate('ReanimatedDragLayout')} />
      </ScrollView>
    </View>
  );
}

type TaskItemProps = { title: string; subtitle: string; onPress: () => void };

function TaskItem({ title, subtitle, onPress }: TaskItemProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.item}>
      <View style={styles.itemTextBox}>
        <Text style={styles.itemTitle}>{title}</Text>
        <Text style={styles.itemSubtitle}>{subtitle}</Text>
      </View>
      <View style={styles.chevron}>
        <Text style={styles.chevronText}>›</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
  list: { gap: 10 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  itemTextBox: { flex: 1 },
  itemTitle: { fontSize: 16, fontWeight: '700' },
  itemSubtitle: { fontSize: 13, color: '#666', marginTop: 2 },
  chevron: { paddingLeft: 8 },
  chevronText: { fontSize: 24, color: '#999' },
});
