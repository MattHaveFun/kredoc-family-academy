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
              fill={up ? '#34d39955' : '#f8717155'}
            />
          )
        })}
      </svg>
    </div>
  )
}

export default VolumeBars
