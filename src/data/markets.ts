export type RangeKey = '1D' | '1W' | '1M' | '3M' | '1Y' | '5Y'

export const RANGE_OPTIONS: { key: RangeKey; label: string }[] = [
  { key: '1D', label: '1D' },
  { key: '1W', label: '1W' },
  { key: '1M', label: '1M' },
  { key: '3M', label: '3M' },
  { key: '1Y', label: '1Y' },
  { key: '5Y', label: '5Y' },
]

export interface Candle {
  time: number // unix seconds
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface MarketSymbol {
  id: string
  symbol: string
  name: string
  assetClass: 'Index' | 'Volatility' | 'Crypto' | 'Commodity' | 'Currency' | 'Rate'
  what: string
  why: string
  academyAnchor: string // Academy lesson id
}

export const MARKET_SYMBOLS: MarketSymbol[] = [
  {
    id: 'sp500',
    symbol: 'SPX',
    name: 'S&P 500',
    assetClass: 'Index',
    what: 'A basket of 500 of the largest publicly traded U.S. companies, weighted by size.',
    why: 'It is the single most-watched gauge of how the U.S. stock market — and by extension, corporate America — is doing.',
    academyAnchor: 'sp500',
  },
  {
    id: 'nasdaq',
    symbol: 'IXIC',
    name: 'NASDAQ Composite',
    assetClass: 'Index',
    what: 'An index of every stock listed on the Nasdaq exchange, heavily tilted toward technology companies.',
    why: 'It moves fastest when tech sentiment shifts, making it a leading signal for growth and innovation stocks.',
    academyAnchor: 'nasdaq',
  },
  {
    id: 'dow',
    symbol: 'DJI',
    name: 'Dow Jones Industrial Average',
    assetClass: 'Index',
    what: 'A price-weighted index of 30 large, well-established American companies across many industries.',
    why: 'It is the oldest and most quoted index in the world, often used as shorthand for "the market" in headlines.',
    academyAnchor: 'dow',
  },
  {
    id: 'russell2000',
    symbol: 'RUT',
    name: 'Russell 2000',
    assetClass: 'Index',
    what: 'An index tracking 2,000 smaller U.S. companies, known as small-caps.',
    why: 'Small companies are more sensitive to the domestic economy, so this index is a barometer for U.S. economic health.',
    academyAnchor: 'russell2000',
  },
  {
    id: 'vix',
    symbol: 'VIX',
    name: 'CBOE Volatility Index',
    assetClass: 'Volatility',
    what: 'A measure of how much traders expect the S&P 500 to swing over the next 30 days, derived from options prices.',
    why: 'Nicknamed the "fear gauge" — it spikes when investors expect turbulence and stays low when markets feel calm.',
    academyAnchor: 'vix',
  },
  {
    id: 'nikkei',
    symbol: 'N225',
    name: 'Nikkei 225',
    assetClass: 'Index',
    what: 'Japan\'s headline stock index — 225 of its largest companies, from Toyota to Sony — quoted in yen.',
    why: 'Japan is the world\'s third-largest economy and trades while America sleeps, so the Nikkei is often the first major market to react to overnight news — a preview of the mood before Wall Street wakes up.',
    academyAnchor: 'world-markets',
  },
  {
    id: 'ftse',
    symbol: 'FTSE',
    name: 'FTSE 100',
    assetClass: 'Index',
    what: 'The UK\'s benchmark index of its 100 largest listed companies (the "Footsie"), quoted in British pounds.',
    why: 'London is a global financial hub, and the FTSE is heavy on multinational banks, energy, and mining — making it as much a read on the world economy as on Britain itself.',
    academyAnchor: 'world-markets',
  },
  {
    id: 'dax',
    symbol: 'DAX',
    name: 'DAX',
    assetClass: 'Index',
    what: 'Germany\'s leading stock index of 40 major companies, from SAP to Siemens — the pulse of Europe\'s largest economy, quoted in euros.',
    why: 'Germany is Europe\'s industrial engine and export powerhouse, so the DAX is a sensitive gauge of global manufacturing and trade — when the world stops buying cars and machines, it shows up here first.',
    academyAnchor: 'world-markets',
  },
  {
    id: 'hangseng',
    symbol: 'HSI',
    name: 'Hang Seng',
    assetClass: 'Index',
    what: 'Hong Kong\'s benchmark index, a key window onto large Chinese and Hong Kong companies, quoted in Hong Kong dollars.',
    why: 'It\'s one of the most accessible gauges of the Chinese corporate world for global investors, and it swings hard on Beijing\'s policy moves — a live feed of sentiment toward the world\'s second-largest economy.',
    academyAnchor: 'world-markets',
  },
  {
    id: 'shanghai',
    symbol: 'SSEC',
    name: 'Shanghai Composite',
    assetClass: 'Index',
    what: 'The main index of every stock on the Shanghai Stock Exchange, quoted in Chinese yuan — the closest thing to a headline number for mainland China\'s market.',
    why: 'China\'s domestic market is dominated by local retail investors and steered by government policy, so it often marches to its own beat — a reminder that "the market" looks very different in different corners of the world.',
    academyAnchor: 'world-markets',
  },
  {
    id: 'sensex',
    symbol: 'SENSEX',
    name: 'Sensex',
    assetClass: 'Index',
    what: 'India\'s benchmark index — 30 of the largest companies listed on the Bombay Stock Exchange, quoted in rupees.',
    why: 'India is now one of the world\'s largest equity markets by value, and its economy is growing faster than almost any other major one — the Sensex is the quickest read on how investors are pricing that growth.',
    academyAnchor: 'world-markets',
  },
  {
    id: 'bitcoin',
    symbol: 'BTC',
    name: 'Bitcoin',
    assetClass: 'Crypto',
    what: 'A decentralized digital currency that trades 24/7 on exchanges around the world, uncorrelated with any single government.',
    why: 'It behaves nothing like a stock index — no closing bell, no earnings reports — making it a useful contrast for how differently assets can move.',
    academyAnchor: 'bitcoin',
  },
  {
    id: 'ethereum',
    symbol: 'ETH',
    name: 'Ethereum',
    assetClass: 'Crypto',
    what: 'The second-largest cryptocurrency — a decentralized network that is less "digital money" and more a global, always-on computer that anyone can build financial apps on top of.',
    why: 'Where Bitcoin is a bet on digital scarcity, Ethereum is a bet on a platform — so watching the two move differently is a live lesson in how even assets in the same "crypto" bucket answer to very different stories.',
    academyAnchor: 'ethereum',
  },
  {
    id: 'gold',
    symbol: 'GOLD',
    name: 'Gold',
    assetClass: 'Commodity',
    what: 'The price of one troy ounce of gold, tracked here through the front-month COMEX futures contract.',
    why: 'Gold has served as a store of value for millennia and a "flight to safety" trade during crises — it tends to hold up, or even rise, when stocks and confidence in paper money wobble.',
    academyAnchor: 'gold',
  },
  {
    id: 'oil',
    symbol: 'WTI',
    name: 'WTI Crude Oil',
    assetClass: 'Commodity',
    what: 'The price of one barrel of West Texas Intermediate crude, tracked through the front-month NYMEX futures contract.',
    why: 'Oil powers the physical economy — transportation, manufacturing, shipping — so its price ripples into gas prices, inflation reports, and corporate earnings faster than almost anything else in markets.',
    academyAnchor: 'oil',
  },
  {
    id: 'silver',
    symbol: 'SILVER',
    name: 'Silver',
    assetClass: 'Commodity',
    what: 'The price of one troy ounce of silver, tracked through the front-month COMEX futures contract — part precious metal, part industrial raw material.',
    why: 'Silver behaves like gold\'s wilder younger sibling: it gets the same "store of value" bid in a crisis, but because half of it is consumed by industry (solar panels, electronics), it swings harder in both directions — a clean lesson in how one metal can wear two hats.',
    academyAnchor: 'silver',
  },
  {
    id: 'natgas',
    symbol: 'NATGAS',
    name: 'Natural Gas',
    assetClass: 'Commodity',
    what: 'The U.S. benchmark price for natural gas (Henry Hub), tracked through the front-month NYMEX futures contract — the fuel that heats homes and increasingly generates electricity.',
    why: 'Natural gas is the most weather-driven, most violently volatile commodity on this board — a cold snap or a heat wave can move it double digits in a day, making it the purest example of a price ruled by physical supply, demand, and storage rather than sentiment.',
    academyAnchor: 'natgas',
  },
  {
    id: 'copper',
    symbol: 'COPPER',
    name: 'Copper',
    assetClass: 'Commodity',
    what: 'The price of a pound of copper, tracked through the front-month COMEX futures contract — the metal wired into almost everything that carries electricity.',
    why: 'Copper is nicknamed "Dr. Copper" for its uncanny knack of forecasting the economy: because it goes into construction, cars, and grids everywhere, its price is a real-time vote on whether the world thinks it\'s about to build more or less.',
    academyAnchor: 'copper',
  },
  {
    id: 'dxy',
    symbol: 'DXY',
    name: 'U.S. Dollar Index',
    assetClass: 'Currency',
    what: 'A single number tracking the U.S. dollar\'s strength against a basket of major currencies — mostly the euro, plus the yen, pound, and a few others.',
    why: 'The dollar is the water the whole financial system swims in: a strong dollar quietly pressures commodities, emerging markets, and U.S. company profits earned abroad, so this one index ripples into almost everything else on this dashboard.',
    academyAnchor: 'dxy',
  },
  {
    id: 'tnx',
    symbol: 'US10Y',
    name: '10-Year Treasury Yield',
    assetClass: 'Rate',
    what: 'The annualized interest rate the U.S. government pays to borrow money for 10 years — the benchmark "risk-free" yield the entire financial system prices against.',
    why: 'Mortgage rates, corporate borrowing costs, and stock valuations all take their cue from this one number — when it rises, money gets more expensive everywhere at once.',
    academyAnchor: 'tnx',
  },
  {
    id: 'ust2y',
    symbol: 'US2Y',
    name: '2-Year Treasury Yield',
    assetClass: 'Rate',
    what: 'The annualized interest rate on a two-year U.S. government bond — the maturity that tracks the market\'s best guess at where the Federal Reserve will set short-term rates over the next couple of years.',
    why: 'If the 10-year is the market\'s view of the long run, the 2-year is its read on the Fed right now — and comparing the two (the "yield curve") is the single most-watched recession warning in all of finance.',
    academyAnchor: 'ust2y',
  },
  {
    id: 'ust30y',
    symbol: 'US30Y',
    name: '30-Year Treasury Yield',
    assetClass: 'Rate',
    what: 'The interest rate on a 30-year U.S. government bond — the longest, slowest-moving yield the Treasury issues, reflecting decades of expected growth and inflation.',
    why: 'The "long bond" is where the market prices its deepest, farthest-out convictions about inflation and government debt — and it anchors the far end of the yield curve, the shape that tells you whether investors expect the economy to expand or stall.',
    academyAnchor: 'yieldcurve',
  },
]

export function formatPrice(value: number, assetClass: MarketSymbol['assetClass']): string {
  if (assetClass === 'Crypto') {
    return `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  }
  if (assetClass === 'Commodity') {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  if (assetClass === 'Rate') {
    return `${value.toFixed(2)}%`
  }
  if (assetClass === 'Currency') {
    // A dollar-index-style level (~100), not a price in dollars — no $ prefix.
    return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/**
 * Unsigned magnitude of a change, formatted for display. Rates move in basis
 * points (a 0.01-percentage-point yield change = 1 bp), which is how anyone
 * reading bonds thinks about them; everything else reads as a percent change.
 * Pair the sign/arrow with `to >= from` (equivalently the percent's sign).
 */
export function formatChangeMagnitude(
  from: number,
  to: number,
  assetClass: MarketSymbol['assetClass'],
): string {
  if (assetClass === 'Rate') {
    return `${Math.abs(Math.round((to - from) * 100))} bps`
  }
  const pct = from !== 0 ? ((to - from) / from) * 100 : 0
  return `${Math.abs(pct).toFixed(2)}%`
}
