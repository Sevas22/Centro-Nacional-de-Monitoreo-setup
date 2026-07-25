'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { MapPin, Search } from 'lucide-react'
import { PageHeader, PageTransition } from '@/components/page-shell'
import { SectionCard } from '@/components/dashboard/section-card'
import { activityColor, activityLabel } from '@/lib/style-maps'
import type { ActivityLevel } from '@/lib/types'
import type { MunicipioActivity } from '@/lib/news/aggregate'

export function MunicipiosClient({ municipalities }: { municipalities: MunicipioActivity[] }) {
  const [query, setQuery] = useState('')
  const [deptFilter, setDeptFilter] = useState('Todos')
  const [levelFilter, setLevelFilter] = useState<ActivityLevel | 'all'>('all')

  const deptOptions = useMemo(
    () => ['Todos', ...new Set(municipalities.map((m) => m.departmentName))],
    [municipalities],
  )
  const maxCount = Math.max(1, ...municipalities.map((m) => m.newsCount))

  const rows = useMemo(() => {
    return municipalities
      .filter((m) => m.name.toLowerCase().includes(query.toLowerCase()))
      .filter((m) => (deptFilter === 'Todos' ? true : m.departmentName === deptFilter))
      .filter((m) => (levelFilter === 'all' ? true : m.level === levelFilter))
  }, [municipalities, query, deptFilter, levelFilter])

  const levels: (ActivityLevel | 'all')[] = ['all', 'critical', 'high', 'medium', 'low']

  return (
    <PageTransition>
      <PageHeader
        title="Municipios"
        subtitle={`Municipios detectados en noticias reales recientes · ${municipalities.length} con actividad`}
      />

      <SectionCard
        title="Listado de municipios"
        icon={<MapPin className="size-4 text-[var(--accent-purple)]" />}
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
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar municipio..."
              className="w-full rounded-lg border border-border bg-background/50 py-2 pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50"
            />
          </div>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="rounded-lg border border-border bg-background/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50 sm:w-56"
          >
            {deptOptions.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((m) => (
            <Link
              key={`${m.departmentName}-${m.name}`}
              href={`/departamentos/${encodeURIComponent(m.departmentName)}`}
              className="glass flex flex-col gap-2 rounded-xl p-3.5 transition-all hover:-translate-y-0.5 hover:border-primary/40"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{m.departmentName}</p>
                </div>
                <span
                  className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{ backgroundColor: `${activityColor[m.level]}22`, color: activityColor[m.level] }}
                >
                  {activityLabel[m.level]}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-background">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(m.newsCount / maxCount) * 100}%`, backgroundColor: activityColor[m.level] }}
                />
              </div>
              <p className="font-mono text-xs font-semibold text-foreground">{m.newsCount.toLocaleString('es-CO')} noticias</p>
            </Link>
          ))}
          {rows.length === 0 && (
            <div className="col-span-full py-10 text-center text-sm text-muted-foreground">
              No se encontraron municipios con estos filtros.
            </div>
          )}
        </div>
      </SectionCard>
    </PageTransition>
  )
}
