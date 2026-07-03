import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useProfiles } from '../context/ProfileContext'
import { LESSON_BY_ID } from '../data/lessons'

// One-per-session "pick up where you left off" banner for returning learners.
function WelcomeBack() {
  const { activeProfile } = useProfiles()
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem('kredoc.welcomed') === '1')

  if (dismissed || !activeProfile?.lastLessonId) return null
  const lesson = LESSON_BY_ID[activeProfile.lastLessonId]
  if (!lesson) return null

  const dismiss = () => {
    sessionStorage.setItem('kredoc.welcomed', '1')
    setDismissed(true)
  }

  return (
    <div className="animate-fade-up border-b border-sky-400/15 bg-sky-400/[0.06]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <p className="text-sm text-slate-300">
          <span className="mr-1.5">{activeProfile.emoji}</span>
          Welcome back, <span className="font-semibold text-slate-100">{activeProfile.name}</span>. Ready to
          pick up where you left off?
        </p>
        <div className="flex items-center gap-3">
          <Link
            to={`/academy/lesson/${lesson.id}`}
            onClick={dismiss}
            className="rounded-lg bg-sky-400/15 px-4 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-sky-300 ring-1 ring-inset ring-sky-400/40 transition-colors hover:bg-sky-400/25"
          >
            Resume: {lesson.title} →
          </Link>
          <button
            type="button"
            onClick={dismiss}
            className="text-slate-500 transition-colors hover:text-slate-200"
            aria-label="Dismiss welcome message"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}

export default WelcomeBack
