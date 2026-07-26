import type { Candle } from './markets'
import type { OrderKind } from './stockPicking'

// ---------------------------------------------------------------------------
// The fill rules behind the Order Desk (src/components/OrderDeskSimulator.tsx).
//
// Pure functions over real candles, kept out of the component because the rules
// themselves are the interesting part and deserve to be readable on their own.
//
// Every decision here is made against the actual daily high/low the Worker
// fetched, never a made-up path. The honest limitation, stated in the UI too:
// daily candles can't show the order of events *within* a day, so a fill is
// dated to the day the price reached the level, and slippage is only modeled
// where a day opened straight through the trigger (a real gap). Real intraday
// slippage on a market or stop order is invisible at this resolution.
// ---------------------------------------------------------------------------

export type Side = 'buy' | 'sell'

export interface Levels {
  limitPrice: number | null
  stopPrice: number | null
  trailPercent: number | null
}

export interface FillResult {
  /** Filled, triggered-but-never-filled, or never triggered at all. */
  state: 'filled' | 'stranded' | 'never'
  fillIndex: number | null
  fillPrice: number | null
  /** For stop-limit: the day the stop woke the order up. */
  triggerIndex: number | null
  /** True when the day gapped straight through the trigger — real slippage. */
  gapped: boolean
  /** Trailing stops only: the ratcheting stop level per candle, for the chart. */
  stopPath: Array<number | null> | null
  /** Extreme close reached while an order sat stranded, or across the window. */
  extremeClose: number | null
}

export const NO_FILL: FillResult = {
  state: 'never',
  fillIndex: null,
  fillPrice: null,
  triggerIndex: null,
  gapped: false,
  stopPath: null,
  extremeClose: null,
}

/**
 * Walk the candles forward from the day after placement and decide what this
 * order would have done. `levels` are absolute prices already derived from the
 * placement-day close.
 */
export function simulateOrder(candles: Candle[], side: Side, kind: OrderKind, levels: Levels): FillResult {
  if (candles.length < 2) return NO_FILL
  const closes = candles.map((c) => c.close)
  const lowestClose = Math.min(...closes)
  const highestClose = Math.max(...closes)

  // A market order doesn't wait for anything — it fills at the placement
  // price, which is the whole point of it and the whole risk of it.
  if (kind === 'market') {
    return { ...NO_FILL, state: 'filled', fillIndex: 0, fillPrice: candles[0].close }
  }

  if (kind === 'trailing-stop') {
    const trail = levels.trailPercent
    if (trail == null) return NO_FILL
    const stopPath: Array<number | null> = [null]
    // The stop trails the highest price *seen so far*, so today's own high
    // can't lift a stop today's low then triggers against.
    let runMax = candles[0].high
    for (let i = 1; i < candles.length; i++) {
      const stop = runMax * (1 - trail / 100)
      stopPath.push(stop)
      const c = candles[i]
      if (c.low <= stop) {
        // Opened below the stop = a gap, and you're filled at the open, worse
        // than the level you chose. Otherwise the level is the fair estimate.
        const gapped = c.open < stop
        return {
          state: 'filled',
          fillIndex: i,
          fillPrice: gapped ? c.open : stop,
          triggerIndex: i,
          gapped,
          stopPath,
          extremeClose: null,
        }
      }
      runMax = Math.max(runMax, c.high)
    }
    return { ...NO_FILL, stopPath, extremeClose: side === 'sell' ? lowestClose : highestClose }
  }

  if (kind === 'limit') {
    const limit = levels.limitPrice
    if (limit == null) return NO_FILL
    for (let i = 1; i < candles.length; i++) {
      const c = candles[i]
      if (side === 'buy' && c.low <= limit) {
        // Gapping below your buy limit is the one kind of slippage that helps
        // you: the rule is "this price or better," so you get the open.
        const gapped = c.open < limit
        return { ...NO_FILL, state: 'filled', fillIndex: i, fillPrice: gapped ? c.open : limit, gapped }
      }
      if (side === 'sell' && c.high >= limit) {
        const gapped = c.open > limit
        return { ...NO_FILL, state: 'filled', fillIndex: i, fillPrice: gapped ? c.open : limit, gapped }
      }
    }
    return { ...NO_FILL, extremeClose: side === 'buy' ? lowestClose : highestClose }
  }

  if (kind === 'stop') {
    const stop = levels.stopPrice
    if (stop == null) return NO_FILL
    for (let i = 1; i < candles.length; i++) {
      const c = candles[i]
      const triggered = side === 'sell' ? c.low <= stop : c.high >= stop
      if (!triggered) continue
      // A triggered stop becomes a market order, so a gap through the level
      // hurts: you're filled at the open, wherever that landed.
      const gapped = side === 'sell' ? c.open < stop : c.open > stop
      return { ...NO_FILL, state: 'filled', fillIndex: i, fillPrice: gapped ? c.open : stop, triggerIndex: i, gapped }
    }
    return { ...NO_FILL, extremeClose: side === 'sell' ? lowestClose : highestClose }
  }

  // stop-limit: the stop wakes it, then the limit refuses to trade worse.
  const stop = levels.stopPrice
  const limit = levels.limitPrice
  if (stop == null || limit == null) return NO_FILL
  let triggerIndex: number | null = null
  for (let i = 1; i < candles.length; i++) {
    const c = candles[i]
    if (triggerIndex === null) {
      const triggered = side === 'sell' ? c.low <= stop : c.high >= stop
      if (!triggered) continue
      triggerIndex = i
      // The moment it wakes up, the prevailing price is the stop level — or the
      // open, if the day gapped straight past it. The limit only binds if that
      // price is already unacceptable; a sell limit *below* the market fills at
      // the market, it does not hand you the lower number.
      const gapped = side === 'sell' ? c.open < stop : c.open > stop
      const atTrigger = gapped ? c.open : stop
      const acceptableNow = side === 'sell' ? atTrigger >= limit : atTrigger <= limit
      if (acceptableNow) {
        return { ...NO_FILL, state: 'filled', fillIndex: i, fillPrice: atTrigger, triggerIndex, gapped }
      }
      // Gapped through the limit as well — keep working, looking for a price
      // that comes back to the limit. This is where stop-limits get stranded.
      continue
    }
    // Awake and unfilled: fill at the limit the first time the price returns to it.
    const reachesLimit = side === 'sell' ? c.high >= limit : c.low <= limit
    if (reachesLimit) {
      return { ...NO_FILL, state: 'filled', fillIndex: i, fillPrice: limit, triggerIndex }
    }
  }
  if (triggerIndex !== null) {
    // The classic stop-limit failure: woken up, never filled, still holding.
    const after = closes.slice(triggerIndex)
    return {
      ...NO_FILL,
      state: 'stranded',
      triggerIndex,
      extremeClose: side === 'sell' ? Math.min(...after) : Math.max(...after),
    }
  }
  return { ...NO_FILL, extremeClose: side === 'sell' ? lowestClose : highestClose }
}

// --- Recurring-buy simulation -------------------------------------------------

export interface DcaResult {
  buys: Array<{ index: number; price: number; shares: number }>
  invested: number
  shares: number
  avgCost: number
  value: number
  /** Same total money, all committed on day one. */
  lumpShares: number
  lumpValue: number
}

export function simulateRecurring(candles: Candle[], amount: number, everyNDays: number): DcaResult | null {
  if (candles.length < everyNDays + 1) return null
  const buys: DcaResult['buys'] = []
  for (let i = 0; i < candles.length; i += everyNDays) {
    const price = candles[i].close
    if (price <= 0) continue
    buys.push({ index: i, price, shares: amount / price })
  }
  if (buys.length === 0) return null
  const invested = amount * buys.length
  const shares = buys.reduce((s, b) => s + b.shares, 0)
  const lastClose = candles[candles.length - 1].close
  const lumpShares = invested / candles[0].close
  return {
    buys,
    invested,
    shares,
    avgCost: invested / shares,
    value: shares * lastClose,
    lumpShares,
    lumpValue: lumpShares * lastClose,
  }
}

/**
 * Brokers reject orders that are already satisfied the moment you place them —
 * a buy limit above the market, a sell stop above it. Naming that out loud
 * teaches more than silently filling on day one would.
 */
export function ticketWarning(side: Side, kind: OrderKind, placedAt: number, levels: Levels): string | null {
  const { limitPrice, stopPrice } = levels
  if (kind === 'limit' && limitPrice != null) {
    if (side === 'buy' && limitPrice > placedAt)
      return 'A buy limit above the current price is already satisfied, so it just fills immediately — which makes it a market order wearing a costume. Real brokers usually warn you here.'
    if (side === 'sell' && limitPrice < placedAt)
      return 'A sell limit below the current price fills instantly at the market. If you meant to protect a position on the way down, you want a stop, not a limit.'
  }
  if ((kind === 'stop' || kind === 'stop-limit') && stopPrice != null) {
    if (side === 'sell' && stopPrice > placedAt)
      return 'A sell stop above the current price triggers the moment it exists. Stops go on the far side of the market — below it when you are protecting a position you own.'
    if (side === 'buy' && stopPrice < placedAt)
      return 'A buy stop below the current price triggers immediately. Buy stops sit above the market, used to enter only if a stock breaks out upward.'
  }
  if (kind === 'stop-limit' && stopPrice != null && limitPrice != null) {
    if (side === 'sell' && limitPrice > stopPrice)
      return 'On a sell stop-limit, the limit belongs below the stop. Set above it and the order can only fill on a bounce it may never get.'
    if (side === 'buy' && limitPrice < stopPrice)
      return 'On a buy stop-limit, the limit belongs above the stop — otherwise the order wakes up already refusing every available price.'
  }
  return null
}

