import type { Candle, RangeKey } from './markets'
import { getCachedPayload, todayStamp, type DailyPayload } from './dailyUpdate'

// ---------------------------------------------------------------------------
// marketFeed — the read-only layer every hook goes through. There is no
// fetching logic here anymore: everything comes from the single payload
// dailyUpdate.ts caches after a family member presses "Get today's update"
// (see DailyUpdatePanel + worker/src/index.ts). This module's only job is
// shaping that payload into what marketStore's snapshot cache expects, so
// hooks (useMarketQuote/useSeries/useQuotes) didn't need to change at all.
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

// proxyNote is kept for interface compatibility with existing callers (e.g.
// DailyBrief/TodayInMarkets check it to only trust the "true" VIX level) —
// it's always null now since Yahoo, fetched server-side, never needs the
// ETF-proxy substitution Twelve Data's free plan forced.
export interface MarketQuoteResult extends QuoteResult {
  proxyNote: string | null
}

export interface MarketSeriesResult extends SeriesResult {
  proxyNote: string | null
}

// payload.day is the US-market trading day (America/New_York), computed by
// the Worker; todayStamp() is the device's local calendar date. They can
// disagree for a user well outside US time zones right at midnight — an
// acceptable approximation for badging freshness, not for the data itself.
function statusFor(payload: DailyPayload | null): DataStatus {
  if (!payload) return 'unavailable'
  return payload.day === todayStamp() ? 'live' : 'cached'
}

export function peekMarketQuote(marketId: string): MarketQuoteResult {
  const payload = getCachedPayload()
  const entry = payload?.markets[marketId]
  return {
    quote: entry?.quote ?? null,
    status: statusFor(payload),
    fetchedAt: payload?.generatedAt ?? null,
    proxyNote: null,
  }
}

export function peekMarketSeries(marketId: string, range: RangeKey): MarketSeriesResult {
  const payload = getCachedPayload()
  const entry = payload?.markets[marketId]
  return {
    candles: entry?.series[range] ?? [],
    status: statusFor(payload),
    fetchedAt: payload?.generatedAt ?? null,
    proxyNote: null,
  }
}

export function peekQuote(symbol: string): QuoteResult {
  const payload = getCachedPayload()
  return {
    quote: payload?.tickers[symbol] ?? null,
    status: statusFor(payload),
    fetchedAt: payload?.generatedAt ?? null,
  }
}

// --- Badge helpers ------------------------------------------------------------
/** Human label for a badge: "TODAY'S CLOSE", "CACHED · Xm ago" / "· Xh ago" / "· Xd ago", or "DATA UNAVAILABLE". */
export function describeStatus(status: DataStatus, fetchedAt: number | null): string {
  if (status === 'live') return "TODAY'S CLOSE"
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
