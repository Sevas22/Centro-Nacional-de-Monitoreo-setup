'use client'

import { useMemo, useState } from 'react'
import { AlertOctagon, AlertTriangle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { EventSeverity, SpectrumEvent } from '@/lib/spectrum/national'

const severityStyle: Record<EventSeverity, { label: string; className: string; icon: typeof AlertTriangle }> = {
  critico: { label: 'Crítico', className: 'bg-destructive/15 text-destructive', icon: AlertOctagon },
  alto: { label: 'Alto', className: 'bg-warning/15 text-warning', icon: AlertTriangle },
  moderado: { label: 'Moderado', className: 'bg-primary/15 text-primary', icon: Info },
}

const tabs: { id: EventSeverity | 'todos'; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'critico', label: 'Crítico' },
  { id: 'alto', label: 'Alto' },
  { id: 'moderado', label: 'Moderado' },
]

export function EventFeed({ events }: { events: SpectrumEvent[] }) {
  const [tab, setTab] = useState<EventSeverity | 'todos'>('todos')

  const counts = useMemo(() => {
    const c: Record<EventSeverity, number> = { critico: 0, alto: 0, moderado: 0 }
    for (const e of events) c[e.severity]++
    return c
  }, [events])

  const filtered = tab === 'todos' ? events : events.filter((e) => e.severity === tab)

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
              tab === t.id ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t.label}
            <span className="rounded-full bg-accent/60 px-1.5 py-0.5 text-[10px] font-semibold">
              {t.id === 'todos' ? events.length : counts[t.id]}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
          <p className="text-sm text-muted-foreground">Sin eventos detectados por el modelo en esta categoría.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map((e) => {
            const style = severityStyle[e.severity]
            const Icon = style.icon
            return (
              <div key={e.id} className="glass flex items-start gap-3 rounded-xl p-3.5">
                <div className={cn('mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg', style.className)}>
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">{e.title}</h3>
                    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase', style.className)}>
                      {style.label}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{e.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
