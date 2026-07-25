import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight, Newspaper, Building2, TrendingUp, Activity, Clock } from 'lucide-react'
import { PageHeader, PageTransition } from '@/components/page-shell'
import { SectionCard } from '@/components/dashboard/section-card'
import { DepartmentNewsFeed } from '@/components/dashboard/department-news-feed'
import { DepartmentActivityChart } from '@/components/dashboard/department-activity-chart'
import { prisma } from '@/lib/db'
import { computeMunicipioActivity, serializeArticle } from '@/lib/news/aggregate'
import { departmentNames } from '@/lib/spectrum/department-capitals'
import { activityColor, activityLabel } from '@/lib/style-maps'
import type { ActivityLevel } from '@/lib/types'

export const dynamic = 'force-dynamic'

function levelFor(count: number, max: number): ActivityLevel {
  const ratio = max > 0 ? count / max : 0
  if (ratio > 0.75) return 'critical'
  if (ratio > 0.5) return 'high'
  if (ratio > 0.25) return 'medium'
  return 'low'
}

export default async function DepartmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const departmentName = decodeURIComponent(id)
  if (!departmentNames.includes(departmentName)) notFound()

  const [rows, allDeptCounts] = await Promise.all([
    prisma.newsArticle.findMany({
      where: { department: departmentName },
      orderBy: { publishedAt: 'desc' },
      take: 200,
    }),
    prisma.newsArticle.groupBy({ by: ['department'], _count: true }),
  ])

  const maxDeptCount = Math.max(1, ...allDeptCounts.map((d) => d._count))
  const newsCount = rows.length
  const level = levelFor(newsCount, maxDeptCount)

  const articles = rows.map(serializeArticle)
  const municipalities = computeMunicipioActivity(rows).filter((m) => m.departmentName === departmentName)

  const hourCounts = new Array(24).fill(0)
  for (const a of rows) hourCounts[new Date(a.publishedAt).getHours()]++
  const activityPoints = hourCounts.map((count, hour) => ({ hour: `${String(hour).padStart(2, '0')}:00`, count }))

  const positive = rows.filter((a) => a.sentiment === 'positive').length
  const critical = rows.filter((a) => a.importance === 'critical').length

  return (
    <PageTransition>
      <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/departamentos" className="hover:text-foreground">
          Departamentos
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground">{departmentName}</span>
      </div>

      <PageHeader
        title={departmentName}
        subtitle={`${newsCount.toLocaleString('es-CO')} noticias reales recientes · ${municipalities.length} municipios detectados`}
        badge={
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold"
            style={{ backgroundColor: `${activityColor[level]}22`, color: activityColor[level] }}
          >
            <span className="size-1.5 rounded-full" style={{ backgroundColor: activityColor[level] }} />
            Actividad {activityLabel[level]}
          </span>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Newspaper className="size-3.5" />
            <span className="text-[11px] uppercase tracking-wide">Noticias recientes</span>
          </div>
          <p className="mt-1.5 font-mono text-2xl font-bold text-foreground">{newsCount.toLocaleString('es-CO')}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Building2 className="size-3.5" />
            <span className="text-[11px] uppercase tracking-wide">Municipios detectados</span>
          </div>
          <p className="mt-1.5 font-mono text-2xl font-bold text-foreground">{municipalities.length}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="size-3.5" />
            <span className="text-[11px] uppercase tracking-wide">Sentimiento positivo</span>
          </div>
          <p className="mt-1.5 font-mono text-2xl font-bold text-success">
            {newsCount ? Math.round((positive / newsCount) * 100) : 0}%
          </p>
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
        <SectionCard title="Municipios detectados" icon={<Building2 className="size-4 text-[var(--accent-purple)]" />}>
          <div className="flex flex-col gap-2.5">
            {municipalities.map((m) => (
              <div key={m.name} className="rounded-lg border border-border bg-background/40 p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{m.name}</p>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                    style={{ backgroundColor: `${activityColor[m.level]}22`, color: activityColor[m.level] }}
                  >
                    {m.newsCount} {m.newsCount === 1 ? 'noticia' : 'noticias'}
                  </span>
                </div>
              </div>
            ))}
            {municipalities.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No se detectó ningún municipio específico en las noticias recientes de este departamento.
              </p>
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="Actividad por hora (artículos recientes)"
          icon={<Clock className="size-4 text-[var(--accent-blue)]" />}
          className="lg:col-span-2"
        >
          <DepartmentActivityChart points={activityPoints} />
        </SectionCard>
      </div>

      <div className="mt-6">
        <SectionCard title={`Noticias de ${departmentName}`} icon={<Newspaper className="size-4 text-[var(--accent-cyan)]" />}>
          <DepartmentNewsFeed articles={articles} />
        </SectionCard>
      </div>
    </PageTransition>
  )
}
