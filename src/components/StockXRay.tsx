import { Link } from 'react-router-dom'
import type { MarketSymbol } from '../data/markets'
import { COMPANY_PROFILES, PROFILE_BY_ID } from '../data/stockPicking'
import InfoDisclosure from './InfoDisclosure'

// The X-ray: six of the largest companies on Earth, each reduced to the five
// things that actually decide whether it's a good business — how it makes
// money, what protects it, who it beats and why, what would break it, and the
// one number to check next. No prices here on purpose; a business thesis that
// changes with the quote was never a thesis.

interface StockXRayProps {
  markets: MarketSymbol[]
  selectedId: string
  onSelect: (id: string) => void
}

function StockXRay({ markets, selectedId, onSelect }: StockXRayProps) {
  const profile = PROFILE_BY_ID[selectedId] ?? COMPANY_PROFILES[0]
  const market = markets.find((m) => m.id === profile.id)

  const rows: Array<{ label: string; body: string; color: string }> = [
    { label: 'The engine', body: profile.engine, color: '#38bdf8' },
    { label: 'The moat', body: profile.moat, color: '#2dd4a7' },
    { label: 'Why it leads its peers', body: profile.vsPeers, color: '#fbbf24' },
    { label: 'What would break it', body: profile.risk, color: '#ff6b7f' },
  ]

  return (
    <div className="panel animate-fade-up overflow-hidden">
      {/* company selector, mirroring the chart panel's symbol row */}
      <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto border-b border-slate-400/10 bg-ink-950/50 px-4 py-3 sm:px-5">
        {COMPANY_PROFILES.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect(p.id)}
            className={`shrink-0 rounded-lg border px-3 py-1.5 font-mono text-xs font-semibold tracking-wide transition-all duration-200 ${
              p.id === profile.id
                ? 'border-sky-400/40 bg-sky-400/10 text-sky-300 shadow-[0_0_20px_-6px_rgba(56,189,248,0.6)]'
                : 'border-transparent text-slate-500 hover:border-slate-400/15 hover:bg-slate-400/5 hover:text-slate-200'
            }`}
          >
            {p.symbol}
          </button>
        ))}
      </div>

      <div className="p-4 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="font-display text-lg font-semibold text-slate-100">{profile.name}</h3>
              <span className="chip">{profile.sector}</span>
              <span
                className="inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider"
                style={{
                  color: profile.color,
                  borderColor: `${profile.color}44`,
                  backgroundColor: `${profile.color}11`,
                }}
              >
                {profile.moatKind}
              </span>
            </div>
            <p className="mt-1.5 text-xs text-slate-500">
              Closest rivals: <span className="text-slate-400">{profile.peers}</span>
            </p>
          </div>
          {market && (
            <Link
              to={`/academy/lesson/${market.academyAnchor}`}
              className="group inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-400/15 px-3.5 py-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-300 transition-colors hover:border-sky-400/40 hover:text-sky-300"
            >
              Full case study
              <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </Link>
          )}
        </div>

        {/* the four questions */}
        <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-2">
          {rows.map((row) => (
            <div
              key={row.label}
              className="rounded-xl border border-slate-400/10 bg-ink-950/40 p-4 transition-colors hover:border-slate-400/20"
            >
              <p
                className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em]"
                style={{ color: row.color }}
              >
                {row.label}
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-300">{row.body}</p>
            </div>
          ))}
        </div>

        {/* the one line to check next */}
        <div className="mt-3 rounded-xl border border-sky-400/20 bg-sky-400/[0.05] p-4">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-300">
            What to look for in the next earnings report
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-slate-200">{profile.watchNext}</p>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
            Notice that it is never "did they beat expectations." Beating a forecast by a penny is a
            story about analysts. These are stories about the business.
          </p>
        </div>

        {/* all six, side by side — the point being how different they are */}
        <div className="mt-6">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-500">
            Six giants, six completely different moats
          </p>
          <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-slate-500">
            They get lumped together as "big tech," which hides the useful part. Each one is
            protected by a different mechanism, and each mechanism fails in a different way.
          </p>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {COMPANY_PROFILES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelect(p.id)}
                className={`rounded-xl border p-3 text-left transition-all duration-200 ${
                  p.id === profile.id
                    ? 'border-sky-400/40 bg-sky-400/[0.07]'
                    : 'border-slate-400/10 bg-slate-400/[0.03] hover:border-slate-400/25'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold tracking-wide" style={{ color: p.color }}>
                    {p.symbol}
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-slate-600">
                    {p.sector}
                  </span>
                </div>
                <p className="mt-1.5 text-[12px] font-medium leading-snug text-slate-300">
                  {p.moatKind}
                </p>
              </button>
            ))}
          </div>
        </div>

        <InfoDisclosure
          what="Each of the six largest companies in the S&P 500, stripped down to five things: how it actually makes money, the specific mechanism that stops competitors copying it, the honest reason it leads its closest rivals, what would genuinely break the story, and the one line to read in its next earnings report."
          why="Picking a stock well is not about predicting a price. It is about being able to answer 'why does this business keep winning, and what would tell me it stopped?' If you cannot answer both in your own words, you do not own an investment — you own a hope. Practicing on six companies you already know makes the habit stick."
          academyAnchor="moat"
        />
      </div>
    </div>
  )
}

export default StockXRay
