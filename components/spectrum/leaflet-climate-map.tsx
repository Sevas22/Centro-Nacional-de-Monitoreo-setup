'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapContainer, TileLayer, GeoJSON, CircleMarker, useMapEvents } from 'react-leaflet'
import type { Feature, Geometry, GeoJsonObject } from 'geojson'
import type { Layer, PathOptions } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { geoNameToDept } from '@/data/mock'
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

function coordLabel(value: number, positiveLetter: string, negativeLetter: string): string {
  return `${Math.abs(value).toFixed(3)}°${value >= 0 ? positiveLetter : negativeLetter}`
}

export function LeafletClimateMap({
  layer,
  data,
  selected,
}: {
  layer: MapLayer
  data: Record<string, DeptClimate>
  selected: string
}) {
  const router = useRouter()
  const [geoJson, setGeoJson] = useState<GeoJsonObject | null>(null)
  const [center, setCenter] = useState({ lat: 4.2, lng: -73.5 })

  useEffect(() => {
    fetch('/geo/colombia.json')
      .then((r) => r.json())
      .then(setGeoJson)
      .catch(() => setGeoJson(null))
  }, [])

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

        <MapEvents onMove={(lat, lng) => setCenter({ lat, lng })} />
      </MapContainer>

      <div className="glass pointer-events-none absolute bottom-2 left-2 z-[1000] rounded-md px-2 py-1 text-[10px] text-muted-foreground">
        Lat {coordLabel(center.lat, 'N', 'S')} · Lon {coordLabel(center.lng, 'E', 'W')}
      </div>
    </div>
  )
}
