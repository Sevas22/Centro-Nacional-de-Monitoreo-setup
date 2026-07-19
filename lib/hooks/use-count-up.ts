'use client'

import { useEffect, useRef, useState } from 'react'

export function useCountUp(target: number, active: boolean, duration = 1000) {
  const [val, setVal] = useState(0)
  const ref = useRef<number>(0)
  useEffect(() => {
    if (!active) return
    let raf = 0
    const start = performance.now()
    const from = ref.current
    function tick(now: number) {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      const current = Math.round(from + (target - from) * eased)
      setVal(current)
      ref.current = current
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, active, duration])
  return val
}
