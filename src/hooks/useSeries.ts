import { useEffect, useState } from 'react'
import type { MarketSymbol, RangeKey } from '../data/markets'
import { getMarketSeries, peekMarketSeries, type MarketSeriesResult } from '../data/marketFeed'

/**
 * OHLCV series for a dashboard market + range. Yahoo Finance is tried first,
 * Twelve Data as fallback. Initial state is seeded synchronously from
 * whatever's already cached so switching tabs/ranges never blanks a chart
 * that has previously loaded successfully — a failed refresh holds the last
 * good series (however old) rather than dropping to empty.
 */
export function useSeries(market: MarketSymbol, range: RangeKey, priority = 5): MarketSeriesResult {
  const [result, setResult] = useState<MarketSeriesResult>(() => peekMarketSeries(market.id, range))

  useEffect(() => {
    setResult(peekMarketSeries(market.id, range))
    let cancelled = false

    getMarketSeries(market.id, range, priority).then((next) => {
      if (!cancelled) setResult(next)
    })

    return () => {
      cancelled = true
    }
  }, [market.id, range, priority])

  return result
}
