// The Academy curriculum. Chapter 1: Reading the Market — nine lessons, each
// with three layers of depth (surface / middle / deep), a character scenario,
// one question per learning mode, concept connections, and an AI prompt.
//
// Writing rules (see project voice guidelines): stories first, plain English
// always, honest about uncertainty, never financial advice, never preachy.

export type LessonCategory = 'index' | 'volatility' | 'crypto' | 'chart-literacy' | 'foundations' | 'commodity' | 'rates'

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
  rates: { label: 'Bonds & Rates', color: '#22d3ee' },
}
