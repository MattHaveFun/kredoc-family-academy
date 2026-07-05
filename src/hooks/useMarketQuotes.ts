import { useEffect, useMemo, useSyncExternalStore } from 'react'
import type { MarketQuoteResult } from '../data/marketFeed'
import { getMarketQuotesListSnapshot, subscribe, wantMarketQuote } from '../data/marketStore'

/**
 * Quotes for a list of dashboard markets (by MARKET_SYMBOLS id). Reading is a
 * pure cache lookup — marketStore owns the single daily payload. Used by the
 * ticker strip's macro row, whose assets (crypto, commodities, currencies,
 * rates) all live in payload.markets rather than payload.tickers.
 */
export function useMarketQuotes(ids: string[]): Record<string, MarketQuoteResult> {
  const key = ids.join(',')

  useEffect(() => {
    for (const id of key ? key.split(',') : []) wantMarketQuote(id)
  }, [key])

  const list = useMemo(() => (key ? key.split(',') : []), [key])
  return useSyncExternalStore(
    subscribe,
    () => getMarketQuotesListSnapshot(list),
    () => getMarketQuotesListSnapshot(list),
  )
}
