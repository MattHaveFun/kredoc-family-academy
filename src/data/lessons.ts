// The Academy curriculum. Chapter 1: Reading the Market — nine lessons, each
// with three layers of depth (surface / middle / deep), a character scenario,
// one question per learning mode, concept connections, and an AI prompt.
//
// Writing rules (see project voice guidelines): stories first, plain English
// always, honest about uncertainty, never financial advice, never preachy.

export type LessonCategory =
  | 'index'
  | 'volatility'
  | 'crypto'
  | 'chart-literacy'
  | 'foundations'
  | 'commodity'
  | 'currency'
  | 'rates'
  | 'stock-picking'
  | 'execution'
  | 'company'

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
  {
    number: 3,
    title: 'Picking a Stock',
    subtitle:
      'How to judge a single company instead of a whole market — what to look for, what to run from, and how to actually place the order.',
  },
  {
    number: 4,
    title: 'Six Giants, Six Business Models',
    subtitle:
      'The largest companies in the S&P 500, each run through the method from Chapter 3 — because a checklist you have never used is just reading.',
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
  {
    id: 'world-markets',
    chapter: 2,
    order: 8,
    category: 'index',
    tag: 'World markets',
    title: 'World Markets',
    tagline: "The other 24 hours of trading — Tokyo, London, Frankfurt, Hong Kong, Shanghai.",
    marketId: 'nikkei',
    surface:
      "The U.S. is the biggest stock market on Earth, but it's only about 60% of the world's total — the rest trades in Tokyo, London, Frankfurt, Hong Kong, Shanghai, and beyond. Indexes like Japan's Nikkei 225, the UK's FTSE 100, Germany's DAX, Hong Kong's Hang Seng, and the Shanghai Composite are those countries' versions of the S&P 500. Because they open while America sleeps, they're often the first markets to react to overnight news — a rolling, around-the-clock read on how the whole world feels about risk.",
    middle: [
      "The instinct to own only your home country's stocks has a name: 'home bias,' and almost every investor everywhere has it. It feels safer to own the companies you know, but it quietly concentrates your bet on one economy, one currency, and one government's decisions. Looking at world markets is the antidote — a reminder that prosperity and crisis aren't evenly distributed, and that the U.S. winning decade after decade is a historical fact, not a law of nature.",
      "Here's the wrinkle that trips people up: when you own a foreign market, you're making TWO bets at once — on the stocks AND on the currency. A Japanese index can rise 10% in yen, but if the yen falls 10% against the dollar over the same stretch, an American owner ends up roughly flat. This is why the U.S. Dollar Index next door matters so much to global investing: currency moves can quietly give or take a huge chunk of your foreign returns.",
      "Why care at 22? Because the companies and trends shaping your life are increasingly global, and because international diversification is one of the few genuinely free lunches in investing — spreading your bet across economies that don't all boom and bust in sync. The catch (see the deep dive) is that 'don't all move in sync' has been getting less true over time.",
    ],
    deep: [
      "Each of these markets has its own personality. The Nikkei is a wealthy, developed market that spent 30+ years climbing back from a 1989 bubble peak — a living monument to how long 'the long run' can actually be. The FTSE 100 is stuffed with multinational banks, energy, and miners, so it's more a bet on the global economy than on Britain. The DAX tracks Europe's industrial export engine. The Hang Seng and Shanghai Composite are windows onto China — the Hang Seng more open to foreigners, the Shanghai market dominated by local retail investors and steered heavily by government policy, which makes it march to its own, often baffling, beat.",
      "The diversification pitch has weakened in a specific, important way: in genuine global crises, correlations 'go to one.' When real panic hits — 2008, March 2020 — nearly every market on Earth falls together, because the same frightened global investors are selling everything at once. International diversification smooths the ordinary years and fails you in the worst weeks. That's not a reason to skip it; it's a reason to understand what it does and doesn't buy you.",
      "Developed versus emerging is a distinction worth knowing. Japan, the UK, and Germany are 'developed' markets — mature, heavily regulated, relatively stable. China sits in the 'emerging' bucket: faster-growing on paper, but with more political risk, less predictable rules, and sharper swings. Emerging markets have tempted investors with growth stories for decades and delivered a genuinely bumpy, often disappointing ride — a clean lesson that 'the economy is growing fast' and 'the stocks will make you money' are two very different claims.",
      "What professionals actually watch: the U.S. dollar (a strong dollar pressures foreign returns and emerging markets that borrowed in dollars), relative valuations (foreign markets have often been 'cheaper' than the U.S. for years — sometimes for good reasons), and the overnight action in Asia and Europe as a tell for how U.S. markets might open. The Nikkei and DAX closing sharply lower is a headline U.S. traders read with their morning coffee.",
    ],
    scenario:
      "Homebound Hank kept 100% of his money in U.S. stocks because 'America always wins,' never once glancing at the rest of the world — which worked beautifully until it didn't, during a decade where foreign markets quietly outran his. Wanda Worldwise held a slice of international index funds she mostly ignored, understanding it wouldn't save her in a global crash but would keep her from betting everything on a single country's next ten years. Neither could predict which region would lead. That was exactly why Wanda refused to choose just one.",
    gutCheck: {
      prompt: 'When an American investor buys a foreign stock index, what are they actually betting on?',
      options: [
        'Only the performance of those foreign companies',
        'Both the foreign companies AND the exchange rate between that currency and the dollar',
        'Only the exchange rate; the stocks don\'t matter',
      ],
      answerIndex: 1,
      explanation:
        "It's a two-part bet. Your return in dollars depends on how the foreign stocks do in their local currency AND on how that currency moves against the dollar. A great year for the stocks can be erased by a falling local currency — which is why the dollar's strength matters so much to global investing.",
    },
    realScenario: {
      prompt:
        'A severe global financial crisis hits. You hold U.S., European, and Asian index funds for diversification. What most likely happens to them?',
      options: [
        'The foreign funds rise while U.S. stocks fall, protecting you',
        'Nearly all of them fall together, because in true panics global markets become highly correlated as investors sell everything at once',
        'Only the U.S. market is affected; foreign markets are insulated',
      ],
      answerIndex: 1,
      explanation:
        "This is diversification's most misunderstood limit: in genuine crises, correlations 'go to one' and markets worldwide drop together. International diversification smooths ordinary years and helps over the long run — but it does not rescue you in the worst weeks, when everything sells off at once.",
    },
    mythVsReality: {
      statement: 'Since the U.S. market has beaten foreign markets for years, there\'s no reason to own international stocks.',
      isMyth: true,
      explanation:
        "Tempting, and it looks obvious in the rear-view mirror — but leadership rotates. There have been long stretches (the 2000s, for one) when foreign markets beat the U.S. handily, and betting everything on one country's continued dominance is a concentration risk, not a strategy. Past outperformance is a description of history, never a guarantee of the next decade.",
    },
    connects: ['sp500', 'dxy', 'indices-vs-stocks'],
    aiPrompt:
      "Explain 'home bias' in investing and the case for international diversification, how currency moves affect an American's returns on foreign stocks, why global market correlations rise during crises, and the difference between developed and emerging markets using Japan, Germany, and China as examples.",
    depth: 2,
  },

  // Chapter 3 — Picking a Stock
  {
    id: 'stock-vs-index',
    chapter: 3,
    order: 1,
    category: 'stock-picking',
    tag: 'Foundations',
    title: 'Should You Pick Stocks At All?',
    tagline: 'The honest answer before the fun part.',
    marketId: 'sp500',
    riskNote:
      "Everything in this chapter is about how to think, never what to buy. Individual stocks can and do go to zero — companies that looked permanent have vanished inside a decade. Money you need for rent, tuition, or a car in the next few years does not belong in any single company, no matter how good the research.",
    surface:
      "Here is the fact that every honest book on stock picking opens with and most exciting videos leave out: over long stretches, the large majority of professional fund managers — people with research teams, terminals, and direct access to management — fail to beat a plain S&P 500 index fund after fees. If that is true of the professionals, the case for you picking stocks cannot rest on being better at it than they are. It has to rest on something else.",
    middle: [
      "So why learn this at all? Three genuinely good reasons. First, understanding how a business is valued makes you a far better reader of the world — of your employer, of the news, of the next company that tries to hire you with equity. Second, a small, deliberate slice of individual stocks is one of the best teachers money can buy: nothing focuses attention like owning something. Third, and least glamorous: you will be offered stock at some point in your life, probably by a job, and you should know how to think about it.",
      "The structure most people land on after the excitement wears off is boring on purpose: the large majority in broad index funds, doing the actual compounding, plus a small deliberate slice for individual companies you have genuinely researched. The slice is sized so that being spectacularly wrong is educational rather than devastating. That is not timidity — it is the arrangement that lets you keep playing long enough to get good.",
      "Why this matters more at 22 than at 52: your biggest financial asset right now is not money, it is time. Decades of compounding do the heavy lifting, and the single most damaging thing you can do is interrupt them — by panic-selling in a crash, or by taking a loss so large it makes you quit. Almost every rule in this chapter exists to keep you in the game, not to find you a winner.",
    ],
    deep: [
      "Why beating the index is so hard, mechanically: the index is not an average opponent, it is the aggregate of every dollar invested, weighted toward the winners automatically. When a company grows, its weight rises without anyone deciding anything. You are competing against a strategy that never panics, never charges fees, never takes a vacation, and quietly lets its best positions get bigger.",
      "There is also a brutal asymmetry in individual stocks that almost nobody internalizes. Research on long-run U.S. stock returns has repeatedly found that a small minority of companies generate the entire market's gain above Treasury bills, and the median stock underperforms. The index works precisely because it guarantees you own the handful of monsters. A concentrated portfolio of ten stocks has excellent odds of missing every one of them.",
      "The professional counterargument worth knowing: fund managers face constraints you do not. They are judged quarterly, so they cannot hold through a three-year drawdown that would eventually be right. They cannot buy small companies without moving the price. They must stay invested. An individual with genuine patience and no career risk has real structural advantages — the catch being that 'genuine patience' is much rarer than people believe about themselves.",
      "What the honest professionals actually say about this: your edge, if you have one, is behavioral and informational at the edges. You might understand an industry from working in it. You might be willing to hold something for ten years. What you almost certainly do not have is better information about a mega-cap company than the thousands of analysts covering it — which is why the six companies in this chapter are teaching material, not opportunities.",
    ],
    scenario:
      "Indie Indexer put 90% of her savings into a total-market fund and 10% into four companies she could explain to her grandmother, then wrote down why she owned each one. Stock-Picking Steve went all-in on seven convictions, three of which were the same bet wearing different names. Five years later Indie had one spectacular winner, two duds, a boring fund quietly compounding underneath it all, and a notebook that had taught her more than any course. Steve had a great story about 2024 and a much smaller account.",
    gutCheck: {
      prompt: 'Over long periods, most professional fund managers…',
      options: [
        'Beat the S&P 500, which is why people pay them',
        'Fail to beat a plain S&P 500 index fund after fees',
        'Match the index almost exactly, year after year',
      ],
      answerIndex: 1,
      explanation:
        "The large majority underperform over long stretches once fees are counted. That is not because they are foolish — it is because the index is a genuinely formidable opponent that automatically lets winners grow and charges almost nothing. It is the single most important fact to know before you start picking.",
    },
    realScenario: {
      prompt:
        'You have $6,000 saved and want to try picking individual stocks. Which structure best fits what this lesson argues?',
      options: [
        'Put all $6,000 into your three best ideas so the winners actually matter',
        'Keep most of it in a broad index fund and use a small deliberate slice for individual companies',
        'Wait until you have $50,000, since small amounts are not worth investing',
      ],
      answerIndex: 1,
      explanation:
        "The slice exists so that being wrong teaches you something instead of setting you back years. And waiting is its own mistake — at 22 the compounding clock is the most valuable thing you own, and small amounts started early routinely beat large amounts started late.",
    },
    mythVsReality: {
      statement: 'Index funds are for people who are not smart enough to pick stocks.',
      isMyth: true,
      explanation:
        "It is closer to the reverse. Choosing to own everything is a conclusion people usually reach by understanding the math, not by avoiding it — and some of the sharpest investors alive recommend exactly that for most money. The genuinely humbling part is that this is a rare case where the easy answer and the correct answer are the same one.",
    },
    connects: ['sp500', 'indices-vs-stocks', 'what-you-own', 'when-to-sell'],
    aiPrompt:
      "Summarize the research on how many actively managed funds beat the S&P 500 over 10, 15, and 20 years, and explain the finding that a small minority of individual stocks account for the entire market's return above Treasury bills. Then give me the strongest honest case FOR an individual picking some stocks anyway.",
    depth: 3,
  },
  {
    id: 'what-you-own',
    chapter: 3,
    order: 2,
    category: 'stock-picking',
    tag: 'Foundations',
    title: 'What a Share Actually Is',
    tagline: 'Not a ticker. Not a bet. A fraction of a company.',
    marketId: 'aapl',
    surface:
      "A share of stock is a real, legally enforceable slice of ownership in a business. Own one share of a company with two billion shares outstanding and you own one two-billionth of everything it has: its buildings, its patents, its cash, its brand, and its claim on every dollar of profit it will ever make. The flashing price is just the number someone else is willing to pay you for your slice right now. It is not what the slice is.",
    middle: [
      "That distinction is the whole game. If you think you own a ticker, a 20% drop is a catastrophe and you sell. If you think you own a fraction of a business, a 20% drop is a question: did the business get 20% worse, or did the mood change? Those have completely different answers, and only one of them is a reason to do anything.",
      "Ownership comes with two ways of getting paid. A company can hand profits directly to you as a dividend, or it can keep the money and reinvest it — building factories, hiring engineers, buying back its own shares — in the hope that your slice becomes worth more. Young, fast-growing companies almost always do the second. Mature ones often do both. Neither is virtuous; what matters is whether the money reinvested earns a good return.",
      "Why care at 22? Because this reframe is what makes the next forty years survivable. Markets will fall hard several times in your investing life — that is not pessimism, it is arithmetic from history. People who believe they own businesses tend to hold through it. People who believe they own tickers tend to sell at the bottom, which is the single most expensive habit in personal finance.",
    ],
    deep: [
      "Where your claim sits in line: if a company is liquidated, shareholders are paid last — after lenders, bondholders, suppliers, and tax authorities. That is precisely why stocks return more than bonds over time. You are being compensated for standing at the back of the queue. It is also why heavy debt is so dangerous to a shareholder: creditors get paid first, and in a bad year 'first' can mean 'only.'",
      "Share count is the detail beginners overlook and professionals check first. Your ownership is a fraction, and the denominator moves. If a company issues new shares every year to pay employees, your slice shrinks even as the business grows — this is dilution, and it is a real cost that never appears as an expense you can see. Buybacks reverse it, retiring shares so each remaining one owns more. Always read revenue growth next to share-count growth.",
      "Share classes are worth knowing before you are surprised by them. Many companies have multiple classes with different voting power — founders often keep the votes while the public gets the economics. Alphabet's GOOGL and GOOG are the famous example: nearly the same economic claim, different voting rights. It rarely affects returns directly; it does mean 'shareholders can replace management' is sometimes untrue.",
      "What professionals actually watch: earnings per share and free cash flow per share, not total profit. Total profit rising while the share count rises faster means the business grew and your slice did not. Per-share numbers are the only ones that describe what happened to you.",
    ],
    scenario:
      "Priya Partowner read one annual report per company she owned and could explain each business in three sentences, so when the market fell 30% she checked whether her four companies were still selling more than last year — they were — and did nothing. Ticker Tommy owned the same companies as strings of letters he had seen trending, and could not say what two of them sold. He sold everything in the third week of the decline, at prices that turned out to be the lowest of the whole episode. Same holdings, same crash, opposite outcomes, and the only difference was what each of them believed they owned.",
    gutCheck: {
      prompt: 'Owning one share of a company means you own…',
      options: [
        'A promise from the company to pay you back with interest',
        'A real fractional slice of the business and its future profits',
        'A contract that tracks the stock price without any ownership',
      ],
      answerIndex: 1,
      explanation:
        "That first option describes a bond — you are a lender, paid back with interest, and paid before shareholders. A share makes you an owner: last in line if things collapse, but entitled to the upside without limit if things go well.",
    },
    realScenario: {
      prompt:
        "A company's total profit grew 8% this year, but its earnings per share only grew 1%. What most likely happened?",
      options: [
        'The company paid a large dividend, which reduced earnings per share',
        'The share count rose substantially, so the bigger profit was split across more slices',
        'The stock price fell, which lowered earnings per share',
      ],
      answerIndex: 1,
      explanation:
        "Dilution. The business genuinely improved and your slice of it barely did, because the denominator grew almost as fast as the numerator. Dividends do not reduce earnings per share, and the stock price has no effect on it at all — which is exactly why per-share figures are the ones worth tracking.",
    },
    mythVsReality: {
      statement: 'When a stock price drops 20%, you have lost 20% of your money.',
      isMyth: true,
      explanation:
        "You have lost 20% of what the market would pay you today — which becomes an actual loss only if you sell, or if the business really did deteriorate. If the company is selling more, earning more, and holding the same competitive position, what changed was the price tag, not the asset. Sometimes the business truly did get worse, and telling those two situations apart is most of the skill in this chapter.",
    },
    connects: ['stock-vs-index', 'fundamentals', 'indices-vs-stocks', 'case-googl'],
    aiPrompt:
      "Explain what a share of stock legally entitles me to, where shareholders sit in line versus bondholders if a company fails, and how share dilution and buybacks change my ownership. Use a concrete example with real numbers where total profit grows but earnings per share does not.",
    depth: 2,
  },
  {
    id: 'fundamentals',
    chapter: 3,
    order: 3,
    category: 'stock-picking',
    tag: 'Fundamentals',
    title: 'The Numbers That Actually Matter',
    tagline: 'Five checks that separate a business from a story.',
    marketId: 'msft',
    surface:
      "A company publishes hundreds of numbers every quarter, and you can safely ignore almost all of them. Five questions do most of the work: is revenue growing, does it keep a real slice of each dollar, does it generate actual cash, does it earn well on the money it invests, and can it survive a bad year? Everything else is detail hanging off those five.",
    middle: [
      "Start with revenue, the top line — the total money customers paid. Growing revenue means more people want what this company sells, and that is the only durable engine there is. A company can cut costs to lift profit for a while, but nobody has ever cut their way to greatness for long. Always compare to the same quarter a year ago, never to last quarter, because most businesses have seasons and retailers make a fortune every December.",
      "Then margins, which tell you how much of that revenue survives. Gross margin — revenue minus what it costs to make the thing — measures how valuable the product itself is. Operating margin, after salaries, marketing, and research, measures whether the company is disciplined about everything else. Rising or steady beats high-and-falling, because a falling margin usually means competition arrived.",
      "The one most beginners skip is cash flow, and it is the one professionals check first. Profit is assembled by accountants following rules with genuine judgment in them; cash is a fact you can count. Free cash flow — cash from operations minus what the company spends maintaining and building itself — is the money actually available to pay dividends, buy back shares, or reinvest. A company reporting cheerful profits while burning cash is telling you two different stories, and only one of them can be true.",
    ],
    deep: [
      "Return on invested capital is the quiet king of these metrics. It asks: when this company puts a dollar to work, how much does it earn back every year? A business earning 25% on its capital compounds ferociously; one earning 6% is running hard to stand still. Consistently high ROIC is the numerical fingerprint of a moat, because in a competitive market high returns attract rivals until they fall. If they have not fallen in a decade, something is protecting them, and finding out what is your job.",
      "Debt is not a villain, it is a magnifier. Cheap borrowing to build something that earns more than the interest is good business. The danger is fragility: debt payments are obligations, not preferences, so a leveraged company facing a bad year has no room to absorb it. Check net debt against EBITDA, or simply interest expense against operating income — if interest eats a large share of operating profit, the company works for its lenders first and you second.",
      "Learn the difference between reported and 'adjusted' figures. Companies are allowed to present their own tidied-up numbers excluding items they consider one-off, and sometimes that genuinely clarifies things. But when adjusted profit is always large, actual profit is always negative, and the difference is always stock compensation, the exceptions have become the business model. Compare the press-release headline to the audited filing, and treat a persistent gap as information.",
      "What professionals actually watch beyond the five: the direction of gross margin (competition's earliest tell), whether receivables are growing faster than revenue (are customers actually paying?), inventory build-up (is product not selling?), and the wording changes in the risk-factors section year over year. Companies rewrite that section when something has genuinely changed, and almost nobody reads it.",
    ],
    scenario:
      "Cash-Flow Cassie ignored two exciting companies because both burned cash every year while reporting adjusted profits, and she could not make the two stories agree. Adjusted-Adam bought both, reasoning that the losses were temporary and the addressable market enormous. One of them eventually justified the story and made him a lot of money. The other diluted its shareholders for six straight years and never turned the corner. Adam's problem was not that he was wrong — he was half right. His problem was that he had no way of telling which half in advance, and Cassie's five questions were exactly that way.",
    gutCheck: {
      prompt: 'Why do professionals often trust free cash flow more than reported profit?',
      options: [
        'Free cash flow is always the larger number, so it is more encouraging',
        'Profit involves accounting judgment, while cash movements are harder to shape',
        'Free cash flow includes money raised from investors, giving a fuller picture',
      ],
      answerIndex: 1,
      explanation:
        "Profit is an estimate produced under rules with real discretion inside them; cash either moved or it did not. Free cash flow is frequently the smaller and less flattering number, and it excludes money raised from investors on purpose — that is financing, not the business earning anything.",
    },
    realScenario: {
      prompt:
        'A company grew revenue 30% this year, but its gross margin fell from 45% to 34%. What is the most likely explanation worth investigating?',
      options: [
        'Growth is always good news — the margin change is noise',
        'It may be buying growth by cutting prices, or facing new competition',
        'Gross margin always falls as companies get larger',
      ],
      answerIndex: 1,
      explanation:
        "Revenue bought with discounts is much lower quality than revenue won on merit, and a sharp gross-margin decline is the earliest signal that competition arrived or pricing power slipped. Scale usually improves gross margin rather than hurting it, which makes this pattern worth a real look rather than a shrug.",
    },
    mythVsReality: {
      statement: 'A company that is not profitable yet is automatically a bad investment.',
      isMyth: true,
      explanation:
        "Too blunt. Amazon lost money for years while deliberately reinvesting every dollar into warehouses that became an unassailable advantage — that was a choice, not a failure. The real question is whether the losses are buying something durable and whether the path to cash generation is visible and improving. Plenty of unprofitable companies are simply unprofitable, which is why the question is 'why' rather than 'whether.'",
    },
    connects: ['valuation', 'red-flags', 'what-you-own', 'moat'],
    aiPrompt:
      "Teach me to read a company's income statement, balance sheet, and cash flow statement using a real large company as the example. Show me where to find revenue growth, gross and operating margin, free cash flow, return on invested capital, and debt relative to earnings — and explain what a healthy versus concerning value looks like for each in that company's industry.",
    depth: 3,
  },
  {
    id: 'valuation',
    chapter: 3,
    order: 4,
    category: 'stock-picking',
    tag: 'Valuation',
    title: 'What the Price Already Assumes',
    tagline: 'A great company at a terrible price is a terrible investment.',
    marketId: 'nvda',
    surface:
      "Every stock price is a compressed prediction. When a company trades at 40 times its annual earnings, the market is not saying 'this is a good business' — it is saying 'this business will grow enough to justify paying forty years of current profit for it.' Your job is not to decide whether the company is good. It is to decide whether the prediction baked into the price is reasonable.",
    middle: [
      "The price-to-earnings ratio is the standard shorthand: the share price divided by earnings per share. A P/E of 20 means you are paying $20 for each $1 of current annual profit. Low is not automatically cheap and high is not automatically expensive — a company growing 30% a year deserves a higher multiple than one shrinking, and paying 12 times earnings for a business in permanent decline is how value investors get hurt. The multiple is a question, not an answer.",
      "This is where the most painful lesson in investing lives: you can be completely right about a company and still lose money, because you paid a price that already assumed everything going right. Buy a wonderful business at a multiple that requires flawless execution for a decade, and merely good execution becomes a loss. That is not bad luck — it is what you agreed to at purchase.",
      "The reverse trap is just as real. 'Cheap' stocks are often cheap because the business is genuinely deteriorating, and the low multiple is the market being correct rather than wrong. Every era has a cluster of famous value traps: newspapers, mall retailers, video rental. The multiple was low the whole way down.",
    ],
    deep: [
      "Better tools than trailing P/E, in rough order of usefulness. Forward P/E uses expected earnings, which is more relevant and less reliable, since forecasts are wrong in predictable directions. Free-cash-flow yield — free cash flow divided by market value — sidesteps accounting judgment and reads like an interest rate on your ownership. Enterprise value to EBITDA includes debt in the price, which matters enormously for leveraged companies where equity alone hides the real cost. Each one fails somewhere; use two or three and pay attention when they disagree.",
      "The technique that changes how you think: reverse-engineer the assumptions. Rather than asking 'is this cheap,' ask 'what growth rate, sustained for how long, at what margin, would make today's price a fair deal?' Then ask whether that has ever happened to a company this size. Sometimes the answer is obviously yes. Sometimes the price requires a company to become larger than its entire industry, and that is far more useful to know than a ratio.",
      "Interest rates set the gravity for every one of these numbers. A future dollar is worth less today when safe bonds yield 5% than when they yield 1% — so the same company deserves a lower multiple in a high-rate world, with no change in the business at all. This is the discounting math behind the Nasdaq lesson, and it is why 2022 crushed high-multiple growth companies while their revenue kept rising.",
      "What professionals actually watch: a company's multiple against its own history (has the market's expectation shifted?), against its closest peers (is this specific to the company or the whole industry?), and how much of today's price depends on profits more than ten years out. The last one is a rough measure of how much faith is priced in — and faith is the part that reprices fastest when sentiment turns.",
    ],
    scenario:
      "Multiple Mike bought a genuinely dominant company at 70 times earnings in a euphoric year, and he was right about everything: revenue tripled over the following five years, exactly as he had predicted. The stock still went nowhere, because the multiple compressed from 70 to 25 while the business grew into its old price. Patient Pat bought the same company two years later at 22 times earnings, held it for the same five years, and made a fortune on a business he understood no better than Mike did. Both were right about the company. Only one of them was right about the price.",
    gutCheck: {
      prompt: 'A stock trading at a high price-to-earnings ratio tells you…',
      options: [
        'The stock is overpriced and should be avoided',
        'The market expects substantial future growth, and the price depends on getting it',
        'The company is more profitable than a low-P/E company',
      ],
      answerIndex: 1,
      explanation:
        "A high multiple is an embedded expectation, not a verdict. Fast growers frequently deserve high multiples and go on to justify them. The risk is not that the number is high — it is that the growth required to justify it must actually arrive, and merely good results become a disappointment.",
    },
    realScenario: {
      prompt:
        'You buy a company at 60 times earnings. Over five years its profits double, exactly as you expected — but the stock is flat. What happened?',
      options: [
        'The company must have issued a lot of new shares',
        'The multiple compressed: the market repriced it to roughly 30 times the now-larger earnings',
        'Dividends absorbed all the gains',
      ],
      answerIndex: 1,
      explanation:
        "Double the earnings, halve the multiple, and the price is unchanged. This is the most common way people lose money on companies they correctly identified as excellent, and it is why valuation is a separate question from quality rather than an extension of it.",
    },
    mythVsReality: {
      statement: 'If you plan to hold for twenty years, the price you pay does not really matter.',
      isMyth: true,
      explanation:
        "Time forgives a lot, and it does not forgive everything. Buy at a multiple that already assumes two decades of perfection and you have pre-spent the returns those decades were going to give you — investors who bought great companies at the 2000 peak waited more than ten years to break even on some of them. A long horizon makes the price matter less. It does not make it not matter.",
    },
    connects: ['fundamentals', 'moat', 'nasdaq', 'tnx'],
    aiPrompt:
      "Explain P/E, forward P/E, free-cash-flow yield, and EV/EBITDA — what each one is good for and where each one misleads. Then walk me through reverse-engineering a valuation: for a large company today, what growth rate and margin, sustained how long, would justify its current price? Tell me whether companies that size have historically achieved that.",
    depth: 3,
  },
  {
    id: 'moat',
    chapter: 3,
    order: 5,
    category: 'stock-picking',
    tag: 'Competitive advantage',
    title: 'The Moat',
    tagline: 'Why can nobody just copy this?',
    marketId: 'aapl',
    surface:
      "In a normal market, high profits attract competitors until those profits are gone. That is not a flaw, it is how capitalism is supposed to work. So a company earning excellent returns for a decade or more is an anomaly demanding an explanation — something must be stopping rivals from copying it. That something is the moat, and if you cannot name it in one sentence, you have not found it. You have found a good few years.",
    middle: [
      "There are only a handful of real moats, and it is worth being able to list them. Switching costs: leaving is expensive, slow, or painful, so customers stay even when a rival is cheaper. Network effects: the product gets better as more people use it, so the leader's lead compounds. Brand: people will pay more for the same thing with your name on it. Scale: you are big enough to produce more cheaply than any new entrant could. Regulation and patents: the law itself restricts competitors. Everything else is usually one of these five in costume.",
      "What is not a moat, no matter how it feels: being first, having the best product right now, having a beloved founder, or growing fast. Those are advantages, and they are all temporary. Better products get out-engineered, first movers get out-executed constantly, and growth attracts precisely the competition that ends it. A moat is structural — it makes copying you unattractive even to a competitor who understands exactly what you do.",
      "Why care at 22? Because this is the single most transferable idea in this whole Academy. It explains why your employer can or cannot raise prices, why some industries pay better than others, why one coffee shop survives on a street where four have failed, and what makes a career defensible. Learning to spot moats will change how you read the world long after you have forgotten what a P/E ratio is.",
    ],
    deep: [
      "Moats are verbs, not nouns — they widen and they erode, and the erosion is usually quiet. Kodak had a genuine moat in film chemistry, and digital photography did not attack it, it made it irrelevant. Newspapers had unassailable local advertising monopolies that the internet dissolved from outside the industry entirely. The dangerous question is never 'can a competitor beat them at this?' It is 'could this stop mattering?'",
      "The moat shows up in the numbers, which is how you check the story instead of just believing it. Sustained high return on invested capital is the fingerprint. So is pricing power: a company that raises prices without losing customers has one, and a company that must discount to hold share does not, whatever its investor deck says. Stable or rising gross margins across a full economic cycle are the cleanest evidence available to an outsider.",
      "Beware moats that are really just one customer, one platform, or one regulation. A business whose advantage is a favorable contract with a giant partner has an advantage that expires. Apps built entirely on someone else's platform can be squeezed by that platform at will. And an advantage granted by regulation can be repealed by regulation — which is the risk sitting under several of the largest companies in the S&P 500 right now.",
      "What professionals actually watch: market share direction over five years, not the level; gross margin stability through a downturn; customer retention or churn where it is disclosed; and how the risk-factors section of the annual report changes wording year over year. Companies quietly rewrite that section when a moat starts leaking, long before it shows up in earnings.",
    ],
    scenario:
      "Moat Maya bought a boring industrial company whose parts were embedded in machinery that ran for thirty years, meaning customers physically could not switch without replacing the machine. Momentum Marcus bought a beautiful consumer app growing 200% a year with no barrier to entry at all. Marcus's stock quadrupled first, and he was insufferable about it for eleven months. Then two well-funded competitors launched nearly identical apps, growth stalled, and the multiple collapsed. Maya's company grew 7% a year, forever, and outperformed his over the decade — which is the least exciting sentence in this Academy and one of the most important.",
    gutCheck: {
      prompt: 'Which of these is a genuine economic moat?',
      options: [
        'Being the first company to launch a new kind of product',
        'Customers face real cost or disruption to switch to a competitor',
        'Having the fastest revenue growth in the industry',
      ],
      answerIndex: 1,
      explanation:
        "Switching costs are structural — they make leaving genuinely painful, so customers stay even when a rival looks better on paper. Being first and growing fast are advantages that competition erodes, and rapid growth is often what attracts the competition in the first place.",
    },
    realScenario: {
      prompt:
        "A software company's gross margin has slipped from 78% to 64% over three years while revenue kept growing. What does this most likely suggest about its moat?",
      options: [
        'Nothing — margin changes are normal noise in software',
        'It may be discounting to keep customers, which suggests the moat is eroding',
        'The moat is strengthening, since revenue is still growing',
      ],
      answerIndex: 1,
      explanation:
        "In software, where the cost of serving one more customer is close to nothing, a 14-point gross margin decline is a loud signal — usually price cuts to hold share against competitors. Revenue can keep rising for years while the pricing power that made the business valuable quietly drains away.",
    },
    mythVsReality: {
      statement: 'A company with the best product in its category has a moat.',
      isMyth: true,
      explanation:
        "Product quality is a lead, not a wall — and leads get closed. The graveyard of best-in-class products beaten by better-defended competitors is enormous: superior search engines, better phones, more elegant social networks. A moat is what makes it unattractive for a well-funded rival to compete at all, which is a different thing from being better today.",
    },
    connects: ['fundamentals', 'valuation', 'red-flags', 'case-aapl'],
    aiPrompt:
      "Explain the main types of economic moat — switching costs, network effects, brand, scale, and regulatory protection — with a real company as an example of each. Then give me two examples of companies whose moats eroded, what specifically caused it, and what early warning signs an outside investor could have noticed in the financials first.",
    depth: 3,
  },
  {
    id: 'red-flags',
    chapter: 3,
    order: 6,
    category: 'stock-picking',
    tag: 'Warning signs',
    title: 'Signs of a Bad Stock',
    tagline: 'Most losses are avoidable, and they announce themselves.',
    surface:
      "Spectacular investment losses are rarely mysterious in hindsight. They tend to share a small set of warning signs that were visible beforehand to anyone who looked: a story with no numbers behind it, a share count that climbs every year, debt growing faster than earnings, revenue concentrated in one customer, accounting nobody can follow, and an idea that arrived from someone who profits when you buy. None of these is fatal alone. Three together is a pattern.",
    middle: [
      "The most expensive red flag is not on any financial statement: where the idea came from. If you first heard about a company from a video, a group chat, or a post with rocket emojis, the person who told you already owns it and gains when you buy. That is not information about the company — it is information about your information, and it is the single most common reason young investors lose money. The company might even be good. You still do not know anything about it yet.",
      "Then dilution, the quiet one. A company that funds itself by issuing new shares every year is paying its bills with pieces of your ownership. It is sometimes genuinely necessary and always a real cost, and it never appears as a line item called 'your slice got smaller.' Check shares outstanding over five years. A steady upward staircase while revenue grows more slowly means the business is expanding and your claim on it is not.",
      "And the one that turns slow problems into sudden ones: debt growing faster than earnings. Borrowing to build something that earns more than the interest is good business. Borrowing to cover operations is a countdown. The cruel part is that rising interest rates can trigger the crisis without the business changing at all — the same company, the same customers, suddenly unable to refinance.",
    ],
    deep: [
      "Customer and product concentration deserves more weight than it gets. If one buyer is a quarter of revenue, that buyer effectively sets your prices and can end your growth story in a single internal meeting. Companies disclose this — the risk-factors section is where they legally confess what worries them, and it is the most under-read document in finance. Concentration is not disqualifying; it is a risk you should be paid for taking, and usually you are not.",
      "Accounting fog is subtler than fraud and far more common. Watch for revenue recognized long before cash arrives (receivables growing much faster than revenue), inventory building while sales flatten, frequent changes to how segments are reported, auditor turnover, and adjusted figures that are permanently and enormously better than audited ones. Any one has innocent explanations. Several at once is a company making itself hard to check, and companies that are hard to check are hard to value.",
      "Two governance patterns worth noticing. First, incentives: read what management actually gets paid for. Executives rewarded for revenue growth will deliver revenue growth, profitably or not. Second, candor: read last year's shareholder letter against what happened. Leaders who name their own mistakes plainly are rarer and more reliable than leaders who explain every miss with weather, currency, and macro conditions.",
      "What professionals actually watch, and what they deliberately ignore: they watch cash conversion, insider selling clusters with no scheduled plan behind them, and year-over-year wording changes in risk factors. They largely ignore short-term price momentum, message-board sentiment, and single analyst downgrades — all of which feel like information and mostly measure mood.",
    ],
    scenario:
      "Red-Flag Rita kept one rule: before buying anything, she wrote down the three things most likely to go wrong, and if she could not find three she assumed she had not looked hard enough. It talked her out of four exciting companies, one of which went on to a spectacular run she watched from the sidelines and never quite got over. The other three collapsed — one to near zero. Rocket-Emoji Rex had no such rule, caught the winner Rita missed, and gave it all back on the other three plus two more. Rita's process cost her one great outcome. Rex's cost him the account.",
    gutCheck: {
      prompt: 'A company issues new shares every year to fund its operations. For an existing shareholder this means…',
      options: [
        'Nothing much, since the total value of the company is unchanged',
        'Their ownership percentage shrinks each year — a real cost called dilution',
        'The stock price must rise, since there are more shares in circulation',
      ],
      answerIndex: 1,
      explanation:
        "Your share is a fraction, and persistent issuance grows the denominator. It is a genuine transfer of value away from existing owners that never shows up as an expense you can point at, which is exactly why you have to look for it deliberately in the share count.",
    },
    realScenario: {
      prompt:
        "A company you are researching reports large 'adjusted' profits every quarter but has never reported an actual profit, with the difference consistently being stock-based compensation. How should you read this?",
      options: [
        'Adjusted figures are the standard in tech, so use them and move on',
        'Stock compensation is a real cost paid in your ownership — the adjusted number hides it',
        'It is fine as long as revenue is growing quickly',
      ],
      answerIndex: 1,
      explanation:
        "Paying employees in shares is a genuine expense; it just gets paid by shareholders through dilution rather than in cash. When the gap between adjusted and actual profit is permanent and always the same item, the exception has become the business model — and that is worth knowing before you buy it.",
    },
    mythVsReality: {
      statement: 'A stock that has already fallen 80% is a bargain, because it cannot fall much further.',
      isMyth: true,
      explanation:
        "It can fall another 80%, and then another. A stock down 80% needs a 400% gain just to get back to where it started, and price alone tells you nothing about whether the business is still viable — plenty of companies have fallen 80% on the way to zero. 'It has fallen a lot' is a fact about the chart. Whether it is cheap is a question about the business.",
    },
    connects: ['fundamentals', 'valuation', 'moat', 'research'],
    aiPrompt:
      "Walk me through the warning signs that preceded two or three well-known corporate collapses — what was visible in the public filings before the collapse, and how early. Then give me a short checklist of the specific line items and disclosures I should always check before buying any individual stock.",
    depth: 3,
  },
  {
    id: 'order-types',
    chapter: 3,
    order: 7,
    category: 'execution',
    tag: 'Placing orders',
    title: 'The Five Order Types',
    tagline: 'The form on the screen is not a formality.',
    marketId: 'nvda',
    surface:
      "You have researched a company and decided to own it. Now there is a form with a dropdown on it, and the choice you make there decides what price you actually get. Five order types cover almost everything: market, limit, stop, stop-limit, and trailing stop. Each one guarantees something different — and each one gives up something in exchange. Nobody tells you what, so you find out with real money.",
    middle: [
      "A market order says 'I want this done now, at whatever the next price is.' On a large company during normal hours that is genuinely fine — the gap between the buying and selling price is pennies. On a small company, at the opening bell, or in the middle of news, 'whatever the next price is' can be meaningfully worse than the number you were looking at. That gap has a name, slippage, and it is a real cost that never appears on your statement as a fee.",
      "A limit order says 'this price or better, and I will wait.' It is the default professional habit, because it removes the possibility of a surprise fill entirely. Its cost is the trade that never happens: set a buy limit a few percent below the market and you may spend a year watching a company you wanted to own get steadily more expensive because you were trying to save forty cents. A limit that never fills is not a free option — it is a decision not to own the thing.",
      "A stop order is a sleeping market order. Nothing happens until the price crosses your level, and then it wakes up and sells at whatever is available. It sounds like insurance and it is not quite: because it becomes a market order, a fast drop can fill you well below your stop. And a stop set inside a stock's normal range of wobble is not protection at all — it is a scheduled exit at the worst available moment.",
    ],
    deep: [
      "A stop-limit adds a second price: the stop wakes the order up, the limit refuses to trade worse than your floor. It fixes the slippage problem and introduces a nastier one. In a genuine collapse the price crashes straight through both numbers, your limit never gets hit, and you are left holding the entire decline with an unfilled order — the protection switches off in precisely the scenario you bought it for. Try that on the order desk on this site and watch it happen on real prices.",
      "A trailing stop follows the price up and never moves back down. Set 10% and it sits 10% below the highest price reached since you placed it, ratcheting higher as the stock climbs and freezing when it falls. It is the most elegant of the five and the most quietly arbitrary, because the percentage is doing all the work and most people pick it out of thin air. Too tight and ordinary noise ejects you from a stock still trending up; too loose and it hands back most of the gain before firing.",
      "Two settings underneath every order that nobody reads. Duration: 'day' orders die at the closing bell, which is why your limit from Monday is quietly gone on Tuesday; 'good till canceled' orders live for months, which is how a stale buy order you have entirely changed your mind about fires during a crash. And extended-hours trading: before the open and after the close there are far fewer buyers and sellers, spreads widen dramatically, and prices jump. Limit orders are effectively mandatory there.",
      "The deeper truth all five point at: every order type trades certainty of price against certainty of execution, and you cannot have both. Market orders guarantee execution, limit orders guarantee price, and the stop family are triggers layered on top of one of those two. Once you see that trade-off, you never have to memorize the list again — you just ask which certainty you need today.",
      "What professionals actually do, which is less exciting than it sounds: limit orders almost always, sized so a missed fill is survivable, and price triggers treated as risk tools rather than decisions. Most importantly, they do not use stops as a substitute for a thesis. A stop knows the price fell; it knows nothing about whether the business changed, and those are the only two things worth acting on.",
    ],
    scenario:
      "Market-Order Marcus placed a market buy thirty seconds after the opening bell on a morning full of news, and was filled 4% above the price he had been staring at — a cost that quietly equaled a year of the dividend. Limit-Order Lena set a limit two percent below the market on the same stock and was filled that afternoon at her price. She also has a limit sitting unfilled on a different company from fourteen months ago, which has since doubled without her. Both learned the same lesson from opposite directions: the order type is not paperwork, it is part of the decision.",
    gutCheck: {
      prompt: 'What does a limit order guarantee?',
      options: [
        'That your order will execute before the market closes',
        'That you will not pay worse than the price you named — but it might not execute at all',
        'That you will get the best price available that day',
      ],
      answerIndex: 1,
      explanation:
        "A limit order guarantees price, never execution. That is the exact opposite of a market order, which guarantees execution and never price. Every order type on the list is a different position on that same trade-off.",
    },
    realScenario: {
      prompt:
        'You own a stock at $100 and set a stop-loss at $90 to protect yourself. Overnight the company reports terrible news and the stock opens at $71. What most likely happens?',
      options: [
        'You are sold at $90, since that was your stop price',
        'Your stop triggers and becomes a market order, filling near $71',
        'The order is canceled because the price fell below your stop',
      ],
      answerIndex: 1,
      explanation:
        "This is the gap risk that makes stops weaker than they feel. A triggered stop becomes a market order, and the market's next available price was $71 — no trading happened between $90 and there. Overnight news does not respect your levels, which is why a stop is a risk tool rather than a guarantee.",
    },
    mythVsReality: {
      statement: 'A stop-loss order protects you from big losses.',
      isMyth: true,
      explanation:
        "It reduces some losses and cannot prevent the worst ones. Gaps jump straight over your level, fast declines fill you below it, and normal volatility triggers it on stocks that then recover without you — a pattern that turns a temporary dip into a permanent loss you caused. Stops are a useful tool with real limitations, which is a much less comforting sentence than 'protected.'",
    },
    connects: ['dollars-and-recurring', 'when-to-sell', 'vix', 'volume'],
    aiPrompt:
      "Explain market, limit, stop, stop-limit, and trailing stop orders, including exactly what each guarantees and what it gives up. Then explain slippage, bid-ask spreads, gap risk on overnight news, and why extended-hours trading is riskier. Give me a concrete example of a situation where each order type is the right choice and one where it is the wrong choice.",
    depth: 3,
  },
  {
    id: 'dollars-and-recurring',
    chapter: 3,
    order: 8,
    category: 'execution',
    tag: 'Placing orders',
    title: 'Dollars, Shares, and Automatic Buys',
    tagline: 'The most powerful button in the app is the boring one.',
    marketId: 'amzn',
    surface:
      "Modern brokerages let you buy in two units: dollars or shares. Naming the money — 'invest $25' — and letting the app work out the fraction of a share is a genuinely new capability, and it quietly changes what is possible for someone with a small amount to invest. Naming the quantity — 'buy 1 share' — means accepting whatever it costs that day. For repeat investing, dollars win almost every time, and the reason is arithmetic rather than preference.",
    middle: [
      "Here is why: a fixed $25 automatically buys more shares when the price is low and fewer when the price is high. You are not predicting anything, and you do not have to be clever — the fixed dollar amount does the leaning for you. Buying a fixed number of shares does the opposite, committing more money exactly when things are expensive. This is dollar-cost averaging, and its real advantage is that it requires no forecasting skill whatsoever.",
      "Then automate it. A recurring buy — a set amount, on a set day, without a decision — is the single highest-leverage setting in a young investor's account, and it works for an unglamorous reason: it removes you from the process. The recurring buy does not check the news, does not feel anything in March, and does not decide to wait for a better entry. Over decades, not interrupting the plan matters more than the plan.",
      "Why this hits hardest at 22: your contributions are the main event right now, not your returns. A 12% year on $600 is $72. Consistently adding $50 a week is $2,600. The habit is worth more than the insight for years — and the habit formed at 22 is the one still running at 45, when the balance is large enough for returns to take over. The order of operations is: build the habit, then get good at picking.",
    ],
    deep: [
      "The honest math on lump sum versus dollar-cost averaging, because the internet gets this wrong in both directions. If you already have a large sum, investing it all at once has historically produced better outcomes more often than spreading it out — simply because markets rise more often than they fall, so money in earlier is money compounding longer. But spreading it out reduces the pain of terrible timing and, more importantly, gets some people to invest who would otherwise sit in cash for two years. The best plan you will actually follow beats the optimal plan you abandon.",
      "For a recurring investor the debate is moot in a way that is worth understanding: if you are investing from each paycheck, you are dollar-cost averaging by construction. You do not have a lump sum to deploy. The relevant question is not 'DCA or lump sum' but 'what percentage of income, automatically, starting when' — and the answer to 'when' is essentially always 'now, at whatever amount you can sustain.'",
      "Fractional shares come with a real catch nobody mentions upfront. They are typically held by the broker on your behalf rather than registered to you, which can make transferring them to another brokerage awkward — often they have to be sold first, which can trigger taxes in a regular account. Worth knowing before you build years of fractional positions somewhere you might eventually want to leave.",
      "Two mechanics that quietly matter. Recurring buys usually execute as market orders at a set time, so you accept whatever the price is that moment — normally trivial, occasionally not, and a reason to prefer a mid-day schedule over the volatile first minutes after the open. And in a regular taxable account, every automatic purchase creates a new tax lot with its own cost basis and purchase date, which matters later for holding periods and for the wash-sale rule if you ever sell at a loss while a recurring buy is still running.",
      "What professionals actually watch here: whether the contribution rate is rising with income, and whether the automation survived the last drawdown. Someone who kept buying through a 30% decline has demonstrated something no risk questionnaire can measure. Someone who paused the recurring buy in the worst month has learned something important about themselves, and should size their positions accordingly rather than pretend otherwise.",
    ],
    scenario:
      "Recurring Rae set $40 a week into two funds and one company at 23, then deliberately forgot the login for long stretches. She bought through two frightening declines without noticing much, because the transfer was automatic and the news was not on her calendar. Timing Tim kept the same money in cash, waiting for a clearly better entry point, and he was right twice — he genuinely did buy near two local bottoms. He was also uninvested for most of eleven years while waiting for the third. Rae never once bought at a good price on purpose. She simply bought at every price, which turned out to be the trick.",
    gutCheck: {
      prompt: 'Why does investing a fixed dollar amount each week tend to work better than buying a fixed number of shares?',
      options: [
        'Because brokers charge lower fees on dollar-based orders',
        'Because a fixed dollar amount automatically buys more shares when prices are lower',
        'Because fractional shares grow faster than whole shares',
      ],
      answerIndex: 1,
      explanation:
        "The fixed dollar amount does the leaning for you without any forecasting: cheap weeks buy more, expensive weeks buy less. Buying a fixed share count does the reverse, committing more money precisely when prices are high.",
    },
    realScenario: {
      prompt:
        'You just received a $10,000 bonus and plan to invest it for thirty years. What does the historical evidence actually suggest?',
      options: [
        'Investing it all at once has more often produced better outcomes, because money in earlier compounds longer',
        'Spreading it over a year is reliably better, because it lowers your average price',
        'It makes no measurable difference over thirty years',
      ],
      answerIndex: 0,
      explanation:
        "Because markets rise more often than they fall, lump sum has historically won more often than not. But 'more often' is not 'always,' and spreading it out is a perfectly rational way to buy peace of mind — especially if it is the difference between investing and leaving the money in cash for two years while you work up the nerve.",
    },
    mythVsReality: {
      statement: 'You should wait for a dip before starting to invest.',
      isMyth: true,
      explanation:
        "It sounds prudent and it has a poor track record, for a plain reason: the dip may arrive years later and from a higher level than today. Studies of investors who waited for better entry points consistently find the waiting cost more than the improved price saved. Time in the market has historically mattered more than timing it — which is a description of the past rather than a promise about the future, but it is the strongest pattern in the data.",
    },
    connects: ['order-types', 'when-to-sell', 'sp500', 'stock-vs-index'],
    aiPrompt:
      "Explain dollar-cost averaging versus lump-sum investing, including what the historical research actually found about which performs better and why. Then explain fractional shares — how brokers hold them, what happens if I transfer accounts, and how each recurring purchase creates a separate tax lot that matters for holding periods and the wash-sale rule.",
    depth: 2,
  },
  {
    id: 'when-to-sell',
    chapter: 3,
    order: 9,
    category: 'stock-picking',
    tag: 'Decisions',
    title: 'When to Buy, When to Sell',
    tagline: 'Decide in advance, because you will not think clearly later.',
    marketId: 'googl',
    surface:
      "Buying is the easy half. Selling is where almost all the damage happens, because by the time you are deciding, you are no longer neutral — you are up and greedy, or down and frightened, or bored and looking for something to do. The professional answer is unromantic: write down why you own something and what would prove you wrong, before you buy. Then sell when that specific thing happens, not when your stomach says so.",
    middle: [
      "There are only a few genuinely good reasons to sell. The thesis broke: the specific reason you bought is no longer true — the moat leaked, the growth stopped, management started behaving badly. You found a materially better use for the money. The position grew so large that one company now decides your financial life. Or you need the cash for the thing you were saving for all along. Notice what is absent: 'it went down,' 'it went up a lot,' and 'I read something scary.'",
      "The two most expensive reflexes both feel like discipline. Selling winners early to 'lock in gains' systematically removes your best businesses from the portfolio, and since a small number of enormous winners generate most of long-run returns, cutting them at +40% is how people end up with a collection of their worst ideas. And selling losers in a panic converts a temporary decline into a permanent loss — sometimes correctly, when the business really did deteriorate, and that is exactly why the written thesis matters. It is the only way to tell those apart while frightened.",
      "On buying: the same principle in reverse. Decide what you want to own and roughly what you are willing to pay while you are calm, then let the order do the work. Almost every bad purchase in a young investor's history happened in a state of urgency — a stock running, a friend's story, a fear of missing out. Urgency is not information, and no genuinely good long-term investment requires you to act within the hour.",
    ],
    deep: [
      "Taxes change the arithmetic of selling in a way people discover too late, and only in regular taxable accounts. In the U.S., gains on something held a year or less are taxed as ordinary income; hold longer than a year and they are taxed at lower long-term rates. That difference can be a large fraction of the gain, which means the same sale decision can be right in a retirement account and wrong in a taxable one. It also means 'I will hold eleven more days' is occasionally a genuinely rational sentence.",
      "The wash-sale rule catches people who think they are being clever. Sell at a loss for the tax deduction and buy the same or a substantially identical security within 30 days before or after, and the loss is disallowed. It is easy to trigger accidentally — most commonly by having a recurring buy still running while you harvest a loss on the same stock.",
      "Rebalancing is selling without prediction, which is why professionals like it. Set target weights, and when a position drifts far above its target you trim it back — mechanically, on a schedule, with no forecast involved. It is not about calling a top; it is about refusing to let one company quietly become your whole portfolio because it did well. The discipline is that you do it when it feels wrong, which is always.",
      "Position sizing is the decision that makes all the others survivable, and it happens before you buy. If a company going to zero would genuinely damage your life, the position is too large regardless of how strong your conviction is — conviction is exactly what you have right before you find out you were wrong. Sizing so that being wrong is educational rather than devastating is what lets you keep learning long enough to get good.",
      "What professionals actually do: they write the thesis down. Not as a ritual — as a defense against their own memory, which will quietly rewrite what they believed to match what happened. A four-sentence note with a date on it is the cheapest risk-management tool in existence, and reading it two years later is the fastest way to find out whether you are actually good at this.",
    ],
    scenario:
      "Thesis Theo wrote four sentences about each company he bought, including the specific thing that would tell him he was wrong. When one of them lost its biggest customer — the exact scenario in his note — he sold in an afternoon without agonizing, because the decision had been made a year earlier by a calmer version of himself. Panic-Sell Paula owned the same company and several better ones, and sold all of them in one frightened week during an unrelated market decline, then spent two years waiting for a re-entry point that felt safe. The market recovered in five months. Theo's discipline looked like coldness. It was mostly just paperwork.",
    gutCheck: {
      prompt: 'According to this lesson, which is a genuinely good reason to sell a stock?',
      options: [
        'It has risen 40% and you want to lock in the gain',
        'The specific reason you bought it is no longer true',
        'The overall market is falling and you feel nervous',
      ],
      answerIndex: 1,
      explanation:
        "A broken thesis is information about the business. A 40% gain is information about the price — and systematically selling winners early is how people end up holding only their worst ideas, since a few large winners generate most of long-run returns.",
    },
    realScenario: {
      prompt:
        'In a taxable account you have a large gain on a stock you have held for 11 months, and your thesis is intact. What is worth considering before selling?',
      options: [
        'Nothing — a gain is a gain whenever you take it',
        'Holding past the one-year mark would qualify the gain for lower long-term tax rates',
        'You should sell immediately, since gains over 11 months usually reverse',
      ],
      answerIndex: 1,
      explanation:
        "The short-term versus long-term capital gains distinction can consume a meaningful slice of the gain, and it only applies in taxable accounts — inside a retirement account the timing is irrelevant. It is a real consideration, though never a reason to hold something whose thesis has actually broken.",
    },
    mythVsReality: {
      statement: 'You should always take profits when a stock has doubled — nobody ever went broke taking a gain.',
      isMyth: true,
      explanation:
        "The saying is catchy and the math disagrees. Long-run returns are driven by a small number of positions that go up many times over, and a rule that automatically ejects you at +100% guarantees you never own one. People do not go broke taking gains; they do end up with mediocre results and a portfolio of their weakest ideas, which is its own kind of expensive.",
    },
    connects: ['order-types', 'red-flags', 'valuation', 'dollars-and-recurring'],
    aiPrompt:
      "Explain the legitimate reasons to sell a stock versus the emotional ones, and why selling winners early hurts long-run returns. Then cover the U.S. tax mechanics: short-term versus long-term capital gains, the wash-sale rule and how a recurring buy can trigger it accidentally, and how rebalancing works as a way to trim positions without predicting anything.",
    depth: 3,
  },
  {
    id: 'research',
    chapter: 3,
    order: 10,
    category: 'stock-picking',
    tag: 'Research',
    title: 'How to Research a Company',
    tagline: 'Including how to use AI without being flattered into a bad decision.',
    surface:
      "Researching a company is not about finding someone's opinion you agree with — it is about being able to answer four questions in your own words: how does this business make money, why does it keep winning, what would break it, and what does the current price already assume? An AI can help enormously with all four. It can also produce a fluent, confident, subtly wrong answer, and it will never tell you which one it just gave you.",
    middle: [
      "Start with primary sources, because they are better than anything written about them and almost nobody reads them. The annual report — the 10-K in the U.S. — contains the business description, the segment breakdown showing where money actually comes from, and the risk factors, which is the section where a company legally confesses what worries it. Read the shareholder letter for how management thinks. Skim an earnings-call transcript for what analysts keep pushing on, because their repeated questions are usually the real issue.",
      "Then the discipline that separates research from browsing: write down the bear case in your own words, and make it good. Not a token paragraph — the strongest version, the one a smart person betting against you would make. If you cannot construct it, you do not understand the company well enough to own it. Most people skip this because it is uncomfortable, and being uncomfortable is precisely the point.",
      "Where AI genuinely helps: explaining an industry you know nothing about, translating a filing into plain English, comparing three companies on the same metrics, and — best of all — arguing against you on command. Where it hurts: giving you a confident number that is wrong, and telling you what you want to hear, because it is built to produce satisfying answers and 'this looks like a great buy' is deeply satisfying. Ask for structure, evidence, and the argument against. Then verify.",
    ],
    deep: [
      "How to aim the question, which matters more than which model you use. Bad prompt: 'Is NVDA a good buy?' — it invites a confident verdict nobody can honestly give, and you will get one. Good prompt: 'Explain how NVDA makes money by segment, name the moat and stress-test it, tell me what the current valuation assumes about future growth, and make the strongest bear case without softening it.' The second cannot be answered with a vibe. The order desk page on this site builds exactly that prompt for you, and it is worth reading to see the shape.",
      "Verification is a skill, not a chore. Pick two numbers from any AI answer and check them against the company's own filing. If both hold, you have calibrated your trust for the rest. If either is off, you have learned that this answer needs checking line by line — which is enormously valuable to know before acting on it. Language models are notably weaker at precise financial figures than at explanation, so lean on them for the reasoning and check the arithmetic yourself.",
      "Guard against the two ways research goes wrong even when done diligently. Confirmation bias: once you like a company you will read everything as supporting evidence, which is why writing the bear case first is a structural fix rather than a virtue. And narrative seduction: a beautiful story about the future is enormously persuasive and almost entirely unfalsifiable, which is exactly what makes it dangerous. The antidote to both is writing down, in advance, what would change your mind.",
      "Free sources worth knowing: company investor-relations pages for filings and transcripts, the SEC's EDGAR database for anything U.S.-listed, and any screener for five-year trends in the metrics from the fundamentals lesson. Paid research is largely unnecessary at this stage. The gap between you and a professional is not access to data — it is the habit of checking the same boring things every time, including on the companies you are excited about.",
      "What professionals actually do that looks like nothing: they keep a written file per company, dated, updated when something changes. It defends against the memory quietly rewriting what you believed to match what happened. Two years of those notes will tell you more about whether you should be picking stocks than any amount of reading.",
    ],
    scenario:
      "Verify Vera asked an AI for a full breakdown of a company, then checked two figures against the annual report — one was off by enough to matter, which told her exactly how carefully to read the other twenty. She kept the bear case, deleted the rest, and went to the filing herself. Copy-Paste Colin asked whether the same stock was a good buy, received a fluent and encouraging answer, and bought it that evening. Six months later he still could not name the company's largest customer. He was not lazy — he had genuinely done research. He had just asked a question whose only possible answer was agreement.",
    gutCheck: {
      prompt: 'Which section of a company\'s annual report is where it explicitly discloses what could go wrong?',
      options: [
        'The letter to shareholders',
        'The risk factors section',
        'The management discussion of results',
      ],
      answerIndex: 1,
      explanation:
        "Risk factors is where a company legally confesses its worries, and it is one of the most under-read documents in all of finance. Reading how the wording changes from year to year is even more useful — companies quietly rewrite it when something has genuinely shifted.",
    },
    realScenario: {
      prompt:
        'You ask an AI to analyze a stock and it gives a confident, well-written case for why it will do well. What is the most useful next step?',
      options: [
        'Ask it to make the strongest possible bear case, then verify two of its numbers against the filing',
        'Ask a second AI and see whether the two agree',
        'Buy a small position, since the analysis was thorough',
      ],
      answerIndex: 0,
      explanation:
        "Two models can be confidently wrong in the same direction, so agreement is weak evidence. Forcing the counter-argument and checking specific figures against primary sources are the two steps that actually raise the quality of the decision — and the second one calibrates how much to trust everything else in the answer.",
    },
    mythVsReality: {
      statement: 'If an AI has read every filing and article about a company, its conclusion is more reliable than mine.',
      isMyth: true,
      explanation:
        "It is genuinely better than you at reading quickly, explaining clearly, and summarizing an industry — use it for all three. It is also optimized to produce answers that feel satisfying, has no stake in your outcome, and is measurably unreliable on precise financial figures. Its explanations are often excellent and its verdicts are worth nothing, and the difference between those is the whole skill.",
    },
    connects: ['red-flags', 'fundamentals', 'moat', 'when-to-sell'],
    aiPrompt:
      "Teach me how to read a 10-K annual report efficiently: which sections matter most, in what order, and what to look for in each. Then explain how the wording changes in the risk factors section year over year can signal a change in the business, and how I should verify financial figures an AI gives me against primary sources.",
    depth: 3,
  },

  // Chapter 4 — Six Giants, Six Business Models. Each of these is the academy
  // anchor for one card on the dashboard's Micro tab.
  {
    id: 'case-nvda',
    chapter: 4,
    order: 1,
    category: 'company',
    tag: 'Case study',
    title: 'NVIDIA',
    tagline: 'Selling shovels in a gold rush — until everyone starts making shovels.',
    marketId: 'nvda',
    riskNote:
      "NVIDIA is a case study, not a suggestion. It is a supplier to a capital-spending boom, which historically means violent swings in both directions — it has fallen more than 50% multiple times in its history, including during stretches when the business was fine. A single company at the center of one enormous narrative is among the least suitable places for money you cannot afford to watch drop by half.",
    surface:
      "NVIDIA designs the chips that AI models are trained and run on, and sells them to nearly everyone racing to build AI — plus the networking gear needed to wire thousands of those chips into a working system. It is the purest example in the market of a picks-and-shovels business: it does not have to win the AI race, it sells the equipment to everyone running it. That is a genuinely wonderful position, and it is not the same thing as a permanent one.",
    middle: [
      "The moat is not the silicon, and this is the detail most people get wrong. It is CUDA — the software layer developers have been writing AI code against for nearly two decades. A competitor can build a chip with comparable specifications and still lose, because the world's AI code assumes NVIDIA, and rewriting it is expensive, slow, and nobody's favorite project. AMD has shipped credible hardware for years and still trails badly, which tells you the contest was never only about the chip.",
      "It also sells increasingly complete systems rather than components — chips, networking, and software as one package — which means it captures more of each data center's budget than a parts supplier could. That is a deliberate strategic choice and it explains a lot about the margins.",
      "Now the honest part. NVIDIA's real competition is not AMD. It is its own biggest customers, every one of which is openly funding an in-house alternative precisely because depending this heavily on one supplier is intolerable to them. That is not a rumor; it is stated strategy at multiple companies, and Broadcom's business exists largely to serve it.",
    ],
    deep: [
      "Customer concentration is the risk that deserves the most weight and gets the least. A handful of enormous buyers account for much of NVIDIA's revenue, which means a small number of internal decisions at other companies can change its growth story. Concentration is not disqualifying — it is a risk you should be paid for taking, and when a stock is priced for scarcity, you may be paying for it instead.",
      "The cyclicality point matters more than the AI debate. Semiconductors have always been cyclical, because customers over-order during shortages and stop entirely once they have enough. NVIDIA is currently a supplier to the largest capital-spending build-out in corporate history, funded by companies that can slow it whenever the returns disappoint. Note what the risk is: not that AI fails, but that spending on AI infrastructure merely decelerates while the price assumes it will not.",
      "Apply the valuation lesson here specifically. Reverse-engineer it: what growth rate, sustained for how many years, at what margin, would justify the current price — and has a company of this size ever done that? Sometimes the answer is a defensible yes. The exercise is valuable either way, because it converts a vague feeling about expensiveness into a specific claim you can check against reality later.",
      "What to actually watch: data-center revenue growth rate rather than the total, any disclosure about how much comes from the top few customers, gross margin direction (the earliest signal that competition arrived), and progress reports on customers' in-house chips. What to ignore: whether it beat quarterly estimates, which is a story about analysts rather than about the business.",
    ],
    scenario:
      "Shovel-Seller Sam noticed in 2015 that whoever won machine learning, they would all need the same chips, and he sized the position so that being early and wrong would not hurt him. It turned out to be the best decision of his financial life. What made it work was not the insight — plenty of people had it — but that he had written down the two things that would end the thesis: customers building their own chips, and gross margins slipping. He checks both every quarter, and he has never once had to guess whether it is time to leave.",
    gutCheck: {
      prompt: "What is generally considered NVIDIA's strongest competitive moat?",
      options: [
        'Its chips are physically impossible for competitors to replicate',
        'CUDA — the software ecosystem AI developers have written against for nearly two decades',
        'It owns the factories that manufacture all of its chips',
      ],
      answerIndex: 1,
      explanation:
        "The software lock-in is the moat. Rivals have shipped competitive hardware and still struggled, because the world's AI code assumes NVIDIA and porting it is expensive and unglamorous. NVIDIA also does not own its factories — it designs chips and has them manufactured by others.",
    },
    realScenario: {
      prompt:
        'Several of NVIDIA\'s largest customers announce major expansions of their in-house AI chip programs. Why does this matter more than a competitor launching a rival chip?',
      options: [
        'It does not — in-house chips are always worse than specialists\' chips',
        'Those customers are a large share of revenue, so they can remove demand rather than just compete for it',
        'It only matters if the in-house chips are cheaper',
      ],
      answerIndex: 1,
      explanation:
        "A competitor has to win business away from NVIDIA. A large customer can simply stop buying — which subtracts revenue directly rather than contesting it. That is the difference between competition and concentration risk, and it is why the customer list matters as much as the competitor list.",
    },
    mythVsReality: {
      statement: 'NVIDIA has no real competition, so its dominance is safe for the foreseeable future.',
      isMyth: true,
      explanation:
        "It has an enormous lead and genuine competition — just not from where people look. The threat is not a rival selling a better general-purpose chip; it is the handful of giant customers designing replacements for their own use, often with Broadcom's help, because relying this heavily on one supplier is strategically unacceptable to them. Dominance this large creates the incentive to end it.",
    },
    connects: ['moat', 'valuation', 'case-avgo', 'nasdaq'],
    aiPrompt:
      "Explain NVIDIA's business by segment and what CUDA actually is and why it functions as a moat. Then give me the strongest bear case: customer concentration, in-house chip programs at its largest customers, semiconductor cyclicality, and what growth the current valuation assumes. Tell me the three specific things that would signal the thesis is breaking.",
    depth: 3,
  },
  {
    id: 'case-aapl',
    chapter: 4,
    order: 2,
    category: 'company',
    tag: 'Case study',
    title: 'Apple',
    tagline: 'A hardware company that quietly became a toll road.',
    marketId: 'aapl',
    riskNote:
      "A case study, not a recommendation. Apple is among the most stable large companies in existence and still fell over 40% in 2008 and again in 2012–13. Size and quality reduce the odds of disaster; they do not eliminate large declines, and no single company belongs in money you need soon.",
    surface:
      "Apple sells iPhones, Macs, and watches at margins hardware companies are not supposed to achieve. But the more interesting half is Services — the App Store, iCloud, subscriptions, and payment fees billed quietly to roughly two billion active devices. Watching Services grow faster than hardware is watching a gadget maker turn into a toll road, and it is the single most important thing to understand about the company.",
    middle: [
      "The moat is switching costs wearing the costume of good taste. Your photos, messages, purchases, passwords, and muscle memory all live inside the ecosystem, your watch only talks to your phone, and the family group chat visibly degrades if you leave. Apple can charge a premium because the exit is genuinely annoying, not because the aluminum is better. That is a far more durable advantage than design, because design can be copied and inconvenience cannot.",
      "Here is the comparison that teaches the most: Android outsells iPhone worldwide by a wide margin and earns a fraction of the industry's profit. Market share and profit share are different games. Apple deliberately takes the premium end of the market plus the recurring revenue attached to it, converting far fewer units into far more money — a lesson that applies well beyond phones.",
      "Apple is also the market's favorite example of relentless buybacks. It has retired an enormous quantity of its own shares over the past decade, which means earnings per share grew considerably faster than earnings. That is the dilution lesson running in reverse, and it is a real return to shareholders that never shows up as a dividend.",
    ],
    deep: [
      "Two clocks are running against the thesis, and they are unrelated to each other. The first is regulatory: authorities in several jurisdictions are prying open the App Store — commission rates, alternative payment systems, sideloading. That is a direct attack on the highest-margin revenue Apple has, and unlike competition it cannot be out-engineered.",
      "The second is quieter and possibly larger. Apple has been slower and more conservative on AI than its peers, and its whole business rests on the phone being the primary place people interact with computing. If that changes — if the interface migrates to something Apple does not control — the ecosystem's gravity weakens at the root. Nobody knows whether that happens in three years or thirty, and 'nobody knows' is precisely why it belongs in the bear case rather than being dismissed.",
      "The China exposure is a genuine risk that gets discussed in geopolitical terms and should be read as a business one: it is both a large market and the place most of the manufacturing happens. That is concentration on two axes at once, and the risk-factors section says so plainly.",
      "What to actually watch: Services revenue growth as the primary number, any regulatory ruling on App Store commissions, gross margin (which reveals whether the premium is holding), and the pace of buybacks. Unit sales of iPhones matter far less than any of these, which is the opposite of how the company is usually covered.",
    ],
    scenario:
      "Ecosystem Ellie bought Apple in 2013 not because she thought the next phone would be great, but because she noticed her whole family had quietly become unable to leave — four people, one photo library, a watch that only worked with one phone. She was not predicting products. She was noticing a structure. Spec-Sheet Simon spent the same decade buying whichever manufacturer had the best camera that year, correctly identifying the superior hardware almost every time, and made a fraction of Ellie's return. The better product kept losing to the harder exit.",
    gutCheck: {
      prompt: 'Why is Apple\'s Services segment strategically more important than its headline iPhone sales?',
      options: [
        'Services is now larger than hardware in total revenue',
        'It is recurring, high-margin revenue earned from devices already sold',
        'Hardware sales have been declining every year for a decade',
      ],
      answerIndex: 1,
      explanation:
        "Services monetizes the installed base repeatedly rather than one sale at a time, at much higher margins — the toll-road quality. It is not yet larger than hardware in revenue, and hardware has not been in continuous decline; the shift is about the *kind* of revenue, not the size.",
    },
    realScenario: {
      prompt:
        'Android holds a much larger share of global smartphone units than iPhone, yet Apple captures a large majority of the industry\'s profits. What does this illustrate?',
      options: [
        'The unit share data must be measured incorrectly',
        'Market share and profit share are different things — Apple takes the premium segment and its recurring revenue',
        'Apple must be selling its phones at higher volumes than reported',
      ],
      answerIndex: 1,
      explanation:
        "Apple deliberately competes for the profitable end of the market rather than the largest one, then earns recurring Services revenue on top of each sale. Winning units and winning profits are separate contests, and it is entirely possible to lose the first while dominating the second.",
    },
    mythVsReality: {
      statement: 'Apple is safe because everyone already owns an iPhone, so its revenue is guaranteed.',
      isMyth: true,
      explanation:
        "A huge installed base is a genuine asset and not a guarantee. The App Store revenue that makes the base so valuable is under active regulatory attack in several countries, and the deeper assumption — that the phone remains the main way people interact with computing — is exactly what a shift in technology could undo. Large and entrenched is not the same as permanent, as several former giants could confirm.",
    },
    connects: ['moat', 'what-you-own', 'case-googl', 'fundamentals'],
    aiPrompt:
      "Break down Apple's revenue by segment and explain why Services matters more than iPhone unit sales. Then cover the bear case properly: the regulatory challenges to App Store commissions in various jurisdictions, Apple's position on AI relative to peers, and its dual concentration in China as both a market and a manufacturing base.",
    depth: 3,
  },
  {
    id: 'case-msft',
    chapter: 4,
    order: 3,
    category: 'company',
    tag: 'Case study',
    title: 'Microsoft',
    tagline: 'The most boring moat in the world, and one of the strongest.',
    marketId: 'msft',
    riskNote:
      "A case study, not a recommendation. Microsoft spent more than a decade going essentially nowhere after 2000 despite remaining enormously profitable the entire time — a reminder that a great business bought at a great price are two separate achievements.",
    surface:
      "Microsoft rents software and computing power to businesses on multi-year contracts: Office and Windows, Azure cloud infrastructure, and AI features bolted onto both at an extra price per seat. It is the least glamorous story among the six giants and arguably the most defensible, because its advantage is not a product anyone loves — it is that leaving is a multi-year project nobody gets promoted for starting.",
    middle: [
      "The moat is switching costs at enterprise scale. Email, files, identity, security, and servers all run through Microsoft inside an enormous number of organizations, and untangling that means retraining staff, rewriting integrations, and accepting risk for a benefit your CFO will struggle to see. That is why Microsoft's revenue is unusually predictable for a technology company: it is contracted, renewed, and embedded rather than won fresh each year.",
      "The strategic move worth studying is how Azure grew from a distant second place instead of stalling there. Amazon's AWS was bigger and earlier. Microsoft's advantage was that it was already inside the building — it could sell cloud infrastructure to a company that had run Office and Windows for twenty years, which is a far shorter conversation than a competitor's cold pitch. Bundling is not a glamorous strategy. It is a very effective one.",
      "This is also the cleanest example of a business model shift done well. Microsoft moved from selling software in a box to renting it by subscription, trading a big one-time payment for a smaller recurring one. Revenue looked worse briefly and the business became far more valuable, because recurring revenue is worth more than the same amount arriving unpredictably.",
    ],
    deep: [
      "The genuine open question is the AI capital spending. Microsoft is committing enormous sums to data centers on the belief that customers will pay for AI features at scale — and the payback is currently a promise supported by early evidence rather than an established pattern. This is where the fundamentals lesson earns its keep: watch capital expenditure against the revenue AI actually generates, because that gap is the entire debate and it is measurable each quarter.",
      "Depth of embedding cuts both ways. Being wired into how the economy operates makes Microsoft a permanent antitrust target, and it has been broken open by regulators before — the late-1990s case is the most famous in tech history. Bundling advantages are precisely what regulators dislike, and the advantage that makes Azure work is the one most likely to be challenged.",
      "There is a concentration exposure the coverage underplays: a meaningful share of the AI enthusiasm rests on partnerships and customers in the AI sector itself, some of which are funded by the same capital-spending boom. Circular arrangements in a boom are worth understanding rather than assuming away.",
      "What to actually watch: Azure growth rate, capital expenditure, operating margin (does AI improve or dilute it?), and seat-based AI adoption where disclosed. What to ignore: Windows market share, which is a story about the last era rather than this one.",
    ],
    scenario:
      "Enterprise Erin worked in corporate IT and noticed something no analyst report told her: her company had discussed migrating off Microsoft three times in six years and never once got past the planning stage, because the person who proposed it would own every problem for two years and receive no credit if it worked. That was not a technology fact, it was an organizational one, and it was worth more than any spec comparison. Consumer Carl evaluated Microsoft on whether he personally enjoyed using Windows, which was the wrong question about a company that mostly sells to procurement departments.",
    gutCheck: {
      prompt: 'What best explains how Azure grew rapidly despite AWS being larger and earlier to market?',
      options: [
        'Azure was significantly cheaper than AWS across the board',
        'Microsoft was already embedded in enterprises, making cloud an easier extension of an existing relationship',
        'AWS stopped investing in its platform',
      ],
      answerIndex: 1,
      explanation:
        "Distribution and existing relationships did the work. Selling cloud to a company that has run your software for two decades is a much shorter conversation than a competitor's — that bundling advantage let Microsoft grow from second place instead of being stuck there.",
    },
    realScenario: {
      prompt:
        "Microsoft's capital expenditure rises sharply for several years while AI-related revenue grows more slowly than expected. What does the fundamentals lesson say to watch?",
      options: [
        'Nothing — spending on infrastructure is always a positive signal',
        'Free cash flow and return on invested capital, since heavy spending with weak returns destroys value',
        'Only revenue growth, since spending is an accounting matter',
      ],
      answerIndex: 1,
      explanation:
        "This is exactly the ROIC question. Capital spending that earns less than its cost destroys value even while revenue grows, and free cash flow is where it shows up first — because that spending comes straight out of it whatever the profit line says.",
    },
    mythVsReality: {
      statement: 'Microsoft is a legacy company living off Windows and Office.',
      isMyth: true,
      explanation:
        "That description was fair around 2012 and is badly out of date. The engine is now cloud infrastructure sold on subscription, and Windows is a comparatively minor part of the story — one of the more successful business-model transitions any large company has executed. The lesson generalizes: a company's identity in the public mind can lag its actual economics by a decade, which is where a lot of mispricing lives.",
    },
    connects: ['moat', 'fundamentals', 'case-amzn', 'valuation'],
    aiPrompt:
      "Explain Microsoft's revenue segments and how the shift from boxed software to subscriptions changed the economics of the business. Then assess the AI capital-spending question: how much is being spent, what AI revenue has actually materialized, and what the return on that invested capital looks like so far versus what the valuation assumes.",
    depth: 2,
  },
  {
    id: 'case-amzn',
    chapter: 4,
    order: 4,
    category: 'company',
    tag: 'Case study',
    title: 'Amazon',
    tagline: 'Two companies under one ticker, and the famous one is not the profitable one.',
    marketId: 'amzn',
    riskNote:
      "A case study, not a recommendation. Amazon fell roughly 90% after the dot-com bubble and took years to recover, and has had several 30%-plus declines since while the business kept growing. It is the clearest illustration in this chapter that a correct long-term thesis can still involve losing most of your money temporarily.",
    surface:
      "Amazon is two very different companies wearing one ticker. There is the colossal retail operation, earning thin margins on enormous volume, plus fast-growing advertising sold against shopping searches. And there is AWS — the cloud business that quietly supplies most of the operating profit. If you only look at the shopping app, you will badly misjudge where the money comes from, and that mistake is the whole lesson.",
    middle: [
      "The retail moat is a logistics network nobody can rebuild from scratch: warehouses, trucks, and delivery routes dense enough to make same-day shipping economically viable at a scale a new entrant cannot match. Prime wraps a subscription around it so that leaving feels like a downgrade rather than a switch. That is scale economics plus switching costs stacked on each other.",
      "Then the structural advantage that a pure retailer simply cannot answer: Amazon can price retail aggressively for years because a different division pays the bills. Walmart is a genuinely fierce competitor and has closed much of the online gap — but Walmart has no AWS. A cross-subsidy like that is not a temporary tactic, it is a permanent asymmetry in who can afford to lose money longer.",
      "Amazon is also the best available answer to 'is an unprofitable company automatically bad?' It reported minimal profits for years while deliberately reinvesting every dollar into the network that became the moat. That was a choice by a management team that told shareholders exactly what it was doing, in writing, repeatedly. The lesson is not 'losses are fine' — it is that losses buying something durable are a completely different animal from losses covering weakness.",
    ],
    deep: [
      "The concentration risk is inverted from what most people assume: the profit is concentrated in the division facing the fiercest competition. If AWS growth slows meaningfully while Microsoft and Google keep gaining, retail's thin margins cannot absorb the shortfall. Watching only the retail business would mean missing where the actual risk lives.",
      "Amazon's advertising business deserves more attention than it gets. Selling ads against people who are already searching for something to buy is close to an ideal advertising product, and it has become a large, high-margin contributor that competes directly with Google's most valuable inventory. It is one of the more underappreciated segments among the six giants.",
      "On free cash flow, apply the fundamentals lesson carefully here. Amazon spends colossally and continuously, which means free cash flow can be minimal or negative for stretches by deliberate choice rather than distress. This is the case where you must read the cash flow statement in context — the same pattern that would be a red flag at a weak company is the strategy at this one, and telling those apart requires knowing what the spending buys.",
      "What to actually watch: AWS growth rate and AWS operating margin above all, then advertising revenue, then retail operating margin as a check on discipline. Total revenue is the headline and the least informative number in the release.",
    ],
    scenario:
      "Segment-Reader Sofia read the segment breakdown in the annual report before ever looking at the stock, and discovered that the business she thought she was buying — the store — was contributing a small fraction of the profit, while a cloud division she had never used supplied most of it. That single hour changed which numbers she watched for the next decade. Logo-Reader Luis evaluated Amazon by whether he liked shopping there, monitored Prime membership news, and completely missed a slowdown in the division that actually mattered.",
    gutCheck: {
      prompt: 'Where does the majority of Amazon\'s operating profit come from?',
      options: [
        'The online retail store',
        'AWS, its cloud computing division',
        'Prime membership fees',
      ],
      answerIndex: 1,
      explanation:
        "AWS supplies most of the operating profit despite retail generating far more revenue. It is the standard illustration of why reading the segment breakdown matters — the famous half of the company is not the half that earns the money.",
    },
    realScenario: {
      prompt:
        'Amazon reports another year of minimal free cash flow because of very heavy capital spending. When is this a red flag versus a strategy?',
      options: [
        'It is always a red flag — negative free cash flow means the business is failing',
        'It depends on whether the spending is building a durable advantage with a visible return',
        'It is always fine, since growth companies are supposed to spend heavily',
      ],
      answerIndex: 1,
      explanation:
        "Identical numbers, opposite meanings. Spending that builds a logistics or cloud advantage competitors cannot replicate is investment; spending that covers weakness is a countdown. You cannot tell which from the cash flow statement alone — you have to know what the money bought, which is why this is the hardest of the fundamental checks.",
    },
    mythVsReality: {
      statement: 'Amazon is primarily a retailer, so it should be valued like other retail companies.',
      isMyth: true,
      explanation:
        "Valuing it as a retailer misses where the profits actually come from. Most of the operating profit is cloud computing, with a large high-margin advertising business alongside it — three quite different economic engines that would each deserve a different multiple. This is the strongest argument in this chapter for always reading the segment breakdown before forming a view.",
    },
    connects: ['fundamentals', 'case-msft', 'valuation', 'what-you-own'],
    aiPrompt:
      "Break Amazon down by segment — retail, AWS, and advertising — with the revenue and operating income each contributes, and explain why the profit concentration is so different from the revenue concentration. Then explain how Amazon's years of deliberate reinvestment differ from a company losing money out of weakness, and what evidence distinguishes the two in the filings.",
    depth: 3,
  },
  {
    id: 'case-googl',
    chapter: 4,
    order: 5,
    category: 'company',
    tag: 'Case study',
    title: 'Alphabet',
    tagline: 'A near-perfect business facing the two scariest words in investing: what if.',
    marketId: 'googl',
    riskNote:
      "A case study, not a recommendation. Alphabet faces genuine, active legal proceedings whose outcomes are unknowable, alongside a real technological question about the future of search. Uncertainty this specific is exactly why no individual company belongs in money you need soon.",
    surface:
      "Alphabet sells advertising against search results and YouTube videos, which is close to a perfect business: people arrive already telling Google what they want to buy, and Google charges advertisers to be there at that moment. Google Cloud and a portfolio of long-shot bets sit alongside it. It is simultaneously one of the best business models ever built and the most interesting risk case among the six giants.",
    middle: [
      "The moat has two layers. The first is a data network effect: two decades of information about what people click makes results and ad targeting better, which attracts more users, which produces more data. The second is distribution — Google is the default search on nearly every browser and phone, some of it paid for and some of it owned outright through Android and Chrome. Defaults are extraordinarily powerful, because most people never change them.",
      "Against Meta, the comparison is instructive: Meta knows who you are, Google knows what you want right now, and the second is worth more at the moment of purchase. Alphabet also owns essentially the whole stack — the browser, the phone platform, the search index, the ad exchange, and increasingly its own AI chips — so it keeps margin that competitors have to pay away to someone else.",
      "And here is where two of the biggest questions in investing collide in one company. Courts in multiple jurisdictions have ruled against parts of the search and advertising businesses, and remedies could reach the default-search arrangements and the ad exchange. At the same time, AI chat may replace the search box that funds everything. Alphabet has strong AI models — that was never the concern. The concern is whether the new interface monetizes like the old one, and nobody knows.",
    ],
    deep: [
      "Take the regulatory risk seriously without catastrophizing it, which is genuinely hard. The distinction that matters is between a fine — painful, survivable, one-time — and a structural remedy that changes how the business operates, such as ending default-search payments or separating the advertising exchange. The first is an expense. The second changes the moat. Read what remedy is actually being imposed rather than the size of any headline number.",
      "The AI disruption question is subtler than 'chatbots replace Google.' Search advertising works because a search reveals commercial intent at the exact moment someone is ready to buy. An AI assistant that answers the question directly may satisfy the user while removing the moment where the ad goes. Alphabet is integrating AI into search precisely to defend this, and the honest position is that the economics of the new format are not yet established.",
      "The 'other bets' — Waymo most notably — are a genuine call option that valuation models handle badly. They consume cash today and could be enormously valuable or worth nothing. When something is that binary, the sensible approach is to value the core business on its own merits and treat the bets as upside you did not pay for, rather than building a thesis on them.",
      "What to actually watch: search advertising revenue growth, which is the single number that reveals whether AI is eating the core business; the specific substance of any antitrust remedy; Google Cloud's growth and margin; and traffic-acquisition costs, which show what Alphabet pays for the defaults it depends on.",
    ],
    scenario:
      "Two-Risk Rena wrote her thesis on Alphabet as a single sentence with two named threats attached — an adverse structural remedy, and search advertising growth turning negative — and set herself a reminder to check both every quarter. It meant she never had to decide anything in the middle of a frightening headline, because the headline either matched one of her two conditions or it did not. Headline Hal read every article about every ruling, felt something different each week, and traded four times in eighteen months on news that changed nothing about either question that actually mattered.",
    gutCheck: {
      prompt: 'Why is Google\'s search advertising business considered such a strong model?',
      options: [
        'Search ads are cheaper to produce than video ads',
        'A search reveals commercial intent at the exact moment someone is ready to buy',
        'Google has more users than any other website',
      ],
      answerIndex: 1,
      explanation:
        "Intent at the moment of purchase is what makes the inventory so valuable. Advertisers pay a premium to reach someone actively searching for what they sell — far more than for the same person browsing idly, which is why search advertising commands better economics than most other formats.",
    },
    realScenario: {
      prompt:
        'A court imposes a remedy ending Alphabet\'s payments to be the default search engine on major browsers and phones. Why might this matter more than a large fine?',
      options: [
        'Fines are always larger than the value of default placements',
        'A fine is a one-time expense, while losing default distribution attacks the moat itself',
        'It would not matter, since users would search Google anyway',
      ],
      answerIndex: 1,
      explanation:
        "This is the fine-versus-structural-remedy distinction. A fine is a survivable expense. Losing default placement changes the mechanism by which users arrive — and since most people never change a default, that is an attack on the moat rather than on the bank balance.",
    },
    mythVsReality: {
      statement: 'AI chatbots will obviously destroy Google Search, so Alphabet is finished.',
      isMyth: true,
      explanation:
        "It is a real risk stated with false certainty. Alphabet has among the strongest AI capabilities anywhere and is integrating them directly into search; the genuine open question is whether the new format monetizes as well as the old one, not whether Alphabet can build the technology. Confident predictions of the collapse of dominant businesses have a long history of arriving years early or not at all — which is not a reason to dismiss the risk, only to hold it as a question rather than a conclusion.",
    },
    connects: ['moat', 'case-aapl', 'red-flags', 'when-to-sell'],
    aiPrompt:
      "Explain Alphabet's revenue segments and why search advertising is such a strong business model. Then give me the two bear cases separately and in detail: the specific antitrust rulings and what structural remedies are actually on the table, and the argument that AI assistants could erode search monetization. For each, tell me what observable evidence would show it is actually happening.",
    depth: 3,
  },
  {
    id: 'case-avgo',
    chapter: 4,
    order: 6,
    category: 'company',
    tag: 'Case study',
    title: 'Broadcom',
    tagline: 'The trillion-dollar company most people cannot name.',
    marketId: 'avgo',
    riskNote:
      "A case study, not a recommendation. Broadcom carries substantial debt from acquisitions and has severe customer concentration even by semiconductor standards — a combination that magnifies both good and bad outcomes. Not a suitable place for money you cannot afford to see fall sharply.",
    surface:
      "Broadcom is the least famous member of this group and among the largest companies on Earth, which is itself worth sitting with. It runs two engines: it co-designs custom AI accelerators and networking chips for a small number of enormous cloud customers, and it owns a portfolio of unglamorous enterprise software bought outright, run for cash, and priced firmly. It is a different animal from the other five, and understanding how is the point of this lesson.",
    middle: [
      "The reason this lesson exists: it is the clearest available proof that the biggest companies are not always the household names. Broadcom is roughly as valuable as companies you could describe in your sleep, and most people have never knowingly used one of its products. If your process for finding investments is 'companies I have heard of,' this is the size of what that process misses.",
      "It is also the cleanest example in this chapter of 'not the same bet.' NVIDIA sells everyone the same class of chip. Broadcom co-designs a specific chip for one customer trying to depend less on NVIDIA — which means it can win precisely when NVIDIA loses share. Two companies described identically in headlines as 'AI chip stocks' can have genuinely opposed exposures, and only reading the business model reveals it.",
      "The software half deserves attention because the playbook is unusual and openly stated: acquire established enterprise software that large companies depend on, cut costs hard, raise prices firmly, and run it for cash. It is not beloved by customers. It is extremely effective, and it supplies steady cash that a pure chip designer riding a cycle does not have.",
    ],
    deep: [
      "Customer concentration is the central risk and it is severe even by the standards of an industry known for it. A small number of buyers, each perfectly capable of changing design partners or slowing its build-out, drives much of the AI revenue. Concentration is a risk you should be paid for — the question is always whether the price reflects it, and in enthusiastic markets it frequently does not.",
      "The debt is the second half of the risk and it is structural rather than incidental. The whole strategy runs on debt-funded acquisitions, which works beautifully while borrowing is manageable and cash flows are strong, and becomes fragile when either changes. This is the leverage lesson from Chapter 3 applied to a real balance sheet: check interest expense against operating income, and remember that debt makes good years better and bad years dangerous.",
      "There is a genuine question about how long the acquisition playbook can continue. Each deal has to be larger than the last to move a company this size, the supply of suitable targets is finite, and aggressive post-acquisition price increases invite customer revolt and regulatory attention. A strategy that has worked for a decade is not the same as one that can run for another.",
      "What to actually watch: AI revenue growth against the disclosed order backlog (the backlog is the tell, since it reflects commitments rather than hopes), the debt load after the most recent acquisition, software segment margins, and any disclosure about customer concentration. What to ignore: comparisons to NVIDIA that treat them as the same trade.",
    ],
    scenario:
      "Backlog Bianca read Broadcom's annual report specifically to find out who the customers were and what they had actually committed to, and came away understanding that she was buying a small number of relationships rather than a broad market position — which was fine, as long as she sized it accordingly and watched the backlog every quarter. AI-Basket Andre bought Broadcom alongside NVIDIA and three others as 'AI exposure,' believing he was diversified. He was not: he owned one theme five times, and two of those positions were partly bets against each other.",
    gutCheck: {
      prompt: 'How does Broadcom\'s AI chip business differ fundamentally from NVIDIA\'s?',
      options: [
        'Broadcom sells the same general-purpose AI chips at lower prices',
        'Broadcom co-designs custom chips for specific large customers, often those seeking alternatives to NVIDIA',
        'Broadcom only makes networking equipment, not chips',
      ],
      answerIndex: 1,
      explanation:
        "Custom co-design for individual customers is a different business from selling a standard product to everyone. It means Broadcom can gain exactly when NVIDIA loses share at a large customer — so despite the shared 'AI chip' label, their exposures are partly opposed.",
    },
    realScenario: {
      prompt:
        'You own NVIDIA, Broadcom, and three other AI-related companies, and consider yourself diversified. What is the flaw in that reasoning?',
      options: [
        'Nothing — five companies is reasonable diversification',
        'They mostly depend on the same AI capital-spending cycle, so it is one bet held five ways',
        'Owning five positions is too many to research properly',
      ],
      answerIndex: 1,
      explanation:
        "Diversification is about exposures, not the number of tickers. Five companies whose fortunes all depend on the same customers continuing to spend on the same build-out will fall together if that spending slows — which is the moment diversification was supposed to help.",
    },
    mythVsReality: {
      statement: 'Broadcom and NVIDIA are basically the same investment — both are just AI chip companies.',
      isMyth: true,
      explanation:
        "The label hides more than it reveals. NVIDIA sells a standard product broadly and depends on a software ecosystem; Broadcom co-designs bespoke chips for a handful of customers explicitly trying to reduce their NVIDIA dependence, and earns much of its cash from acquired enterprise software. They share exposure to the same spending cycle and are otherwise quite different businesses — one of the better arguments for reading the business model instead of the sector tag.",
    },
    connects: ['case-nvda', 'red-flags', 'fundamentals', 'moat'],
    aiPrompt:
      "Explain Broadcom's two business segments — custom AI silicon and infrastructure software — and how its acquisition-driven strategy actually works. Then assess the risks properly: customer concentration in the AI business, the debt taken on for acquisitions measured against operating income, and whether the acquire-and-optimize playbook can continue at this scale.",
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
  { id: 'biases', label: 'Cognitive Biases & Decision Making' },
  { id: 'economy', label: 'How the Economy Actually Works' },
  { id: 'entrepreneurship', label: 'Entrepreneurship Fundamentals' },
  { id: 'ai-tech', label: 'AI & Technology' },
]

export const CATEGORY_META: Record<LessonCategory, { label: string; color: string }> = {
  index: { label: 'Indices', color: '#38bdf8' },
  'stock-picking': { label: 'Stock Picking', color: '#e879f9' },
  execution: { label: 'Placing Orders', color: '#94a3b8' },
  company: { label: 'Case Studies', color: '#818cf8' },
  volatility: { label: 'Volatility', color: '#fbbf24' },
  crypto: { label: 'Crypto', color: '#a78bfa' },
  'chart-literacy': { label: 'Chart Literacy', color: '#2dd4a7' },
  foundations: { label: 'Foundations', color: '#f472b6' },
  commodity: { label: 'Commodities', color: '#fb923c' },
  currency: { label: 'Currencies', color: '#34d399' },
  rates: { label: 'Bonds & Rates', color: '#22d3ee' },
}
