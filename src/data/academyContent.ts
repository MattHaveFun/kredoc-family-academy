export interface AcademySection {
  id: string
  tag: string
  title: string
  tldr: string
  body: string[]
}

export const ACADEMY_SECTIONS: AcademySection[] = [
  {
    id: 'sp500',
    tag: 'Index',
    title: 'S&P 500',
    tldr: 'The 500 biggest U.S. companies, bundled into one number.',
    body: [
      'Imagine you couldn\'t decide which single U.S. company to bet on, so instead you bought a tiny sliver of the 500 biggest ones at once — Apple, Amazon, JPMorgan, all of it. That bundle is basically the S&P 500.',
      'It\'s "market-cap weighted," meaning giant companies like Apple and Microsoft move the index a lot more than a smaller company buried near the bottom of the list. When people say "the market was up today," they usually mean this number went up.',
      'Why it matters: it\'s the default scoreboard for the U.S. economy. Index funds that track the S&P 500 are one of the most common ways ordinary people invest for retirement, precisely because you don\'t have to guess which single company wins.',
    ],
  },
  {
    id: 'nasdaq',
    tag: 'Index',
    title: 'NASDAQ Composite',
    tldr: 'Every stock on the Nasdaq exchange — heavy on tech.',
    body: [
      'The Nasdaq Composite tracks every single company listed on the Nasdaq stock exchange — thousands of them. Historically, Nasdaq has been where tech and biotech companies list, so this index skews hard toward software, chips, and internet businesses.',
      'That tilt is exactly why it matters: when the Nasdaq swings way harder than the S&P 500 on a given day, it usually means something tech-specific happened — an AI earnings beat, a chip export rule, a rate-sensitive growth-stock sell-off.',
      'Think of it as the "mood ring" for the tech sector. If you want to know how investors feel about growth and innovation stories specifically, this is the number to watch.',
    ],
  },
  {
    id: 'dow',
    tag: 'Index',
    title: 'Dow Jones Industrial Average',
    tldr: 'The original 30-stock index, still quoted everywhere.',
    body: [
      'The Dow is the oldest major U.S. market index, dating back to 1896, and it only tracks 30 companies — but they\'re meant to represent the broad economy, from Coca-Cola to Boeing to Goldman Sachs.',
      'Here\'s the quirk: unlike the S&P 500, the Dow is "price-weighted," not size-weighted. A $500 stock moves the Dow more than a $50 stock, even if the $50 stock\'s company is worth way more. It\'s a weird, old-fashioned way to build an index, but tradition dies hard.',
      'Why it still matters: it\'s the number cable news anchors have quoted for over a century, so it remains cultural shorthand for "the stock market," even though professional investors lean on the S&P 500 for a more accurate read.',
    ],
  },
  {
    id: 'russell2000',
    tag: 'Index',
    title: 'Russell 2000',
    tldr: 'The 2,000 smaller companies nobody puts on magazine covers.',
    body: [
      'While the S&P 500 and Nasdaq are full of household names, the Russell 2000 tracks 2,000 smaller, "small-cap" U.S. companies — regional banks, niche manufacturers, smaller retailers.',
      'Small companies borrow more, rely more on the domestic U.S. economy, and have less cash cushion than giants like Apple. That makes the Russell 2000 unusually sensitive to interest rates and the health of the everyday U.S. economy.',
      'Why it matters: traders often watch the Russell 2000 as an "economic health check" — if big tech is booming but small caps are struggling, it can be a sign the rally is narrower than it looks.',
    ],
  },
  {
    id: 'vix',
    tag: 'Volatility',
    title: 'VIX — the "Fear Gauge"',
    tldr: 'A number that measures how nervous the options market is.',
    body: [
      'The VIX doesn\'t track a basket of stocks — it tracks fear. It\'s calculated from S&P 500 options prices and estimates how much traders expect the index to swing (up or down) over the next 30 days.',
      'Low VIX (say, under 15) means the market feels calm and complacent. A spike above 30 usually means something scary is happening — a crash, a crisis, a surprise Fed move — and traders are paying up for insurance against big swings.',
      'Why it matters: the VIX is a contrarian\'s favorite tool. Extremely low readings can signal complacency right before a shock; extremely high readings have historically lined up with some of the best long-term buying opportunities, because panic tends to overshoot.',
    ],
  },
  {
    id: 'bitcoin',
    tag: 'Crypto',
    title: 'Bitcoin',
    tldr: 'Digital money that never sleeps, never closes, answers to no bank.',
    body: [
      'Bitcoin is a decentralized digital currency — no central bank, no company, no CEO. It runs on a public ledger (the blockchain) maintained by a global network of computers instead of a single institution.',
      'Unlike the S&P 500 or Dow, Bitcoin trades 24 hours a day, 7 days a week, 365 days a year. There\'s no opening bell and no closing bell, which is part of why its price charts look so much choppier — there\'s never a quiet overnight session to smooth things out.',
      'Why it matters: it\'s become a widely watched barometer for risk appetite and a hedge some investors use against currency devaluation or banking-system stress — while remaining far more volatile than any of the indices above.',
    ],
  },
  {
    id: 'candlesticks',
    tag: 'Chart literacy',
    title: 'Candlestick Charts',
    tldr: 'Four numbers, one shape: open, high, low, close.',
    body: [
      'A candlestick packs four prices into a single shape: where the price opened, where it closed, and the highest and lowest points it touched in between. The thick "body" spans open-to-close; the thin "wicks" show the high and low.',
      'Green (or unfilled) candles mean the price closed higher than it opened. Red (or filled) candles mean it closed lower. Stack a few hundred of these side by side and you get a story of momentum, indecision, and reversals that a plain line chart can\'t tell.',
      'Why it matters: professional traders use candlestick patterns to gauge whether buyers or sellers are winning a fight at a given price level — it\'s a compressed way of reading market psychology.',
    ],
  },
  {
    id: 'volume',
    tag: 'Chart literacy',
    title: 'Volume',
    tldr: 'How many shares actually changed hands.',
    body: [
      'Volume is simply the number of shares (or contracts, or coins) traded in a given period. A price move on huge volume means a lot of money agreed to make that move happen — it\'s more "real" than the same move on a quiet, low-volume day.',
      'Why it matters: volume is the lie detector of price charts. A breakout to new highs on weak volume is often viewed with suspicion; the same breakout on heavy volume is taken far more seriously by traders.',
    ],
  },
  {
    id: 'indices-vs-stocks',
    tag: 'Foundations',
    title: 'Indices vs. Individual Stocks',
    tldr: 'One tracks a whole group; the other tracks a single company.',
    body: [
      'A stock represents ownership in one company. An index is just a formula that averages many stocks together to represent a whole market or sector — you can\'t technically "buy an index" directly, but you can buy a fund that tracks one.',
      'Why it matters: individual stocks can be wiped out by one bad earnings report; a broad index rarely goes to zero, because it\'s diversified across hundreds of companies. That\'s the entire reason index investing became so popular — it trades the chance of huge upside for a much lower chance of catastrophic downside.',
    ],
  },
]
