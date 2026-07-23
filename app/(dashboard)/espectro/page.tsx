import { Activity, Antenna, Clock, CloudRain, ListOrdered, MapPinned, Map as MapIcon } from 'lucide-react'
import { PageHeader, PageTransition, RealtimeBadge } from '@/components/page-shell'
import { SectionCard } from '@/components/dashboard/section-card'
import { KPICard } from '@/components/dashboard/kpi-card'
import { DepartmentSelect } from '@/components/spectrum/department-select'
import { AutoRefresh } from '@/components/spectrum/auto-refresh'
import { ClimateMap, type DeptClimate } from '@/components/spectrum/climate-map'
import { DepartmentDetailPanel } from '@/components/spectrum/department-detail-panel'
import { EventFeed } from '@/components/spectrum/event-feed'
import { AlertRanking, type DeptAlertSummary } from '@/components/spectrum/alert-ranking'
import { ForecastChart } from '@/components/spectrum/forecast-chart'
import { departmentCoordinates } from '@/lib/spectrum/department-coordinates'
import { departmentCapitals, departmentNames } from '@/lib/spectrum/department-capitals'
import { fetchWeatherBatch, type CurrentWeather } from '@/lib/spectrum/weather'
import { fetchHourlyForecast } from '@/lib/spectrum/forecast'
import { assessBands, computeRainAttenuation, stabilityStyle } from '@/lib/spectrum/model'
import { computeNationalSnapshot } from '@/lib/spectrum/national'
import { frequencyBands } from '@/lib/spectrum/bands'
import { cn } from '@/lib/utils'

function StatusItem({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-3.5 text-muted-foreground" />
      <div>
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-xs font-semibold text-foreground">{value}</p>
      </div>
    </div>
  )
}

export default async function EspectroPage({
  searchParams,
}: {
  searchParams: Promise<{ depto?: string }>
}) {
  const { depto } = await searchParams
  const department = depto && departmentNames.includes(depto) ? depto : 'Bogotá D.C.'
  const coords = departmentCoordinates[department]

  // Una sola petición a Open-Meteo para las 32 capitales — alimenta el mapa, los KPIs y el feed.
  const allCoords = departmentNames.map((name) => departmentCoordinates[name])
  const [weatherList, hourly] = await Promise.all([fetchWeatherBatch(allCoords), fetchHourlyForecast(coords.lat, coords.lng)])
  const weatherByDept: Record<string, CurrentWeather | null> = {}
  departmentNames.forEach((name, i) => (weatherByDept[name] = weatherList[i]))

  const mapData: Record<string, DeptClimate> = {}
  for (const name of departmentNames) {
    const weather = weatherByDept[name]
    if (!weather) continue
    const assessment = assessBands(weather).find((a) => a.band === 'vhf')
    if (!assessment || assessment.stability === 'no_aplica') continue
    mapData[name] = {
      tempC: weather.temperatureC,
      humidityPct: weather.humidityPct,
      precipitationMm: weather.precipitationMm,
      stability: assessment.stability,
      attenuationDbKm: computeRainAttenuation(12, weather.precipitationMm),
    }
  }

  const snapshot = computeNationalSnapshot(weatherByDept)
  const weather = weatherByDept[department] ?? null
  const assessments = weather ? assessBands(weather) : null
  const updatedAt = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })

  const alertByDept = new Map<string, DeptAlertSummary>()
  for (const event of snapshot.events) {
    const entry = alertByDept.get(event.department) ?? { department: event.department, critico: 0, alto: 0, moderado: 0 }
    entry[event.severity]++
    alertByDept.set(event.department, entry)
  }
  const alertRanking = Array.from(alertByDept.values())
    .sort((a, b) => b.critico * 3 + b.alto * 2 + b.moderado - (a.critico * 3 + a.alto * 2 + a.moderado))
    .slice(0, 8)

  return (
    <PageTransition>
      <PageHeader
        title="Simulador de Estabilidad del Espectro RF"
        subtitle="Estimación de estabilidad de comunicación por banda de frecuencia a partir de clima real"
      />

      <div className="mb-5 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl border border-border bg-background/40 px-4 py-3">
        <StatusItem
          icon={MapPinned}
          label="Departamentos con datos"
          value={`${snapshot.totalDepartments}/${departmentNames.length}`}
        />
        <div className="hidden h-8 w-px bg-border sm:block" />
        <StatusItem icon={Clock} label="Última sincronización" value={updatedAt} />
        <div className="hidden h-8 w-px bg-border sm:block" />
        <StatusItem icon={Activity} label="Eventos activos" value={String(snapshot.events.length)} />
        <div className="ml-auto flex items-center gap-4">
          <AutoRefresh />
          <RealtimeBadge />
        </div>
      </div>

      <div className="mb-5 rounded-xl border border-primary/25 bg-primary/[0.06] px-4 py-3 text-xs text-muted-foreground">
        Estimación simulada con modelos de propagación ITU-R y clima en tiempo real — no es una medición directa de espectro
        (no hay hardware de radio involucrado, todo se deriva de datos meteorológicos reales).
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KPICard icon="MapPin" value={snapshot.totalDepartments} label="Departamentos monitoreados" accent="blue" index={0} />
        <KPICard
          icon="AlertTriangle"
          value={snapshot.lowStabilityCount}
          label="Estabilidad VHF/UHF baja"
          accent="red"
          index={1}
        />
        <KPICard
          icon="CloudRain"
          value={snapshot.activePrecipitationCount}
          label="Zonas con precipitación activa"
          accent="cyan"
          index={2}
        />
        <KPICard
          icon="Waves"
          value={snapshot.avgRefractivity.toFixed(0)}
          label="Refractividad promedio (N)"
          accent="purple"
          index={3}
        />
        <KPICard
          icon="Thermometer"
          value={`${snapshot.avgTemperatureC.toFixed(1)}°C`}
          label="Temperatura promedio nacional"
          accent="orange"
          index={4}
        />
        <KPICard
          icon="Droplets"
          value={`${snapshot.avgHumidityPct.toFixed(0)}%`}
          label="Humedad promedio nacional"
          accent="blue"
          index={5}
        />
        <KPICard icon="Radio" value={snapshot.highAttenuationCount} label="Atenuación SHF alta" accent="red" index={6} />
        <KPICard icon="Activity" value={snapshot.events.length} label="Eventos detectados por el modelo" accent="green" index={7} />
      </div>

      <SectionCard
        title="Mapa nacional de condiciones climatológicas"
        icon={<MapIcon className="size-4 text-[var(--accent-blue)]" />}
        className="mb-6"
        action={<DepartmentSelect current={department} />}
      >
        <div className="flex flex-col gap-4 xl:flex-row">
          <div className="flex-1">
            <ClimateMap data={mapData} selected={department} />
          </div>
          <DepartmentDetailPanel
            department={department}
            capital={departmentCapitals[department]}
            weather={weather}
            assessments={assessments}
          />
        </div>
      </SectionCard>

      {!weather && (
        <SectionCard title="Sin datos" icon={<Antenna className="size-4 text-muted-foreground" />}>
          <p className="text-sm text-muted-foreground">
            No se pudo obtener el clima para este departamento en este momento. Intenta de nuevo.
          </p>
        </SectionCard>
      )}

      {weather && assessments && (
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SectionCard
            title={`Pronóstico 24h — ${departmentCapitals[department]}`}
            icon={<CloudRain className="size-4 text-[var(--accent-blue)]" />}
          >
            {hourly.length > 0 ? (
              <ForecastChart points={hourly} />
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">Pronóstico no disponible en este momento.</p>
            )}
          </SectionCard>

          <SectionCard title="Estabilidad estimada por banda" icon={<Antenna className="size-4 text-[var(--accent-cyan)]" />}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                  </div>
                )
              })}
            </div>
          </SectionCard>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        <SectionCard title="Departamentos en alerta" icon={<ListOrdered className="size-4 text-[var(--accent-orange)]" />}>
          <AlertRanking items={alertRanking} />
        </SectionCard>

        <SectionCard title="Eventos detectados por el modelo" icon={<Antenna className="size-4 text-[var(--accent-red)]" />}>
          <EventFeed events={snapshot.events} />
        </SectionCard>
      </div>
    </PageTransition>
  )
}
