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
  const totalSeconds = Math.round(intervalMs / 1000)
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds)

  useEffect(() => {
    const tick = setInterval(() => {
      setSecondsLeft((s) => (s <= 1 ? 0 : s - 1))
    }, 1000)
    return () => clearInterval(tick)
  }, [])

  // router.refresh() dispara un setState en el Router mientras se resuelve el updater de
  // secondsLeft si se llama ahí mismo — React lo marca como "setState en render de otro
  // componente" y puede dejar boundaries de Suspense (p.ej. el navbar) atascados sin activar.
  // Aislarlo en su propio efecto, disparado por el cambio de secondsLeft, evita esa colisión.
  useEffect(() => {
    if (secondsLeft !== 0) return
    router.refresh()
    setSecondsLeft(totalSeconds)
  }, [secondsLeft, totalSeconds, router])

  return (
    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
      <RefreshCw className="size-3" />
      Próxima actualización en {secondsLeft}s
    </div>
  )
}
