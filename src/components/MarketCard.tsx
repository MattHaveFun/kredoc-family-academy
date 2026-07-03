import { useMemo } from 'react'
import { formatPrice, type MarketSymbol } from '../data/markets'
import { useLiveSeries } from '../hooks/useLiveSeries'
import InfoDisclosure from './InfoDisclosure'

interface MarketCardProps {
  market: MarketSymbol
  selected: boolean
  onSelect: () => void
  index: number
}

const SPARK_W = 100
const SPARK_H = 40

const STATUS_DOT: Record<string, string> = {
  live: 'bg-up',
  sim: 'bg-amber-400',
  connecting: 'bg-slate-600',
}

function MarketCard({ market, selected, onSelect, index }: MarketCardProps) {
  const { candles, status } = useLiveSeries(market, '1M')
  const first = candles[0]
  const last = candles[candles.length - 1]
  const changePct = ((last.close - first.open) / first.open) * 100
  const isUp = changePct >= 0
  const color = isUp ? '#2dd4a7' : '#ff6b7f'

  const { linePoints, areaPath } = useMemo(() => {
    const lo = Math.min(...candles.map((c) => c.low))
    const hi = Math.max(...candles.map((c) => c.high))
    const pts = candles.map((c, i) => {
      const x = (i / (candles.length - 1)) * SPARK_W
      const y = SPARK_H - 4 - ((c.close - lo) / (hi - lo || 1)) * (SPARK_H - 8)
      return [x, y] as const
    })
    const line = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
    const area = `M ${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L ')} L ${SPARK_W} ${SPARK_H} L 0 ${SPARK_H} Z`
    return { linePoints: line, areaPath: area }
  }, [candles])

  return (
    <div
      className={`group panel animate-fade-up overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
        selected ? '!border-sky-400/40 shadow-glow-accent' : 'hover:border-slate-400/20 hover:shadow-card'
      }`}
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <button type="button" onClick={onSelect} className="w-full text-left">
        <div className="flex items-start justify-between gap-2 px-4 pt-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold tracking-wide text-sky-400/90">
                {market.symbol}
              </span>
              <span
                className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status]}`}
                aria-hidden
              />
              <span className="sr-only">
                {status === 'live' ? 'Live data' : status === 'sim' ? 'Simulated data' : 'Connecting'}
              </span>
              <span className="chip">{market.assetClass}</span>
            </div>
            <h3 className="mt-1 text-sm font-semibold text-slate-200">{market.name}</h3>
          </div>
          {selected && (
            <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-sky-400/25 bg-sky-400/10 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-sky-300">
              <span className="h-1 w-1 animate-blink rounded-full bg-sky-300" />
              On chart
            </span>
          )}
        </div>

        <div className="mt-3 flex items-end justify-between gap-2 px-4">
          <span className="font-mono text-2xl font-semibold tracking-tight text-slate-50">
            {formatPrice(last.close, market.assetClass)}
          </span>
          <span
            className={`rounded-md px-2 py-1 font-mono text-sm font-semibold ${
              isUp
                ? 'bg-up/10 text-up ring-1 ring-inset ring-up/20'
                : 'bg-down/10 text-down ring-1 ring-inset ring-down/20'
            }`}
          >
            {isUp ? '▲' : '▼'} {Math.abs(changePct).toFixed(2)}%
          </span>
        </div>
        <p className="mt-1 px-4 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-600">
          Past month
        </p>

        <div className="mt-3 h-14 w-full">
          <svg
            viewBox={`0 0 ${SPARK_W} ${SPARK_H}`}
            className="h-full w-full"
            preserveAspectRatio="none"
            aria-hidden
          >
            <defs>
              <linearGradient id={`spark-${market.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <path d={areaPath} fill={`url(#spark-${market.id})`} />
            <polyline
              points={linePoints}
              fill="none"
              stroke={color}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      </button>

      <div className="px-4 pb-4">
        <InfoDisclosure what={market.what} why={market.why} academyAnchor={market.academyAnchor} />
      </div>
    </div>
  )
}

export default MarketCard
