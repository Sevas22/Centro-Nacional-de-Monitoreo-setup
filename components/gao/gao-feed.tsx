'use client'

import { useMemo, useState } from 'react'
import { ExternalLink, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GaoItem {
  id: string
  source: string
  title: string
  link: string
  summary: string
  publishedAt: string
  categories: string[]
  mentionedGroups: string[]
}

const sourceColor: Record<string, string> = {
  INDEPAZ: 'bg-primary/15 text-primary',
  PARES: 'bg-purple/15 text-purple',
  CERAC: 'bg-cyan/15 text-cyan',
}

export function GaoFeed({ items, sources, groups }: { items: GaoItem[]; sources: string[]; groups: string[] }) {
  const [sourceFilter, setSourceFilter] = useState('Todas')
  const [groupFilter, setGroupFilter] = useState('Todos')

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (sourceFilter !== 'Todas' && item.source !== sourceFilter) return false
      if (groupFilter !== 'Todos' && !item.mentionedGroups.includes(groupFilter)) return false
      return true
    })
  }, [items, sourceFilter, groupFilter])

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Filter className="size-3.5" />
          Fuente:
        </div>
        {['Todas', ...sources].map((s) => (
          <button
            key={s}
            onClick={() => setSourceFilter(s)}
            className={cn(
              'rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors',
              sourceFilter === s ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Filter className="size-3.5" />
          Grupo:
        </div>
        {['Todos', ...groups].map((g) => (
          <button
            key={g}
            onClick={() => setGroupFilter(g)}
            className={cn(
              'rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors',
              groupFilter === g ? 'bg-destructive/15 text-destructive' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {g}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2.5">
        {filtered.map((item) => (
          <a
            key={item.id}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="glass flex flex-col gap-1.5 rounded-xl p-3.5 transition-colors hover:border-primary/40"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  'rounded-md px-1.5 py-0.5 text-[10px] font-semibold',
                  sourceColor[item.source] ?? 'bg-accent/60 text-foreground/70',
                )}
              >
                {item.source}
              </span>
              {item.mentionedGroups.map((g) => (
                <span key={g} className="rounded-md bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium text-destructive">
                  {g}
                </span>
              ))}
              <span className="ml-auto text-[11px] text-muted-foreground">
                {new Date(item.publishedAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <h3 className="text-sm font-semibold leading-snug text-foreground">{item.title}</h3>
            <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{item.summary}</p>
            <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-primary">
              Ver original <ExternalLink className="size-3" />
            </span>
          </a>
        ))}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <p className="text-sm text-muted-foreground">
              {items.length === 0
                ? 'Aún no se ha ejecutado la ingestión. Los datos aparecerán después de la primera corrida programada o manual.'
                : 'Sin publicaciones con estos filtros.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
