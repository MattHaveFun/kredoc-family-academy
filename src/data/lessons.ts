// The Academy curriculum. Chapter 1: Reading the Market — nine lessons, each
// with three layers of depth (surface / middle / deep), a character scenario,
// one question per learning mode, concept connections, and an AI prompt.
//
// Writing rules (see project voice guidelines): stories first, plain English
// always, honest about uncertainty, never financial advice, never preachy.

export type LessonCategory = 'index' | 'volatility' | 'crypto' | 'chart-literacy' | 'foundations' | 'commodity' | 'currency' | 'rates'

export type LearningMode = 'gut-check' | 'real-scenario' | 'myth-vs-reality'

export interface ChoiceQuestion {
  prompt: string
  options: string[]
  answerIndex: number
  explanation: string
}

export interface MythQuestion {
  statement: string
  isMyth: boolean // true = the confident statement is FALSE
  explanation: string
}

export interface Lesson {
  id: string
  chapter: number
  order: number
  category: LessonCategory
  tag: string
  title: string
  tagline: string
  /** Live chart hook: MARKET_SYMBOLS id whose mini-chart is shown on the surface layer. */
  marketId?: string
  /** Flagged risk callout for unusually volatile assets — shown right under the surface layer. */
  riskNote?: string
  surface: string // 1 paragraph, always visible
  middle: string[] // 2–3 paragraphs: analogies, history, why a 22-year-old should care
  deep: string[] // mechanics, edge cases, what professionals actually watch
  scenario: string // character story
  gutCheck: ChoiceQuestion
  realScenario: ChoiceQuestion
  mythVsReality: MythQuestion
  connects: string[] // related lesson ids
  aiPrompt: string
  depth: 1 | 2 | 3 // knowledge-map node size: how much is under the surface
}

export interface Chapter {
  number: number
  title: string
  subtitle: string
}

export const CHAPTERS: Chapter[] = [
  {
    number: 1,
    title: 'Reading the Market',
    subtitle: 'The ideas that turn a wall of numbers into a story you can follow.',
  },
  {
    number: 2,
    title: 'Beneath the Surface',
    subtitle: 'The metals, money, and interest rates that move quietly under the stock market — and often move it.',
  },
]

export const LESSONS: Lesson[] = [
  {
    id: 'sp500',
    chapter: 1,
    order: 1,
    category: 'index',
    tag: 'Index',
    title: 'The S&P 500',
    tagline: 'The 500 biggest U.S. companies, bundled into one number.',
    marketId: 'sp500',
    surface:
      'Imagine you couldn\'t decide which single U.S. company to bet on, so instead you bought a tiny sliver of the 500 biggest ones at once — Apple, Amazon, JPMorgan, all of it. That bundle is the S&P 500. When someone says "the market was up today," this is almost always the number they mean.',
    middle: [
      'The index is "market-cap weighted": bigger companies count more. Apple moving 2% shifts the whole index more than the smallest hundred companies combined. That design has a side effect worth knowing — in some years, a handful of giant tech companies ARE most of "the market\'s" performance, while the average stock does much less.',
      'Why should a 22-year-old care? Because the S&P 500 is probably where your retirement money already lives, or will. Index funds tracking it are the default choice in most 401(k)s, and the entire pitch is humility: nobody reliably picks which company wins the next decade, so own all of them and let the winners emerge.',
      'The historical record is the reason people trust that pitch: through wars, crashes, pandemics, and about fourteen "this time is different" panics, the index has returned roughly 10% a year on average over the last century. "On average" is doing heavy lifting there — the ride includes years of -37% and +32% — but the direction over decades has been stubbornly up.',
    ],
    deep: [
      'Mechanics: a committee at S&P Global decides membership — it\'s not automatic. Companies need consistent profitability, sufficient size (tens of billions today), and enough freely traded shares. Getting added tends to bump a stock (index funds must buy it); getting removed is the walk of shame in reverse.',
      'The nuance professionals obsess over is concentration. When the top 10 holdings exceed a third of the index — as they have in recent years — the "500 companies of diversification" is partly an illusion: you\'re making a large, implicit bet on mega-cap tech. Watch the equal-weighted version of the index (ticker RSP) diverge from the regular one to see this in real time.',
      'Edge case worth knowing: the index is priced in nominal dollars and ignores dividends. "Total return" versions, which reinvest dividends, roughly double the long-run growth number. When someone shows you a scary chart of the market "going nowhere for a decade," check whether dividends were quietly left out.',
      'What the pros actually watch: breadth (how many stocks are participating in a rally), earnings revisions (are analysts raising or cutting estimates), and the index\'s valuation versus history (price-to-earnings ratios). None of these predict short-term moves; all of them shape long-term expectations.',
    ],
    scenario:
      'Wendy Wealthbuilder set up an automatic $200 monthly buy of an S&P 500 index fund at 22 and forgot the password on purpose. Barry Brokemore spent the same decade hopping between "the next Apple" candidates he found on social media. Three years in, Barry had stories. Thirty years in, Wendy had a house.',
    gutCheck: {
      prompt: 'The S&P 500 is best described as…',
      options: [
        'The 500 fastest-growing companies in America',
        'A size-weighted basket of about 500 of the largest U.S. companies',
        'The 500 stocks with the highest prices',
      ],
      answerIndex: 1,
      explanation:
        'Membership is about being large, profitable, and established — not fast-growing or high-priced. And "size-weighted" is the key detail: Apple moves the number far more than company #499 does.',
    },
    realScenario: {
      prompt:
        'The S&P 500 rose 24% this year, but you read that the median stock in the index rose only 6%. What most likely happened?',
      options: [
        'The data is wrong — an index can\'t rise more than its typical stock',
        'A handful of giant companies did most of the lifting, because the index is market-cap weighted',
        'Dividends made up the difference',
      ],
      answerIndex: 1,
      explanation:
        'This exact gap happened in 2023. Because bigger companies count more, a few mega-caps having a monster year can drag the index far above what the "average" stock did. It\'s a feature of the math, and a real concentration risk to understand.',
    },
    mythVsReality: {
      statement: 'The market is at an all-time high, so it\'s obviously a terrible time to invest.',
      isMyth: true,
      explanation:
        'Feels airtight, isn\'t. Historically, returns following all-time highs have been about as good as returns from any other day — because a rising market spends a lot of its life near highs. Waiting for a crash that may arrive years later (or from a higher level) has historically cost more than it saved. As always: that\'s the historical tendency, not a guarantee.',
    },
    connects: ['indices-vs-stocks', 'nasdaq', 'dow'],
    aiPrompt:
      'Explain how S&P 500 market-cap weighting works with a concrete example, why index concentration in a few tech giants worries some professionals, and what the equal-weight version of the index tells us.',
    depth: 3,
  },
  {
    id: 'nasdaq',
    chapter: 1,
    order: 2,
    category: 'index',
    tag: 'Index',
    title: 'NASDAQ Composite',
    tagline: 'Every stock on the Nasdaq exchange — heavy on tech, heavy on mood swings.',
    marketId: 'nasdaq',
    surface:
      'The Nasdaq Composite tracks every company listed on the Nasdaq exchange — thousands of them — and because tech and biotech companies historically list there, it skews hard toward software, chips, and internet businesses. It\'s the market\'s mood ring for technology.',
    middle: [
      'When the Nasdaq swings much harder than the S&P 500 on a given day, something tech-specific happened: an AI earnings surprise, a chip export rule, or interest-rate news (more on why rates hit tech extra hard in the deep dive). The gap between the two indices is itself a signal worth reading.',
      'Why care at 22? Because the companies in this index are disproportionately the ones building the world you\'ll work in — and because tech\'s boom-bust rhythm is the best free education in market psychology available. The Nasdaq lost 78% from 2000 to 2002 after the dot-com bubble. It then took 15 years to reclaim its old high. The lesson isn\'t "avoid tech"; it\'s "know what kind of ride you\'re buying a ticket for."',
      'A useful contrast: the S&P 500 is a diversified economy in one number. The Nasdaq is a concentrated bet on innovation in one number. Both are useful; confusing one for the other is how people end up shocked by their own portfolio.',
    ],
    deep: [
      'Why rates hit tech hardest: a growth company\'s value lives mostly in profits it will earn years from now. Higher interest rates make future money worth less today (that\'s "discounting"), so the further out a company\'s payoff, the harder rate hikes hit its valuation. This is why 2022\'s rate shock crushed the Nasdaq (-33%) roughly twice as hard as the Dow.',
      'Composite vs. Nasdaq-100: headlines often blur two different indices. The Composite is everything on the exchange (~3,000+ listings, including tiny speculative companies). The Nasdaq-100 (what the ticker QQQ tracks) is just the hundred biggest non-financial names. The 100 is what most people actually invest in; the Composite is what gets quoted.',
      'What professionals watch: the Nasdaq/S&P ratio as a risk-appetite gauge. When it rises, investors are paying up for growth and risk; when it rolls over, money is hiding in stability. It\'s a sentiment thermometer that never gives interviews.',
      'Edge case: "tech" is leaking out of the Nasdaq. Apple-sized companies now sit in every index, and the S&P 500 itself is ~30% technology. The clean old distinction — Nasdaq is tech, S&P is everything — is blurrier every year. Check actual sector weights before assuming.',
    ],
    scenario:
      'Max Momentum went all-in on Nasdaq stocks in early 2021 because "tech only goes up," using money he needed for grad school in 2022. Prudence Longview held the same funds — inside a retirement account she wouldn\'t touch for 40 years. The 2022 crash cost them the same percentage. It only cost one of them a graduate degree.',
    gutCheck: {
      prompt: 'The Nasdaq Composite usually swings harder than the S&P 500 because…',
      options: [
        'It contains fewer companies, so each one matters more',
        'It\'s concentrated in tech and growth companies, which are more sensitive to sentiment and interest rates',
        'It\'s open for trading more hours per day',
      ],
      answerIndex: 1,
      explanation:
        'It actually holds MORE companies than the S&P 500 — thousands of them. The volatility comes from what they are: growth and tech businesses whose valuations depend heavily on the future, which makes them jumpier when the outlook shifts.',
    },
    realScenario: {
      prompt:
        'The Fed unexpectedly signals it will raise interest rates. The Dow drops 1%, but the Nasdaq drops 3%. Why the gap?',
      options: [
        'Nasdaq computers are faster, so it reacts more',
        'Growth companies\' valuations depend on far-future profits, which higher rates discount more heavily',
        'Tech companies borrow more money than industrial companies',
      ],
      answerIndex: 1,
      explanation:
        'Higher rates shrink the present value of future earnings — and growth stocks are mostly future earnings. Borrowing costs matter a little, but the discounting math is the main event. This pattern repeated all through 2022.',
    },
    mythVsReality: {
      statement: 'The Nasdaq is just another name for the tech sector.',
      isMyth: true,
      explanation:
        'Close enough for headlines, wrong enough to matter. The Nasdaq is an exchange — a venue where stocks list — and it hosts plenty of non-tech companies (Costco, PepsiCo, Marriott). Meanwhile lots of "tech" lives elsewhere. The tech tilt is real; the equivalence is lazy.',
    },
    connects: ['sp500', 'vix', 'indices-vs-stocks', 'tnx'],
    aiPrompt:
      'Walk me through the 2000 dot-com crash: what inflated the bubble, what popped it, how long recovery took, and what a 22-year-old investing today should actually take away from it.',
    depth: 2,
  },
  {
    id: 'dow',
    chapter: 1,
    order: 3,
    category: 'index',
    tag: 'Index',
    title: 'Dow Jones Industrial Average',
    tagline: 'The original 30-stock index — a 130-year-old habit the world can\'t quit.',
    marketId: 'dow',
    surface:
      'The Dow is the oldest famous U.S. market index, born in 1896, and it tracks just 30 large companies meant to represent the broad economy — Coca-Cola to Boeing to Goldman Sachs. It survives less because it\'s the best measurement and more because it\'s the one everyone\'s grandparents quoted.',
    middle: [
      'Here\'s the quirk that makes finance people roll their eyes: the Dow is "price-weighted." A $500 stock moves it ten times more than a $50 stock, even if the $50 company is worth five times as much. In 1896, when Charles Dow was averaging prices by hand, this was a reasonable shortcut. In the age of computers it\'s a charming fossil.',
      'Why care? Because the Dow teaches a meta-lesson: the numbers society pays attention to are chosen by history and habit, not merit. Cable news says "the Dow fell 600 points!" because big point numbers sound dramatic — even when 600 points is a modest 1.5% day. Learning to translate points into percentages is a small superpower.',
      'It also teaches survivorship: of the original 12 Dow companies, zero remain in the index. General Electric, a member for over a century, was shown the door in 2018. Even the bluest blue chips are temporary.',
    ],
    deep: [
      'The mechanics: add up the 30 share prices, divide by the "Dow Divisor" (a number adjusted for every stock split and member swap since 1896, currently around 0.15). That divisor is why the index reads in the tens of thousands while no member stock costs more than a few hundred dollars.',
      'Price weighting creates genuinely weird outcomes: a company can do a stock split — changing nothing about its actual value — and instantly lose most of its influence over the index. This is partly why Apple\'s 2020 4-for-1 split shuffled the Dow\'s internal pecking order overnight, and why some giant companies (Amazon for years) stayed out entirely: their share price was too HIGH to add without distorting everything.',
      'What professionals actually do with the Dow: mostly ignore it. Institutional money benchmarks against the S&P 500 or broader indices. The Dow\'s job today is cultural — a shared shorthand with 130 years of continuous psychological history. That long record is genuinely useful for studying how markets and manias rhyme across generations.',
      'Worth knowing: "the Dow" in headlines is the Industrial Average, but the Dow family includes a Transportation Average (the oldest index of all, 1884). An old-school theory holds that industrials and transports confirming each other\'s trends signals a durable move — the Victorian ancestor of every "confirmation signal" traders use today.',
    ],
    scenario:
      'Penny Wiseman heard "the Dow plunged 800 points" at a family dinner, did the division, said "so, two percent," and passed the potatoes. Chad Yolo heard the same headline and liquidated his retirement fund from the parking lot. The market recovered within the month. Chad\'s re-entry price did not.',
    gutCheck: {
      prompt: 'What makes the Dow\'s construction unusual among major indices?',
      options: [
        'It weights companies by share price instead of company size',
        'It includes private companies',
        'It updates only once per day',
      ],
      answerIndex: 0,
      explanation:
        'Price-weighting is the Dow\'s famous quirk: a $400 stock has 8× the influence of a $50 stock regardless of which company is actually bigger. Modern indices weight by market value instead.',
    },
    realScenario: {
      prompt:
        '"DOW CRASHES 1,000 POINTS" screams a headline. The Dow is at 40,000. How bad is this, actually?',
      options: [
        'Catastrophic — quadruple-digit drops mean a crisis',
        'A 2.5% decline — a rough day, but the market has several like it most years',
        'Impossible to say without knowing the point drop for the S&P too',
      ],
      answerIndex: 1,
      explanation:
        '1,000 ÷ 40,000 = 2.5%. Unpleasant, historically ordinary. Point-drop headlines get scarier automatically as the index grows — the same 2.5% was "250 points" in 1999. Always translate points to percent before letting a headline raise your heart rate.',
    },
    mythVsReality: {
      statement: 'The 30 companies in the Dow are fixed — they\'re the same industrial giants it started with.',
      isMyth: true,
      explanation:
        'The roster changes regularly, chosen by a committee. None of the 1896 originals remain, and recent decades swapped industrial icons for Apple, Microsoft, and Salesforce. "Industrial" in the name is pure nostalgia at this point.',
    },
    connects: ['sp500', 'indices-vs-stocks'],
    aiPrompt:
      'Tell the story of the Dow Jones Industrial Average like a 130-year biography: its birth in 1896, its role in 1929 and 1987, how the divisor works, and why professionals ignore it while the public never did.',
    depth: 2,
  },
  {
    id: 'russell2000',
    chapter: 1,
    order: 4,
    category: 'index',
    tag: 'Index',
    title: 'Russell 2000',
    tagline: 'The 2,000 smaller companies nobody puts on magazine covers.',
    marketId: 'russell2000',
    surface:
      'While the S&P and Nasdaq are full of household names, the Russell 2000 tracks 2,000 smaller "small-cap" U.S. companies — regional banks, niche manufacturers, that restaurant chain that only exists in the Midwest. It\'s the market\'s read on Main Street rather than Silicon Valley.',
    middle: [
      'Small companies live closer to the economic ground: they borrow more (often at floating rates), sell mostly domestically, and have thinner cash cushions than an Apple. That makes the Russell 2000 unusually honest about the everyday U.S. economy — it can\'t hide behind iPhone sales in Singapore.',
      'The classic tell: when big indices hit records while the Russell lags badly, the rally is "narrow" — driven by a few giants rather than broad prosperity. Traders read that divergence like doctors read a fever. It doesn\'t always mean trouble, but it always means "look closer."',
      'Why a 22-year-old should care: small-caps are where the next generation of big companies comes from, and historically they\'ve delivered slightly higher long-run returns in exchange for a substantially bumpier ride — a clean, real-world example of the risk-reward tradeoff every investment decision secretly is.',
    ],
    deep: [
      'Construction: FTSE Russell ranks U.S. companies by size; roughly #1,001 through #3,000 make up the Russell 2000. The whole index is worth less than Apple alone — worth sitting with that for a second when someone calls small-caps "the market."',
      'The annual "Russell reconstitution" each June, when the member list is refreshed, is one of the highest-volume trading days of the year: index funds must buy every promotion and sell every demotion simultaneously. Professionals position around it weeks ahead.',
      'Edge cases worth knowing: a meaningful chunk of Russell 2000 companies are unprofitable in any given year (often 30–40%), so the index is more speculative than its "diversified" surface suggests. And because small-caps are rate-sensitive borrowers, the index sometimes trades like a bet on Fed policy more than on business quality.',
      'What pros watch: the Russell-vs-S&P ratio for breadth, small-cap credit spreads for stress, and M&A activity — small companies get acquired, and buyout waves often start when big companies decide small ones look cheap.',
    ],
    scenario:
      'Terry Trendchaser noticed small-caps had lagged for two years and declared them "dead money" right before a Fed pivot sent the Russell up 20% in a quarter. Rita Reinvest just held a bit of everything the whole time, on the theory that she wasn\'t smarter than the rotation. She wasn\'t. Nobody is. That was the point.',
    gutCheck: {
      prompt: 'The Russell 2000 is most useful as a gauge of…',
      options: [
        'Global technology trends',
        'The health of the domestic U.S. economy and smaller businesses',
        'Commodity prices',
      ],
      answerIndex: 1,
      explanation:
        'Small-caps sell mostly at home, borrow more, and feel rate changes and consumer health fast. When economists want the market\'s opinion of Main Street, this is the number they check.',
    },
    realScenario: {
      prompt:
        'The S&P 500 hits a record high, but the Russell 2000 is down 10% over the same stretch. What\'s the most reasonable read?',
      options: [
        'Small companies are all going bankrupt',
        'The rally is narrow — a few giant companies are carrying the headline number while the average business struggles',
        'The Russell data must be delayed',
      ],
      answerIndex: 1,
      explanation:
        'This divergence — giants sprinting, everyone else jogging — is what a "narrow rally" looks like, and it happened visibly in 2023. It\'s not automatically a crash signal, but it changes the story from "everything is booming" to "a few things are booming."',
    },
    mythVsReality: {
      statement: 'Small-cap stocks are just worse versions of big stocks — riskier with nothing in return.',
      isMyth: true,
      explanation:
        'The risk is real, but so is the historical compensation: small-caps have modestly out-returned large-caps over very long horizons (the "size premium"), with brutal stretches of underperformance in between. Whether that premium persists is genuinely debated — honest answer: higher volatility is certain, higher return is only historical tendency.',
    },
    connects: ['sp500', 'indices-vs-stocks', 'vix'],
    aiPrompt:
      'Explain the "size premium" in investing — the evidence that small-cap stocks have historically outperformed, the strongest arguments that the premium is dead, and how a long-term investor should think about the debate.',
    depth: 2,
  },
  {
    id: 'vix',
    chapter: 1,
    order: 5,
    category: 'volatility',
    tag: 'Volatility',
    title: 'The VIX — Fear, Quantified',
    tagline: 'A number that measures how nervous the options market is.',
    marketId: 'vix',
    surface:
      'The VIX doesn\'t track any basket of stocks — it tracks fear. Calculated from S&P 500 options prices, it estimates how violently traders expect the index to swing over the next 30 days. Calm markets: VIX under 15. Something scary happening: 30+. Genuine panic: 50+ (2008 and March 2020 both spiked above 80).',
    middle: [
      'Think of the VIX as the price of insurance. Options are how investors insure portfolios against crashes, and like hurricane insurance, the price rockets when everyone suddenly wants coverage at once. The VIX distills all of that insurance-buying into one number — which is why it\'s nicknamed the "fear gauge."',
      'Here\'s the counterintuitive part worth internalizing at 22: historically, terrifying VIX spikes have marked some of the best long-term buying moments, because panic overshoots. The days the VIX hit its records — October 2008, March 2020 — felt like the end of the world and turned out, in hindsight, to be closer to the bottom than the top. Hindsight is carrying that sentence, and nobody rings a bell at the bottom. But the pattern of "maximum fear ≈ minimum prices" has repeated for a century.',
      'The reverse also matters: a very low VIX means comfort, and comfort breeds carelessness. Some of the market\'s nastiest surprises arrived when the VIX was napping below 12 and everyone had stopped buying insurance.',
    ],
    deep: [
      'Mechanics: the VIX is computed from a wide strip of S&P 500 option prices, expressed as annualized expected volatility. Rule of thumb for humans: divide by 4 to get the expected ONE-MONTH swing — VIX at 20 implies traders are pricing roughly ±5% of movement over the next 30 days? Not quite — divide by √12 (≈3.46), so ~±5.8%. Close enough for dinner conversation.',
      'The VIX measures expected volatility in EITHER direction, but in practice it spikes on drops and yawns at rallies, because crashes are fast and rallies are slow — fear buys insurance, greed doesn\'t.',
      'What pros watch beyond the level: the VIX futures curve. Normally longer-dated futures cost more than spot (contango — the market charging for future uncertainty). When the curve inverts ("backwardation") — panic NOW priced higher than uncertainty later — it historically marks acute stress and, often, capitulation. Also worth knowing "vol sellers" exist: strategies that harvest the insurance premium in calm times and occasionally blow up spectacularly (February 2018\'s "Volmageddon" erased several such funds in an afternoon).',
      'Edge case for the curious: you can\'t buy the VIX itself, only futures and products built on them — and those products decay in ways that have incinerated retail money for a decade. Understanding the VIX is valuable; trading it is a professional\'s game with a famous body count.',
    ],
    scenario:
      'When the VIX spiked to 45 during a crisis, Ricky Regret sold everything, reasoning the world was ending. Sandra Steadfast — who\'d written herself a note titled "when everything is red, read this" — did nothing except her regular automatic buy. Three years later, that panicked month sits on Sandra\'s chart as a barely visible dip with a great cost basis, and on Ricky\'s as the month he sold the bottom.',
    gutCheck: {
      prompt: 'A VIX reading of 35 tells you…',
      options: [
        'The S&P 500 dropped 35 points',
        'Options traders are paying up for protection — they expect unusually big swings ahead',
        'The market is guaranteed to crash',
      ],
      answerIndex: 1,
      explanation:
        'The VIX is an expectation, not an outcome — the price of portfolio insurance. At 35, protection is expensive because many people want it at once. What actually happens next is a different question; sometimes the feared storm never lands.',
    },
    realScenario: {
      prompt:
        'The VIX just spiked from 14 to 38 overnight, and the S&P dropped 4%. What probably just happened?',
      options: [
        'A genuine surprise hit the market — bad news nobody had priced in — and investors are scrambling for protection',
        'The market is up strongly and traders are celebrating',
        'Nothing — the VIX moves like that most weeks',
      ],
      answerIndex: 0,
      explanation:
        'A near-tripling of the fear gauge overnight means something shocked the system — a crisis, a policy surprise, a blowup. Moves like that happen a handful of times a decade, and they\'re exactly when a written-in-advance plan beats a decision made at 2 AM.',
    },
    mythVsReality: {
      statement: 'A high VIX means the market will keep falling — it\'s a sell signal.',
      isMyth: true,
      explanation:
        'Backwards, historically. Extreme VIX spikes cluster near market BOTTOMS, not the start of declines — by the time fear is that expensive, much of the selling has often happened. Extremely LOW readings, oddly, deserve more suspicion. None of this is a timing tool; it\'s a reminder that crowd emotion peaks at exactly the wrong moments.',
    },
    connects: ['sp500', 'candlesticks', 'volume', 'gold'],
    aiPrompt:
      'Explain how the VIX is actually calculated from options prices in plain English, what "contango" and "backwardation" in VIX futures mean, and tell the story of the February 2018 "Volmageddon" blowup.',
    depth: 3,
  },
  {
    id: 'bitcoin',
    chapter: 1,
    order: 6,
    category: 'crypto',
    tag: 'Crypto',
    title: 'Bitcoin',
    tagline: 'Digital money that never sleeps, never closes, answers to no bank.',
    marketId: 'bitcoin',
    surface:
      'Bitcoin is a decentralized digital currency — no central bank, no company, no CEO. It runs on a public ledger (the blockchain) maintained by a global swarm of computers, its supply is capped at 21 million coins by code, and it trades 24/7/365. There is no closing bell, no earnings report, and no customer service line.',
    riskNote:
      'Bitcoin routinely moves 5–10% in a single day and has lost 50–80% of its value four separate times — swings that would be front-page financial news for the S&P 500 are an ordinary Tuesday here. It has recovered to new highs every time so far, but "so far" is doing a lot of work in that sentence. Only put in money you could watch drop 80% without it changing your life.',
    middle: [
      'The most useful way to study Bitcoin here isn\'t "should I buy it" — it\'s as a contrast agent. Stocks have cash flows you can value; Bitcoin has only what the next person will pay. That makes it the purest live experiment in belief-driven pricing ever run, and watching it teaches you how much of ALL asset pricing is psychology.',
      'The volatility is the tuition and the lesson: Bitcoin has lost 50–80% of its value four separate times — and recovered to new highs each time so far. People who sized their bets to survive the drops did fine historically; people who bet rent money learned about leverage and liquidation the expensive way. "So far" is load-bearing: four recoveries is a pattern, not a law of physics.',
      'Why a 22-year-old should care regardless of their opinion: crypto is now woven into markets (ETFs, corporate treasuries, your friend\'s portfolio), and it moves like a risk-appetite thermometer. When Bitcoin is euphoric, speculation is usually running hot everywhere. Reading it tells you the market\'s mood even if you never own any.',
    ],
    deep: [
      'Mechanics in one paragraph: transactions are grouped into blocks; "miners" compete to solve a computational puzzle for the right to add the next block and collect newly minted coins plus fees. That contest ("proof of work") is what secures the ledger without a central authority — rewriting history would require out-computing the entire honest network. Every ~4 years the mining reward halves, which is how the 21-million cap enforces itself over time.',
      'The "halving cycle" is crypto\'s favorite folklore: supply growth slows every four years, and past halvings preceded bull runs. Skeptics note three data points is not statistics, and that each cycle\'s returns have shrunk. Both camps are reasoning honestly from almost no data — which is itself the meta-lesson.',
      'What professionals actually watch: correlation regimes. Bitcoin was pitched as "digital gold," uncorrelated with stocks — but in the 2022 rate shock it traded like a 3x-leveraged Nasdaq, falling 65% alongside tech. Its correlation to risk assets rises exactly when diversification would be most useful. That behavior, not any ideology, is why allocators size it carefully.',
      'Edge cases that matter: exchanges are not banks (FTX depositors learned the difference in 2022 — billions vanished with no FDIC to call); "not your keys, not your coins" is the self-custody tradeoff, which swaps counterparty risk for the risk of you losing a password worth a house; and the on-chain ledger is public forever — pseudonymous, not anonymous.',
    ],
    scenario:
      'Donnie Dumpster-Fire put his entire emergency fund into Bitcoin at the peak of a mania because his group chat had gone quiet on every other topic. Fiona Forward put in 2% of her portfolio the same week — an amount she\'d already decided she could watch drop 80% without blinking. The crash came for both of them. Only one had to sell at the bottom to make rent, and it wasn\'t the one whose bet was sized like an opinion instead of a prophecy.',
    gutCheck: {
      prompt: 'What ultimately limits the supply of Bitcoin?',
      options: [
        'The Federal Reserve sets an annual issuance cap',
        'The protocol\'s own code, which halves new issuance every ~4 years toward a 21 million cap',
        'Mining companies vote on supply each year',
      ],
      answerIndex: 1,
      explanation:
        'The cap is enforced by the software rules the whole network runs — no institution controls it. Changing it would require convincing the entire network to adopt new rules, which is precisely what the design makes hard.',
    },
    realScenario: {
      prompt:
        'It\'s Saturday at 3 AM. A major geopolitical shock hits the news. Stock markets are closed until Monday. Where can you see the financial world\'s first reaction?',
      options: [
        'You can\'t — all markets are closed',
        'Bitcoin and crypto markets, which trade around the clock',
        'The VIX, which updates continuously all weekend',
      ],
      answerIndex: 1,
      explanation:
        'Crypto never closes, so it\'s often the first liquid market to price weekend news — traders literally watch it as a proxy for how stocks might open Monday. (The VIX only updates when options markets are open.)',
    },
    mythVsReality: {
      statement: 'Bitcoin is anonymous — transactions can\'t be traced.',
      isMyth: true,
      explanation:
        'It\'s pseudonymous, which is nearly the opposite: every transaction ever made is public, forever, on the blockchain. Addresses aren\'t names, but once an address links to an identity (an exchange account, a purchase), the entire history unspools. Law enforcement has gotten very good at exactly this.',
    },
    connects: ['nasdaq', 'vix', 'volume', 'gold'],
    aiPrompt:
      'Explain how Bitcoin\'s proof-of-work actually secures the ledger without a central authority, what the halving is, and steelman both the strongest bull case and strongest bear case for Bitcoin as a long-term asset.',
    depth: 3,
  },
  {
    id: 'candlesticks',
    chapter: 1,
    order: 7,
    category: 'chart-literacy',
    tag: 'Chart literacy',
    title: 'Candlestick Charts',
    tagline: 'Four numbers, one shape: open, high, low, close.',
    marketId: 'sp500',
    surface:
      'A candlestick packs four prices into a single shape: where the price opened, where it closed, and the highest and lowest points it touched in between. The thick "body" spans open-to-close; the thin "wicks" show the extremes. Green body: closed higher than it opened. Red: the opposite. Flip the main chart to Candles mode and hover one — every part of it teaches.',
    middle: [
      'The format was invented by an 18th-century Japanese rice trader, Munehisa Homma, who figured out that the SHAPE of a day\'s trading revealed the crowd\'s emotions better than the closing price alone. Two hundred fifty years later, every trading terminal on Earth defaults to his idea. Good mental models age well.',
      'Read a candle as one round of tug-of-war: the body shows who won (buyers or sellers) and by how much; the wicks show how far each side advanced before being pushed back. A long lower wick means sellers drove prices down and buyers overwhelmed them — the fingerprints of demand. A tiny body with long wicks on both sides means a violent, exhausting draw.',
      'Why care even if you never trade: charts are the language of every market conversation you\'ll ever encounter — news segments, YouTube, your coworker\'s hot streak. Reading candles is like reading nutrition labels. It won\'t make you a chef, but you\'ll stop being fooled by packaging.',
    ],
    deep: [
      'The named patterns — doji (open ≈ close, indecision), hammer (long lower wick after a decline, possible bottom), engulfing (one body swallowing the prior one, momentum shift) — are just vocabulary for recurring crowd-psychology moments. Useful vocabulary, but studies of patterns in isolation show weak predictive power. Context is everything: a hammer at a 52-week low on triple volume is information; a hammer on a random Tuesday is a Rorschach test.',
      'The professional\'s actual edge isn\'t patterns — it\'s LOCATION plus CONFIRMATION. Where did the candle print (at support? after a 30% run?), and did volume back it up? A candle is one sentence; the trend, volume, and level it appears at are the paragraph around it.',
      'Timeframe nuance: the same data draws different stories at different zoom levels. A month of scary red dailies can be one boring green monthly candle. Day traders read 5-minute candles, investors read weeklies, and both are correct about different questions. Always know what timeframe an argument is being made on.',
      'Honest caveat to carry with you: candlestick reading works best as a defense against narratives — a way to check what buyers and sellers actually DID versus what someone claims. As a crystal ball, it has sent more retail traders to zero than it has enriched. Literacy: yes. Fortune-telling: no.',
    ],
    scenario:
      'Grace Compoundsworth learned candlesticks so she could fact-check hype — when a stock guru posted "unstoppable breakout!!", she noticed the "breakout" candle had a giant upper wick on weak volume and kept her money. Hank Hoardcash refused to learn "chart voodoo" entirely, which was principled right up until he panic-sold a dip that one glance at the weekly chart would have shown was routine. Literacy beat both superstition and pride.',
    gutCheck: {
      prompt: 'On a green candlestick, the bottom edge of the thick body marks…',
      options: [
        'The lowest price of the period',
        'The opening price',
        'The previous day\'s close',
      ],
      answerIndex: 1,
      explanation:
        'Green means the price rose, so it opened at the body\'s bottom and closed at its top. The actual lowest price is the tip of the lower wick, which can stretch well below the body.',
    },
    realScenario: {
      prompt:
        'A stock falls all morning, then roars back to close near its open. The daily candle shows a tiny body with a very long lower wick. What does that shape tell you?',
      options: [
        'Sellers are fully in control and the drop will continue',
        'Sellers pushed hard but buyers absorbed everything — demand showed up at lower prices',
        'The exchange had a data error',
      ],
      answerIndex: 1,
      explanation:
        'That\'s a hammer: the market tested lower prices and rejected them. It\'s evidence of demand, not a guarantee of reversal — professionals would want to see volume and follow-through before believing it.',
    },
    mythVsReality: {
      statement: 'Candlestick patterns are a reliable system — learn the patterns, profit from the predictions.',
      isMyth: true,
      explanation:
        'Patterns describe crowd psychology; they don\'t reliably predict it. Tested in isolation, most have roughly coin-flip accuracy. They earn their keep as a reading skill — understanding what happened and who\'s in control — not as a money printer. Anyone selling you certainty is selling you something.',
    },
    connects: ['volume', 'vix', 'sp500'],
    aiPrompt:
      'Tell the story of Munehisa Homma, the 18th-century rice trader who invented candlestick charting, and explain which parts of his insight modern research supports and which parts are folklore.',
    depth: 2,
  },
  {
    id: 'volume',
    chapter: 1,
    order: 8,
    category: 'chart-literacy',
    tag: 'Chart literacy',
    title: 'Volume',
    tagline: 'How many shares actually changed hands — the conviction meter.',
    marketId: 'sp500',
    surface:
      'Volume is the number of shares (or coins, or contracts) traded in a period — the bars along the bottom of the main chart. Price says what the market decided; volume says how many participants showed up to vote. A big move on big volume has witnesses. The same move on thin volume is a rumor.',
    middle: [
      'The mental model: price is the headline, volume is the crowd size. A protest of 12 people and a protest of 12,000 can carry the same sign, but only one changes policy. Traders trust breakouts, breakdowns, and reversals far more when volume swells behind them.',
      'Volume also reveals emotional extremes. The heaviest trading days cluster at panics and manias — capitulation bottoms and euphoric tops both print enormous volume, because that\'s when the maximum number of people can no longer stand to hold (or stand to be left out). The crowd is loudest precisely when it\'s most wrong.',
      'For a 22-year-old: this is your best filter against hype. Before believing any "this stock is exploding!" message, check whether real money participated. Low-volume pumps are how thinly-traded junk gets offloaded onto people who only looked at price.',
    ],
    deep: [
      'Mechanics worth knowing: every trade has a buyer AND a seller — volume doesn\'t mean "more buying," it means more agreement to transact. What moves price is urgency: buyers lifting offers versus sellers hitting bids. High volume + rising price = eager buyers; high volume + flat price = a genuine battle (someone big may be quietly unloading into demand — "distribution").',
      'Professionals watch relative volume (today versus the stock\'s own average) rather than raw numbers, and they respect volume most at DECISION POINTS: a new high on 3× average volume is broad conviction; the same high on half the usual volume is a rally running on fumes. Also useful: VWAP — the volume-weighted average price — the day\'s "fair price" that institutions benchmark their fills against.',
      'Edge cases: index volume differs from single-stock volume (some index feeds report no volume at all — you\'ll see that on this dashboard for SPX-style symbols, where volume shows as zero); crypto "volume" is self-reported by exchanges and historically inflated; and huge option expiration days print monster volume that means plumbing, not conviction. Volume analysis, like all chart reading, is evidence — not verdicts.',
      'The classic historical read: at the very bottom of the 2008–09 crash, the market\'s highest-volume weeks marked the point of maximum surrender — the sellers who could be shaken out had been. Nobody knew it that week. Volume told you the crowd had finished panicking, not that the future was bright. Those are different claims, and confusing them is how indicators get oversold.',
    ],
    scenario:
      'Chad Yolo bought a tiny biotech because it jumped 15% one afternoon — on about $40,000 of total trading, most of which may have been three guys and a bored market maker. Penny Wiseman noticed a boring industrial stock quietly rising for months on steadily building volume — institutions accumulating. Three years later exactly one of these companies still existed, and Penny owned it.',
    gutCheck: {
      prompt: 'A stock breaks out to a new high, but on volume far below its average. The standard read is…',
      options: [
        'Extra bullish — low volume means no one wants to sell',
        'Suspect — few participants backed the move, so it may not hold',
        'Meaningless — volume never matters',
      ],
      answerIndex: 1,
      explanation:
        'Breakouts earn trust with participation. Thin volume means the new price was set by a small crowd, and thin crowds change their minds cheaply. Traders call these "false breakouts" for a reason.',
    },
    realScenario: {
      prompt:
        'After a brutal 3-week decline, the market has its heaviest-volume down day of the year — then stabilizes. Veterans call this "capitulation." What just happened?',
      options: [
        'The decline is accelerating and volume proves it',
        'The remaining panicked sellers finally sold all at once, potentially exhausting the selling pressure',
        'Volume that high means trading will be halted',
      ],
      answerIndex: 1,
      explanation:
        'Capitulation is mass surrender — everyone who was going to panic-sell finally did, in one cathartic flush. Historically such days cluster near bottoms, though only hindsight confirms them. The tell is the combination: extreme volume, extreme fear, then stabilization.',
    },
    mythVsReality: {
      statement: 'High volume means more people are buying than selling.',
      isMyth: true,
      explanation:
        'Impossible by definition — every single share bought is a share sold. Volume measures how MUCH changed hands, not which side "won." Direction comes from urgency: whether buyers or sellers were more desperate to transact. This one-sentence correction puts you ahead of half of financial Twitter.',
    },
    connects: ['candlesticks', 'vix', 'bitcoin'],
    aiPrompt:
      'Explain what VWAP is, why institutional traders benchmark against it, and how "accumulation" and "distribution" show up in the relationship between price and volume.',
    depth: 2,
  },
  {
    id: 'indices-vs-stocks',
    chapter: 1,
    order: 9,
    category: 'foundations',
    tag: 'Foundations',
    title: 'Indices vs. Individual Stocks',
    tagline: 'One tracks a whole group; the other bets on a single story.',
    marketId: 'sp500',
    surface:
      'A stock is ownership in one company — one story, one management team, one set of ways to win or lose. An index is a formula averaging hundreds of stocks into a single number representing a whole market. You can\'t buy an index directly, but index FUNDS that track them are how most ordinary people invest. This distinction is quietly one of the most important in personal finance.',
    middle: [
      'The math nobody shows you: individual stocks are wildly more extreme than "the market\'s" average suggests. Research on the full U.S. market found the MAJORITY of stocks in history underperformed treasury bills over their lifetimes — the market\'s entire long-run return came from a small minority of huge winners. Own one stock and you\'re probably holding a loser; own all of them and you\'re guaranteed to hold the winners too.',
      'That\'s the actual case for index funds — not that stock-picking is stupid, but that the game is brutally skewed. Missing the handful of mega-winners is catastrophic, and nobody reliably identifies them in advance. Even most professional fund managers, with every advantage, fail to beat the index over 15-year stretches (the SPIVA scorecards run about 90% failing).',
      'Why this matters at 22 more than at 52: time is the index investor\'s superpower. Compounding 10%-ish average returns over 40+ years turns modest monthly savings into serious wealth — but only for money that stays invested through the crashes. Diversification is what makes staying invested psychologically survivable.',
    ],
    deep: [
      'The nuance: indexing\'s triumph created its own strange effects. Trillions of passive dollars buy every index member automatically, valuations be damned — which some argue amplifies concentration (money flows to the biggest because they\'re the biggest) and weakens price discovery. It\'s a real academic debate, not a settled one. The practical takeaway hasn\'t changed yet: costs and diversification still dominate outcomes.',
      'Single stocks aren\'t irrational — they\'re a different game. A concentrated bet is how outlier outcomes (both directions) happen, and owning a company you understand deeply teaches you more about business than any index ever will. The professional framing: your DIVERSIFIED CORE is for wealth you can\'t afford to lose; an EXPLORE sleeve — sized so total loss stings but doesn\'t matter — is for conviction and education.',
      'Edge cases worth knowing: "diversified" index funds can still be concentrated (a market-cap-weighted S&P fund is ~30% its top 10 names); sector and thematic "index" funds are often stock-picking in a costume; and international/small-cap indices exist precisely because "the S&P 500" is not the whole market, just the most famous slice.',
      'What professionals actually look at when they say "the market": breadth, sector rotation, and factor exposure — because an index is an average, and averages hide everything interesting. The index is the temperature of the ocean. Individual stocks are the fish. Different tools for different questions.',
    ],
    scenario:
      'Rita Reinvest put her serious money in boring index funds and kept a small "tuition account" for individual stock ideas, treating every loss there as a paid lesson. Barry Brokemore inverted the ratio — retirement in three stocks he\'d heard about, pocket change in the index. One of Barry\'s three stocks did fine. The other two are why, at every family gathering, Barry now steers conversations away from the year 2022.',
    gutCheck: {
      prompt: 'The core mathematical argument for index funds over stock-picking is…',
      options: [
        'Index funds are guaranteed never to lose money',
        'Most of the market\'s long-run return comes from a few huge winners nobody reliably picks in advance — owning everything guarantees you hold them',
        'Individual stocks are illegal to hold for more than ten years',
      ],
      answerIndex: 1,
      explanation:
        'Stock returns are radically skewed: a small minority of companies generate essentially all the excess wealth. Diversification isn\'t about avoiding losers — you\'ll own plenty — it\'s about never missing the rare winners that pay for everything else.',
    },
    realScenario: {
      prompt:
        'Your friend turned $2,000 into $8,000 on one stock and says index funds are "for people who like being average." What\'s the sharpest honest response?',
      options: [
        'He got lucky once; survivorship of winning bets isn\'t a strategy, and "average" beats ~90% of professionals over long periods',
        'He\'s right — quadrupling money proves skill',
        'Stocks that quadruple usually keep quadrupling',
      ],
      answerIndex: 0,
      explanation:
        'One outcome proves nothing about process — casinos produce winners hourly. The uncomfortable stat: the index\'s "average" outruns roughly 9 in 10 professional managers over 15 years. Being average, it turns out, is elite. (Also: you rarely hear about the friend\'s losing picks. Nobody posts those.)',
    },
    mythVsReality: {
      statement: 'A broad index fund can go to zero just like a single stock can.',
      isMyth: true,
      explanation:
        'Practically speaking, no. A single company can absolutely go to zero — hundreds have. An S&P 500 fund holds ~500 companies with failures continuously replaced by rising firms; for it to hit zero, corporate America would have to be worth nothing, at which point money itself is the least of your problems. Deep crashes (-50%)? Absolutely possible, has happened. Zero? Different universe of risk.',
    },
    connects: ['sp500', 'russell2000', 'dow'],
    aiPrompt:
      'Explain Hendrik Bessembinder\'s research finding that most stocks underperform treasury bills, what it implies about diversification, and the strongest counterargument a skilled stock-picker would make.',
    depth: 3,
  },
  {
    id: 'gold',
    chapter: 1,
    order: 10,
    category: 'commodity',
    tag: 'Commodity',
    title: 'Gold',
    tagline: "The oldest trade in the world: money nobody can print more of.",
    marketId: 'gold',
    surface:
      "Gold doesn't pay a dividend, doesn't grow earnings, and doesn't build anything — it just sits there, shiny, the way it has for six thousand years. What's tracked here is the front-month futures price for one troy ounce, the same contract traders use to bet on where gold is headed next. And yet, in every currency crisis, every war, every moment central banks lose the room's trust, humans reach for the same yellow metal their ancestors did.",
    middle: [
      "The case for owning gold isn't growth — it's insurance. When stocks, bonds, and currencies all wobble at once (a genuine crisis, not a routine dip), gold has historically been one of the few assets that holds its footing or even rises, because it's nobody's liability. A stock can go bankrupt. A bond can default. Gold just is what it is, no counterparty required.",
      "The honest complication: gold pays you nothing while you hold it, and over long stretches — decades at a time — it has badly lagged stocks. From 1980 to 2000, gold went essentially nowhere while the S&P 500 multiplied many times over. Gold's job in a portfolio isn't 'grow your money'; it's 'zig when everything else zags,' and that job only shows its value during the exact years everyone least expects to need it.",
      "Why care at 22? Because gold is the cleanest real-world lesson in what 'store of value' actually means, separate from 'growth investment.' Every generation rediscovers this distinction the hard way — usually during the one crisis nobody saw coming.",
    ],
    deep: [
      "Mechanics: what's quoted here is a COMEX futures contract, not a bar of metal in a vault. Futures expire and get 'rolled' into the next contract monthly, which is why professional gold-tracking funds (like GLD) actually hold physical bullion instead — futures rolling has its own cost and quirks that a spot-price chart doesn't show.",
      "The single best predictor of gold's price, more than inflation headlines, is real interest rates — the yield on inflation-protected Treasury bonds. When real yields fall (cash and bonds pay less after inflation), gold's 'costs nothing to hold, but also pays nothing' downside shrinks, and it tends to rise. When real yields climb, gold usually struggles. Watch the 10-year Treasury real yield, not the CPI report, if you want to understand a gold move.",
      "What professionals actually watch: central bank buying. Governments (China, India, and dozens of others) have been net buyers of gold reserves for over a decade, partly to diversify away from holding U.S. dollars — a slow-moving geopolitical story that shows up in gold's price long before it shows up in headlines.",
      "Edge case worth knowing: gold's 'inflation hedge' reputation is weaker than the pitch. Over any single decade, its correlation with inflation is inconsistent — it has underperformed during some genuine inflationary stretches and outperformed during calm ones. The reputation survives on a handful of dramatic examples (1970s stagflation) doing a lot of narrative work.",
    ],
    scenario:
      "Gary Goldbug moved a third of his portfolio into gold in 2011, convinced hyperinflation was one Fed meeting away. It wasn't, and gold went sideways for the next decade while everything else compounded without him. Nora Nestegg kept a boring 5% sliver of gold through the same years — never enough to notice, never enough to regret — until a real crisis a decade later made that 5% the only part of her portfolio that was up. Neither of them 'won.' Sizing, not conviction, was the actual variable.",
    gutCheck: {
      prompt: 'Gold is best understood in a portfolio as…',
      options: [
        'A growth investment that should compound like stocks over decades',
        'A form of insurance that tends to hold up when other assets are falling, at the cost of paying no income while you wait',
        'A guaranteed hedge against inflation in any given year',
      ],
      answerIndex: 1,
      explanation:
        "Gold's history is long stretches of doing nothing punctuated by real crises where it holds value while other assets don't. That's a genuinely different job than 'grow my money,' and judging it by stock-market standards misses the point.",
    },
    realScenario: {
      prompt:
        'Stocks, bonds, and the dollar are all falling together during a crisis, but gold is up 8% this month. What\'s the most likely explanation?',
      options: [
        "A data error — assets don't diverge like that",
        'Investors are fleeing to an asset with no issuer and no counterparty risk while confidence in paper assets wobbles',
        'Gold mining companies just reported strong earnings',
      ],
      answerIndex: 1,
      explanation:
        "This is gold's classic moment: when trust in currencies, governments, or the financial system itself is being questioned, an asset that isn't anyone's promise to pay becomes unusually attractive. Mining company earnings barely move the futures price.",
    },
    mythVsReality: {
      statement: 'Gold is a reliable hedge against inflation — when prices rise, gold rises with them.',
      isMyth: true,
      explanation:
        "It's a popular pitch with a shaky report card. Gold did spectacularly well during 1970s stagflation, which cemented the reputation — but across many other inflationary periods since, the correlation has been weak or even negative over multi-year stretches. What gold reliably responds to is falling real interest rates and crises of confidence, which often — but not always — overlap with inflation.",
    },
    connects: ['tnx', 'bitcoin', 'vix'],
    aiPrompt:
      "Explain why real interest rates predict gold's price better than the inflation rate does, walk through gold's actual performance during the 1970s versus the 1980-2000 period, and steelman the case for and against holding gold today.",
    depth: 2,
  },
  {
    id: 'oil',
    chapter: 1,
    order: 11,
    category: 'commodity',
    tag: 'Commodity',
    title: 'WTI Crude Oil',
    tagline: 'The barrel price that quietly sets what everything costs to make and move.',
    marketId: 'oil',
    riskNote:
      "Oil is one of the most genuinely volatile things tracked on this dashboard — prices have swung 10%+ in a single day on OPEC news, wars, and demand shocks. In April 2020, WTI futures did something that had never happened before: the price went NEGATIVE, closing around -$37 a barrel, because traders holding expiring contracts had nowhere to physically store the oil and had to pay someone to take it off their hands. It recovered within weeks. Unlike a stock, there's no company management or fundamentals meeting behind this price — just the raw math of barrels versus buyers.",
    surface:
      'WTI crude oil is the U.S. benchmark price for one barrel (42 gallons) of light, sweet crude — the raw material that becomes gasoline, jet fuel, plastics, and a thousand things in between. Unlike a stock index, oil is a physical commodity: someone, somewhere, eventually has to take delivery of an actual barrel, and that physical reality occasionally breaks the market in ways no stock ever could.',
    middle: [
      "Oil is unusual among the assets on this dashboard because it's consumed, not just traded. Every barrel produced eventually gets burned, refined, or used up — which means price is set by a genuine tug-of-war between how much the world is pumping and how much it's burning, refereed by however much storage capacity exists in between.",
      "Why a 22-year-old should care regardless of whether you'll ever trade a futures contract: oil prices move inflation reports, gas station prices, and airline ticket costs faster and more directly than almost anything else in markets. When oil spikes, the Fed's inflation fight gets harder overnight — a connection worth having in your head the next time a Middle East headline breaks.",
      "The energy sector (ticker XLE on the sector heat map) is Wall Street's most direct way to bet on oil without touching a futures contract — energy company profits track the oil price closely, since it's literally what they sell.",
    ],
    deep: [
      "Mechanics behind the 2020 negative-price event: WTI futures are contracts to buy oil at a specific delivery point (Cushing, Oklahoma) on a specific date. When a contract nears expiration, whoever still holds it either takes physical delivery or sells to someone who will. In April 2020, COVID had crushed demand so completely that storage tanks at Cushing were nearly full — nobody wanted the oil, so holders paid buyers to take the contracts off their hands rather than be stuck owning barrels with nowhere to put them. It's a plumbing problem, not proof oil is 'worthless' — the very next contract month traded around $20.",
      "WTI vs. Brent: WTI is the U.S. benchmark; Brent crude (North Sea) is the global one, and headlines often quote whichever is more dramatic that week. They usually track closely but can diverge on regional supply disruptions — a useful reminder that 'the price of oil' is actually several related but distinct numbers.",
      "What professionals actually watch: OPEC+ production quotas (a cartel of oil-exporting nations that deliberately restricts supply to support prices), weekly U.S. inventory reports from the EIA (a build means more supply than expected, a draw means less), and rig counts as a lagging signal of how much new supply is coming.",
      "Edge case worth knowing: oil demand is famously 'inelastic' in the short run — people still need to drive to work and fly to see family even when gas is expensive — which is why supply shocks (a war, a pipeline outage) move the price so much faster and harder than a slow shift in demand ever does.",
    ],
    scenario:
      "Ollie Overleveraged bought oil futures on margin in early 2020 because 'oil always bounces back,' and got wiped out by the negative-price plumbing crisis he'd never heard of before it happened. Diane Diversified owned a small energy-sector ETF position, sized so a total sector wipeout wouldn't change her retirement date, rode out the same crash, and quietly bought more near the bottom. The lesson wasn't about oil — it was about the difference between a leveraged bet on a mechanism you don't understand and a sized position in a sector you do.",
    gutCheck: {
      prompt: 'What made oil prices briefly turn negative in April 2020?',
      options: [
        'The government banned oil sales',
        'Storage capacity at the delivery point nearly ran out, so holders of expiring contracts paid buyers to take the oil rather than be stuck storing it',
        'A calculation error at the exchange',
      ],
      answerIndex: 1,
      explanation:
        'It was a real, physical plumbing problem: with demand collapsed and tanks nearly full, some contract holders found it cheaper to pay someone else to take delivery than to find somewhere to put the oil themselves. Prices recovered within weeks once the immediate storage crunch eased.',
    },
    realScenario: {
      prompt:
        'A war breaks out in a major oil-producing region and WTI jumps 12% in a day, while the S&P 500 only drops 1%. Why does oil move so much harder?',
      options: [
        'Oil traders panic more than stock traders',
        "Oil demand is inelastic short-term, so supply shocks translate almost directly into price — there's no quick substitute for a barrel of crude",
        "The S&P 500 doesn't include any energy companies",
      ],
      answerIndex: 1,
      explanation:
        "Because people and industries can't quickly reduce how much oil they use, a supply disruption has to be absorbed almost entirely through price. The S&P 500 does include energy companies (and often rises on their behalf even as the broader market wobbles) — but oil itself is the more direct, more violent way to price the same shock.",
    },
    mythVsReality: {
      statement: 'Oil going negative in 2020 proved oil was worthless and about to collapse permanently.',
      isMyth: true,
      explanation:
        "It proved the opposite of permanence — it was a narrow, mechanical glitch in one expiring futures contract at one delivery point, driven by a temporary storage crunch. The very next month's contract traded positive, around $20, and oil recovered to pre-pandemic levels within about a year. A great story; a bad basis for a long-term call.",
    },
    connects: ['gold', 'vix', 'indices-vs-stocks'],
    aiPrompt:
      'Explain exactly how WTI crude oil futures went negative in April 2020 — the mechanics of contract expiration and storage constraints — and how OPEC+ production decisions influence the oil price in normal times.',
    depth: 3,
  },
  {
    id: 'tnx',
    chapter: 1,
    order: 12,
    category: 'rates',
    tag: 'Rates',
    title: 'The 10-Year Treasury Yield',
    tagline: 'The interest rate that quietly prices everything else in finance.',
    marketId: 'tnx',
    surface:
      "When the U.S. government needs to borrow money for 10 years, it sells bonds — and the interest rate it has to offer to attract buyers is the 10-year Treasury yield. It's tracked here as a percentage (not a dollar price), and it's arguably the single most important number in all of finance: nearly every other interest rate in the economy — mortgages, car loans, corporate bonds — is priced as this yield plus some extra for additional risk.",
    middle: [
      "Here's the part that trips almost everyone up at first: bond PRICES and bond YIELDS move in opposite directions. When investors rush to buy Treasury bonds (demand goes up), the price rises — but because the bond's fixed interest payment is now split across a higher purchase price, the effective yield falls. When investors sell Treasuries, price falls and yield rises. 'Yields are up' and 'bond prices are down' are the same sentence in two different vocabularies.",
      "Why does this one government interest rate move stock prices, especially growth and tech stocks? A stock's value is really a bet on all the cash it will earn for years into the future, converted into today's dollars. The 10-year yield is the ruler used for that conversion — a higher yield makes a dollar promised in 2035 worth less today, which hits companies whose profits are mostly years away (growth stocks) far harder than companies profitable right now. This is exactly the mechanism the Nasdaq lesson describes from the stock side; this lesson is the same idea from the interest-rate side.",
      "Why care at 22? This yield sets your mortgage rate, your student loan refinancing rate, and the return your savings account competes against. When you hear 'the Fed cut rates,' the Fed only directly controls very short-term rates — the 10-year is set by the market's own guess about growth and inflation for the next decade, and it doesn't always follow the Fed's lead.",
    ],
    deep: [
      "The yield curve — plotting yields across different bond maturities (3-month, 2-year, 10-year, 30-year) — is one of the most-watched shapes in finance. Normally, longer loans demand higher rates (more time, more risk). When short-term yields rise ABOVE long-term yields ('inversion'), it has historically preceded most U.S. recessions by 12-18 months, because it signals the market expects the Fed to eventually have to cut rates to fight a slowdown.",
      "The Fed directly sets only the overnight federal funds rate; the 10-year yield is set by millions of daily trades reflecting collective bets on future growth, inflation, and Fed policy over the next decade. This is why the 10-year sometimes moves the OPPOSITE direction from a Fed rate decision — the market can decide the Fed's move changes its long-run outlook in a way that outweighs the immediate action.",
      "What professionals actually watch: the '2s10s spread' (2-year yield minus 10-year yield) as the classic recession-warning gauge; TIPS breakeven rates (the gap between regular and inflation-protected Treasuries) as the market's real-time inflation forecast; and how the 10-year behaves during equity selloffs — falling yields alongside falling stocks usually means 'flight to safety' (investors buying bonds for protection), while RISING yields during a stock selloff is the more unusual, more concerning combination, suggesting inflation or credit fear rather than safety-seeking.",
      "Edge case worth knowing: 'risk-free' is a convenient fiction, not a literal guarantee. U.S. Treasuries carry essentially zero default risk in practical terms, but they aren't free of price risk — a 10-year bond bought today can still lose significant market value if yields rise before it matures. 2022 delivered the worst year for long-term Treasury bond prices in modern history, a reminder that 'safe' and 'won't lose money' are not the same claim.",
    ],
    scenario:
      "Terry Timing sold his S&P 500 index fund in 2022 the moment the 10-year yield crossed 4%, convinced rising rates meant an imminent crash, and sat in cash waiting for a bottom that arrived, then left without him. Priya Patient kept contributing to her index fund on the same schedule through the entire rate-hiking cycle, treating the yield chart as interesting background noise rather than a trading signal. Rates matter enormously to markets in the aggregate; they're a famously unreliable clock for any one person's decisions.",
    gutCheck: {
      prompt: 'When the 10-year Treasury yield rises, bond prices…',
      options: [
        'Also rise, since higher yields mean bonds are more valuable',
        'Fall — yield and price move in opposite directions for a fixed-payment bond',
        'Are unaffected, since yield and price are unrelated',
      ],
      answerIndex: 1,
      explanation:
        'A bond promises fixed future payments. If its price falls, those same fixed payments represent a bigger percentage return relative to what you paid — a higher yield. Price down, yield up, always, by definition.',
    },
    realScenario: {
      prompt:
        'The Fed cuts its short-term interest rate, but the next day the 10-year Treasury yield actually rises. What\'s the most likely explanation?',
      options: [
        'A market error that will correct itself',
        "The market interpreted the cut as a sign the Fed is more worried about inflation risk ahead than expected, raising its own long-run rate expectations",
        'The Fed and the 10-year yield always move in opposite directions',
      ],
      answerIndex: 1,
      explanation:
        "The Fed only sets the overnight rate directly; the 10-year reflects the market's own forecast for growth and inflation over the next decade. A rate cut can sometimes read as 'the Fed sees trouble ahead' or 'inflation risk is being under-addressed,' pushing long-term yields up even as short-term rates fall.",
    },
    mythVsReality: {
      statement: "U.S. Treasury bonds are risk-free — you can't lose money owning them.",
      isMyth: true,
      explanation:
        "Default risk is essentially zero, but PRICE risk is real: if you need to sell a 10-year bond before maturity and yields have risen since you bought it, you sell at a loss. 2022 was the worst year for long-term Treasury prices in decades — a very expensive reminder that 'safe' means 'won't default,' not 'can't lose value.'",
    },
    connects: ['nasdaq', 'gold', 'sp500'],
    aiPrompt:
      'Explain the inverse relationship between bond prices and yields with a concrete numerical example, what yield curve inversion is and why it\'s watched as a recession signal, and why rising rates hit growth stocks harder than value stocks.',
    depth: 3,
  },

  // ===========================================================================
  // Chapter 2 — Beneath the Surface
  // ===========================================================================
  {
    id: 'silver',
    chapter: 2,
    order: 1,
    category: 'commodity',
    tag: 'Commodity',
    title: 'Silver',
    tagline: "Half safe-haven metal, half industrial workhorse — and twice as jumpy as gold.",
    marketId: 'silver',
    riskNote:
      "Silver routinely swings two to three times harder than gold — 5%+ days are common, and it can drop 30% in a matter of weeks. Its market is far smaller than gold's, so it takes less money to shove the price around. Treat a silver position as a spicier, more speculative cousin of a gold position, not a like-for-like swap.",
    surface:
      "Silver lives a double life. Half of it is bought for the same reason as gold — a shiny, trustless store of value people run to when they're nervous about paper money. The other half gets melted into solar panels, phones, and electric-car wiring, because silver is the best electrical conductor on Earth. That split personality is the whole story: silver gets pulled by fear AND by factory demand at the same time, which makes it one of the most restless prices on this board.",
    middle: [
      "Because it wears two hats, silver tends to exaggerate whatever gold is doing. In a precious-metals rally it usually climbs faster than gold; in a selloff it falls harder. Traders track this with the 'gold-to-silver ratio' — how many ounces of silver it takes to buy one ounce of gold. When that ratio is historically high, silver is considered 'cheap' relative to gold; when it's low, silver has run hot. It's a rough gauge, not a crystal ball, but it's the first thing metals people check.",
      "The industrial half is where silver's future gets interesting for a 22-year-old. Every solar panel and EV needs silver, and there's no cheap substitute for its conductivity — so the green-energy build-out is a genuine, growing source of demand that gold simply doesn't have. That's a real tailwind, but it also ties silver's fate to the economy: in a recession, factories buy less of everything, silver included.",
      "The honest catch is volatility. Silver's market is a fraction of gold's size, so the same dollar of buying or selling moves the price much more. That's why silver can feel thrilling on the way up and stomach-churning on the way down. The metal that makes gold look exciting is not the place to learn the difference between 'store of value' and 'get rich quick.'",
    ],
    deep: [
      "Mechanics: like gold, the quoted price here is a COMEX futures contract, not a bar in your hand. Silver's futures market is notorious for being 'thinner' — fewer big players, less liquidity — which amplifies moves and occasionally invites drama (see the scenario). Serious long-term holders who want the metal itself usually buy a physically-backed fund or coins rather than roll futures.",
      "The most famous silver story is the Hunt brothers. In 1979–80, two Texas oil heirs tried to corner the entire silver market, buying so much that the price rocketed from around $6 to nearly $50 an ounce. Regulators changed the rules, the scheme collapsed, and silver crashed ~80% — a permanent monument to how a small market can be inflated and detonated. It took 26 years for silver to revisit that 1980 peak.",
      "The gold-silver ratio has a long history worth knowing: for centuries it hovered near 15:1 (loosely tied to how the metals occur in the ground), but since silver was demonetized it has ranged wildly — from the 30s in manias to over 100 in the 2020 panic. There's no 'correct' level; it's a sentiment and relative-value tool, and people who treat it as a law of physics get humbled.",
      "What professionals actually watch: industrial demand data (especially solar installations and electronics orders), the same real-interest-rate signal that drives gold, and inventory levels in COMEX and London vaults. When vault stocks draw down while prices rise, it hints real physical demand — not just paper speculation — is behind the move. That distinction separates a durable trend from a squeeze that will reverse.",
    ],
    scenario:
      "During a metals frenzy, Rally Randy remortgaged conviction into silver at the top because 'it's about to catch up to gold any day now,' having read exactly one thread about the gold-silver ratio. It caught down instead, and 40% of his money evaporated in three weeks. Nora Nestegg, who already held a slim precious-metals sliver sized so she'd never need to check it, did nothing at all — which, during a silver spike, is very often the single hardest and smartest trade available.",
    gutCheck: {
      prompt: 'What makes silver behave differently from gold?',
      options: [
        'Silver is rarer than gold, so it holds value better',
        'Silver is both a safe-haven metal AND a heavily-used industrial material, so it responds to fear and factory demand at once — and swings harder',
        'Silver is controlled by a single government that sets its price',
      ],
      answerIndex: 1,
      explanation:
        "Gold is almost purely a monetary/store-of-value asset; silver is roughly half industrial. That dual demand, plus a much smaller market, is exactly why silver amplifies gold's moves in both directions.",
    },
    realScenario: {
      prompt:
        'Gold rises 4% during a scare, but silver jumps 9% the same week. What\'s the most reasonable read?',
      options: [
        "Silver is a better investment than gold — the numbers prove it",
        "Silver's smaller, thinner market and its safe-haven-plus-industrial demand make it amplify gold's moves in both directions — a bigger up week here also implies bigger down weeks",
        'The silver data is glitched — metals move together, one-to-one',
      ],
      answerIndex: 1,
      explanation:
        "This is silver being silver: it tends to outrun gold in rallies and fall harder in selloffs because its market is smaller and part of its demand is industrial. A bigger up move isn't proof of superiority — it's the same volatility that will bite on the way down.",
    },
    mythVsReality: {
      statement: 'Silver is just cheaper gold — same thing, smaller price tag.',
      isMyth: true,
      explanation:
        "Half wrong in an important way. They share a safe-haven role, but silver is also an industrial metal tied to the economy, and its far smaller, more volatile market means it does not behave like a discount version of gold. It moves more, for more reasons — treating it as 'gold-lite' is how people get blindsided by a 30% drawdown.",
    },
    connects: ['gold', 'copper', 'dxy'],
    aiPrompt:
      "Explain the gold-to-silver ratio — its history, what levels have meant, and its limits as a signal — and tell the story of the Hunt brothers' attempt to corner the silver market in 1980 and what it teaches about thin markets.",
    depth: 2,
  },
  {
    id: 'natgas',
    chapter: 2,
    order: 2,
    category: 'commodity',
    tag: 'Commodity',
    title: 'Natural Gas',
    tagline: "The weather-obsessed, widow-making commodity that heats your home and your electric bill.",
    marketId: 'natgas',
    riskNote:
      "Natural gas is the single most volatile commodity on this dashboard — double-digit moves in one day are ordinary, and it has been known to double or halve within a season. Traders literally nickname the front-month contract 'the widow-maker' for how ruthlessly it has wiped out people who bet on it. Watch it to learn; do not confuse watching with trading it.",
    surface:
      "Natural gas is the fuel piped into homes for heating and cooking, and increasingly what power plants burn to make electricity. The U.S. benchmark price (Henry Hub) is one of the most violent numbers in all of markets — not because of Wall Street drama, but because of weather. A colder-than-expected winter or a brutal heat wave can send it soaring or crashing double digits in a single day, because unlike a stock, natural gas answers to thermometers, not earnings calls.",
    middle: [
      "The reason gas is so jumpy comes down to storage and geography. It's hard and expensive to store (it's a gas, not a stack of barrels), and historically hard to ship across oceans, so the U.S. price was long set by domestic supply and demand alone. When a cold snap spikes heating demand faster than producers can respond, there's no quick relief valve — so the price does the adjusting, violently. It's the clearest example on this board of a price ruled by raw physics.",
      "Why care at 22? Because natural gas quietly sets a big chunk of your electricity bill and your winter heating cost, and it's central to the energy transition. It burns cleaner than coal, so it's often called a 'bridge fuel' toward renewables — but it's still a fossil fuel, which makes it a live battleground in the climate debate. Understanding it means understanding a real tension you'll be voting and paying bills around for decades.",
      "There's also a global story now. The U.S. built export terminals that chill gas into liquid (LNG) and ship it worldwide, especially to Europe after it cut off Russian supply. That's slowly tying America's once-isolated gas price to the rest of the planet — meaning a cold winter in Germany can now nudge the price of heating a house in Ohio. Markets that used to be local are becoming global in real time, and gas is watching it happen.",
    ],
    deep: [
      "Mechanics of the 'widow-maker': the front-month natural gas futures contract is famous for catastrophic, sudden moves. In 2006, a hedge fund called Amaranth lost roughly $6 billion — and collapsed — in weeks on wrong-way natural gas bets. The name stuck because the combination of weather uncertainty, thin storage buffers, and leverage has ruined more traders than almost any other single market.",
      "Seasonality is the backbone: demand peaks in winter (heating) with a secondary summer peak (air conditioning driving power plants). Traders obsess over the weekly EIA storage report — how much gas is sitting in underground caverns versus the five-year average. A 'draw' bigger than expected (storage falling fast) is bullish; a 'build' signals oversupply. The whole market is a running argument about whether storage will make it to spring.",
      "The LNG revolution changed the ceiling and the floor. Before large-scale U.S. exports, a glut had nowhere to go and prices could crater toward zero; a shortage couldn't be relieved by imports. Export capacity now links Henry Hub to Europe's TTF and Asia's JKM benchmarks — so a Freeport terminal outage or a European cold snap ripples straight into U.S. prices. The market is mid-transformation from island to network.",
      "Edge case worth knowing: natural gas prices can and do go briefly negative in specific regions (like the Permian Basin) when it's produced as a byproduct of oil drilling and there aren't enough pipelines to carry it away — producers occasionally pay to offload it. Same lesson as oil's 2020 negative print: when a physical commodity has nowhere to go, price stops behaving like an 'investment' and starts behaving like a logistics problem.",
    ],
    scenario:
      "Speculating Steve read that a cold winter was coming and put a chunk of his savings into a leveraged natural gas fund, certain he'd cracked the code. A mild January arrived instead, the price fell by half, and the fund's leverage turned that into a near-total loss. Prudence Longview, who wanted energy exposure, held a broad, unleveraged energy position sized to survive being wrong — got the same mild winter, shrugged, and kept her job at the same company. Same weather, two completely different Januaries.",
    gutCheck: {
      prompt: 'Why is natural gas one of the most volatile commodities?',
      options: [
        'Because it is traded by more people than any other commodity',
        'Because demand is weather-driven and it is hard to store, so supply can\'t adjust quickly — leaving price to do the adjusting, violently',
        'Because governments constantly change its official price',
      ],
      answerIndex: 1,
      explanation:
        "Gas demand swings with temperature, and because it's costly to store and (historically) hard to ship, there's no quick way to add supply during a spike. With the physical adjustment blocked, the price is what moves — and it moves hard.",
    },
    realScenario: {
      prompt:
        'A brutal cold snap hits the U.S. Northeast and natural gas jumps 15% in a day, while the S&P 500 barely moves. What\'s going on?',
      options: [
        'A data error — nothing moves 15% in a day for a real reason',
        'Heating demand spiked faster than supply or storage could respond, and with no quick relief valve, the price absorbed the entire shock',
        'Stock traders simply haven\'t noticed the cold weather yet',
      ],
      answerIndex: 1,
      explanation:
        "This is gas's signature move: a weather shock hits demand instantly, supply can't ramp up fast, storage is finite, so price does all the adjusting in one violent jump. The stock market shrugs because a cold week barely dents corporate earnings — but it can dominate the gas market.",
    },
    mythVsReality: {
      statement: 'Natural gas is a stable, boring utility input — it doesn\'t move much.',
      isMyth: true,
      explanation:
        "The opposite of true. Because it's weather-driven, hard to store, and historically hard to transport, natural gas is the most volatile commodity most people ever encounter — routinely swinging double digits in a day. 'Boring utility' describes the bill it lands on you; the price behind that bill is anything but.",
    },
    connects: ['oil', 'silver', 'copper'],
    aiPrompt:
      'Explain why natural gas is so much more volatile than oil, how the weekly EIA storage report drives the market, the story of the Amaranth hedge fund collapse, and how U.S. LNG exports are linking the once-isolated American gas price to Europe and Asia.',
    depth: 2,
  },
  {
    id: 'copper',
    chapter: 2,
    order: 3,
    category: 'commodity',
    tag: 'Commodity',
    title: 'Copper — "Dr. Copper"',
    tagline: "The metal with a PhD in economics, wired into everything that carries electricity.",
    marketId: 'copper',
    surface:
      "Copper earned the nickname 'Dr. Copper' because it seems to have a doctorate in forecasting the economy. It goes into homes, cars, power grids, and every electronic device — so when the world is building and buying, copper demand rises, and when the economy is slowing, copper demand falls first. Watching its price is like taking the global economy's temperature with a metal thermometer.",
    middle: [
      "The logic is simple and powerful: you can't build much of anything modern without copper wiring and plumbing, and there's no cheap substitute for how well it conducts electricity. So copper demand is a real-time vote on construction, manufacturing, and infrastructure — especially in China, which consumes roughly half the world's copper. A falling copper price often whispers 'the economy is cooling' months before the official data confirms it.",
      "For a 22-year-old, copper is quietly one of the most important metals of your lifetime, because electrification runs on it. Electric cars use several times more copper than gas cars; wind farms, solar arrays, data centers, and upgraded power grids all need enormous amounts of it. Many analysts think the world is heading toward a structural copper shortage as green demand collides with the fact that new mines take 10–20 years to open. That's a genuine long-term supply-and-demand story, not hype.",
      "The catch that keeps copper honest: it's cyclical. Because its demand is tied to building things, copper gets hit hard in recessions — the same sensitivity that makes it a great economic barometer makes it a rough ride. 'Dr. Copper' can diagnose a slowdown by falling 30% right along with it. It's a fantastic teacher of how the physical economy and financial markets are stitched together.",
    ],
    deep: [
      "Mechanics: the quoted price is a COMEX futures contract for a pound of copper (London's LME quotes it per metric tonne — same metal, different unit, so headlines can look wildly different). Copper is a true global commodity: mined heavily in Chile and Peru, refined significantly in China, and priced continuously as the sum of every builder's and manufacturer's demand against a slow-moving supply.",
      "Why supply can't just respond to demand: opening a new copper mine can take 10 to 20 years from discovery to production — permitting, financing, construction, and increasingly, resistance in the communities and ecosystems where copper is found. That long lead time means when demand surges, supply simply can't catch up for years, which is the core of the structural-shortage thesis and why copper can trend for a long time in one direction.",
      "What professionals actually watch: Chinese economic data (since China is ~half of demand), global manufacturing surveys (PMIs), and inventory levels in LME and Shanghai warehouses. They also watch the copper-to-gold ratio as a macro signal — copper (growth-sensitive) rising versus gold (fear-sensitive) suggests optimism about the economy; the ratio falling suggests the opposite. It's a cleaner growth-versus-fear gauge than either metal alone.",
      "Edge case worth knowing: because copper is so tradeable and valuable, it's a magnet for financing games and even theft. In China, copper has been used as loan collateral (sometimes the same pile pledged to multiple lenders — a scandal that surfaced in 2014), and physical copper theft from construction sites and rail lines spikes whenever the price does. When a metal is this liquid and this useful, its price reaches into places a stock chart never does.",
    ],
    scenario:
      "Cyclical Cody noticed copper falling and, sure it was a fluke, bet big that it would snap back within the month. It kept falling for two quarters as a manufacturing slowdown he hadn't noticed played out — 'Dr. Copper' had made the diagnosis he ignored. Diane Diversified simply read copper's slide as one more data point that the economy was cooling, trimmed nothing dramatically, and braced for a slower year that arrived on schedule. Copper told them both the same thing; only one was listening.",
    gutCheck: {
      prompt: 'Why is copper nicknamed "Dr. Copper"?',
      options: [
        'Because it was discovered by a doctor',
        'Because its price tends to reflect the health of the global economy, thanks to its use in construction, manufacturing, and electronics',
        'Because it has medical uses that drive its price',
      ],
      answerIndex: 1,
      explanation:
        "Copper is wired into almost everything that gets built, so its demand rises and falls with global construction and manufacturing. That makes its price an unusually good real-time read on economic health — hence the honorary 'PhD in economics.'",
    },
    realScenario: {
      prompt:
        "Copper has quietly fallen 20% over three months while stock indices are still near record highs. What's the most reasonable interpretation?",
      options: [
        "Nothing — copper and the economy are unrelated",
        "Copper may be flagging an industrial or global slowdown that the stock market hasn't fully priced in yet — worth watching, not panicking over",
        "Copper is guaranteed to keep falling forever",
      ],
      answerIndex: 1,
      explanation:
        "A sustained copper decline often signals cooling real-world demand — building and manufacturing slowing — sometimes before broad indices react. It's a yellow flag to investigate, not a crash alarm; 'Dr. Copper' diagnoses tendencies, not certainties.",
    },
    mythVsReality: {
      statement: "Copper is a boring industrial metal with no real connection to the stock market or the broader economy.",
      isMyth: true,
      explanation:
        "Backwards. Copper is one of the most economically revealing prices there is — its demand tracks global building and manufacturing so closely that traders treat it as a leading economic indicator. Far from disconnected, it's often ahead of the stock market in sensing where the real economy is going.",
    },
    connects: ['oil', 'russell2000', 'dxy'],
    aiPrompt:
      "Explain why copper is considered a leading indicator of the global economy, the case for a structural copper shortage driven by electrification versus slow mine supply, and what the copper-to-gold ratio tells investors about growth versus fear.",
    depth: 2,
  },
  {
    id: 'dxy',
    chapter: 2,
    order: 4,
    category: 'currency',
    tag: 'Currency',
    title: 'The U.S. Dollar Index',
    tagline: "The price of the dollar itself — the tide that quietly lifts or sinks everything else.",
    marketId: 'dxy',
    surface:
      "Every price on this dashboard is measured in dollars — but the dollar itself has a price, measured against other currencies. The U.S. Dollar Index (DXY) tracks how strong the dollar is versus a basket of major currencies, mostly the euro plus the yen, pound, and a few others. It sounds abstract, but the dollar is the water the whole financial system swims in, so this one number ripples into stocks, commodities, and economies worldwide — usually without anyone at the dinner table noticing.",
    middle: [
      "Here's the key relationship to lock in: a stronger dollar generally pushes down commodity prices (oil, gold, copper), because those are priced in dollars — when each dollar buys more, it takes fewer dollars to buy the same barrel. A strong dollar also squeezes U.S. companies that earn money abroad (their foreign sales convert into fewer dollars) and pressures emerging-market countries that borrowed in dollars but earn in their own weakening currency. One index, and it's tugging on half the things you'd read about in the financial news.",
      "Why care at 22? Because the dollar's strength touches you even if you never leave the country. It affects how far your money goes when you travel, the cost of imported goods and gadgets, the profits of the global companies in your index fund, and the stability of the world economy your career will unfold inside. The dollar is the closest thing markets have to a universal reference point, and learning to read it is like learning that the map you've been using has a scale.",
      "One honest wrinkle: DXY is a bit of a fossil. It's dominated by the euro (well over half the basket) and was set decades ago, so it measures the dollar mostly against Europe, not against today's actual trading partners like China or Mexico. It's still the number everyone quotes and a perfectly good gauge of 'dollar mood' — just know that when someone says 'the dollar,' this particular index is a specific, slightly dated slice of a much bigger picture.",
    ],
    deep: [
      "Mechanics: DXY is a weighted average of the dollar against six currencies — euro (~57%), yen, pound, Canadian dollar, Swedish krona, and Swiss franc — with weights fixed since 1973 (only adjusted once, when the euro replaced several European currencies). Because it's so euro-heavy, DXY is really 'the dollar versus Europe' wearing a global-sounding name. Economists prefer 'trade-weighted' dollar indices that include China and Mexico for a truer picture, but DXY is what trades and what headlines cite.",
      "The 'dollar smile' theory explains the dollar's strange habit of rising in two opposite situations: when the U.S. economy is booming (high rates and growth attract money) AND when the world is terrified (a crisis sends everyone fleeing to the dollar as the ultimate safe haven). It tends to weaken in the boring middle, when the U.S. is muddling along and investors feel comfortable taking risks elsewhere. So a rising dollar can mean 'America is winning' or 'the world is scared' — context decides which.",
      "The dollar's superpower is its role as the global reserve currency: most international trade, debt, and commodities are priced and settled in dollars, so the whole world needs them. This lets the U.S. borrow cheaply and gives its sanctions real teeth, but it also means U.S. monetary policy is effectively exported — when the Fed raises rates and the dollar strengthens, it can trigger debt crises in countries thousands of miles away that borrowed in dollars. That's real, recurring, and underappreciated.",
      "What professionals actually watch: interest-rate differentials (money flows toward whichever major economy pays more, strengthening its currency), relative growth, and safe-haven flows during crises. They also watch the dollar as a 'risk-off' tell — a sharply rising dollar during a market selloff often signals genuine global stress, as investors dump everything and pile into the one asset everyone accepts. A calm, drifting dollar usually means calm markets.",
    ],
    scenario:
      "FX Frankie was convinced a strong dollar was 'obviously good for America' and loaded up on multinational U.S. stocks to celebrate — then watched their overseas profits shrink in dollar terms and their shares lag for a year. Priya Patient just noticed the strong dollar as context: it explained why gold was heavy, why her trip abroad felt cheap, and why emerging-market headlines were nervous. She traded on none of it. Understanding the dollar made her a sharper reader of everything else, which was the entire point.",
    gutCheck: {
      prompt: 'A stronger U.S. dollar tends to…',
      options: [
        'Push commodity prices up, since everything becomes more valuable',
        'Push dollar-priced commodities down and squeeze the foreign profits of U.S. multinationals, because each dollar now buys more',
        'Have no effect on anything outside currency markets',
      ],
      answerIndex: 1,
      explanation:
        "When the dollar strengthens, it takes fewer dollars to buy the same dollar-priced barrel of oil or ounce of gold, so those prices tend to fall. And U.S. companies' foreign earnings convert into fewer dollars, pressuring their profits. The dollar's strength radiates outward into many other markets.",
    },
    realScenario: {
      prompt:
        'During a global market panic, stocks are falling worldwide — and the U.S. dollar is surging. Why would the dollar rise while almost everything else drops?',
      options: [
        'Investors made a mistake — the dollar should fall in a crisis',
        "The dollar is the world's reserve currency and ultimate safe haven, so frightened investors sell risky assets everywhere and pile into dollars",
        'The U.S. must be the only economy doing well',
      ],
      answerIndex: 1,
      explanation:
        "This is the right half of the 'dollar smile': in genuine crises, global investors flee to the dollar because it's the most trusted, most liquid asset on earth. A spiking dollar during a selloff is often a sign of real fear, not American strength.",
    },
    mythVsReality: {
      statement: 'A strong dollar is simply good news for everyone in America.',
      isMyth: true,
      explanation:
        "Too simple. A strong dollar helps if you're importing goods or traveling abroad, but it hurts U.S. exporters and multinationals (their foreign sales shrink in dollar terms), can pressure the stocks in your index fund, and can trigger crises in countries that borrowed in dollars. 'Strong' sounds like 'good,' but in currencies, strength always helps some and hurts others.",
    },
    connects: ['gold', 'oil', 'tnx'],
    aiPrompt:
      "Explain what the U.S. Dollar Index actually measures and why it's so euro-heavy, the 'dollar smile' theory of why the dollar rises in both booms and crises, and how a strong dollar and U.S. reserve-currency status can trigger debt problems in emerging-market countries.",
    depth: 2,
  },
  {
    id: 'ust2y',
    chapter: 2,
    order: 5,
    category: 'rates',
    tag: 'Rates',
    title: 'The 2-Year Treasury Yield',
    tagline: "The market's live bet on what the Federal Reserve does next.",
    marketId: 'ust2y',
    surface:
      "If the 10-year Treasury yield is the market's view of the distant future, the 2-year is its opinion about right now — specifically, where it thinks the Federal Reserve will set short-term interest rates over the next couple of years. Because the Fed's decisions dominate the near term, the 2-year yield tracks Fed expectations more tightly than almost any other number. When traders think rate cuts are coming, the 2-year falls; when they smell rate hikes, it climbs — often well before the Fed actually moves.",
    middle: [
      "The mental model: the 2-year yield is a crowd-sourced forecast of the Fed. Thousands of traders are constantly betting on the average level of short-term rates over the next two years, and the 2-year yield is the price those bets settle at. This is why it can move sharply the instant an inflation report or a Fed official's speech shifts the odds — it's not reacting to today's economy so much as to everyone's revised guess about the Fed's next several meetings.",
      "Why should a 22-year-old care about this particular maturity? Because the short end of the curve is where monetary policy actually bites — it shapes the rate on your savings account, your credit card, and short-term loans, and it's the market's clearest read on whether money is about to get cheaper or more expensive. When you hear 'the market expects three rate cuts next year,' the 2-year yield is where that expectation is written down in real time.",
      "The 2-year is also half of the most famous recession signal in finance. Compare it to the 10-year yield and you get the 'yield curve': normally the 2-year sits below the 10-year (you demand more yield to lend for longer). When the 2-year rises ABOVE the 10-year — an inversion — it means the market expects the Fed to have to cut rates soon to rescue a slowing economy. That comparison is important enough that it gets its own lesson next door.",
    ],
    deep: [
      "Mechanics: the 2-year yield is set by continuous trading in the enormous market for 2-year Treasury notes, not by the Fed directly. The Fed sets only the overnight rate; the 2-year is the market's projection of where that overnight rate will average over 24 months. This is why the 2-year often 'front-runs' the Fed — it can price in an entire hiking or cutting cycle before the first move, and the Fed sometimes ends up chasing where the 2-year already went.",
      "The 2022 rate shock is the cleanest recent example: as inflation surged, the 2-year yield rocketed from under 1% to over 4% in a matter of months — one of the fastest moves in its history — as the market violently repriced how aggressively the Fed would have to hike. Anyone watching the 2-year saw the tightening storm forming in real time, months before its full effect hit growth stocks and the housing market.",
      "What professionals actually watch: the gap between the 2-year yield and the current Fed funds rate (a big gap means the market expects big moves ahead), and how the 2-year reacts to inflation data versus growth data. They also watch it against Fed officials' own projections (the 'dot plot') — when the 2-year disagrees with the Fed's stated path, one of them is usually about to be proven wrong, and historically the market has a decent track record.",
      "Edge case worth knowing: because the 2-year is so sensitive to Fed expectations, it can whip around violently on a single data point, sometimes overshooting. A hot inflation print can spike it in minutes; a banking scare can crater it just as fast (in March 2023, the 2-year had one of its largest single-day drops in decades as a bank failure suddenly made rate cuts look likely). It's a high-strung instrument — precise, but jumpy, and prone to the same crowd overreactions as any market.",
    ],
    scenario:
      "Terry Timing watched the 2-year yield surge in early 2022, correctly read it as 'the Fed is about to hike hard,' and then — instead of just understanding it — sold all his stocks to 'get ahead of the crash.' He nailed the diagnosis and botched the treatment, sitting in cash through the eventual recovery. Priya Patient read the very same 2-year signal, understood that rougher markets were likely, and simply kept dollar-cost-averaging into her index fund on schedule. The signal was real for both; only one turned a correct read into a costly decision.",
    gutCheck: {
      prompt: 'The 2-year Treasury yield most closely reflects…',
      options: [
        "The market's expectation for where the Federal Reserve will set short-term interest rates over the next couple of years",
        'The current rate of inflation, exactly',
        'The profitability of the 2,000 companies in the Russell 2000',
      ],
      answerIndex: 0,
      explanation:
        "The 2-year is essentially a live, crowd-sourced forecast of Fed policy over the next two years. It's the most Fed-sensitive point on the yield curve, which is why it moves the instant expectations about rate hikes or cuts shift.",
    },
    realScenario: {
      prompt:
        "Inflation comes in much hotter than expected, and the 2-year Treasury yield immediately jumps while the 10-year barely moves. What does that tell you?",
      options: [
        'The bond market is broken — all yields should move together',
        "The market suddenly expects the Fed to raise short-term rates more aggressively soon, which hits the Fed-sensitive 2-year far more than the long-run 10-year",
        'Inflation only affects short-term bonds and never long-term ones',
      ],
      answerIndex: 1,
      explanation:
        "A hot inflation print shifts expectations for near-term Fed policy, and the 2-year is where those expectations live. The 10-year, which reflects longer-run growth and inflation, can shrug off a single report that the 2-year reacts to violently.",
    },
    mythVsReality: {
      statement: 'The Federal Reserve sets the 2-year Treasury yield directly.',
      isMyth: true,
      explanation:
        "The Fed sets only the overnight rate. The 2-year yield is set by the market's own forecast of where that overnight rate will average over two years — which is why the 2-year often moves before the Fed does, effectively pricing in hikes or cuts in advance. The Fed influences it powerfully, but it doesn't set it.",
    },
    connects: ['tnx', 'yieldcurve', 'nasdaq'],
    aiPrompt:
      "Explain why the 2-year Treasury yield is the most Fed-sensitive point on the yield curve, how it 'front-runs' Federal Reserve policy, what happened to it during the 2022 inflation shock and the March 2023 banking scare, and how it compares to the Fed's own 'dot plot' projections.",
    depth: 3,
  },
  {
    id: 'yieldcurve',
    chapter: 2,
    order: 6,
    category: 'rates',
    tag: 'Rates',
    title: 'The Yield Curve & Inversion',
    tagline: "The shape that has predicted nearly every recession — and the one chart the whole market watches.",
    marketId: 'tnx',
    surface:
      "Line up Treasury yields from short maturities to long ones — 2-year, 10-year, 30-year — and connect the dots, and you get the 'yield curve.' Its SHAPE is one of the most closely watched signals in all of finance. Normally it slopes upward: lending money for longer earns more, because you're taking on more time and uncertainty. But every so often it flips — short-term yields rise above long-term ones — and that 'inversion' has preceded nearly every U.S. recession of the past 50 years. It's the closest thing markets have to a smoke alarm.",
    middle: [
      "Why would anyone accept a LOWER yield to lock their money up for longer? That's the strange logic an inversion reveals. It happens when the market expects the Fed to cut interest rates in the future — usually because it foresees an economic slowdown. Investors rush to lock in today's long-term yields before rates fall, driving long-term yields down, while the Fed is still holding short-term rates high to fight inflation. The result: short yields above long yields, and a market quietly betting the good times are ending.",
      "The most-watched version is the '2s10s' — the 10-year yield minus the 2-year yield. When that number goes negative, the curve is inverted, and economists start using the R-word. It's earned its fame: an inverted 2s10s has front-run essentially every modern recession, often by 12 to 18 months. That lead time is the crucial, misunderstood part — inversion is a slow-burning warning, not a next-week crash signal.",
      "For a 22-year-old, the yield curve is a beautiful example of how markets aggregate the guesses of millions of people into a single, readable shape. You don't need a economics degree to check it — you just look at whether the line slopes up (market expects growth) or bends down (market expects trouble). It won't tell you what to do, and it's been early and occasionally wrong, but knowing how to read it puts you ahead of most people watching the same headlines.",
    ],
    deep: [
      "Mechanics of why inversion signals recession: the short end (2-year) is pinned to Fed policy expectations, while the long end (10-year, 30-year) reflects long-run growth and inflation expectations. When the Fed hikes hard to cool inflation, the short end rises; if the market believes those hikes will succeed by slowing the economy — forcing future cuts — the long end stays low or falls. The inversion is literally the market saying 'current rates are so high they'll break something, and the Fed will have to reverse.'",
      "The lead-time trap ruins a lot of would-be market timers. Because inversion precedes recessions by a year or more, and stocks often keep rising during that gap, people who sell the instant the curve inverts frequently miss substantial gains and then buy back higher. The signal has been reliable about DIRECTION over long horizons and terrible about TIMING for short ones — a distinction that separates using it as context from using it as a trade.",
      "Counterintuitively, the more dangerous moment is often the 'un-inversion' — when the curve flips back to normal after being inverted. That steepening typically happens because the Fed is finally cutting rates fast, which usually means the slowdown has arrived. Historically, several recessions began not while the curve was inverted, but shortly after it un-inverted. The alarm blaring is a warning; the alarm suddenly stopping can be the fire actually starting.",
      "Edge cases and honest caveats: the curve has cried wolf (a brief 1998 inversion, and periods where central-bank bond buying distorted the long end), and there's real debate about which spread to watch (some economists prefer the 3-month/10-year over the 2s10s). No indicator is a law of nature — the curve reflects expectations, and expectations can be wrong. Treat it as the market's collective forecast, weighted by a strong track record but not a guarantee, and you'll read it the way professionals actually do.",
    ],
    scenario:
      "When the 2s10s inverted, Doomscroll Doug sold everything the same afternoon, certain the crash was imminent — then watched stocks climb for another fourteen months while he sat in cash, un-inverting his own net worth. Grace Compoundsworth saw the identical inversion, understood it as a real caution flag about the year or two ahead, and responded by doing nothing dramatic beyond making sure her emergency fund was solid. The recession did eventually come. Only one of them had spent the intervening year losing money by being right too early.",
    gutCheck: {
      prompt: 'A "normal" (healthy) yield curve slopes which way, and what does an inversion mean?',
      options: [
        'It slopes down normally; an inversion (upward slope) signals a boom',
        'It slopes up normally (longer = higher yield); an inversion (short-term yields above long-term) has historically warned of a coming recession',
        'It is always flat; any slope at all signals a crash',
      ],
      answerIndex: 1,
      explanation:
        "Normally longer bonds yield more, so the curve slopes upward. When short-term yields climb above long-term ones — an inversion — it reflects a market expecting the Fed to cut rates to fight a slowdown, and it has preceded nearly every modern U.S. recession.",
    },
    realScenario: {
      prompt:
        "The yield curve inverted eight months ago, yet stocks are still near record highs. A friend says 'the recession signal was obviously wrong.' What's the sharpest response?",
      options: [
        "He's right — if a recession hasn't hit yet, the signal failed",
        "Inversion historically precedes recessions by 12–18 months, so eight months of rising stocks is completely consistent with the signal — it warns of direction over a long horizon, not next week's timing",
        "Stocks and the yield curve have nothing to do with each other",
      ],
      answerIndex: 1,
      explanation:
        "The inversion signal's whole nature is its long, variable lead time — stocks often keep rising for a year or more after it triggers. Declaring it 'wrong' eight months in mistakes a slow-burning warning for a broken one; the classic error is acting on it as if it were a timing tool.",
    },
    mythVsReality: {
      statement: 'When the yield curve inverts, you should sell your stocks immediately — a crash is right around the corner.',
      isMyth: true,
      explanation:
        "Dangerously oversimplified. Inversion has been a reliable long-range warning, but it typically precedes recessions by a year or more, and markets often rise substantially in between. Selling the moment it inverts has historically cost people gains and led them to buy back higher. It's context about the years ahead, not a signal to act this afternoon.",
    },
    connects: ['ust2y', 'tnx', 'nasdaq'],
    aiPrompt:
      "Explain in plain English why an inverted yield curve (short-term yields above long-term) has predicted recessions, why the lead time is so long and variable, why the 'un-inversion' steepening can be the more dangerous signal, and the honest debate about how reliable the indicator really is.",
    depth: 3,
  },
  {
    id: 'ethereum',
    chapter: 2,
    order: 7,
    category: 'crypto',
    tag: 'Crypto',
    title: 'Ethereum',
    tagline: "Not just digital money — a global computer anyone can build on.",
    marketId: 'ethereum',
    riskNote:
      "Ethereum is every bit as volatile as Bitcoin — 5–10% days are routine, and it has lost 80%+ of its value more than once. On top of price risk, it carries technology and 'smart contract' risk: bugs in the code that runs on it have vaporized billions of dollars in single incidents. Only expose money you could watch fall by most of its value without it changing your life.",
    surface:
      "If Bitcoin is digital gold — a scarce thing you hold — Ethereum is more like a global, always-on computer that anyone in the world can run programs on. Those programs, called 'smart contracts,' are agreements that execute themselves automatically without a bank or middleman: lending, trading, digital ownership, and more. The cryptocurrency called Ether (ETH) is the fuel that pays for running them. So Ethereum isn't really trying to be money — it's trying to be a platform, and Ether is a bet on that platform being used.",
    middle: [
      "This platform-versus-money distinction is the whole reason to study Ethereum next to Bitcoin. They're both 'crypto,' but they answer to different stories: Bitcoin's value rests on being scarce, simple, and trusted digital gold; Ethereum's rests on whether developers actually build useful things on it and people pay to use them. Watching the two move differently — sometimes together, sometimes apart — is a live lesson in how assets in the same bucket can have completely different engines underneath.",
      "For a 22-year-old, Ethereum is worth understanding less as an investment and more as a window into where the internet might be going. The same technology powers stablecoins (digital dollars), decentralized finance ('DeFi' — banking-like services with no bank), and digital ownership of art and assets (NFTs, for better and worse). Some of this will turn out to be genuinely transformative; some is hype and outright scams. Being able to tell 'interesting technology' from 'get-rich-quick pitch' is a skill that will serve you for decades.",
      "The honest reality check: Ethereum is bleeding-edge, experimental technology carrying real money, which is a combustible combination. It's every bit as volatile as Bitcoin, and it adds a whole new category of risk — the code itself can have bugs, and smart-contract exploits have drained billions of dollars in single afternoons. The upside story is real; so is the possibility that a given project on Ethereum is a beautifully-designed way to lose everything.",
    ],
    deep: [
      "How it works, briefly: Ethereum is a shared, global ledger that doesn't just record who owns what (like Bitcoin) but also runs code. Every action — a trade, a loan, minting a token — costs a fee called 'gas,' paid in Ether, which compensates the network for the computation and prevents spam. When the network is busy, gas fees spike, which is both a feature (it prices scarce computing) and a persistent user-experience problem the ecosystem keeps trying to solve.",
      "The Merge (2022) was one of the biggest events in crypto history: Ethereum switched from Bitcoin-style 'proof of work' (energy-hungry mining) to 'proof of stake,' where holders lock up Ether as collateral to secure the network and earn rewards for doing so honestly. This slashed Ethereum's energy use by ~99% and introduced a native yield — you can 'stake' Ether to earn more Ether — which makes ETH behave a little like a productive asset, unlike Bitcoin. It also introduced new centralization debates about who controls the staking.",
      "'Ultrasound money' is the ambitious in-joke: after the Merge and a fee-burning upgrade, a portion of the gas fees paid on Ethereum are destroyed, permanently removing Ether from circulation. When network usage is high, more Ether is burned than created, making the supply shrink — the opposite of inflation. Whether this 'deflationary when busy' design actually supports the price long-term is genuinely debated, and it depends entirely on people continuing to use the network.",
      "What professionals actually watch: network activity and fee revenue (is the 'computer' actually being used, or just speculated on?), the growth of 'Layer 2' networks built on top of Ethereum to make it faster and cheaper, the amount of Ether staked, and the correlation regime with Bitcoin and tech stocks. Like Bitcoin, Ethereum has traded like a high-beta version of the Nasdaq during rate shocks — falling hardest exactly when diversification would help most, which is why allocators size it as speculation, not ballast.",
    ],
    scenario:
      "APY Andy chased a 200%-yield 'DeFi' project on Ethereum with money he needed for rent, dazzled by a number he didn't understand and a smart contract he never read — the contract had a flaw, the project drained, and the money was gone by Tuesday with no bank to call. Fiona Forward, curious about the technology, put in a small, pre-decided amount she could afford to lose entirely, used it to actually learn how staking and gas worked, and treated the whole thing as tuition with a lottery ticket attached. One of them learned about Ethereum. The other learned about Andy.",
    gutCheck: {
      prompt: 'The clearest difference between Bitcoin and Ethereum is…',
      options: [
        'Ethereum is just a faster version of Bitcoin with the same purpose',
        'Bitcoin aims to be scarce digital money/store-of-value, while Ethereum aims to be a programmable platform that runs self-executing "smart contracts"',
        'Ethereum is issued and controlled by a central bank',
      ],
      answerIndex: 1,
      explanation:
        "Bitcoin's pitch is digital gold — scarce, simple, held. Ethereum's pitch is a global computer that runs programs, with Ether as the fuel to power them. Same 'crypto' label, fundamentally different purpose — which is exactly why their prices can tell different stories.",
    },
    realScenario: {
      prompt:
        "A friend says he's earning a 'safe, guaranteed 150% yield' on his Ether through a new app he found. What's the sharpest honest read?",
      options: [
        "Great — he found free money; you should put your savings in too",
        "A yield that high is a giant red flag: it reflects enormous risk (smart-contract bugs, collapse, or outright fraud), and 'guaranteed' plus '150%' almost never coexist honestly",
        "Yields on Ethereum are always guaranteed because of the code",
      ],
      answerIndex: 1,
      explanation:
        "In crypto, sky-high 'yields' are compensation for extreme, often hidden risk — or bait. Smart-contract exploits and collapsing projects have erased billions, and nothing paying 150% is 'safe' or 'guaranteed.' The number itself is the warning.",
    },
    mythVsReality: {
      statement: 'Ethereum is basically the same thing as Bitcoin, just a bit newer.',
      isMyth: true,
      explanation:
        "They share the 'cryptocurrency' label and plenty of volatility, but their purposes differ fundamentally: Bitcoin is designed as scarce digital money, while Ethereum is a programmable platform for running applications, with its own staking yield, fee-burning mechanics, and a whole extra layer of technology risk. Treating them as interchangeable misses what each one actually is.",
    },
    connects: ['bitcoin', 'nasdaq', 'vix'],
    aiPrompt:
      "Explain what Ethereum is beyond 'a cryptocurrency' — smart contracts, gas fees, and its role as a platform — what The Merge to proof-of-stake changed, what 'staking' and 'ultrasound money' mean, and steelman both the strongest bull case and the strongest bear case for Ethereum.",
    depth: 3,
  },
]

export const LESSON_BY_ID: Record<string, Lesson> = Object.fromEntries(LESSONS.map((l) => [l.id, l]))

export function lessonsInChapter(chapter: number): Lesson[] {
  return LESSONS.filter((l) => l.chapter === chapter).sort((a, b) => a.order - b.order)
}

// "What should we build next?" poll options shown on the Academy home page.
export const POLL_OPTIONS: { id: string; label: string }[] = [
  { id: 'personal-finance', label: 'Personal Finance 101' },
  { id: 'fed-rates', label: 'The Federal Reserve & Interest Rates' },
  { id: 'biases', label: 'Cognitive Biases & Decision Making' },
  { id: 'economy', label: 'How the Economy Actually Works' },
  { id: 'entrepreneurship', label: 'Entrepreneurship Fundamentals' },
  { id: 'ai-tech', label: 'AI & Technology' },
]

export const CATEGORY_META: Record<LessonCategory, { label: string; color: string }> = {
  index: { label: 'Indices', color: '#38bdf8' },
  volatility: { label: 'Volatility', color: '#fbbf24' },
  crypto: { label: 'Crypto', color: '#a78bfa' },
  'chart-literacy': { label: 'Chart Literacy', color: '#2dd4a7' },
  foundations: { label: 'Foundations', color: '#f472b6' },
  commodity: { label: 'Commodities', color: '#fb923c' },
  currency: { label: 'Currencies', color: '#34d399' },
  rates: { label: 'Bonds & Rates', color: '#22d3ee' },
}
