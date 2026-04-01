import {
  Text,
  View,
  Pressable,
  StatusBar,
  ScrollView,
  Linking,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createStyleSheet, useStyles } from 'react-native-unistyles';
import axios from 'axios';
import '../styles/unistyles';

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
  TableComponentDemo: undefined;
  BottomSheetDemo: undefined;
  HapticFeedbackDemo: undefined;
  ReanimatedCarouselDemo: undefined;
  ReanimatedEnteringExiting: undefined;
  ReanimatedList: undefined;
  ReanimatedExpander: undefined;
  ReanimatedPopEnterLayout: undefined;
  ReanimatedDragLayout: undefined;
  ReanimatedLayoutGallery: undefined;
  ReanimatedKeyframesLayout: undefined;
  CustomChildWrapper: undefined;
  MotionX: undefined;
  SystemNavigationBarDemo: undefined;
  NativeFFmpegDemo: undefined;
  NativeMedia3Demo: undefined;
  PipDemo: undefined;
  VideoEditor: { videoUri?: string } | undefined;
  XTunes: undefined;
  CustomSliderDemo: undefined;
  StateManagementRD: undefined;
  ContextDemo: undefined;
  ZustandDemo: undefined;
  //   ZegoCloudDemo: undefined;
  //   ZegoCloudProDemo: undefined;
  //   ZegoScreenCastingDemo: undefined;
  RiveAnimationDemo: undefined;
  StickyHeaderDemo: undefined;
  MeshGradientDemo: undefined;
  JotaiScreen1: undefined;
  JotaiScreen2: undefined;
  HookFormDemo: undefined;
  UnistylesDemo: undefined;
  ContextMenuDemo: undefined;
  D3ShapeDemo: undefined;
  TypeAnimationDemo: undefined;
  SkiaLiquidDemo: undefined;
  SkiaAudioVisualizer: undefined;
  DraggableDemo: undefined;
  TrueSheetDemo: undefined;
  ThemeSwitchDemo: undefined;
  InputEffectsDemo: undefined;
  ScreenTransitionsDemo: undefined;
  NotifierAndConfettiDemo: undefined;
  TourGuideDemo: undefined;
  TourGuideCustomDemo: undefined;
  RateAppDemo: undefined;
  ReduxDevToolsDemo: undefined;
  SkiaImageMaskerDemo: undefined;
  AndroidHomeDemo: undefined;
  ThreeDModelDemo: undefined;
};



type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { styles, theme } = useStyles(stylesheet);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={theme.colors.background}
        barStyle={theme.colors.background === '#ffffff' ? 'dark-content' : 'light-content'}
      />
      <Text style={styles.header}>Projects Bin</Text>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        style={styles.list}
        showsVerticalScrollIndicator={false}
      >
        <TaskItem
          title="Outlook Login"
          subtitle="Login with Email or Outlook"
          onPress={async () => {
            try {
              console.log('[OutlookLogin] Fetching auth URL...');
              const response = await axios.get('https://c392-2405-201-200c-90ad-5049-aa64-52f4-9152.ngrok-free.app/auth/outlook/url');
              const { link } = response.data;
              console.log('[OutlookLogin] Redirecting to:', link);
              Linking.openURL(link).catch(err => console.error('[OutlookLogin] Error opening URL:', err));
            } catch (error) {
              console.error('[OutlookLogin] Error initiating login:', error);
            }
          }}
        />
        <TaskItem
          title="Task 1: Counter"
          subtitle="useState and typed props"
          onPress={() => navigation.navigate('Counter')}
        />
        <TaskItem
          title="Task 2: Todos"
          subtitle="Typed list and FlatList"
          onPress={() => navigation.navigate('Todos')}
        />
        <TaskItem
          title="xTracker"
          subtitle="Fitness challenge tracker"
          onPress={() => navigation.navigate('XTracker')}
        />
        <TaskItem
          title="Notes"
          subtitle="Simple note taking app"
          onPress={() => navigation.navigate('Notes')}
        />
        <TaskItem
          title="InstaStoryViewer"
          subtitle="Pick media and view stories"
          onPress={() => navigation.navigate('InstaStorySetup')}
        />
        <TaskItem
          title="KeyboardController Demo"
          subtitle="Keyboard-aware scroll + toolbar"
          onPress={() => navigation.navigate('KeyboardControllerDemo')}
        />
        <TaskItem
          title="Text Recognition Demo"
          subtitle="Camera text recognition & translation"
          onPress={() => navigation.navigate('TextRecognitionDemo')}
        />
        <TaskItem
          title="Blob Courier Demo"
          subtitle="File upload/download with progress"
          onPress={() => navigation.navigate('BlobCourierDemo')}
        />
        <TaskItem
          title="Turbo Image Demo"
          subtitle="Fast caching, placeholders, prefetch"
          onPress={() => navigation.navigate('TurboImageDemo')}
        />
        <TaskItem
          title="Table Component Demo"
          subtitle="Headers, rows, clickable cells"
          onPress={() => navigation.navigate('TableComponentDemo')}
        />
        <TaskItem
          title="Bottom Sheet Demo"
          subtitle="Snap points, pan to close"
          onPress={() => navigation.navigate('BottomSheetDemo')}
        />
        <TaskItem
          title="Haptic Feedback Demo"
          subtitle="Impact, selection, notifications"
          onPress={() => navigation.navigate('HapticFeedbackDemo')}
        />
        <TaskItem
          title="Reanimated Carousel Demo"
          subtitle="Parallax, autoplay, looping"
          onPress={() => navigation.navigate('ReanimatedCarouselDemo')}
        />
        <TaskItem
          title="Reanimated: Entering/Exiting"
          subtitle="Animate mount/unmount"
          onPress={() => navigation.navigate('ReanimatedEnteringExiting')}
        />
        <TaskItem
          title="Reanimated: Animated List"
          subtitle="Insertions and deletions"
          onPress={() => navigation.navigate('ReanimatedList')}
        />
        <TaskItem
          title="Reanimated: Expander"
          subtitle="Animated layout transitions"
          onPress={() => navigation.navigate('ReanimatedExpander')}
        />
        <TaskItem
          title="Reanimated: PopEnter + Layout"
          subtitle="Keyframe entering + layout spring"
          onPress={() => navigation.navigate('ReanimatedPopEnterLayout')}
        />
        <TaskItem
          title="Reanimated: Drag + Layout"
          subtitle="Drag one; others layout"
          onPress={() => navigation.navigate('ReanimatedDragLayout')}
        />
        <TaskItem
          title="Reanimated: Layout Gallery"
          subtitle="Grid or Masonry with layout"
          onPress={() => navigation.navigate('ReanimatedLayoutGallery')}
        />
        <TaskItem
          title="Reanimated: Keyframes + Layout"
          subtitle="Entering/Exiting, Keyframes, Layout.delay()"
          onPress={() => navigation.navigate('ReanimatedKeyframesLayout')}
        />
        <TaskItem
          title="System Navigation Bar Demo"
          subtitle="Android nav bar color & immersive"
          onPress={() => navigation.navigate('SystemNavigationBarDemo')}
        />
        <TaskItem
          title="Reanimated: Custom Child Wrapper"
          subtitle="Animate child layout when grid reshapes"
          onPress={() => navigation.navigate('CustomChildWrapper')}
        />
        <TaskItem
          title="MotionX"
          subtitle="Fitness App"
          onPress={() => navigation.navigate('MotionX')}
        />
        <TaskItem
          title="xTunes"
          subtitle="Tony Stark's Music Interface"
          onPress={() => navigation.navigate('XTunes')}
        />
        <TaskItem
          title="Native Media3 Demo"
          subtitle="Android Media3 editing (no FFmpeg)"
          onPress={() => navigation.navigate('NativeMedia3Demo')}
        />
        <TaskItem
          title="Pip Demo"
          subtitle="Android pip demo with custom contols"
          onPress={() => navigation.navigate('PipDemo')}
        />
        <TaskItem
          title="Video Editor"
          subtitle="Timeline-based video editing UI"
          onPress={() => navigation.navigate('VideoEditor')}
        />
        <TaskItem
          title="Custom Slider Demo"
          subtitle="Native Android slider with JSI"
          onPress={() => navigation.navigate('CustomSliderDemo')}
        />
        <TaskItem
          title="State Management R&D"
          subtitle="Zustand vs Context - Measure re-render counts"
          onPress={() => navigation.navigate('StateManagementRD')}
        />
        {/*
        <TaskItem
          title="ZegoCloud Demo"
          subtitle="1-on-1 Voice & Video Calls"
          onPress={() => navigation.navigate('ZegoCloudDemo')}
        />
        <TaskItem
          title="ZegoCloud Pro Demo"
          subtitle="1-on-1/Group with pre-join options"
          onPress={() => navigation.navigate('ZegoCloudProDemo')}
        />
        <TaskItem
          title="ZegoCloud Screen Casting Demo"
          subtitle="Android screen sharing in gallery layout"
          onPress={() => navigation.navigate('ZegoScreenCastingDemo')}
        />
        */}
        <TaskItem
          title="Rive Animation Demo"
          subtitle="Interactive Rive animations (Bunny, Bear)"
          onPress={() => navigation.navigate('RiveAnimationDemo')}
        />
        <TaskItem
          title="Collapsible Sticky Header"
          subtitle="Glassmorphism & Scroll Animations"
          onPress={() => navigation.navigate('StickyHeaderDemo')}
        />
        <TaskItem
          title="Mesh Gradient Demo"
          subtitle="Vibrant and organic color transitions"
          onPress={() => navigation.navigate('MeshGradientDemo')}
        />
        <TaskItem
          title="Jotai Demo"
          subtitle="Atomic state management sync across screens"
          onPress={() => navigation.navigate('JotaiScreen1')}
        />
        <TaskItem
          title="React Hook Form Demo"
          subtitle="Performant forms with easy validation"
          onPress={() => navigation.navigate('HookFormDemo')}
        />
        <TaskItem
          title="Unistyles Demo"
          subtitle="Theming and responsive styling system"
          onPress={() => navigation.navigate('UnistylesDemo')}
        />
        <TaskItem
          title="Context Menu Demo"
          subtitle="Native long-press context menus"
          onPress={() => navigation.navigate('ContextMenuDemo')}
        />
        <TaskItem
          title="D3 Shape Demo"
          subtitle="Mathematical SVG path generation"
          onPress={() => navigation.navigate('D3ShapeDemo')}
        />
        <TaskItem
          title="Skia Liquid Fusion"
          subtitle="Organic metaballs merging effect"
          onPress={() => navigation.navigate('SkiaLiquidDemo')}
        />
        <TaskItem
          title="Skia Audio Visualizer"
          subtitle="Animated sine waves using paths"
          onPress={() => navigation.navigate('SkiaAudioVisualizer')}
        />
        <TaskItem
          title="Draggable View"
          subtitle="Vertical draggable drawer experience"
          onPress={() => navigation.navigate('DraggableDemo')}
        />
        <TaskItem
          title="True Sheet Demo"
          subtitle="Native bottom sheet with snap points"
          onPress={() => navigation.navigate('TrueSheetDemo')}
        />
        <TaskItem
          title="Theme Switch Animation"
          subtitle="Smooth circular reveal theme switching"
          onPress={() => navigation.navigate('ThemeSwitchDemo')}
        />
        <TaskItem
          title="Type Animation"
          subtitle="Sequential text typing animations"
          onPress={() => navigation.navigate('TypeAnimationDemo')}
        />
        <TaskItem
          title="Input Effects Demo"
          subtitle="Animated text inputs (Sae, Hoshi, Fumi, Kohana)"
          onPress={() => navigation.navigate('InputEffectsDemo')}
        />
        <TaskItem
          title="Screen Transitions"
          subtitle="Shared Element Transitions & Animations"
          onPress={() => navigation.navigate('ScreenTransitionsDemo')}
        />
        <TaskItem
          title="Notifier & Confetti"
          subtitle="Custom notifications & confetti effects"
          onPress={() => navigation.navigate('NotifierAndConfettiDemo')}
        />
        <TaskItem
          title="Tour Guide Demo"
          subtitle="App onboarding & feature highlights"
          onPress={() => navigation.navigate('TourGuideDemo')}
        />
        <TaskItem
          title="Custom Tour Guide"
          subtitle="Custom Tooltips & Styles"
          onPress={() => navigation.navigate('TourGuideCustomDemo')}
        />
        <TaskItem
          title="Rate App Demo"
          subtitle="In-app reviews & store redirect"
          onPress={() => navigation.navigate('RateAppDemo')}
        />
        <TaskItem
          title="Redux DevTools Demo"
          subtitle="Time-travel debugging & state diffs"
          onPress={() => navigation.navigate('ReduxDevToolsDemo')}
        />
        <TaskItem
          title="Skia Image Masker"
          subtitle="Punch-out masking for AI clothes swapping"
          onPress={() => navigation.navigate('SkiaImageMaskerDemo')}
        />
        <TaskItem
          title="Android Home Demo"
          subtitle="4x5 Grid Layout with Swipeable Pages"
          onPress={() => navigation.navigate('AndroidHomeDemo')}
        />
        <TaskItem
          title="3D Model Demo"
          subtitle="React Three Fiber & Drei integration"
          onPress={() => navigation.navigate('ThreeDModelDemo')}
        />

      </ScrollView>
    </SafeAreaView>
  );
}

type TaskItemProps = { title: string; subtitle: string; onPress: () => void };

function TaskItem({ title, subtitle, onPress }: TaskItemProps) {
  const { styles } = useStyles(stylesheet);
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

const stylesheet = createStyleSheet((theme) => ({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: theme.spacing.md,
    color: theme.colors.typography,
  },
  scrollContent: {
    flexGrow: 1,
    gap: theme.spacing.md,
    paddingBottom: 20
  },
  list: {
    // gap: 10 
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  itemTextBox: { flex: 1 },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.typography,
  },
  itemSubtitle: {
    fontSize: 13,
    color: theme.colors.typography,
    marginTop: 2,
    opacity: 0.7,
  },
  chevron: { paddingLeft: 8 },
  chevronText: {
    fontSize: 24,
    color: theme.colors.primary,
  },
}));
