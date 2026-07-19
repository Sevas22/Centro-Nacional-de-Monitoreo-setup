'use client'

import { Radio, Newspaper, Tv, Signal } from 'lucide-react'
import { PageHeader, PageTransition } from '@/components/page-shell'
import { SectionCard } from '@/components/dashboard/section-card'
import { SourcesChart } from '@/components/dashboard/charts'
import { newsSources } from '@/data/mock'

const typeIcon: Record<string, typeof Radio> = {
  Prensa: Newspaper,
  Radio: Radio,
  Revista: Tv,
}

export default function FuentesPage() {
  const totalToday = newsSources.reduce((acc, s) => acc + s.newsToday, 0)
  const avgUptime = (newsSources.reduce((acc, s) => acc + s.uptime, 0) / newsSources.length).toFixed(1)

  return (
    <PageTransition>
      <PageHeader
        title="Fuentes de Información"
        subtitle="Estado y rendimiento de los medios monitoreados en tiempo real"
        badge={
          <span className="flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-success">
            <Signal className="size-3.5" />
            {newsSources.length} fuentes activas
          </span>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionCard
          title="Volumen por fuente"
          icon={<Newspaper className="size-4 text-[var(--accent-blue)]" />}
          className="lg:col-span-2"
        >
          <SourcesChart />
        </SectionCard>

        <div className="flex flex-col gap-6">
          <div className="glass rounded-xl p-4">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Noticias hoy</p>
            <p className="mt-1 font-mono text-3xl font-bold text-foreground">{totalToday.toLocaleString('es-CO')}</p>
          </div>
          <div className="glass rounded-xl p-4">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Disponibilidad media</p>
            <p className="mt-1 font-mono text-3xl font-bold text-success">{avgUptime}%</p>
          </div>
        </div>
      </div>

      <SectionCard
        title="Detalle de fuentes"
        icon={<Radio className="size-4 text-[var(--accent-cyan)]" />}
        className="mt-6"
      >
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Fuente</th>
                <th className="hidden px-4 py-2.5 font-medium sm:table-cell">Tipo</th>
                <th className="hidden px-4 py-2.5 font-medium md:table-cell">Región</th>
                <th className="px-4 py-2.5 font-medium">Hoy</th>
                <th className="px-4 py-2.5 font-medium">Estado</th>
                <th className="hidden px-4 py-2.5 font-medium md:table-cell">Latencia</th>
              </tr>
            </thead>
            <tbody>
              {newsSources.map((s) => {
                const Icon = typeIcon[s.type] ?? Radio
                const healthy = s.uptime >= 99
                return (
                  <tr key={s.id} className="border-b border-border/50 last:border-0 hover:bg-accent/30">
                    <td className="px-4 py-2.5">
                      <span className="flex items-center gap-2 font-medium text-foreground">
                        <Icon className="size-4 text-muted-foreground" />
                        {s.name}
                      </span>
                    </td>
                    <td className="hidden px-4 py-2.5 text-muted-foreground sm:table-cell">{s.type}</td>
                    <td className="hidden px-4 py-2.5 text-muted-foreground md:table-cell">{s.region}</td>
                    <td className="px-4 py-2.5 font-mono text-foreground">{s.newsToday}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${healthy ? 'text-success' : 'text-[var(--accent-orange)]'}`}>
                        <span className={`size-1.5 rounded-full ${healthy ? 'bg-success' : 'bg-[var(--accent-orange)]'}`} />
                        {s.uptime}%
                      </span>
                    </td>
                    <td className="hidden px-4 py-2.5 font-mono text-muted-foreground md:table-cell">{s.latency}ms</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </PageTransition>
  )
}
