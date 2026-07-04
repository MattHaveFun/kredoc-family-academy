import { useState } from 'react'
import { SECTORS } from '../data/sectors'
import { useQuotes } from '../hooks/useQuotes'
import DataBadge from './DataBadge'
import InfoDisclosure from './InfoDisclosure'

const SECTOR_ETFS = SECTORS.map((s) => s.etf)

// Color a cell by % change: deeper green/red for bigger moves, capped at ±3%.
function cellColor(changePct: number): { bg: string; ring: string } {
  const intensity = Math.min(Math.abs(changePct) / 3, 1)
  if (changePct >= 0) {
    return { bg: `rgba(45, 212, 167, ${0.08 + intensity * 0.3})`, ring: `rgba(45, 212, 167, ${0.15 + intensity * 0.4})` }
  }
  return { bg: `rgba(255, 107, 127, ${0.08 + intensity * 0.3})`, ring: `rgba(255, 107, 127, ${0.15 + intensity * 0.4})` }
}

function SectorHeatMap() {
  const { results, status, fetchedAt } = useQuotes(SECTOR_ETFS, 4)
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <div className="panel flex h-full flex-col p-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
          Sector heat map
        </h3>
        <DataBadge status={status} fetchedAt={fetchedAt} compact />
      </div>
      <p className="mt-1 text-[11px] text-slate-600">
        The market's 11 neighborhoods, today. Hover any tile.
      </p>

      <div className="relative mt-4 grid flex-1 grid-cols-3 gap-1.5 sm:grid-cols-4 lg:grid-cols-3">
        {SECTORS.map((sector, i) => {
          const quote = results[sector.etf]?.quote
          const changePct = quote?.changePct ?? null
          const colors = changePct !== null ? cellColor(changePct) : null
          return (
            <div
              key={sector.id}
              className="animate-fade-up relative flex min-h-[64px] flex-col justify-between rounded-lg p-2 transition-transform duration-200 hover:scale-[1.04]"
              style={{
                animationDelay: `${i * 60}ms`,
                backgroundColor: colors?.bg ?? 'rgba(148, 163, 184, 0.05)',
                boxShadow: colors ? `inset 0 0 0 1px ${colors.ring}` : 'inset 0 0 0 1px rgba(148,163,184,0.1)',
              }}
              onMouseEnter={() => setHovered(sector.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <span className="font-mono text-[10px] font-bold tracking-wide text-slate-200">
                {sector.etf}
              </span>
              <span
                className={`font-mono text-xs font-semibold tabular-nums ${
                  changePct === null ? 'text-slate-600' : changePct >= 0 ? 'text-up' : 'text-down'
                }`}
              >
                {changePct === null ? '···' : `${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}%`}
              </span>

              {hovered === sector.id && (
                <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-56 -translate-x-1/2 rounded-lg border border-slate-400/15 bg-ink-950/95 px-3 py-2.5 shadow-xl backdrop-blur">
                  <p className="flex items-baseline justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-100">{sector.name}</span>
                    {changePct !== null && (
                      <span className={`font-mono text-xs font-semibold ${changePct >= 0 ? 'text-up' : 'text-down'}`}>
                        {changePct >= 0 ? '+' : ''}
                        {changePct.toFixed(2)}%
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-[11px] leading-snug text-slate-400">{sector.blurb}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <InfoDisclosure
        what="Each tile is one of the market's 11 GICS sectors — Tech, Healthcare, Energy, and the rest — tracked through its SPDR sector ETF and colored by how far it moved today. Deeper green or red means a bigger swing."
        why="The overall market can look flat while sectors underneath it tell completely different stories — energy roaring while tech slumps, or vice versa. Watching which sectors lead or lag is how professionals tell whether a rally is broad and healthy or narrow and fragile."
        academyAnchor="indices-vs-stocks"
      />
    </div>
  )
}

export default SectorHeatMap
