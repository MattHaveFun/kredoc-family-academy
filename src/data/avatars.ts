// The avatar catalog. Every avatar is either available from the start, or tied
// to an unlock condition: finishing a specific lesson, finishing a whole
// chapter, hitting a lesson COUNT milestone, building a habit (lessons in one
// day, days shown up, questions answered right), showing up at a particular
// time, sharing the site, or — the last one — earning everything else.
//
// Two rules this file exists to keep honest:
//   1. A locked avatar always says how to earn it (avatarUnlockHint).
//   2. Where an action can be pointed at, it links straight there
//      (avatarUnlockLink) — nobody should have to hunt for the lesson.
import { CHAPTERS, LESSONS, lessonsInChapter } from './lessons'

export type TimeWindow = 'night-owl' | 'early-bird' | 'weekend' | 'market-open'

export type AvatarUnlock =
  | { type: 'starter' }
  | { type: 'lesson'; lessonId: string }
  | { type: 'lessonCount'; count: number }
  | { type: 'chapter'; chapter: number }
  | { type: 'lessonsInDay'; count: number }
  | { type: 'activeDays'; count: number }
  | { type: 'quizCorrect'; count: number }
  | { type: 'time'; window: TimeWindow }
  | { type: 'invite' }
  | { type: 'everything' }

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
  /** lessonId -> ms timestamp of first completion. Powers "3 lessons in one day". */
  lessonCompletions?: Record<string, number>
  /** Local YYYY-MM-DD days this profile has opened the site. */
  activeDays?: string[]
  quizAnswers?: { correct: boolean }[]
  invitedFriend?: boolean
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

/** The avatar a given lesson pays out. Used by the lesson page's reward card. */
export const AVATAR_FOR_LESSON: Record<string, AvatarDef> = Object.fromEntries(
  LESSON_AVATARS.map((a) => [(a.unlock as { lessonId: string }).lessonId, a]),
)

const HALFWAY = Math.ceil(LESSONS.length / 2)

// Lesson-count milestones — a growth metaphor that runs the length of the
// whole curriculum, so there is always a next one in sight.
export const MILESTONE_AVATARS: AvatarDef[] = [
  { id: 'milestone-3', emoji: '🌱', color: '#4ade80', label: 'Sprout', unlock: { type: 'lessonCount', count: 3 } },
  { id: 'milestone-5', emoji: '🌿', color: '#22c55e', label: 'Budding Investor', unlock: { type: 'lessonCount', count: 5 } },
  { id: 'milestone-10', emoji: '🌳', color: '#15803d', label: 'Rooted', unlock: { type: 'lessonCount', count: 10 } },
  { id: 'milestone-half', emoji: '🌲', color: '#94a3b8', label: 'Evergreen', unlock: { type: 'lessonCount', count: HALFWAY } },
  { id: 'milestone-25', emoji: '🌻', color: '#7dd3fc', label: 'In Full Bloom', unlock: { type: 'lessonCount', count: 25 } },
  { id: 'milestone-all', emoji: '🎓', color: '#fbbf24', label: 'Graduate', unlock: { type: 'lessonCount', count: LESSONS.length } },
]

// One per chapter — the reward for not leaving a chapter half-finished.
const CHAPTER_AVATAR_META: Record<number, { emoji: string; color: string; label: string }> = {
  1: { emoji: '📖', color: '#38bdf8', label: 'Market Reader' },
  2: { emoji: '⚓', color: '#2dd4a7', label: 'Deep Diver' },
  3: { emoji: '📋', color: '#a78bfa', label: 'The Checklist' },
  4: { emoji: '🏆', color: '#fbbf24', label: 'Giant Slayer' },
}

export const CHAPTER_AVATARS: AvatarDef[] = CHAPTERS.map((chapter) => {
  const meta = CHAPTER_AVATAR_META[chapter.number] ?? {
    emoji: '📘',
    color: '#60a5fa',
    label: `Chapter ${chapter.number}`,
  }
  return {
    id: `chapter-${chapter.number}`,
    emoji: meta.emoji,
    color: meta.color,
    label: meta.label,
    unlock: { type: 'chapter', chapter: chapter.number },
  }
})

// Earned by how you learn rather than how much — pace, persistence, and
// getting the questions right.
//
// Emoji choice is deliberately conservative here and throughout the catalog:
// old, widely-shipped characters only. A badge that renders as an empty box on
// someone's phone isn't a reward. That rules out the newer person-shaped emoji
// in particular, which also carry skin-tone and gender variants that render
// inconsistently across platforms.
export const HABIT_AVATARS: AvatarDef[] = [
  { id: 'habit-studious', emoji: '📚', color: '#f59e0b', label: 'Studious', unlock: { type: 'lessonsInDay', count: 3 } },
  { id: 'habit-marathon', emoji: '🏁', color: '#fb7185', label: 'Marathon', unlock: { type: 'lessonsInDay', count: 5 } },
  { id: 'habit-regular', emoji: '📅', color: '#60a5fa', label: 'Regular', unlock: { type: 'activeDays', count: 3 } },
  { id: 'habit-clockwork', emoji: '⏰', color: '#c084fc', label: 'Clockwork', unlock: { type: 'activeDays', count: 7 } },
  { id: 'habit-sharp', emoji: '🧠', color: '#34d399', label: 'Sharp Mind', unlock: { type: 'quizCorrect', count: 10 } },
  { id: 'habit-shark', emoji: '🦈', color: '#22d3ee', label: 'Quiz Shark', unlock: { type: 'quizCorrect', count: 25 } },
]

// Earned by *when* you show up, what you share, or finishing the whole set.
export const SPECIAL_AVATARS: AvatarDef[] = [
  { id: 'night-owl', emoji: '🦉', color: '#818cf8', label: 'Night Owl', unlock: { type: 'time', window: 'night-owl' } },
  { id: 'early-bird', emoji: '🐦', color: '#fb923c', label: 'Early Bird', unlock: { type: 'time', window: 'early-bird' } },
  { id: 'weekend-warrior', emoji: '🏖️', color: '#facc15', label: 'Weekend Warrior', unlock: { type: 'time', window: 'weekend' } },
  { id: 'opening-bell', emoji: '🔔', color: '#2dd4a7', label: 'Opening Bell', unlock: { type: 'time', window: 'market-open' } },
  { id: 'ambassador', emoji: '🤝', color: '#f472b6', label: 'Ambassador', unlock: { type: 'invite' } },
  { id: 'avatar-master', emoji: '👑', color: '#fbbf24', label: 'Avatar Master', unlock: { type: 'everything' } },
]

/** Kept as an alias so nothing that imported the old name breaks. */
export const TIME_AVATARS = SPECIAL_AVATARS.filter((a) => a.unlock.type === 'time')

export const ALL_AVATARS: AvatarDef[] = [
  ...STARTER_AVATARS,
  ...MILESTONE_AVATARS,
  ...CHAPTER_AVATARS,
  ...HABIT_AVATARS,
  ...SPECIAL_AVATARS,
  ...LESSON_AVATARS,
]

export const AVATAR_BY_ID: Record<string, AvatarDef> = Object.fromEntries(ALL_AVATARS.map((a) => [a.id, a]))

// The picker's sections, in the order they're shown. Each carries a one-line
// explanation so the page reads as a reward program, not a settings screen.
export const AVATAR_GROUPS: { title: string; blurb: string; avatars: AvatarDef[] }[] = [
  { title: 'Starter', blurb: 'Yours from day one.', avatars: STARTER_AVATARS },
  { title: 'Milestones', blurb: 'For how far you have come.', avatars: MILESTONE_AVATARS },
  { title: 'Chapters', blurb: 'For finishing what you start.', avatars: CHAPTER_AVATARS },
  { title: 'Habits', blurb: 'For how you learn, not just how much.', avatars: HABIT_AVATARS },
  { title: 'Special', blurb: 'Odd hours, generous invitations, and one crown.', avatars: SPECIAL_AVATARS },
  { title: 'Lesson rewards', blurb: 'One for every lesson in the Academy.', avatars: LESSON_AVATARS },
]

// --- Unlock evaluation --------------------------------------------------------

/** Local calendar day for a timestamp — the unit "3 lessons in one day" counts in. */
function localDay(ms: number): string {
  const d = new Date(ms)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** The most lessons this profile has ever completed within one calendar day. */
function bestLessonsInADay(profile: UnlockableProfile): number {
  const completions = profile.lessonCompletions ?? {}
  const perDay = new Map<string, number>()
  for (const ts of Object.values(completions)) {
    const day = localDay(ts)
    perDay.set(day, (perDay.get(day) ?? 0) + 1)
  }
  return perDay.size === 0 ? 0 : Math.max(...perDay.values())
}

function correctAnswers(profile: UnlockableProfile): number {
  return (profile.quizAnswers ?? []).filter((q) => q.correct).length
}

function chapterProgress(profile: UnlockableProfile, chapter: number): { done: number; total: number } {
  const lessons = lessonsInChapter(chapter)
  return {
    done: lessons.filter((l) => profile.completedLessons.includes(l.id)).length,
    total: lessons.length,
  }
}

export function isAvatarUnlocked(avatar: AvatarDef, profile: UnlockableProfile): boolean {
  switch (avatar.unlock.type) {
    case 'starter':
      return true
    case 'lesson':
      return profile.completedLessons.includes(avatar.unlock.lessonId)
    case 'lessonCount':
      return profile.completedLessons.length >= avatar.unlock.count
    case 'chapter': {
      const { done, total } = chapterProgress(profile, avatar.unlock.chapter)
      return total > 0 && done >= total
    }
    case 'lessonsInDay':
      return bestLessonsInADay(profile) >= avatar.unlock.count
    case 'activeDays':
      return (profile.activeDays ?? []).length >= avatar.unlock.count
    case 'quizCorrect':
      return correctAnswers(profile) >= avatar.unlock.count
    case 'time':
      return profile.earnedTimeAvatars.includes(avatar.id)
    case 'invite':
      return Boolean(profile.invitedFriend)
    case 'everything':
      // The crown. Deliberately last: everything else has to be in hand,
      // including the odd-hours ones nobody stumbles into by accident.
      return ALL_AVATARS.every((a) => a.unlock.type === 'everything' || isAvatarUnlocked(a, profile))
  }
}

/** True when this avatar is the one currently worn. */
export function isEquipped(
  avatar: AvatarDef,
  profile: { avatarId?: string | null; emoji: string; color: string },
): boolean {
  // avatarId is authoritative; the emoji+color fallback only covers profiles
  // saved before it existed, since two avatars can share a colour.
  if (profile.avatarId) return profile.avatarId === avatar.id
  return profile.emoji === avatar.emoji && profile.color === avatar.color
}

/** How close this profile is to a locked avatar, when that's a countable thing. */
export function avatarProgress(
  avatar: AvatarDef,
  profile: UnlockableProfile,
): { current: number; target: number } | null {
  switch (avatar.unlock.type) {
    case 'lessonCount':
      return { current: profile.completedLessons.length, target: avatar.unlock.count }
    case 'chapter': {
      const { done, total } = chapterProgress(profile, avatar.unlock.chapter)
      return { current: done, target: total }
    }
    case 'lessonsInDay':
      return { current: bestLessonsInADay(profile), target: avatar.unlock.count }
    case 'activeDays':
      return { current: (profile.activeDays ?? []).length, target: avatar.unlock.count }
    case 'quizCorrect':
      return { current: correctAnswers(profile), target: avatar.unlock.count }
    case 'everything': {
      const others = ALL_AVATARS.filter((a) => a.unlock.type !== 'everything')
      return { current: others.filter((a) => isAvatarUnlocked(a, profile)).length, target: others.length }
    }
    default:
      return null
  }
}

export function avatarUnlockHint(avatar: AvatarDef): string {
  switch (avatar.unlock.type) {
    case 'starter':
      return 'Available from the start'
    case 'lesson': {
      const unlock = avatar.unlock
      const lesson = LESSONS.find((l) => l.id === unlock.lessonId)
      return `Complete “${lesson?.title ?? unlock.lessonId}”`
    }
    case 'lessonCount':
      return avatar.unlock.count >= LESSONS.length
        ? 'Complete every lesson'
        : `Complete ${avatar.unlock.count} lessons`
    case 'chapter': {
      const unlock = avatar.unlock
      const chapter = CHAPTERS.find((c) => c.number === unlock.chapter)
      return `Finish Chapter ${unlock.chapter}: ${chapter?.title ?? ''}`.trim()
    }
    case 'lessonsInDay':
      return `Complete ${avatar.unlock.count} lessons in one day`
    case 'activeDays':
      return `Visit on ${avatar.unlock.count} different days`
    case 'quizCorrect':
      return `Answer ${avatar.unlock.count} questions correctly`
    case 'time':
      switch (avatar.unlock.window) {
        case 'night-owl':
          return 'Visit after 10:00 PM'
        case 'early-bird':
          return 'Visit before 7:00 AM'
        case 'weekend':
          return 'Visit on a Saturday or Sunday'
        case 'market-open':
          return 'Visit while U.S. markets are open'
      }
      break
    case 'invite':
      return 'Share Kredoc with a friend'
    case 'everything':
      return 'Earn every other avatar'
  }
  return ''
}

/**
 * Where to send someone who wants this avatar. A locked tile that names a
 * lesson but makes you go find it is a dead end — so lesson, chapter, count
 * and quiz avatars all point at the next lesson that actually moves them.
 */
export function avatarUnlockLink(avatar: AvatarDef, profile: UnlockableProfile): string | null {
  const nextUnfinished = (pool = LESSONS) =>
    pool.find((l) => !profile.completedLessons.includes(l.id)) ?? pool[0]

  switch (avatar.unlock.type) {
    case 'lesson':
      return `/academy/lesson/${avatar.unlock.lessonId}`
    case 'chapter': {
      const lessons = lessonsInChapter(avatar.unlock.chapter)
      return lessons.length ? `/academy/lesson/${nextUnfinished(lessons).id}` : '/academy'
    }
    case 'lessonCount':
    case 'lessonsInDay':
    case 'quizCorrect':
      return `/academy/lesson/${nextUnfinished().id}`
    case 'everything':
      return '/academy'
    default:
      // Time windows and the invite have nothing to navigate to — the first
      // is a clock, the second has its own button.
      return null
  }
}

// --- Time-window earning ------------------------------------------------------

/** Wall-clock in New York, for the market-hours window. */
function easternNow(now: Date): { weekday: string; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour12: false,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).formatToParts(now)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  // Some engines render midnight as "24" under hour12:false.
  const hour = Number(get('hour')) % 24
  return { weekday: get('weekday'), minutes: hour * 60 + Number(get('minute')) }
}

// Called on session start to see which time-gated avatars the current clock
// qualifies for. Earning is permanent — checked once, stored on the profile,
// never revoked when the clock moves on.
export function checkEarnedTimeAvatars(now: Date = new Date()): string[] {
  const hour = now.getHours()
  const earned: string[] = []
  if (hour >= 22) earned.push('night-owl')
  if (hour < 7) earned.push('early-bird')
  const localWeekday = now.getDay()
  if (localWeekday === 0 || localWeekday === 6) earned.push('weekend-warrior')

  const et = easternNow(now)
  const isTradingWeekday = !['Sat', 'Sun'].includes(et.weekday)
  // 9:30am–4:00pm ET. Market holidays aren't checked — this is a bit of fun,
  // not a data label, and the site never claims it's live during one.
  if (isTradingWeekday && et.minutes >= 9 * 60 + 30 && et.minutes <= 16 * 60) earned.push('opening-bell')

  return earned
}
