import { View, StyleSheet, ViewStyle } from 'react-native'
import { ReactNode } from 'react'
import { getTheme, type ThemeColors } from '../../theme'

type Props = {
  noteColor: string
  darkMode: boolean
  children: ReactNode
  style?: ViewStyle
}

/**
 * Wrapper component that applies note background color with opacity
 * mixed with theme background color for better contrast
 */
export default function NoteWrapper({ noteColor, darkMode, children, style }: Props) {
  const theme = getTheme(darkMode)
  
  // Convert hex to RGB and apply opacity
  const hexToRgba = (hex: string, opacity: number) => {
    // Handle hex colors with or without #
    const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex
    const r = parseInt(cleanHex.slice(0, 2), 16)
    const g = parseInt(cleanHex.slice(2, 4), 16)
    const b = parseInt(cleanHex.slice(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${opacity})`
  }

  // Mix note color with opacity based on theme mode
  // Dark mode: lower opacity (0.25-0.3) for subtle effect
  // Light mode: higher opacity (0.4-0.5) for better visibility
  const opacity = darkMode ? 0.25 : 0.45
  const backgroundColor = hexToRgba(noteColor, opacity)

  return (
    <View style={[styles.container, { backgroundColor }, style]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

