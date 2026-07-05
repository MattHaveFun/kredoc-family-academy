import { useState } from 'react'
import { MARKET_SYMBOLS, type MarketSymbol } from '../data/markets'
import TickerStrip from '../components/TickerStrip'
import MainChartPanel from '../components/MainChartPanel'
import MarketCard from '../components/MarketCard'
import SectorHeatMap from '../components/SectorHeatMap'
import MarketMoodGauge from '../components/MarketMoodGauge'
import EconomicCalendarPanel from '../components/EconomicCalendarPanel'
import YieldCurvePanel from '../components/YieldCurvePanel'
import TodayInMarkets from '../components/TodayInMarkets'
import DataBadge from '../components/DataBadge'
import { useAutoCycle } from '../hooks/useAutoCycle'
import { useFeedStatus } from '../context/FeedStatusContext'

function SectionRule({ title }: { title: string }) {
  return (
    <div className="mb-5 flex items-center gap-4">
      <h2 className="shrink-0 font-mono text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
        {title}
      </h2>
      <div className="h-px flex-1 bg-gradient-to-r from-slate-400/20 to-transparent" />
    </div>
  )
}

// Resolve a list of ids into MARKET_SYMBOLS, preserving the given order.
function pick(ids: string[]): MarketSymbol[] {
  return ids.flatMap((id) => {
    const m = MARKET_SYMBOLS.find((s) => s.id === id)
    return m ? [m] : []
  })
}

const MARKETS_INDICES = pick(['sp500', 'nasdaq', 'dow', 'russell2000', 'vix'])
const MARKETS_CRYPTO = pick(['bitcoin', 'ethereum'])
const MARKETS_TAB_SYMBOLS = [...MARKETS_INDICES, ...MARKETS_CRYPTO]

const MACRO_COMMODITIES = pick(['gold', 'oil', 'silver', 'natgas', 'copper', 'dxy'])
const MACRO_RATES = pick(['tnx', 'ust2y', 'ust30y'])
const MACRO_TAB_SYMBOLS = [...MACRO_COMMODITIES, ...MACRO_RATES]

function CardGrid({
  symbols,
  selectedId,
  onSelect,
}: {
  symbols: MarketSymbol[]
  selectedId: string
  onSelect: (id: string) => void
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {symbols.map((market, i) => (
        <MarketCard
          key={market.id}
          market={market}
          index={i}
          selected={market.id === selectedId}
          onSelect={() => onSelect(market.id)}
        />
      ))}
    </div>
  )
}

function MarketsTab() {
  const { selectedId, select, pause, isCycling } = useAutoCycle(
    MARKETS_TAB_SYMBOLS.map((s) => s.id),
  )

  return (
    <>
      <MainChartPanel
        symbols={MARKETS_TAB_SYMBOLS}
        selectedId={selectedId}
        onSelect={select}
        onInteract={pause}
        isCycling={isCycling}
      />

      <div className="mt-10 animate-fade-up" style={{ animationDelay: '100ms' }}>
        <SectionRule title="All indices at a glance" />
        <CardGrid symbols={MARKETS_INDICES} selectedId={selectedId} onSelect={select} />
      </div>

      <div className="mt-10 animate-fade-up" style={{ animationDelay: '120ms' }}>
        <SectionRule title="Crypto" />
        <CardGrid symbols={MARKETS_CRYPTO} selectedId={selectedId} onSelect={select} />
      </div>

      <div className="mt-10 animate-fade-up" style={{ animationDelay: '200ms' }}>
        <SectionRule title="Command center" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SectorHeatMap />
          <MarketMoodGauge />
        </div>
      </div>

      <div className="mt-10 animate-fade-up" style={{ animationDelay: '300ms' }}>
        <SectionRule title="The story of the day" />
        <TodayInMarkets />
      </div>
    </>
  )
}

function MacroTab() {
  const { selectedId, select, pause, isCycling } = useAutoCycle(
    MACRO_TAB_SYMBOLS.map((s) => s.id),
  )

  return (
    <>
      <MainChartPanel
        symbols={MACRO_TAB_SYMBOLS}
        selectedId={selectedId}
        onSelect={select}
        onInteract={pause}
        isCycling={isCycling}
      />

      <div className="mt-10 animate-fade-up" style={{ animationDelay: '100ms' }}>
        <SectionRule title="Commodities & currencies" />
        <CardGrid symbols={MACRO_COMMODITIES} selectedId={selectedId} onSelect={select} />
      </div>

      <div className="mt-10 animate-fade-up" style={{ animationDelay: '120ms' }}>
        <SectionRule title="Rates & the yield curve" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CardGrid symbols={MACRO_RATES} selectedId={selectedId} onSelect={select} />
          </div>
          <YieldCurvePanel />
        </div>
      </div>

      <div className="mt-10 animate-fade-up" style={{ animationDelay: '200ms' }}>
        <SectionRule title="On the calendar" />
        <EconomicCalendarPanel />
      </div>
    </>
  )
}

type TabKey = 'markets' | 'macro'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'markets', label: 'Markets' },
  { key: 'macro', label: 'Macro' },
]

function Dashboard() {
  const [tab, setTab] = useState<TabKey>('markets')
  const { status, fetchedAt } = useFeedStatus()

  const sessionDate = new Date()
    .toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    .toUpperCase()

  return (
    <div>
      <TickerStrip />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {/* header */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <div className="animate-fade-up">
            <p className="eyebrow">Mission Control</p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
              Markets Dashboard
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">
              A console for the numbers that dominate financial headlines, updated once a trading
              day — every one of them explained in plain English one hover away. Not investment
              advice.
            </p>
          </div>

          <dl
            className="animate-fade-up grid grid-cols-3 items-stretch gap-px overflow-hidden rounded-xl border border-slate-400/10 bg-slate-400/10"
            style={{ animationDelay: '100ms' }}
          >
            {[
              { label: 'Symbols', value: String(MARKET_SYMBOLS.length).padStart(2, '0') },
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
            <div className="bg-ink-900/90 px-4 py-3">
              <dt className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-600">Data</dt>
              <dd className="mt-1">
                <DataBadge status={status} fetchedAt={fetchedAt} compact />
              </dd>
            </div>
          </dl>
        </div>

        {/* tab switcher — in-page, styled like the time-range pills */}
        <div className="mb-8 inline-flex rounded-xl border border-slate-400/10 bg-ink-950/60 p-1 shadow-[inset_0_1px_0_rgba(148,163,184,0.05)]">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`rounded-lg px-5 py-2 font-mono text-xs font-semibold uppercase tracking-[0.15em] transition-all duration-200 ${
                tab === t.key
                  ? 'bg-sky-400/15 text-sky-300 shadow-[0_0_16px_-4px_rgba(56,189,248,0.6)]'
                  : 'text-slate-500 hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Each tab is its own subtree so switching fully resets chart + cycle state. */}
        {tab === 'markets' ? <MarketsTab /> : <MacroTab />}
      </div>
    </div>
  )
}

export default Dashboard
