import { useEffect, useState } from 'react'
import { getMarketQuote, type MarketQuoteResult } from '../data/twelveDataService'

const EMPTY: MarketQuoteResult = {
  quote: null,
  status: 'loading',
  fetchedAt: null,
  sourceSymbol: null,
  proxyNote: null,
}

/**
 * Quote for one of the dashboard's named markets (sp500, vix, …) with
 * automatic index→ETF-proxy fallback. `proxyNote` is set when the data came
 * from a proxy — callers that need the TRUE index level (e.g. the mood
 * gauge's VIX thresholds) must check it.
 */
export function useMarketQuote(marketId: string, priority = 5): MarketQuoteResult {
  const [result, setResult] = useState<MarketQuoteResult>(EMPTY)

  useEffect(() => {
    let cancelled = false
    setResult(EMPTY)

    getMarketQuote(marketId, priority).then((next) => {
      if (!cancelled) setResult(next)
    })

    return () => {
      cancelled = true
    }
  }, [marketId, priority])

  return result
}
