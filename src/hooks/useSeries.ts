import { useEffect, useState } from 'react'
import type { MarketSymbol, RangeKey } from '../data/markets'
import { getMarketSeries, type MarketSeriesResult } from '../data/twelveDataService'

const EMPTY: MarketSeriesResult = {
  candles: [],
  status: 'loading',
  fetchedAt: null,
  sourceSymbol: null,
  proxyNote: null,
}

/**
 * OHLCV series for a dashboard market + range via Twelve Data, with automatic
 * index→ETF-proxy fallback. Resolves to live data, cached data, or an honest
 * 'unavailable' — never throws, never shows synthetic prices. When a proxy
 * served the data, `proxyNote` says so (e.g. "via SPY ETF").
 */
export function useSeries(market: MarketSymbol, range: RangeKey, priority = 5): MarketSeriesResult {
  const [result, setResult] = useState<MarketSeriesResult>(EMPTY)

  useEffect(() => {
    let cancelled = false
    setResult(EMPTY)

    getMarketSeries(market.id, range, priority).then((next) => {
      if (!cancelled) setResult(next)
    })

    return () => {
      cancelled = true
    }
  }, [market.id, range, priority])

  return result
}
