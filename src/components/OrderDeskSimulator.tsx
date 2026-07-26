import { useEffect, useMemo, useState } from 'react'
import type { MarketSymbol } from '../data/markets'
import { formatPrice } from '../data/markets'
import { useSeries } from '../hooks/useSeries'
import {
  ORDER_DURATIONS,
  ORDER_TYPES,
  ORDER_TYPE_BY_KIND,
  type OrderKind,
} from '../data/stockPicking'
import {
  NO_FILL,
  simulateOrder,
  ticketWarning,
  type Levels,
  type Side,
} from '../data/orderSimulation'
import { H, PAD_B, PAD_L, PAD_R, PAD_T, W, buildChartGeometry, shortDate } from './orderDeskChart'
import { Pill, Slider, Stat } from './DeskControls'
import RecurringBuyPanel from './RecurringBuyPanel'
import DataBadge from './DataBadge'
import InfoDisclosure from './InfoDisclosure'

// ---------------------------------------------------------------------------
// The Order Desk — place an order against a real year of this stock's history
// and watch exactly when, whether, and at what price it would have filled.
//
// This file is the shell plus the order-ticket mode; the fill rules live in
// src/data/orderSimulation.ts and the recurring-buy mode in RecurringBuyPanel.
// ---------------------------------------------------------------------------

type Mode = 'orders' | 'recurring'

function OrderDeskSimulator({ market }: { market: MarketSymbol }) {
  const [mode, setMode] = useState<Mode>('orders')
  const [kind, setKind] = useState<OrderKind>('limit')
  const [side, setSide] = useState<Side>('buy')
  const [limitOffset, setLimitOffset] = useState(-5)
  const [stopOffset, setStopOffset] = useState(-10)
  const [trailPercent, setTrailPercent] = useState(10)

  const { candles, status, fetchedAt } = useSeries(market, '1Y', 5)
  const orderType = ORDER_TYPE_BY_KIND[kind]

  // Sensible starting offsets per order type — a stop above the market or a
  // sell limit below it would be a nonsense ticket to open on.
  useEffect(() => {
    if (kind === 'limit') setLimitOffset(side === 'buy' ? -5 : 8)
    if (kind === 'stop') setStopOffset(side === 'sell' ? -10 : 8)
    if (kind === 'stop-limit') {
      setStopOffset(side === 'sell' ? -10 : 8)
      setLimitOffset(side === 'sell' ? -13 : 11)
    }
  }, [kind, side])

  // Switching to an order type that's only sensible one way flips the side too.
  useEffect(() => {
    if (kind === 'trailing-stop') setSide('sell')
  }, [kind])

  const hasData = candles.length >= 30
  const placedAt = hasData ? candles[0].close : 0
  const lastClose = hasData ? candles[candles.length - 1].close : 0

  const levels = useMemo<Levels>(
    () => ({
      limitPrice: orderType.inputs.includes('limitPrice') ? placedAt * (1 + limitOffset / 100) : null,
      stopPrice: orderType.inputs.includes('stopPrice') ? placedAt * (1 + stopOffset / 100) : null,
      trailPercent: orderType.inputs.includes('trailPercent') ? trailPercent : null,
    }),
    [orderType, placedAt, limitOffset, stopOffset, trailPercent],
  )

  const fill = useMemo(
    () => (hasData ? simulateOrder(candles, side, kind, levels) : NO_FILL),
    [candles, side, kind, levels, hasData],
  )

  // --- chart geometry ---------------------------------------------------------
  const chart = useMemo(() => {
    if (!hasData) return null
    // Trigger levels must stay inside the y-domain or their lines get drawn off
    // canvas — but they only exist in orders mode.
    const extras =
      mode === 'orders'
        ? [levels.limitPrice, levels.stopPrice].filter((v): v is number => v != null)
        : []
    const geo = buildChartGeometry(candles, extras)
    // The ratcheting trailing-stop line — the whole idea of the order, drawn.
    const stopLine =
      fill.stopPath
        ?.map((v, i) => (v == null ? null : `${geo.x(i).toFixed(1)},${geo.y(v).toFixed(1)}`))
        .filter((p): p is string => p !== null)
        .join(' ') ?? null
    return { ...geo, stopLine }
  }, [candles, hasData, levels, fill.stopPath, mode])

  const dateAt = (i: number) => shortDate(candles, i)
  const warning = hasData ? ticketWarning(side, kind, placedAt, levels) : null

  // --- outcome copy ----------------------------------------------------------
  const outcome = useMemo(() => {
    if (!hasData) return null
    if (fill.state === 'filled' && fill.fillIndex !== null && fill.fillPrice !== null) {
      const after = ((lastClose - fill.fillPrice) / fill.fillPrice) * 100
      const headline =
        kind === 'market'
          ? `Filled immediately at about ${formatPrice(fill.fillPrice, 'Stock')}.`
          : `Filled ${shortDate(candles, fill.fillIndex)} at ${formatPrice(fill.fillPrice, 'Stock')}${
              fill.fillIndex === 0 ? '' : ` — ${fill.fillIndex} trading day${fill.fillIndex === 1 ? '' : 's'} after you placed it`
            }.`
      const body =
        side === 'buy'
          ? `From that fill price, the stock is ${after >= 0 ? 'up' : 'down'} ${Math.abs(after).toFixed(1)}% as of the last close.`
          : `You were out at that price. The stock has since gone ${after >= 0 ? 'up' : 'down'} ${Math.abs(after).toFixed(1)}%, so selling there ${
              after >= 0 ? 'cost you that move' : 'spared you that move'
            }.`
      return { tone: 'filled' as const, headline, body }
    }
    if (fill.state === 'stranded' && fill.triggerIndex !== null) {
      const extreme = formatPrice(fill.extremeClose ?? 0, 'Stock')
      const rest =
        side === 'sell'
          ? `fell straight past your stop and through your limit, so no acceptable price was ever available. You kept holding while it reached ${extreme}. This is the exact failure a stop-limit is famous for: the protection switches off in the one situation you bought it for.`
          : `shot straight past your stop and through your limit, so no acceptable price was ever available. You never got in, while it ran to ${extreme}. Same flaw seen from the other side: the order refused to chase, and the move it was waiting to join left without it.`
      return {
        tone: 'stranded' as const,
        headline: `Triggered ${shortDate(candles, fill.triggerIndex)} — and never filled.`,
        body: `The price ${rest}`,
      }
    }
    const reach = formatPrice(fill.extremeClose ?? 0, 'Stock')
    // Which way the order was waiting for the price to move — a buy limit and a
    // sell stop both wait for a fall, so side alone gets this backwards.
    const waitsForFall = kind === 'limit' ? side === 'buy' : side === 'sell'
    const movement = waitsForFall
      ? `Over the whole year the stock never came down to your level — its lowest close was ${reach}.`
      : `Over the whole year the stock never rose to your level — its highest close was ${reach}.`
    const consequence =
      side === 'buy'
        ? ` Your money sat in cash while the stock went to ${formatPrice(lastClose, 'Stock')}. An order that never fills is not a free option; it is a decision not to own the thing.`
        : ' You still hold the position, which may be exactly what you wanted — a trigger that never fires is the normal outcome for protection you hope never to need.'
    return {
      tone: 'never' as const,
      headline: 'Never triggered. No trade happened at all.',
      body: movement + consequence,
    }
  }, [fill, hasData, kind, side, lastClose, candles])

  const sideDisabled = kind === 'trailing-stop'

  return (
    <div className="panel animate-fade-up overflow-hidden">
      {/* toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-400/10 bg-ink-950/50 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-1.5">
          <Pill active={mode === 'orders'} onClick={() => setMode('orders')}>
            Order types
          </Pill>
          <Pill active={mode === 'recurring'} onClick={() => setMode('recurring')}>
            Recurring buys
          </Pill>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-600">
            {market.symbol} · past year
          </span>
          <DataBadge status={status} fetchedAt={fetchedAt} compact />
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <h3 className="font-display text-lg font-semibold text-slate-100">
          {mode === 'orders' ? 'The order desk' : 'The recurring-buy machine'}
        </h3>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-400">
          {mode === 'orders' ? (
            <>
              Place an order on {market.name} a year ago and watch what really happens to it. Every
              fill below is decided against the actual daily highs and lows — not a simulation of
              the stock, the stock itself.
            </>
          ) : (
            <>
              The same money, spent two different ways: all at once on day one, or a little at a
              time. Real closing prices, real fractional shares, no guessing.
            </>
          )}
        </p>

        {!hasData ? (
          <div className="mt-6 flex h-[280px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-400/15 text-center">
            {status === 'loading' ? (
              <>
                <span className="h-2 w-2 animate-ping rounded-full bg-sky-400" />
                <p className="font-mono text-xs uppercase tracking-[0.25em] text-slate-500">
                  Loading today's update…
                </p>
              </>
            ) : (
              <>
                <span className="text-2xl">🎟️</span>
                <p className="text-sm font-medium text-slate-300">The order desk needs price history.</p>
                <p className="max-w-sm text-xs leading-relaxed text-slate-600">
                  Press "Get today's update" at the top of the page and this fills in with a real
                  year of {market.symbol}.
                </p>
              </>
            )}
          </div>
        ) : mode === 'orders' ? (
          <>
            {/* order ticket */}
            <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div className="order-2 lg:order-1">
                {/* chart */}
                <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`${market.symbol} order fill simulation`}>
                  <defs>
                    <linearGradient id="desk-area" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.18} />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  {chart && (
                    <>
                      <path d={chart.area} fill="url(#desk-area)" />
                      <polyline
                        points={chart.line}
                        fill="none"
                        stroke="#7dd3fc"
                        strokeWidth={1.6}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />

                      {/* the ratcheting trailing stop — the whole idea, drawn */}
                      {chart.stopLine && (
                        <polyline
                          points={chart.stopLine}
                          fill="none"
                          stroke="#ff6b7f"
                          strokeWidth={1.4}
                          strokeDasharray="4 3"
                          opacity={0.85}
                        />
                      )}

                      {/* static trigger levels */}
                      {levels.stopPrice != null && (
                        <g>
                          <line
                            x1={PAD_L}
                            x2={W - PAD_R}
                            y1={chart.y(levels.stopPrice)}
                            y2={chart.y(levels.stopPrice)}
                            stroke="#ff6b7f"
                            strokeWidth={1.2}
                            strokeDasharray="5 4"
                            opacity={0.9}
                          />
                          <text
                            x={W - PAD_R + 6}
                            y={chart.y(levels.stopPrice) + 3.5}
                            className="font-mono"
                            style={{ fontSize: 10 }}
                            fill="#ff6b7f"
                          >
                            stop
                          </text>
                        </g>
                      )}
                      {levels.limitPrice != null && (
                        <g>
                          <line
                            x1={PAD_L}
                            x2={W - PAD_R}
                            y1={chart.y(levels.limitPrice)}
                            y2={chart.y(levels.limitPrice)}
                            stroke="#fbbf24"
                            strokeWidth={1.2}
                            strokeDasharray="5 4"
                            opacity={0.9}
                          />
                          <text
                            x={W - PAD_R + 6}
                            y={chart.y(levels.limitPrice) + 3.5}
                            className="font-mono"
                            style={{ fontSize: 10 }}
                            fill="#fbbf24"
                          >
                            limit
                          </text>
                        </g>
                      )}

                      {/* placement marker */}
                      <circle cx={chart.x(0)} cy={chart.y(placedAt)} r={3.5} fill="#94a3b8" />
                      <text
                        x={chart.x(0) + 6}
                        y={chart.y(placedAt) - 7}
                        className="font-mono"
                        style={{ fontSize: 10 }}
                        fill="#94a3b8"
                      >
                        placed
                      </text>

                      {/* the fill */}
                      {fill.fillIndex !== null && fill.fillPrice !== null && (
                        <g>
                          <line
                            x1={chart.x(fill.fillIndex)}
                            x2={chart.x(fill.fillIndex)}
                            y1={PAD_T}
                            y2={H - PAD_B}
                            stroke="#2dd4a7"
                            strokeWidth={1}
                            opacity={0.45}
                          />
                          <circle
                            cx={chart.x(fill.fillIndex)}
                            cy={chart.y(fill.fillPrice)}
                            r={6}
                            fill="#2dd4a7"
                            opacity={0.25}
                            className="animate-ping"
                          />
                          <circle
                            cx={chart.x(fill.fillIndex)}
                            cy={chart.y(fill.fillPrice)}
                            r={4}
                            fill="#2dd4a7"
                            stroke="#04070d"
                            strokeWidth={1.5}
                          />
                          <text
                            x={Math.min(chart.x(fill.fillIndex) + 8, W - PAD_R - 46)}
                            y={PAD_T + 10}
                            className="font-mono"
                            style={{ fontSize: 10, fontWeight: 600 }}
                            fill="#2dd4a7"
                          >
                            FILLED
                          </text>
                        </g>
                      )}

                      {/* triggered but stranded */}
                      {fill.state === 'stranded' && fill.triggerIndex !== null && (
                        <g>
                          <line
                            x1={chart.x(fill.triggerIndex)}
                            x2={chart.x(fill.triggerIndex)}
                            y1={PAD_T}
                            y2={H - PAD_B}
                            stroke="#fbbf24"
                            strokeWidth={1}
                            opacity={0.5}
                            strokeDasharray="3 3"
                          />
                          <text
                            x={Math.min(chart.x(fill.triggerIndex) + 8, W - PAD_R - 82)}
                            y={PAD_T + 10}
                            className="font-mono"
                            style={{ fontSize: 10, fontWeight: 600 }}
                            fill="#fbbf24"
                          >
                            TRIGGERED · NO FILL
                          </text>
                        </g>
                      )}
                    </>
                  )}
                </svg>
                <div className="mt-1 flex justify-between font-mono text-[10px] text-slate-600">
                  <span>{dateAt(0)}</span>
                  <span>{dateAt(candles.length - 1)}</span>
                </div>
              </div>

              {/* ticket controls */}
              <div className="order-1 space-y-4 rounded-xl border border-slate-400/10 bg-ink-950/50 p-4 lg:order-2">
                <div>
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Order type
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {ORDER_TYPES.map((o) => (
                      <Pill key={o.kind} active={kind === o.kind} onClick={() => setKind(o.kind)} title={o.what}>
                        {o.label}
                      </Pill>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Side
                  </p>
                  <div className="mt-2 flex gap-1.5">
                    {(['buy', 'sell'] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        disabled={sideDisabled && s === 'buy'}
                        onClick={() => setSide(s)}
                        className={`flex-1 rounded-lg border px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider transition-all duration-200 ${
                          side === s
                            ? s === 'buy'
                              ? 'border-up/40 bg-up/10 text-up'
                              : 'border-down/40 bg-down/10 text-down'
                            : 'border-slate-400/10 text-slate-500 hover:text-slate-300'
                        } ${sideDisabled && s === 'buy' ? 'cursor-not-allowed opacity-40' : ''}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  {sideDisabled && (
                    <p className="mt-1.5 text-[10px] leading-snug text-slate-600">
                      Trailing stops protect a position you already hold, so this one is sell-only.
                    </p>
                  )}
                </div>

                {orderType.inputs.includes('stopPrice') && (
                  <Slider
                    label="Stop, vs. today"
                    value={stopOffset}
                    min={-30}
                    max={30}
                    step={1}
                    suffix="%"
                    signed
                    onChange={setStopOffset}
                  />
                )}
                {orderType.inputs.includes('limitPrice') && (
                  <Slider
                    label="Limit, vs. today"
                    value={limitOffset}
                    min={-30}
                    max={30}
                    step={1}
                    suffix="%"
                    signed
                    onChange={setLimitOffset}
                  />
                )}
                {orderType.inputs.includes('trailPercent') && (
                  <Slider
                    label="Trail"
                    value={trailPercent}
                    min={2}
                    max={30}
                    step={1}
                    suffix="%"
                    onChange={setTrailPercent}
                  />
                )}
                {orderType.inputs.length === 0 && (
                  <p className="rounded-lg border border-slate-400/10 bg-slate-400/[0.04] px-3 py-2.5 text-[11px] leading-relaxed text-slate-500">
                    A market order has nothing to set. That is the feature, and it is also the whole
                    problem.
                  </p>
                )}

                <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-slate-400/10 bg-slate-400/10">
                  {[
                    { label: 'Placed at', value: formatPrice(placedAt, 'Stock') },
                    ...(levels.stopPrice != null
                      ? [{ label: 'Stop', value: formatPrice(levels.stopPrice, 'Stock') }]
                      : []),
                    ...(levels.limitPrice != null
                      ? [{ label: 'Limit', value: formatPrice(levels.limitPrice, 'Stock') }]
                      : []),
                    ...(levels.trailPercent != null
                      ? [{ label: 'Trail', value: `${levels.trailPercent}%` }]
                      : []),
                    { label: 'Last close', value: formatPrice(lastClose, 'Stock') },
                  ].map((s) => (
                    <Stat key={s.label} label={s.label} value={s.value} />
                  ))}
                </dl>

                {warning && (
                  <p className="rounded-lg border border-amber-400/25 bg-amber-400/[0.07] px-3 py-2.5 text-[11px] leading-relaxed text-amber-200/85">
                    <span className="font-mono font-semibold uppercase tracking-wider">⚠ Odd ticket · </span>
                    {warning}
                  </p>
                )}
              </div>
            </div>

            {/* outcome */}
            {outcome && (
              <div
                className={`mt-5 rounded-2xl border p-4 sm:p-5 ${
                  outcome.tone === 'filled'
                    ? 'border-up/25 bg-up/[0.06]'
                    : outcome.tone === 'stranded'
                      ? 'border-down/25 bg-down/[0.06]'
                      : 'border-amber-400/20 bg-amber-400/[0.05]'
                }`}
              >
                <p
                  className={`font-mono text-[10px] font-semibold uppercase tracking-[0.25em] ${
                    outcome.tone === 'filled' ? 'text-up' : outcome.tone === 'stranded' ? 'text-down' : 'text-amber-300'
                  }`}
                >
                  What actually happened
                </p>
                <p className="mt-2 text-[15px] font-semibold text-slate-100">{outcome.headline}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-300">{outcome.body}</p>
                {fill.gapped && (
                  <p className="mt-2.5 border-l-2 border-amber-400/50 pl-3 text-xs leading-relaxed text-amber-200/80">
                    Note the gap: the stock opened straight past your level, so you were filled at
                    the open rather than the price you named
                    {side === 'buy' && kind === 'limit'
                      ? ' — which for a buy limit works in your favor, since the rule is "this price or better."'
                      : '. A triggered stop becomes a market order, and market orders take whatever the next price is.'}
                  </p>
                )}
              </div>
            )}

            {/* the order type, explained */}
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { label: 'What it is', body: orderType.what, color: 'text-sky-400' },
                { label: 'Reach for it when', body: orderType.useWhen, color: 'text-up' },
                { label: 'The catch', body: orderType.catch, color: 'text-down' },
              ].map((box) => (
                <div key={box.label} className="rounded-xl border border-slate-400/10 bg-ink-950/40 p-4">
                  <p className={`font-mono text-[10px] font-semibold uppercase tracking-[0.2em] ${box.color}`}>
                    {box.label}
                  </p>
                  <p className="mt-2 text-[13px] leading-relaxed text-slate-300">{box.body}</p>
                </div>
              ))}
            </div>

            <p className="mt-4 text-[11px] leading-relaxed text-slate-600">
              Fair warning on the method: this uses daily highs and lows, so a fill is dated to the
              day the price reached your level, and slippage only shows up where a day opened
              straight through it. Inside a single trading day, real fills can be worse than this.
            </p>

            {/* duration settings */}
            <div className="mt-5">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-500">
                Two settings underneath every order
              </p>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {ORDER_DURATIONS.map((d) => (
                  <div key={d.label} className="rounded-xl border border-slate-400/10 bg-ink-950/40 p-4">
                    <p className="font-mono text-[11px] font-semibold tracking-wide text-slate-200">{d.label}</p>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-slate-400">{d.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          chart && <RecurringBuyPanel market={market} candles={candles} chart={chart} dateAt={dateAt} />
        )}

        <InfoDisclosure
          what="An order simulator running on this stock's real daily prices from the past year. Pick an order type, set your trigger, and it walks the actual highs and lows forward to show when the order would have filled, at what price, or whether it never filled at all. The recurring tab does the same for automatic repeat buys."
          why="The gap between deciding to own a company and actually owning it is a form on a screen with five order types on it — and the wrong choice can cost more than picking the wrong stock. Most people learn this by getting filled somewhere terrible with real money. This costs nothing."
          academyAnchor="order-types"
        />
      </div>
    </div>
  )
}

export default OrderDeskSimulator
