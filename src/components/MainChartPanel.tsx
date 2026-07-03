import { useMemo, useState } from 'react'
import { MARKET_SYMBOLS, formatPrice, generateSeries, type RangeKey } from '../data/markets'
import ChartCanvas from './ChartCanvas'
import VolumeBars from './VolumeBars'
import TimeRangeSelector from './TimeRangeSelector'
import ChartTypeToggle, { type ChartType } from './ChartTypeToggle'
import InfoDisclosure from './InfoDisclosure'

interface MainChartPanelProps {
  selectedId: string
  onSelect: (id: string) => void
}

function MainChartPanel({ selectedId, onSelect }: MainChartPanelProps) {
  const [range, setRange] = useState<RangeKey>('3M')
  const [chartType, setChartType] = useState<ChartType>('line')

  const market = useMemo(
    () => MARKET_SYMBOLS.find((m) => m.id === selectedId) ?? MARKET_SYMBOLS[0],
    [selectedId],
  )
  const candles = useMemo(() => generateSeries(market, range), [market, range])
  const first = candles[0]
  const last = candles[candles.length - 1]
  const changePct = ((last.close - first.open) / first.open) * 100
  const isUp = changePct >= 0

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 shadow-xl sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {MARKET_SYMBOLS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelect(m.id)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors ${
                m.id === selectedId
                  ? 'border-sky-500/50 bg-sky-500/10 text-sky-300'
                  : 'border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              {m.symbol}
            </button>
          ))}
        </div>
        <ChartTypeToggle value={chartType} onChange={setChartType} />
      </div>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">{market.name}</h2>
          <div className="mt-1 flex items-baseline gap-3">
            <span className="font-mono text-3xl font-bold text-slate-50">
              {formatPrice(last.close, market.assetClass)}
            </span>
            <span
              className={`rounded-md px-2 py-0.5 font-mono text-sm font-semibold ${
                isUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
              }`}
            >
              {isUp ? '▲' : '▼'} {Math.abs(changePct).toFixed(2)}%
            </span>
          </div>
        </div>
        <TimeRangeSelector value={range} onChange={setRange} />
      </div>

      <div className="mt-6">
        <ChartCanvas candles={candles} type={chartType} />
      </div>

      <div className="mt-2">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-600">Volume</p>
        <VolumeBars candles={candles} />
      </div>

      <InfoDisclosure what={market.what} why={market.why} academyAnchor={market.academyAnchor} />
    </section>
  )
}

export default MainChartPanel
