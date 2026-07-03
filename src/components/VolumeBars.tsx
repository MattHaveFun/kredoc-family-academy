import { useMemo } from 'react'
import type { Candle } from '../data/markets'

interface VolumeBarsProps {
  candles: Candle[]
}

const WIDTH = 1000
const HEIGHT = 72

function VolumeBars({ candles }: VolumeBarsProps) {
  const maxVolume = useMemo(() => Math.max(1, ...candles.map((c) => c.volume)), [candles])
  const barWidth = Math.max((WIDTH / candles.length) * 0.6, 1)

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-[56px] w-full" preserveAspectRatio="none">
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
                fill={up ? 'rgba(45, 212, 167, 0.35)' : 'rgba(255, 107, 127, 0.35)'}
              />
            )
          })}
        </g>
        <line
          x1={0}
          x2={WIDTH}
          y1={HEIGHT - 0.5}
          y2={HEIGHT - 0.5}
          stroke="rgba(148, 163, 184, 0.12)"
          strokeWidth={1}
        />
      </svg>
    </div>
  )
}

export default VolumeBars
