// Reference data for the Micro tab: how orders actually work, what separates a
// good business from a bad one, and a profile of each of the six largest S&P
// 500 companies.
//
// Nothing in here is a price or a valuation — those go stale in a day and the
// dashboard's honesty rules keep numbers to what the Worker actually fetched.
// What lives here is the durable half: mechanics, questions worth asking, and
// business models that change over years, not sessions.

// ---------------------------------------------------------------------------
// Order types
// ---------------------------------------------------------------------------

export type OrderKind = 'market' | 'limit' | 'stop' | 'stop-limit' | 'trailing-stop'

export interface OrderType {
  kind: OrderKind
  label: string
  /** One-line mechanical definition. */
  what: string
  /** Why you'd reach for it. */
  useWhen: string
  /** The way it bites people. Every order type has one. */
  catch: string
  /** Which inputs the order ticket needs beyond quantity. */
  inputs: Array<'limitPrice' | 'stopPrice' | 'trailPercent'>
  /** Which side this order type is normally used on, for the simulator's default. */
  typicalSide: 'buy' | 'sell'
}

export const ORDER_TYPES: OrderType[] = [
  {
    kind: 'market',
    label: 'Market',
    what: 'Buy or sell right now, at whatever the next available price happens to be.',
    useWhen:
      'You care much more about the trade happening than about the exact price — a large, heavily traded stock during normal market hours, where the gap between the buy and sell price is pennies.',
    catch:
      'You are agreeing to a price you have not seen yet. On a thinly traded stock, at the open, or on a news-driven morning, "whatever the next price is" can be meaningfully worse than the number on your screen. That gap is called slippage.',
    inputs: [],
    typicalSide: 'buy',
  },
  {
    kind: 'limit',
    label: 'Limit',
    what: 'Buy at no more than a price you name, or sell at no less than it. The price is guaranteed; the trade is not.',
    useWhen:
      'You have a price in mind and you are willing to wait. It is the default professional habit: name your price, let the market come to you, and never get filled somewhere you did not intend.',
    catch:
      'It can simply never execute. If you set a buy limit a few percent below the market and the stock walks away upward, you spend the next year watching a company you wanted to own get more expensive because you were trying to save forty cents.',
    inputs: ['limitPrice'],
    typicalSide: 'buy',
  },
  {
    kind: 'stop',
    label: 'Stop (stop-loss)',
    what: 'A sleeping market order. Nothing happens until the price crosses your stop level — then it wakes up and sells at whatever the next price is.',
    useWhen:
      'You want a floor under a position you cannot watch all day, and you would genuinely rather be out than ride it further down.',
    catch:
      'Two of them. First, it becomes a market order when triggered, so in a fast drop you can be filled well below your stop. Second, ordinary volatility triggers it constantly — a stop 5% down on a stock that routinely swings 5% is not protection, it is a scheduled exit at the worst possible moment.',
    inputs: ['stopPrice'],
    typicalSide: 'sell',
  },
  {
    kind: 'stop-limit',
    label: 'Stop-limit',
    what: 'Two prices. The stop wakes the order up; the limit then refuses to trade worse than your second number.',
    useWhen:
      'You want a stop, but you refuse to be dumped out at a panic price. It puts a floor under how bad your exit can be.',
    catch:
      'The exact scenario you were protecting against is the one that defeats it. In a genuine collapse the price crashes straight through both numbers, your limit never gets hit, and you are left holding the whole decline with an unfilled order — the worst of both worlds.',
    inputs: ['stopPrice', 'limitPrice'],
    typicalSide: 'sell',
  },
  {
    kind: 'trailing-stop',
    label: 'Trailing stop',
    what: 'A stop that follows the price up and never moves back down. Set 10%, and it sits 10% below the highest price reached since you placed it.',
    useWhen:
      'A position has run up and you want to protect the gain without capping it — the stop ratchets higher as the stock climbs, then holds still when it falls.',
    catch:
      'The percentage is doing all the work, and most people pick it out of the air. Too tight and normal noise ejects you from a stock still trending up; too loose and it gives back most of the gain before it fires. It also triggers on price alone, which knows nothing about whether the business changed.',
    inputs: ['trailPercent'],
    typicalSide: 'sell',
  },
]

export const ORDER_TYPE_BY_KIND: Record<OrderKind, OrderType> = Object.fromEntries(
  ORDER_TYPES.map((o) => [o.kind, o]),
) as Record<OrderKind, OrderType>

/** How long an order stays alive — the setting nobody reads until it surprises them. */
export const ORDER_DURATIONS: Array<{ label: string; body: string }> = [
  {
    label: 'Good for day',
    body: 'Expires at the closing bell if it has not filled. The default on most apps, and the reason a limit order you set on Monday is quietly gone on Tuesday.',
  },
  {
    label: 'Good till canceled (GTC)',
    body: 'Stays alive for months unless you kill it. Powerful and easy to forget — a stale GTC buy from a year ago can fire during a crash you have entirely changed your mind about.',
  },
  {
    label: 'Extended hours',
    body: 'Trading before the open or after the close. Far fewer buyers and sellers, so the gap between bid and ask widens and prices jump. Limit orders are effectively mandatory here; market orders are how people get filled at absurd prices.',
  },
]

// ---------------------------------------------------------------------------
// The flag checklist — what a reader ticks off about any stock they're studying
// ---------------------------------------------------------------------------

export interface Flag {
  id: string
  /** Short label for the checkbox row. */
  label: string
  /** The plain-English test — how you'd actually check it. */
  test: string
  /** Where the number lives, so this is checkable and not just vibes. */
  where: string
}

export const GREEN_FLAGS: Flag[] = [
  {
    id: 'revenue-growth',
    label: 'Revenue is growing, consistently',
    test:
      'Sales higher than the same quarter a year ago, and higher the year before that. Not one great quarter — a direction. A business shrinking its sales cannot cut its way to greatness for long.',
    where: 'Income statement, top line. Compare year-over-year, never to last quarter, because most businesses have seasons.',
  },
  {
    id: 'margins',
    label: 'It keeps a real slice of every dollar',
    test:
      'Gross margin tells you whether the product itself is valuable; operating margin tells you whether the company is disciplined about everything else. Stable or rising beats high-and-falling.',
    where: 'Income statement: gross profit ÷ revenue, then operating income ÷ revenue.',
  },
  {
    id: 'free-cash-flow',
    label: 'It generates actual cash',
    test:
      'Free cash flow is the money left after running and maintaining the business. Profit is an opinion assembled by accountants; cash is a fact. A company reporting profits while burning cash deserves a very hard look.',
    where: 'Cash flow statement: operating cash flow minus capital expenditures.',
  },
  {
    id: 'roic',
    label: 'It earns well on the money it invests',
    test:
      'Return on invested capital asks the only question that matters long term: when this company spends a dollar, how much does it earn back? Consistently high ROIC is the numerical fingerprint of a moat.',
    where: 'Screeners list it directly. Compare it to rivals, not to some universal threshold.',
  },
  {
    id: 'balance-sheet',
    label: 'The balance sheet can survive a bad year',
    test:
      'Enough cash and enough earnings to cover its debt payments comfortably. Debt is not evil — it is a magnifier. It makes good years better and bad years fatal.',
    where: 'Balance sheet: cash and total debt. Then net debt ÷ EBITDA, or interest expense against operating income.',
  },
  {
    id: 'share-count',
    label: 'The share count is flat or shrinking',
    test:
      'If the company keeps issuing new shares, your slice of it gets smaller every year even when the business grows. Buybacks do the reverse. Check the count over five years, not one.',
    where: 'Shares outstanding, on the balance sheet or any five-year financial summary.',
  },
  {
    id: 'moat',
    label: 'You can name the moat out loud',
    test:
      'In one sentence: why can a well-funded competitor not simply copy this? Switching costs, network effects, brand, scale, patents, regulation. If you cannot finish the sentence, you have not found the moat — you have found a good recent quarter.',
    where: 'Not a number. The annual report\'s competition section, plus honest thinking.',
  },
  {
    id: 'management',
    label: 'Management tells you the truth',
    test:
      'Read last year\'s shareholder letter against what actually happened. Did they name their own mistakes? Did the promises land? Candor about failure is the cheapest reliable signal of a trustworthy operator.',
    where: 'Annual shareholder letter and earnings-call transcripts, one year back.',
  },
]

export const RED_FLAGS: Flag[] = [
  {
    id: 'story-only',
    label: 'The whole case is a story about the future',
    test:
      'Enormous addressable market, revolutionary technology, no revenue worth mentioning. Stories are not worthless — but a story with no numbers attached is a lottery ticket, and it should be sized like one.',
    where: 'Look for the actual revenue line. If you cannot find it, that is the finding.',
  },
  {
    id: 'dilution',
    label: 'Share count climbs every single year',
    test:
      'Persistent new share issuance means the company funds itself by selling pieces of your ownership. Sometimes necessary; always a cost. Growth in revenue that does not outpace growth in shares is not growth for you.',
    where: 'Shares outstanding over five years. A steady upward staircase is the tell.',
  },
  {
    id: 'debt-spiral',
    label: 'Debt is growing faster than earnings',
    test:
      'Borrowing to cover operations rather than to build something is how a slow problem becomes a sudden one. Rising rates turn a manageable debt load into an emergency without the business changing at all.',
    where: 'Total debt trend against operating income trend. Both are on the same five-year summary.',
  },
  {
    id: 'one-customer',
    label: 'A few customers are most of the revenue',
    test:
      'If one buyer is a quarter of sales, that buyer effectively sets your prices and can end your growth story with a single internal decision. Concentration is not disqualifying — it is a risk you must be paid for.',
    where: 'The annual report names material customers. The risk-factors section is where companies confess.',
  },
  {
    id: 'accounting-fog',
    label: 'You cannot understand how it makes money',
    test:
      'If three careful readings of the annual report still leave the business model foggy, that is information. Complexity is sometimes a moat and sometimes a hiding place, and you cannot tell which from outside.',
    where: 'The annual report. If the plain-English summary does not exist, be suspicious.',
  },
  {
    id: 'adjusted-everything',
    label: 'Every number is "adjusted"',
    test:
      'Companies are allowed to present their own tidied-up figures. When adjusted profit is always large and actual profit is always negative, and the difference is always "one-time," the exceptions have become the business.',
    where: 'Compare the press-release headline number to the audited figure in the filing.',
  },
  {
    id: 'insider-selling',
    label: 'Insiders are heading for the exit',
    test:
      'Executives sell for a hundred innocent reasons — houses, taxes, diversification. But several insiders selling heavily and simultaneously, with no scheduled plan behind it, is worth pausing on.',
    where: 'Insider-transaction filings, summarized free on most finance sites.',
  },
  {
    id: 'hype-source',
    label: 'You heard about it from someone with a position',
    test:
      'The person posting the rocket emoji already owns it and profits when you buy. This is not a fact about the company — it is a fact about your information, and it is the most common reason young investors lose money.',
    where: 'Ask where the idea came from. Honestly.',
  },
]

// ---------------------------------------------------------------------------
// The six giants
// ---------------------------------------------------------------------------

export interface CompanyProfile {
  /** Matches the MARKET_SYMBOLS id. */
  id: string
  symbol: string
  name: string
  /** Sector label for the chip. */
  sector: string
  /** How it makes money, in one sentence a 12-year-old could follow. */
  engine: string
  /** The moat, named specifically. */
  moat: string
  moatKind: string
  /** Closest rivals and the honest reason this one leads them. */
  peers: string
  vsPeers: string
  /** What would actually break the thesis. */
  risk: string
  /** The single line to hunt for in the next earnings report. */
  watchNext: string
  /** Accent color for the profile card, drawn from the existing palette. */
  color: string
}

export const COMPANY_PROFILES: CompanyProfile[] = [
  {
    id: 'nvda',
    symbol: 'NVDA',
    name: 'NVIDIA',
    sector: 'Semiconductors',
    engine:
      'Designs the chips that AI models are trained and run on, and sells them to every company racing to build AI — then sells them the networking gear to wire thousands of those chips together.',
    moat:
      'CUDA, the software layer developers have written AI code against for nearly two decades. A rival can match the silicon and still lose, because the world\'s AI code assumes NVIDIA. Rewriting it is expensive, slow, and nobody\'s favorite project.',
    moatKind: 'Ecosystem lock-in',
    peers: 'AMD, Intel, and the custom chips Google, Amazon, and Broadcom design in-house.',
    vsPeers:
      'AMD ships credible hardware and still trails badly, which tells you the contest was never only about the chip. NVIDIA also sells whole systems — chips, networking, and software as one — so it captures more of each data center\'s budget than a component supplier can. Its real competition is not AMD; it is its own biggest customers building replacements.',
    risk:
      'It is a supplier to a capital-spending boom, and capital spending is cyclical. A handful of enormous customers are much of its revenue, every one of them openly funding an in-house alternative. If AI infrastructure spending merely slows, a company priced for scarcity meets a market with enough chips.',
    watchNext:
      'Data-center revenue growth rate, not the total. And any hint about how much of it comes from the top few customers.',
    color: '#2dd4a7',
  },
  {
    id: 'aapl',
    symbol: 'AAPL',
    name: 'Apple',
    sector: 'Consumer technology',
    engine:
      'Sells iPhones, Macs, and watches at unusually high margins for hardware, then earns a recurring cut of the two billion devices already out there through the App Store, iCloud, and subscriptions.',
    moat:
      'Switching costs disguised as taste. Your photos, messages, purchases, and muscle memory live inside the ecosystem, and the family group chat turns green if you leave. Apple charges a premium because the exit is annoying, not because the metal is better.',
    moatKind: 'Brand + switching costs',
    peers: 'Samsung and the Android manufacturers on hardware; Spotify, Google, and every subscription service on Services.',
    vsPeers:
      'Android outsells iPhone worldwide and earns a fraction of the industry profit, which is the whole lesson: market share and profit share are different games. Apple takes the premium end of the market and the recurring revenue attached to it, so it converts fewer units into far more money.',
    risk:
      'Two clocks are running. Regulators in several countries are prying open the App Store, which threatens the highest-margin revenue Apple has. And Apple has been slower and quieter on AI than its peers — if the phone stops being the place people interact with computers, the ecosystem\'s gravity weakens.',
    watchNext:
      'Services revenue growth, and any regulatory ruling on App Store commissions. Unit sales matter far less than either.',
    color: '#94a3b8',
  },
  {
    id: 'msft',
    symbol: 'MSFT',
    name: 'Microsoft',
    sector: 'Enterprise software & cloud',
    engine:
      'Rents software and computing power to businesses on multi-year contracts: Office and Windows, Azure cloud infrastructure, and AI features bolted onto both at an extra price per seat.',
    moat:
      'It is wired into how companies operate. Email, files, identity, security, and servers all run through Microsoft, and untangling that is a project measured in years and consultants. Nobody gets promoted for migrating off Microsoft.',
    moatKind: 'Switching costs at enterprise scale',
    peers: 'Amazon\'s AWS and Google Cloud in infrastructure; Google Workspace, Salesforce, and Oracle in software.',
    vsPeers:
      'AWS is bigger in raw cloud, but Microsoft arrives already inside the building — it can sell Azure to a company that has run Office and Windows for twenty years, which is a far shorter conversation than a competitor\'s. That bundling advantage is why its cloud has grown from a distant second place rather than stalling there.',
    risk:
      'AI is expensive in a new way. Microsoft is spending enormous sums on data centers on the belief customers will pay for AI features, and the payback is a promise, not yet a pattern. Being deeply embedded also makes it a permanent antitrust target.',
    watchNext:
      'Azure growth rate, and capital expenditure — the gap between what it spends on AI and what it earns from AI is the whole debate.',
    color: '#38bdf8',
  },
  {
    id: 'amzn',
    symbol: 'AMZN',
    name: 'Amazon',
    sector: 'Retail & cloud',
    engine:
      'A colossal retail operation that earns thin margins on enormous volume, plus advertising sold against shopping searches — and AWS, the cloud business that quietly supplies most of the operating profit.',
    moat:
      'A logistics network nobody can rebuild: warehouses, trucks, and delivery routes that make same-day shipping profitable at a scale competitors cannot match. Prime makes leaving feel like a downgrade. AWS adds its own switching costs on top.',
    moatKind: 'Scale economics + switching costs',
    peers: 'Walmart, Target, and Shopify\'s merchants in retail; Microsoft and Google in cloud.',
    vsPeers:
      'Walmart is a fierce retail competitor and closing the gap online — but Walmart has no AWS. Amazon can price retail aggressively for years because a different division pays the bills. That cross-subsidy is a structural advantage a pure retailer cannot answer.',
    risk:
      'The profit is concentrated where the competition is fiercest: if AWS growth slows while Microsoft and Google keep gaining, retail\'s thin margins cannot absorb it. Amazon also spends colossally and continuously, which means free cash flow can vanish for stretches by choice.',
    watchNext:
      'AWS growth and AWS operating margin. Retail revenue is the headline; AWS is the earnings.',
    color: '#fbbf24',
  },
  {
    id: 'googl',
    symbol: 'GOOGL',
    name: 'Alphabet',
    sector: 'Advertising & cloud',
    engine:
      'Sells advertising against search results and YouTube videos — a near-perfect business, since people arrive already telling Google what they want to buy. Google Cloud and a portfolio of long-shot bets sit alongside it.',
    moat:
      'Two decades of data on what people click, which makes its results and ad targeting better, which attracts more users and more data. Plus distribution: Google is the default search on nearly every browser and phone, some of it paid for, some of it owned outright through Android and Chrome.',
    moatKind: 'Data network effect + default distribution',
    peers: 'Meta and Amazon for advertising dollars; Microsoft and Amazon in cloud; AI chat assistants for search itself.',
    vsPeers:
      'Meta knows who you are; Google knows what you want right now, which is worth more at the moment of purchase. And unlike its rivals, Alphabet owns the whole stack — the browser, the phone platform, the search index, the ad exchange, and its own AI chips — so it keeps margin others pay away.',
    risk:
      'The most interesting risk in the market: courts in multiple countries have ruled against parts of its search and ad businesses, and remedies could reach the default-search deals and the ad exchange. Meanwhile AI chat may replace the search box that funds everything — Alphabet has strong AI models, but no guarantee the new interface monetizes like the old one.',
    watchNext:
      'Search advertising revenue growth — the number that tells you whether AI is eating the core business — and the substance of any antitrust remedy.',
    color: '#f472b6',
  },
  {
    id: 'avgo',
    symbol: 'AVGO',
    name: 'Broadcom',
    sector: 'Semiconductors & infrastructure software',
    engine:
      'Two engines. It designs custom AI accelerators and networking chips for a small number of enormous cloud customers, and it owns a portfolio of unglamorous enterprise software bought outright, run for cash, and priced firmly.',
    moat:
      'Deep co-design relationships: when a cloud giant builds a custom chip with Broadcom, that partnership spans years of engineering and is not casually re-bid. The software half\'s moat is simpler — the products are load-bearing inside big companies and switching is worse than paying.',
    moatKind: 'Design partnership + entrenched software',
    peers: 'Marvell in custom silicon, NVIDIA in AI infrastructure, Qualcomm and Texas Instruments in chips, and legacy enterprise vendors in software.',
    vsPeers:
      'This is the "not the same bet" case. NVIDIA sells everyone the same class of chip; Broadcom co-designs a specific chip for one customer trying to depend less on NVIDIA — so it can win precisely when NVIDIA loses share. The acquired software then supplies steady cash that a pure chip designer, riding a cycle, does not have.',
    risk:
      'Customer concentration is severe even by chip-industry standards — a few buyers, each perfectly capable of changing partners or slowing its build-out. The strategy also runs on debt-funded acquisitions and aggressive price increases at the companies it buys, which works until an acquisition is too expensive or customers revolt.',
    watchNext:
      'AI revenue growth against the disclosed order backlog, and the debt load after the most recent acquisition.',
    color: '#a78bfa',
  },
]

export const PROFILE_BY_ID: Record<string, CompanyProfile> = Object.fromEntries(
  COMPANY_PROFILES.map((p) => [p.id, p]),
)

// ---------------------------------------------------------------------------
// Research prompt builder
// ---------------------------------------------------------------------------

export interface PromptSection {
  id: string
  label: string
  /** Short description shown next to the toggle. */
  hint: string
  /** Rendered into the prompt. `{{TICKER}}` and `{{NAME}}` are substituted. */
  text: string
  /** On by default — the sections that make the prompt useful even untouched. */
  defaultOn: boolean
}

export const PROMPT_SECTIONS: PromptSection[] = [
  {
    id: 'business',
    label: 'The business',
    hint: 'How the money is actually made',
    text: 'Explain how {{NAME}} ({{TICKER}}) actually makes money, broken down by segment with the rough share of revenue and profit each one contributes. Tell me which segment a casual observer would wrongly assume is the important one.',
    defaultOn: true,
  },
  {
    id: 'fundamentals',
    label: 'Fundamentals',
    hint: 'Growth, margins, cash, debt, dilution',
    text: 'Walk me through the fundamentals over the last five years: revenue growth, gross and operating margin, free cash flow, return on invested capital, debt relative to earnings, and the change in share count. Point out which of those trends is improving and which is quietly deteriorating.',
    defaultOn: true,
  },
  {
    id: 'moat',
    label: 'The moat',
    hint: 'Why a rival cannot just copy it',
    text: 'Name the competitive moat in one sentence, then stress-test it: what specifically stops a well-funded competitor from copying this business, and what evidence in the financials supports or undermines that claim?',
    defaultOn: true,
  },
  {
    id: 'peers',
    label: 'Versus its peers',
    hint: 'Side by side with real rivals',
    text: 'Compare {{TICKER}} to its two or three closest competitors on growth, margins, and moat. Be direct about where a rival is genuinely better, and explain what would have to happen for that rival to take share.',
    defaultOn: true,
  },
  {
    id: 'valuation',
    label: 'Valuation',
    hint: 'What the price already assumes',
    text: 'Explain what the current valuation implies about future growth — what does the market already expect from this company? Compare its multiples to its own history and to its peers, and tell me what would have to go right to justify the price rather than whether it is cheap.',
    defaultOn: true,
  },
  {
    id: 'bear',
    label: 'The bear case',
    hint: 'The strongest argument against',
    text: 'Make the strongest possible bear case against {{TICKER}} — the argument a smart, well-informed short seller would make. Do not soften it, and do not follow it with reassurance. Then separately list the three specific, observable things that would prove the bear case is playing out.',
    defaultOn: true,
  },
  {
    id: 'risks',
    label: 'Risks & red flags',
    hint: 'Concentration, regulation, accounting',
    text: 'List the real risks: customer or product concentration, regulatory and legal exposure, key-person dependence, and anything unusual in how the company presents its numbers. Tell me which risks are already widely discussed and which are underappreciated.',
    defaultOn: false,
  },
  {
    id: 'management',
    label: 'Management',
    hint: 'Track record and candor',
    text: 'Assess management: how long has the current leadership been in place, what did they promise three years ago, and what actually happened? Quote anything from a shareholder letter where they admitted a mistake, or note if you cannot find one.',
    defaultOn: false,
  },
  {
    id: 'earnings',
    label: 'Next earnings',
    hint: 'The lines that will matter',
    text: 'Tell me the three specific line items or metrics to watch in {{TICKER}}\'s next earnings report, why each one matters more than the headline earnings number, and what result would count as genuinely good or bad rather than merely above or below expectations.',
    defaultOn: false,
  },
  {
    id: 'thesis',
    label: 'Write my thesis',
    hint: 'Four sentences I can check later',
    text: 'Finally, draft a four-sentence investment thesis I could write down and check in two years: what this company does, why it should win, what would prove me wrong, and roughly how long the story needs to play out.',
    defaultOn: true,
  },
]

/** Fixed framing wrapped around whichever sections are selected. */
export const PROMPT_PREAMBLE =
  'I am learning how to analyze a company and I want to think clearly, not be sold. Teach me about {{NAME}} ({{TICKER}}) by working through the sections below. Use real, current figures and say where each one comes from. Flag anything you are unsure about or cannot verify instead of filling the gap. Where a number matters, show me how you got it so I can check it myself.'

export const PROMPT_CLOSER =
  'Rules for your answer: do not tell me whether to buy or sell — I am not asking for advice, I am asking to understand the business. Write in plain English and define any term a first-year student would not know. Where reasonable people disagree, give me both sides and say which evidence would settle it. End with the two questions I should be asking that I did not think to ask here.'

export function buildResearchPrompt(
  company: { symbol: string; name: string },
  sectionIds: string[],
): string {
  // For a typed-in ticker we have no company name, so name === symbol and the
  // template's "Name (TICKER)" would read "COST (COST)". Collapse the repeat.
  const fill = (s: string) =>
    s
      .replace(/\{\{TICKER\}\}/g, company.symbol)
      .replace(/\{\{NAME\}\}/g, company.name)
      .replace(/(\S+) \(\1\)/g, '$1')
  const chosen = PROMPT_SECTIONS.filter((s) => sectionIds.includes(s.id))
  const numbered = chosen.map((s, i) => `${i + 1}. ${s.label} — ${fill(s.text)}`)
  return [fill(PROMPT_PREAMBLE), '', ...numbered, '', fill(PROMPT_CLOSER)].join('\n')
}
