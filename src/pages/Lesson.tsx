import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CATEGORY_META, CHAPTERS, LESSON_BY_ID, lessonsInChapter } from '../data/lessons'
import { MARKET_SYMBOLS, formatChangeMagnitude, formatPrice } from '../data/markets'
import { useProfiles } from '../context/ProfileContext'
import { useSeries } from '../hooks/useSeries'
import LearningModeCheck from '../components/LearningModeCheck'
import DataBadge from '../components/DataBadge'

// Small live chart pulled from the same dashboard data, anchoring the lesson
// to what the market is doing right now.
function LessonMiniChart({ marketId }: { marketId: string }) {
  const market = MARKET_SYMBOLS.find((m) => m.id === marketId)
  const series = useSeries(market ?? MARKET_SYMBOLS[0], '1M', 6)
  if (!market || series.candles.length < 2) return null

  const candles = series.candles
  const first = candles[0]
  const last = candles[candles.length - 1]
  const changePct = ((last.close - first.open) / first.open) * 100
  const isUp = changePct >= 0
  const color = isUp ? '#2dd4a7' : '#ff6b7f'
  const lo = Math.min(...candles.map((c) => c.low))
  const hi = Math.max(...candles.map((c) => c.high))
  const pts = candles
    .map((c, i) => {
      const x = (i / (candles.length - 1)) * 100
      const y = 36 - ((c.close - lo) / (hi - lo || 1)) * 32
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  return (
    <div className="mt-5 rounded-xl border border-slate-400/10 bg-ink-950/50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-sky-400/90">{market.symbol}</span>
          <span className="text-xs text-slate-500">
            right now · past month{series.proxyNote ? ` · ${series.proxyNote}` : ''}
          </span>
          <DataBadge status={series.status} fetchedAt={series.fetchedAt} compact />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-sm font-semibold text-slate-100">
            {formatPrice(last.close, market.assetClass)}
          </span>
          <span className={`font-mono text-xs font-semibold ${isUp ? 'text-up' : 'text-down'}`}>
            {isUp ? '▲' : '▼'} {formatChangeMagnitude(first.open, last.close, market.assetClass)}
          </span>
        </div>
      </div>
      <svg viewBox="0 0 100 40" className="mt-2 h-16 w-full" preserveAspectRatio="none" aria-hidden>
        <polyline
          points={pts}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  )
}

function ExpandLayer({
  label,
  hint,
  children,
  defaultOpen = false,
}: {
  label: string
  hint: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-2xl border border-slate-400/10 bg-ink-950/40">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-slate-400/[0.04]"
        aria-expanded={open}
      >
        <span>
          <span className="block font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-sky-400">
            {label}
          </span>
          <span className="mt-0.5 block text-xs text-slate-500">{hint}</span>
        </span>
        <span
          className={`text-lg leading-none text-slate-600 transition-transform duration-200 ${open ? 'rotate-45' : ''}`}
        >
          +
        </span>
      </button>
      {open && (
        <div className="animate-fade-in space-y-4 border-t border-slate-400/10 px-5 py-5 text-[15px] leading-relaxed text-slate-300">
          {children}
        </div>
      )}
    </div>
  )
}

function Lesson() {
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const { activeProfile, markVisited, markCompleted } = useProfiles()
  const [copied, setCopied] = useState(false)
  const [tocOpen, setTocOpen] = useState(false)

  const lesson = lessonId ? LESSON_BY_ID[lessonId] : undefined
  const chapterLessons = useMemo(() => lessonsInChapter(lesson?.chapter ?? 1), [lesson?.chapter])

  useEffect(() => {
    if (!lesson) return
    markVisited(lesson.id)
    window.scrollTo({ top: 0 })
    setCopied(false)
    // markVisited is stable per provider; keying on lesson.id is the intent
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson?.id])

  if (!lesson) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-slate-500">Lesson not found</p>
        <Link to="/academy" className="mt-4 inline-block text-sm font-semibold text-sky-300 hover:text-sky-200">
          ← Back to the Academy
        </Link>
      </div>
    )
  }

  const index = chapterLessons.findIndex((l) => l.id === lesson.id)
  const prev = index > 0 ? chapterLessons[index - 1] : null
  const next = index < chapterLessons.length - 1 ? chapterLessons[index + 1] : null
  const chapterTitle = CHAPTERS.find((c) => c.number === lesson.chapter)?.title ?? ''
  const completed = activeProfile?.completedLessons.includes(lesson.id) ?? false
  const completedCount = chapterLessons.filter((l) =>
    activeProfile?.completedLessons.includes(l.id),
  ).length
  const category = CATEGORY_META[lesson.category]

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(lesson.aiPrompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable — the prompt is still selectable
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* breadcrumb + chapter progress */}
      <div className="animate-fade-up flex flex-wrap items-center justify-between gap-4">
        <nav className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-slate-500" aria-label="Breadcrumb">
          <Link to="/academy" className="transition-colors hover:text-sky-300">
            Academy
          </Link>
          <span className="text-slate-700">/</span>
          <span>Chapter {lesson.chapter}</span>
          <span className="text-slate-700">/</span>
          <span className="text-slate-300">
            Lesson {index + 1} of {chapterLessons.length}
          </span>
        </nav>
        <div className="flex items-center gap-3">
          <div className="h-1.5 w-32 overflow-hidden rounded-full bg-slate-400/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 to-up transition-all duration-500"
              style={{ width: `${(completedCount / chapterLessons.length) * 100}%` }}
            />
          </div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-slate-600">
            {completedCount}/{chapterLessons.length} done
          </span>
        </div>
      </div>

      <div className="mt-8 flex gap-10">
        {/* sidebar TOC */}
        <nav className="sticky top-24 hidden w-56 shrink-0 self-start lg:block" aria-label="Chapter contents">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-600">
            Chapter {lesson.chapter} · {chapterTitle}
          </p>
          <ul className="mt-4 space-y-0.5 border-l border-slate-400/10">
            {chapterLessons.map((l, i) => {
              const isActive = l.id === lesson.id
              const isVisited = activeProfile?.visitedLessons.includes(l.id)
              const isDone = activeProfile?.completedLessons.includes(l.id)
              return (
                <li key={l.id}>
                  <Link
                    to={`/academy/lesson/${l.id}`}
                    className={`-ml-px flex items-baseline gap-2.5 border-l-2 py-1.5 pl-4 text-xs transition-all duration-200 ${
                      isActive
                        ? 'border-sky-400 font-semibold text-sky-300'
                        : 'border-transparent text-slate-500 hover:border-slate-400/40 hover:text-slate-200'
                    }`}
                  >
                    <span className="font-mono text-[10px] tabular-nums text-slate-600">
                      {isDone ? '✓' : isVisited ? '·' : String(i + 1).padStart(2, '0')}
                    </span>
                    {l.title}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <article className="min-w-0 flex-1">
          {/* mobile TOC */}
          <div className="mb-6 lg:hidden">
            <button
              type="button"
              onClick={() => setTocOpen((o) => !o)}
              className="flex w-full items-center justify-between rounded-xl border border-slate-400/10 bg-ink-950/50 px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500"
              aria-expanded={tocOpen}
            >
              Chapter contents
              <span className={`transition-transform duration-200 ${tocOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {tocOpen && (
              <ul className="animate-fade-in mt-2 space-y-1 rounded-xl border border-slate-400/10 bg-ink-950/50 p-3">
                {chapterLessons.map((l, i) => (
                  <li key={l.id}>
                    <Link
                      to={`/academy/lesson/${l.id}`}
                      onClick={() => setTocOpen(false)}
                      className={`block rounded-lg px-3 py-2 text-sm ${
                        l.id === lesson.id ? 'bg-sky-400/10 text-sky-300' : 'text-slate-400'
                      }`}
                    >
                      {String(i + 1).padStart(2, '0')} · {l.title}
                      {activeProfile?.completedLessons.includes(l.id) && ' ✓'}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* SURFACE LAYER */}
          <header className="animate-fade-up">
            <div className="flex items-center gap-3">
              <span
                className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: category.color, borderColor: `${category.color}44`, backgroundColor: `${category.color}11` }}
              >
                {lesson.tag}
              </span>
              {completed && (
                <span className="inline-flex items-center gap-1 rounded-full border border-up/25 bg-up/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-up">
                  ✓ Completed
                </span>
              )}
            </div>
            <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
              {lesson.title}
            </h1>
            <p className="mt-3 border-l-2 border-sky-400/50 pl-3.5 text-base font-medium italic text-sky-200/70">
              {lesson.tagline}
            </p>
            <p className="mt-5 text-[15px] leading-relaxed text-slate-300">{lesson.surface}</p>
            {lesson.marketId && <LessonMiniChart marketId={lesson.marketId} />}
            {lesson.riskNote && (
              <div className="mt-5 rounded-2xl border border-down/25 bg-down/[0.06] p-4 sm:p-5">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-down">
                  ⚠ Volatility risk
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{lesson.riskNote}</p>
              </div>
            )}
          </header>

          {/* MIDDLE + DEEP LAYERS */}
          <div className="mt-8 space-y-4">
            <ExpandLayer label="Go deeper" hint="Analogies, history, and why this matters at 22">
              {lesson.middle.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </ExpandLayer>
            <ExpandLayer label="The mechanics" hint="Edge cases, expert nuance, what professionals actually watch">
              {lesson.deep.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </ExpandLayer>
          </div>

          {/* CHARACTER SCENARIO */}
          <div className="mt-8 rounded-2xl border border-amber-400/15 bg-amber-400/[0.05] p-5 sm:p-6">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-amber-300">
              A tale of two decisions
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-300">{lesson.scenario}</p>
          </div>

          {/* LEARNING MODE CHECK */}
          <div className="mt-8">
            <LearningModeCheck lesson={lesson} />
          </div>

          {/* CONNECTIONS */}
          <div className="mt-8">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-500">
              This connects to
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {lesson.connects.map((id) => {
                const related = LESSON_BY_ID[id]
                if (!related) return null
                return (
                  <Link
                    key={id}
                    to={`/academy/lesson/${id}`}
                    className="rounded-full border border-sky-400/20 bg-sky-400/[0.07] px-3.5 py-1.5 text-xs font-medium text-sky-300 transition-colors hover:bg-sky-400/15"
                  >
                    {related.title}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* AI PROMPT */}
          <div className="mt-8 rounded-2xl border border-slate-400/10 bg-ink-950/60 p-5 sm:p-6">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-500">
              Want to go deeper? Ask Claude
            </p>
            <p className="mt-3 text-sm italic leading-relaxed text-slate-400">“{lesson.aiPrompt}”</p>
            <button
              type="button"
              onClick={copyPrompt}
              className="mt-4 rounded-lg border border-slate-400/20 px-3.5 py-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-300 transition-colors hover:border-sky-400/40 hover:text-sky-300"
            >
              {copied ? '✓ Copied' : 'Copy prompt'}
            </button>
          </div>

          {/* COMPLETE + PREV/NEXT */}
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-slate-400/10 pt-6">
            <button
              type="button"
              onClick={() => markCompleted(lesson.id, !completed)}
              className={`rounded-xl px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider ring-1 ring-inset transition-all duration-200 ${
                completed
                  ? 'bg-up/10 text-up ring-up/40 hover:bg-up/15'
                  : 'bg-sky-400/10 text-sky-300 ring-sky-400/40 hover:bg-sky-400/20'
              }`}
            >
              {completed ? '✓ Completed — tap to undo' : 'Mark complete'}
            </button>
            <div className="flex gap-2">
              {prev && (
                <button
                  type="button"
                  onClick={() => navigate(`/academy/lesson/${prev.id}`)}
                  className="rounded-xl border border-slate-400/15 px-4 py-2.5 text-sm text-slate-300 transition-colors hover:border-slate-400/35 hover:text-slate-100"
                >
                  ← {prev.title}
                </button>
              )}
              {next ? (
                <button
                  type="button"
                  onClick={() => navigate(`/academy/lesson/${next.id}`)}
                  className="rounded-xl border border-sky-400/30 bg-sky-400/[0.08] px-4 py-2.5 text-sm font-medium text-sky-300 transition-colors hover:bg-sky-400/15"
                >
                  {next.title} →
                </button>
              ) : (
                <Link
                  to="/academy"
                  className="rounded-xl border border-up/30 bg-up/[0.08] px-4 py-2.5 text-sm font-medium text-up transition-colors hover:bg-up/15"
                >
                  Chapter complete — back to the Academy →
                </Link>
              )}
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}

export default Lesson
