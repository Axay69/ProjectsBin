import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { useNotesStore } from './lib/store'
import { useEffect } from 'react'
import Index from './pages/Index'
import NoteDetailPage from './pages/NoteDetailPage'
import EditNotePage from './pages/EditNotePage'
import SketchPage from './pages/SketchPage'
import MediaPreviewScreen from './pages/MediaPreviewScreen'
import SettingsPage from './pages/SettingsPage'
import { ActivityIndicator, View } from 'react-native'
import { getTheme } from './theme'

import type { MediaItem } from './types'

type NotesStackParamList = {
  Index: undefined
  NoteDetail: { id: string }
  EditNote: { id?: string }
  Sketch: { id?: string }
  MediaPreview: { media: MediaItem }
}

export type NotesTabParamList = {
  Home: undefined
  Settings: undefined
}

const NotesStack = createNativeStackNavigator<NotesStackParamList>()
const Tab = createBottomTabNavigator<NotesTabParamList>()

function NotesTab(_: NativeStackScreenProps<NotesStackParamList, 'Index'>) {
  const darkMode = useNotesStore(s => s.darkMode)
  const theme = getTheme(darkMode)
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          const iconName = ({
            Home: focused ? 'home' : 'home-outline',
            Settings: focused ? 'cog' : 'cog-outline',
          } as Record<string, string>)[route.name] || 'home'
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.subtext,
        tabBarStyle: { backgroundColor: theme.surface, borderTopWidth: 0, height: 64 },
      })}
    >
      <Tab.Screen name="Home" component={Index} />
      <Tab.Screen name="Settings" component={SettingsPage} />
    </Tab.Navigator>
  )
}

export default function NotesNavigator() {
  const darkMode = useNotesStore(s => s.darkMode)
  const hydrate = useNotesStore(s => s.hydrate)
  const isHydrated = useNotesStore(s => s.isHydrated)
  const theme = getTheme(darkMode)

  useEffect(() => { hydrate() }, [hydrate])

  if (!isHydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.bg }}>
        <ActivityIndicator color={theme.primary} />
      </View>
    )
  }

  return (
    <NotesStack.Navigator screenOptions={{ headerShown: false }}>
      <NotesStack.Screen name="Index" component={NotesTab} />
      <NotesStack.Screen name="NoteDetail" component={NoteDetailPage} />
      <NotesStack.Screen name="EditNote" component={EditNotePage} />
      <NotesStack.Screen name="Sketch" component={SketchPage} />
      <NotesStack.Screen name="MediaPreview" component={MediaPreviewScreen} options={{
        animation: 'fade',
        
      }} />
    </NotesStack.Navigator>
  )
}
