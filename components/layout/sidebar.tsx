'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Map,
  Building2,
  MapPin,
  TrendingUp,
  FileText,
  Bell,
  Radio,
  BrainCircuit,
  Settings,
  Satellite,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type NavItem = {
  label: string
  href: string
  icon: typeof LayoutDashboard
  badge?: { count: number; tone: 'blue' | 'red' }
}

const groups: { title: string; items: NavItem[] }[] = [
  {
    title: 'Navegación',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Mapa Nacional', href: '/mapa', icon: Map },
      { label: 'Departamentos', href: '/departamentos', icon: Building2 },
      { label: 'Municipios', href: '/municipios', icon: MapPin },
      { label: 'Trending Topics', href: '/trending', icon: TrendingUp, badge: { count: 23, tone: 'blue' } },
    ],
  },
  {
    title: 'Análisis',
    items: [
      { label: 'Reportes', href: '/reportes', icon: FileText },
      { label: 'Alertas', href: '/alertas', icon: Bell, badge: { count: 5, tone: 'red' } },
      { label: 'Fuentes', href: '/fuentes', icon: Radio },
      { label: 'Análisis IA', href: '/analisis-ia', icon: BrainCircuit },
    ],
  },
  {
    title: 'Sistema',
    items: [{ label: 'Configuración', href: '/configuracion', icon: Settings }],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-[220px] flex-col border-r border-border bg-surface">
      <div className="flex h-[58px] items-center gap-2.5 border-b border-border px-4">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Satellite className="size-5" />
        </div>
        <div className="leading-tight">
          <p className="text-[13px] font-semibold text-foreground">Centro Nacional</p>
          <p className="text-[11px] text-muted-foreground">de Monitoreo</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {groups.map((group) => (
          <div key={group.title} className="mb-6">
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {group.title}
            </p>
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href
                const Icon = item.icon
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors',
                        active
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                      )}
                    >
                      {active && (
                        <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-primary" />
                      )}
                      <Icon className="size-4 shrink-0" />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge && (
                        <span
                          className={cn(
                            'flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold',
                            item.badge.tone === 'red'
                              ? 'bg-destructive/20 text-destructive'
                              : 'bg-primary/20 text-primary',
                          )}
                        >
                          {item.badge.count}
                        </span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2.5 rounded-lg px-1 py-1.5">
          <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-info text-sm font-semibold text-primary-foreground">
            JR
          </div>
          <div className="leading-tight">
            <p className="text-[13px] font-medium text-foreground">Juan Ramírez</p>
            <p className="text-[11px] text-muted-foreground">Analista de Inteligencia</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
