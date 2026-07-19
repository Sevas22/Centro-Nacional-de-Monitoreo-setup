import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight, Newspaper, Building2, TrendingUp, Activity, Clock } from 'lucide-react'
import { PageHeader, PageTransition } from '@/components/page-shell'
import { SectionCard } from '@/components/dashboard/section-card'
import { DepartmentNewsFeed } from '@/components/dashboard/department-news-feed'
import { DepartmentActivityChart } from '@/components/dashboard/department-activity-chart'
import { departments, newsArticles, hourlyNews } from '@/data/mock'
import { activityColor, activityLabel } from '@/lib/style-maps'

export default async function DepartmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const department = departments.find((d) => d.id === id)
  if (!department) notFound()

  const articles = newsArticles.filter((a) => a.department === department.name)
  const totalNews = departments.reduce((acc, d) => acc + d.newsCount, 0)
  const share = department.newsCount / totalNews
  const activityPoints = hourlyNews.map((h) => ({ hour: h.hour, count: Math.max(1, Math.round(h.count * share * 3)) }))

  const positive = articles.filter((a) => a.sentiment === 'positive').length
  const negative = articles.filter((a) => a.sentiment === 'negative').length
  const critical = articles.filter((a) => a.importance === 'critical').length
  const municipalities = department.municipalities ?? []
  const maxMuniCount = Math.max(1, ...municipalities.map((m) => m.newsCount))

  return (
    <PageTransition>
      <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/departamentos" className="hover:text-foreground">
          Departamentos
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground">{department.name}</span>
      </div>

      <PageHeader
        title={department.name}
        subtitle={`${department.newsCount.toLocaleString('es-CO')} noticias registradas · ${municipalities.length} municipios monitoreados`}
        badge={
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold"
            style={{ backgroundColor: `${activityColor[department.level]}22`, color: activityColor[department.level] }}
          >
            <span className="size-1.5 rounded-full" style={{ backgroundColor: activityColor[department.level] }} />
            Actividad {activityLabel[department.level]}
          </span>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Newspaper className="size-3.5" />
            <span className="text-[11px] uppercase tracking-wide">Noticias hoy</span>
          </div>
          <p className="mt-1.5 font-mono text-2xl font-bold text-foreground">{department.newsCount.toLocaleString('es-CO')}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Building2 className="size-3.5" />
            <span className="text-[11px] uppercase tracking-wide">Municipios activos</span>
          </div>
          <p className="mt-1.5 font-mono text-2xl font-bold text-foreground">{municipalities.length}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="size-3.5" />
            <span className="text-[11px] uppercase tracking-wide">Sentimiento positivo</span>
          </div>
          <p className="mt-1.5 font-mono text-2xl font-bold text-success">{articles.length ? Math.round((positive / articles.length) * 100) : 0}%</p>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Activity className="size-3.5" />
            <span className="text-[11px] uppercase tracking-wide">Noticias críticas</span>
          </div>
          <p className="mt-1.5 font-mono text-2xl font-bold text-destructive">{critical}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionCard title="Municipios monitoreados" icon={<Building2 className="size-4 text-[var(--accent-purple)]" />}>
          <div className="flex flex-col gap-2.5">
            {municipalities.map((m) => (
              <div key={m.id} className="rounded-lg border border-border bg-background/40 p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{m.name}</p>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                    style={{ backgroundColor: `${activityColor[m.activityLevel]}22`, color: activityColor[m.activityLevel] }}
                  >
                    {activityLabel[m.activityLevel]}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-background">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(m.newsCount / maxMuniCount) * 100}%`, backgroundColor: activityColor[m.activityLevel] }}
                  />
                </div>
              </div>
            ))}
            {municipalities.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">Sin municipios registrados para este departamento.</p>
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="Actividad histórica (24h estimadas)"
          icon={<Clock className="size-4 text-[var(--accent-blue)]" />}
          className="lg:col-span-2"
        >
          <DepartmentActivityChart points={activityPoints} />
        </SectionCard>
      </div>

      <div className="mt-6">
        <SectionCard title={`Noticias de ${department.name}`} icon={<Newspaper className="size-4 text-[var(--accent-cyan)]" />}>
          <DepartmentNewsFeed articles={articles} />
        </SectionCard>
      </div>
    </PageTransition>
  )
}
