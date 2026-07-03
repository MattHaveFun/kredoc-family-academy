// "What it actually means" — a client-side AI-written plain-English read on
// the day's market action. Only active when the site owner supplies
// VITE_OPENAI_API_KEY (which, being VITE_-prefixed, ships in the client
// bundle: use a restricted, low-spend-limit key ONLY, or leave it unset and
// the panel explains itself with a placeholder). The narrative is cached in
// localStorage for the calendar day so a family refreshing the dashboard
// doesn't re-bill the key.
const OPENAI_KEY: string = import.meta.env.VITE_OPENAI_API_KEY ?? ''
const NARRATIVE_CACHE_KEY = 'kredoc.narrative.v1'
const OPENAI_TIMEOUT_MS = 20_000

export interface MarketSummaryInput {
  label: string // e.g. "S&P 500"
  changePct: number
}

export interface NarrativeResult {
  text: string | null
  state: 'ready' | 'no-key' | 'error'
  generatedAt: number | null
}

export function hasNarrativeKey(): boolean {
  return OPENAI_KEY.length > 0
}

const SYSTEM_PROMPT = `You write a short daily markets narrative for a family financial-literacy site read by smart, curious 20-year-olds. Voice: Morgan Housel meets Morning Brew — warm, plainspoken, lightly irreverent, stories over jargon. Rules: 200-300 words. No financial advice, ever — educate about how to think, never what to buy. Be honest about uncertainty ("historically this has tended to…" not "this means…"). Always land on "so what does this mean for your life" for a young adult. No headers, no bullet lists, just 2-4 short paragraphs.`

function todayStamp(): string {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

export async function getDailyNarrative(summary: MarketSummaryInput[]): Promise<NarrativeResult> {
  if (!hasNarrativeKey()) return { text: null, state: 'no-key', generatedAt: null }

  try {
    const raw = localStorage.getItem(NARRATIVE_CACHE_KEY)
    if (raw) {
      const cached = JSON.parse(raw) as { day: string; text: string; generatedAt: number }
      if (cached.day === todayStamp() && cached.text) {
        return { text: cached.text, state: 'ready', generatedAt: cached.generatedAt }
      }
    }
  } catch {
    // ignore unreadable cache
  }

  const snapshot = summary
    .map((s) => `${s.label}: ${s.changePct >= 0 ? '+' : ''}${s.changePct.toFixed(2)}%`)
    .join(', ')

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS)
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 500,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Today's market snapshot: ${snapshot}. Write today's "what it actually means" narrative.`,
          },
        ],
      }),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> }
    const text = data.choices?.[0]?.message?.content?.trim()
    if (!text) throw new Error('Empty completion')

    const generatedAt = Date.now()
    try {
      localStorage.setItem(NARRATIVE_CACHE_KEY, JSON.stringify({ day: todayStamp(), text, generatedAt }))
    } catch {
      // uncached is fine
    }
    return { text, state: 'ready', generatedAt }
  } catch (err) {
    console.error('[narrative] generation failed:', err instanceof Error ? err.message : err)
    return { text: null, state: 'error', generatedAt: null }
  } finally {
    clearTimeout(timeout)
  }
}
