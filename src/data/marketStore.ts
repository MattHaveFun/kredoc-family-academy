import type { RangeKey } from './markets'
import {
  peekMarketQuote,
  peekMarketSeries,
  peekQuote,
  refreshMarket,
  refreshMarketRange,
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

// 'pending' = queued or in-flight full sync, no decision to reuse yet.
// 'synced'  = has a decision; a newly-wanted range can safely top up from it.
const marketSyncState = new Map<string, 'pending' | 'synced'>()

const pendingFullSync = new Set<string>()
const pendingRangeTopUps: Array<{ marketId: string; range: RangeKey }> = []

// Serializes every fetch operation through one chain so a debounced flush,
// an on-demand top-up, and the periodic tick can never run concurrently and
// step on each other's in-flight decisions.
let queue: Promise<void> = Promise.resolve()
function enqueue(task: () => Promise<void>) {
  queue = queue.then(task).catch((err) => console.error('[marketStore] task failed:', err))
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null
function scheduleFlush() {
  if (debounceTimer) return
  debounceTimer = setTimeout(() => {
    debounceTimer = null
    enqueue(flushPending)
  }, DEBOUNCE_MS)
}

async function flushPending(): Promise<void> {
  const fullSyncTargets = [...pendingFullSync]
  pendingFullSync.clear()
  const topUps = pendingRangeTopUps.splice(0, pendingRangeTopUps.length)

  await Promise.all(
    fullSyncTargets.map(async (marketId) => {
      await refreshMarket(marketId, [...(wantedMarketRanges.get(marketId) ?? [])], 5, bumpAndNotify)
      marketSyncState.set(marketId, 'synced')
    }),
  )
  await Promise.all(
    topUps.map(({ marketId, range }) => refreshMarketRange(marketId, range, 5, bumpAndNotify)),
  )
  if (wantedTickers.size > 0) {
    await refreshTickers([...wantedTickers], 5, bumpAndNotify)
  }
}

/** Periodic resync: re-decides every wanted market fresh (self-healing a
 * stuck proxy once Yahoo recovers, or vice versa) and refreshes every
 * currently-wanted range under that one decision, atomically per market. */
async function periodicResync(): Promise<void> {
  const marketIds = [...wantedMarketRanges.keys()]
  await Promise.all(
    marketIds.map(async (marketId) => {
      await refreshMarket(marketId, [...(wantedMarketRanges.get(marketId) ?? [])], 5, bumpAndNotify)
      marketSyncState.set(marketId, 'synced')
    }),
  )
  if (wantedTickers.size > 0) {
    await refreshTickers([...wantedTickers], 5, bumpAndNotify)
  }
}

let pollTimer: ReturnType<typeof setInterval> | null = null
function ensurePolling() {
  if (pollTimer) return
  pollTimer = setInterval(() => {
    enqueue(periodicResync)
  }, POLL_INTERVAL_MS)
}

export function wantMarketQuote(marketId: string) {
  const isNew = !wantedMarketRanges.has(marketId)
  if (isNew) {
    wantedMarketRanges.set(marketId, new Set())
    marketSyncState.set(marketId, 'pending')
    pendingFullSync.add(marketId)
    scheduleFlush()
  }
  ensurePolling()
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

  if (isNewMarket) {
    marketSyncState.set(marketId, 'pending')
    pendingFullSync.add(marketId)
    scheduleFlush()
    return
  }
  if (!isNewRange) return

  if (marketSyncState.get(marketId) === 'synced') {
    pendingRangeTopUps.push({ marketId, range })
    scheduleFlush()
  }
  // Otherwise a full sync for this market is already queued or in flight —
  // it will read this range from wantedMarketRanges when it runs, or (if
  // already mid-flight) the range simply arrives on the next periodic tick.
  // Either way, never a second decision racing the first.
}

export function wantTickerQuote(symbol: string) {
  const isNew = !wantedTickers.has(symbol)
  wantedTickers.add(symbol)
  ensurePolling()
  if (isNew) scheduleFlush()
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
