import type { Candle, RangeKey } from './markets'
import { fetchYahooQuote, fetchYahooSeries, YAHOO_MARKET_SYMBOL, yahooSymbolForTicker } from './yahooFinance'
import {
  MARKET_FEEDS,
  getMarketQuote as tdGetMarketQuote,
  getMarketSeries as tdGetMarketSeries,
  getQuote as tdGetQuote,
} from './twelveDataService'

// ---------------------------------------------------------------------------
// marketFeed — the single module every hook/component reads market data
// from. Two providers, one policy:
//
//   1. Yahoo Finance (src/data/yahooFinance.ts) is PRIMARY — no plan gating,
//      already proven reliable in this project. Tried first, always.
//   2. Twelve Data (src/data/twelveDataService.ts) is the FALLBACK — used
//      only when Yahoo fails, for whatever Yahoo's CORS relay can't reach at
//      that moment. It brings its own rate limiting and index→ETF-proxy
//      logic, reused as-is.
//   3. NEVER DROP GOOD DATA. Every successful fetch, from either provider,
//      is written to a persistent "last-known-good" cache. If both
//      providers fail on a given call, the last good value is returned
//      as-is — however old — labeled honestly with its age, rather than
//      surfacing "unavailable" or a blank UI. "Unavailable" only appears the
//      very first time a symbol has never once been fetched successfully.
//
// This is a deliberate change from a stricter TTL-based cache: a stable
// stale value (even yesterday's close) is more useful to a reader than a
// gap, so freshness only ever affects whether a *background* refresh is
// attempted — never whether previously-good data stays on screen.
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

/** How long a value is considered fresh enough to skip a background refresh. */
const REFRESH_TTL_MS = 10 * 60 * 1000
/** Cache prune horizon on load — generous, since holding stale data is the point. */
const CACHE_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000
// v2: cache entries now carry proxyNote directly (see CacheEntry) — bumped
// so pre-existing v1 entries (missing that field) don't get misread.
const CACHE_STORAGE_KEY = 'kredoc.feed.cache.v2'

interface CacheEntry {
  fetchedAt: number
  kind: 'quote' | 'series'
  payload: Quote | Candle[]
  /**
   * Set when this value came from an ETF proxy rather than the true index
   * (e.g. Twelve Data substituting SPY for a plan-gated SPX). Stored ON the
   * cache entry — not just returned alongside a fresh fetch — so a later
   * cache-hit (fresh-skip OR failure-fallback) still carries the correct
   * "via SPY ETF" label instead of silently presenting proxy data as the
   * real index.
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

function isFresh(entry: CacheEntry): boolean {
  return Date.now() - entry.fetchedAt < REFRESH_TTL_MS
}

function logError(context: string, err: unknown) {
  console.error(`[marketFeed] ${context}:`, err instanceof Error ? err.message : err)
}

// --- Generic resolve-with-fallback ------------------------------------------
// Tries each fetcher in order; the first success is cached (proxyNote and
// all) and returned as 'live'. If every fetcher fails, the last-known-good
// cache entry (if any) is returned as 'cached' regardless of its age — only
// truly first-ever failures resolve to 'unavailable'. proxyNote always
// reflects what's actually behind the returned numbers, whether they were
// just fetched or served from cache.

interface FetchOutcome<T> {
  value: T
  proxyNote: string | null
}

interface QuoteResolution extends QuoteResult {
  proxyNote: string | null
}

interface SeriesResolution extends SeriesResult {
  proxyNote: string | null
}

async function resolveQuote(key: string, fetchers: Array<() => Promise<FetchOutcome<Quote>>>): Promise<QuoteResolution> {
  for (const fetcher of fetchers) {
    try {
      const { value, proxyNote } = await fetcher()
      cacheSet(key, 'quote', value, proxyNote)
      return { quote: value, status: 'live', fetchedAt: Date.now(), proxyNote }
    } catch (err) {
      logError(`quote ${key}`, err)
    }
  }
  const cached = memoryCache.get(key)
  if (cached && cached.kind === 'quote') {
    return { quote: cached.payload as Quote, status: 'cached', fetchedAt: cached.fetchedAt, proxyNote: cached.proxyNote }
  }
  return { quote: null, status: 'unavailable', fetchedAt: null, proxyNote: null }
}

// --- Synchronous cache peeks --------------------------------------------------
// Used by hooks to seed initial React state from whatever we already have,
// so a component mount/remount never flashes to a blank/loading UI when good
// data exists — the network refresh only ever improves on this.

function peek(key: string): CacheEntry | null {
  return memoryCache.get(key) ?? null
}

function peekQuoteResult(key: string): QuoteResolution {
  const entry = peek(key)
  if (entry && entry.kind === 'quote') {
    return { quote: entry.payload as Quote, status: 'cached', fetchedAt: entry.fetchedAt, proxyNote: entry.proxyNote }
  }
  return { quote: null, status: 'loading', fetchedAt: null, proxyNote: null }
}

function peekSeriesResult(key: string): SeriesResolution {
  const entry = peek(key)
  if (entry && entry.kind === 'series') {
    return { candles: entry.payload as Candle[], status: 'cached', fetchedAt: entry.fetchedAt, proxyNote: entry.proxyNote }
  }
  return { candles: [], status: 'loading', fetchedAt: null, proxyNote: null }
}

// --- Named markets (sp500, vix, bitcoin, …) ----------------------------------
// Yahoo serves the true index/asset directly (no plan gating), so the ETF
// proxy note from Twelve Data's fallback path only ever appears if Yahoo is
// unreachable AND Twelve Data's own index symbol is plan-gated.

function marketQuoteKey(marketId: string): string {
  return `mq|${marketId}`
}

function marketSeriesKey(marketId: string, range: RangeKey): string {
  return `ms|${marketId}|${range}`
}

// --- Per-market source lock (guarantees no mixed-scale displays) -------------
// A market's quote and its six range series (1D…5Y) are each a separate
// network request, each independently trying Yahoo (the true index, e.g.
// IXIC ~25,000) then falling back to Twelve Data's ETF proxy (e.g. QQQ ~$700)
// when Yahoo's flaky public CORS relay fails (see yahooFinance.ts). Left
// uncoordinated, one request lands on the real index while a sibling lands on
// the proxy, so the SAME symbol shows two wildly different values at once —
// the reported IXIC / RUT / VIX / SPX mismatch.
//
// So the source is decided ONCE per market and every request honors it:
//   * The first request to run for a market becomes the "decider": it prefers
//     the real index (Yahoo) and only falls back to the proxy if Yahoo can't
//     be reached, then records which source actually answered.
//   * Concurrent/later requests (any range, the quote, any component) await
//     that decision and fetch ONLY the agreed source — never re-rolling the
//     dice, never mixing scales. (claimSource is synchronous so a same-tick
//     burst of siblings all see the decider's pending decision.)
//   * A cached value is honored only when its source matches the decision, so
//     a stale proxy-scale entry can't leak onto a market that resolved to the
//     real index.
//   * The lock expires after a few minutes, so a market stuck on the proxy
//     during a Yahoo outage upgrades back to the real index once it recovers.
//
// A `note` of null means "the true index / real asset" (Yahoo, or Twelve
// Data's same-scale crypto feed); a non-null note means a differently-scaled
// ETF proxy stood in.
const SOURCE_LOCK_MS = 5 * 60 * 1000
interface SourceLock {
  note: string | null
  at: number
}
const sourceLocks = new Map<string, SourceLock>()
const pendingDecisions = new Map<string, Promise<string | null>>()

type SourceClaim =
  | { kind: 'known'; note: string | null }
  | { kind: 'await'; note: Promise<string | null> }
  | { kind: 'decide'; settle: (note: string | null) => void }

// Synchronous on purpose: the decider registers its pending decision before
// yielding so a same-tick burst of sibling requests observes it and awaits.
function claimSource(marketId: string): SourceClaim {
  const lock = sourceLocks.get(marketId)
  if (lock && Date.now() - lock.at < SOURCE_LOCK_MS) return { kind: 'known', note: lock.note }

  const pending = pendingDecisions.get(marketId)
  if (pending) return { kind: 'await', note: pending }

  let resolve!: (note: string | null) => void
  const promise = new Promise<string | null>((r) => {
    resolve = r
  })
  pendingDecisions.set(marketId, promise)

  let settled = false
  const settle = (note: string | null) => {
    if (settled) return
    settled = true
    sourceLocks.set(marketId, { note, at: Date.now() })
    pendingDecisions.delete(marketId)
    resolve(note)
  }
  return { kind: 'decide', settle }
}

type SourcedFetcher<T> = () => Promise<{ value: T; note: string | null }>

interface SourcedResult<T> {
  value: T | null
  status: DataStatus
  fetchedAt: number | null
  note: string | null
}

// Picks which fetchers to try, honoring the agreed source so we never mix a
// differently-scaled ETF proxy onto a market that resolved to the real index.
function pickFetchers<T>(
  claimKind: SourceClaim['kind'],
  note: string | null | undefined,
  hasYahoo: boolean,
  hasScaleProxy: boolean,
  yahoo: SourcedFetcher<T>,
  proxy: SourcedFetcher<T>,
): Array<SourcedFetcher<T>> {
  const yahooList = hasYahoo ? [yahoo] : []
  // Decider: no decision yet — prefer the real index, fall back to the proxy.
  if (claimKind === 'decide') return [...yahooList, proxy]
  // Locked to the real index. Include the proxy only when it's the SAME scale
  // (markets with no ETF stand-in, e.g. crypto) so resilience is kept without
  // ever mixing a differently-scaled ETF onto an index.
  if (note === null) {
    if (!hasScaleProxy) return [...yahooList, proxy]
    return yahooList.length > 0 ? yahooList : [proxy]
  }
  // Locked to the proxy scale.
  return [proxy]
}

async function fetchLocked<T extends Quote | Candle[]>(
  key: string,
  kind: 'quote' | 'series',
  fetchers: Array<SourcedFetcher<T>>,
  requireNote: string | null | undefined,
): Promise<SourcedResult<T>> {
  for (const fetcher of fetchers) {
    try {
      const { value, note } = await fetcher()
      cacheSet(key, kind, value, note)
      return { value, status: 'live', fetchedAt: Date.now(), note }
    } catch (err) {
      logError(`${kind} ${key}`, err)
    }
  }
  // Every fetcher failed — hold the last-known-good value, but only if it came
  // from the same source we're locked to, so a real-index market never falls
  // back to a differently-scaled proxy value sitting in cache. `undefined`
  // (the decider, no lock yet) accepts any cached value.
  const cached = memoryCache.get(key)
  if (cached && cached.kind === kind && (requireNote === undefined || cached.proxyNote === requireNote)) {
    return { value: cached.payload as T, status: 'cached', fetchedAt: cached.fetchedAt, note: cached.proxyNote }
  }
  return { value: null, status: 'unavailable', fetchedAt: null, note: requireNote ?? null }
}

export function peekMarketQuote(marketId: string): MarketQuoteResult {
  return peekQuoteResult(marketQuoteKey(marketId))
}

export function peekMarketSeries(marketId: string, range: RangeKey): MarketSeriesResult {
  return peekSeriesResult(marketSeriesKey(marketId, range))
}

export async function getMarketQuote(marketId: string, priority = 5): Promise<MarketQuoteResult> {
  const key = marketQuoteKey(marketId)
  const yahooSymbol = YAHOO_MARKET_SYMBOL[marketId]
  const hasScaleProxy = Boolean(MARKET_FEEDS[marketId]?.proxy)

  const claim = claimSource(marketId)
  try {
    const note: string | null | undefined =
      claim.kind === 'known' ? claim.note : claim.kind === 'await' ? await claim.note : undefined

    // Fast path: fresh cache, but only when it came from the agreed source.
    const cached = memoryCache.get(key)
    if (cached && cached.kind === 'quote' && isFresh(cached) && (note === undefined || cached.proxyNote === note)) {
      if (claim.kind === 'decide') claim.settle(cached.proxyNote)
      return { quote: cached.payload as Quote, status: 'cached', fetchedAt: cached.fetchedAt, proxyNote: cached.proxyNote }
    }

    const yahoo: SourcedFetcher<Quote> = async () => {
      const q = await fetchYahooQuote(yahooSymbol)
      return {
        note: null,
        value: {
          symbol: marketId,
          price: q.price,
          previousClose: q.previousClose,
          change: q.price - q.previousClose,
          changePct: q.previousClose !== 0 ? ((q.price - q.previousClose) / q.previousClose) * 100 : 0,
          open: q.open,
          high: q.high,
          low: q.low,
          volume: q.volume,
          name: marketId,
        },
      }
    }
    const proxy: SourcedFetcher<Quote> = async () => {
      const td = await tdGetMarketQuote(marketId, priority)
      if (!td.quote) throw new Error('Twelve Data fallback returned no quote')
      return { value: td.quote, note: td.proxyNote }
    }

    const fetchers = pickFetchers(claim.kind, note, Boolean(yahooSymbol), hasScaleProxy, yahoo, proxy)
    const out = await fetchLocked<Quote>(key, 'quote', fetchers, note)
    if (claim.kind === 'decide') claim.settle(out.status === 'unavailable' ? null : out.note)
    return { quote: out.value, status: out.status, fetchedAt: out.fetchedAt, proxyNote: out.note }
  } finally {
    // Guarantee awaiters are released even if something unexpected threw.
    if (claim.kind === 'decide') claim.settle(null)
  }
}

export async function getMarketSeries(marketId: string, range: RangeKey, priority = 5): Promise<MarketSeriesResult> {
  const key = marketSeriesKey(marketId, range)
  const yahooSymbol = YAHOO_MARKET_SYMBOL[marketId]
  const hasScaleProxy = Boolean(MARKET_FEEDS[marketId]?.proxy)

  const claim = claimSource(marketId)
  try {
    const note: string | null | undefined =
      claim.kind === 'known' ? claim.note : claim.kind === 'await' ? await claim.note : undefined

    const cached = memoryCache.get(key)
    if (cached && cached.kind === 'series' && isFresh(cached) && (note === undefined || cached.proxyNote === note)) {
      if (claim.kind === 'decide') claim.settle(cached.proxyNote)
      return { candles: cached.payload as Candle[], status: 'cached', fetchedAt: cached.fetchedAt, proxyNote: cached.proxyNote }
    }

    const yahoo: SourcedFetcher<Candle[]> = async () => ({ value: await fetchYahooSeries(yahooSymbol, range), note: null })
    const proxy: SourcedFetcher<Candle[]> = async () => {
      const td = await tdGetMarketSeries(marketId, range, priority)
      if (td.candles.length < 2) throw new Error('Twelve Data fallback returned insufficient series')
      return { value: td.candles, note: td.proxyNote }
    }

    const fetchers = pickFetchers(claim.kind, note, Boolean(yahooSymbol), hasScaleProxy, yahoo, proxy)
    const out = await fetchLocked<Candle[]>(key, 'series', fetchers, note)
    if (claim.kind === 'decide') claim.settle(out.status === 'unavailable' ? null : out.note)
    return { candles: out.value ?? [], status: out.status, fetchedAt: out.fetchedAt, proxyNote: out.note }
  } finally {
    if (claim.kind === 'decide') claim.settle(null)
  }
}

// --- Plain tickers (watchlist stocks, sector ETFs) ---------------------------

function tickerQuoteKey(symbol: string): string {
  return `q|${symbol}`
}

export function peekQuote(symbol: string): QuoteResult {
  return peekQuoteResult(tickerQuoteKey(symbol))
}

async function resolveTickerQuote(symbol: string, priority: number): Promise<QuoteResult> {
  const key = tickerQuoteKey(symbol)
  const cached = memoryCache.get(key)
  if (cached && cached.kind === 'quote' && isFresh(cached)) {
    return { quote: cached.payload as Quote, status: 'cached', fetchedAt: cached.fetchedAt }
  }

  const yahooSymbol = yahooSymbolForTicker(symbol)
  return resolveQuote(key, [
    async (): Promise<FetchOutcome<Quote>> => {
      const q = await fetchYahooQuote(yahooSymbol)
      return {
        proxyNote: null,
        value: {
          symbol,
          price: q.price,
          previousClose: q.previousClose,
          change: q.price - q.previousClose,
          changePct: q.previousClose !== 0 ? ((q.price - q.previousClose) / q.previousClose) * 100 : 0,
          open: q.open,
          high: q.high,
          low: q.low,
          volume: q.volume,
          name: symbol,
        },
      }
    },
    async (): Promise<FetchOutcome<Quote>> => {
      const td = await tdGetQuote(symbol, priority)
      if (!td.quote) throw new Error('Twelve Data fallback returned no quote')
      return { value: td.quote, proxyNote: null }
    },
  ])
}

export interface GetQuotesOptions {
  priority?: number
  /** Called with partial results as each symbol resolves (order not guaranteed). */
  onPartial?: (partial: Record<string, QuoteResult>) => void
}

/**
 * Quotes for a list of tickers. Each symbol resolves independently — one
 * slow or failing symbol never blocks or blanks the others — with Yahoo
 * tried first and Twelve Data as fallback per symbol.
 */
export async function getQuotes(symbols: string[], options: GetQuotesOptions = {}): Promise<Record<string, QuoteResult>> {
  const { priority = 5, onPartial } = options
  const results: Record<string, QuoteResult> = {}

  await Promise.all(
    symbols.map(async (symbol) => {
      const result = await resolveTickerQuote(symbol, priority)
      results[symbol] = result
      onPartial?.({ [symbol]: result })
    }),
  )

  return results
}

export async function getQuote(symbol: string, priority = 5): Promise<QuoteResult> {
  return resolveTickerQuote(symbol, priority)
}

// --- Badge helpers ------------------------------------------------------------

/** Human label for a badge: "LIVE", "CACHED · 4m ago" / "· 3h ago" / "· 2d ago", or "DATA UNAVAILABLE". */
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
