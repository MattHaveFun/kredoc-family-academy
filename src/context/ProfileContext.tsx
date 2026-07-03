import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { LearningMode } from '../data/lessons'

// Family profiles — the site's whole "account system," persisted entirely in
// localStorage. No login, no server: whoever is at the keyboard picks their
// avatar and the site remembers their progress, learning mode, and votes.

export const MAX_PROFILES = 6

export interface QuizRecord {
  lessonId: string
  mode: LearningMode
  choiceIndex: number
  correct: boolean
  answeredAt: number
}

export interface Profile {
  id: string
  name: string
  emoji: string
  color: string // accent hex used for the avatar ring
  learningMode: LearningMode
  visitedLessons: string[]
  completedLessons: string[]
  quizAnswers: QuizRecord[]
  lastLessonId: string | null
  pollVote: string | null // POLL_OPTIONS id, or "custom:<free text>"
  createdAt: number
}

export const AVATAR_EMOJI = ['🚀', '🦉', '🌟', '🐺', '🌊', '🔥', '🦋', '⚡', '🌙', '🍀', '🎯', '🐝']
export const AVATAR_COLORS = ['#38bdf8', '#2dd4a7', '#fbbf24', '#a78bfa', '#f472b6', '#fb923c']

interface StoredState {
  profiles: Profile[]
  activeId: string | null
}

const STORAGE_KEY = 'kredoc.profiles.v1'

function loadState(): StoredState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as StoredState
      if (Array.isArray(parsed.profiles)) return parsed
    }
  } catch {
    // unreadable — start fresh
  }
  return { profiles: [], activeId: null }
}

interface ProfileContextValue {
  profiles: Profile[]
  activeProfile: Profile | null
  createProfile: (input: { name: string; emoji: string; color: string; learningMode: LearningMode }) => Profile | null
  selectProfile: (id: string) => void
  signOut: () => void // back to the "who's learning today?" gate
  deleteProfile: (id: string) => void
  resetProgress: (id: string) => void
  setLearningMode: (mode: LearningMode) => void
  markVisited: (lessonId: string) => void
  markCompleted: (lessonId: string, completed: boolean) => void
  recordQuizAnswer: (record: QuizRecord) => void
  setPollVote: (vote: string) => void
}

const ProfileContext = createContext<ProfileContextValue | null>(null)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoredState>(loadState)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // storage unavailable — profiles become session-only, still functional
    }
  }, [state])

  const activeProfile = useMemo(
    () => state.profiles.find((p) => p.id === state.activeId) ?? null,
    [state],
  )

  const updateActive = useCallback((updater: (profile: Profile) => Profile) => {
    setState((prev) => {
      if (!prev.activeId) return prev
      return {
        ...prev,
        profiles: prev.profiles.map((p) => (p.id === prev.activeId ? updater(p) : p)),
      }
    })
  }, [])

  const value = useMemo<ProfileContextValue>(
    () => ({
      profiles: state.profiles,
      activeProfile,
      createProfile: (input) => {
        if (state.profiles.length >= MAX_PROFILES) return null
        const profile: Profile = {
          id: `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
          name: input.name.trim().slice(0, 24) || 'Guest',
          emoji: input.emoji,
          color: input.color,
          learningMode: input.learningMode,
          visitedLessons: [],
          completedLessons: [],
          quizAnswers: [],
          lastLessonId: null,
          pollVote: null,
          createdAt: Date.now(),
        }
        setState((prev) => ({ profiles: [...prev.profiles, profile], activeId: profile.id }))
        return profile
      },
      selectProfile: (id) => setState((prev) => ({ ...prev, activeId: id })),
      signOut: () => setState((prev) => ({ ...prev, activeId: null })),
      deleteProfile: (id) =>
        setState((prev) => ({
          profiles: prev.profiles.filter((p) => p.id !== id),
          activeId: prev.activeId === id ? null : prev.activeId,
        })),
      resetProgress: (id) =>
        setState((prev) => ({
          ...prev,
          profiles: prev.profiles.map((p) =>
            p.id === id
              ? { ...p, visitedLessons: [], completedLessons: [], quizAnswers: [], lastLessonId: null, pollVote: null }
              : p,
          ),
        })),
      setLearningMode: (mode) => updateActive((p) => ({ ...p, learningMode: mode })),
      markVisited: (lessonId) =>
        updateActive((p) =>
          p.visitedLessons.includes(lessonId)
            ? { ...p, lastLessonId: lessonId }
            : { ...p, visitedLessons: [...p.visitedLessons, lessonId], lastLessonId: lessonId },
        ),
      markCompleted: (lessonId, completed) =>
        updateActive((p) => ({
          ...p,
          completedLessons: completed
            ? p.completedLessons.includes(lessonId)
              ? p.completedLessons
              : [...p.completedLessons, lessonId]
            : p.completedLessons.filter((id) => id !== lessonId),
        })),
      recordQuizAnswer: (record) =>
        updateActive((p) => ({
          ...p,
          // keep the latest answer per lesson+mode; it's a learning tool, not a grade book
          quizAnswers: [
            ...p.quizAnswers.filter((q) => !(q.lessonId === record.lessonId && q.mode === record.mode)),
            record,
          ],
        })),
      setPollVote: (vote) => updateActive((p) => ({ ...p, pollVote: vote })),
    }),
    [state.profiles, activeProfile, updateActive],
  )

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}

export function useProfiles(): ProfileContextValue {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfiles must be used within ProfileProvider')
  return ctx
}

export const LEARNING_MODE_META: Record<LearningMode, { label: string; description: string; icon: string }> = {
  'gut-check': {
    label: 'Gut Check',
    description: 'One quick multiple-choice question per lesson. No score, no pressure.',
    icon: '🎯',
  },
  'real-scenario': {
    label: 'Real Scenario',
    description: 'A realistic market situation — pick the smartest interpretation.',
    icon: '🎬',
  },
  'myth-vs-reality': {
    label: 'Myth vs. Reality',
    description: 'A confident claim. You call true or false. Then the reveal.',
    icon: '⚖️',
  },
}
