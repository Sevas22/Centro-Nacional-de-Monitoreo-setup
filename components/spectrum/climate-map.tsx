'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import { geoNameToDept } from '@/data/mock'

type Stability = 'baja' | 'media' | 'alta'

export interface DeptClimate {
  tempC: number
  humidityPct: number
  stability: Stability
}

const stabilityColor: Record<Stability, string> = {
  alta: '#10b981',
  media: '#f59e0b',
  baja: '#ef4444',
}

const stabilityLabel: Record<Stability, string> = {
  alta: 'Alta',
  media: 'Media',
  baja: 'Baja',
}

export function ClimateMap({ data, selected }: { data: Record<string, DeptClimate>; selected: string }) {
  const router = useRouter()
  const [tooltip, setTooltip] = useState<{ x: number; y: number; name: string; climate?: DeptClimate } | null>(null)

  return (
    <div className="relative">
      <div
        className="relative overflow-hidden rounded-xl border border-border bg-background/40"
        onMouseLeave={() => setTooltip(null)}
      >
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 1650, center: [-73.5, 4.2] }}
          style={{ width: '100%', height: 'auto' }}
          height={340}
        >
          <Geographies geography="/geo/colombia.json">
            {({ geographies }) =>
              geographies.map((geo) => {
                const rawName = geo.properties.NOMBRE_DPT as string
                const deptName = geoNameToDept[rawName] ?? rawName
                const climate = data[deptName]
                const color = climate ? stabilityColor[climate.stability] : '#1e293b'
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
              <>
                <p className="text-muted-foreground">
                  {tooltip.climate.tempC.toFixed(1)}°C · {tooltip.climate.humidityPct.toFixed(0)}% humedad
                </p>
                <p className="text-muted-foreground">
                  Estabilidad VHF/UHF:{' '}
                  <span className="font-semibold" style={{ color: stabilityColor[tooltip.climate.stability] }}>
                    {stabilityLabel[tooltip.climate.stability]}
                  </span>
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">Sin datos</p>
            )}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-center gap-4">
        {(['alta', 'media', 'baja'] as const).map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <span className="size-3 rounded" style={{ backgroundColor: stabilityColor[s] }} />
            <span className="text-[11px] text-muted-foreground">Estabilidad {stabilityLabel[s]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
