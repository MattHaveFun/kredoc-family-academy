// Static, manually maintained calendar of known market-moving events.
// Twelve Data's free tier has no economic calendar endpoint, so rather than
// bolting on another paid dependency this file is updated by hand roughly
// once a quarter. Dates are ISO (YYYY-MM-DD, US Eastern release days).
//
// MAINTENANCE: keep at least ~2 months of future events here. Sources:
// federalreserve.gov (FOMC schedule), bls.gov (CPI + jobs report schedule).
export interface EconomicEvent {
  date: string // ISO date
  name: string
  why: string // one line, Kredoc voice: why this moves markets
}

export const ECONOMIC_EVENTS: EconomicEvent[] = [
  {
    date: '2026-07-02',
    name: 'June Jobs Report (Nonfarm Payrolls)',
    why: 'The monthly headcount of American jobs. Too hot and the Fed keeps rates high; too cold and recession chatter starts.',
  },
  {
    date: '2026-07-14',
    name: 'June CPI Release (Inflation)',
    why: 'The official inflation scorecard. Every basis point shapes what the Fed does next — and what your savings account pays.',
  },
  {
    date: '2026-07-28',
    name: 'FOMC Meeting Begins (Fed Rate Decision Jul 29)',
    why: 'The Fed sets the price of money itself. One sentence from the chair can move trillions of dollars in minutes.',
  },
  {
    date: '2026-07-30',
    name: 'Big Tech Earnings Week (Apple, Microsoft, Meta)',
    why: 'A handful of giant companies are ~30% of the S&P 500. When they report, the whole index holds its breath.',
  },
  {
    date: '2026-08-07',
    name: 'July Jobs Report (Nonfarm Payrolls)',
    why: 'Fresh read on hiring. Markets care less about the number itself than whether it beats what everyone guessed.',
  },
  {
    date: '2026-08-12',
    name: 'July CPI Release (Inflation)',
    why: 'Inflation cooling or reheating? This number decides whether "rate cut" stays in the market\'s vocabulary.',
  },
  {
    date: '2026-09-15',
    name: 'FOMC Meeting Begins (Fed Rate Decision Sep 16)',
    why: 'A September Fed meeting with fresh economic projections — the "dot plot" that maps where rates are headed.',
  },
  {
    date: '2026-10-02',
    name: 'September Jobs Report',
    why: 'The last big labor-market read before earnings season kicks into gear.',
  },
]

/** The next `count` events on or after today, for the dashboard calendar. */
export function upcomingEvents(count = 5, now = new Date()): EconomicEvent[] {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  return ECONOMIC_EVENTS.filter((e) => new Date(`${e.date}T23:59:59`).getTime() >= today).slice(0, count)
}
