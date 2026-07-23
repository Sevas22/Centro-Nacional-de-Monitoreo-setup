'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { cn } from '@/lib/utils'
import { legendFor, mapLayers, type DeptClimate, type MapLayer } from '@/lib/spectrum/map-colors'

export type { DeptClimate } from '@/lib/spectrum/map-colors'

const LeafletClimateMap = dynamic(() => import('./leaflet-climate-map').then((m) => m.LeafletClimateMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">Cargando mapa…</div>
  ),
})

export function ClimateMap({ data, selected }: { data: Record<string, DeptClimate>; selected: string }) {
  const [layer, setLayer] = useState<MapLayer>('stability')

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <div className="w-full shrink-0 lg:w-44">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Capas del mapa</p>
        <div className="flex flex-col gap-1">
          {mapLayers.map((l) => (
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

      <div className="h-[420px] flex-1 overflow-hidden rounded-xl border border-border">
        <LeafletClimateMap layer={layer} data={data} selected={selected} />
      </div>
    </div>
  )
}
