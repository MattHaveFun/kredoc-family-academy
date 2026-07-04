// Teaching content for the interactive chart layer. Every hoverable chart
// element maps to one of these concepts: `hover` is the quick tooltip, the
// rest fills the slide-out deep-dive drawer when the element is clicked.
export interface ChartConcept {
  id: string
  name: string
  tagline: string // one-liner, shown in italics
  hover: string // short tooltip text
  paragraphs: string[] // 3–4 paragraphs, Kredoc voice
  scenario: string // character scenario
  connects: string[] // related Academy lesson ids
  aiPrompt: string // "ask Claude" prompt
}

export const CHART_CONCEPTS: Record<string, ChartConcept> = {
  'candle-body': {
    id: 'candle-body',
    name: 'The Candle Body',
    tagline: 'The distance between "where we started" and "where we ended up."',
    hover: 'BODY: The range between open and close. Green = closed higher than it opened. Red = the opposite.',
    paragraphs: [
      'The thick rectangle in the middle of a candlestick is the body, and it answers exactly one question: over this period, did the price finish above or below where it started? Green (or hollow) means buyers won the session. Red (or filled) means sellers did.',
      'The size of the body is the interesting part. A long body means one side dominated from open to close — conviction. A tiny body means the price went on a journey and came back roughly where it started — a stalemate. Traders call those small-bodied candles "dojis," and they often show up right before a trend changes its mind.',
      'Here\'s the mental model: each candle body is one round of a tug-of-war between buyers and sellers. One candle tells you who won a round. A row of candles tells you who\'s been winning the match — and whether the winning side is getting tired.',
      'Don\'t read a single candle like tea leaves. One green candle isn\'t "bullish"; it\'s one data point. The story lives in the sequence: bodies getting bigger in one direction is momentum, bodies shrinking is hesitation.',
    ],
    scenario:
      'Penny Wiseman noticed a week of shrinking green bodies after a huge run-up and took some profit calmly. Max Momentum saw the same chart and bought more, because "green means go." Three weeks later, Penny funded her Roth IRA and Max learned what a doji is — from the wrong side of one.',
    connects: ['candlesticks', 'volume'],
    aiPrompt:
      'Explain what a "doji" candlestick is, why small candle bodies after a strong trend can signal indecision, and give one famous historical example of a market top where this showed up.',
  },
  'upper-wick': {
    id: 'upper-wick',
    name: 'The Upper Wick',
    tagline: 'How high optimism got before reality showed up.',
    hover: 'UPPER WICK (Shadow): The highest price reached during this period before sellers pushed it back down.',
    paragraphs: [
      'The thin line poking out the top of a candle is the upper wick (or shadow). It marks the highest price anyone paid during that period — a price the market touched, then rejected.',
      'A long upper wick is a story in miniature: buyers charged uphill, got ambushed by sellers, and retreated. The market "tried" a higher price and enough people said "no thanks, I\'m selling here" to push it back down before the close.',
      'Where the wick appears matters. A long upper wick after a big rally often means the crowd\'s enthusiasm ran ahead of the money willing to back it — an early sign of exhaustion. The same wick in the middle of a boring sideways range usually means nothing at all.',
      'The lesson underneath: the high of the day is where optimism peaked, not where value was. Prices are opinions, and wicks are opinions that got overruled within hours.',
    ],
    scenario:
      'Terry Trendchaser bought a stock at the very top of a huge intraday spike because it "was obviously going to the moon." Sandra Steadfast looked at the same candle, saw a wick like a lightning rod, and waited. By Friday the stock was back where it started — and so was Terry\'s account, minus the difference.',
    connects: ['candlesticks', 'vix'],
    aiPrompt:
      'Explain what a "shooting star" candlestick pattern is, why long upper wicks near all-time highs make professional traders cautious, and how often such signals actually work versus fail.',
  },
  'lower-wick': {
    id: 'lower-wick',
    name: 'The Lower Wick',
    tagline: 'How far fear went before someone bought the dip.',
    hover: "LOWER WICK: The lowest price hit before buyers stepped in. Sometimes called the 'tail' — shows how far fear went.",
    paragraphs: [
      'The thin line under the candle body is the lower wick, sometimes called the tail. It marks the cheapest price of the period — the moment of maximum fear, where selling pressure finally met buyers willing to catch it.',
      'A long lower wick means the market plunged and then recovered before the close. Somebody — often patient, well-capitalized somebody — looked at the panic price and said "I\'ll take everything you\'re selling."',
      'This is why long lower wicks after a scary decline are watched so closely: they\'re evidence that real demand exists below the current price. Traders call the dramatic version a "hammer." It doesn\'t guarantee a bottom, but it shows where the floor got tested and held.',
      'The human translation: the low of the day is where panic peaked. Wicks below the body are receipts showing that when fear went on sale, someone was buying.',
    ],
    scenario:
      'During a nasty market dip, Ricky Regret sold everything at 10:15 AM, roughly four minutes before the low of the year. Grace Compoundsworth did nothing except continue her automatic monthly investment, which happened to execute that same week. Three years later Grace\'s "do nothing" strategy had quietly outperformed Ricky\'s "do something" by a mortgage payment a month.',
    connects: ['candlesticks', 'vix', 'indices-vs-stocks'],
    aiPrompt:
      'Explain what a "hammer" candlestick is, why long lower wicks during a selloff can indicate capitulation, and what the March 2020 COVID low looked like through this lens.',
  },
  volume: {
    id: 'volume',
    name: 'Volume',
    tagline: 'The lie detector strapped to every price move.',
    hover: 'VOLUME: Shares traded this period. High volume on a price move = more conviction. Low volume = take it with a grain of salt.',
    paragraphs: [
      'Volume is the number of shares (or coins, or contracts) that actually changed hands during a period. Price tells you what the market said; volume tells you how many people were in the room when it said it.',
      'The same 2% price jump means very different things at different volumes. On heavy volume, a lot of money agreed that the new price is fair — that move has witnesses. On thin volume, a handful of trades pushed the price around and it may snap right back.',
      'This is why traders treat volume as a lie detector. A breakout to new highs on weak volume is a suspect making a confident claim with a twitchy eye. The same breakout on two or three times average volume is a claim backed by evidence.',
      'One nuance worth knowing: volume spikes at turning points. The most panicked selling and the most euphoric buying both happen on enormous volume — crowds are loudest right when they\'re most wrong. Big volume plus a big wick is often the sound of a trend ending.',
    ],
    scenario:
      'Chad Yolo bought a meme stock because it rose 8% one quiet afternoon — on volume so thin you could hear crickets. Rita Reinvest waited to see whether real money followed. It didn\'t; the stock round-tripped in a week. Chad now refers to that summer as "the tuition I paid to the market."',
    connects: ['volume', 'candlesticks'],
    aiPrompt:
      'Explain why high volume on a breakout matters more than the price move itself, with a historical example of a low-volume rally that failed and a high-volume one that held.',
  },
  open: {
    id: 'open',
    name: 'Open',
    tagline: 'The market\'s first opinion of the day.',
    hover: 'OPEN: The first traded price of the period — where the market started before the day\'s tug-of-war began.',
    paragraphs: [
      'The open is simply the first price at which a trade happened in this period. For a daily candle on a U.S. index, that\'s 9:30 AM Eastern, when the exchange bell rings and overnight opinions become actual transactions.',
      'The open is rarely the same as yesterday\'s close, and the difference — the "gap" — is information. News, earnings, and world events pile up overnight while the market is closed; the open is where all of that gets priced in one instant.',
      'Professionals watch the relationship between open and close obsessively. A day that opens low and closes high means buyers took control as the session wore on. A day that opens at its high and bleeds all day means early enthusiasm met a wall of sellers.',
      'For a long-term investor, any single open is noise. But understanding gaps explains why "the market was up today" headlines sometimes feel disconnected from what you watched happen — half the move often occurred before anyone rang a bell.',
    ],
    scenario:
      'Donnie Dumpster-Fire set market-buy orders to execute at the open right after earnings news, paying the most emotional price of the day, every time. Fiona Forward used limit orders and let the morning chaos settle. Same stocks, same ideas — Fiona just paid less for them, roughly forever.',
    connects: ['candlesticks', 'indices-vs-stocks'],
    aiPrompt:
      'Explain what an opening "gap" is in markets, why prices open at a different level than they closed, and why the first 30 minutes of trading are often the most volatile of the day.',
  },
  high: {
    id: 'high',
    name: 'High',
    tagline: 'The most anyone was willing to pay. Briefly.',
    hover: 'HIGH: The single highest price traded during this period — the peak of the tug-of-war.',
    paragraphs: [
      'The high is the top tick — the single most expensive trade of the period. Somebody, somewhere, paid that price. On a candlestick it\'s the tip of the upper wick.',
      'Highs matter because markets have memory. When a price approaches a previous high, traders who bought there and suffered are waiting to "get out even," creating selling pressure. That\'s the entire logic behind "resistance levels" — they\'re scar tissue.',
      'A market making new all-time highs has no scar tissue above it, which is why — counterintuitively — all-time highs have historically been followed by more all-time highs more often than by crashes. Nothing about a high price means the price is done going higher.',
      'Just remember what the high literally is: the moment maximum optimism met a real order book. It\'s a fact about one trade, not a verdict about value.',
    ],
    scenario:
      'Hank Hoardcash refused to invest for six years because the market was "at all-time highs" — through roughly 200 more of them. Wendy Wealthbuilder invested on a boring schedule and let new highs do what they historically do: lead to more of them. Hank still has his cash. Wendy has about twice as much.',
    connects: ['sp500', 'candlesticks'],
    aiPrompt:
      'Is "the market is at an all-time high" a good reason to wait before investing? Walk through what the historical data actually shows about returns after all-time highs.',
  },
  low: {
    id: 'low',
    name: 'Low',
    tagline: 'The moment fear was priced to the penny.',
    hover: 'LOW: The single lowest price traded during this period — where fear peaked and buyers stepped in.',
    paragraphs: [
      'The low is the bottom tick — the cheapest trade of the period, shown as the tip of the lower wick. Every low has two participants: someone desperate enough to sell there, and someone calm enough to buy.',
      'Like highs, lows become memory. A price level where a decline stopped repeatedly is called "support" — buyers demonstrated demand there before, so others expect them to again. It works until it doesn\'t, which is the fine print on all technical analysis.',
      'What\'s worth internalizing is who tends to be on each side of a major low. Panic selling is done by people who need the money now or can\'t stand the pain. Buying at lows is done by people with cash reserves and long horizons. Guess which group compounds wealth.',
      'You will never consistently buy the low — nobody does, and anyone who says otherwise is selling a course. The goal is smaller: stop being the person who sells there.',
    ],
    scenario:
      'Barry Brokemore checked his portfolio 40 times a day during a correction and finally sold "before it goes to zero" — at what turned out to be the low. Prudence Longview had her app hidden in a folder called "Do Not Open Until 2040." The market recovered, as it had every previous time. Only one of them noticed in real time, and it cost him.',
    connects: ['vix', 'candlesticks', 'indices-vs-stocks'],
    aiPrompt:
      'Explain "support levels" in charts, why panic selling clusters at market lows, and what behavioral finance says about why humans are wired to sell at exactly the wrong time.',
  },
  'chart-type': {
    id: 'chart-type',
    name: 'Line vs. Candlestick',
    tagline: 'Same price data, two different lenses.',
    hover: 'LINE connects only the closes into one smooth trend. CANDLES show open/high/low/close for every period — more detail, more noise.',
    paragraphs: [
      'A line chart connects only the closing prices, one point per period, into a single smooth curve. It\'s the cleanest way to see the big picture — is this thing trending up, down, or sideways — with no distraction.',
      'A candlestick chart plots four prices per period instead of one: open, high, low, and close. Each candle is a compressed battle report between buyers and sellers, which is why professional traders default to candles once they\'re reading for more than just direction.',
      'Neither view is more "correct" — they\'re the same underlying data at different resolutions. A line chart is a zoomed-out summary; candles are the zoomed-in blow-by-blow. Zoom out to judge the trend, zoom in to judge the fight.',
      'A practical rule: if you\'re deciding whether to check on an investment at all, the line chart is enough. If you\'re studying how a specific move happened — who won, how convincingly — candles are where the story lives.',
    ],
    scenario:
      'Wendy Wealthbuilder glances at the line chart on her index fund twice a year and moves on with her life. Max Momentum stares at candlestick charts every morning trying to divine the market\'s mood from wicks on a fund he\'s holding for the next 30 years. Both funds performed identically. Only one of them lost sleep over it.',
    connects: ['candlesticks', 'sp500'],
    aiPrompt:
      'Explain the practical differences between reading a line chart and a candlestick chart, when professional traders prefer each, and why a long-term investor usually only needs the line.',
  },
  close: {
    id: 'close',
    name: 'Close',
    tagline: 'The only price that makes the evening news.',
    hover: 'CLOSE: The final traded price of the period. The number headlines quote and funds are valued at.',
    paragraphs: [
      'The close is the last price traded before the period ended. For U.S. stocks that\'s 4:00 PM Eastern, sealed by a massive "closing auction" where a huge share of the whole day\'s volume trades in one final print.',
      'The close is the most important price of the day for a simple reason: it\'s the settled verdict. Mutual funds are valued at it, index performance is measured by it, and headlines quote it. The open is a reaction; the close is a decision.',
      'Traders read the close against the day\'s range. Closing at the high of the day means buyers were still in charge when time ran out — strength. Closing at the low after a promising morning means the rally couldn\'t hold — weakness. Where a candle closes within its range is the punchline of its story.',
      'For long-term investors, no single close matters. But a habit of strong closes or weak closes across weeks is one of the more honest reads of market mood — it\'s where money commits to holding overnight.',
    ],
    scenario:
      'Max Momentum judged every day by its most exciting moment — "it was up 3% at lunch!" Rita Reinvest only ever looked at closes, weekly. Max experienced roughly 250 emotional events a year; Rita experienced 52 data points. Same market, same returns — one of them also kept their cortisol levels.',
    connects: ['candlesticks', 'sp500'],
    aiPrompt:
      'Explain what the stock market\'s closing auction is, why so much volume trades at 4:00 PM, and why the closing price matters more than any other price of the day.',
  },
}
