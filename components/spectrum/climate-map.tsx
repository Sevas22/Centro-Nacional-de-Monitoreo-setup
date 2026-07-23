'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import { geoNameToDept } from '@/data/mock'
import { cn } from '@/lib/utils'

export interface DeptClimate {
  tempC: number
  humidityPct: number
  precipitationMm: number
  stability: 'baja' | 'media' | 'alta'
  attenuationDbKm: number
}

type MapLayer = 'stability' | 'precipitation' | 'humidity' | 'temperature' | 'attenuation'

const stabilityColor = { alta: '#10b981', media: '#f59e0b', baja: '#ef4444' } as const
const stabilityLabel = { alta: 'Alta', media: 'Media', baja: 'Baja' } as const

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function rgbToHex([r, g, b]: [number, number, number]): string {
  return (
    '#' +
    [r, g, b]
      .map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0'))
      .join('')
  )
}

function lerpColor(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a)
  const [r2, g2, b2] = hexToRgb(b)
  return rgbToHex([r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t])
}

function scaleColor(value: number, min: number, max: number, colors: string[]): string {
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)))
  const segment = t * (colors.length - 1)
  const idx = Math.min(colors.length - 2, Math.floor(segment))
  const localT = segment - idx
  return lerpColor(colors[idx], colors[idx + 1], localT)
}

const layers: { id: MapLayer; label: string }[] = [
  { id: 'stability', label: 'Estabilidad VHF/UHF' },
  { id: 'precipitation', label: 'Precipitación' },
  { id: 'humidity', label: 'Humedad' },
  { id: 'temperature', label: 'Temperatura' },
  { id: 'attenuation', label: 'Atenuación SHF' },
]

function colorFor(layer: MapLayer, c: DeptClimate): string {
  switch (layer) {
    case 'stability':
      return stabilityColor[c.stability]
    case 'precipitation':
      return scaleColor(c.precipitationMm, 0, 15, ['#1e293b', '#0ea5e9', '#4338ca'])
    case 'humidity':
      return scaleColor(c.humidityPct, 30, 100, ['#b45309', '#0d9488', '#0369a1'])
    case 'temperature':
      return scaleColor(c.tempC, 5, 35, ['#1d4ed8', '#f59e0b', '#dc2626'])
    case 'attenuation':
      return scaleColor(c.attenuationDbKm, 0, 3, ['#1e293b', '#a855f7', '#dc2626'])
  }
}

function legendFor(layer: MapLayer): { label: string; color: string }[] {
  switch (layer) {
    case 'stability':
      return [
        { label: 'Alta', color: stabilityColor.alta },
        { label: 'Media', color: stabilityColor.media },
        { label: 'Baja', color: stabilityColor.baja },
      ]
    case 'precipitation':
      return [
        { label: '0 mm', color: '#1e293b' },
        { label: '~7 mm', color: '#0ea5e9' },
        { label: '15+ mm', color: '#4338ca' },
      ]
    case 'humidity':
      return [
        { label: '30%', color: '#b45309' },
        { label: '65%', color: '#0d9488' },
        { label: '100%', color: '#0369a1' },
      ]
    case 'temperature':
      return [
        { label: '5°C', color: '#1d4ed8' },
        { label: '20°C', color: '#f59e0b' },
        { label: '35°C', color: '#dc2626' },
      ]
    case 'attenuation':
      return [
        { label: '0 dB/km', color: '#1e293b' },
        { label: '1.5 dB/km', color: '#a855f7' },
        { label: '3+ dB/km', color: '#dc2626' },
      ]
  }
}

function tooltipValue(layer: MapLayer, c: DeptClimate): string {
  switch (layer) {
    case 'stability':
      return stabilityLabel[c.stability]
    case 'precipitation':
      return `${c.precipitationMm.toFixed(1)} mm`
    case 'humidity':
      return `${c.humidityPct.toFixed(0)}%`
    case 'temperature':
      return `${c.tempC.toFixed(1)}°C`
    case 'attenuation':
      return `${c.attenuationDbKm.toFixed(2)} dB/km`
  }
}

export function ClimateMap({ data, selected }: { data: Record<string, DeptClimate>; selected: string }) {
  const router = useRouter()
  const [layer, setLayer] = useState<MapLayer>('stability')
  const [tooltip, setTooltip] = useState<{ x: number; y: number; name: string; climate?: DeptClimate } | null>(null)

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <div className="w-full shrink-0 lg:w-44">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Capas del mapa</p>
        <div className="flex flex-col gap-1">
          {layers.map((l) => (
            <button
              key={l.id}
              onClick={() => setLayer(l.id)}
              className={cn(
                'flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium transition-colors',
                layer === l.id
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:bg-accent/40 hover:text-foreground',
              )}
            >
              <span
                className={cn(
                  'size-3.5 shrink-0 rounded-[4px] border transition-colors',
                  layer === l.id ? 'border-primary bg-primary' : 'border-border',
                )}
              />
              {l.label}
            </button>
          ))}
        </div>

        <p className="mb-2 mt-5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Leyenda</p>
        <div className="flex flex-col gap-1.5">
          {legendFor(layer).map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <span className="size-2.5 shrink-0 rounded" style={{ backgroundColor: l.color }} />
              <span className="text-[11px] text-muted-foreground">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div
        className="relative flex-1 overflow-hidden rounded-xl border border-border bg-background/40"
        onMouseLeave={() => setTooltip(null)}
      >
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 1650, center: [-73.5, 4.2] }}
          style={{ width: '100%', height: 'auto' }}
          height={420}
        >
          <Geographies geography="/geo/colombia.json">
            {({ geographies }) =>
              geographies.map((geo) => {
                const rawName = geo.properties.NOMBRE_DPT as string
                const deptName = geoNameToDept[rawName] ?? rawName
                const climate = data[deptName]
                const color = climate ? colorFor(layer, climate) : '#1e293b'
                const isSelected = deptName === selected
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseMove={(e: React.MouseEvent) => {
                      const rect = (e.currentTarget.ownerSVGElement as SVGElement).getBoundingClientRect()
                      setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, name: deptName, climate })
                    }}
                    onClick={() => router.push(`/espectro?depto=${encodeURIComponent(deptName)}`)}
                    style={{
                      default: {
                        fill: color,
                        stroke: isSelected ? '#3b82f6' : '#070b14',
                        strokeWidth: isSelected ? 1.5 : 0.5,
                        outline: 'none',
                        transition: 'fill 0.2s, opacity 0.2s',
                      },
                      hover: {
                        fill: color,
                        opacity: 0.8,
                        stroke: '#3b82f6',
                        strokeWidth: 1,
                        outline: 'none',
                        cursor: 'pointer',
                      },
                      pressed: { fill: color, outline: 'none' },
                    }}
                  />
                )
              })
            }
          </Geographies>
        </ComposableMap>

        {tooltip && (
          <div
            className="glass pointer-events-none absolute z-10 rounded-lg px-2.5 py-1.5 text-xs shadow-xl"
            style={{ left: tooltip.x + 12, top: tooltip.y + 12 }}
          >
            <p className="font-semibold text-foreground">{tooltip.name}</p>
            {tooltip.climate ? (
              <p className="text-muted-foreground">{tooltipValue(layer, tooltip.climate)}</p>
            ) : (
              <p className="text-muted-foreground">Sin datos</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
