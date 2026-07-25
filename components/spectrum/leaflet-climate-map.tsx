'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapContainer, TileLayer, GeoJSON, CircleMarker, useMap, useMapEvents } from 'react-leaflet'
import { geoJSON as leafletGeoJSON } from 'leaflet'
import type { Feature, Geometry, GeoJsonObject } from 'geojson'
import type { Layer, PathOptions } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { geoNameToDept } from '@/data/geo-reference'
import { departmentCoordinates } from '@/lib/spectrum/department-coordinates'
import { colorFor, tooltipValue, type DeptClimate, type MapLayer } from '@/lib/spectrum/map-colors'

function MapEvents({ onMove }: { onMove: (lat: number, lng: number) => void }) {
  useMapEvents({
    moveend: (e) => {
      const c = e.target.getCenter()
      onMove(c.lat, c.lng)
    },
  })
  return null
}

// Sin esto, el mapa se queda en el zoom nacional (~5.5) aunque estés viendo el detalle de un
// departamento — con hasta 125 municipios encimados a ese zoom cada polígono mide unos pocos
// píxeles y se ve como una cuadrícula de color en vez de un mapa real. Al seleccionar un
// departamento, la vista se acerca a sus límites reales.
function FitToSelection({ features }: { features: Feature<Geometry>[] | undefined }) {
  const map = useMap()
  useEffect(() => {
    if (!features || features.length === 0) return
    const bounds = leafletGeoJSON({ type: 'FeatureCollection', features } as GeoJsonObject).getBounds()
    if (bounds.isValid()) {
      map.flyToBounds(bounds, { paddingTopLeft: [24, 24], paddingBottomRight: [24, 24], maxZoom: 9, duration: 0.6 })
    }
  }, [features, map])
  return null
}

function coordLabel(value: number, positiveLetter: string, negativeLetter: string): string {
  return `${Math.abs(value).toFixed(3)}°${value >= 0 ? positiveLetter : negativeLetter}`
}

export function LeafletClimateMap({
  layer,
  data,
  selected,
  municipiosData,
  selectedDeptCode,
}: {
  layer: MapLayer
  data: Record<string, DeptClimate>
  selected: string
  municipiosData?: Record<string, DeptClimate>
  selectedDeptCode?: string
}) {
  const router = useRouter()
  const [geoJson, setGeoJson] = useState<GeoJsonObject | null>(null)
  const [municipiosGeoJson, setMunicipiosGeoJson] = useState<{ features: Feature<Geometry>[] } | null>(null)
  const [center, setCenter] = useState({ lat: 4.2, lng: -73.5 })

  useEffect(() => {
    fetch('/geo/colombia.json')
      .then((r) => r.json())
      .then(setGeoJson)
      .catch(() => setGeoJson(null))
  }, [])

  // El geojson de municipios (1.122 features) solo se necesita una vez que el usuario mira el
  // detalle de un departamento — se carga bajo demanda, no en el arranque del mapa nacional.
  useEffect(() => {
    fetch('/geo/municipios.json')
      .then((r) => r.json())
      .then((fc: { features: Feature<Geometry>[] }) => setMunicipiosGeoJson(fc))
      .catch(() => setMunicipiosGeoJson(null))
  }, [])

  const selectedMunicipioFeatures = useMemo(
    () => municipiosGeoJson?.features.filter((f) => f.properties?.DPTO_CCDGO === selectedDeptCode),
    [municipiosGeoJson, selectedDeptCode],
  )

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[4.2, -73.5]}
        zoom={5.5}
        minZoom={4}
        maxZoom={11}
        style={{ height: '100%', width: '100%', background: '#0d1526' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {geoJson && (
          <GeoJSON
            key={layer}
            data={geoJson}
            style={(feature) => {
              const rawName = feature?.properties?.NOMBRE_DPT as string
              const deptName = geoNameToDept[rawName] ?? rawName
              const climate = data[deptName]
              const color = climate ? colorFor(layer, climate) : '#1e293b'
              const isSelected = deptName === selected
              const opts: PathOptions = {
                fillColor: color,
                fillOpacity: 0.75,
                color: isSelected ? '#3b82f6' : '#070b14',
                weight: isSelected ? 2 : 0.7,
              }
              return opts
            }}
            onEachFeature={(feature: Feature<Geometry>, layerInstance: Layer) => {
              const rawName = feature.properties?.NOMBRE_DPT as string
              const deptName = geoNameToDept[rawName] ?? rawName
              const climate = data[deptName]
              const label = climate ? `${deptName}: ${tooltipValue(layer, climate)}` : `${deptName}: sin datos`
              layerInstance.bindTooltip(label, { sticky: true })
              layerInstance.on('click', () => router.push(`/espectro?depto=${encodeURIComponent(deptName)}`))
            }}
          />
        )}

        {selectedMunicipioFeatures && selectedMunicipioFeatures.length > 0 && (
          <GeoJSON
            key={`muni-${layer}-${selectedDeptCode}`}
            data={{ type: 'FeatureCollection', features: selectedMunicipioFeatures } as GeoJsonObject}
            style={(feature) => {
              const name = feature?.properties?.MPIO_CNMBR as string
              const climate = municipiosData?.[name]
              const color = climate ? colorFor(layer, climate) : '#1e293b'
              const opts: PathOptions = { fillColor: color, fillOpacity: 0.78, color: '#070b14', weight: 0.5 }
              return opts
            }}
            onEachFeature={(feature: Feature<Geometry>, layerInstance: Layer) => {
              const name = feature.properties?.MPIO_CNMBR as string
              const climate = municipiosData?.[name]
              const label = climate ? `${name}: ${tooltipValue(layer, climate)}` : `${name}: sin datos`
              layerInstance.bindTooltip(label, { sticky: true })
            }}
          />
        )}

        {Object.entries(data).map(([name, climate]) => {
          const coords = departmentCoordinates[name]
          if (!coords) return null
          const isCritical = climate.stability === 'baja'
          return (
            <CircleMarker
              key={name}
              center={[coords.lat, coords.lng]}
              radius={isCritical ? 5 : 3}
              pathOptions={{
                color: '#070b14',
                weight: 1,
                fillColor: isCritical ? '#ef4444' : '#e5e9f0',
                fillOpacity: isCritical ? 1 : 0.6,
                className: isCritical ? 'origin-center [animation:pulse-ring_2s_infinite]' : undefined,
              }}
            />
          )
        })}

        <FitToSelection features={selectedMunicipioFeatures} />
        <MapEvents onMove={(lat, lng) => setCenter({ lat, lng })} />
      </MapContainer>

      <div className="glass pointer-events-none absolute bottom-2 left-2 z-[1000] rounded-md px-2 py-1 text-[10px] text-muted-foreground">
        Lat {coordLabel(center.lat, 'N', 'S')} · Lon {coordLabel(center.lng, 'E', 'W')}
      </div>
    </div>
  )
}
