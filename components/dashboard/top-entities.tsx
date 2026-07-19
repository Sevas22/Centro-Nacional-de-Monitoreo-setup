'use client'

import { useState } from 'react'
import { User, Building, Briefcase, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import { entities } from '@/data/mock'
import type { EntityType } from '@/lib/types'

const tabs: { key: EntityType; label: string; icon: typeof User }[] = [
  { key: 'person', label: 'Personas', icon: User },
  { key: 'org', label: 'Orgs', icon: Building },
  { key: 'company', label: 'Empresas', icon: Briefcase },
  { key: 'place', label: 'Lugares', icon: MapPin },
]

export function TopEntities() {
  const [active, setActive] = useState<EntityType>('person')
  const list = entities[active]
  const max = Math.max(...list.map((e) => e.count))

  return (
    <div>
      <div className="mb-3 flex gap-1 rounded-lg border border-border bg-background/40 p-1">
        {tabs.map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors',
                active === t.key ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="size-3.5" />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          )
        })}
      </div>

      <ul className="flex flex-col gap-1.5">
        {list.map((e, i) => (
          <li key={e.id} className="relative flex items-center gap-3 overflow-hidden rounded-lg border border-border bg-background/40 px-3 py-2">
            <span
              className="absolute inset-y-0 left-0 bg-primary/[0.07]"
              style={{ width: `${(e.count / max) * 100}%` }}
            />
            <span className="relative flex size-6 items-center justify-center rounded-md bg-accent/60 font-mono text-[11px] font-semibold text-muted-foreground">
              {i + 1}
            </span>
            <span className="relative flex-1 truncate text-sm font-medium text-foreground">{e.name}</span>
            <span className="relative font-mono text-xs font-semibold text-primary">{e.count.toLocaleString('es-CO')}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
