import { useEffect, useMemo } from 'react'
import { TOP_COMPANIES } from '../data/companies'
import { useQuotes } from '../hooks/useQuotes'
import { useFeedStatus } from '../context/FeedStatusContext'

const WATCHLIST_SYMBOLS = TOP_COMPANIES.map((c) => c.symbol)

function TickerStrip() {
  const { results, status, fetchedAt } = useQuotes(WATCHLIST_SYMBOLS, 3)
  const { setStatus } = useFeedStatus()

  useEffect(() => {
    setStatus(status, fetchedAt)
  }, [status, fetchedAt, setStatus])

  const rows = useMemo(
    () =>
      TOP_COMPANIES.flatMap((company) => {
        const quote = results[company.symbol]?.quote
        return quote ? [{ ...company, price: quote.price, changePct: quote.changePct }] : []
      }),
    [results],
  )

  const doubled = [...rows, ...rows]

  return (
    <div className="relative border-b border-slate-400/10 bg-ink-900/70">
      <div className="group flex items-stretch">
        <div className="relative z-10 hidden shrink-0 items-center gap-2 border-r border-slate-400/10 bg-ink-950/95 px-4 font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-amber-300/90 sm:flex">
          <span className="h-1 w-1 animate-blink rounded-full bg-amber-400" />
          Watchlist
        </div>

        <div className="relative flex-1 overflow-hidden">
          {rows.length === 0 ? (
            <p className="py-2.5 text-center font-mono text-[11px] uppercase tracking-[0.25em] text-slate-600">
              {status === 'unavailable'
                ? "No numbers loaded yet — press \"Get today's update\" up top"
                : 'Tuning in to the watchlist…'}
            </p>
          ) : (
            <div className="animate-ticker flex w-max items-center gap-10 py-2.5 group-hover:[animation-play-state:paused]">
              {doubled.map((quote, i) => {
                const isUp = quote.changePct >= 0
                return (
                  <div
                    key={`${quote.symbol}-${i}`}
                    className="flex shrink-0 items-baseline gap-2 whitespace-nowrap text-sm"
                  >
                    <span className="font-mono text-xs font-semibold tracking-wide text-slate-100">
                      {quote.symbol}
                    </span>
                    <span className="text-xs text-slate-600">{quote.name}</span>
                    <span className="font-mono text-xs text-slate-300">${quote.price.toFixed(2)}</span>
                    <span className={`font-mono text-xs font-semibold ${isUp ? 'text-up' : 'text-down'}`}>
                      {isUp ? '▲' : '▼'} {Math.abs(quote.changePct).toFixed(2)}%
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-ink-950 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-ink-950 to-transparent" />
        </div>
      </div>
    </div>
  )
}

export default TickerStrip
