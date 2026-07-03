import { useEffect, useRef, useState } from 'react'

/**
 * Animates a number from its previous value (or 0 on first render) to
 * `target` over `duration` ms with an ease-out curve — the "mission control
 * powering up" count-up used on price readouts.
 */
export function useCountUp(target: number, duration = 800): number {
  const [value, setValue] = useState(target)
  const previous = useRef<number | null>(null)
  const frame = useRef<number>(0)

  useEffect(() => {
    const from = previous.current ?? 0
    previous.current = target
    if (from === target) {
      setValue(target)
      return
    }

    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(from + (target - from) * eased)
      if (t < 1) frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame.current)
  }, [target, duration])

  return value
}
