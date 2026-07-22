import { Antenna, CloudRain, Droplets, Gauge, Map as MapIcon, Thermometer } from 'lucide-react'
import { PageHeader, PageTransition } from '@/components/page-shell'
import { SectionCard } from '@/components/dashboard/section-card'
import { DepartmentSelect } from '@/components/spectrum/department-select'
import { ClimateMap, type DeptClimate } from '@/components/spectrum/climate-map'
import { departmentCoordinates } from '@/lib/spectrum/department-coordinates'
import { departmentCapitals, departmentNames } from '@/lib/spectrum/department-capitals'
import { fetchWeatherBatch, type CurrentWeather } from '@/lib/spectrum/weather'
import { assessBands, type StabilityLevel } from '@/lib/spectrum/model'
import { frequencyBands } from '@/lib/spectrum/bands'
import { cn } from '@/lib/utils'

const stabilityStyle: Record<StabilityLevel, { label: string; className: string }> = {
  alta: { label: 'Alta', className: 'bg-success/15 text-success' },
  media: { label: 'Media', className: 'bg-warning/15 text-warning' },
  baja: { label: 'Baja', className: 'bg-destructive/15 text-destructive' },
  no_aplica: { label: 'No aplica', className: 'bg-accent/60 text-muted-foreground' },
}

export default async function EspectroPage({
  searchParams,
}: {
  searchParams: Promise<{ depto?: string }>
}) {
  const { depto } = await searchParams
  const department = depto && departmentNames.includes(depto) ? depto : 'Bogotá D.C.'

  // Una sola petición a Open-Meteo para las 32 capitales (el mapa y el detalle salen del mismo fetch).
  const coords = departmentNames.map((name) => departmentCoordinates[name])
  const weatherList = await fetchWeatherBatch(coords)
  const weatherByDept = new Map<string, CurrentWeather | null>(departmentNames.map((name, i) => [name, weatherList[i]]))

  const mapData: Record<string, DeptClimate> = {}
  for (const name of departmentNames) {
    const weather = weatherByDept.get(name)
    if (!weather) continue
    const assessment = assessBands(weather).find((a) => a.band === 'vhf')
    if (!assessment || assessment.stability === 'no_aplica') continue
    mapData[name] = { tempC: weather.temperatureC, humidityPct: weather.humidityPct, stability: assessment.stability }
  }

  const weather = weatherByDept.get(department) ?? null
  const assessments = weather ? assessBands(weather) : null

  return (
    <PageTransition>
      <PageHeader
        title="Simulador de Estabilidad del Espectro RF"
        subtitle="Estimación de estabilidad de comunicación por banda de frecuencia a partir de clima real"
      />

      <SectionCard
        title="Mapa nacional de condiciones climatológicas"
        icon={<MapIcon className="size-4 text-[var(--accent-blue)]" />}
        className="mb-6"
      >
        <ClimateMap data={mapData} selected={department} />
      </SectionCard>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <DepartmentSelect current={department} />
        <span className="text-xs text-muted-foreground">Capital de referencia: {departmentCapitals[department]}</span>
      </div>

      <div className="mb-5 rounded-xl border border-primary/25 bg-primary/[0.06] px-4 py-3 text-xs text-muted-foreground">
        Estimación simulada con modelos de propagación ITU-R y clima en tiempo real — no es una medición directa de espectro.
      </div>

      {!weather && (
        <SectionCard title="Sin datos" icon={<Antenna className="size-4 text-muted-foreground" />}>
          <p className="text-sm text-muted-foreground">
            No se pudo obtener el clima para este departamento en este momento. Intenta de nuevo.
          </p>
        </SectionCard>
      )}

      {weather && assessments && (
        <>
          <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Thermometer className="size-3.5" />
                <span className="text-[11px] uppercase tracking-wide">Temperatura</span>
              </div>
              <p className="mt-1.5 font-mono text-2xl font-bold text-foreground">{weather.temperatureC.toFixed(1)}°C</p>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Droplets className="size-3.5" />
                <span className="text-[11px] uppercase tracking-wide">Humedad</span>
              </div>
              <p className="mt-1.5 font-mono text-2xl font-bold text-foreground">{weather.humidityPct.toFixed(0)}%</p>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Gauge className="size-3.5" />
                <span className="text-[11px] uppercase tracking-wide">Presión</span>
              </div>
              <p className="mt-1.5 font-mono text-2xl font-bold text-foreground">{weather.pressureHpa.toFixed(0)} hPa</p>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CloudRain className="size-3.5" />
                <span className="text-[11px] uppercase tracking-wide">Precipitación</span>
              </div>
              <p className="mt-1.5 font-mono text-2xl font-bold text-foreground">{weather.precipitationMm.toFixed(1)} mm</p>
            </div>
          </div>

          <SectionCard title="Estabilidad estimada por banda" icon={<Antenna className="size-4 text-[var(--accent-cyan)]" />}>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
              {assessments.map((a) => {
                const band = frequencyBands.find((b) => b.id === a.band)!
                const style = stabilityStyle[a.stability]
                return (
                  <div key={a.band} className="rounded-xl border border-border bg-background/40 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{band.label}</p>
                        <p className="text-[11px] text-muted-foreground">{band.rangeLabel}</p>
                      </div>
                      <span className={cn('rounded-full px-2.5 py-1 text-[11px] font-semibold', style.className)}>
                        {style.label}
                      </span>
                    </div>
                    <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">{a.explanation}</p>
                    {a.metric && (
                      <p className="mt-2 font-mono text-[11px] font-semibold text-foreground">
                        {a.metric.label}: {a.metric.value}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </SectionCard>
        </>
      )}
    </PageTransition>
  )
}
