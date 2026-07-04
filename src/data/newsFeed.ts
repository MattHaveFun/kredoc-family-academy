// "What the pros are saying" — headline snippets from public financial RSS
// feeds. The feeds send no CORS headers, so requests route through a public
// relay (same approach the site used previously for market data). Results are
// cached in localStorage for 30 minutes; if every feed is unreachable, a
// static set of evergreen source links keeps the panel honest instead of
// blank.
export interface NewsSnippet {
  source: string
  sourceInitial: string // rendered as the "logo" monogram
  title: string
  summary: string
  link: string
}

interface FeedSource {
  source: string
  sourceInitial: string
  url: string
  homepage: string
}

const FEED_SOURCES: FeedSource[] = [
  {
    source: 'WSJ Markets',
    sourceInitial: 'W',
    url: 'https://feeds.content.dowjones.io/public/rss/RSSMarketsMain',
    homepage: 'https://www.wsj.com/news/markets',
  },
  {
    source: 'MarketWatch',
    sourceInitial: 'M',
    url: 'https://feeds.content.dowjones.io/public/rss/mw_topstories',
    homepage: 'https://www.marketwatch.com',
  },
  {
    source: 'CNBC Markets',
    sourceInitial: 'C',
    url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=20910258',
    homepage: 'https://www.cnbc.com/markets/',
  },
]

const CORS_RELAY = (target: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(target)}`
const NEWS_CACHE_KEY = 'kredoc.news.v1'
const NEWS_TTL_MS = 30 * 60 * 1000
const FETCH_TIMEOUT_MS = 8_000

// Shown when every feed is unreachable — honest pointers, not fake news.
const FALLBACK_SNIPPETS: NewsSnippet[] = FEED_SOURCES.map((f) => ({
  source: f.source,
  sourceInitial: f.sourceInitial,
  title: `${f.source} — latest market coverage`,
  summary: 'Headlines are unreachable right now. Tap through to read what the pros are covering directly at the source.',
  link: f.homepage,
}))

function stripHtml(text: string): string {
  const doc = new DOMParser().parseFromString(text, 'text/html')
  return (doc.body.textContent ?? '').replace(/\s+/g, ' ').trim()
}

async function fetchFeed(feed: FeedSource): Promise<NewsSnippet | null> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const res = await fetch(CORS_RELAY(feed.url), { signal: controller.signal })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const xml = new DOMParser().parseFromString(await res.text(), 'text/xml')
    const item = xml.querySelector('item')
    if (!item) return null
    const title = item.querySelector('title')?.textContent?.trim()
    const link = item.querySelector('link')?.textContent?.trim() ?? feed.homepage
    const rawDescription = item.querySelector('description')?.textContent ?? ''
    if (!title) return null
    const summary = stripHtml(rawDescription).slice(0, 220) || 'Read the full story at the source.'
    return { source: feed.source, sourceInitial: feed.sourceInitial, title, summary, link }
  } catch (err) {
    console.error(`[news] ${feed.source} unreachable:`, err instanceof Error ? err.message : err)
    return null
  } finally {
    clearTimeout(timeout)
  }
}

export interface NewsResult {
  snippets: NewsSnippet[]
  live: boolean
  fetchedAt: number | null
}

// De-dupes concurrent calls (e.g. React StrictMode double-mount) so the CORS
// relay isn't hit twice for the same refresh.
let inflight: Promise<NewsResult> | null = null

export function getNewsSnippets(): Promise<NewsResult> {
  if (!inflight) {
    inflight = fetchNewsSnippets().finally(() => {
      inflight = null
    })
  }
  return inflight
}

async function fetchNewsSnippets(): Promise<NewsResult> {
  try {
    const raw = localStorage.getItem(NEWS_CACHE_KEY)
    if (raw) {
      const cached = JSON.parse(raw) as { fetchedAt: number; snippets: NewsSnippet[] }
      if (Date.now() - cached.fetchedAt < NEWS_TTL_MS && cached.snippets.length > 0) {
        return { snippets: cached.snippets, live: true, fetchedAt: cached.fetchedAt }
      }
    }
  } catch {
    // ignore unreadable cache
  }

  const results = await Promise.all(FEED_SOURCES.map(fetchFeed))
  const snippets = results.filter((s): s is NewsSnippet => s !== null)

  if (snippets.length === 0) {
    return { snippets: FALLBACK_SNIPPETS, live: false, fetchedAt: null }
  }

  // Pad with fallbacks so the panel always shows 3 sources.
  for (const fallback of FALLBACK_SNIPPETS) {
    if (snippets.length >= 3) break
    if (!snippets.some((s) => s.source === fallback.source)) snippets.push(fallback)
  }

  const fetchedAt = Date.now()
  try {
    localStorage.setItem(NEWS_CACHE_KEY, JSON.stringify({ fetchedAt, snippets }))
  } catch {
    // storage full — fine, just uncached
  }
  return { snippets, live: true, fetchedAt }
}
