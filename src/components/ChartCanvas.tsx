import { useMemo, useState } from 'react'
import type { Candle } from '../data/markets'

interface ChartCanvasProps {
  candles: Candle[]
  type: 'line' | 'candlestick'
  positiveColor?: string
  negativeColor?: string
}

const WIDTH = 1000
const HEIGHT = 360
const PADDING = { top: 16, right: 8, bottom: 16, left: 8 }
const GRID_FRACTIONS = [0, 0.25, 0.5, 0.75, 1]

function ChartCanvas({
  candles,
  type,
  positiveColor = '#2dd4a7',
  negativeColor = '#ff6b7f',
}: ChartCanvasProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  const { min, max } = useMemo(() => {
    let lo = Infinity
    let hi = -Infinity
    for (const c of candles) {
      lo = Math.min(lo, c.low)
      hi = Math.max(hi, c.high)
    }
    const pad = (hi - lo) * 0.08 || hi * 0.01
    return { min: lo - pad, max: hi + pad }
  }, [candles])

  const plotWidth = WIDTH - PADDING.left - PADDING.right
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom

  const xFor = (i: number) =>
    PADDING.left + (candles.length <= 1 ? plotWidth / 2 : (i / (candles.length - 1)) * plotWidth)
  const yFor = (value: number) =>
    PADDING.top + plotHeight - ((value - min) / (max - min || 1)) * plotHeight

  const linePath = useMemo(() => {
    return candles
      .map((c, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i).toFixed(2)} ${yFor(c.close).toFixed(2)}`)
      .join(' ')
  }, [candles, min, max])

  const areaPath = useMemo(() => {
    if (candles.length === 0) return ''
    const top = candles
      .map((c, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i).toFixed(2)} ${yFor(c.close).toFixed(2)}`)
      .join(' ')
    const bottomRight = `L ${xFor(candles.length - 1).toFixed(2)} ${HEIGHT - PADDING.bottom}`
    const bottomLeft = `L ${xFor(0).toFixed(2)} ${HEIGHT - PADDING.bottom} Z`
    return `${top} ${bottomRight} ${bottomLeft}`
  }, [candles, min, max])

  const first = candles[0]
  const last = candles[candles.length - 1]
  const overallUp = candles.length > 1 && last.close >= first.close
  const lineColor = overallUp ? positiveColor : negativeColor

  const candleWidth = Math.max((plotWidth / candles.length) * 0.6, 1.5)
  const hovered = hoverIndex !== null ? candles[hoverIndex] : null

  // Remounting the series layers on data change replays the draw/fade animations.
  const seriesKey = `${type}-${first?.time ?? 0}-${last?.close.toFixed(4) ?? 0}`

  const spanSec = candles.length > 1 ? last.time - first.time : 0
  const intraday = spanSec > 0 && spanSec < 172_800

  const axisTimes = useMemo(() => {
    if (candles.length < 2) return []
    const count = 4
    return Array.from(
      { length: count },
      (_, i) => candles[Math.round((i / (count - 1)) * (candles.length - 1))].time,
    )
  }, [candles])

  const formatAxisTime = (t: number) =>
    intraday
      ? new Date(t * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      : new Date(t * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  const formatAxisPrice = (v: number) =>
    v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const hoveredChangePct = hovered ? ((hovered.close - hovered.open) / hovered.open) * 100 : 0

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-[280px] w-full sm:h-[360px]"
        preserveAspectRatio="none"
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity={0.28} />
            <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
          </linearGradient>
          <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>

        {/* horizontal gridlines */}
        {GRID_FRACTIONS.map((f) => (
          <line
            key={f}
            x1={PADDING.left}
            x2={WIDTH - PADDING.right}
            y1={PADDING.top + plotHeight * f}
            y2={PADDING.top + plotHeight * f}
            stroke="rgba(148, 163, 184, 0.09)"
            strokeWidth={1}
          />
        ))}

        {type === 'line' ? (
          <g key={seriesKey}>
            <path d={areaPath} fill="url(#areaFill)" stroke="none" className="animate-fade-in" />
            <path
              d={linePath}
              fill="none"
              stroke={lineColor}
              strokeWidth={6}
              strokeOpacity={0.28}
              strokeLinejoin="round"
              strokeLinecap="round"
              filter="url(#lineGlow)"
              pathLength={1}
              strokeDasharray="1"
              className="animate-draw"
            />
            <path
              d={linePath}
              fill="none"
              stroke={lineColor}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="1"
              className="animate-draw"
            />
          </g>
        ) : (
          <g key={seriesKey} className="animate-fade-in">
            {candles.map((c, i) => {
              const up = c.close >= c.open
              const color = up ? positiveColor : negativeColor
              const x = xFor(i)
              return (
                <g key={c.time}>
                  <line
                    x1={x}
                    x2={x}
                    y1={yFor(c.high)}
                    y2={yFor(c.low)}
                    stroke={color}
                    strokeWidth={1.2}
                    strokeOpacity={0.85}
                  />
                  <rect
                    x={x - candleWidth / 2}
                    y={Math.min(yFor(c.open), yFor(c.close))}
                    width={candleWidth}
                    height={Math.max(Math.abs(yFor(c.open) - yFor(c.close)), 1)}
                    fill={color}
                  />
                </g>
              )
            })}
          </g>
        )}

        {/* last price reference line */}
        {last && (
          <line
            x1={PADDING.left}
            x2={WIDTH - PADDING.right}
            y1={yFor(last.close)}
            y2={yFor(last.close)}
            stroke={lineColor}
            strokeOpacity={0.35}
            strokeWidth={1}
            strokeDasharray="2 4"
          />
        )}

        {/* hover targets */}
        {candles.map((c, i) => (
          <rect
            key={`hover-${c.time}`}
            x={xFor(i) - plotWidth / candles.length / 2}
            y={0}
            width={plotWidth / candles.length}
            height={HEIGHT}
            fill="transparent"
            onMouseEnter={() => setHoverIndex(i)}
          />
        ))}

        {/* crosshair */}
        {hoverIndex !== null && hovered && (
          <>
            <line
              x1={xFor(hoverIndex)}
              x2={xFor(hoverIndex)}
              y1={PADDING.top}
              y2={HEIGHT - PADDING.bottom}
              stroke="rgba(148, 163, 184, 0.35)"
              strokeDasharray="3 3"
              strokeWidth={1}
            />
            <line
              x1={PADDING.left}
              x2={WIDTH - PADDING.right}
              y1={yFor(hovered.close)}
              y2={yFor(hovered.close)}
              stroke="rgba(148, 163, 184, 0.25)"
              strokeDasharray="3 3"
              strokeWidth={1}
            />
          </>
        )}
      </svg>

      {/* price axis labels (HTML so they don't stretch with the SVG) */}
      {GRID_FRACTIONS.map((f) => (
        <span
          key={`axis-${f}`}
          className="pointer-events-none absolute right-1 -translate-y-1/2 font-mono text-[10px] tabular-nums text-slate-600"
          style={{ top: `${((PADDING.top + plotHeight * f) / HEIGHT) * 100}%` }}
        >
          {formatAxisPrice(max - (max - min) * f)}
        </span>
      ))}

      {/* live pulse on the latest price */}
      {last && (
        <span
          className="pointer-events-none absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${(xFor(candles.length - 1) / WIDTH) * 100}%`,
            top: `${(yFor(last.close) / HEIGHT) * 100}%`,
          }}
        >
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-50"
            style={{ backgroundColor: lineColor }}
          />
          <span
            className="relative block h-2 w-2 rounded-full"
            style={{ backgroundColor: lineColor, boxShadow: `0 0 12px ${lineColor}` }}
          />
        </span>
      )}

      {/* crosshair dot (HTML so it stays round) */}
      {hoverIndex !== null && hovered && (
        <span
          className="pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-ink-950"
          style={{
            left: `${(xFor(hoverIndex) / WIDTH) * 100}%`,
            top: `${(yFor(hovered.close) / HEIGHT) * 100}%`,
            backgroundColor: hovered.close >= hovered.open ? positiveColor : negativeColor,
          }}
        />
      )}

      {/* OHLC readout */}
      {hovered && (
        <div
          className={`pointer-events-none absolute top-2 z-10 rounded-lg border border-slate-400/15 bg-ink-950/95 px-3 py-2 font-mono text-[11px] shadow-xl backdrop-blur ${
            hoverIndex !== null && hoverIndex > candles.length / 2 ? 'left-2' : 'right-12'
          }`}
        >
          <div className="text-[10px] uppercase tracking-wider text-slate-500">
            {new Date(hovered.time * 1000).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
          <div className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-0.5 tabular-nums">
            <span className="text-slate-500">
              O <span className="text-slate-200">{hovered.open.toFixed(2)}</span>
            </span>
            <span className="text-slate-500">
              H <span className="text-slate-200">{hovered.high.toFixed(2)}</span>
            </span>
            <span className="text-slate-500">
              L <span className="text-slate-200">{hovered.low.toFixed(2)}</span>
            </span>
            <span className="text-slate-500">
              C <span className="text-slate-200">{hovered.close.toFixed(2)}</span>
            </span>
          </div>
          <div
            className={`mt-1 font-semibold ${hoveredChangePct >= 0 ? 'text-up' : 'text-down'}`}
          >
            {hoveredChangePct >= 0 ? '▲' : '▼'} {Math.abs(hoveredChangePct).toFixed(2)}%
          </div>
        </div>
      )}

      {/* time axis */}
      {axisTimes.length > 0 && (
        <div className="mt-1.5 flex justify-between px-1 font-mono text-[10px] uppercase tracking-wider text-slate-600">
          {axisTimes.map((t, i) => (
            <span key={`${t}-${i}`}>{formatAxisTime(t)}</span>
          ))}
        </div>
      )}
    </div>
  )
}

export default ChartCanvas
