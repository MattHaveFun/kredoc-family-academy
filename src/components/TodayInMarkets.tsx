import { useEffect, useState } from 'react'
import { getNewsSnippets, type NewsResult } from '../data/newsFeed'
import { getNarrative } from '../data/aiNarrative'
import { subscribe as subscribeDailyUpdate } from '../data/dailyUpdate'

function TodayInMarkets() {
  const [news, setNews] = useState<NewsResult | null>(null)
  const [, bumpOnUpdate] = useState(0)
  useEffect(() => subscribeDailyUpdate(() => bumpOnUpdate((n) => n + 1)), [])
  const narrative = getNarrative()

  useEffect(() => {
    let cancelled = false
    getNewsSnippets().then((result) => {
      if (!cancelled) setNews(result)
    })
    return () => {
      cancelled = true
    }
  }, [])

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

          {narrative.state === 'ready' && narrative.text ? (
            <div className="animate-fade-in mt-4 space-y-3 text-sm leading-relaxed text-slate-300">
              {narrative.text.split(/\n{2,}/).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              <p className="!mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-600">
                AI-written · educational · never advice
              </p>
            </div>
          ) : narrative.state === 'error' ? (
            <p className="mt-4 text-sm leading-relaxed text-slate-500">
              Today's narrative couldn't be written — try pressing "Get today's update" again in a
              bit. Meanwhile, the headlines on the left have you covered.
            </p>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-slate-400/20 p-4">
              <p className="text-sm leading-relaxed text-slate-400">
                This panel holds a daily plain-English read on the markets — 200 words in the spirit
                of Morgan Housel meets Morning Brew, always answering "so what does this mean for
                your life?"
              </p>
              <p className="mt-3 text-xs leading-relaxed text-slate-600">
                Press "Get today's update" up top to have it written for today.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default TodayInMarkets
