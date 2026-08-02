import { Link } from 'react-router-dom'
import { useProfiles, type Profile } from '../context/ProfileContext'
import type { Lesson } from '../data/lessons'
import { ALL_AVATARS, AVATAR_FOR_LESSON, isAvatarUnlocked, isEquipped } from '../data/avatars'

// What finishing THIS lesson would also unlock — milestones, chapter badges,
// the crown. Computed by asking the catalog what changes, rather than by
// hard-coding a list that would drift the moment an avatar is added.
function alsoUnlockedBy(lesson: Lesson, profile: Profile) {
  const after: Profile = {
    ...profile,
    completedLessons: profile.completedLessons.includes(lesson.id)
      ? profile.completedLessons
      : [...profile.completedLessons, lesson.id],
    lessonCompletions: { ...profile.lessonCompletions, [lesson.id]: Date.now() },
  }
  return ALL_AVATARS.filter(
    (a) => a.unlock.type !== 'lesson' && !isAvatarUnlocked(a, profile) && isAvatarUnlocked(a, after),
  )
}

/**
 * The lesson's reward, shown right where the decision to finish gets made.
 *
 * Deliberately quiet while the lesson is unread: a locked disc and one line.
 * It only gets loud at the moment it's earned, so it reads as a payoff rather
 * than a nag competing with the lesson for attention.
 */
function LessonAvatarReward({
  lesson,
  answered,
  onJumpToQuestion,
}: {
  lesson: Lesson
  answered: boolean
  onJumpToQuestion: () => void
}) {
  const { activeProfile, setAvatar } = useProfiles()
  const avatar = AVATAR_FOR_LESSON[lesson.id]
  if (!activeProfile || !avatar) return null

  const earned = isAvatarUnlocked(avatar, activeProfile)
  const equipped = isEquipped(avatar, activeProfile)
  const pending = earned ? [] : alsoUnlockedBy(lesson, activeProfile)

  return (
    <div
      className={`flex flex-wrap items-center gap-4 rounded-2xl border p-5 transition-colors duration-300 ${
        earned ? 'border-up/25 bg-up/[0.05]' : 'border-slate-400/10 bg-ink-950/40'
      }`}
    >
      <span
        className="grid h-14 w-14 shrink-0 place-items-center rounded-full text-2xl"
        style={{
          backgroundColor: earned ? `${avatar.color}1a` : 'rgba(148,163,184,0.07)',
          boxShadow: earned
            ? `inset 0 0 0 2px ${avatar.color}66, 0 0 24px -10px ${avatar.color}`
            : 'inset 0 0 0 2px rgba(148,163,184,0.15)',
        }}
        aria-hidden
      >
        {earned ? avatar.emoji : '🔒'}
      </span>

      <div className="min-w-0 flex-1">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-500">
          {earned ? 'Avatar earned' : 'Locked avatar'}
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-100">{avatar.label}</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          {earned ? (
            equipped ? (
              "You're wearing it."
            ) : (
              'Yours to wear whenever you like.'
            )
          ) : answered ? (
            <>Question answered — mark this lesson complete below to claim it.</>
          ) : (
            <>Answer the check question, then mark the lesson complete.</>
          )}
        </p>
        {!earned && pending.length > 0 && (
          <p className="mt-1.5 text-xs text-sky-300/80">
            Finishing this one also unlocks {pending.map((a) => `${a.emoji} ${a.label}`).join(' and ')}.
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {earned && !equipped && (
          <button
            type="button"
            onClick={() => setAvatar(avatar.id)}
            className="rounded-lg bg-up/15 px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-up ring-1 ring-inset ring-up/40 transition-colors hover:bg-up/25"
          >
            Wear it
          </button>
        )}
        {!earned && !answered && (
          <button
            type="button"
            onClick={onJumpToQuestion}
            className="rounded-lg border border-sky-400/30 px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-sky-300 transition-colors hover:bg-sky-400/10"
          >
            Go to question ↑
          </button>
        )}
        <Link
          to="/profile"
          className="font-mono text-[10px] uppercase tracking-wider text-slate-600 transition-colors hover:text-sky-300"
        >
          All avatars
        </Link>
      </div>
    </div>
  )
}

export default LessonAvatarReward
