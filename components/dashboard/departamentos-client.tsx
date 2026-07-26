'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Building2, Search } from 'lucide-react'
import { PageHeader, PageTransition } from '@/components/page-shell'
import { SectionCard } from '@/components/dashboard/section-card'
import { activityColor, activityLabel } from '@/lib/style-maps'
import type { ActivityLevel } from '@/lib/types'
import type { DeptActivity } from '@/lib/news/aggregate'

// Mismo patrón visual que antes tenía /municipios (tarjeta + badge + barra) — se consolidó todo
// en un solo flujo: departamento -> (municipios detectados + noticias + métricas) en un clic,
// en vez de dos herramientas separadas en el menú.
export function DepartamentosClient({ deptActivity }: { deptActivity: DeptActivity[] }) {
  const [query, setQuery] = useState('')
  const [levelFilter, setLevelFilter] = useState<ActivityLevel | 'all'>('all')

  const maxCount = Math.max(1, ...deptActivity.map((d) => d.newsCount))

  const rows = useMemo(() => {
    return [...deptActivity]
      .filter((d) => d.name.toLowerCase().includes(query.toLowerCase()))
      .filter((d) => (levelFilter === 'all' ? true : d.level === levelFilter))
      .sort((a, b) => b.newsCount - a.newsCount)
  }, [deptActivity, query, levelFilter])

  const levels: (ActivityLevel | 'all')[] = ['all', 'critical', 'high', 'medium', 'low']

  return (
    <PageTransition>
      <PageHeader
        title="Departamentos"
        subtitle={`Actividad noticiosa real por departamento · ${deptActivity.filter((d) => d.newsCount > 0).length} con actividad`}
      />

      <SectionCard
        title="Listado de departamentos"
        icon={<Building2 className="size-4 text-[var(--accent-purple)]" />}
        action={
          <div className="flex items-center gap-2">
            {levels.map((l) => (
              <button
                key={l}
                onClick={() => setLevelFilter(l)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  levelFilter === l ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {l === 'all' ? 'Todos' : activityLabel[l]}
              </button>
            ))}
          </div>
        }
      >
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar departamento..."
            className="w-full rounded-lg border border-border bg-background/50 py-2 pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((d) => (
            <Link
              key={d.name}
              href={`/departamentos/${encodeURIComponent(d.name)}`}
              className="glass flex flex-col gap-2 rounded-xl p-3.5 transition-all hover:-translate-y-0.5 hover:border-primary/40"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">{d.name}</p>
                <span
                  className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{ backgroundColor: `${activityColor[d.level]}22`, color: activityColor[d.level] }}
                >
                  {activityLabel[d.level]}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-background">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(d.newsCount / maxCount) * 100}%`, backgroundColor: activityColor[d.level] }}
                />
              </div>
              <p className="font-mono text-xs font-semibold text-foreground">{d.newsCount.toLocaleString('es-CO')} noticias</p>
            </Link>
          ))}
          {rows.length === 0 && (
            <div className="col-span-full py-10 text-center text-sm text-muted-foreground">
              No se encontraron departamentos con estos filtros.
            </div>
          )}
        </div>
      </SectionCard>
    </PageTransition>
  )
}
