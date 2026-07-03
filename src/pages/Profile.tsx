import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LEARNING_MODE_META, useProfiles } from '../context/ProfileContext'
import { LESSONS, LESSON_BY_ID, type LearningMode } from '../data/lessons'

function Profile() {
  const { activeProfile, setLearningMode, resetProgress, deleteProfile } = useProfiles()
  const [confirmingReset, setConfirmingReset] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  if (!activeProfile) return null

  const completed = activeProfile.completedLessons.length
  const visited = activeProfile.visitedLessons.length
  const total = LESSONS.length
  const quizCount = activeProfile.quizAnswers.length
  const quizRight = activeProfile.quizAnswers.filter((q) => q.correct).length
  const lastLesson = activeProfile.lastLessonId ? LESSON_BY_ID[activeProfile.lastLessonId] : null

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <header className="animate-fade-up flex items-center gap-4">
        <span
          className="grid h-16 w-16 place-items-center rounded-full text-3xl"
          style={{ backgroundColor: `${activeProfile.color}1a`, boxShadow: `inset 0 0 0 2px ${activeProfile.color}77` }}
        >
          {activeProfile.emoji}
        </span>
        <div>
          <p className="eyebrow">Profile</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-slate-50">
            {activeProfile.name}
          </h1>
        </div>
      </header>

      <dl className="animate-fade-up mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-slate-400/10 bg-slate-400/10 sm:grid-cols-4" style={{ animationDelay: '80ms' }}>
        {[
          { label: 'Lessons visited', value: `${visited}/${total}` },
          { label: 'Completed', value: `${completed}/${total}` },
          { label: 'Questions tried', value: String(quizCount) },
          { label: 'Nailed it', value: quizCount ? `${quizRight}/${quizCount}` : '—' },
        ].map((stat) => (
          <div key={stat.label} className="bg-ink-900/90 px-4 py-3.5">
            <dt className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-600">{stat.label}</dt>
            <dd className="mt-0.5 font-mono text-lg font-semibold tabular-nums text-slate-100">{stat.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-slate-600">
        Not a grade book — just a map of where you've been.
      </p>

      {lastLesson && (
        <div className="panel animate-fade-up mt-8 flex flex-wrap items-center justify-between gap-3 p-5" style={{ animationDelay: '140ms' }}>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-600">Last visited</p>
            <p className="mt-1 text-sm font-semibold text-slate-100">{lastLesson.title}</p>
          </div>
          <Link
            to={`/academy/lesson/${lastLesson.id}`}
            className="rounded-lg bg-sky-400/15 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-sky-300 ring-1 ring-inset ring-sky-400/40 transition-colors hover:bg-sky-400/25"
          >
            Continue →
          </Link>
        </div>
      )}

      <section className="panel animate-fade-up mt-8 p-6" style={{ animationDelay: '200ms' }}>
        <h2 className="font-display text-lg font-semibold text-slate-100">Learning mode</h2>
        <p className="mt-1 text-sm text-slate-500">How lesson questions are asked. Switch anytime.</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {(Object.keys(LEARNING_MODE_META) as LearningMode[]).map((m) => {
            const meta = LEARNING_MODE_META[m]
            const active = activeProfile.learningMode === m
            return (
              <button
                key={m}
                type="button"
                onClick={() => setLearningMode(m)}
                className={`rounded-xl border p-3.5 text-left transition-all duration-200 ${
                  active
                    ? 'border-sky-400/40 bg-sky-400/[0.08] shadow-[0_0_20px_-8px_rgba(56,189,248,0.6)]'
                    : 'border-slate-400/10 hover:border-slate-400/25'
                }`}
                aria-pressed={active}
              >
                <span className="text-lg">{meta.icon}</span>
                <p className="mt-1 text-sm font-semibold text-slate-100">{meta.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{meta.description}</p>
              </button>
            )
          })}
        </div>
      </section>

      <section className="panel animate-fade-up mt-8 border-down/20 p-6" style={{ animationDelay: '260ms' }}>
        <h2 className="font-display text-lg font-semibold text-slate-100">Danger zone</h2>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-400/10 p-4">
          <div>
            <p className="text-sm font-semibold text-slate-200">Reset my progress</p>
            <p className="mt-0.5 text-xs text-slate-500">
              Wipes lessons, quiz answers, and votes for {activeProfile.name} only. Other profiles are untouched.
            </p>
          </div>
          {confirmingReset ? (
            <span className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  resetProgress(activeProfile.id)
                  setConfirmingReset(false)
                }}
                className="rounded-lg bg-down/15 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-down ring-1 ring-inset ring-down/40 transition-colors hover:bg-down/25"
              >
                Yes, start fresh
              </button>
              <button
                type="button"
                onClick={() => setConfirmingReset(false)}
                className="rounded-lg px-3 py-2 text-xs font-medium text-slate-400 transition-colors hover:text-slate-100"
              >
                Cancel
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingReset(true)}
              className="rounded-lg border border-down/30 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-down/90 transition-colors hover:bg-down/10"
            >
              Reset my progress
            </button>
          )}
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-400/10 p-4">
          <div>
            <p className="text-sm font-semibold text-slate-200">Delete this profile</p>
            <p className="mt-0.5 text-xs text-slate-500">Removes {activeProfile.name} from this device entirely.</p>
          </div>
          {confirmingDelete ? (
            <span className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => deleteProfile(activeProfile.id)}
                className="rounded-lg bg-down/15 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-down ring-1 ring-inset ring-down/40 transition-colors hover:bg-down/25"
              >
                Yes, delete
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="rounded-lg px-3 py-2 text-xs font-medium text-slate-400 transition-colors hover:text-slate-100"
              >
                Cancel
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="rounded-lg border border-slate-400/20 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-slate-400 transition-colors hover:border-down/30 hover:text-down/90"
            >
              Delete profile
            </button>
          )}
        </div>
      </section>
    </div>
  )
}

export default Profile
