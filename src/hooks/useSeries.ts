import { useEffect, useSyncExternalStore } from 'react'
import type { MarketSymbol, RangeKey } from '../data/markets'
import type { MarketSeriesResult } from '../data/marketFeed'
import { getMarketSeriesSnapshot, subscribe, wantMarketSeries } from '../data/marketStore'

/**
 * OHLCV series for a dashboard market + range. Reading is pure cache lookup
 * — marketStore owns fetching, pulling every wanted market+range together on
 * one shared cycle (see marketStore.ts) so this can never disagree in scale
 * with a sibling component viewing the same market on a different range.
 */
export function useSeries(market: MarketSymbol, range: RangeKey, _priority?: number): MarketSeriesResult {
  useEffect(() => {
    wantMarketSeries(market.id, range)
  }, [market.id, range])

  return useSyncExternalStore(
    subscribe,
    () => getMarketSeriesSnapshot(market.id, range),
    () => getMarketSeriesSnapshot(market.id, range),
  )
}
