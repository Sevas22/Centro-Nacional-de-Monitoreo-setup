import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight, Newspaper, Building2, TrendingUp, Activity, Clock } from 'lucide-react'
import { PageHeader, PageTransition } from '@/components/page-shell'
import { SectionCard } from '@/components/dashboard/section-card'
import { DepartmentNewsFeed } from '@/components/dashboard/department-news-feed'
import { DepartmentActivityChart } from '@/components/dashboard/department-activity-chart'
import { DepartmentMunicipiosList, type MunicipioRow } from '@/components/dashboard/department-municipios-list'
import { prisma } from '@/lib/db'
import { serializeArticle } from '@/lib/news/aggregate'
import { departmentNames } from '@/lib/spectrum/department-capitals'
import { departmentDivipola } from '@/lib/spectrum/department-divipola'
import { municipioCoordinates } from '@/lib/spectrum/municipio-coordinates'
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

  // Todos los municipios REALES del departamento (dato oficial DANE), no solo los que ya
  // tienen noticias — así el usuario puede ver de una vez cuáles siguen "Sin datos" y decidir
  // dónde meter fuentes específicas más adelante. La cuenta de "detectados" (para el KPI y el
  // subtítulo) sigue siendo honesta: solo cuenta los que de verdad tienen artículos.
  const deptCode = departmentDivipola[departmentName]
  const countsByMuni = new Map<string, number>()
  for (const a of rows) {
    if (!a.municipality) continue
    countsByMuni.set(a.municipality, (countsByMuni.get(a.municipality) ?? 0) + 1)
  }
  const maxMuniCount = Math.max(1, ...countsByMuni.values())
  const municipalities: MunicipioRow[] = (deptCode ? municipioCoordinates.filter((m) => m.deptCode === deptCode) : [])
    .map((m) => {
      const muniNewsCount = countsByMuni.get(m.name) ?? 0
      return { name: m.name, newsCount: muniNewsCount, level: levelFor(muniNewsCount, maxMuniCount) }
    })
    .sort((a, b) => b.newsCount - a.newsCount || a.name.localeCompare(b.name))
  const detectedCount = municipalities.filter((m) => m.newsCount > 0).length

  const hourCounts = new Array(24).fill(0)
  for (const a of rows) hourCounts[new Date(a.publishedAt).getHours()]++
  const activityPoints = hourCounts.map((count, hour) => ({ hour: `${String(hour).padStart(2, '0')}:00`, count }))

  const highRisk = rows.filter((a) => a.riskLevel === 'high' || a.riskLevel === 'critical').length
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
        subtitle={`${newsCount.toLocaleString('es-CO')} noticias reales recientes · ${detectedCount} de ${municipalities.length} municipios con noticias`}
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
            <span className="text-[11px] uppercase tracking-wide">Municipios con noticias</span>
          </div>
          <p className="mt-1.5 font-mono text-2xl font-bold text-foreground">
            {detectedCount}
            <span className="text-base font-normal text-muted-foreground">/{municipalities.length}</span>
          </p>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="size-3.5" />
            <span className="text-[11px] uppercase tracking-wide">Riesgo alto o crítico</span>
          </div>
          <p className="mt-1.5 font-mono text-2xl font-bold text-warning">
            {newsCount ? Math.round((highRisk / newsCount) * 100) : 0}%
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
        <SectionCard title={`Municipios (${municipalities.length})`} icon={<Building2 className="size-4 text-[var(--accent-purple)]" />}>
          {municipalities.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No hay municipios registrados para este departamento en los datos geográficos.
            </p>
          ) : (
            <DepartmentMunicipiosList municipios={municipalities} />
          )}
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
