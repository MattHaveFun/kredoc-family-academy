import { useCallback, useEffect, useRef, useState } from 'react'

interface AutoCycleOptions {
  /** How long each tile stays featured before advancing. */
  intervalMs?: number
  /** How long to stay frozen after the last user interaction before resuming. */
  resumeMs?: number
}

interface AutoCycle {
  selectedId: string
  /** Pick a tile AND freeze cycling (use for clicks that change selection). */
  select: (id: string) => void
  /** Freeze cycling without changing selection (use for range/chart-type changes). */
  pause: () => void
  isCycling: boolean
}

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Featured-chart auto-cycler. Rotates through `ids` while idle, freezes the
 * instant the user interacts, and quietly resumes after a stretch of
 * inactivity. Resets whenever the id set changes (i.e. a tab switch), so
 * cycling is always scoped to the current tab's assets and never carries
 * state across tabs. Honors prefers-reduced-motion by never auto-advancing.
 */
export function useAutoCycle(ids: string[], options?: AutoCycleOptions): AutoCycle {
  const intervalMs = options?.intervalMs ?? 9000
  const resumeMs = options?.resumeMs ?? 45000
  const key = ids.join(',')

  const [selectedId, setSelectedId] = useState(ids[0] ?? '')
  const [paused, setPaused] = useState(false)
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Reset to the first tile whenever the asset set changes (tab switch).
  useEffect(() => {
    setSelectedId(ids[0] ?? '')
    setPaused(false)
    // key encodes the id-set identity; ids/selectedId intentionally excluded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const active = !paused && !prefersReducedMotion && ids.length > 1

  useEffect(() => {
    if (!active) return
    const timer = setInterval(() => {
      setSelectedId((cur) => {
        const i = ids.indexOf(cur)
        return ids[(i + 1) % ids.length]
      })
    }, intervalMs)
    return () => clearInterval(timer)
    // key stands in for ids; restarting on the string avoids churn from a new
    // array identity every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, key, intervalMs])

  const pause = useCallback(() => {
    setPaused(true)
    if (resumeTimer.current) clearTimeout(resumeTimer.current)
    resumeTimer.current = setTimeout(() => setPaused(false), resumeMs)
  }, [resumeMs])

  const select = useCallback(
    (id: string) => {
      setSelectedId(id)
      pause()
    },
    [pause],
  )

  useEffect(
    () => () => {
      if (resumeTimer.current) clearTimeout(resumeTimer.current)
    },
    [],
  )

  return { selectedId, select, pause, isCycling: active }
}
