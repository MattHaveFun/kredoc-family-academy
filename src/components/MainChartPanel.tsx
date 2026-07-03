import { useMemo, useState } from 'react'
import { MARKET_SYMBOLS, formatPrice, type RangeKey } from '../data/markets'
import { useSeries } from '../hooks/useSeries'
import { useCountUp } from '../hooks/useCountUp'
import { CHART_CONCEPTS } from '../data/concepts'
import ChartCanvas from './ChartCanvas'
import VolumeBars from './VolumeBars'
import TimeRangeSelector from './TimeRangeSelector'
import ChartTypeToggle, { type ChartType } from './ChartTypeToggle'
import InfoDisclosure from './InfoDisclosure'
import DataBadge from './DataBadge'
import ConceptDrawer from './ConceptDrawer'

interface MainChartPanelProps {
  selectedId: string
  onSelect: (id: string) => void
}

function formatVolume(v: number): string {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(2)}B`
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  return v.toLocaleString('en-US')
}

// OHLC stat cells double as teaching entry points — hover explains, click
// opens the deep-dive drawer.
const STAT_CONCEPT: Record<string, string | undefined> = {
  Open: 'open',
  High: 'high',
  Low: 'low',
  Close: 'close',
  Volume: 'volume',
  Range: undefined,
}

function MainChartPanel({ selectedId, onSelect }: MainChartPanelProps) {
  const [range, setRange] = useState<RangeKey>('3M')
  const [chartType, setChartType] = useState<ChartType>('line')
  const [conceptId, setConceptId] = useState<string | null>(null)

  const market = useMemo(
    () => MARKET_SYMBOLS.find((m) => m.id === selectedId) ?? MARKET_SYMBOLS[0],
    [selectedId],
  )
  const { candles, status, fetchedAt, proxyNote } = useSeries(market, range, 0)
  const hasData = candles.length >= 2
  const first = hasData ? candles[0] : null
  const last = hasData ? candles[candles.length - 1] : null
  const changePct = first && last ? ((last.close - first.open) / first.open) * 100 : 0
  const isUp = changePct >= 0
  const animatedPrice = useCountUp(last?.close ?? 0)

  const stats = useMemo(() => {
    if (!hasData || !first || !last) return null
    const high = Math.max(...candles.map((c) => c.high))
    const low = Math.min(...candles.map((c) => c.low))
    const totalVolume = candles.reduce((sum, c) => sum + c.volume, 0)
    return {
      totalVolume,
      cells: [
        { label: 'Open', value: formatPrice(first.open, market.assetClass) },
        { label: 'High', value: formatPrice(high, market.assetClass) },
        { label: 'Low', value: formatPrice(low, market.assetClass) },
        { label: 'Close', value: formatPrice(last.close, market.assetClass) },
        { label: 'Range', value: `${(((high - low) / low) * 100).toFixed(2)}%` },
        { label: 'Volume', value: totalVolume > 0 ? formatVolume(totalVolume) : '—' },
      ],
    }
  }, [candles, first, last, market, hasData])

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
              <DataBadge status={status} fetchedAt={fetchedAt} />
              {proxyNote && hasData && (
                <span
                  className="font-mono text-[10px] uppercase tracking-wider text-slate-500"
                  title="The raw index isn't on the free data plan, so a tracking ETF stands in — same shape, honest label."
                >
                  {proxyNote}
                </span>
              )}
            </div>
            {hasData && last ? (
              <div className="mt-2 flex flex-wrap items-baseline gap-3">
                <span
                  className={`font-mono text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl ${
                    isUp
                      ? '[text-shadow:0_0_32px_rgba(45,212,167,0.3)]'
                      : '[text-shadow:0_0_32px_rgba(255,107,127,0.3)]'
                  }`}
                >
                  {formatPrice(animatedPrice, market.assetClass)}
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
            ) : (
              <div className="mt-2 h-12 sm:h-[60px]" />
            )}
          </div>
          <TimeRangeSelector value={range} onChange={setRange} />
        </div>

        {hasData ? (
          <>
            {/* OHLC stat strip — hover teaches, click deep-dives */}
            {stats && (
              <dl className="mt-5 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-slate-400/10 bg-slate-400/10 sm:grid-cols-6">
                {stats.cells.map((cell) => {
                  const concept = STAT_CONCEPT[cell.label]
                  const inner = (
                    <>
                      <dt className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-600">
                        {cell.label}
                      </dt>
                      <dd className="mt-0.5 font-mono text-xs font-semibold tabular-nums text-slate-200 sm:text-sm">
                        {cell.value}
                      </dd>
                    </>
                  )
                  if (!concept) {
                    return (
                      <div key={cell.label} className="bg-ink-900/90 px-3 py-2.5">
                        {inner}
                      </div>
                    )
                  }
                  return (
                    <button
                      key={cell.label}
                      type="button"
                      onClick={() => setConceptId(concept)}
                      className="group/stat relative bg-ink-900/90 px-3 py-2.5 text-left transition-colors hover:bg-ink-850"
                    >
                      {inner}
                      <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-1 w-56 -translate-x-1/2 rounded-lg border border-slate-400/15 bg-ink-950/95 px-3 py-2 text-left text-[11px] font-normal normal-case leading-snug tracking-normal text-sky-200/90 opacity-0 shadow-xl backdrop-blur transition-opacity duration-200 group-hover/stat:opacity-100">
                        {CHART_CONCEPTS[concept]?.hover}
                        <span className="mt-1 block font-mono text-[9px] uppercase tracking-wider text-slate-500">
                          Click to learn more
                        </span>
                      </span>
                    </button>
                  )
                })}
              </dl>
            )}

            <div className="mt-5">
              <ChartCanvas candles={candles} type={chartType} onConceptSelect={setConceptId} />
            </div>

            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
                  Volume
                </p>
                {stats && stats.totalVolume > 0 && (
                  <p className="font-mono text-[10px] tabular-nums text-slate-600">
                    Σ {formatVolume(stats.totalVolume)}
                  </p>
                )}
              </div>
              <VolumeBars candles={candles} onConceptSelect={setConceptId} />
            </div>
          </>
        ) : (
          <div className="mt-6 flex h-[320px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-400/15 text-center sm:h-[420px]">
            {status === 'loading' ? (
              <>
                <span className="h-2 w-2 animate-ping rounded-full bg-sky-400" />
                <p className="font-mono text-xs uppercase tracking-[0.25em] text-slate-500">
                  Powering up the feed…
                </p>
                <p className="max-w-sm text-xs leading-relaxed text-slate-600">
                  First load can take a moment — the free data feed allows 8 requests per minute, so
                  panels fill in progressively.
                </p>
              </>
            ) : (
              <>
                <span className="text-2xl">☕</span>
                <p className="text-sm font-medium text-slate-300">
                  Live data is taking a break — check back in a few minutes.
                </p>
                <p className="max-w-sm text-xs leading-relaxed text-slate-600">
                  The chart will return automatically once the feed is reachable again.
                </p>
              </>
            )}
          </div>
        )}

        <InfoDisclosure what={market.what} why={market.why} academyAnchor={market.academyAnchor} />
      </div>

      <ConceptDrawer conceptId={conceptId} onClose={() => setConceptId(null)} />
    </section>
  )
}

export default MainChartPanel
