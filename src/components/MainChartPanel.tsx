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

function formatVolume(v: number): string {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(2)}B`
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  return v.toLocaleString('en-US')
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

  const stats = useMemo(() => {
    const high = Math.max(...candles.map((c) => c.high))
    const low = Math.min(...candles.map((c) => c.low))
    const totalVolume = candles.reduce((sum, c) => sum + c.volume, 0)
    return {
      high,
      low,
      totalVolume,
      cells: [
        { label: 'Open', value: formatPrice(first.open, market.assetClass) },
        { label: 'High', value: formatPrice(high, market.assetClass) },
        { label: 'Low', value: formatPrice(low, market.assetClass) },
        { label: 'Close', value: formatPrice(last.close, market.assetClass) },
        { label: 'Range', value: `${(((high - low) / low) * 100).toFixed(2)}%` },
        { label: 'Volume', value: formatVolume(totalVolume) },
      ],
    }
  }, [candles, first, last, market])

  return (
    <section className="panel animate-fade-up overflow-hidden">
      {/* console toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-400/10 bg-ink-950/50 px-4 py-3 sm:px-5">
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
          {MARKET_SYMBOLS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelect(m.id)}
              className={`shrink-0 rounded-lg border px-3 py-1.5 font-mono text-xs font-semibold tracking-wide transition-all duration-200 ${
                m.id === selectedId
                  ? 'border-sky-400/40 bg-sky-400/10 text-sky-300 shadow-[0_0_20px_-6px_rgba(56,189,248,0.6)]'
                  : 'border-transparent text-slate-500 hover:border-slate-400/15 hover:bg-slate-400/5 hover:text-slate-200'
              }`}
            >
              {m.symbol}
            </button>
          ))}
        </div>
        <ChartTypeToggle value={chartType} onChange={setChartType} />
      </div>

      <div className="p-4 sm:p-6">
        {/* price readout */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="font-display text-lg font-semibold text-slate-100">{market.name}</h2>
              <span className="chip">{market.assetClass}</span>
            </div>
            <div className="mt-2 flex flex-wrap items-baseline gap-3">
              <span
                key={`${market.id}-${range}`}
                className={`animate-fade-in font-mono text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl ${
                  isUp
                    ? '[text-shadow:0_0_32px_rgba(45,212,167,0.3)]'
                    : '[text-shadow:0_0_32px_rgba(255,107,127,0.3)]'
                }`}
              >
                {formatPrice(last.close, market.assetClass)}
              </span>
              <span
                className={`rounded-md px-2 py-0.5 font-mono text-sm font-semibold ${
                  isUp
                    ? 'bg-up/10 text-up ring-1 ring-inset ring-up/20'
                    : 'bg-down/10 text-down ring-1 ring-inset ring-down/20'
                }`}
              >
                {isUp ? '▲' : '▼'} {Math.abs(changePct).toFixed(2)}%
              </span>
              <span className="font-mono text-[11px] uppercase tracking-wider text-slate-600">
                {range} change
              </span>
            </div>
          </div>
          <TimeRangeSelector value={range} onChange={setRange} />
        </div>

        {/* OHLC stat strip */}
        <dl className="mt-5 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-slate-400/10 bg-slate-400/10 sm:grid-cols-6">
          {stats.cells.map((cell) => (
            <div key={cell.label} className="bg-ink-900/90 px-3 py-2.5">
              <dt className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-600">
                {cell.label}
              </dt>
              <dd className="mt-0.5 font-mono text-xs font-semibold tabular-nums text-slate-200 sm:text-sm">
                {cell.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-5">
          <ChartCanvas candles={candles} type={chartType} />
        </div>

        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
              Volume
            </p>
            <p className="font-mono text-[10px] tabular-nums text-slate-600">
              Σ {formatVolume(stats.totalVolume)}
            </p>
          </div>
          <VolumeBars candles={candles} />
        </div>

        <InfoDisclosure what={market.what} why={market.why} academyAnchor={market.academyAnchor} />
      </div>
    </section>
  )
}

export default MainChartPanel
