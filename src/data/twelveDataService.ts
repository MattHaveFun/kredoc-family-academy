import type { Candle, RangeKey } from './markets'

// ---------------------------------------------------------------------------
// Twelve Data service — the single source of market data for the whole site.
//
// The free tier allows 8 API credits per minute and 800 per day, where a
// batch quote request costs one credit PER SYMBOL. Those limits are treated
// as a first-class design constraint here:
//
//   1. Every request flows through a priority queue guarded by a sliding
//      60-second credit window (max 8 credits) and a persisted daily counter
//      that stops issuing requests near the 800/day ceiling.
//   2. Every successful (already reshaped) response is cached in memory and
//      localStorage. Fresh cache hits cost zero credits. Stale cache is kept
//      around indefinitely as a fallback so an outage or exhausted budget
//      degrades to "CACHED · Xm ago" instead of a blank chart.
//   3. Batch quotes are chunked to ≤8 symbols so a single request can never
//      exceed the entire per-minute window.
//
// Nothing in this module ever throws to the UI: every public function
// resolves to a result object whose `status` is 'live', 'cached', or
// 'unavailable'.
// ---------------------------------------------------------------------------

const API_BASE = 'https://api.twelvedata.com'
const API_KEY: string = import.meta.env.VITE_TWELVEDATA_API_KEY ?? ''

/** How long a cached response is considered fresh (no refetch, badge says LIVE-equivalent CACHED). */
export const CACHE_TTL_MS = 10 * 60 * 1000 // 10 minutes — tune here
const REQUEST_TIMEOUT_MS = 8_000
const WINDOW_MS = 60_000
const CREDITS_PER_WINDOW = 8
const DAILY_LIMIT = 800
/** Stop issuing new requests once the daily count reaches this, keeping a safety buffer. */
const DAILY_SOFT_CEILING = 760
const MAX_BATCH = CREDITS_PER_WINDOW // a single request may never need more credits than one window holds

const CACHE_STORAGE_KEY = 'kredoc.td.cache.v2'
const DAILY_STORAGE_KEY = 'kredoc.td.daily.v1'
const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000 // prune anything older than a day on load

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

// --- Symbol mapping --------------------------------------------------------
// Twelve Data quirks, verified against the live API:
//  * US index symbols drop Yahoo's caret: ^GSPC → SPX, ^IXIC → IXIC,
//    ^DJI → DJI, ^RUT → RUT, ^VIX → VIX. HOWEVER, the raw index symbols are
//    NOT included in the free plan — the API answers 404 "available starting
//    with the Grow plan." Each market therefore carries an ETF proxy that IS
//    on the free plan; the service tries the true index first (so a plan
//    upgrade lights it up automatically) and falls back to the proxy,
//    surfacing a `proxyNote` so the UI can label it honestly (e.g. "via SPY").
//  * Crypto pairs use a slash: BTC-USD → BTC/USD (free plan: works).
//  * Berkshire class B keeps the dot (BRK.B), unlike Yahoo's BRK-B.
//  * Sector exposure uses the SPDR sector ETFs directly (XLK…XLC) since the
//    raw GICS sector indices are likewise gated to paid plans.
export interface MarketFeed {
  primary: string
  proxy?: { symbol: string; note: string }
}

export const MARKET_FEEDS: Record<string, MarketFeed> = {
  sp500: { primary: 'SPX', proxy: { symbol: 'SPY', note: 'via SPY ETF' } },
  nasdaq: { primary: 'IXIC', proxy: { symbol: 'QQQ', note: 'via QQQ ETF (Nasdaq-100)' } },
  dow: { primary: 'DJI', proxy: { symbol: 'DIA', note: 'via DIA ETF' } },
  russell2000: { primary: 'RUT', proxy: { symbol: 'IWM', note: 'via IWM ETF' } },
  vix: { primary: 'VIX', proxy: { symbol: 'VIXY', note: 'via VIXY ETF (VIX futures)' } },
  bitcoin: { primary: 'BTC/USD' },
}

// Symbols the API has told us are off-plan are remembered for a day so we
// don't burn a credit re-probing them on every page load.
const DEAD_SYMBOLS_KEY = 'kredoc.td.deadsymbols.v1'
const DEAD_SYMBOL_TTL_MS = 24 * 60 * 60 * 1000

function readDeadSymbols(): Record<string, number> {
  try {
    const raw = localStorage.getItem(DEAD_SYMBOLS_KEY)
    if (raw) return JSON.parse(raw) as Record<string, number>
  } catch {
    // unreadable — treat as empty
  }
  return {}
}

function isSymbolDead(symbol: string): boolean {
  const diedAt = readDeadSymbols()[symbol]
  return diedAt !== undefined && Date.now() - diedAt < DEAD_SYMBOL_TTL_MS
}

function markSymbolDead(symbol: string) {
  const dead = readDeadSymbols()
  dead[symbol] = Date.now()
  try {
    localStorage.setItem(DEAD_SYMBOLS_KEY, JSON.stringify(dead))
  } catch {
    // in-memory only this session
  }
}

/** Thrown when the API says a symbol isn't available on this plan. */
class SymbolUnavailableError extends Error {}

const RANGE_TO_TD: Record<RangeKey, { interval: string; outputsize: number }> = {
  '1D': { interval: '5min', outputsize: 78 }, // 6.5h regular session of 5-minute bars
  '1W': { interval: '15min', outputsize: 130 }, // ~5 sessions
  '1M': { interval: '1day', outputsize: 22 },
  '3M': { interval: '1day', outputsize: 66 },
  '1Y': { interval: '1week', outputsize: 52 },
  '5Y': { interval: '1week', outputsize: 260 },
}

// --- Key hygiene -----------------------------------------------------------
// Errors are logged for debugging but must never leak the API key (it lives
// in request URLs) or raw provider payloads into anything user-visible.
function sanitize(message: string): string {
  return API_KEY ? message.split(API_KEY).join('[apikey]') : message
}

function logError(context: string, err: unknown) {
  const message = err instanceof Error ? err.message : String(err)
  console.error(`[twelveData] ${context}: ${sanitize(message)}`)
}

// --- Daily budget ----------------------------------------------------------
interface DailyCount {
  date: string // local YYYY-MM-DD; counter resets when the date rolls over
  used: number
}

function todayStamp(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function readDaily(): DailyCount {
  try {
    const raw = localStorage.getItem(DAILY_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as DailyCount
      if (parsed.date === todayStamp() && typeof parsed.used === 'number') return parsed
    }
  } catch {
    // corrupted storage — start over
  }
  return { date: todayStamp(), used: 0 }
}

function spendDaily(credits: number) {
  const daily = readDaily()
  daily.used += credits
  try {
    localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify(daily))
  } catch {
    // storage full/unavailable — the in-window limiter still protects us
  }
}

function dailyBudgetRemaining(): number {
  return DAILY_SOFT_CEILING - readDaily().used
}

// --- Cache -----------------------------------------------------------------
// Cached values are the fully reshaped Quote/Candle[] structures, so a cache
// hit skips both the network round trip and the reshaping work.
interface CacheEntry {
  fetchedAt: number
  kind: 'quote' | 'series'
  payload: Quote | Candle[]
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
    // unreadable cache — treat as empty
  }
}

let persistScheduled = false
function persistCache() {
  if (persistScheduled) return
  persistScheduled = true
  setTimeout(() => {
    persistScheduled = false
    try {
      localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(Object.fromEntries(memoryCache)))
    } catch {
      // storage quota — in-memory cache still works for this session
    }
  }, 250)
}

loadPersistedCache()

function cacheSet(key: string, kind: CacheEntry['kind'], payload: Quote | Candle[]) {
  memoryCache.set(key, { fetchedAt: Date.now(), kind, payload })
  persistCache()
}

function cacheGet(key: string): CacheEntry | null {
  return memoryCache.get(key) ?? null
}

function isFresh(entry: CacheEntry): boolean {
  return Date.now() - entry.fetchedAt < CACHE_TTL_MS
}

// --- Rate-limited request queue ---------------------------------------------
interface QueuedRequest {
  credits: number
  priority: number // lower = sooner
  seq: number // FIFO tie-breaker within a priority
  run: () => void // fire the actual fetch; limiter has already charged credits
}

let seqCounter = 0
const queue: QueuedRequest[] = []
const windowLog: number[] = [] // timestamp per credit spent, pruned past 60s

function creditsAvailable(): number {
  const cutoff = Date.now() - WINDOW_MS
  while (windowLog.length > 0 && windowLog[0] <= cutoff) windowLog.shift()
  return CREDITS_PER_WINDOW - windowLog.length
}

let pumpTimer: ReturnType<typeof setTimeout> | null = null

function pump() {
  if (pumpTimer) {
    clearTimeout(pumpTimer)
    pumpTimer = null
  }

  while (queue.length > 0) {
    queue.sort((a, b) => a.priority - b.priority || a.seq - b.seq)
    const head = queue[0]
    const available = creditsAvailable()
    if (head.credits > available) {
      // Wake up when the oldest window entry expires and frees a credit.
      const oldest = windowLog[0]
      const delay = oldest ? Math.max(oldest + WINDOW_MS - Date.now(), 100) : 250
      pumpTimer = setTimeout(pump, delay)
      return
    }
    queue.shift()
    const now = Date.now()
    for (let i = 0; i < head.credits; i++) windowLog.push(now)
    spendDaily(head.credits)
    head.run()
  }
}

/** Resolves when the limiter grants the credits; rejects immediately if the daily budget is gone. */
function acquireCredits(credits: number, priority: number): Promise<void> {
  return new Promise((resolve, reject) => {
    if (dailyBudgetRemaining() < credits) {
      reject(new Error('Daily request budget exhausted'))
      return
    }
    queue.push({ credits, priority, seq: seqCounter++, run: resolve })
    pump()
  })
}

// --- Fetch helpers ----------------------------------------------------------
interface TdErrorShape {
  status?: string
  code?: number
  message?: string
}

// Twelve Data reports "symbol not on your plan" as HTTP 404/403 with an
// error JSON body — distinguish that (permanent for this key) from transient
// network/rate failures so callers can switch to the ETF proxy.
function isPlanGated(code: number | undefined, message: string | undefined): boolean {
  return code === 404 || code === 403 || /plan|upgrad/i.test(message ?? '')
}

async function tdFetch(path: string, params: Record<string, string>): Promise<unknown> {
  const query = new URLSearchParams({ ...params, apikey: API_KEY })
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const res = await fetch(`${API_BASE}${path}?${query}`, { signal: controller.signal })
    const data = (await res.json().catch(() => null)) as unknown
    const maybeError = data as TdErrorShape | null
    if (maybeError && maybeError.status === 'error') {
      const message = maybeError.message ?? `API error code ${maybeError.code}`
      if (isPlanGated(maybeError.code, maybeError.message)) throw new SymbolUnavailableError(message)
      throw new Error(message)
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    if (data === null) throw new Error('Malformed response')
    return data
  } finally {
    clearTimeout(timeout)
  }
}

function num(value: unknown): number | null {
  if (value == null) return null
  const n = typeof value === 'number' ? value : parseFloat(String(value))
  return Number.isFinite(n) ? n : null
}

// --- Quote ------------------------------------------------------------------
interface TdQuotePayload {
  symbol?: string
  name?: string
  open?: string
  high?: string
  low?: string
  close?: string
  volume?: string
  previous_close?: string
  change?: string
  percent_change?: string
  status?: string
  code?: number
  message?: string
}

function reshapeQuote(symbol: string, raw: TdQuotePayload): Quote | null {
  const price = num(raw.close)
  const previousClose = num(raw.previous_close)
  if (price == null || previousClose == null) return null
  return {
    symbol,
    price,
    change: num(raw.change) ?? price - previousClose,
    changePct: num(raw.percent_change) ?? (previousClose !== 0 ? ((price - previousClose) / previousClose) * 100 : 0),
    open: num(raw.open) ?? price,
    high: num(raw.high) ?? price,
    low: num(raw.low) ?? price,
    previousClose,
    volume: num(raw.volume) ?? 0,
    name: raw.name ?? symbol,
  }
}

function quoteCacheKey(symbol: string): string {
  return `q|${symbol}`
}

function resultFromCache(entry: CacheEntry | null): QuoteResult {
  if (entry && entry.kind === 'quote') {
    return { quote: entry.payload as Quote, status: 'cached', fetchedAt: entry.fetchedAt }
  }
  return { quote: null, status: 'unavailable', fetchedAt: null }
}

// In-flight de-dupe so two components asking for the same symbols don't
// double-spend credits.
const inflightQuotes = new Map<string, Promise<Record<string, QuoteResult>>>()

async function fetchQuoteChunk(symbols: string[], priority: number): Promise<Record<string, QuoteResult>> {
  const results: Record<string, QuoteResult> = {}
  try {
    await acquireCredits(symbols.length, priority)
    const data = await tdFetch('/quote', { symbol: symbols.join(',') })

    // Single-symbol requests return the quote object directly; batches return
    // an object keyed by symbol.
    const bySymbol: Record<string, TdQuotePayload> =
      symbols.length === 1
        ? { [symbols[0]]: data as TdQuotePayload }
        : (data as Record<string, TdQuotePayload>)

    const now = Date.now()
    for (const symbol of symbols) {
      const raw = bySymbol[symbol]
      const quote = raw && raw.status !== 'error' ? reshapeQuote(symbol, raw) : null
      if (quote) {
        cacheSet(quoteCacheKey(symbol), 'quote', quote)
        results[symbol] = { quote, status: 'live', fetchedAt: now }
      } else {
        if (raw && raw.status === 'error' && isPlanGated(raw.code, raw.message)) markSymbolDead(symbol)
        results[symbol] = resultFromCache(cacheGet(quoteCacheKey(symbol)))
      }
    }
  } catch (err) {
    if (err instanceof SymbolUnavailableError && symbols.length === 1) markSymbolDead(symbols[0])
    logError(`quote ${symbols.join(',')}`, err)
    for (const symbol of symbols) {
      results[symbol] = resultFromCache(cacheGet(quoteCacheKey(symbol)))
    }
  }
  return results
}

export interface GetQuotesOptions {
  /** Lower runs sooner when the credit window is contended. Default 5. */
  priority?: number
  /** Called with partial results as each ≤8-symbol chunk lands. */
  onPartial?: (partial: Record<string, QuoteResult>) => void
}

/**
 * Real-time quotes for one or more Twelve Data symbols. Fresh cache entries
 * are returned immediately at zero credit cost; the rest are fetched in
 * batches of at most 8 symbols (one credit each).
 */
export async function getQuotes(
  symbols: string[],
  options: GetQuotesOptions = {},
): Promise<Record<string, QuoteResult>> {
  const { priority = 5, onPartial } = options
  const results: Record<string, QuoteResult> = {}
  const toFetch: string[] = []

  for (const symbol of symbols) {
    const entry = cacheGet(quoteCacheKey(symbol))
    if (entry && entry.kind === 'quote') {
      // Serve cache immediately — even stale — so the UI never sits empty
      // while a refresh waits in the rate-limited queue. Stale symbols are
      // still refreshed below and the fresh values overwrite these.
      results[symbol] = { quote: entry.payload as Quote, status: 'cached', fetchedAt: entry.fetchedAt }
      if (!isFresh(entry)) toFetch.push(symbol)
    } else {
      toFetch.push(symbol)
    }
  }
  if (Object.keys(results).length > 0) onPartial?.({ ...results })

  const chunks: string[][] = []
  for (let i = 0; i < toFetch.length; i += MAX_BATCH) chunks.push(toFetch.slice(i, i + MAX_BATCH))

  for (const chunk of chunks) {
    const key = `quotes|${chunk.join(',')}`
    let promise = inflightQuotes.get(key)
    if (!promise) {
      promise = fetchQuoteChunk(chunk, priority).finally(() => inflightQuotes.delete(key))
      inflightQuotes.set(key, promise)
    }
    const chunkResults = await promise
    Object.assign(results, chunkResults)
    onPartial?.({ ...chunkResults })
  }

  return results
}

/** Convenience wrapper for a single symbol. */
export async function getQuote(symbol: string, priority = 5): Promise<QuoteResult> {
  const all = await getQuotes([symbol], { priority })
  return all[symbol] ?? { quote: null, status: 'unavailable', fetchedAt: null }
}

// --- Time series -------------------------------------------------------------
interface TdSeriesValue {
  datetime: string
  open: string
  high: string
  low: string
  close: string
  volume?: string
}

interface TdSeriesPayload {
  values?: TdSeriesValue[]
}

function seriesCacheKey(symbol: string, range: RangeKey): string {
  return `s|${symbol}|${range}`
}

function reshapeSeries(payload: TdSeriesPayload): Candle[] {
  const values = payload.values ?? []
  const candles: Candle[] = []
  // Twelve Data returns values newest-first; the chart wants oldest-first.
  for (let i = values.length - 1; i >= 0; i--) {
    const v = values[i]
    const open = num(v.open)
    const high = num(v.high)
    const low = num(v.low)
    const close = num(v.close)
    if (open == null || high == null || low == null || close == null) continue
    // Datetimes come back in exchange-local time without an offset; parsing
    // as local time keeps bar spacing correct, which is all the chart needs.
    const time = Math.floor(new Date(v.datetime.includes(' ') ? v.datetime.replace(' ', 'T') : v.datetime).getTime() / 1000)
    // Indices report no volume; normalize to 0 rather than dropping the bar.
    candles.push({ time, open, high, low, close, volume: num(v.volume) ?? 0 })
  }
  return candles
}

function seriesFromCache(entry: CacheEntry | null): SeriesResult {
  if (entry && entry.kind === 'series') {
    return { candles: entry.payload as Candle[], status: 'cached', fetchedAt: entry.fetchedAt }
  }
  return { candles: [], status: 'unavailable', fetchedAt: null }
}

const inflightSeries = new Map<string, Promise<SeriesResult>>()

/**
 * OHLCV time series for a symbol and dashboard range (1D…5Y), reshaped into
 * the Candle[] the chart components consume.
 *
 * Credit saver: a 1M request is served by slicing a fresh 3M daily series if
 * one is cached (both use 1-day bars), so the mini-cards ride along free
 * whenever the main chart has recently loaded the same symbol.
 */
export async function getTimeSeries(symbol: string, range: RangeKey, priority = 5): Promise<SeriesResult> {
  const key = seriesCacheKey(symbol, range)
  const cached = cacheGet(key)
  if (cached && cached.kind === 'series' && isFresh(cached)) {
    return { candles: cached.payload as Candle[], status: 'cached', fetchedAt: cached.fetchedAt }
  }

  if (range === '1M') {
    const quarterly = cacheGet(seriesCacheKey(symbol, '3M'))
    if (quarterly && quarterly.kind === 'series' && isFresh(quarterly)) {
      const sliced = (quarterly.payload as Candle[]).slice(-RANGE_TO_TD['1M'].outputsize)
      if (sliced.length >= 2) {
        return { candles: sliced, status: 'cached', fetchedAt: quarterly.fetchedAt }
      }
    }
  }

  let promise = inflightSeries.get(key)
  if (!promise) {
    promise = (async (): Promise<SeriesResult> => {
      try {
        await acquireCredits(1, priority)
        const { interval, outputsize } = RANGE_TO_TD[range]
        const data = (await tdFetch('/time_series', {
          symbol,
          interval,
          outputsize: String(outputsize),
        })) as TdSeriesPayload
        const candles = reshapeSeries(data)
        if (candles.length < 2) throw new Error('Series returned insufficient data')
        cacheSet(key, 'series', candles)
        return { candles, status: 'live', fetchedAt: Date.now() }
      } catch (err) {
        if (err instanceof SymbolUnavailableError) markSymbolDead(symbol)
        logError(`series ${symbol} ${range}`, err)
        return seriesFromCache(cacheGet(key))
      } finally {
        inflightSeries.delete(key)
      }
    })()
    inflightSeries.set(key, promise)
  }

  // A stale series is still a chart: serve it immediately (honestly labeled
  // with its age) while the refresh queues in the background — the next
  // visit or tab switch picks up the fresh data.
  if (cached && cached.kind === 'series') {
    promise.catch(() => {}) // refresh failures already fall back internally
    return { candles: cached.payload as Candle[], status: 'cached', fetchedAt: cached.fetchedAt }
  }

  return promise
}

// --- Market-level access (index → ETF proxy fallback) ------------------------
// The dashboard's six markets are requested through these wrappers, which try
// the true index symbol first and fall back to the ETF proxy the free plan
// allows — tagging results with `proxyNote` so the UI can say "via SPY".

export interface MarketSeriesResult extends SeriesResult {
  sourceSymbol: string | null
  proxyNote: string | null
}

export interface MarketQuoteResult extends QuoteResult {
  sourceSymbol: string | null
  proxyNote: string | null
}

function feedCandidates(marketId: string): Array<{ symbol: string; note: string | null }> {
  const feed = MARKET_FEEDS[marketId]
  if (!feed) return []
  const candidates: Array<{ symbol: string; note: string | null }> = []
  if (!isSymbolDead(feed.primary)) candidates.push({ symbol: feed.primary, note: null })
  if (feed.proxy && !isSymbolDead(feed.proxy.symbol)) {
    candidates.push({ symbol: feed.proxy.symbol, note: feed.proxy.note })
  }
  // If everything is marked dead (e.g. clock weirdness), still try the proxy
  // rather than giving up outright.
  if (candidates.length === 0 && feed.proxy) candidates.push({ symbol: feed.proxy.symbol, note: feed.proxy.note })
  return candidates
}

export async function getMarketSeries(
  marketId: string,
  range: RangeKey,
  priority = 5,
): Promise<MarketSeriesResult> {
  let last: MarketSeriesResult = {
    candles: [],
    status: 'unavailable',
    fetchedAt: null,
    sourceSymbol: null,
    proxyNote: null,
  }
  for (const candidate of feedCandidates(marketId)) {
    const result = await getTimeSeries(candidate.symbol, range, priority)
    last = { ...result, sourceSymbol: candidate.symbol, proxyNote: candidate.note }
    if (result.status !== 'unavailable') return last
  }
  return last
}

export async function getMarketQuote(marketId: string, priority = 5): Promise<MarketQuoteResult> {
  let last: MarketQuoteResult = {
    quote: null,
    status: 'unavailable',
    fetchedAt: null,
    sourceSymbol: null,
    proxyNote: null,
  }
  for (const candidate of feedCandidates(marketId)) {
    const result = await getQuote(candidate.symbol, priority)
    last = { ...result, sourceSymbol: candidate.symbol, proxyNote: candidate.note }
    if (result.status !== 'unavailable') return last
  }
  return last
}

// --- Introspection helpers (badges, debugging) -------------------------------
export function getDailyUsage(): { used: number; limit: number } {
  return { used: readDaily().used, limit: DAILY_LIMIT }
}

export function hasApiKey(): boolean {
  return API_KEY.length > 0
}

/** Human label for a badge: "LIVE", "CACHED · 4m ago", or "DATA UNAVAILABLE". */
export function describeStatus(status: DataStatus, fetchedAt: number | null): string {
  if (status === 'live') return 'LIVE'
  if (status === 'cached' && fetchedAt) {
    const mins = Math.max(0, Math.round((Date.now() - fetchedAt) / 60_000))
    return mins < 1 ? 'CACHED · just now' : `CACHED · ${mins}m ago`
  }
  if (status === 'loading') return 'CONNECTING'
  return 'DATA UNAVAILABLE'
}
