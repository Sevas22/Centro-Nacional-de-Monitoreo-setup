import type { Metadata } from 'next'
import { Activity, BarChart3, Clock, Flame, Map as MapIcon, PieChart, Users } from 'lucide-react'
import { PageHeader, PageTransition, RealtimeBadge } from '@/components/page-shell'
import { KpiGrid } from '@/components/dashboard/kpi-grid'
import { NewsFeed } from '@/components/dashboard/news-feed'
import { ColombiaMapCard } from '@/components/dashboard/colombia-map-card'
import { SectionCard } from '@/components/dashboard/section-card'
import {
  CategoryChart,
  HourlyChart,
  SentimentDonut,
  TopDeptsChart,
} from '@/components/dashboard/charts'
import { TopEntities } from '@/components/dashboard/top-entities'
import { WordCloud } from '@/components/dashboard/word-cloud'
import { Heatmap } from '@/components/dashboard/heatmap'
import { AIIntelligencePanel } from '@/components/dashboard/ai-intelligence-panel'

export const metadata: Metadata = {
  title: 'Dashboard | ColombiaNews Intelligence',
  description: 'Monitoreo de noticias en tiempo real con inteligencia artificial para Colombia.',
}

export default function DashboardPage() {
  return (
    <PageTransition>
      <PageHeader
        title="Panorama Nacional en Tiempo Real"
        subtitle="Monitoreo inteligente de noticias en los 32 departamentos de Colombia"
        badge={<RealtimeBadge />}
      />

      <KpiGrid />

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ColombiaMapCard />
        </div>
        <SectionCard
          title="Feed en vivo"
          icon={<Activity className="size-4 text-[var(--accent-red)]" />}
          bodyClassName="pt-0"
        >
          <NewsFeed />
        </SectionCard>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Volumen de noticias por hora" icon={<Clock className="size-4 text-[var(--accent-blue)]" />}>
          <HourlyChart />
        </SectionCard>
        <SectionCard title="Top departamentos" icon={<BarChart3 className="size-4 text-[var(--accent-orange)]" />}>
          <TopDeptsChart />
        </SectionCard>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionCard title="Distribución de sentimiento" icon={<PieChart className="size-4 text-[var(--accent-green)]" />}>
          <SentimentDonut />
        </SectionCard>
        <SectionCard
          title="Noticias por categoría"
          icon={<BarChart3 className="size-4 text-[var(--accent-purple)]" />}
          className="lg:col-span-2"
        >
          <CategoryChart />
        </SectionCard>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Entidades más mencionadas" icon={<Users className="size-4 text-[var(--accent-cyan)]" />}>
          <TopEntities />
        </SectionCard>
        <SectionCard title="Nube de temas trending" icon={<Flame className="size-4 text-[var(--accent-red)]" />}>
          <WordCloud />
        </SectionCard>
      </div>

      <div className="mt-6">
        <SectionCard
          title="Mapa de calor: actividad por departamento y hora"
          icon={<MapIcon className="size-4 text-[var(--accent-orange)]" />}
        >
          <Heatmap />
        </SectionCard>
      </div>

      <div className="mt-6">
        <AIIntelligencePanel />
      </div>
    </PageTransition>
  )
}
