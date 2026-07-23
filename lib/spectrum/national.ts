import type { CurrentWeather } from './weather'
import { assessBands } from './model'

export type EventSeverity = 'critico' | 'alto' | 'moderado'

export interface SpectrumEvent {
  id: string
  department: string
  severity: EventSeverity
  title: string
  description: string
  band: 'vhf' | 'uhf' | 'shf'
}

export interface NationalSnapshot {
  totalDepartments: number
  lowStabilityCount: number
  activePrecipitationCount: number
  avgRefractivity: number
  avgTemperatureC: number
  avgHumidityPct: number
  highAttenuationCount: number
  events: SpectrumEvent[]
}

const severityRank: Record<EventSeverity, number> = { critico: 0, alto: 1, moderado: 2 }

/**
 * Todo lo que devuelve esta función sale de clima real (Open-Meteo) pasado por los mismos
 * modelos de física de lib/spectrum/model.ts — nada de valores inventados ni telemetría de
 * hardware. Los "eventos" son determinísticos: mismo clima => mismos eventos, siempre.
 */
export function computeNationalSnapshot(weatherByDept: Record<string, CurrentWeather | null>): NationalSnapshot {
  const entries = Object.entries(weatherByDept).filter((e): e is [string, CurrentWeather] => e[1] !== null)

  let lowStabilityCount = 0
  let activePrecipitationCount = 0
  let highAttenuationCount = 0
  let refractivitySum = 0
  let temperatureSum = 0
  let humiditySum = 0
  const events: SpectrumEvent[] = []

  for (const [department, weather] of entries) {
    const assessments = assessBands(weather)
    const vhf = assessments.find((a) => a.band === 'vhf')!
    const shf = assessments.find((a) => a.band === 'shf')!

    const refractivityValue = vhf.metric ? Number(vhf.metric.value) : null
    if (refractivityValue !== null && !Number.isNaN(refractivityValue)) refractivitySum += refractivityValue
    temperatureSum += weather.temperatureC
    humiditySum += weather.humidityPct
    if (weather.precipitationMm > 0) activePrecipitationCount++

    if (vhf.stability === 'baja') {
      lowStabilityCount++
      events.push({
        id: `${department}-vhf`,
        department,
        severity: 'alto',
        title: `Refractividad elevada en ${department}`,
        description: vhf.explanation,
        band: 'vhf',
      })
    }

    if (shf.stability === 'baja') {
      highAttenuationCount++
      events.push({
        id: `${department}-shf`,
        department,
        severity: 'critico',
        title: `Atenuación por lluvia significativa en ${department}`,
        description: shf.explanation,
        band: 'shf',
      })
    } else if (shf.stability === 'media') {
      events.push({
        id: `${department}-shf-media`,
        department,
        severity: 'moderado',
        title: `Atenuación por lluvia moderada en ${department}`,
        description: shf.explanation,
        band: 'shf',
      })
    }
  }

  events.sort((a, b) => severityRank[a.severity] - severityRank[b.severity])

  const count = entries.length || 1
  return {
    totalDepartments: entries.length,
    lowStabilityCount,
    activePrecipitationCount,
    avgRefractivity: refractivitySum / count,
    avgTemperatureC: temperatureSum / count,
    avgHumidityPct: humiditySum / count,
    highAttenuationCount,
    events,
  }
}
