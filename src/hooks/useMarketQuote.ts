import { useEffect, useSyncExternalStore } from 'react'
import type { MarketQuoteResult } from '../data/marketFeed'
import { getMarketQuoteSnapshot, subscribe, wantMarketQuote } from '../data/marketStore'

/**
 * Quote for one of the dashboard's named markets (sp500, vix, …). Reading is
 * pure cache lookup — marketStore owns fetching, pulling every wanted market
 * together on one shared cycle so this can never disagree with a sibling
 * component (e.g. a MarketCard) showing the same market.
 */
export function useMarketQuote(marketId: string, _priority?: number): MarketQuoteResult {
  useEffect(() => {
    wantMarketQuote(marketId)
  }, [marketId])

  return useSyncExternalStore(
    subscribe,
    () => getMarketQuoteSnapshot(marketId),
    () => getMarketQuoteSnapshot(marketId),
  )
}
