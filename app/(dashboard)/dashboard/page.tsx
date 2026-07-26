import type { Metadata } from 'next'
import { Activity, BarChart3, Clock, Flame, Map as MapIcon, PieChart, Users } from 'lucide-react'
import { PageHeader, PageTransition, RealtimeBadge } from '@/components/page-shell'
import { AutoRefresh } from '@/components/spectrum/auto-refresh'
import { KpiGrid } from '@/components/dashboard/kpi-grid'
import { NewsFeed } from '@/components/dashboard/news-feed'
import { ColombiaMapCard } from '@/components/dashboard/colombia-map-card'
import { SectionCard } from '@/components/dashboard/section-card'
import { CategoryChart, HourlyChart, SentimentDonut, TopDeptsChart } from '@/components/dashboard/charts'
import { TopEntities } from '@/components/dashboard/top-entities'
import { WordCloud } from '@/components/dashboard/word-cloud'
import { Heatmap } from '@/components/dashboard/heatmap'
import { AIIntelligencePanel } from '@/components/dashboard/ai-intelligence-panel'
import { prisma } from '@/lib/db'
import { aggregateDashboard, serializeArticle } from '@/lib/news/aggregate'
import { buildNewsWhere, dateRangeOptions, type NewsFilterParams } from '@/lib/news/query'

export const metadata: Metadata = {
  title: 'Dashboard | SIFEM',
  description: 'SIFEM — Sistema Integrado de Fuentes, Espectro y Meteorología, programa Proyecto ATLAS.',
}

export const dynamic = 'force-dynamic'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<NewsFilterParams>
}) {
  const filters = await searchParams
  const where = buildNewsWhere(filters)
  const hasFilters = Object.keys(filters).some((k) => filters[k as keyof NewsFilterParams])

  const [rows, totalCount, latestBriefingRow] = await Promise.all([
    prisma.newsArticle.findMany({ where, orderBy: { publishedAt: 'desc' }, take: 300 }),
    prisma.newsArticle.count({ where }),
    prisma.briefing.findFirst({ where: { kind: 'diario' }, orderBy: { generatedAt: 'desc' } }),
  ])

  const articles = rows.map(serializeArticle)
  const data = aggregateDashboard(rows)
  const criticalArticles = articles.filter((a) => a.importance === 'critical')
  const latestBriefing = latestBriefingRow
    ? { content: latestBriefingRow.content, generatedAt: latestBriefingRow.generatedAt.toISOString() }
    : null

  const rangeLabel = dateRangeOptions.find((o) => o.value === filters.range)?.label ?? 'Más recientes'
  // Solo se cargan las 300 más recientes para no sobrecargar el feed/KPIs, pero el conteo mostrado
  // debe ser el total real que cumple el filtro — si no, se queda pegado en "300" para siempre
  // apenas la base crece más que eso, aunque el filtro de verdad devuelva mucho más.
  const countLabel = totalCount > articles.length ? `${articles.length} de ${totalCount}` : `${articles.length}`

  return (
    <PageTransition>
      <PageHeader
        title="Panorama Nacional en Tiempo Real"
        subtitle={`Monitoreo de noticias reales de El Tiempo, Semana e Infobae · ${rangeLabel.toLowerCase()}${hasFilters ? ' (filtrado)' : ''} · ${countLabel} artículos`}
        badge={
          <div className="flex items-center gap-4">
            <AutoRefresh intervalMs={180000} />
            <RealtimeBadge />
          </div>
        }
      />

      <KpiGrid kpis={data.kpis} />

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ColombiaMapCard deptActivity={data.deptActivity} />
        </div>
        <SectionCard
          title="Feed en vivo"
          icon={<Activity className="size-4 text-[var(--accent-red)]" />}
          bodyClassName="pt-0"
        >
          <NewsFeed articles={articles} />
        </SectionCard>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Volumen de noticias por hora" icon={<Clock className="size-4 text-[var(--accent-blue)]" />}>
          <HourlyChart data={data.hourlyNews} />
        </SectionCard>
        <SectionCard title="Top departamentos" icon={<BarChart3 className="size-4 text-[var(--accent-orange)]" />}>
          <TopDeptsChart data={data.topDepartmentsBar} />
        </SectionCard>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionCard title="Distribución de sentimiento" icon={<PieChart className="size-4 text-[var(--accent-green)]" />}>
          <SentimentDonut data={data.sentimentData} />
        </SectionCard>
        <SectionCard
          title="Noticias por categoría"
          icon={<BarChart3 className="size-4 text-[var(--accent-purple)]" />}
          className="lg:col-span-2"
        >
          <CategoryChart data={data.categoryData} />
        </SectionCard>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Entidades más mencionadas" icon={<Users className="size-4 text-[var(--accent-cyan)]" />}>
          <TopEntities />
        </SectionCard>
        <SectionCard title="Temas más frecuentes" icon={<Flame className="size-4 text-[var(--accent-red)]" />}>
          <WordCloud words={data.wordCloud} />
        </SectionCard>
      </div>

      <div className="mt-6">
        <SectionCard
          title="Mapa de calor: actividad por departamento y hora"
          icon={<MapIcon className="size-4 text-[var(--accent-orange)]" />}
        >
          <Heatmap depts={data.heatmapDepts} data={data.heatmapData} />
        </SectionCard>
      </div>

      <div className="mt-6">
        <AIIntelligencePanel briefing={latestBriefing} criticalArticles={criticalArticles} />
      </div>
    </PageTransition>
  )
}
