import type { Candle, RangeKey } from './markets'
import { fetchYahooQuote, fetchYahooSeries, YAHOO_MARKET_SYMBOL, yahooSymbolForTicker } from './yahooFinance'
import {
  getMarketQuote as tdGetMarketQuote,
  getTimeSeries as tdGetTimeSeries,
  getQuotes as tdGetQuotes,
} from './twelveDataService'

// ---------------------------------------------------------------------------
// marketFeed — the single module every hook reads market data from, and the
// only place that knows how to fetch it. It does NOT fetch on its own
// schedule: src/data/marketStore.ts is the sole caller, pulling everything
// once on a shared cycle (see marketStore for why) so every component reading
// the same market always sees the same value.
//
//   1. Yahoo Finance (src/data/yahooFinance.ts) is PRIMARY — no plan gating,
//      already proven reliable in this project. Tried first, always.
//   2. Twelve Data (src/data/twelveDataService.ts) is the FALLBACK — used
//      only when Yahoo fails, for whatever Yahoo's CORS relay can't reach at
//      that moment. It brings its own rate limiting and index→ETF-proxy
//      logic, reused as-is.
//   3. NEVER DROP GOOD DATA. Every successful fetch, from either provider,
//      is written to a persistent "last-known-good" cache. If both
//      providers fail on a given call, the last good value is left in place
//      — however old — labeled honestly with its age, rather than
//      surfacing "unavailable" or a blank UI.
//
// A market's quote and every range series it needs are decided and fetched
// together, in one pass, from one chosen source (see refreshMarket) — this
// is what keeps the big chart and the small cards from ever landing on two
// different scales (real index vs. ETF proxy) for the same market.
// ---------------------------------------------------------------------------

export type DataStatus = 'loading' | 'live' | 'cached' | 'unavailable'

export interface Quote {
  symbol: string
  price: number
  change: number
  changePct: number
  open: number
  high: number
  low: number
  previousClose: number
  volume: number
  name: string
}

export interface QuoteResult {
  quote: Quote | null
  status: DataStatus
  fetchedAt: number | null
}

export interface SeriesResult {
  candles: Candle[]
  status: DataStatus
  fetchedAt: number | null
}

export interface MarketQuoteResult extends QuoteResult {
  proxyNote: string | null
}

export interface MarketSeriesResult extends SeriesResult {
  proxyNote: string | null
}

/** Cache prune horizon on load — generous, since holding stale data is the point. */
const CACHE_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000
const CACHE_STORAGE_KEY = 'kredoc.feed.cache.v2'

interface CacheEntry {
  fetchedAt: number
  kind: 'quote' | 'series'
  payload: Quote | Candle[]
  /**
   * Set when this value came from an ETF proxy rather than the true index
   * (e.g. Twelve Data substituting SPY for a plan-gated SPX). Stored ON the
   * cache entry so a stale read still carries the correct "via SPY ETF"
   * label instead of silently presenting proxy data as the real index.
   */
  proxyNote: string | null
}

const memoryCache = new Map<string, CacheEntry>()

function loadPersistedCache() {
  try {
    const raw = localStorage.getItem(CACHE_STORAGE_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw) as Record<string, CacheEntry>
    const cutoff = Date.now() - CACHE_MAX_AGE_MS
    for (const [key, entry] of Object.entries(parsed)) {
      if (entry && entry.fetchedAt > cutoff) memoryCache.set(key, entry)
    }
  } catch {
    // unreadable cache — treat as empty, we simply have no history yet
  }
}
loadPersistedCache()

let persistScheduled = false
function schedulePersist() {
  if (persistScheduled) return
  persistScheduled = true
  setTimeout(() => {
    persistScheduled = false
    try {
      localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(Object.fromEntries(memoryCache)))
    } catch {
      // storage quota — in-memory cache still serves this session
    }
  }, 250)
}

function cacheSet(key: string, kind: CacheEntry['kind'], payload: Quote | Candle[], proxyNote: string | null) {
  memoryCache.set(key, { fetchedAt: Date.now(), kind, payload, proxyNote })
  schedulePersist()
}

function logError(context: string, err: unknown) {
  console.error(`[marketFeed] ${context}:`, err instanceof Error ? err.message : err)
}

// --- Synchronous cache peeks --------------------------------------------------
// Used by marketStore to seed/read snapshots so a component mount/remount
// never flashes to a blank/loading UI when good data exists.

function peek(key: string): CacheEntry | null {
  return memoryCache.get(key) ?? null
}

function marketQuoteKey(marketId: string): string {
  return `mq|${marketId}`
}

function marketSeriesKey(marketId: string, range: RangeKey): string {
  return `ms|${marketId}|${range}`
}

function tickerQuoteKey(symbol: string): string {
  return `q|${symbol}`
}

// Data is pulled on a shared 15-minute cycle (see marketStore.ts), not on
// demand — so "LIVE" means "at or within the current refresh cycle" rather
// than "just this instant." A grace window past the poll interval covers a
// slow cycle before honestly downgrading to "CACHED · Xm ago" (which means a
// refresh was attempted and failed, and this is the last good value).
const LIVE_WINDOW_MS = 16 * 60 * 1000

function statusFor(fetchedAt: number): DataStatus {
  return Date.now() - fetchedAt < LIVE_WINDOW_MS ? 'live' : 'cached'
}

export function peekMarketQuote(marketId: string): MarketQuoteResult {
  const entry = peek(marketQuoteKey(marketId))
  if (entry && entry.kind === 'quote') {
    return { quote: entry.payload as Quote, status: statusFor(entry.fetchedAt), fetchedAt: entry.fetchedAt, proxyNote: entry.proxyNote }
  }
  return { quote: null, status: 'loading', fetchedAt: null, proxyNote: null }
}

export function peekMarketSeries(marketId: string, range: RangeKey): MarketSeriesResult {
  const entry = peek(marketSeriesKey(marketId, range))
  if (entry && entry.kind === 'series') {
    return { candles: entry.payload as Candle[], status: statusFor(entry.fetchedAt), fetchedAt: entry.fetchedAt, proxyNote: entry.proxyNote }
  }
  return { candles: [], status: 'loading', fetchedAt: null, proxyNote: null }
}

export function peekQuote(symbol: string): QuoteResult {
  const entry = peek(tickerQuoteKey(symbol))
  if (entry && entry.kind === 'quote') {
    return { quote: entry.payload as Quote, status: statusFor(entry.fetchedAt), fetchedAt: entry.fetchedAt }
  }
  return { quote: null, status: 'loading', fetchedAt: null }
}

function yahooToQuote(symbol: string, name: string, q: { price: number; previousClose: number; open: number; high: number; low: number; volume: number }): Quote {
  return {
    symbol,
    price: q.price,
    previousClose: q.previousClose,
    change: q.price - q.previousClose,
    changePct: q.previousClose !== 0 ? ((q.price - q.previousClose) / q.previousClose) * 100 : 0,
    open: q.open,
    high: q.high,
    low: q.low,
    volume: q.volume,
    name,
  }
}

// --- Named markets (sp500, vix, bitcoin, …) ----------------------------------

interface MarketDecision {
  /** true = use Yahoo (the real index/asset) for every series call below. */
  useYahoo: boolean
  /** Twelve Data symbol to use for series when useYahoo is false; null if TD has nothing usable either. */
  tdSymbol: string | null
  /** Non-null when the resolved source is an ETF proxy rather than the true index. */
  note: string | null
}

/**
 * Decides — once — which source represents a market for this refresh pass,
 * fetching and caching its quote in the process. Every series range fetched
 * afterward in the same pass reuses this exact decision, so the quote and
 * every chart range for a market always agree on scale.
 */
async function decideMarket(marketId: string, priority: number): Promise<MarketDecision> {
  const yahooSymbol = YAHOO_MARKET_SYMBOL[marketId]
  if (yahooSymbol) {
    try {
      const q = await fetchYahooQuote(yahooSymbol)
      cacheSet(marketQuoteKey(marketId), 'quote', yahooToQuote(marketId, marketId, q), null)
      return { useYahoo: true, tdSymbol: null, note: null }
    } catch (err) {
      logError(`quote ${marketId}`, err)
    }
  }

  const td = await tdGetMarketQuote(marketId, priority)
  if (td.quote) {
    cacheSet(marketQuoteKey(marketId), 'quote', td.quote, td.proxyNote)
    return { useYahoo: false, tdSymbol: td.sourceSymbol, note: td.proxyNote }
  }

  // Both providers failed — leave the existing cache (if any) untouched and
  // report "no viable source this pass" so series fetches below are skipped.
  return { useYahoo: false, tdSymbol: null, note: null }
}

// The decision made the last time a market was fully synced (see
// refreshMarket below). A range top-up (refreshMarketRange) reuses this
// instead of re-deciding, so a range added mid-session — e.g. the user
// clicking a different time-range tab — can never land on a different
// source than what's already on screen for that market.
const lastDecisions = new Map<string, MarketDecision>()

async function fetchSeriesWithDecision(
  marketId: string,
  range: RangeKey,
  decision: MarketDecision,
  priority: number,
): Promise<void> {
  const yahooSymbol = YAHOO_MARKET_SYMBOL[marketId]
  try {
    if (decision.useYahoo && yahooSymbol) {
      const candles = await fetchYahooSeries(yahooSymbol, range)
      cacheSet(marketSeriesKey(marketId, range), 'series', candles, null)
    } else if (decision.tdSymbol) {
      const result = await tdGetTimeSeries(decision.tdSymbol, range, priority)
      if (result.candles.length >= 2) {
        cacheSet(marketSeriesKey(marketId, range), 'series', result.candles, decision.note)
      }
    }
    // No viable source this pass — leave whatever's cached (never drop good data).
  } catch (err) {
    logError(`series ${marketId} ${range}`, err)
  }
}

/**
 * Full sync: re-decides the source fresh, refreshes the quote, and refreshes
 * every range in `ranges` from that one decision. Called only for a market's
 * first-ever sync and on marketStore's periodic (15-minute) tick — never on
 * every newly-wanted range, which is what used to let a transient Yahoo
 * hiccup re-decide mid-session and split a market across two scales.
 */
export async function refreshMarket(
  marketId: string,
  ranges: RangeKey[],
  priority = 5,
  onUpdate?: () => void,
): Promise<void> {
  const decision = await decideMarket(marketId, priority)
  lastDecisions.set(marketId, decision)
  onUpdate?.()

  for (const range of ranges) {
    await fetchSeriesWithDecision(marketId, range, decision, priority)
    onUpdate?.()
  }
}

/**
 * Range top-up: fetches one additional range for a market that's already
 * been synced, reusing its established decision (deciding fresh only if this
 * market has somehow never been synced). Never changes the source an
 * already-visible quote/range is relying on.
 */
export async function refreshMarketRange(
  marketId: string,
  range: RangeKey,
  priority = 5,
  onUpdate?: () => void,
): Promise<void> {
  let decision = lastDecisions.get(marketId)
  if (!decision) {
    decision = await decideMarket(marketId, priority)
    lastDecisions.set(marketId, decision)
    onUpdate?.()
  }
  await fetchSeriesWithDecision(marketId, range, decision, priority)
  onUpdate?.()
}

// --- Plain tickers (watchlist stocks, sector ETFs) ---------------------------

/**
 * Refreshes a batch of plain ticker quotes: Yahoo per symbol first, Twelve
 * Data's batch endpoint (chunked ≤8/request) for whatever Yahoo couldn't
 * reach. Called only by marketStore's poll cycle.
 */
export async function refreshTickers(symbols: string[], priority = 5, onUpdate?: () => void): Promise<void> {
  const failed: string[] = []

  await Promise.all(
    symbols.map(async (symbol) => {
      try {
        const yahooSymbol = yahooSymbolForTicker(symbol)
        const q = await fetchYahooQuote(yahooSymbol)
        cacheSet(tickerQuoteKey(symbol), 'quote', yahooToQuote(symbol, symbol, q), null)
        onUpdate?.()
      } catch (err) {
        logError(`ticker ${symbol}`, err)
        failed.push(symbol)
      }
    }),
  )

  if (failed.length > 0) {
    await tdGetQuotes(failed, {
      priority,
      onPartial: (partial) => {
        for (const [symbol, result] of Object.entries(partial)) {
          if (result.quote) cacheSet(tickerQuoteKey(symbol), 'quote', result.quote, null)
        }
        onUpdate?.()
      },
    })
  }
}

// --- Badge helpers ------------------------------------------------------------

/** Human label for a badge: "LIVE", "CACHED · Xm ago" / "· Xh ago" / "· Xd ago", or "DATA UNAVAILABLE". */
export function describeStatus(status: DataStatus, fetchedAt: number | null): string {
  if (status === 'live') return 'LIVE'
  if (status === 'cached' && fetchedAt) {
    const mins = Math.max(0, Math.round((Date.now() - fetchedAt) / 60_000))
    if (mins < 1) return 'CACHED · just now'
    if (mins < 60) return `CACHED · ${mins}m ago`
    const hours = Math.round(mins / 60)
    if (hours < 24) return `CACHED · ${hours}h ago`
    const days = Math.round(hours / 24)
    return `CACHED · ${days}d ago`
  }
  if (status === 'loading') return 'CONNECTING'
  return 'DATA UNAVAILABLE'
}
