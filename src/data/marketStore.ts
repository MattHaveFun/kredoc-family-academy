import type { RangeKey } from './markets'
import {
  peekMarketQuote,
  peekMarketSeries,
  peekQuote,
  type MarketQuoteResult,
  type MarketSeriesResult,
  type QuoteResult,
} from './marketFeed'
import { subscribe as subscribeDailyUpdate } from './dailyUpdate'

// ---------------------------------------------------------------------------
// marketStore — a referentially-stable snapshot cache in front of
// marketFeed's peek functions, for useSyncExternalStore (which re-renders
// forever if getSnapshot returns a new object reference on every call even
// when nothing changed).
//
// There is no fetching or polling here anymore. One Worker call (triggered
// only by the "Get today's update" button — see DailyUpdatePanel) refreshes
// every market/ticker at once, so there's only ever one payload for every
// consumer to read — the whole "two components land on different sources"
// problem this module used to solve doesn't exist when there's a single
// source of truth. want* functions are kept as no-ops purely so the existing
// hooks (useMarketQuote/useSeries/useQuotes) don't need to change.
// ---------------------------------------------------------------------------

type Listener = () => void
const listeners = new Set<Listener>()

let version = 0
function bumpAndNotify() {
  version++
  listeners.forEach((listener) => listener())
}

subscribeDailyUpdate(bumpAndNotify)

export function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- kept so hook call sites (useMarketQuote.ts etc.) don't need to change; see file header
export function wantMarketQuote(_marketId: string) {
  // no-op: fetching is button-driven now, not mount-driven
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- see wantMarketQuote
export function wantMarketSeries(_marketId: string, _range: RangeKey) {
  // no-op: see wantMarketQuote
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- see wantMarketQuote
export function wantTickerQuote(_symbol: string) {
  // no-op: see wantMarketQuote
}

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
