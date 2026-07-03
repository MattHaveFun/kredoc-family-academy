import { useEffect } from 'react'
import { useLiveTicker } from '../hooks/useLiveTicker'
import { useFeedStatus } from '../context/FeedStatusContext'

function TickerStrip() {
  const { quotes, status } = useLiveTicker()
  const { setStatus } = useFeedStatus()

  useEffect(() => {
    setStatus(status)
  }, [status, setStatus])

  const doubled = [...quotes, ...quotes]

  return (
    <div className="relative border-b border-slate-400/10 bg-ink-900/70">
      <div className="group flex items-stretch">
        <div className="relative z-10 hidden shrink-0 items-center gap-2 border-r border-slate-400/10 bg-ink-950/95 px-4 font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-amber-300/90 sm:flex">
          <span className="h-1 w-1 animate-blink rounded-full bg-amber-400" />
          Watchlist
        </div>

        <div className="relative flex-1 overflow-hidden">
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
                  <span className="font-mono text-xs text-slate-300">
                    ${quote.price.toFixed(2)}
                  </span>
                  <span
                    className={`font-mono text-xs font-semibold ${isUp ? 'text-up' : 'text-down'}`}
                  >
                    {isUp ? '▲' : '▼'} {Math.abs(quote.changePct).toFixed(2)}%
                  </span>
                </div>
              )
            })}
          </div>

          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-ink-950 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-ink-950 to-transparent" />
        </div>
      </div>
    </div>
  )
}

export default TickerStrip
