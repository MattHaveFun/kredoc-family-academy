/**
 * Geographic + trading-hours metadata for the exchanges shown on the Global
 * tab's world map. Keyed by MarketSymbol id, except 'nyc' which is a
 * reference-only marker (New York isn't a selectable tile on this tab — it's
 * shown so the map reads as "the trading day moving around the planet"
 * rather than a disconnected list of foreign dots).
 */
export interface MarketGeo {
  id: string
  city: string
  country: string
  lat: number
  lon: number
  /** IANA timezone name — used to compute local time, DST-aware. */
  timezone: string
  /** Local trading-session start/end, 24h "HH:MM". */
  openLocal: string
  closeLocal: string
  /** True for markers that aren't clickable tiles (currently just New York). */
  isReference?: boolean
}

export const MARKET_GEO: MarketGeo[] = [
  {
    id: 'nikkei',
    city: 'Tokyo',
    country: 'Japan',
    lat: 35.68,
    lon: 139.69,
    timezone: 'Asia/Tokyo',
    openLocal: '09:00',
    closeLocal: '15:00',
  },
  {
    id: 'shanghai',
    city: 'Shanghai',
    country: 'China',
    lat: 31.23,
    lon: 121.47,
    timezone: 'Asia/Shanghai',
    openLocal: '09:30',
    closeLocal: '15:00',
  },
  {
    id: 'hangseng',
    city: 'Hong Kong',
    country: 'China',
    lat: 22.32,
    lon: 114.17,
    timezone: 'Asia/Hong_Kong',
    openLocal: '09:30',
    closeLocal: '16:00',
  },
  {
    id: 'dax',
    city: 'Frankfurt',
    country: 'Germany',
    lat: 50.11,
    lon: 8.68,
    timezone: 'Europe/Berlin',
    openLocal: '09:00',
    closeLocal: '17:30',
  },
  {
    id: 'ftse',
    city: 'London',
    country: 'UK',
    lat: 51.51,
    lon: -0.13,
    timezone: 'Europe/London',
    openLocal: '08:00',
    closeLocal: '16:30',
  },
  {
    id: 'sensex',
    city: 'Mumbai',
    country: 'India',
    lat: 19.08,
    lon: 72.88,
    timezone: 'Asia/Kolkata',
    openLocal: '09:15',
    closeLocal: '15:30',
  },
  {
    id: 'nyc',
    city: 'New York',
    country: 'USA',
    lat: 40.71,
    lon: -74.01,
    timezone: 'America/New_York',
    openLocal: '09:30',
    closeLocal: '16:00',
    isReference: true,
  },
]

/** Minutes since local midnight, parsed from an "HH:MM" string. */
function minutesOf(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

/**
 * Whether a market is in its trading session right now, based on the
 * exchange's own local clock (DST-aware via Intl) and a Mon–Fri session
 * window. Ignores holidays and half-days — a reasonable simplification for
 * an at-a-glance dashboard indicator, not a trading system.
 */
export function isMarketOpenNow(geo: MarketGeo, now: Date = new Date()): boolean {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: geo.timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    weekday: 'short',
  }).formatToParts(now)

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  const weekday = get('weekday')
  if (weekday === 'Sat' || weekday === 'Sun') return false

  const hour = Number(get('hour'))
  const minute = Number(get('minute'))
  const nowMinutes = hour * 60 + minute

  return nowMinutes >= minutesOf(geo.openLocal) && nowMinutes <= minutesOf(geo.closeLocal)
}

/**
 * A timezone's current offset from UTC, in minutes (positive = ahead of
 * UTC), derived by formatting the same instant in both zones and diffing
 * the wall-clock strings. DST-aware because it's evaluated for `now`.
 */
function tzOffsetMinutes(timezone: string, now: Date): number {
  const asUTC = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }))
  const asTz = new Date(now.toLocaleString('en-US', { timeZone: timezone }))
  return (asTz.getTime() - asUTC.getTime()) / 60_000
}

/**
 * Today's open/close translated to UTC minutes-since-midnight, for plotting
 * a market's session on a UTC-based 24-hour dial. None of the exchanges on
 * this dashboard have a session that crosses UTC midnight, so callers can
 * assume 0 <= openUTC < closeUTC <= 1440.
 */
export function utcSessionMinutes(geo: MarketGeo, now: Date = new Date()): { openUTC: number; closeUTC: number } {
  const offset = tzOffsetMinutes(geo.timezone, now)
  return {
    openUTC: minutesOf(geo.openLocal) - offset,
    closeUTC: minutesOf(geo.closeLocal) - offset,
  }
}

export function utcMinutesNow(now: Date = new Date()): number {
  return now.getUTCHours() * 60 + now.getUTCMinutes()
}
