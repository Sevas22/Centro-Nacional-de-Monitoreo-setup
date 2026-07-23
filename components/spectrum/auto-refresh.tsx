'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'

/** Re-ejecuta el server component de la página cada `intervalMs`, para que el clima/estabilidad
 * se sientan realmente en vivo — el caché de Open-Meteo también está fijado a ~60s (ver
 * lib/spectrum/weather.ts), así que cada ciclo trae datos meteorológicos genuinamente frescos,
 * no solo repinta lo mismo. */
export function AutoRefresh({ intervalMs = 60000 }: { intervalMs?: number }) {
  const router = useRouter()
  const [secondsLeft, setSecondsLeft] = useState(Math.round(intervalMs / 1000))

  useEffect(() => {
    const tick = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          router.refresh()
          return Math.round(intervalMs / 1000)
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(tick)
  }, [router, intervalMs])

  return (
    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
      <RefreshCw className="size-3" />
      Próxima actualización en {secondsLeft}s
    </div>
  )
}
