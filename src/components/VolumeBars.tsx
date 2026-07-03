import { useMemo, useState } from 'react'
import type { Candle } from '../data/markets'

interface VolumeBarsProps {
  candles: Candle[]
  /** When provided, hovering teaches and clicking opens the volume deep-dive. */
  onConceptSelect?: (conceptId: string) => void
}

const WIDTH = 1000
const HEIGHT = 72

function formatShares(v: number): string {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(2)}B`
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`
  return v.toLocaleString('en-US')
}

function VolumeBars({ candles, onConceptSelect }: VolumeBarsProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const maxVolume = useMemo(() => Math.max(1, ...candles.map((c) => c.volume)), [candles])
  const barWidth = Math.max((WIDTH / candles.length) * 0.6, 1)
  const teachable = onConceptSelect !== undefined
  const hovered = hoverIndex !== null ? candles[hoverIndex] : null

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-[56px] w-full"
        preserveAspectRatio="none"
        onMouseLeave={() => setHoverIndex(null)}
      >
        <g key={`${candles[0]?.time ?? 0}-${candles.length}`} className="animate-fade-in">
          {candles.map((c, i) => {
            const up = c.close >= c.open
            const x = (i / Math.max(candles.length - 1, 1)) * WIDTH
            const h = (c.volume / maxVolume) * HEIGHT
            return (
              <rect
                key={c.time}
                x={x - barWidth / 2}
                y={HEIGHT - h}
                width={barWidth}
                height={h}
                fill={
                  hoverIndex === i
                    ? up
                      ? 'rgba(45, 212, 167, 0.7)'
                      : 'rgba(255, 107, 127, 0.7)'
                    : up
                      ? 'rgba(45, 212, 167, 0.35)'
                      : 'rgba(255, 107, 127, 0.35)'
                }
              />
            )
          })}
        </g>
        {/* full-height hover/click targets */}
        {candles.map((c, i) => (
          <rect
            key={`hit-${c.time}`}
            x={(i / Math.max(candles.length - 1, 1)) * WIDTH - WIDTH / candles.length / 2}
            y={0}
            width={WIDTH / candles.length}
            height={HEIGHT}
            fill="transparent"
            style={teachable ? { cursor: 'pointer' } : undefined}
            onMouseEnter={() => setHoverIndex(i)}
            onClick={teachable ? () => onConceptSelect('volume') : undefined}
          />
        ))}
        <line
          x1={0}
          x2={WIDTH}
          y1={HEIGHT - 0.5}
          y2={HEIGHT - 0.5}
          stroke="rgba(148, 163, 184, 0.12)"
          strokeWidth={1}
        />
      </svg>

      {hovered && (
        <div
          className={`pointer-events-none absolute bottom-full z-10 mb-1 max-w-[240px] rounded-lg border border-slate-400/15 bg-ink-950/95 px-3 py-2 text-[11px] leading-snug shadow-xl backdrop-blur ${
            hoverIndex !== null && hoverIndex > candles.length / 2 ? 'left-2' : 'right-2'
          }`}
        >
          <span className="font-mono font-semibold text-slate-200">
            VOLUME: {hovered.volume > 0 ? formatShares(hovered.volume) : 'not reported'}
          </span>
          <span className="mt-0.5 block text-sky-200/90">
            {hovered.volume > 0
              ? 'High volume on a price move = more conviction. Low volume = take it with a grain of salt.'
              : 'Index feeds often report no volume — check an ETF that tracks it (like SPY) for the real crowd size.'}
          </span>
          {teachable && (
            <span className="mt-1 block font-mono text-[9px] uppercase tracking-wider text-slate-500">
              Click to learn more
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default VolumeBars
