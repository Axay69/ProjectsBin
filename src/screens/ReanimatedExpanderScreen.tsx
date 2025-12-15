import React, { useState, useEffect, useMemo } from 'react'
import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import Animated, { FadeIn, FadeInLeft, FadeOut, FadeOutRight, FadeOutUp, Layout } from 'react-native-reanimated'
import FastImage from 'react-native-fast-image'
import Video from 'react-native-video'

type RootStackParamList = { ReanimatedExpander: undefined }

type Props = NativeStackScreenProps<RootStackParamList, 'ReanimatedExpander'>

export default function ReanimatedExpanderScreen(_: Props) {
  const [open, setOpen] = useState(false)
  const [open2, setOpen2] = useState(false)
  const [faqOpen, setFaqOpen] = useState<number[]>([])
  const [imageOpen, setImageOpen] = useState(false)
  const [videoOpen, setVideoOpen] = useState(false)
  const sentence = 'This text fades and slides using entering/exiting animations. This text fades and slides using entering/exiting animations. This text fades and slides using entering/exiting animations. This text fades and slides using entering/exiting animations.'
  const words = useMemo(() => sentence.split(''), [sentence])
  const [typedCount, setTypedCount] = useState(0)

  useEffect(() => {
    let id: any
    if (open2) {
      setTypedCount(0)
      id = setInterval(() => {
        setTypedCount((c) => (c >= words.length ? c : c + 1))
      }, 30)
    } else {
      setTypedCount(0)
    }
    return () => {
      if (id) clearInterval(id)
    }
  }, [open2, words.length])
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Layout Transitions</Text>
      <Text style={styles.desc}>Animate position and size changes automatically with layout.</Text>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
        <Pressable accessibilityRole="button" onPress={() => setOpen((s) => !s)}>
          <Animated.View layout={Layout.duration(400)} style={styles.expander}>
            <Text style={styles.expanderHeader}>Tap to {open ? 'collapse' : 'expand'}</Text>
            {open && (
              <Animated.View entering={FadeIn.duration(400)} exiting={FadeOut.duration(400)} layout={Layout.springify()} style={styles.expanderBody}>
                <Text style={styles.expanderText}>Expanded content… This area grows and shrinks with animated layout.</Text>
              </Animated.View>
            )}
          </Animated.View>
        </Pressable>

        <Animated.View layout={Layout.duration(400)} style={styles.faqGroup}>
          {[1, 2, 3].map((id) => {
            const isOpen = faqOpen.includes(id)
            return (
                <Animated.View key={id}  layout={Layout.duration(400)} style={styles.faqItem}>
              <Pressable accessibilityRole="button" onPress={() => setFaqOpen((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))}>
                  <Text style={styles.expanderHeader}>FAQ #{id}</Text>
                  {isOpen && (
                    <Animated.View entering={FadeInLeft.duration(400).delay(200)} exiting={FadeOutRight.duration(200)} layout={Layout.springify()} style={styles.expanderBody}>
                      <Text style={styles.expanderText}>Answer text that animates open and closed.</Text>
                    </Animated.View>
                  )}
              </Pressable>
                </Animated.View>
            )
          })}
        </Animated.View>
        <Animated.View layout={Layout.duration(400)}>
          <Pressable accessibilityRole="button" onPress={() => setOpen2((s) => !s)}>
            <Animated.View layout={Layout.duration(400)} style={styles.expander}>
              <Text style={styles.expanderHeader}>Animated Text — {open2 ? 'collapse' : 'expand'}</Text>
              {open2 && (
                <Animated.Text
                  layout={Layout.duration(400)}
                  entering={FadeIn.duration(300)}
                  exiting={FadeOutUp.duration(300)}
                  style={styles.animatedText}
                >
                  {words.slice(0, typedCount).join('')}
                </Animated.Text>
              )}
            </Animated.View>
          </Pressable>
        </Animated.View>
        
        <Animated.View layout={Layout.duration(400)}>
        <Pressable accessibilityRole="button" onPress={() => setImageOpen((s) => !s)}>
          <Animated.View layout={Layout.duration(500)} style={styles.expander}>
            <Text style={styles.expanderHeader}>Image Preview — {imageOpen ? 'collapse' : 'expand'}</Text>
            {imageOpen && (
              <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(500)} layout={Layout.springify()} style={styles.mediaCard}>
                <FastImage
                  source={{ uri: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop' }}
                  style={styles.media}
                  resizeMode={FastImage.resizeMode.cover}
                />
              </Animated.View>
            )}
          </Animated.View>
        </Pressable>
        </Animated.View>
        <Animated.View layout={Layout.duration(500).delay(imageOpen ? 100 : 0)}>
          <Pressable accessibilityRole="button" onPress={() => setVideoOpen((s) => !s)}>
            <Animated.View layout={Layout.springify()} style={styles.expander}>
              <Text style={styles.expanderHeader}>Video Preview — {videoOpen ? 'collapse' : 'expand'}</Text>
              {videoOpen && (
                <Animated.View entering={FadeIn.duration(200)} layout={Layout.springify()} style={styles.mediaCard}>
                  <Video
                    source={{ uri: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/av1/360/Big_Buck_Bunny_360_10s_1MB.mp4' }}
                    style={styles.media}

                    resizeMode={'cover'}
                    // muted={true}

                    repeat={true}
                  />
                </Animated.View>
              )}
            </Animated.View>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  header: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  desc: { fontSize: 13, color: '#6B7280', marginBottom: 12 },
  expander: { overflow: 'hidden', width: '100%', backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, marginVertical: 12 },
  expanderHeader: { fontSize: 14, fontWeight: '700' },
  expanderBody: { marginTop: 8, padding: 8, backgroundColor: '#F9FAFB', borderRadius: 8 },
  expanderText: { fontSize: 13, color: '#374151' },
  faqGroup: { marginTop: 12, gap: 8 },
  faqItem: { width: '100%', backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12 },
  mediaCard: { width: '100%', aspectRatio: 16 / 9, borderRadius: 12, overflow: 'hidden', backgroundColor: '#111827', marginTop: 12 },
  media: { width: '100%', height: '100%' },
  animatedText: { marginTop: 8, fontSize: 16, color: '#0ea5e9' },
})
