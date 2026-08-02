import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { LearningMode } from '../data/lessons'
import { ALL_AVATARS, AVATAR_BY_ID, checkEarnedTimeAvatars, isAvatarUnlocked } from '../data/avatars'

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
  avatarId: string | null // which catalog avatar is equipped; emoji/color are its cached look
  learningMode: LearningMode
  visitedLessons: string[]
  completedLessons: string[]
  /** lessonId -> ms timestamp of completion. Powers the "3 lessons in one day" avatars. */
  lessonCompletions: Record<string, number>
  /** Local YYYY-MM-DD days this profile has opened the site. Powers the "come back" avatars. */
  activeDays: string[]
  quizAnswers: QuizRecord[]
  lastLessonId: string | null
  pollVote: string | null // POLL_OPTIONS id, or "custom:<free text>"
  createdAt: number
  earnedTimeAvatars: string[] // avatar ids earned by login time (e.g. 'night-owl'), permanent once earned
  invitedFriend: boolean // has shared the site at least once — unlocks Ambassador
}

// 🦉 and 🐦 live in the avatar catalog as the Night Owl / Early Bird rewards,
// not here — they have to be earned, not picked at creation.
export const AVATAR_EMOJI = ['🚀', '🌟', '🐺', '🌊', '🎈', '🦋', '⚡', '🌙', '🍀', '🧭', '🐝']
export const AVATAR_COLORS = ['#38bdf8', '#2dd4a7', '#fbbf24', '#a78bfa', '#f472b6', '#fb923c']

interface StoredState {
  profiles: Profile[]
  activeId: string | null
}

const STORAGE_KEY = 'kredoc.profiles.v1'

// A brand-new device — including a friend visiting the site for the first
// time — should land straight on the dashboard, not a "who's learning
// today?" picker. So the very first profile is created automatically,
// pre-selected, rather than waiting for someone to click through a gate.
function createDefaultGuestProfile(): Profile {
  return {
    id: `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    name: 'Guest',
    emoji: AVATAR_EMOJI[0],
    color: AVATAR_COLORS[0],
    avatarId: 'starter-rocket',
    learningMode: 'gut-check',
    visitedLessons: [],
    completedLessons: [],
    lessonCompletions: {},
    activeDays: [],
    quizAnswers: [],
    lastLessonId: null,
    pollVote: null,
    createdAt: Date.now(),
    earnedTimeAvatars: [],
    invitedFriend: false,
  }
}

/** Local calendar day — the unit the "come back" and "in one day" avatars count in. */
export function localDayStamp(now: Date = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

// Profiles saved before a field existed still have to work. Every new avatar
// signal is additive and defaults to "nothing earned yet" — nobody loses an
// avatar they already have, and nobody is retroactively handed one.
function migrateProfile(p: Profile): Profile {
  const emoji = p.emoji
  const color = p.color
  return {
    ...p,
    earnedTimeAvatars: p.earnedTimeAvatars ?? [],
    lessonCompletions: p.lessonCompletions ?? {},
    invitedFriend: p.invitedFriend ?? false,
    // A day per visit, but bounded: the "come back" avatars only need 7, and
    // an array nobody trims is a localStorage leak measured in years.
    activeDays: (p.activeDays ?? []).slice(-400),
    // Equipped avatar used to be inferred from emoji+color, which two avatars
    // can share. Record it once, then stop guessing.
    avatarId: p.avatarId ?? ALL_AVATARS.find((a) => a.emoji === emoji && a.color === color)?.id ?? null,
  }
}

function loadState(): StoredState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as StoredState
      if (Array.isArray(parsed.profiles)) {
        return { ...parsed, profiles: parsed.profiles.map(migrateProfile) }
      }
    }
  } catch {
    // unreadable — start fresh
  }
  const guest = createDefaultGuestProfile()
  return { profiles: [guest], activeId: guest.id }
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
  setAvatar: (avatarId: string) => void
  markInvitedFriend: () => void
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
      let changed = false
      const profiles = prev.profiles.map((p) => {
        if (p.id !== prev.activeId) return p
        const next = updater(p)
        if (next !== p) changed = true
        return next
      })
      // Several updaters deliberately return the profile untouched (an avatar
      // already worn, a friend already credited). Returning a fresh object
      // anyway would re-render the whole app and hand every consumer a new
      // context value — enough, for anything keyed on a context callback's
      // identity, to spin a render-fetch-render loop.
      return changed ? { ...prev, profiles } : prev
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
          avatarId: ALL_AVATARS.find((a) => a.emoji === input.emoji && a.color === input.color)?.id ?? null,
          learningMode: input.learningMode,
          visitedLessons: [],
          completedLessons: [],
          lessonCompletions: {},
          activeDays: [],
          quizAnswers: [],
          lastLessonId: null,
          pollVote: null,
          createdAt: Date.now(),
          earnedTimeAvatars: [],
          invitedFriend: false,
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
              ? {
                  ...p,
                  visitedLessons: [],
                  completedLessons: [],
                  // Must mirror completedLessons or the "lessons in one day"
                  // avatars would keep counting lessons that no longer exist.
                  lessonCompletions: {},
                  quizAnswers: [],
                  lastLessonId: null,
                  pollVote: null,
                }
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
        updateActive((p) => {
          const completions = { ...p.lessonCompletions }
          if (completed) completions[lessonId] = completions[lessonId] ?? Date.now()
          else delete completions[lessonId]
          return {
            ...p,
            completedLessons: completed
              ? p.completedLessons.includes(lessonId)
                ? p.completedLessons
                : [...p.completedLessons, lessonId]
              : p.completedLessons.filter((id) => id !== lessonId),
            lessonCompletions: completions,
          }
        }),
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
      setAvatar: (avatarId) =>
        updateActive((p) => {
          const def = AVATAR_BY_ID[avatarId]
          if (!def || !isAvatarUnlocked(def, p)) return p
          return { ...p, emoji: def.emoji, color: def.color, avatarId: def.id }
        }),
      // Ambassador rewards the act of sharing, so the click is the proof —
      // see data/invite.ts for why verifying the arrival isn't worth its cost.
      markInvitedFriend: () => updateActive((p) => (p.invitedFriend ? p : { ...p, invitedFriend: true })),
    }),
    [state.profiles, activeProfile, updateActive],
  )

  // Whoever is active earns any time-gated avatars the current clock
  // qualifies for (Night Owl, Early Bird, Weekend Warrior, Opening Bell) and
  // gets today stamped on their attendance record. Runs once per profile
  // switch — earning is a permanent stamp, not a live status, so no polling.
  useEffect(() => {
    if (!state.activeId) return
    const newlyEarned = checkEarnedTimeAvatars()
    const today = localDayStamp()
    setState((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) => {
        if (p.id !== prev.activeId) return p
        const toAdd = newlyEarned.filter((id) => !p.earnedTimeAvatars.includes(id))
        const needsDay = !p.activeDays.includes(today)
        if (toAdd.length === 0 && !needsDay) return p
        return {
          ...p,
          earnedTimeAvatars: toAdd.length ? [...p.earnedTimeAvatars, ...toAdd] : p.earnedTimeAvatars,
          activeDays: needsDay ? [...p.activeDays, today].slice(-400) : p.activeDays,
        }
      }),
    }))
  }, [state.activeId])

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
