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

function ChartCanvas({
  candles,
  type,
  positiveColor = '#34d399',
  negativeColor = '#f87171',
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

  const overallUp = candles.length > 1 && candles[candles.length - 1].close >= candles[0].close
  const lineColor = overallUp ? positiveColor : negativeColor

  const candleWidth = Math.max((plotWidth / candles.length) * 0.6, 1.5)
  const hovered = hoverIndex !== null ? candles[hoverIndex] : null

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-[280px] w-full sm:h-[360px]"
        preserveAspectRatio="none"
        onMouseLeave={() => setHoverIndex(null)}
      >
        {/* horizontal gridlines */}
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={PADDING.left}
            x2={WIDTH - PADDING.right}
            y1={PADDING.top + plotHeight * f}
            y2={PADDING.top + plotHeight * f}
            stroke="#1e293b"
            strokeWidth={1}
          />
        ))}

        {type === 'line' ? (
          <>
            <defs>
              <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={lineColor} stopOpacity={0.25} />
                <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <path d={areaPath} fill="url(#areaFill)" stroke="none" />
            <path d={linePath} fill="none" stroke={lineColor} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          </>
        ) : (
          candles.map((c, i) => {
            const up = c.close >= c.open
            const color = up ? positiveColor : negativeColor
            const x = xFor(i)
            return (
              <g key={c.time}>
                <line x1={x} x2={x} y1={yFor(c.high)} y2={yFor(c.low)} stroke={color} strokeWidth={1} />
                <rect
                  x={x - candleWidth / 2}
                  y={Math.min(yFor(c.open), yFor(c.close))}
                  width={candleWidth}
                  height={Math.max(Math.abs(yFor(c.open) - yFor(c.close)), 1)}
                  fill={color}
                />
              </g>
            )
          })
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

        {hoverIndex !== null && (
          <line
            x1={xFor(hoverIndex)}
            x2={xFor(hoverIndex)}
            y1={PADDING.top}
            y2={HEIGHT - PADDING.bottom}
            stroke="#475569"
            strokeDasharray="3 3"
            strokeWidth={1}
          />
        )}
      </svg>

      {hovered && (
        <div className="pointer-events-none absolute left-2 top-1 rounded-md border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs text-slate-300 shadow-lg backdrop-blur">
          <div className="text-slate-500">
            {new Date(hovered.time * 1000).toLocaleString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
          <div className="mt-0.5 flex gap-3 font-mono">
            <span>O {hovered.open.toFixed(2)}</span>
            <span>H {hovered.high.toFixed(2)}</span>
            <span>L {hovered.low.toFixed(2)}</span>
            <span>C {hovered.close.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChartCanvas
