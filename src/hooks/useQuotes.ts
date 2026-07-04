import { useEffect, useMemo, useSyncExternalStore } from 'react'
import type { DataStatus, QuoteResult } from '../data/marketFeed'
import { getQuotesListSnapshot, subscribe, wantTickerQuote } from '../data/marketStore'

export interface QuotesState {
  results: Record<string, QuoteResult>
  /** Aggregate: 'live' if any symbol is live, else 'cached' if any cached, else loading/unavailable. */
  status: DataStatus
  /** Oldest fetch time among resolved symbols (for the "CACHED · Xm ago" badge). */
  fetchedAt: number | null
}

/**
 * Quotes for a list of tickers. Reading is pure cache lookup — marketStore
 * owns fetching, batching every wanted symbol into one shared cycle instead
 * of each caller (ticker strip, sector heat map, watchlist card) triggering
 * its own request.
 */
export function useQuotes(symbols: string[], _priority?: number): QuotesState {
  const key = symbols.join(',')

  useEffect(() => {
    for (const symbol of key ? key.split(',') : []) wantTickerQuote(symbol)
  }, [key])

  const list = useMemo(() => (key ? key.split(',') : []), [key])
  const results = useSyncExternalStore(
    subscribe,
    () => getQuotesListSnapshot(list),
    () => getQuotesListSnapshot(list),
  )

  return useMemo(() => {
    const values = Object.values(results)
    const resolved = values.filter((v) => v.quote !== null)
    let status: DataStatus
    if (values.length === 0) status = 'loading'
    else if (resolved.some((v) => v.status === 'live')) status = 'live'
    else if (resolved.length > 0) status = 'cached'
    else if (values.length < list.length) status = 'loading'
    else status = 'unavailable'

    const fetchedTimes = resolved.map((v) => v.fetchedAt ?? 0).filter((t) => t > 0)
    const fetchedAt = fetchedTimes.length ? Math.min(...fetchedTimes) : null
    return { results, status, fetchedAt }
  }, [results, list])
}
