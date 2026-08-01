// The avatar catalog. Every avatar is either available from the start, or
// tied to an unlock condition: finishing a specific lesson, hitting a lesson
// COUNT milestone, or logging in during a specific time window. Profile.tsx
// renders this catalog as a picker; locked tiles show avatarUnlockHint() so
// nobody has to guess how to earn one.
import { LESSONS } from './lessons'

export type AvatarUnlock =
  | { type: 'starter' }
  | { type: 'lesson'; lessonId: string }
  | { type: 'lessonCount'; count: number }
  | { type: 'time'; window: 'night-owl' | 'early-bird' }

export interface AvatarDef {
  id: string
  emoji: string
  color: string
  label: string
  unlock: AvatarUnlock
}

// Shape-only — avoids importing the Profile type from ProfileContext, which
// imports this file (would otherwise create a circular import).
interface UnlockableProfile {
  completedLessons: string[]
  earnedTimeAvatars: string[]
}

const PALETTE = [
  '#38bdf8', '#2dd4a7', '#fbbf24', '#a78bfa', '#f472b6', '#fb923c',
  '#f87171', '#34d399', '#60a5fa', '#e879f9', '#facc15', '#4ade80',
  '#fb7185', '#22d3ee', '#c084fc', '#fdba74',
]

// Always available — no unlock required. This is what a brand-new profile
// picks from at creation time.
export const STARTER_AVATARS: AvatarDef[] = [
  { id: 'starter-rocket', emoji: '🚀', color: '#38bdf8', label: 'Rocket', unlock: { type: 'starter' } },
  { id: 'starter-star', emoji: '🌟', color: '#2dd4a7', label: 'Star', unlock: { type: 'starter' } },
  { id: 'starter-wolf', emoji: '🐺', color: '#fbbf24', label: 'Wolf', unlock: { type: 'starter' } },
  { id: 'starter-wave', emoji: '🌊', color: '#a78bfa', label: 'Wave', unlock: { type: 'starter' } },
  { id: 'starter-balloon', emoji: '🎈', color: '#f472b6', label: 'Balloon', unlock: { type: 'starter' } },
  { id: 'starter-butterfly', emoji: '🦋', color: '#fb923c', label: 'Butterfly', unlock: { type: 'starter' } },
  { id: 'starter-bolt', emoji: '⚡', color: '#38bdf8', label: 'Bolt', unlock: { type: 'starter' } },
  { id: 'starter-moon', emoji: '🌙', color: '#2dd4a7', label: 'Moon', unlock: { type: 'starter' } },
  { id: 'starter-clover', emoji: '🍀', color: '#fbbf24', label: 'Clover', unlock: { type: 'starter' } },
  { id: 'starter-compass', emoji: '🧭', color: '#a78bfa', label: 'Compass', unlock: { type: 'starter' } },
  { id: 'starter-bee', emoji: '🐝', color: '#f472b6', label: 'Bee', unlock: { type: 'starter' } },
]

// One themed avatar per lesson — the reward for finishing it.
const LESSON_AVATAR_META: Record<string, { emoji: string; label: string }> = {
  sp500: { emoji: '🏛️', label: 'Index Scholar' },
  nasdaq: { emoji: '💻', label: 'Tech Trader' },
  dow: { emoji: '🎩', label: 'Old Guard' },
  russell2000: { emoji: '🏪', label: 'Main Street' },
  vix: { emoji: '😰', label: 'Fear Reader' },
  bitcoin: { emoji: '🪙', label: 'Bitcoin Believer' },
  candlesticks: { emoji: '🕯️', label: 'Candlestick Reader' },
  volume: { emoji: '📊', label: 'Volume Watcher' },
  'indices-vs-stocks': { emoji: '⚖️', label: 'Balanced Investor' },
  gold: { emoji: '🥇', label: 'Gold Bug' },
  oil: { emoji: '🛢️', label: 'Oil Baron' },
  tnx: { emoji: '📈', label: 'Yield Watcher' },
  silver: { emoji: '🥈', label: 'Silver Surfer' },
  natgas: { emoji: '🔥', label: 'Gas Guru' },
  copper: { emoji: '🟠', label: 'Dr. Copper' },
  dxy: { emoji: '💵', label: 'Dollar Detective' },
  ust2y: { emoji: '🏦', label: 'Rate Watcher' },
  yieldcurve: { emoji: '📉', label: 'Curve Reader' },
  ethereum: { emoji: '💎', label: 'Ether Enthusiast' },
  'world-markets': { emoji: '🌍', label: 'Globetrotter' },
  'stock-vs-index': { emoji: '🎯', label: 'Stock Picker' },
  'what-you-own': { emoji: '📜', label: 'Shareholder' },
  fundamentals: { emoji: '🔢', label: 'Numbers Nerd' },
  valuation: { emoji: '🏷️', label: 'Price Tag Pro' },
  moat: { emoji: '🏰', label: 'Moat Master' },
  'red-flags': { emoji: '🚩', label: 'Red Flag Spotter' },
  'order-types': { emoji: '📝', label: 'Order Architect' },
  'dollars-and-recurring': { emoji: '🔁', label: 'Auto-Investor' },
  'when-to-sell': { emoji: '✂️', label: 'Exit Strategist' },
  research: { emoji: '🔍', label: 'Company Detective' },
  'case-nvda': { emoji: '🎮', label: 'Chip Champion' },
  'case-aapl': { emoji: '🍎', label: 'Apple Analyst' },
  'case-msft': { emoji: '🪟', label: 'Cloud Captain' },
  'case-amzn': { emoji: '📦', label: 'Package Pro' },
  'case-googl': { emoji: '🔎', label: 'Search Sage' },
  'case-avgo': { emoji: '📡', label: 'Signal Chaser' },
}

export const LESSON_AVATARS: AvatarDef[] = LESSONS.map((lesson, i) => {
  const meta = LESSON_AVATAR_META[lesson.id] ?? { emoji: '🎓', label: lesson.title }
  return {
    id: `lesson-${lesson.id}`,
    emoji: meta.emoji,
    color: PALETTE[i % PALETTE.length],
    label: meta.label,
    unlock: { type: 'lesson', lessonId: lesson.id },
  }
})

// Lesson-count milestones — a growth metaphor: sprout, budding, rooted.
export const MILESTONE_AVATARS: AvatarDef[] = [
  { id: 'milestone-3', emoji: '🌱', color: '#4ade80', label: 'Sprout', unlock: { type: 'lessonCount', count: 3 } },
  { id: 'milestone-5', emoji: '🌿', color: '#22c55e', label: 'Budding Investor', unlock: { type: 'lessonCount', count: 5 } },
  { id: 'milestone-10', emoji: '🌳', color: '#15803d', label: 'Rooted', unlock: { type: 'lessonCount', count: 10 } },
]

// Earned by *when* you show up, not what you complete.
export const TIME_AVATARS: AvatarDef[] = [
  { id: 'night-owl', emoji: '🦉', color: '#818cf8', label: 'Night Owl', unlock: { type: 'time', window: 'night-owl' } },
  { id: 'early-bird', emoji: '🐦', color: '#fb923c', label: 'Early Bird', unlock: { type: 'time', window: 'early-bird' } },
]

export const ALL_AVATARS: AvatarDef[] = [
  ...STARTER_AVATARS,
  ...MILESTONE_AVATARS,
  ...TIME_AVATARS,
  ...LESSON_AVATARS,
]

export const AVATAR_BY_ID: Record<string, AvatarDef> = Object.fromEntries(ALL_AVATARS.map((a) => [a.id, a]))

export function isAvatarUnlocked(avatar: AvatarDef, profile: UnlockableProfile): boolean {
  switch (avatar.unlock.type) {
    case 'starter':
      return true
    case 'lesson':
      return profile.completedLessons.includes(avatar.unlock.lessonId)
    case 'lessonCount':
      return profile.completedLessons.length >= avatar.unlock.count
    case 'time':
      return profile.earnedTimeAvatars.includes(avatar.id)
  }
}

export function avatarUnlockHint(avatar: AvatarDef): string {
  switch (avatar.unlock.type) {
    case 'starter':
      return 'Available from the start'
    case 'lesson': {
      const unlock = avatar.unlock
      const lesson = LESSONS.find((l) => l.id === unlock.lessonId)
      return `Complete "${lesson?.title ?? unlock.lessonId}" to unlock`
    }
    case 'lessonCount':
      return `Complete ${avatar.unlock.count} lessons to unlock`
    case 'time':
      return avatar.unlock.window === 'night-owl'
        ? 'Log in after 10:00 PM to unlock'
        : 'Log in before 7:00 AM to unlock'
  }
}

// Called on session start to see which time-gated avatars the current clock
// qualifies for. Earning is permanent — checked once, stored on the profile,
// never revoked when the clock moves on.
export function checkEarnedTimeAvatars(now: Date = new Date()): string[] {
  const hour = now.getHours()
  const earned: string[] = []
  if (hour >= 22) earned.push('night-owl')
  if (hour < 7) earned.push('early-bird')
  return earned
}
