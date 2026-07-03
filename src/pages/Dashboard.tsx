import { useState } from 'react'
import { MARKET_SYMBOLS } from '../data/markets'
import TickerStrip from '../components/TickerStrip'
import MainChartPanel from '../components/MainChartPanel'
import MarketCard from '../components/MarketCard'

function Dashboard() {
  const [selectedId, setSelectedId] = useState(MARKET_SYMBOLS[0].id)

  return (
    <div>
      <TickerStrip />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-sky-500">Mission Control</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-50 sm:text-3xl">Markets Dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            A live-look console for the six numbers that dominate financial headlines. Prices below are
            illustrative — built for learning the shape of markets, not for trading on.
          </p>
        </div>

        <MainChartPanel selectedId={selectedId} onSelect={setSelectedId} />

        <div className="mt-8">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-500">
            All indices at a glance
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MARKET_SYMBOLS.map((market) => (
              <MarketCard
                key={market.id}
                market={market}
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
