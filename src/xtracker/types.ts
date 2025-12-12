export type DayStatus = "done" | "failed" | "skip" | "empty"

export interface Challenge {
  id: string
  name: string
  duration: number
  startDate: string
  createdAt: string
  isShared: boolean
  sharedWith: string[]
  dailyNotes?: string
  days: DayRecord[]
  category?: string
}

export interface DayRecord {
  date: string
  status: DayStatus
}

export interface Friend {
  id: string
  username: string
  name: string
  avatar: string
  mutualChallenges: string[]
}

export interface User {
  id: string
  username: string
  name: string
  darkMode: boolean
  friends: string[]
}

