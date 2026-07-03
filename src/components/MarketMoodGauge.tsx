import { useEffect, useMemo, useState } from 'react'
import { MARKET_SYMBOLS } from '../data/markets'
import { SECTORS } from '../data/sectors'
import { useQuotes } from '../hooks/useQuotes'
import { useSeries } from '../hooks/useSeries'
import { useMarketQuote } from '../hooks/useMarketQuote'

// One number for "how does the market feel today," blended from three real
// signals:
//   40% — VIX level (the price of fear itself)
//   30% — S&P 500 momentum vs. its 20-day moving average
//   30% — breadth: how many of the 11 sectors are green (an advance/decline
//         approximation that reuses the heat map's quotes at zero credit cost)
// Each signal maps to 0–100 (0 = panic, 100 = euphoria). The VIX component
// only participates when the TRUE VIX level is available — a futures-ETF
// proxy's price doesn't live on the same 12–40 scale, so the weights simply
// renormalize without it.

const SECTOR_ETFS = SECTORS.map((s) => s.etf)
const SP500 = MARKET_SYMBOLS.find((m) => m.id === 'sp500')!

const MOOD_LABELS = [
  { min: 85, label: 'EUPHORIC' },
  { min: 70, label: 'GREEDY' },
  { min: 55, label: 'CONFIDENT' },
  { min: 45, label: 'NEUTRAL' },
  { min: 30, label: 'CAUTIOUS' },
  { min: 15, label: 'FEARFUL' },
  { min: 0, label: 'PANIC' },
]

function moodLabel(score: number): string {
  return MOOD_LABELS.find((m) => score >= m.min)?.label ?? 'NEUTRAL'
}

// red → yellow → green across the score range
function moodColor(score: number): string {
  const t = Math.max(0, Math.min(score / 100, 1))
  const hue = t * 130 // 0 = red, 130 ≈ green
  return `hsl(${hue}, 75%, 55%)`
}

const clamp01 = (v: number) => Math.max(0, Math.min(v, 1))

function MarketMoodGauge() {
  const vixQuote = useMarketQuote('vix', 4)
  const { results: sectorResults } = useQuotes(SECTOR_ETFS, 4)
  const spx = useSeries(SP500, '3M', 4) // shares the main chart's default cache — usually zero extra credits

  const score = useMemo(() => {
    const parts: Array<{ weight: number; value: number }> = []

    // Only the genuine VIX level fits the panic/euphoria thresholds.
    const vix = vixQuote.proxyNote === null ? vixQuote.quote?.price : undefined
    if (vix !== undefined) {
      // VIX 12 or below → calm (100); VIX 40+ → panic (0)
      parts.push({ weight: 0.4, value: clamp01((40 - vix) / 28) * 100 })
    }

    if (spx.candles.length >= 21) {
      const closes = spx.candles.map((c) => c.close)
      const last = closes[closes.length - 1]
      const ma20 = closes.slice(-21, -1).reduce((a, b) => a + b, 0) / 20
      // ±5% vs the 20-day average spans the whole momentum range
      parts.push({ weight: 0.3, value: clamp01((last / ma20 - 1 + 0.05) / 0.1) * 100 })
    }

    const sectorQuotes = SECTOR_ETFS.map((etf) => sectorResults[etf]?.quote).filter(
      (q): q is NonNullable<typeof q> => q != null,
    )
    if (sectorQuotes.length >= 6) {
      const advancing = sectorQuotes.filter((q) => q.changePct >= 0).length
      parts.push({ weight: 0.3, value: (advancing / sectorQuotes.length) * 100 })
    }

    if (parts.length === 0) return null
    const totalWeight = parts.reduce((s, p) => s + p.weight, 0)
    return parts.reduce((s, p) => s + p.value * p.weight, 0) / totalWeight
  }, [vixQuote, sectorResults, spx.candles])

  // Needle animates from center to position once the score resolves.
  const [displayScore, setDisplayScore] = useState(50)
  useEffect(() => {
    if (score !== null) {
      const id = requestAnimationFrame(() => setDisplayScore(score))
      return () => cancelAnimationFrame(id)
    }
  }, [score])

  const angle = -90 + (displayScore / 100) * 180
  const color = moodColor(displayScore)
  const label = score === null ? 'READING…' : moodLabel(score)

  return (
    <div className="panel flex h-full flex-col p-5">
      <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
        Market mood
      </h3>
      <p className="mt-1 text-[11px] text-slate-600">
        Fear ↔ greed, blended from the VIX, momentum, and sector breadth.
      </p>

      <div className="flex flex-1 flex-col items-center justify-center py-4">
        <svg viewBox="0 0 200 120" className="w-full max-w-[240px]">
          <defs>
            <linearGradient id="moodArc" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ff6b7f" />
              <stop offset="50%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#2dd4a7" />
            </linearGradient>
          </defs>
          {/* arc track */}
          <path
            d="M 20 105 A 80 80 0 0 1 180 105"
            fill="none"
            stroke="url(#moodArc)"
            strokeWidth={10}
            strokeLinecap="round"
            opacity={0.85}
          />
          {/* tick marks */}
          {[0, 25, 50, 75, 100].map((t) => {
            const a = ((-90 + (t / 100) * 180) * Math.PI) / 180
            const x1 = 100 + Math.sin(a) * 66
            const y1 = 105 - Math.cos(a) * 66
            const x2 = 100 + Math.sin(a) * 72
            const y2 = 105 - Math.cos(a) * 72
            return <line key={t} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(148,163,184,0.35)" strokeWidth={1.5} />
          })}
          {/* needle — 800ms ease-out swing to position */}
          <g
            style={{
              transform: `rotate(${angle}deg)`,
              transformOrigin: '100px 105px',
              transition: 'transform 800ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            <line x1={100} y1={105} x2={100} y2={40} stroke={color} strokeWidth={3} strokeLinecap="round" />
            <circle cx={100} cy={105} r={6} fill={color} />
          </g>
          <circle cx={100} cy={105} r={2.5} fill="#04070d" />
        </svg>

        <p
          className="mt-2 font-mono text-xl font-bold tracking-[0.15em] transition-colors duration-500"
          style={{ color }}
        >
          {label}
        </p>
        {score !== null && (
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-600">
            {Math.round(score)} / 100
          </p>
        )}
      </div>

      <div className="flex justify-between font-mono text-[9px] uppercase tracking-[0.15em] text-slate-600">
        <span className="text-down/80">Panic</span>
        <span>Neutral</span>
        <span className="text-up/80">Euphoria</span>
      </div>
    </div>
  )
}

export default MarketMoodGauge
