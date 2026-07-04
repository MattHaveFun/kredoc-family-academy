import { useEffect, useState } from 'react'
import { getMarketQuote, peekMarketQuote, type MarketQuoteResult } from '../data/marketFeed'

/**
 * Quote for one of the dashboard's named markets (sp500, vix, …). Yahoo
 * Finance is tried first, Twelve Data as fallback. Initial state is seeded
 * synchronously from whatever we've already fetched (this session or a past
 * one, via localStorage) so a mount/remount never flashes to blank — a
 * failed refresh can only ever hold the existing value, never drop it.
 */
export function useMarketQuote(marketId: string, priority = 5): MarketQuoteResult {
  const [result, setResult] = useState<MarketQuoteResult>(() => peekMarketQuote(marketId))

  useEffect(() => {
    setResult(peekMarketQuote(marketId))
    let cancelled = false

    getMarketQuote(marketId, priority).then((next) => {
      if (!cancelled) setResult(next)
    })

    return () => {
      cancelled = true
    }
  }, [marketId, priority])

  return result
}
