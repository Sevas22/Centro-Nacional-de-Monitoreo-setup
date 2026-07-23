import { prisma } from '@/lib/db'
import { departmentNames } from './department-capitals'
import { departmentCoordinates } from './department-coordinates'
import { fetchWeatherBatch } from './weather'
import { assessBands, computeRainAttenuation, computeRefractivity } from './model'

export interface SnapshotResult {
  capturedAt: Date
  written: number
  skipped: number
}

/**
 * Calcula el estado actual de las 33 capitales (mismo modelo que /espectro) y lo persiste
 * como un snapshot histórico real — no se inventa nada, es la misma fórmula ITU-R aplicada
 * al clima real de Open-Meteo en el momento de la captura.
 */
export async function captureSpectrumSnapshot(): Promise<SnapshotResult> {
  const coords = departmentNames.map((name) => departmentCoordinates[name])
  const weatherList = await fetchWeatherBatch(coords)
  const capturedAt = new Date()

  const rows = departmentNames
    .map((name, i) => {
      const weather = weatherList[i]
      if (!weather) return null
      const assessment = assessBands(weather).find((a) => a.band === 'vhf')
      if (!assessment || assessment.stability === 'no_aplica') return null
      return {
        department: name,
        capturedAt,
        tempC: weather.temperatureC,
        humidityPct: weather.humidityPct,
        precipitationMm: weather.precipitationMm,
        stability: assessment.stability,
        attenuationDbKm: computeRainAttenuation(12, weather.precipitationMm),
        refractivity: computeRefractivity(weather.temperatureC, weather.humidityPct, weather.pressureHpa),
      }
    })
    .filter((row): row is NonNullable<typeof row> => row !== null)

  if (rows.length > 0) {
    await prisma.spectrumSnapshot.createMany({ data: rows })
  }

  return { capturedAt, written: rows.length, skipped: departmentNames.length - rows.length }
}
