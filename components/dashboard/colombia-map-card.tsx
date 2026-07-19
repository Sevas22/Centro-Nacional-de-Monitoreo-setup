'use client'

import { useMemo, useState } from 'react'
import { MapPin } from 'lucide-react'
import { SectionCard } from '@/components/dashboard/section-card'
import { ColombiaMap } from '@/components/dashboard/colombia-map'
import { departments } from '@/data/mock'
import { activityColor, activityLabel } from '@/lib/style-maps'
import { useDashboard } from '@/lib/store/dashboard-context'

export function ColombiaMapCard() {
  const [selected, setSelectedLocal] = useState<string | null>(null)
  const { selectDepartment } = useDashboard()

  const setSelected = (name: string | null) => {
    setSelectedLocal(name)
    selectDepartment(name)
  }

  const totals = useMemo(() => {
    const total = departments.reduce((acc, d) => acc + d.newsCount, 0)
    const active = departments.filter((d) => d.level !== 'low').length
    const critical = departments.filter((d) => d.level === 'critical')
    return { total, active, critical }
  }, [])

  const selectedDept = departments.find((d) => d.name === selected)

  return (
    <SectionCard
      title="Mapa de actividad noticiosa"
      icon={<MapPin className="size-4 text-[var(--accent-orange)]" />}
      action={
        <span className="rounded-full border border-border bg-secondary px-2.5 py-1 text-[11px] text-muted-foreground">
          {totals.active} deptos. activos
        </span>
      }
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_200px]">
        <ColombiaMap onSelectDept={setSelected} />

        <div className="flex flex-col gap-3">
          <div className="rounded-xl border border-border bg-background/40 p-3">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              {selectedDept ? 'Departamento' : 'Total nacional'}
            </p>
            <p className="mt-1 font-mono text-2xl font-bold text-foreground">
              {(selectedDept ? selectedDept.newsCount : totals.total).toLocaleString('es-CO')}
            </p>
            <p className="text-xs text-muted-foreground">
              {selectedDept ? selectedDept.name : 'noticias registradas hoy'}
            </p>
            {selectedDept && (
              <span
                className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium"
                style={{
                  backgroundColor: `${activityColor[selectedDept.level]}22`,
                  color: activityColor[selectedDept.level],
                }}
              >
                <span className="size-1.5 rounded-full" style={{ backgroundColor: activityColor[selectedDept.level] }} />
                {activityLabel[selectedDept.level]}
              </span>
            )}
          </div>

          <div className="rounded-xl border border-border bg-background/40 p-3">
            <p className="mb-2 text-[11px] uppercase tracking-wide text-muted-foreground">Alerta crítica</p>
            <ul className="flex flex-col gap-2">
              {totals.critical.map((d) => (
                <li key={d.id} className="flex items-center justify-between text-xs">
                  <span className="text-foreground">{d.name}</span>
                  <span className="font-mono font-semibold text-[var(--accent-red)]">{d.newsCount}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </SectionCard>
  )
}
