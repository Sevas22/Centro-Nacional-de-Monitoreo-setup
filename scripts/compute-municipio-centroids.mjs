// Script de preprocesamiento (se corre una sola vez, no en runtime). Lee public/geo/municipios.json
// y genera lib/spectrum/municipio-coordinates.ts con un centroide simple por municipio — solo
// necesitamos un punto razonable dentro del municipio para pedirle el clima a Open-Meteo, no un
// centroide geométrico perfecto, así que promediar los vértices del anillo exterior más grande alcanza.
import { readFileSync, writeFileSync } from 'node:fs'

const geojson = JSON.parse(readFileSync(new URL('../public/geo/municipios.json', import.meta.url)))

function largestRing(geometry) {
  if (geometry.type === 'Polygon') return geometry.coordinates[0]
  // MultiPolygon: aproximamos "más grande" por cantidad de vértices del anillo exterior de cada parte.
  let best = geometry.coordinates[0][0]
  for (const polygon of geometry.coordinates) {
    if (polygon[0].length > best.length) best = polygon[0]
  }
  return best
}

function centroid(geometry) {
  const ring = largestRing(geometry)
  let sumLng = 0
  let sumLat = 0
  for (const [lng, lat] of ring) {
    sumLng += lng
    sumLat += lat
  }
  return { lat: sumLat / ring.length, lng: sumLng / ring.length }
}

const entries = geojson.features.map((f) => {
  const p = f.properties
  const { lat, lng } = centroid(f.geometry)
  return {
    id: p.MPIO_CCNCT,
    name: p.MPIO_CNMBR,
    deptCode: p.DPTO_CCDGO,
    lat: Number(lat.toFixed(4)),
    lng: Number(lng.toFixed(4)),
  }
})

entries.sort((a, b) => (a.deptCode === b.deptCode ? a.name.localeCompare(b.name) : a.deptCode.localeCompare(b.deptCode)))

const header = `// Generado por scripts/compute-municipio-centroids.mjs a partir de public/geo/municipios.json
// (DANE — Marco Geoestadístico Nacional 2018, vía github.com/caticoa3/colombia_mapa).
// Centroide aproximado (promedio de vértices del anillo exterior) — suficiente para pedir clima
// a Open-Meteo, no pretende ser un centroide geométrico exacto.
export interface MunicipioInfo {
  id: string
  name: string
  deptCode: string
  lat: number
  lng: number
}

export const municipioCoordinates: MunicipioInfo[] = ${JSON.stringify(entries, null, 2)}
`

writeFileSync(new URL('../lib/spectrum/municipio-coordinates.ts', import.meta.url), header)
console.log(`Generado lib/spectrum/municipio-coordinates.ts con ${entries.length} municipios.`)
