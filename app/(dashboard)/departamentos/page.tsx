'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Building2, Search } from 'lucide-react'
import { PageHeader, PageTransition } from '@/components/page-shell'
import { SectionCard } from '@/components/dashboard/section-card'
import { departments } from '@/data/mock'
import { activityColor, activityLabel } from '@/lib/style-maps'
import type { ActivityLevel } from '@/lib/types'

const maxCount = Math.max(...departments.map((d) => d.newsCount))

export default function DepartamentosPage() {
  const [query, setQuery] = useState('')
  const [levelFilter, setLevelFilter] = useState<ActivityLevel | 'all'>('all')

  const rows = useMemo(() => {
    return departments
      .filter((d) => d.name.toLowerCase().includes(query.toLowerCase()))
      .filter((d) => (levelFilter === 'all' ? true : d.level === levelFilter))
      .sort((a, b) => b.newsCount - a.newsCount)
  }, [query, levelFilter])

  const levels: (ActivityLevel | 'all')[] = ['all', 'critical', 'high', 'medium', 'low']

  return (
    <PageTransition>
      <PageHeader
        title="Departamentos"
        subtitle="Actividad noticiosa detallada por cada uno de los 32 departamentos"
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
                  levelFilter === l
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground hover:text-foreground'
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

        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Departamento</th>
                <th className="px-4 py-2.5 font-medium">Nivel</th>
                <th className="px-4 py-2.5 font-medium">Noticias</th>
                <th className="hidden px-4 py-2.5 font-medium sm:table-cell">Distribución</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr key={d.id} className="border-b border-border/50 last:border-0 hover:bg-accent/30">
                  <td className="px-4 py-2.5 font-medium text-foreground">
                    <Link href={`/departamentos/${d.id}`} className="hover:text-primary hover:underline">
                      {d.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium"
                      style={{ backgroundColor: `${activityColor[d.level]}22`, color: activityColor[d.level] }}
                    >
                      <span className="size-1.5 rounded-full" style={{ backgroundColor: activityColor[d.level] }} />
                      {activityLabel[d.level]}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono font-semibold text-foreground">
                    {d.newsCount.toLocaleString('es-CO')}
                  </td>
                  <td className="hidden px-4 py-2.5 sm:table-cell">
                    <div className="h-1.5 w-full max-w-[160px] overflow-hidden rounded-full bg-background">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(d.newsCount / maxCount) * 100}%`,
                          backgroundColor: activityColor[d.level],
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No se encontraron departamentos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </PageTransition>
  )
}
