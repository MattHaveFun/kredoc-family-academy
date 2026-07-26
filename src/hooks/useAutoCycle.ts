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
  /**
   * Attach to the featured panel. Cycling only runs while that panel is
   * actually on screen — see useOnScreen.
   */
  containerRef: (node: HTMLElement | null) => void
}

function useReducedMotion(): boolean {
  const query = () =>
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const [reduced, setReduced] = useState(query)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return reduced
}

/** False while the tab is backgrounded, so we don't burn through symbols unseen. */
function usePageVisible(): boolean {
  const [visible, setVisible] = useState(() => typeof document === 'undefined' || !document.hidden)

  useEffect(() => {
    const onChange = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', onChange)
    return () => document.removeEventListener('visibilitychange', onChange)
  }, [])

  return visible
}

// Ratio steps for the panel observer. The panel can be taller than the phone
// viewport, so a single threshold would never fire — sample the whole range.
const THRESHOLDS = Array.from({ length: 21 }, (_, i) => i / 20)

/**
 * Tracks whether the featured panel is meaningfully in view: at least half of
 * it, or half the viewport for panels taller than the screen. Defaults to true
 * so cycling works before the ref lands (and if IntersectionObserver is gone).
 */
function useOnScreen() {
  const [onScreen, setOnScreen] = useState(true)
  const observer = useRef<IntersectionObserver | null>(null)

  const containerRef = useCallback((node: HTMLElement | null) => {
    observer.current?.disconnect()
    observer.current = null

    if (!node || typeof IntersectionObserver === 'undefined') {
      setOnScreen(true)
      return
    }

    observer.current = new IntersectionObserver(
      ([entry]) => {
        const shown = entry.intersectionRect.height
        const viewport = entry.rootBounds?.height ?? window.innerHeight
        const need = Math.min(entry.boundingClientRect.height, viewport) / 2
        setOnScreen(shown >= need)
      },
      { threshold: THRESHOLDS },
    )
    observer.current.observe(node)
  }, [])

  useEffect(() => () => observer.current?.disconnect(), [])

  return { onScreen, containerRef }
}

/**
 * Featured-chart auto-cycler. Rotates through `ids` while idle, freezes the
 * instant the user interacts, and quietly resumes after a stretch of
 * inactivity. Resets whenever the id set changes (i.e. a tab switch), so
 * cycling is always scoped to the current tab's assets and never carries
 * state across tabs.
 *
 * Cycling is gated on the featured panel being on screen and the tab being
 * foregrounded. Swapping the featured symbol nudges the height of everything
 * below it, and WebKit has no scroll anchoring to absorb that — so on a phone
 * an off-screen cycle yanks the page out from under whatever you were reading.
 * Honors prefers-reduced-motion by never auto-advancing.
 */
export function useAutoCycle(ids: string[], options?: AutoCycleOptions): AutoCycle {
  const intervalMs = options?.intervalMs ?? 9000
  const resumeMs = options?.resumeMs ?? 45000
  const key = ids.join(',')

  const [selectedId, setSelectedId] = useState(ids[0] ?? '')
  const [paused, setPaused] = useState(false)
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const reducedMotion = useReducedMotion()
  const pageVisible = usePageVisible()
  const { onScreen, containerRef } = useOnScreen()

  // Reset to the first tile whenever the asset set changes (tab switch).
  useEffect(() => {
    setSelectedId(ids[0] ?? '')
    setPaused(false)
    // key encodes the id-set identity; ids/selectedId intentionally excluded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const active =
    !paused && !reducedMotion && pageVisible && onScreen && ids.length > 1

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

  return { selectedId, select, pause, isCycling: active, containerRef }
}
