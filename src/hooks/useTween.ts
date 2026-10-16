import { useEffect, useState } from 'react'

const DURATION = 350
const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4)

// Tracks a value's previous and current state plus progress 0 → 1 between them
// over 350ms. Instant under reduced motion. Canvas and WebGL can't use CSS
// transitions, so they interpolate from this instead.
export function useTween<T>(value: T): { from: T; to: T; t: number } {
  const [pair, setPair] = useState({ from: value, to: value })
  const [t, setT] = useState(1)

  if (pair.to !== value) {
    setPair({ from: pair.to, to: value })
    setT(window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 0)
  }

  useEffect(() => {
    if (pair.from === pair.to || t === 1) return
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / DURATION)
      setT(easeOutQuart(p))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  // Runs once per new pair; t is read only to skip under reduced motion
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pair])

  return { from: pair.from, to: pair.to, t: pair.from === pair.to ? 1 : t }
}
