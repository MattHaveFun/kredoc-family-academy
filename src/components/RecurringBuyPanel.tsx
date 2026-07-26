import { useMemo, useState } from 'react'
import type { Candle, MarketSymbol } from '../data/markets'
import { formatPrice } from '../data/markets'
import { simulateRecurring } from '../data/orderSimulation'
import { Pill, Slider, Stat } from './DeskControls'
import type { ChartGeometry } from './orderDeskChart'
import { H, PAD_L, PAD_R, W } from './orderDeskChart'

// The recurring-buy half of the Order Desk: the same money spent two ways, on
// real closing prices. Every dot on the chart is an actual purchase at an
// actual close, which is what makes the head-to-head honest — and what makes it
// flip when you change the stock, which is the point.

interface RecurringBuyPanelProps {
  market: MarketSymbol
  candles: Candle[]
  chart: ChartGeometry
  /** Formats a candle index as a short date, shared with the order ticket. */
  dateAt: (i: number) => string
}

const CADENCES = [
  { days: 5, label: 'Weekly' },
  { days: 10, label: 'Biweekly' },
  { days: 21, label: 'Monthly' },
]

function RecurringBuyPanel({ market, candles, chart, dateAt }: RecurringBuyPanelProps) {
  const [amount, setAmount] = useState(25)
  const [cadence, setCadence] = useState(5) // trading days between buys
  const [dollarInput, setDollarInput] = useState(50)

  const dca = useMemo(() => simulateRecurring(candles, amount, cadence), [candles, amount, cadence])
  const lastClose = candles[candles.length - 1].close

  return (
    <>
      <div className="mt-5 flex flex-wrap items-end gap-6">
        <div className="min-w-[180px] flex-1">
          <Slider
            label="Each buy"
            value={amount}
            min={5}
            max={200}
            step={5}
            suffix=""
            prefix="$"
            onChange={setAmount}
          />
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-600">
            every purchase, same amount
          </p>
        </div>
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            How often
          </p>
          <div className="mt-2 flex gap-1.5">
            {CADENCES.map((c) => (
              <Pill key={c.days} active={cadence === c.days} onClick={() => setCadence(c.days)}>
                {c.label}
              </Pill>
            ))}
          </div>
        </div>
      </div>

      {dca && (
        <>
          <div className="mt-5">
            <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Recurring buy points">
              <defs>
                <linearGradient id="dca-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <path d={chart.area} fill="url(#dca-area)" />
              <polyline points={chart.line} fill="none" stroke="#7dd3fc" strokeWidth={1.6} strokeLinejoin="round" />
              <line
                x1={PAD_L}
                x2={W - PAD_R}
                y1={chart.y(dca.avgCost)}
                y2={chart.y(dca.avgCost)}
                stroke="#fbbf24"
                strokeWidth={1.3}
                strokeDasharray="5 4"
              />
              <text
                x={W - PAD_R + 6}
                y={chart.y(dca.avgCost) + 3.5}
                className="font-mono"
                style={{ fontSize: 10 }}
                fill="#fbbf24"
              >
                avg
              </text>
              {dca.buys.map((b) => (
                <circle
                  key={b.index}
                  cx={chart.x(b.index)}
                  cy={chart.y(b.price)}
                  r={2.6}
                  fill="#2dd4a7"
                  stroke="#04070d"
                  strokeWidth={0.8}
                />
              ))}
            </svg>
            <div className="mt-1 flex flex-wrap justify-between gap-2 font-mono text-[10px] text-slate-600">
              <span>{dateAt(0)}</span>
              <span>{dca.buys.length} buys · every dot is real money at a real closing price</span>
              <span>{dateAt(candles.length - 1)}</span>
            </div>
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-slate-400/10 bg-slate-400/10 sm:grid-cols-4">
            <Stat label="Invested" value={`$${dca.invested.toLocaleString('en-US')}`} />
            <Stat label="Shares owned" value={dca.shares.toFixed(4)} />
            <Stat label="Average cost" value={formatPrice(dca.avgCost, 'Stock')} />
            <Stat
              label="Worth now"
              value={`$${dca.value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
              tone={dca.value >= dca.invested ? 'up' : 'down'}
            />
          </dl>

          {/* head to head */}
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              {
                title: 'A little at a time',
                sub: `${dca.buys.length} buys of $${amount}`,
                value: dca.value,
                detail: `Average cost ${formatPrice(dca.avgCost, 'Stock')} · ${dca.shares.toFixed(4)} shares`,
              },
              {
                title: 'All at once, day one',
                sub: `$${dca.invested.toLocaleString('en-US')} at ${formatPrice(candles[0].close, 'Stock')}`,
                value: dca.lumpValue,
                detail: `Average cost ${formatPrice(candles[0].close, 'Stock')} · ${dca.lumpShares.toFixed(4)} shares`,
              },
            ].map((c) => {
              const ret = ((c.value - dca.invested) / dca.invested) * 100
              const won = c.value >= Math.max(dca.value, dca.lumpValue) - 0.005
              return (
                <div
                  key={c.title}
                  className={`rounded-xl border p-4 ${
                    won ? 'border-up/30 bg-up/[0.06]' : 'border-slate-400/10 bg-ink-950/40'
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-100">{c.title}</p>
                    {won && (
                      <span className="font-mono text-[9px] font-semibold uppercase tracking-wider text-up">
                        ahead here
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-slate-600">{c.sub}</p>
                  <p className="mt-2.5 font-mono text-2xl font-semibold tabular-nums text-slate-50">
                    ${c.value.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </p>
                  <p className={`mt-0.5 font-mono text-xs font-semibold ${ret >= 0 ? 'text-up' : 'text-down'}`}>
                    {ret >= 0 ? '▲' : '▼'} {Math.abs(ret).toFixed(1)}%
                  </p>
                  <p className="mt-2 text-[11px] leading-relaxed text-slate-500">{c.detail}</p>
                </div>
              )
            })}
          </div>

          <div className="mt-4 rounded-2xl border border-amber-400/15 bg-amber-400/[0.05] p-4 sm:p-5">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-amber-300">
              Read this before you draw a conclusion
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Whichever box is glowing won <em>on this stock, over this exact year</em>. In a year that
              mostly rose, committing everything on day one usually wins, because the money was in the
              market longer. In a year that fell first and recovered, spreading the buys out usually
              wins, because the later purchases were cheaper. Change the stock at the top of the page
              and watch the answer flip — that is the real lesson, and it is why "which is better" is
              the wrong question. The honest question is which one you will actually keep doing when
              the number goes red.
            </p>
          </div>

          {/* dollars vs shares */}
          <div className="mt-5 rounded-2xl border border-slate-400/10 bg-ink-950/40 p-4 sm:p-5">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-500">
              Dollars or shares?
            </p>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
              Most apps let you order either way. Buying in dollars means naming the money and letting
              the app work out the fraction of a share; buying in shares means naming the quantity and
              accepting whatever it costs. For recurring investing, dollars win almost every time — a
              fixed ${amount} automatically buys more shares when the price is low and fewer when it is
              high.
            </p>
            <div className="mt-4 flex flex-wrap items-end gap-5">
              <label className="block">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Spend in dollars
                </span>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="font-mono text-lg text-slate-500">$</span>
                  <input
                    type="number"
                    min={1}
                    max={100000}
                    value={dollarInput}
                    onChange={(e) => setDollarInput(Math.max(1, Number(e.target.value) || 1))}
                    className="w-28 rounded-lg border border-slate-400/15 bg-ink-950/70 px-3 py-1.5 font-mono text-sm tabular-nums text-slate-100 focus:border-sky-400/50 focus:outline-none"
                  />
                </div>
              </label>
              <div className="font-mono text-slate-600">→</div>
              <div>
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Gets you, at the last close
                </span>
                <p className="mt-1.5 font-mono text-xl font-semibold tabular-nums text-sky-300">
                  {(dollarInput / lastClose).toFixed(6)}{' '}
                  <span className="text-sm font-normal text-slate-500">shares of {market.symbol}</span>
                </p>
              </div>
              <div className="font-mono text-slate-600">·</div>
              <div>
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  One whole share costs
                </span>
                <p className="mt-1.5 font-mono text-xl font-semibold tabular-nums text-slate-200">
                  {formatPrice(lastClose, 'Stock')}
                </p>
              </div>
            </div>
            <p className="mt-4 border-l-2 border-slate-400/20 pl-3 text-xs leading-relaxed text-slate-500">
              The catch nobody mentions: fractional shares are usually held by the broker on your
              behalf, which can make transferring them to another brokerage awkward — they often have
              to be sold first. Worth knowing before you build years of fractional positions somewhere
              you might want to leave.
            </p>
          </div>
        </>
      )}
    </>
  )
}

export default RecurringBuyPanel
