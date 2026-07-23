export interface HourlyPoint {
  time: string
  tempC: number
  humidityPct: number
  precipitationMm: number
}

interface OpenMeteoHourlyResponse {
  hourly?: {
    time: string[]
    temperature_2m: number[]
    relative_humidity_2m: number[]
    precipitation: number[]
  }
}

/** Pronóstico horario real (próximas 24h desde ahora) vía Open-Meteo Forecast API. */
export async function fetchHourlyForecast(lat: number, lng: number): Promise<HourlyPoint[]> {
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', lat.toFixed(4))
  url.searchParams.set('longitude', lng.toFixed(4))
  url.searchParams.set('hourly', 'temperature_2m,relative_humidity_2m,precipitation')
  url.searchParams.set('forecast_days', '2')
  url.searchParams.set('timezone', 'auto')

  const res = await fetch(url.toString(), { next: { revalidate: 60 } })
  if (!res.ok) return []

  const data = (await res.json()) as OpenMeteoHourlyResponse
  if (!data.hourly) return []

  const now = Date.now()
  const startIndex = data.hourly.time.findIndex((t) => new Date(t).getTime() >= now)
  const from = startIndex === -1 ? 0 : startIndex

  const points: HourlyPoint[] = []
  for (let i = from; i < Math.min(from + 24, data.hourly.time.length); i++) {
    points.push({
      time: data.hourly.time[i],
      tempC: data.hourly.temperature_2m[i],
      humidityPct: data.hourly.relative_humidity_2m[i],
      precipitationMm: data.hourly.precipitation[i],
    })
  }
  return points
}
