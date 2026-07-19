'use client'

import { useEffect, useRef, useState } from 'react'

interface UseLiveUpdatesOptions {
  intervalMs?: number
  enabled?: boolean
}

/** Runs `onTick` on a fixed interval and reports basic connection/timing state for live-simulated widgets. */
export function useLiveUpdates(onTick: () => void, { intervalMs = 8000, enabled = true }: UseLiveUpdatesOptions = {}) {
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [ticks, setTicks] = useState(0)
  const callbackRef = useRef(onTick)
  callbackRef.current = onTick

  useEffect(() => {
    if (!enabled) return
    const interval = setInterval(() => {
      callbackRef.current()
      setLastUpdate(new Date())
      setTicks((t) => t + 1)
    }, intervalMs)
    return () => clearInterval(interval)
  }, [intervalMs, enabled])

  return { isConnected: enabled, lastUpdate, ticks }
}
