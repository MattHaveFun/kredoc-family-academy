import type { Candle } from '../data/markets'

// Shared chart geometry for the Order Desk's two panels. Both draw the same
// price line over the same window, so the scales live here rather than being
// derived twice and drifting apart.

export const W = 720
export const H = 250
export const PAD_L = 8
/** Right padding leaves room for the level labels ("stop", "limit", "avg"). */
export const PAD_R = 58
export const PAD_T = 14
export const PAD_B = 20

export interface ChartGeometry {
  /** Candle index → x. */
  x: (i: number) => number
  /** Price → y. */
  y: (v: number) => number
  /** Closing-price polyline points. */
  line: string
  /** Filled area under the line. */
  area: string
}

/**
 * Build the scales and paths for a candle window. `extraLevels` are prices that
 * must stay inside the y-domain — trigger lines would otherwise be drawn off
 * canvas when the reader drags a slider past the year's range.
 */
export function buildChartGeometry(candles: Candle[], extraLevels: number[] = []): ChartGeometry {
  const lo = Math.min(...candles.map((c) => c.low), ...extraLevels)
  const hi = Math.max(...candles.map((c) => c.high), ...extraLevels)
  const span = hi - lo || 1
  const x = (i: number) => PAD_L + (i / (candles.length - 1)) * (W - PAD_L - PAD_R)
  const y = (v: number) => PAD_T + (1 - (v - lo) / span) * (H - PAD_T - PAD_B)
  const points = candles.map((c, i) => `${x(i).toFixed(1)},${y(c.close).toFixed(1)}`)
  const line = points.join(' ')
  const bottom = (H - PAD_B).toFixed(1)
  const area = `M ${x(0).toFixed(1)} ${bottom} L ${points.join(' L ')} L ${x(candles.length - 1).toFixed(1)} ${bottom} Z`
  return { x, y, line, area }
}

/** Short date for a candle index, e.g. "Aug 1, 25". */
export function shortDate(candles: Candle[], i: number): string {
  return new Date(candles[i].time * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: '2-digit',
  })
}
