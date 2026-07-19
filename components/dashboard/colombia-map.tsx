'use client'

import { useState } from 'react'
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps'
import { departments, geoNameToDept, majorCities } from '@/data/mock'
import { activityColor, activityLabel } from '@/lib/style-maps'
import type { ActivityLevel } from '@/lib/types'
import { useToast } from '@/components/toast-provider'

const deptByName = new Map(departments.map((d) => [d.name, d]))

const legend: { level: ActivityLevel }[] = [
  { level: 'low' },
  { level: 'medium' },
  { level: 'high' },
  { level: 'critical' },
]

export function ColombiaMap({ onSelectDept }: { onSelectDept?: (name: string) => void }) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; name: string; count: number } | null>(null)
  const { toast } = useToast()

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
          height={460}
        >
          <Geographies geography="/geo/colombia.json">
            {({ geographies }) =>
              geographies.map((geo) => {
                const rawName = geo.properties.NOMBRE_DPT as string
                const deptName = geoNameToDept[rawName] ?? rawName
                const dept = deptByName.get(deptName)
                const level = dept?.level ?? 'low'
                const count = dept?.newsCount ?? 0
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseMove={(e: React.MouseEvent) => {
                      const rect = (e.currentTarget.ownerSVGElement as SVGElement).getBoundingClientRect()
                      setTooltip({
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top,
                        name: deptName,
                        count,
                      })
                    }}
                    onClick={() => {
                      onSelectDept?.(deptName)
                      toast({
                        variant: 'info',
                        title: `Filtro aplicado: ${deptName}`,
                        description: `Mostrando ${count} noticias del departamento.`,
                      })
                    }}
                    style={{
                      default: {
                        fill: activityColor[level],
                        stroke: '#070b14',
                        strokeWidth: 0.5,
                        outline: 'none',
                        transition: 'fill 0.2s, opacity 0.2s',
                      },
                      hover: {
                        fill: activityColor[level],
                        opacity: 0.8,
                        stroke: '#3b82f6',
                        strokeWidth: 1,
                        outline: 'none',
                        cursor: 'pointer',
                      },
                      pressed: { fill: activityColor[level], outline: 'none' },
                    }}
                  />
                )
              })
            }
          </Geographies>

          {majorCities.map((city) => (
            <Marker key={city.name} coordinates={city.coordinates}>
              <circle r={3} fill={city.pulse ? '#ef4444' : '#e5e9f0'} stroke="#070b14" strokeWidth={0.8} />
              {city.pulse && <circle r={3} fill="none" stroke="#ef4444" strokeWidth={1} className="origin-center [animation:pulse-ring_2s_infinite]" />}
              <text
                textAnchor="start"
                x={6}
                y={3}
                className="fill-foreground/80 font-sans text-[8px] font-medium"
              >
                {city.name}
              </text>
            </Marker>
          ))}
        </ComposableMap>

        {tooltip && (
          <div
            className="glass pointer-events-none absolute z-10 rounded-lg px-2.5 py-1.5 text-xs shadow-xl"
            style={{ left: tooltip.x + 12, top: tooltip.y + 12 }}
          >
            <p className="font-semibold text-foreground">{tooltip.name}</p>
            <p className="text-muted-foreground">
              <span className="font-mono font-semibold text-primary">{tooltip.count.toLocaleString('es-CO')}</span> noticias
            </p>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-center gap-4">
        {legend.map((l) => (
          <div key={l.level} className="flex items-center gap-1.5">
            <span className="size-3 rounded" style={{ backgroundColor: activityColor[l.level] }} />
            <span className="text-[11px] text-muted-foreground">{activityLabel[l.level]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
