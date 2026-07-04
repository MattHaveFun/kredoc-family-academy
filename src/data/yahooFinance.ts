import type { Candle, RangeKey } from './markets'

// ---------------------------------------------------------------------------
// Yahoo Finance — the PRIMARY market data source for the whole site.
//
// Yahoo's public chart endpoint is unofficial, undocumented, sends no CORS
// headers, and has no published rate limit — but it also isn't gated by a
// paid-plan wall the way Twelve Data's raw index symbols are, and it already
// proved reliable in this project's first live-data pass. Requests are routed
// through a public CORS relay; free relays are individually flaky under load
// (observed 429s, timeouts, and 5xx responses), so each request tries every
// relay in order before giving up, and a light concurrency cap keeps the app
// from hammering a relay with a burst of parallel requests.
//
// This module only ever resolves with real data or throws — it has no
// fallback/caching logic of its own. src/data/marketFeed.ts is the layer that
// tries this first, falls back to Twelve Data on failure, and holds the last
// good value forever so a bad call never blanks the UI.
// ---------------------------------------------------------------------------

const YAHOO_CHART_URL = 'https://query1.finance.yahoo.com/v8/finance/chart/'
const CORS_PROXIES: Array<(target: string) => string> = [
  (target) => `https://api.allorigins.win/raw?url=${encodeURIComponent(target)}`,
  (target) => `https://corsproxy.io/?url=${encodeURIComponent(target)}`,
]
const PROXY_TIMEOUT_MS = 7_000

// Six dashboard "markets" (see src/data/markets.ts) mapped to their Yahoo
// ticker. Unlike Twelve Data's free plan, Yahoo's chart endpoint serves raw
// index levels directly — no ETF-proxy substitution needed here.
export const YAHOO_MARKET_SYMBOL: Record<string, string> = {
  sp500: '^GSPC',
  nasdaq: '^IXIC',
  dow: '^DJI',
  russell2000: '^RUT',
  vix: '^VIX',
  bitcoin: 'BTC-USD',
}

// A handful of watchlist/sector tickers differ from what Yahoo expects.
const YAHOO_TICKER_OVERRIDES: Record<string, string> = {
  'BRK.B': 'BRK-B',
}

export function yahooSymbolForTicker(ticker: string): string {
  return YAHOO_TICKER_OVERRIDES[ticker] ?? ticker
}

const RANGE_TO_YAHOO: Record<RangeKey, { range: string; interval: string }> = {
  '1D': { range: '1d', interval: '5m' },
  '1W': { range: '5d', interval: '15m' },
  '1M': { range: '1mo', interval: '1d' },
  '3M': { range: '3mo', interval: '1d' },
  '1Y': { range: '1y', interval: '1wk' },
  '5Y': { range: '5y', interval: '1wk' },
}

interface YahooChartMeta {
  regularMarketPrice?: number
  previousClose?: number
  chartPreviousClose?: number
  regularMarketVolume?: number
  regularMarketDayHigh?: number
  regularMarketDayLow?: number
  regularMarketOpen?: number
}

interface YahooChartResult {
  meta: YahooChartMeta
  timestamp?: number[]
  indicators: {
    quote: Array<{
      open: Array<number | null>
      high: Array<number | null>
      low: Array<number | null>
      close: Array<number | null>
      volume: Array<number | null>
    }>
  }
}

interface YahooChartResponse {
  chart: {
    result: YahooChartResult[] | null
    error: { code: string; description: string } | null
  }
}

// De-dupes identical requests fired close together (e.g. a MarketCard and the
// main panel both asking for the same symbol's 1M range within the same tick).
const requestCache = new Map<string, { ts: number; promise: Promise<YahooChartResult> }>()
const DEDUPE_TTL_MS = 20_000

// --- Concurrency limiter -----------------------------------------------------
// Yahoo has no formal rate limit, but the free CORS relays get flaky under a
// burst of parallel requests (dashboard load can want 20+ symbols at once).
// Capping in-flight requests smooths that out without adding artificial delay
// when only a few symbols are in play.
const MAX_CONCURRENT = 6
let active = 0
const waiters: Array<() => void> = []

async function withConcurrencyLimit<T>(fn: () => Promise<T>): Promise<T> {
  if (active >= MAX_CONCURRENT) {
    await new Promise<void>((resolve) => waiters.push(resolve))
  }
  active++
  try {
    return await fn()
  } finally {
    active--
    const next = waiters.shift()
    if (next) next()
  }
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { signal: controller.signal })
  } finally {
    clearTimeout(timeoutId)
  }
}

async function fetchYahooChart(symbol: string, range: string, interval: string): Promise<YahooChartResult> {
  const cacheKey = `${symbol}:${range}:${interval}`
  const cached = requestCache.get(cacheKey)
  if (cached && Date.now() - cached.ts < DEDUPE_TTL_MS) {
    return cached.promise
  }

  const target = `${YAHOO_CHART_URL}${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`
  const promise = withConcurrencyLimit(async () => {
    let lastError: unknown = new Error('No CORS relay configured')

    for (const buildProxyUrl of CORS_PROXIES) {
      try {
        const res = await fetchWithTimeout(buildProxyUrl(target), PROXY_TIMEOUT_MS)
        if (!res.ok) throw new Error(`Feed request failed (${res.status})`)
        const data = (await res.json()) as YahooChartResponse
        const result = data.chart.result?.[0]
        if (!result) throw new Error(data.chart.error?.description ?? 'No chart data returned')
        return result
      } catch (err) {
        lastError = err
      }
    }

    throw lastError
  })

  requestCache.set(cacheKey, { ts: Date.now(), promise })
  promise.catch(() => requestCache.delete(cacheKey))
  return promise
}

function toCandles(result: YahooChartResult): Candle[] {
  const timestamps = result.timestamp ?? []
  const quote = result.indicators.quote[0]
  const candles: Candle[] = []

  for (let i = 0; i < timestamps.length; i++) {
    const open = quote.open[i]
    const high = quote.high[i]
    const low = quote.low[i]
    const close = quote.close[i]
    if (open == null || high == null || low == null || close == null) continue
    candles.push({ time: timestamps[i], open, high, low, close, volume: quote.volume[i] ?? 0 })
  }

  return candles
}

/** Throws on any failure — callers (marketFeed.ts) handle fallback + caching. */
export async function fetchYahooSeries(symbol: string, range: RangeKey): Promise<Candle[]> {
  const { range: yahooRange, interval } = RANGE_TO_YAHOO[range]
  const result = await fetchYahooChart(symbol, yahooRange, interval)
  const candles = toCandles(result)
  if (candles.length < 2) throw new Error('Yahoo returned insufficient series data')
  return candles
}

export interface YahooQuote {
  price: number
  previousClose: number
  open: number
  high: number
  low: number
  volume: number
}

/** Throws on any failure — callers (marketFeed.ts) handle fallback + caching. */
export async function fetchYahooQuote(symbol: string): Promise<YahooQuote> {
  const result = await fetchYahooChart(symbol, '1d', '1d')
  const meta = result.meta
  const price = meta.regularMarketPrice
  const previousClose = meta.previousClose ?? meta.chartPreviousClose
  if (price == null || previousClose == null) throw new Error('Yahoo quote missing price data')
  return {
    price,
    previousClose,
    open: meta.regularMarketOpen ?? price,
    high: meta.regularMarketDayHigh ?? price,
    low: meta.regularMarketDayLow ?? price,
    volume: meta.regularMarketVolume ?? 0,
  }
}
