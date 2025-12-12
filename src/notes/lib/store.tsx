import { create } from 'zustand'
import type { MediaItem, Note } from '../types'
import { mmkv } from './mmkv'
import { pickNoteColor } from '../theme'

type ThemeMode = 'random' | 'fixed'

type NotesState = {
  notes: Note[]
  darkMode: boolean
  colorMode: ThemeMode
  fixedColor?: string
  isHydrated: boolean
  add: (payload: { title: string; content: string; tags?: string[]; color?: string; media?: MediaItem[]; pinned?: boolean }) => Note
  update: (id: string, patch: Partial<Omit<Note, 'id' | 'createdAt'>>) => void
  remove: (id: string) => void
  get: (id: string) => Note | undefined
  setTheme: (opts: { darkMode?: boolean; colorMode?: ThemeMode; fixedColor?: string }) => void
  hydrate: () => void
  clearAll: () => void
}

const STORAGE_KEY = 'notes_store_v2'

function normalizeMedia(media?: MediaItem[]) {
  if (!media) return undefined
  return media.map(m => ({
    ...m,
    id: m.id ?? `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  }))
}

function thumbFromMedia(media?: MediaItem[]) {
  const first = media?.find(m => m.type === 'image' || m.type === 'sketch')
  return first?.uri
}

function persist(state: Pick<NotesState, 'notes' | 'darkMode' | 'colorMode' | 'fixedColor'>) {
  try {
    mmkv.set(STORAGE_KEY, JSON.stringify(state))
  } catch {}
}

export const useNotesStore = create<NotesState>()((set, get) => ({
  notes: [],
  darkMode: false,
  colorMode: 'random',
  fixedColor: undefined,
  isHydrated: false,
  add: ({ title, content, tags, color, media, pinned }) => {
    const resolvedColor = color ?? pickNoteColor(get().colorMode, get().fixedColor)
    const normalizedMedia = normalizeMedia(media)
    const now = Date.now()
    const note: Note = {
      id: `${now}`,
      title: title.trim() || 'Untitled',
      content: content.trim(),
      tags: tags?.filter(Boolean),
      color: resolvedColor,
      createdAt: now,
      updatedAt: now,
      media: normalizedMedia,
      thumbnailUri: thumbFromMedia(normalizedMedia),
      pinned,
    }
    const next = [note, ...get().notes]
    set({ notes: next })
    persist({ notes: next, darkMode: get().darkMode, colorMode: get().colorMode, fixedColor: get().fixedColor })
    return note
  },
  update: (id, patch) => {
    const normalizedMedia = normalizeMedia(patch.media as MediaItem[] | undefined)
    const next = get().notes.map(n => {
      if (n.id !== id) return n
      const mediaToUse = normalizedMedia ?? n.media
      return {
        ...n,
        ...patch,
        media: mediaToUse,
        thumbnailUri: patch.thumbnailUri ?? thumbFromMedia(mediaToUse) ?? n.thumbnailUri,
        updatedAt: Date.now(),
      }
    })
    set({ notes: next })
    persist({ notes: next, darkMode: get().darkMode, colorMode: get().colorMode, fixedColor: get().fixedColor })
  },
  remove: (id) => {
    const next = get().notes.filter(n => n.id !== id)
    set({ notes: next })
    persist({ notes: next, darkMode: get().darkMode, colorMode: get().colorMode, fixedColor: get().fixedColor })
  },
  get: (id) => get().notes.find(n => n.id === id),
  setTheme: ({ darkMode, colorMode, fixedColor }) => {
    const nextDark = darkMode ?? get().darkMode
    const nextColorMode = colorMode ?? get().colorMode
    const nextFixed = fixedColor ?? get().fixedColor
    set({ darkMode: nextDark, colorMode: nextColorMode, fixedColor: nextFixed })
    persist({ notes: get().notes, darkMode: nextDark, colorMode: nextColorMode, fixedColor: nextFixed })
  },
  hydrate: () => {
    const raw = mmkv.getString(STORAGE_KEY)
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Partial<Pick<NotesState, 'notes' | 'darkMode' | 'colorMode' | 'fixedColor'>>
        const normalizedNotes = (parsed.notes ?? []).map(n => ({
          ...n,
          color: n.color ?? pickNoteColor(parsed.colorMode ?? 'random', parsed.fixedColor),
        }))
        set({
          notes: normalizedNotes,
          darkMode: parsed.darkMode ?? false,
          colorMode: parsed.colorMode ?? 'random',
          fixedColor: parsed.fixedColor,
          isHydrated: true,
        })
        return
      } catch {}
    }
    set({ isHydrated: true })
  },
  clearAll: () => {
    set({ notes: [] })
    persist({ notes: [], darkMode: get().darkMode, colorMode: get().colorMode, fixedColor: get().fixedColor })
  },
}))
