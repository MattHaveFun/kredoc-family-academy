import { useEffect, useMemo } from 'react'
import { TOP_COMPANIES } from '../data/companies'
import { MARKET_SYMBOLS, formatChangeMagnitude, formatPrice } from '../data/markets'
import { useQuotes } from '../hooks/useQuotes'
import { useMarketQuote } from '../hooks/useMarketQuote'
import { useMarketQuotes } from '../hooks/useMarketQuotes'
import { useFeedStatus } from '../context/FeedStatusContext'

const STOCK_SYMBOLS = TOP_COMPANIES.map((c) => c.symbol)

// Everything "alive" that isn't a stock — the calmer second layer. Order is
// deliberate: crypto, then the commodities/currencies, then the yield curve.
const MACRO_IDS = [
  'bitcoin',
  'ethereum',
  'gold',
  'oil',
  'silver',
  'natgas',
  'copper',
  'dxy',
  'ust2y',
  'tnx',
  'ust30y',
]

interface TickerItem {
  key: string
  symbol: string
  name: string
  display: string
  changeText: string
  changePct: number
}

function TickerRow({
  items,
  label,
  labelClass,
  dotClass,
  animationClass,
  emptyMessage,
}: {
  items: TickerItem[]
  label: string
  labelClass: string
  dotClass: string
  animationClass: string
  emptyMessage: string
}) {
  const doubled = [...items, ...items]
  return (
    <div className="group flex items-stretch">
      <div
        className={`relative z-10 hidden shrink-0 items-center gap-2 border-r border-slate-400/10 bg-ink-950/95 px-4 font-mono text-[10px] font-semibold uppercase tracking-[0.25em] sm:flex ${labelClass}`}
      >
        <span className={`h-1 w-1 animate-blink rounded-full ${dotClass}`} />
        {label}
      </div>

      <div className="relative flex-1 overflow-hidden">
        {items.length === 0 ? (
          <p className="py-2 text-center font-mono text-[11px] uppercase tracking-[0.25em] text-slate-600">
            {emptyMessage}
          </p>
        ) : (
          <div
            className={`flex w-max items-center gap-10 py-2 group-hover:[animation-play-state:paused] ${animationClass}`}
          >
            {doubled.map((item, i) => {
              const isUp = item.changePct >= 0
              return (
                <div
                  key={`${item.key}-${i}`}
                  className="flex shrink-0 items-baseline gap-2 whitespace-nowrap text-sm"
                >
                  <span className="font-mono text-xs font-semibold tracking-wide text-slate-100">
                    {item.symbol}
                  </span>
                  <span className="text-xs text-slate-600">{item.name}</span>
                  <span className="font-mono text-xs text-slate-300">{item.display}</span>
                  <span className={`font-mono text-xs font-semibold ${isUp ? 'text-up' : 'text-down'}`}>
                    {isUp ? '▲' : '▼'} {item.changeText}
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
  )
}

function TickerStrip() {
  const stockQuotes = useQuotes(STOCK_SYMBOLS, 3)
  const spx = useMarketQuote('sp500', 1)
  const macro = useMarketQuotes(MACRO_IDS)
  const { setStatus } = useFeedStatus()

  // The always-mounted stock row drives the global freshness indicator.
  useEffect(() => {
    setStatus(stockQuotes.status, stockQuotes.fetchedAt)
  }, [stockQuotes.status, stockQuotes.fetchedAt, setStatus])

  // Top row: S&P 500 (a market) leading the household-name stocks (tickers).
  const stockRow = useMemo<TickerItem[]>(() => {
    const rows: TickerItem[] = []
    if (spx.quote) {
      rows.push({
        key: 'sp500',
        symbol: 'SPX',
        name: 'S&P 500',
        display: formatPrice(spx.quote.price, 'Index'),
        changeText: `${Math.abs(spx.quote.changePct).toFixed(2)}%`,
        changePct: spx.quote.changePct,
      })
    }
    for (const company of TOP_COMPANIES) {
      const quote = stockQuotes.results[company.symbol]?.quote
      if (!quote) continue
      rows.push({
        key: company.symbol,
        symbol: company.symbol,
        name: company.name,
        display: `$${quote.price.toFixed(2)}`,
        changeText: `${Math.abs(quote.changePct).toFixed(2)}%`,
        changePct: quote.changePct,
      })
    }
    return rows
  }, [spx.quote, stockQuotes.results])

  // Bottom row: crypto, commodities, currencies and the yield curve.
  const macroRow = useMemo<TickerItem[]>(
    () =>
      MACRO_IDS.flatMap((id) => {
        const market = MARKET_SYMBOLS.find((m) => m.id === id)
        const quote = macro[id]?.quote
        if (!market || !quote) return []
        return [
          {
            key: id,
            symbol: market.symbol,
            name: market.name,
            display: formatPrice(quote.price, market.assetClass),
            changeText: formatChangeMagnitude(quote.previousClose, quote.price, market.assetClass),
            changePct: quote.changePct,
          },
        ]
      }),
    [macro],
  )

  const emptyMessage =
    stockQuotes.status === 'unavailable'
      ? "No numbers loaded yet — press \"Get today's update\" up top"
      : 'Tuning in…'

  return (
    <div className="relative divide-y divide-slate-400/10 border-b border-slate-400/10 bg-ink-900/70">
      <TickerRow
        items={stockRow}
        label="Watchlist"
        labelClass="text-amber-300/90"
        dotClass="bg-amber-400"
        animationClass="animate-ticker-fast"
        emptyMessage={emptyMessage}
      />
      <div className="bg-ink-950/40">
        <TickerRow
          items={macroRow}
          label="Macro"
          labelClass="text-sky-300/80"
          dotClass="bg-sky-400"
          animationClass="animate-ticker-slow"
          emptyMessage={emptyMessage}
        />
      </div>
    </div>
  )
}

export default TickerStrip
