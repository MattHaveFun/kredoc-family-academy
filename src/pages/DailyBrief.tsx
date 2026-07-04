import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { LESSONS, LESSON_BY_ID } from '../data/lessons'
import { SECTORS } from '../data/sectors'
import { TOP_COMPANIES } from '../data/companies'
import { useProfiles } from '../context/ProfileContext'
import { useQuotes } from '../hooks/useQuotes'
import { useMarketQuote } from '../hooks/useMarketQuote'
import { getNarrative } from '../data/aiNarrative'
import { subscribe as subscribeDailyUpdate } from '../data/dailyUpdate'
import MarketMoodGauge from '../components/MarketMoodGauge'
import LearningModeCheck from '../components/LearningModeCheck'
import DataBadge from '../components/DataBadge'

const SECTOR_ETFS = SECTORS.map((s) => s.etf)
const WATCHLIST = TOP_COMPANIES.map((c) => c.symbol)

// Plain-English one-liners for the movers card, sized to the move.
function moveExplanation(changePct: number): string {
  const abs = Math.abs(changePct)
  if (abs >= 5) {
    return changePct > 0
      ? 'A move this big usually means real news — earnings, a deal, or a surprise. Worth a headline search before forming an opinion.'
      : 'Drops this size are almost never random — earnings miss, bad news, or a downgrade. The story matters more than the number.'
  }
  if (abs >= 2) {
    return changePct > 0
      ? 'A solid up day — bigger than routine noise, smaller than a bombshell. Often sector-wide rather than company-specific.'
      : 'A notable dip — could be company news, could be its whole sector having a rough day. Check the sector first.'
  }
  return 'Ordinary daily wiggle — moves under ~2% are mostly noise, and reading meaning into them is how bad habits start.'
}

function BriefCard({
  step,
  title,
  children,
  delay,
}: {
  step: number
  title: string
  children: React.ReactNode
  delay: number
}) {
  return (
    <section
      className="panel animate-fade-up snap-start scroll-mt-20 p-5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-600">
        {String(step).padStart(2, '0')} · {title}
      </p>
      <div className="mt-3">{children}</div>
    </section>
  )
}

function DailyBrief() {
  const { activeProfile } = useProfiles()
  const spxQuote = useMarketQuote('sp500', 1)
  const vixQuote = useMarketQuote('vix', 1)
  const sectorQuotes = useQuotes(SECTOR_ETFS, 2)
  const watchlistQuotes = useQuotes(WATCHLIST, 3)
  const [, bumpOnUpdate] = useState(0)
  useEffect(() => subscribeDailyUpdate(() => bumpOnUpdate((n) => n + 1)), [])
  const narrative = getNarrative()

  const spx = spxQuote.quote
  // Only the true VIX level means anything on its famous 12–40 scale.
  const vix = vixQuote.proxyNote === null ? vixQuote.quote : null

  const biggestSector = useMemo(() => {
    let best: { name: string; changePct: number } | null = null
    for (const s of SECTORS) {
      const q = sectorQuotes.results[s.etf]?.quote
      if (q && (!best || Math.abs(q.changePct) > Math.abs(best.changePct))) {
        best = { name: s.name, changePct: q.changePct }
      }
    }
    return best
  }, [sectorQuotes.results])

  const movers = useMemo(() => {
    const rows = TOP_COMPANIES.flatMap((c) => {
      const q = watchlistQuotes.results[c.symbol]?.quote
      return q ? [{ symbol: c.symbol, name: c.name, changePct: q.changePct, price: q.price }] : []
    })
    return rows.sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct)).slice(0, 3)
  }, [watchlistQuotes.results])

  // Lesson of the day: next unvisited in sequence, else rotate by date.
  const lessonOfTheDay = useMemo(() => {
    const unvisited = LESSONS.find((l) => !activeProfile?.visitedLessons.includes(l.id))
    if (unvisited) return unvisited
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000)
    return LESSONS[dayOfYear % LESSONS.length]
  }, [activeProfile?.visitedLessons])

  const quizLesson = activeProfile?.lastLessonId
    ? LESSON_BY_ID[activeProfile.lastLessonId] ?? lessonOfTheDay
    : lessonOfTheDay

  const insight = narrative.state === 'ready' && narrative.text ? narrative.text.split(/\n{2,}/)[0] : null

  return (
    <div className="mx-auto max-w-lg snap-y px-4 py-6 sm:px-6">
      <header className="animate-fade-up mb-5">
        <p className="eyebrow">Daily Brief</p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-50">
          {activeProfile ? `Morning, ${activeProfile.name}.` : 'Good morning.'}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} ·
          five cards, two minutes.
        </p>
      </header>

      <div className="space-y-4">
        {/* Card 1: mood */}
        <BriefCard step={1} title="Market mood" delay={0}>
          <div className="-m-5 mb-0">
            <MarketMoodGauge />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-slate-400/10 bg-slate-400/10">
            <div className="bg-ink-900/90 px-3 py-2.5">
              <p className="font-mono text-[9px] uppercase tracking-wider text-slate-600">S&P 500</p>
              <p className={`mt-0.5 font-mono text-sm font-semibold tabular-nums ${spx && spx.changePct >= 0 ? 'text-up' : 'text-down'}`}>
                {spx ? `${spx.changePct >= 0 ? '+' : ''}${spx.changePct.toFixed(2)}%` : '···'}
              </p>
            </div>
            <div className="bg-ink-900/90 px-3 py-2.5">
              <p className="font-mono text-[9px] uppercase tracking-wider text-slate-600">VIX</p>
              <p className="mt-0.5 font-mono text-sm font-semibold tabular-nums text-slate-200">
                {vix ? vix.price.toFixed(1) : vixQuote.status === 'loading' ? '···' : '—'}
              </p>
            </div>
            <div className="bg-ink-900/90 px-3 py-2.5">
              <p className="font-mono text-[9px] uppercase tracking-wider text-slate-600">Top sector</p>
              <p className={`mt-0.5 truncate font-mono text-sm font-semibold tabular-nums ${biggestSector && biggestSector.changePct >= 0 ? 'text-up' : 'text-down'}`}>
                {biggestSector
                  ? `${biggestSector.name.split(' ')[0]} ${biggestSector.changePct >= 0 ? '+' : ''}${biggestSector.changePct.toFixed(1)}%`
                  : '···'}
              </p>
            </div>
          </div>
        </BriefCard>

        {/* Card 2: insight */}
        <BriefCard step={2} title="Today's insight" delay={80}>
          {insight ? (
            <p className="text-sm leading-relaxed text-slate-300">{insight}</p>
          ) : narrative.state === 'pending' ? (
            <p className="text-sm leading-relaxed text-slate-500">
              Press "Get today's update" up top to pull today's close and have Gemini write today's
              read. Until then: the mood gauge above tells most of today's story.
            </p>
          ) : (
            <p className="text-sm leading-relaxed text-slate-500">
              Today's read couldn't be written — the numbers above are still good, try the update
              button again in a bit.
            </p>
          )}
        </BriefCard>

        {/* Card 3: lesson of the day */}
        <BriefCard step={3} title="Lesson of the day" delay={160}>
          <h2 className="font-display text-lg font-semibold text-slate-100">{lessonOfTheDay.title}</h2>
          <p className="mt-1 text-sm italic text-slate-500">{lessonOfTheDay.tagline}</p>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">{lessonOfTheDay.surface}</p>
          <Link
            to={`/academy/lesson/${lessonOfTheDay.id}`}
            className="mt-4 inline-block rounded-lg bg-sky-400/15 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-sky-300 ring-1 ring-inset ring-sky-400/40 transition-colors hover:bg-sky-400/25"
          >
            Read more →
          </Link>
        </BriefCard>

        {/* Card 4: quick quiz */}
        <BriefCard step={4} title="Quick quiz" delay={240}>
          <div className="-m-1">
            <LearningModeCheck lesson={quizLesson} />
          </div>
        </BriefCard>

        {/* Card 5: movers */}
        <BriefCard step={5} title="What's moving and why" delay={320}>
          <div className="mb-2 flex justify-end">
            <DataBadge status={watchlistQuotes.status} fetchedAt={watchlistQuotes.fetchedAt} compact />
          </div>
          {movers.length === 0 ? (
            <p className="text-sm text-slate-500">
              {watchlistQuotes.status === 'unavailable'
                ? 'No numbers loaded yet — press "Get today\'s update" up top.'
                : 'Checking the tape…'}
            </p>
          ) : (
            <ul className="space-y-3">
              {movers.map((m) => (
                <li key={m.symbol} className="rounded-xl border border-slate-400/10 bg-ink-950/40 p-3.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-100">
                      <span className="font-mono text-sky-400/90">{m.symbol}</span> · {m.name}
                    </span>
                    <span className={`font-mono text-sm font-semibold ${m.changePct >= 0 ? 'text-up' : 'text-down'}`}>
                      {m.changePct >= 0 ? '▲' : '▼'} {Math.abs(m.changePct).toFixed(2)}%
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs leading-snug text-slate-500">{moveExplanation(m.changePct)}</p>
                </li>
              ))}
            </ul>
          )}
        </BriefCard>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 pb-4">
        <Link
          to="/"
          className="rounded-xl border border-slate-400/15 px-4 py-3 text-center font-mono text-xs font-semibold uppercase tracking-wider text-slate-300 transition-colors hover:border-sky-400/40 hover:text-sky-300"
        >
          Open full dashboard →
        </Link>
        <Link
          to="/academy"
          className="rounded-xl border border-slate-400/15 px-4 py-3 text-center font-mono text-xs font-semibold uppercase tracking-wider text-slate-300 transition-colors hover:border-sky-400/40 hover:text-sky-300"
        >
          Go to Academy →
        </Link>
      </div>
    </div>
  )
}

export default DailyBrief
