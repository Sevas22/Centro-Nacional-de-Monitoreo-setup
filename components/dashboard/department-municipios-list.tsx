'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { activityColor } from '@/lib/style-maps'
import type { ActivityLevel } from '@/lib/types'

export interface MunicipioRow {
  name: string
  newsCount: number
  level: ActivityLevel
}

// Trae TODOS los municipios reales del departamento (dato oficial DANE via
// lib/spectrum/municipio-coordinates.ts), no solo los que ya tienen noticias detectadas —
// para que el usuario pueda ir alimentando fuentes específicas por pueblo con el tiempo.
export function DepartmentMunicipiosList({ municipios }: { municipios: MunicipioRow[] }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(
    () => municipios.filter((m) => m.name.toLowerCase().includes(query.toLowerCase())),
    [municipios, query],
  )

  return (
    <div>
      {municipios.length > 10 && (
        <div className="relative mb-2.5">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar municipio..."
            className="w-full rounded-lg border border-border bg-background/50 py-1.5 pl-8 pr-3 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50"
          />
        </div>
      )}
      <div className="flex max-h-[420px] flex-col gap-2 overflow-y-auto pr-1">
        {filtered.map((m) => (
          <div key={m.name} className="rounded-lg border border-border bg-background/40 p-2.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-foreground">{m.name}</p>
              <span
                className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{ backgroundColor: `${activityColor[m.level]}22`, color: activityColor[m.level] }}
              >
                {m.newsCount === 0 ? 'Sin datos' : `${m.newsCount} ${m.newsCount === 1 ? 'noticia' : 'noticias'}`}
              </span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="py-4 text-center text-sm text-muted-foreground">No se encontraron municipios.</p>
        )}
      </div>
    </div>
  )
}
