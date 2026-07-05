import { useMemo } from 'react'
import { useMarketQuotes } from '../hooks/useMarketQuotes'
import InfoDisclosure from './InfoDisclosure'
import DataBadge from './DataBadge'

// The three points that define the curve's shape, short end to long end.
const POINTS = [
  { id: 'ust2y', label: '2Y' },
  { id: 'tnx', label: '10Y' },
  { id: 'ust30y', label: '30Y' },
]

const VB_W = 300
const VB_H = 150
const PAD_X = 34
const PAD_TOP = 22
const PAD_BOTTOM = 30

function YieldCurvePanel() {
  const quotes = useMarketQuotes(POINTS.map((p) => p.id))

  const status = quotes['tnx']?.status ?? 'unavailable'
  const fetchedAt = quotes['tnx']?.fetchedAt ?? null

  const data = useMemo(() => {
    const yields = POINTS.map((p) => ({ ...p, value: quotes[p.id]?.quote?.price ?? null }))
    if (yields.some((y) => y.value == null)) return null
    const values = yields.map((y) => y.value as number)
    const lo = Math.min(...values)
    const hi = Math.max(...values)
    const span = hi - lo || 1
    // Pad the y-range a touch so the line never hugs the frame edges.
    const yLo = lo - span * 0.25
    const yHi = hi + span * 0.25
    const pts = yields.map((y, i) => {
      const x = PAD_X + (i / (yields.length - 1)) * (VB_W - PAD_X * 2)
      const yy = PAD_TOP + (1 - ((y.value as number) - yLo) / (yHi - yLo)) * (VB_H - PAD_TOP - PAD_BOTTOM)
      return { ...y, x, y: yy }
    })
    const two = values[0]
    const ten = values[1]
    const inverted = two > ten
    const spreadBps = Math.round((ten - two) * 100) // 2s10s spread, in basis points
    return { pts, inverted, spreadBps }
  }, [quotes])

  const color = data?.inverted ? '#ff6b7f' : '#2dd4a7'

  return (
    <section className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-400/10 bg-ink-950/50 px-5 py-3.5">
        <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
          Yield curve
        </h2>
        <DataBadge status={status} fetchedAt={fetchedAt} compact />
      </div>

      <div className="p-4 sm:p-5">
        {data ? (
          <>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-600">
                  2s10s spread
                </p>
                <p
                  className={`mt-0.5 font-mono text-lg font-semibold tabular-nums ${
                    data.inverted ? 'text-down' : 'text-up'
                  }`}
                >
                  {data.spreadBps >= 0 ? '+' : ''}
                  {data.spreadBps} bps
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[9px] font-semibold uppercase tracking-wider ${
                  data.inverted
                    ? 'border-down/30 bg-down/10 text-down'
                    : 'border-up/25 bg-up/10 text-up'
                }`}
              >
                <span className={`h-1 w-1 rounded-full ${data.inverted ? 'bg-down' : 'bg-up'}`} />
                {data.inverted ? 'Inverted' : 'Normal'}
              </span>
            </div>

            <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="mt-3 h-40 w-full" aria-hidden>
              <polyline
                points={data.pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}
                fill="none"
                stroke={color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {data.pts.map((p) => (
                <g key={p.id}>
                  <circle cx={p.x} cy={p.y} r={3.5} fill={color} />
                  <text
                    x={p.x}
                    y={p.y - 9}
                    textAnchor="middle"
                    fill="#e2e8f0"
                    fontSize={11}
                    fontFamily="monospace"
                    fontWeight={600}
                  >
                    {(p.value as number).toFixed(2)}%
                  </text>
                  <text
                    x={p.x}
                    y={VB_H - 8}
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize={10}
                    fontFamily="monospace"
                  >
                    {p.label}
                  </text>
                </g>
              ))}
            </svg>

            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              {data.inverted
                ? 'Short-term yields sit above long-term — an inversion. Historically it has preceded most U.S. recessions by 12–18 months (a tendency, not a promise).'
                : 'Longer bonds pay more than shorter ones — the normal, healthy shape investors expect when the economy is expected to keep growing.'}
            </p>
          </>
        ) : (
          <div className="flex h-52 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-400/15 text-center">
            {status === 'loading' ? (
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-slate-600">
                Plotting the curve…
              </p>
            ) : (
              <p className="max-w-xs px-4 text-xs leading-relaxed text-slate-500">
                No numbers loaded yet — press "Get today's update" up top to draw the 2Y / 10Y / 30Y
                curve.
              </p>
            )}
          </div>
        )}

        <InfoDisclosure
          what="A snapshot of what the U.S. government pays to borrow across three maturities — 2, 10, and 30 years — drawn as one line. Its shape is a live read on where investors think the economy is headed."
          why="When the short end rises above the long end (an 'inversion'), it has front-run nearly every modern U.S. recession. It's the single most-watched warning signal in all of markets — and now you can read it yourself."
          academyAnchor="yieldcurve"
        />
      </div>
    </section>
  )
}

export default YieldCurvePanel
