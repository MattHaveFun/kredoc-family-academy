import { useState } from 'react'
import { MARKET_SYMBOLS } from '../data/markets'
import TickerStrip from '../components/TickerStrip'
import MainChartPanel from '../components/MainChartPanel'
import MarketCard from '../components/MarketCard'
import { useFeedStatus } from '../context/FeedStatusContext'

const DATA_STAT_LABEL: Record<string, string> = {
  live: 'LIVE',
  sim: 'SIM',
  connecting: '···',
}

function Dashboard() {
  const [selectedId, setSelectedId] = useState(MARKET_SYMBOLS[0].id)
  const { status } = useFeedStatus()

  const sessionDate = new Date()
    .toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    .toUpperCase()

  return (
    <div>
      <TickerStrip />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <div className="animate-fade-up">
            <p className="eyebrow">Mission Control</p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
              Markets Dashboard
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">
              A live console for the six numbers that dominate financial headlines, pulling real
              quotes from public market feeds with an automatic simulated fallback if a symbol is
              temporarily unreachable. Not investment advice.
            </p>
          </div>

          <dl
            className="animate-fade-up grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-slate-400/10 bg-slate-400/10"
            style={{ animationDelay: '120ms' }}
          >
            {[
              { label: 'Symbols', value: String(MARKET_SYMBOLS.length).padStart(2, '0') },
              { label: 'Data', value: DATA_STAT_LABEL[status] },
              { label: 'Session', value: sessionDate },
            ].map((stat) => (
              <div key={stat.label} className="bg-ink-900/90 px-4 py-3">
                <dt className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-600">
                  {stat.label}
                </dt>
                <dd className="mt-0.5 font-mono text-xs font-semibold tabular-nums text-slate-200">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <MainChartPanel selectedId={selectedId} onSelect={setSelectedId} />

        <div className="mt-10">
          <div className="mb-5 flex items-center gap-4">
            <h2 className="shrink-0 font-mono text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
              All indices at a glance
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-slate-400/20 to-transparent" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MARKET_SYMBOLS.map((market, i) => (
              <MarketCard
                key={market.id}
                market={market}
                index={i}
                selected={market.id === selectedId}
                onSelect={() => setSelectedId(market.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
