// The 11 GICS sectors, tracked via their SPDR sector ETF proxies — the raw
// GICS sector indices aren't available on Twelve Data's free plan, but the
// ETFs move nearly identically and trade all day.
export interface Sector {
  id: string
  name: string
  etf: string
  blurb: string // one-line plain-English "what's in this sector"
}

export const SECTORS: Sector[] = [
  {
    id: 'tech',
    name: 'Technology',
    etf: 'XLK',
    blurb: 'Software, chips, and hardware — Apple, Microsoft, NVIDIA. The market\'s growth engine.',
  },
  {
    id: 'energy',
    name: 'Energy',
    etf: 'XLE',
    blurb: 'Oil and gas producers like Exxon and Chevron. Moves with crude prices, not the market.',
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    etf: 'XLV',
    blurb: 'Drugmakers, insurers, and device companies. People get sick in every economy.',
  },
  {
    id: 'financials',
    name: 'Financials',
    etf: 'XLF',
    blurb: 'Banks, insurers, and payment networks. Very sensitive to interest rates.',
  },
  {
    id: 'consumer-discretionary',
    name: 'Consumer Discretionary',
    etf: 'XLY',
    blurb: 'Stuff you want but don\'t need — Amazon, Tesla, Nike, McDonald\'s. Thrives when wallets feel fat.',
  },
  {
    id: 'consumer-staples',
    name: 'Consumer Staples',
    etf: 'XLP',
    blurb: 'Stuff you buy no matter what — toothpaste, groceries, Coca-Cola. The market\'s comfort food.',
  },
  {
    id: 'industrials',
    name: 'Industrials',
    etf: 'XLI',
    blurb: 'Airlines, railroads, defense, machinery. The economy\'s muscles and logistics.',
  },
  {
    id: 'materials',
    name: 'Materials',
    etf: 'XLB',
    blurb: 'Chemicals, metals, and mining — the raw ingredients everything else is built from.',
  },
  {
    id: 'real-estate',
    name: 'Real Estate',
    etf: 'XLRE',
    blurb: 'Companies that own buildings and collect rent (REITs). Hates high interest rates.',
  },
  {
    id: 'utilities',
    name: 'Utilities',
    etf: 'XLU',
    blurb: 'Power and water companies. Boring on purpose — steady dividends, low drama.',
  },
  {
    id: 'communication',
    name: 'Communication',
    etf: 'XLC',
    blurb: 'Google, Meta, Netflix, telecoms — everything that moves information or attention.',
  },
]
