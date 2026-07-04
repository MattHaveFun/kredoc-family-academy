import type { RangeKey } from './markets'
import {
  peekMarketQuote,
  peekMarketSeries,
  peekQuote,
  refreshMarket,
  refreshTickers,
  type MarketQuoteResult,
  type MarketSeriesResult,
  type QuoteResult,
} from './marketFeed'

// ---------------------------------------------------------------------------
// marketStore — the single place that decides WHEN to fetch. Every hook just
// declares "I want this market/ticker" and reads whatever's currently
// cached; this module is the only thing that ever calls into marketFeed's
// fetchers.
//
// Why this exists: when each component independently fetched on its own
// mount, two components showing the *same* market (e.g. the big chart and
// its small card) could land on different data-source decisions made
// minutes apart — one showing the real NASDAQ Composite (~25,000), the other
// showing the QQQ ETF proxy (~$700) — because there was no shared "when did
// we last check" clock. Centralizing the fetch means there's exactly one
// pull per market per cycle, shared by every consumer, so they can't drift.
//
// Refresh cadence: one pull per wanted market/ticker as soon as it's first
// asked for (so the page doesn't sit empty), then every POLL_INTERVAL_MS —
// this is an educational dashboard, not a trading terminal, so 15 minutes is
// plenty fresh while keeping Twelve Data's 800-credit/day budget nowhere
// near contended.
// ---------------------------------------------------------------------------

const POLL_INTERVAL_MS = 15 * 60 * 1000
/** Coalesces a burst of components mounting in the same tick into one pull. */
const DEBOUNCE_MS = 50

type Listener = () => void
const listeners = new Set<Listener>()

let version = 0
function bumpAndNotify() {
  version++
  listeners.forEach((listener) => listener())
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// --- Wanted sets: what any currently-mounted component actually needs -------
const wantedMarketRanges = new Map<string, Set<RangeKey>>()
const wantedTickers = new Set<string>()

let debounceTimer: ReturnType<typeof setTimeout> | null = null
function scheduleCycle() {
  if (debounceTimer) return
  debounceTimer = setTimeout(() => {
    debounceTimer = null
    runCycle().catch((err) => console.error('[marketStore] cycle failed:', err))
  }, DEBOUNCE_MS)
}

let pollTimer: ReturnType<typeof setInterval> | null = null
function ensurePolling() {
  if (pollTimer) return
  pollTimer = setInterval(() => {
    runCycle().catch((err) => console.error('[marketStore] cycle failed:', err))
  }, POLL_INTERVAL_MS)
}

let cycleInFlight: Promise<void> | null = null
function runCycle(): Promise<void> {
  if (cycleInFlight) return cycleInFlight
  cycleInFlight = (async () => {
    const marketIds = [...wantedMarketRanges.keys()]
    await Promise.all(
      marketIds.map((marketId) =>
        refreshMarket(marketId, [...(wantedMarketRanges.get(marketId) ?? [])], 5, bumpAndNotify),
      ),
    )
    if (wantedTickers.size > 0) {
      await refreshTickers([...wantedTickers], 5, bumpAndNotify)
    }
  })()
  return cycleInFlight.finally(() => {
    cycleInFlight = null
  })
}

export function wantMarketQuote(marketId: string) {
  const isNew = !wantedMarketRanges.has(marketId)
  if (isNew) wantedMarketRanges.set(marketId, new Set())
  ensurePolling()
  if (isNew) scheduleCycle()
}

export function wantMarketSeries(marketId: string, range: RangeKey) {
  let ranges = wantedMarketRanges.get(marketId)
  const isNewMarket = !ranges
  if (!ranges) {
    ranges = new Set()
    wantedMarketRanges.set(marketId, ranges)
  }
  const isNewRange = !ranges.has(range)
  ranges.add(range)
  ensurePolling()
  if (isNewMarket || isNewRange) scheduleCycle()
}

export function wantTickerQuote(symbol: string) {
  const isNew = !wantedTickers.has(symbol)
  wantedTickers.add(symbol)
  ensurePolling()
  if (isNew) scheduleCycle()
}

// --- Snapshots ---------------------------------------------------------------
// Cached per `version` so repeated reads between updates return the exact
// same reference — required for useSyncExternalStore, which otherwise sees a
// "new" value on every render and re-renders forever.

interface Cached<T> {
  version: number
  value: T
}

const quoteCache = new Map<string, Cached<MarketQuoteResult>>()
const seriesCache = new Map<string, Cached<MarketSeriesResult>>()
const tickerCache = new Map<string, Cached<QuoteResult>>()
const quotesListCache = new Map<string, Cached<Record<string, QuoteResult>>>()

export function getMarketQuoteSnapshot(marketId: string): MarketQuoteResult {
  const cached = quoteCache.get(marketId)
  if (cached && cached.version === version) return cached.value
  const value = peekMarketQuote(marketId)
  quoteCache.set(marketId, { version, value })
  return value
}

export function getMarketSeriesSnapshot(marketId: string, range: RangeKey): MarketSeriesResult {
  const key = `${marketId}|${range}`
  const cached = seriesCache.get(key)
  if (cached && cached.version === version) return cached.value
  const value = peekMarketSeries(marketId, range)
  seriesCache.set(key, { version, value })
  return value
}

export function getTickerQuoteSnapshot(symbol: string): QuoteResult {
  const cached = tickerCache.get(symbol)
  if (cached && cached.version === version) return cached.value
  const value = peekQuote(symbol)
  tickerCache.set(symbol, { version, value })
  return value
}

export function getQuotesListSnapshot(symbols: string[]): Record<string, QuoteResult> {
  const key = symbols.join(',')
  const cached = quotesListCache.get(key)
  if (cached && cached.version === version) return cached.value
  const value: Record<string, QuoteResult> = {}
  for (const symbol of symbols) value[symbol] = getTickerQuoteSnapshot(symbol)
  quotesListCache.set(key, { version, value })
  return value
}
