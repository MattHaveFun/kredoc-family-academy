import { getCachedPayload, type DailyPayload } from './dailyUpdate'
import { SECTORS } from './sectors'

// ---------------------------------------------------------------------------
// dailyRead — the daily "what it actually means" panel, composed here in the
// browser from numbers the nightly cron already fetched. No API, no key, no
// bill, nothing to trigger.
//
// It replaces a Gemini call that wrote the same panel. The trade is real and
// worth naming: the model could notice things this can't, and phrase them
// freshly every day. What this does instead is describe the day's actual shape
// from the data — direction, breadth, volatility, leadership — pair it with an
// explanation of what that shape has tended to mean, and close on a line from
// someone who spent a career thinking about it. That is a narrower kind of
// writing, but it is about today, it is always available, and it costs nothing,
// which means every visitor sees it without anyone pressing anything.
//
// Everything below is deterministic: same day in, same read out, for everyone.
// ---------------------------------------------------------------------------

export interface ReadQuote {
  text: string
  author: string
}

export interface DailyRead {
  /** Two or three sentences of what actually happened, straight from the numbers. */
  headline: string
  /** What that shape has historically tended to mean. */
  body: string
  quote: ReadQuote
}

/**
 * Short, well-attributed lines from people who thought seriously about markets.
 * Rotated daily, independent of what the market did — a quote that tried to
 * match the day's mood would be one step from telling you what to do about it.
 */
const QUOTES: ReadQuote[] = [
  { text: 'In the short run the market is a voting machine. In the long run it is a weighing machine.', author: 'Benjamin Graham' },
  { text: "The investor's chief problem, and even his worst enemy, is likely to be himself.", author: 'Benjamin Graham' },
  { text: 'Price is what you pay. Value is what you get.', author: 'Warren Buffett' },
  { text: 'Be fearful when others are greedy, and greedy when others are fearful.', author: 'Warren Buffett' },
  { text: 'Someone is sitting in the shade today because someone planted a tree a long time ago.', author: 'Warren Buffett' },
  { text: 'The big money is not in the buying and selling, but in the waiting.', author: 'Charlie Munger' },
  { text: 'The first rule of compounding: never interrupt it unnecessarily.', author: 'Charlie Munger' },
  { text: 'Time is your friend; impulse is your enemy.', author: 'John C. Bogle' },
  { text: "Don't look for the needle in the haystack. Just buy the haystack.", author: 'John C. Bogle' },
  { text: 'Know what you own, and know why you own it.', author: 'Peter Lynch' },
  { text: 'Far more money has been lost by investors preparing for corrections than in corrections themselves.', author: 'Peter Lynch' },
  { text: 'The key to making money in stocks is not to get scared out of them.', author: 'Peter Lynch' },
  { text: 'Investing should be more like watching paint dry or watching grass grow.', author: 'Paul Samuelson' },
  { text: "You can't predict. You can prepare.", author: 'Howard Marks' },
  { text: "The four most dangerous words in investing are: this time it's different.", author: 'Sir John Templeton' },
  { text: 'Risk is what is left over when you think you have thought of everything.', author: 'Carl Richards' },
  { text: 'Doing well with money has little to do with how smart you are and a lot to do with how you behave.', author: 'Morgan Housel' },
  { text: 'He who lives by the crystal ball will eat shattered glass.', author: 'Ray Dalio' },
  { text: 'It was never my thinking that made the big money for me. It always was my sitting.', author: 'Jesse Livermore' },
  { text: 'October: this is one of the peculiarly dangerous months to speculate in stocks.', author: 'Mark Twain' },
]

/**
 * The shape of a trading day. Checked in order — the first that fits wins, so
 * the more specific and more interesting conditions sit above the defaults.
 */
type Condition = 'vol-spike' | 'broad-selloff' | 'broad-rally' | 'quiet' | 'mixed' | 'drift-up' | 'drift-down'

/**
 * Two phrasings per condition so a stretch of similar days doesn't read like a
 * stuck record. Every one of these is about what the pattern has *tended* to
 * mean — never what to do about it.
 */
const BODIES: Record<Condition, string[]> = {
  'vol-spike': [
    "A jump in the VIX means traders just paid up for protection — it's a measure of how much movement the market expects next, so it rises when people stop feeling sure. Spikes like this have historically been short-lived far more often than not, and they've clustered around the days that later looked like the worst possible moment to sell. That's the uncomfortable arithmetic of volatility: the fear and the opportunity arrive in the same envelope, and you don't get to open one without the other.",
    "Volatility is the price of admission for owning stocks rather than a signal that something has broken. A fine punishes you for doing something wrong; a fee is what you pay to be in the room. Days like this are the fee being charged, visibly. Historically the market's best single days have sat unnervingly close to its worst ones — often the same week — which is the honest argument for not trying to step outside during the loud part.",
  ],
  'broad-selloff': [
    "When most of the market falls together, it usually says more about the mood than about any one company — on days like this, individual news matters less than the fact that everyone reached for the exit at once. Declines of this size are ordinary rather than exceptional: the US market has spent a meaningful share of all history below a previous high. A market that never fell would be a market that paid nothing extra for owning it.",
    "Broad down days are the part of the long-run return you actually have to live through. The historical record is unhelpfully clear that missing the market's best handful of days costs more than sitting through its worst — and those best days have a habit of arriving while the mood still feels terrible. That's not a reason to feel good about a red screen. It's a reason not to treat one as instructions.",
  ],
  'broad-rally': [
    "Broad rallies — where the big indices rise more or less together — tend to say the market's collective expectation improved, not that any single company had good news. Worth remembering that prices move on the gap between what happened and what was already expected, which is why good news sometimes lands with a thud and unremarkable news sometimes lifts everything. The number moved; what it's telling you about the next month is considerably less than it feels.",
    "Days like this feel like confirmation, which is exactly when they're worth the least as evidence. A single strong session tells you almost nothing about the next one — returns don't arrive in a tidy line, they arrive in clumps separated by long stretches of nothing much. The useful reaction to a green day is the same as to a red one, which is roughly none at all.",
  ],
  quiet: [
    "Not much happened, which is the market's most common and least reported state. Most trading days are like this: small moves, no story, nothing that survives to the evening news. It's worth noticing because compounding does almost all of its work on days exactly this boring, invisibly, and then hands you the result decades later. The flat part isn't the market failing to do anything — it's the market doing the thing.",
    "A quiet session is a reminder of how much of investing is simply elapsed time. Nothing here needs interpreting. If the plan was sound on a dramatic day it is sound on this one, and days like today are the majority — the ones that make the average, while the memorable ones make the anecdotes.",
  ],
  mixed: [
    "The indices disagreed today, which usually means money moved between parts of the market rather than into or out of it. Big established companies and smaller ones often respond to different things — borrowing costs, the economic outlook, who benefits from which — so a day where one rises while another falls is rotation rather than verdict. It's a decent illustration of why owning a broad mix means rarely having the best day, and rarely the worst.",
    "When the major indices split, the headline number you happen to hear quoted depends entirely on which one the reporter picked. That's a small lesson worth keeping: 'the market' is a choice of index, and different choices tell different stories about the same afternoon. Days like this are also the ordinary argument for diversification — not as a way to win, but as a way to not need to be right about which slice.",
  ],
  'drift-up': [
    "A modest gain, the kind that makes up most of the market's long-run record without ever making a headline. The eye-catching days get remembered, but returns are mostly assembled out of sessions like this one. Nothing here is a signal; it's just the ordinary business of prices adjusting slightly to a slightly changed set of expectations.",
    "Small green days are easy to ignore, which is roughly the correct response. Worth knowing that most of the growth in a long-held portfolio arrives in a handful of concentrated stretches nobody identifies in advance — so the value of a day like today isn't the gain, it's having been present for it.",
  ],
  'drift-down': [
    "A modest decline, well inside the range of an unremarkable week. Drops of this size happen constantly and are almost never the beginning of the story people fear at the time. The market's normal texture includes a lot of small red — it's the price of an asset whose value gets re-voted on every single day.",
    "Small losses are the background noise of owning stocks. Reacting to them is where most self-inflicted portfolio damage begins, because a day like this is indistinguishable in the moment from the first day of something larger — and it usually isn't. That ambiguity never resolves in advance, which is why plans tend to beat reactions.",
  ],
}

function pct(v: number): string {
  return `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`
}

/** Days between the Unix epoch and a YYYY-MM-DD date. Rotation key. */
function dayNumber(day: string): number {
  const [y, m, d] = day.split('-').map(Number)
  if (!y || !m || !d) return 0
  return Math.floor(Date.UTC(y, m - 1, d) / 86_400_000)
}

function pick<T>(list: T[], day: string, offset = 0): T {
  const n = dayNumber(day) + offset
  return list[((n % list.length) + list.length) % list.length]
}

interface IndexMove {
  label: string
  changePct: number
}

function classify(spx: number, moves: IndexMove[], vixChangePct: number | null): Condition {
  const up = moves.filter((m) => m.changePct > 0).length
  const down = moves.filter((m) => m.changePct < 0).length

  if (vixChangePct != null && vixChangePct >= 12) return 'vol-spike'
  if (spx <= -1 && down >= moves.length - 1) return 'broad-selloff'
  if (spx >= 1 && up >= moves.length - 1) return 'broad-rally'
  if (Math.abs(spx) < 0.25 && (vixChangePct == null || Math.abs(vixChangePct) < 8)) return 'quiet'
  if (up > 0 && down > 0) return 'mixed'
  return spx >= 0 ? 'drift-up' : 'drift-down'
}

/**
 * Builds the day's read, or null when there aren't enough numbers to say
 * anything honest — the S&P is the one series everything else is described
 * relative to, so without it there is no read.
 */
export function composeDailyRead(payload: DailyPayload | null = getCachedPayload()): DailyRead | null {
  if (!payload) return null
  const q = (id: string) => payload.markets[id]?.quote ?? null

  const spx = q('sp500')
  if (!spx) return null

  const candidates: Array<[string, string]> = [
    ['nasdaq', 'the Nasdaq'],
    ['dow', 'the Dow'],
    ['russell2000', 'the Russell 2000'],
  ]
  const moves: IndexMove[] = [{ label: 'the S&P 500', changePct: spx.changePct }]
  for (const [id, label] of candidates) {
    const quote = q(id)
    if (quote) moves.push({ label, changePct: quote.changePct })
  }

  const vix = q('vix')
  const tnx = q('tnx')

  // --- Sentence 1: the S&P, plus the day's spread across the big indices ---
  const sentences: string[] = []
  const others = moves.slice(1)
  if (others.length >= 2) {
    const sorted = [...others].sort((a, b) => b.changePct - a.changePct)
    const best = sorted[0]
    const worst = sorted[sorted.length - 1]
    sentences.push(
      `The S&P 500 finished ${pct(spx.changePct)}, with ${best.label} out front at ${pct(best.changePct)} and ${worst.label} trailing at ${pct(worst.changePct)}.`,
    )
  } else {
    sentences.push(`The S&P 500 finished ${pct(spx.changePct)}.`)
  }

  // --- Sentence 2: the fear gauge, which frames how the move felt ---
  if (vix) {
    const dir = vix.changePct >= 0 ? 'up' : 'down'
    sentences.push(
      `The VIX — the market's running estimate of how much movement is coming — sat at ${vix.price.toFixed(1)}, ${dir} ${Math.abs(vix.changePct).toFixed(1)}%.`,
    )
  }

  // --- Sentence 3: sector leadership, the "what kind of day" detail ---
  const sectorMoves = SECTORS.map((s) => ({ name: s.name, quote: payload.tickers[s.etf] })).filter(
    (s): s is { name: string; quote: NonNullable<typeof s.quote> } => Boolean(s.quote),
  )
  if (sectorMoves.length >= 3) {
    const sorted = [...sectorMoves].sort((a, b) => b.quote.changePct - a.quote.changePct)
    const top = sorted[0]
    const bottom = sorted[sorted.length - 1]
    sentences.push(
      `${top.name} led the sectors at ${pct(top.quote.changePct)}; ${bottom.name} lagged at ${pct(bottom.quote.changePct)}.`,
    )
  }
  if (tnx) sentences.push(`The 10-year Treasury yield closed at ${tnx.price.toFixed(2)}%.`)

  const condition = classify(spx.changePct, moves, vix?.changePct ?? null)

  return {
    headline: sentences.join(' '),
    body: pick(BODIES[condition], payload.day),
    // Offset so the quote doesn't march in lockstep with the body variants.
    quote: pick(QUOTES, payload.day, 7),
  }
}
