import { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useColorScheme } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import TodoScreen from '../screens/TodoScreen';
import CounterScreen from '../screens/CounterScreen';
import NotesNavigator from '../notes/NotesNavigator';
import InstaStorySetupScreen from '../screens/InstaStorySetupScreen';
import InstaStoryViewerScreen from '../screens/InstaStoryViewerScreen';
import KeyboardControllerDemoScreen from '../screens/KeyboardControllerDemoScreen';
import TextRecognitionDemoScreen from '../screens/TextRecognitionDemoScreen';
import BlobCourierDemoScreen from '../screens/BlobCourierDemoScreen';
import TurboImageDemoScreen from '../screens/TurboImageDemoScreen';
import TableComponentDemoScreen from '../screens/TableComponentDemoScreen';
import ReanimatedEnteringExitingScreen from '../screens/ReanimatedEnteringExitingScreen';
import ReanimatedListScreen from '../screens/ReanimatedListScreen';
import ReanimatedExpanderScreen from '../screens/ReanimatedExpanderScreen';
import ReanimatedPopEnterLayoutScreen from '../screens/ReanimatedPopEnterLayoutScreen';
import ReanimatedDragLayoutScreen from '../screens/ReanimatedDragLayoutScreen';
import ReanimatedLayoutGalleryScreen from '../screens/ReanimatedLayoutGalleryScreen';
import ReanimatedKeyframesLayoutScreen from '../screens/ReanimatedKeyframesLayoutScreen';
import CustomChildWrapperScreen from '../screens/CustomChildWrapperScreen';
import BottomSheetDemoScreen from '../screens/BottomSheetDemoScreen';
import HapticFeedbackDemoScreen from '../screens/HapticFeedbackDemoScreen';
import ReanimatedCarouselDemoScreen from '../screens/ReanimatedCarouselDemoScreen';
import MotiStateMachineButtonScreen from '../screens/MotiStateMachineButtonScreen';
import MotiToastStackScreen from '../screens/MotiToastStackScreen';
import MotiAnimatedTabBarScreen from '../screens/MotiAnimatedTabBarScreen';
import SystemNavigationBarDemoScreen from '../screens/SystemNavigationBarDemoScreen';
import Media3DemoScreen from '../screens/Media3DemoScreen';
import XTHome from '../xtracker/screens/HomeScreen';
import XTFriends from '../xtracker/screens/FriendsScreen';
import XTProfile from '../xtracker/screens/ProfileScreen';
import XTChallengeDetail from '../xtracker/screens/ChallengeDetailScreen';
import XTFriendProgress from '../xtracker/screens/FriendProgressScreen';
import MotionXFlow from '../motionx/MotionXFlow';

type RootStackParamList = {
  Home: undefined;
  Counter: undefined;
  Todos: undefined;
  XTracker: undefined;
  MotionX: undefined;
  SystemNavigationBarDemo: undefined;
  Notes: undefined;
  InstaStorySetup: undefined;
  InstaStoryViewer: { items: { type: 'image' | 'video'; uri: string }[] };
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
  MotiStateMachineButton: undefined;
  MotiToastStack: undefined;
  MotiAnimatedTabBar: undefined;
  NativeFFmpegDemo: undefined;
  NativeMedia3Demo: undefined;
};

type XTHomeStackParamList = {
  XTHomeTab: undefined;
  ChallengeDetail: { challengeId: string };
};

type XTFriendsStackParamList = {
  XTFriendsTab: undefined;
  FriendProgress: { friendId: string };
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const XTHomeStack = createNativeStackNavigator<XTHomeStackParamList>();
const XTFriendsStack = createNativeStackNavigator<XTFriendsStackParamList>();
const Tab = createBottomTabNavigator();

function XTHomeStackNavigator({ darkMode }: { darkMode: boolean }) {
  return (
    <XTHomeStack.Navigator screenOptions={{ headerShown: false }}>
      <XTHomeStack.Screen
        name="XTHomeTab"
        children={props => <XTHome {...props} darkMode={darkMode} />}
      />
      <XTHomeStack.Screen
        name="ChallengeDetail"
        children={props => <XTChallengeDetail {...props} darkMode={darkMode} />}
      />
    </XTHomeStack.Navigator>
  );
}

function XTFriendsStackNavigator({ darkMode }: { darkMode: boolean }) {
  return (
    <XTFriendsStack.Navigator screenOptions={{ headerShown: false }}>
      <XTFriendsStack.Screen
        name="XTFriendsTab"
        children={props => <XTFriends {...props} darkMode={darkMode} />}
      />
      <XTFriendsStack.Screen
        name="FriendProgress"
        children={props => <XTFriendProgress {...props} darkMode={darkMode} />}
      />
    </XTFriendsStack.Navigator>
  );
}

function XTrackerTabs({
  darkMode,
  toggleDarkMode,
}: {
  darkMode: boolean;
  toggleDarkMode: () => void;
}) {
  const isDarkMode = darkMode;
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const iconName =
            (
              {
                XTHome: focused ? 'home' : 'home-outline',
                XTFriends: focused
                  ? 'account-multiple'
                  : 'account-multiple-outline',
                XTProfile: focused ? 'account' : 'account-outline',
              } as Record<string, string>
            )[route.name] || 'home';
          return (
            <MaterialCommunityIcons name={iconName} size={size} color={color} />
          );
        },
        tabBarActiveTintColor: '#0EA5A4',
        tabBarInactiveTintColor: isDarkMode ? '#6B7280' : '#9CA3AF',
        headerShown: false,
        tabBarStyle: {
          // position: 'absolute',
          // bottom: 12,
          // left: 12,
          // right: 12,
          // borderRadius: 16,
          height: 70,
          backgroundColor: isDarkMode ? '#0F1419' : '#FFFFFF',
          // shadowColor: '#000',
          // shadowOpacity: 0.1,
          // shadowRadius: 10,
          // elevation: 5,
          borderTopWidth: 0,
        },
        tabBarLabelStyle: { fontSize: 12, marginBottom: 6 },
        tabBarItemStyle: { paddingVertical: 6 },
      })}
    >
      <Tab.Screen
        name="XTHome"
        children={() => <XTHomeStackNavigator darkMode={darkMode} />}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="XTFriends"
        children={() => <XTFriendsStackNavigator darkMode={darkMode} />}
        options={{ title: 'Friends' }}
      />
      <Tab.Screen
        name="XTProfile"
        children={() => (
          <XTProfile darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />
        )}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

function NotesStackNavigator() {
  return <NotesNavigator />;
}

export default function AppNavigator() {
  const systemDark = useColorScheme() === 'dark';
  const [darkMode, setDarkMode] = useState<boolean>(systemDark);

  return (
    <NavigationContainer>
      <RootStack.Navigator
        screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
      >
        <RootStack.Screen name="Home" component={HomeScreen} />
        <RootStack.Screen name="Counter" component={CounterScreen} />
        <RootStack.Screen name="Todos" component={TodoScreen} />
        <RootStack.Screen name="MotionX" children={() => <MotionXFlow />} />
        <RootStack.Screen
          name="SystemNavigationBarDemo"
          component={SystemNavigationBarDemoScreen}
        />
        <RootStack.Screen
          name="XTracker"
          children={() => (
            <XTrackerTabs
              darkMode={darkMode}
              toggleDarkMode={() => setDarkMode(!darkMode)}
            />
          )}
        />
        <RootStack.Screen
          name="Notes"
          children={() => <NotesStackNavigator />}
        />
        <RootStack.Screen
          name="InstaStorySetup"
          component={InstaStorySetupScreen}
        />
        <RootStack.Screen
          name="InstaStoryViewer"
          component={InstaStoryViewerScreen}
        />
        <RootStack.Screen
          name="KeyboardControllerDemo"
          component={KeyboardControllerDemoScreen}
        />
        <RootStack.Screen
          name="TextRecognitionDemo"
          component={TextRecognitionDemoScreen}
        />
        <RootStack.Screen
          name="BlobCourierDemo"
          component={BlobCourierDemoScreen}
        />
        <RootStack.Screen
          name="TurboImageDemo"
          component={TurboImageDemoScreen}
        />
        <RootStack.Screen
          name="TableComponentDemo"
          component={TableComponentDemoScreen}
        />
        <RootStack.Screen
          name="BottomSheetDemo"
          component={BottomSheetDemoScreen}
        />
        <RootStack.Screen
          name="HapticFeedbackDemo"
          component={HapticFeedbackDemoScreen}
        />
        <RootStack.Screen
          name="ReanimatedCarouselDemo"
          component={ReanimatedCarouselDemoScreen}
        />
        <RootStack.Screen
          name="ReanimatedEnteringExiting"
          component={ReanimatedEnteringExitingScreen}
        />
        <RootStack.Screen
          name="ReanimatedList"
          component={ReanimatedListScreen}
        />
        <RootStack.Screen
          name="ReanimatedExpander"
          component={ReanimatedExpanderScreen}
        />
        <RootStack.Screen
          name="ReanimatedPopEnterLayout"
          component={ReanimatedPopEnterLayoutScreen}
        />
        <RootStack.Screen
          name="ReanimatedDragLayout"
          component={ReanimatedDragLayoutScreen}
        />
        <RootStack.Screen
          name="ReanimatedLayoutGallery"
          component={ReanimatedLayoutGalleryScreen}
        />
        <RootStack.Screen
          name="ReanimatedKeyframesLayout"
          component={ReanimatedKeyframesLayoutScreen}
        />
        <RootStack.Screen
          name="CustomChildWrapper"
          component={CustomChildWrapperScreen}
        />
        <RootStack.Screen
          name="MotiStateMachineButton"
          component={MotiStateMachineButtonScreen}
        />
        <RootStack.Screen
          name="MotiToastStack"
          component={MotiToastStackScreen}
        />
        <RootStack.Screen
          name="MotiAnimatedTabBar"
          component={MotiAnimatedTabBarScreen}
        />
        <RootStack.Screen
          name="NativeMedia3Demo"
          component={Media3DemoScreen}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
