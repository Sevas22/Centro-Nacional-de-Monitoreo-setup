export interface GeoPoint {
  lat: number
  lng: number
  resolvedName: string
}

interface OpenMeteoGeocodeResult {
  latitude: number
  longitude: number
  name: string
  country_code?: string
}

/** Resuelve un nombre de ciudad a coordenadas vía Open-Meteo Geocoding API (gratis, sin API key). */
export async function geocodeCity(cityName: string): Promise<GeoPoint | null> {
  const url = new URL('https://geocoding-api.open-meteo.com/v1/search')
  url.searchParams.set('name', cityName)
  url.searchParams.set('count', '5')
  url.searchParams.set('language', 'es')

  // Las coordenadas de una ciudad no cambian: cache largo.
  const res = await fetch(url.toString(), { next: { revalidate: 2592000 } })
  if (!res.ok) return null

  const data = (await res.json()) as { results?: OpenMeteoGeocodeResult[] }
  if (!data.results?.length) return null

  const match = data.results.find((r) => r.country_code === 'CO') ?? data.results[0]
  return { lat: match.latitude, lng: match.longitude, resolvedName: match.name }
}
