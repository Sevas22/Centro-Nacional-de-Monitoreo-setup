import { CloudRain, Droplets, Gauge, Thermometer, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { frequencyBands } from '@/lib/spectrum/bands'
import { stabilityStyle, type BandAssessment } from '@/lib/spectrum/model'
import type { CurrentWeather } from '@/lib/spectrum/weather'

function MiniStat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-background/60 p-2.5">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="size-3" />
        <span className="text-[10px] uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-1 font-mono text-sm font-semibold text-foreground">{value}</p>
    </div>
  )
}

export function DepartmentDetailPanel({
  department,
  capital,
  weather,
  assessments,
}: {
  department: string
  capital: string
  weather: CurrentWeather | null
  assessments: BandAssessment[] | null
}) {
  return (
    <div className="flex w-full flex-col gap-3 rounded-xl border border-border bg-background/40 p-4 xl:w-80">
      <div>
        <p className="text-sm font-semibold text-foreground">{department}</p>
        <p className="text-[11px] text-muted-foreground">Capital de referencia: {capital}</p>
      </div>

      {weather && assessments ? (
        <>
          <div className="grid grid-cols-2 gap-2">
            <MiniStat icon={Thermometer} label="Temp." value={`${weather.temperatureC.toFixed(1)}°C`} />
            <MiniStat icon={Droplets} label="Humedad" value={`${weather.humidityPct.toFixed(0)}%`} />
            <MiniStat icon={Gauge} label="Presión" value={`${weather.pressureHpa.toFixed(0)} hPa`} />
            <MiniStat icon={CloudRain} label="Precip." value={`${weather.precipitationMm.toFixed(1)} mm`} />
          </div>

          <div className="border-t border-border pt-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Estabilidad por banda
            </p>
            <div className="flex flex-col gap-1.5">
              {assessments.map((a) => {
                const band = frequencyBands.find((b) => b.id === a.band)!
                const style = stabilityStyle[a.stability]
                return (
                  <div
                    key={a.band}
                    className="flex items-center justify-between rounded-lg bg-background/60 px-2.5 py-1.5"
                  >
                    <span className="text-xs font-medium text-foreground">{band.label}</span>
                    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', style.className)}>
                      {style.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      ) : (
        <p className="text-xs text-muted-foreground">Sin datos climáticos disponibles para este departamento.</p>
      )}
    </div>
  )
}
