import { useMemo } from 'react'
import { formatPrice, generateSeries, type MarketSymbol } from '../data/markets'
import InfoDisclosure from './InfoDisclosure'

interface MarketCardProps {
  market: MarketSymbol
  selected: boolean
  onSelect: () => void
}

function MarketCard({ market, selected, onSelect }: MarketCardProps) {
  const candles = useMemo(() => generateSeries(market, '1M'), [market])
  const first = candles[0]
  const last = candles[candles.length - 1]
  const changePct = ((last.close - first.open) / first.open) * 100
  const isUp = changePct >= 0

  const sparklinePoints = useMemo(() => {
    const lo = Math.min(...candles.map((c) => c.low))
    const hi = Math.max(...candles.map((c) => c.high))
    return candles
      .map((c, i) => {
        const x = (i / (candles.length - 1)) * 100
        const y = 32 - ((c.close - lo) / (hi - lo || 1)) * 32
        return `${x.toFixed(1)},${y.toFixed(1)}`
      })
      .join(' ')
  }, [candles])

  return (
    <div
      className={`rounded-xl border bg-slate-900/60 p-4 shadow-lg backdrop-blur transition-colors ${
        selected ? 'border-sky-500/60 ring-1 ring-sky-500/40' : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      <button type="button" onClick={onSelect} className="w-full text-left">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{market.assetClass}</p>
            <h3 className="text-base font-semibold text-slate-100">{market.name}</h3>
            <p className="font-mono text-xs text-slate-500">{market.symbol}</p>
          </div>
          <svg viewBox="0 0 100 32" className="h-8 w-20 shrink-0">
            <polyline
              points={sparklinePoints}
              fill="none"
              stroke={isUp ? '#34d399' : '#f87171'}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="mt-3 flex items-end justify-between">
          <span className="font-mono text-2xl font-semibold text-slate-50">
            {formatPrice(last.close, market.assetClass)}
          </span>
          <span
            className={`rounded-md px-2 py-1 font-mono text-sm font-semibold ${
              isUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
            }`}
          >
            {isUp ? '▲' : '▼'} {Math.abs(changePct).toFixed(2)}%
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500">Past month</p>
      </button>

      <InfoDisclosure what={market.what} why={market.why} academyAnchor={market.academyAnchor} />
    </div>
  )
}

export default MarketCard
