import { useEffect, useMemo, useState } from 'react'
import { getNewsSnippets, type NewsResult } from '../data/newsFeed'
import { getDailyNarrative, hasNarrativeKey, type NarrativeResult } from '../data/aiNarrative'
import { SECTORS } from '../data/sectors'
import { useQuotes } from '../hooks/useQuotes'

const SECTOR_ETFS = SECTORS.map((s) => s.etf)

function TodayInMarkets() {
  const [news, setNews] = useState<NewsResult | null>(null)
  const [narrative, setNarrative] = useState<NarrativeResult | null>(null)

  // Reuses the heat map's quotes (deduped + cached) to describe the day to
  // the narrative model — no extra API credits.
  const { results: sectorResults } = useQuotes(SECTOR_ETFS, 6)
  const { results: vixResults } = useQuotes(useMemo(() => ['VIX'], []), 6)

  useEffect(() => {
    let cancelled = false
    getNewsSnippets().then((result) => {
      if (!cancelled) setNews(result)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const summaryReady = useMemo(() => {
    const sectors = SECTORS.flatMap((s) => {
      const q = sectorResults[s.etf]?.quote
      return q ? [{ label: s.name, changePct: q.changePct }] : []
    })
    const vix = vixResults['VIX']?.quote
    if (vix) sectors.push({ label: 'VIX (fear index)', changePct: vix.changePct })
    return sectors
  }, [sectorResults, vixResults])

  useEffect(() => {
    if (!hasNarrativeKey()) {
      setNarrative({ text: null, state: 'no-key', generatedAt: null })
      return
    }
    if (summaryReady.length < 6 || narrative?.state === 'ready') return
    let cancelled = false
    getDailyNarrative(summaryReady).then((result) => {
      if (!cancelled) setNarrative(result)
    })
    return () => {
      cancelled = true
    }
  }, [summaryReady, narrative?.state])

  return (
    <section className="panel overflow-hidden">
      <div className="border-b border-slate-400/10 bg-ink-950/50 px-5 py-3.5">
        <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
          Today in markets
        </h2>
      </div>

      <div className="grid gap-px bg-slate-400/10 lg:grid-cols-2">
        {/* What the pros are saying */}
        <div className="bg-ink-900/80 p-5 sm:p-6">
          <h3 className="font-display text-sm font-semibold text-slate-100">
            What the pros are saying
          </h3>
          <div className="mt-4 space-y-3">
            {news === null && (
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-600">
                Gathering headlines…
              </p>
            )}
            {news?.snippets.slice(0, 3).map((snippet, i) => (
              <a
                key={`${snippet.source}-${i}`}
                href={snippet.link}
                target="_blank"
                rel="noopener noreferrer"
                className="animate-fade-up group flex gap-3 rounded-xl border border-slate-400/10 bg-ink-950/40 p-3.5 transition-all duration-200 hover:border-sky-400/25"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-sky-400/20 to-sky-600/5 font-display text-sm font-bold text-sky-300 ring-1 ring-inset ring-sky-400/25">
                  {snippet.sourceInitial}
                </span>
                <div className="min-w-0">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    {snippet.source}
                  </p>
                  <p className="mt-0.5 text-sm font-medium leading-snug text-slate-200 group-hover:text-sky-200">
                    {snippet.title}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs leading-snug text-slate-500">{snippet.summary}</p>
                </div>
              </a>
            ))}
            {news && !news.live && (
              <p className="text-[11px] text-slate-600">
                Headlines are temporarily unreachable — the links above go straight to each source.
              </p>
            )}
          </div>
        </div>

        {/* What it actually means */}
        <div className="bg-ink-900/80 p-5 sm:p-6">
          <h3 className="font-display text-sm font-semibold text-slate-100">
            What it actually means
          </h3>

          {narrative?.state === 'ready' && narrative.text ? (
            <div className="animate-fade-in mt-4 space-y-3 text-sm leading-relaxed text-slate-300">
              {narrative.text.split(/\n{2,}/).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              <p className="!mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-600">
                AI-written · educational · never advice
              </p>
            </div>
          ) : narrative?.state === 'error' ? (
            <p className="mt-4 text-sm leading-relaxed text-slate-500">
              The daily narrative couldn't be written just now — it'll try again on the next visit.
              Meanwhile, the headlines on the left have you covered.
            </p>
          ) : narrative?.state === 'no-key' ? (
            <div className="mt-4 rounded-xl border border-dashed border-slate-400/20 p-4">
              <p className="text-sm leading-relaxed text-slate-400">
                This panel will hold a daily plain-English read on the markets — 200 words in the
                spirit of Morgan Housel meets Morning Brew, always answering "so what does this mean
                for your life?"
              </p>
              <p className="mt-3 text-xs leading-relaxed text-slate-600">
                It switches on when the site owner adds an OpenAI API key (VITE_OPENAI_API_KEY) —
                see the README. Until then, no fake insight, just this honest placeholder.
              </p>
            </div>
          ) : (
            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-slate-600">
              Writing today's read…
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

export default TodayInMarkets
