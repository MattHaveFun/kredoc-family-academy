import { getCachedPayload } from './dailyUpdate'

export interface NarrativeResult {
  text: string | null
  state: 'ready' | 'pending' | 'error'
  generatedAt: number | null
}

/**
 * Reads today's narrative straight off the cached daily-update payload —
 * no fetch, no key on this side at all. The Worker already wrote this once,
 * at most once per trading day, the last time someone pressed "Get today's
 * update" (see DailyUpdatePanel + worker/src/index.ts).
 */
export function getNarrative(): NarrativeResult {
  const payload = getCachedPayload()
  if (!payload) return { text: null, state: 'pending', generatedAt: null }
  if (payload.narrative.state === 'ready') {
    return { text: payload.narrative.text, state: 'ready', generatedAt: payload.generatedAt }
  }
  return { text: null, state: 'error', generatedAt: payload.generatedAt }
}
