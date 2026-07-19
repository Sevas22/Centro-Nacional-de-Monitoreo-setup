'use client'

import { PageHeader, PageTransition, RealtimeBadge } from '@/components/page-shell'
import { ColombiaMapCard } from '@/components/dashboard/colombia-map-card'
import { SectionCard } from '@/components/dashboard/section-card'
import { TopDeptsChart } from '@/components/dashboard/charts'
import { Heatmap } from '@/components/dashboard/heatmap'
import { BarChart3, Grid3x3 } from 'lucide-react'

export default function MapaPage() {
  return (
    <PageTransition>
      <PageHeader
        title="Mapa Nacional Interactivo"
        subtitle="Distribución geográfica de la actividad noticiosa en tiempo real"
        badge={<RealtimeBadge />}
      />
      <ColombiaMapCard />
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Ranking de departamentos" icon={<BarChart3 className="size-4 text-[var(--accent-orange)]" />}>
          <TopDeptsChart />
        </SectionCard>
        <SectionCard title="Actividad por hora" icon={<Grid3x3 className="size-4 text-[var(--accent-blue)]" />}>
          <Heatmap />
        </SectionCard>
      </div>
    </PageTransition>
  )
}
