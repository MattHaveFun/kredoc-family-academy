import { generateSeries, type Candle, type MarketSymbol, type RangeKey } from './markets'

// Yahoo Finance's public chart endpoint is unofficial, undocumented, and
// sends no CORS headers, so browser requests are routed through a public
// CORS relay. Free relays are individually flaky under load (observed 429s,
// timeouts, and 5xx responses in testing), so requests are tried against
// each relay in order and only fall through to the next on failure. If
// every relay and Yahoo itself are unreachable, every function below
// resolves to a simulated series instead of throwing — callers always get
// usable data, real or synthetic, never a blank chart.
const YAHOO_CHART_URL = 'https://query1.finance.yahoo.com/v8/finance/chart/'
const CORS_PROXIES: Array<(target: string) => string> = [
  (target) => `https://api.allorigins.win/raw?url=${encodeURIComponent(target)}`,
  (target) => `https://corsproxy.io/?url=${encodeURIComponent(target)}`,
]
const PROXY_TIMEOUT_MS = 7_000

export type FeedState = 'connecting' | 'live' | 'sim'

const MARKET_TO_YAHOO_SYMBOL: Record<string, string> = {
  sp500: '^GSPC',
  nasdaq: '^IXIC',
  dow: '^DJI',
  russell2000: '^RUT',
  vix: '^VIX',
  bitcoin: 'BTC-USD',
}

// A handful of tickers shown on the page differ from what Yahoo expects.
const TICKER_SYMBOL_OVERRIDES: Record<string, string> = {
  'BRK.B': 'BRK-B',
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

// De-dupes and rate-limits identical requests fired close together (e.g. a
// MarketCard and the main panel both asking for the same symbol's 1M range).
const requestCache = new Map<string, { ts: number; promise: Promise<YahooChartResult> }>()
const CACHE_TTL_MS = 30_000

async function fetchWithTimeout(url: string, timeoutMs: number, signal?: AbortSignal): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  const onExternalAbort = () => controller.abort()
  signal?.addEventListener('abort', onExternalAbort)
  try {
    return await fetch(url, { signal: controller.signal })
  } finally {
    clearTimeout(timeoutId)
    signal?.removeEventListener('abort', onExternalAbort)
  }
}

async function fetchYahooChart(
  symbol: string,
  range: string,
  interval: string,
  signal?: AbortSignal,
): Promise<YahooChartResult> {
  const cacheKey = `${symbol}:${range}:${interval}`
  const cached = requestCache.get(cacheKey)
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return cached.promise
  }

  const target = `${YAHOO_CHART_URL}${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`
  const promise = (async () => {
    let lastError: unknown = new Error('No CORS relay configured')

    for (const buildProxyUrl of CORS_PROXIES) {
      try {
        const res = await fetchWithTimeout(buildProxyUrl(target), PROXY_TIMEOUT_MS, signal)
        if (!res.ok) throw new Error(`Feed request failed (${res.status})`)
        const data = (await res.json()) as YahooChartResponse
        const result = data.chart.result?.[0]
        if (!result) throw new Error(data.chart.error?.description ?? 'No chart data returned')
        return result
      } catch (err) {
        lastError = err
        if (signal?.aborted) throw err // caller cancelled — stop trying other relays
      }
    }

    throw lastError
  })()

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

export async function fetchLiveSeries(
  market: MarketSymbol,
  range: RangeKey,
  signal?: AbortSignal,
): Promise<Candle[]> {
  const symbol = MARKET_TO_YAHOO_SYMBOL[market.id]
  if (!symbol) throw new Error(`No live symbol mapped for ${market.id}`)

  const { range: yahooRange, interval } = RANGE_TO_YAHOO[range]
  const result = await fetchYahooChart(symbol, yahooRange, interval, signal)
  const candles = toCandles(result)
  if (candles.length < 2) throw new Error('Live feed returned insufficient data')
  return candles
}

/** Same shape as fetchLiveSeries, but never throws — resolves to the deterministic simulated series on failure. */
export async function fetchSeriesWithFallback(
  market: MarketSymbol,
  range: RangeKey,
  signal?: AbortSignal,
): Promise<{ candles: Candle[]; status: FeedState }> {
  try {
    const candles = await fetchLiveSeries(market, range, signal)
    return { candles, status: 'live' }
  } catch {
    return { candles: generateSeries(market, range), status: 'sim' }
  }
}

export interface LiveQuote {
  symbol: string
  price: number
  changePct: number
}

export async function fetchLiveQuote(symbol: string, signal?: AbortSignal): Promise<LiveQuote> {
  const yahooSymbol = TICKER_SYMBOL_OVERRIDES[symbol] ?? symbol
  const result = await fetchYahooChart(yahooSymbol, '1d', '1d', signal)
  const price = result.meta.regularMarketPrice
  const previousClose = result.meta.previousClose ?? result.meta.chartPreviousClose
  if (price == null || previousClose == null) throw new Error('Live quote missing price data')
  return { symbol, price, changePct: ((price - previousClose) / previousClose) * 100 }
}
