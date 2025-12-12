export type MediaType = 'image' | 'video' | 'audio' | 'sketch'

export type MediaItem = {
  id: string
  type: MediaType
  uri: string
  name?: string
  durationMs?: number
  thumbnailUri?: string
}

export type Note = {
  id: string
  title: string
  content: string
  tags?: string[]
  color: string
  createdAt: number
  updatedAt?: number
  media?: MediaItem[]
  thumbnailUri?: string
  pinned?: boolean
}
