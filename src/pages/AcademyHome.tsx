import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CATEGORY_META, CHAPTERS, LESSONS, POLL_OPTIONS, lessonsInChapter } from '../data/lessons'
import { useProfiles } from '../context/ProfileContext'

// Aggregates every profile's vote into the "what should we build next?" bars.
function PollPanel() {
  const { profiles, activeProfile, setPollVote } = useProfiles()
  const [customText, setCustomText] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  const { counts, customVotes, total } = useMemo(() => {
    const counts = new Map<string, number>()
    const customVotes: string[] = []
    for (const p of profiles) {
      if (!p.pollVote) continue
      if (p.pollVote.startsWith('custom:')) {
        customVotes.push(p.pollVote.slice(7))
        counts.set('custom', (counts.get('custom') ?? 0) + 1)
      } else {
        counts.set(p.pollVote, (counts.get(p.pollVote) ?? 0) + 1)
      }
    }
    const total = [...counts.values()].reduce((a, b) => a + b, 0)
    return { counts, customVotes, total }
  }, [profiles])

  const myVote = activeProfile?.pollVote ?? null
  const maxCount = Math.max(1, ...counts.values())

  const submitCustom = () => {
    if (!customText.trim()) return
    setPollVote(`custom:${customText.trim().slice(0, 80)}`)
    setShowCustom(false)
    setCustomText('')
  }

  return (
    <section className="panel animate-fade-up p-6 sm:p-8" style={{ animationDelay: '200ms' }}>
      <p className="eyebrow">Family vote</p>
      <h2 className="mt-2 font-display text-xl font-bold tracking-tight text-slate-50">
        What should we build next?
      </h2>
      <p className="mt-2 text-sm text-slate-500">
        Chapter 2 gets written where the votes point. One vote per profile — change it anytime.
      </p>

      <div className="mt-6 space-y-2.5">
        {POLL_OPTIONS.map((option) => {
          const count = counts.get(option.id) ?? 0
          const mine = myVote === option.id
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setPollVote(option.id)}
              className={`group relative w-full overflow-hidden rounded-xl border px-4 py-3 text-left transition-all duration-200 ${
                mine ? 'border-sky-400/40' : 'border-slate-400/10 hover:border-slate-400/30'
              }`}
            >
              <span
                className="absolute inset-y-0 left-0 bg-sky-400/[0.12] transition-all duration-500"
                style={{ width: total > 0 ? `${(count / maxCount) * 100}%` : '0%' }}
                aria-hidden
              />
              <span className="relative flex items-center justify-between gap-3">
                <span className={`text-sm font-medium ${mine ? 'text-sky-200' : 'text-slate-300'}`}>
                  {mine && <span className="mr-1.5">✓</span>}
                  {option.label}
                </span>
                <span className="font-mono text-xs tabular-nums text-slate-500">
                  {count > 0 ? `${count} vote${count === 1 ? '' : 's'}` : ''}
                </span>
              </span>
            </button>
          )
        })}

        {/* write-in */}
        {showCustom ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitCustom()}
              placeholder="Your own idea…"
              maxLength={80}
              className="flex-1 rounded-xl border border-slate-400/15 bg-ink-950/70 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-sky-400/50 focus:outline-none"
              autoFocus
            />
            <button
              type="button"
              onClick={submitCustom}
              className="rounded-xl bg-sky-400/15 px-4 font-mono text-xs font-semibold uppercase tracking-wider text-sky-300 ring-1 ring-inset ring-sky-400/40 transition-colors hover:bg-sky-400/25"
            >
              Vote
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowCustom(true)}
            className={`w-full rounded-xl border border-dashed px-4 py-3 text-left text-sm transition-colors ${
              myVote?.startsWith('custom:')
                ? 'border-sky-400/40 text-sky-200'
                : 'border-slate-400/20 text-slate-500 hover:border-slate-400/40 hover:text-slate-300'
            }`}
          >
            {myVote?.startsWith('custom:') ? `✓ Your idea: “${myVote.slice(7)}”` : '+ Write your own suggestion'}
          </button>
        )}

        {customVotes.length > 0 && (
          <p className="pt-1 text-[11px] text-slate-600">
            Write-ins so far: {customVotes.map((v) => `“${v}”`).join(' · ')}
          </p>
        )}
      </div>
    </section>
  )
}

function AcademyHome() {
  const { activeProfile } = useProfiles()

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <header className="max-w-3xl animate-fade-up">
        <p className="eyebrow">The Academy</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
          Every concept, explained like you're smart and busy
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">
          Chapter-based when you want a path, free-range when you want to wander. Progress is
          per-profile, questions match your learning style, and nothing here is homework.
        </p>
      </header>

      {/* Chapters */}
      <div className="mt-10 space-y-5">
        {CHAPTERS.map((chapter, ci) => {
          const lessons = lessonsInChapter(chapter.number)
          const done = lessons.filter((l) => activeProfile?.completedLessons.includes(l.id)).length
          const visited = lessons.filter((l) => activeProfile?.visitedLessons.includes(l.id)).length
          const firstUnvisited =
            lessons.find((l) => !activeProfile?.visitedLessons.includes(l.id)) ?? lessons[0]
          return (
            <section
              key={chapter.number}
              className="panel animate-fade-up p-6 sm:p-8"
              style={{ animationDelay: `${ci * 100 + 100}ms` }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-600">
                    Chapter {chapter.number}
                  </p>
                  <h2 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-slate-50">
                    {chapter.title}
                  </h2>
                  <p className="mt-1.5 max-w-xl text-sm text-slate-500">{chapter.subtitle}</p>
                </div>
                <Link
                  to={`/academy/lesson/${firstUnvisited.id}`}
                  className="rounded-xl bg-sky-400/15 px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-sky-300 ring-1 ring-inset ring-sky-400/40 transition-colors hover:bg-sky-400/25"
                >
                  {visited === 0 ? 'Start chapter →' : done === lessons.length ? 'Revisit →' : 'Continue →'}
                </Link>
              </div>
              <div className="mt-5 flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-400/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-400 to-up transition-all duration-700"
                    style={{ width: `${(done / lessons.length) * 100}%` }}
                  />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                  {done}/{lessons.length} complete
                </span>
              </div>
            </section>
          )
        })}
      </div>

      {/* Knowledge map + explore */}
      <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="shrink-0 font-mono text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
            Explore freely
          </h2>
          <div className="hidden h-px w-24 bg-gradient-to-r from-slate-400/20 to-transparent sm:block" />
        </div>
        <Link
          to="/academy/map"
          className="group inline-flex items-center gap-2 rounded-xl border border-slate-400/15 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-slate-300 transition-colors hover:border-sky-400/40 hover:text-sky-300"
        >
          <span className="text-base leading-none">🕸</span>
          Open the knowledge map
          <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LESSONS.map((lesson, i) => {
          const category = CATEGORY_META[lesson.category]
          const isVisited = activeProfile?.visitedLessons.includes(lesson.id)
          const isDone = activeProfile?.completedLessons.includes(lesson.id)
          return (
            <Link
              key={lesson.id}
              to={`/academy/lesson/${lesson.id}`}
              className="panel animate-fade-up group p-5 transition-all duration-300 hover:-translate-y-1 hover:border-slate-400/25"
              style={{ animationDelay: `${Math.min(i, 6) * 60}ms` }}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className="inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider"
                  style={{ color: category.color, borderColor: `${category.color}44`, backgroundColor: `${category.color}11` }}
                >
                  {lesson.tag}
                </span>
                <span className="font-mono text-[10px] text-slate-600">
                  {isDone ? '✓ done' : isVisited ? '· visited' : ''}
                </span>
              </div>
              <h3 className="mt-3 font-display text-lg font-semibold text-slate-100 group-hover:text-sky-200">
                {lesson.title}
              </h3>
              <p className="mt-1.5 text-sm italic leading-snug text-slate-500">{lesson.tagline}</p>
            </Link>
          )
        })}
      </div>

      {/* Poll */}
      <div className="mt-10">
        <PollPanel />
      </div>
    </div>
  )
}

export default AcademyHome
