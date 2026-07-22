export interface CurrentWeather {
  temperatureC: number
  humidityPct: number
  pressureHpa: number
  precipitationMm: number
}

interface OpenMeteoForecastResponse {
  current?: {
    temperature_2m: number
    relative_humidity_2m: number
    pressure_msl: number
    precipitation: number
  }
}

/** Clima actual real vía Open-Meteo Forecast API (gratis, sin API key para uso no comercial). */
export async function fetchCurrentWeather(lat: number, lng: number): Promise<CurrentWeather | null> {
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', lat.toFixed(4))
  url.searchParams.set('longitude', lng.toFixed(4))
  url.searchParams.set('current', 'temperature_2m,relative_humidity_2m,pressure_msl,precipitation')
  url.searchParams.set('timezone', 'auto')

  // El clima cambia rápido: cache corto.
  const res = await fetch(url.toString(), { next: { revalidate: 1800 } })
  if (!res.ok) return null

  const data = (await res.json()) as OpenMeteoForecastResponse
  if (!data.current) return null

  return {
    temperatureC: data.current.temperature_2m,
    humidityPct: data.current.relative_humidity_2m,
    pressureHpa: data.current.pressure_msl,
    precipitationMm: data.current.precipitation,
  }
}

/**
 * Clima actual para varias coordenadas en una sola petición (Open-Meteo acepta
 * latitude/longitude separados por coma y devuelve un array en el mismo orden).
 */
export async function fetchWeatherBatch(coords: { lat: number; lng: number }[]): Promise<(CurrentWeather | null)[]> {
  if (coords.length === 0) return []

  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', coords.map((c) => c.lat.toFixed(4)).join(','))
  url.searchParams.set('longitude', coords.map((c) => c.lng.toFixed(4)).join(','))
  url.searchParams.set('current', 'temperature_2m,relative_humidity_2m,pressure_msl,precipitation')
  url.searchParams.set('timezone', 'auto')

  const res = await fetch(url.toString(), { next: { revalidate: 1800 } })
  if (!res.ok) return coords.map(() => null)

  const data = (await res.json()) as OpenMeteoForecastResponse[] | OpenMeteoForecastResponse
  const list = Array.isArray(data) ? data : [data]

  return list.map((item) =>
    item.current
      ? {
          temperatureC: item.current.temperature_2m,
          humidityPct: item.current.relative_humidity_2m,
          pressureHpa: item.current.pressure_msl,
          precipitationMm: item.current.precipitation,
        }
      : null,
  )
}
