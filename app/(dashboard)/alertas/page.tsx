import { Bell, Newspaper, Antenna } from 'lucide-react'
import { PageHeader, PageTransition } from '@/components/page-shell'
import { SectionCard } from '@/components/dashboard/section-card'
import { EventFeed } from '@/components/spectrum/event-feed'
import { prisma } from '@/lib/db'
import { departmentNames } from '@/lib/spectrum/department-capitals'
import { departmentCoordinates } from '@/lib/spectrum/department-coordinates'
import { fetchWeatherBatch, type CurrentWeather } from '@/lib/spectrum/weather'
import { computeNationalSnapshot } from '@/lib/spectrum/national'
import { formatTimeAgo } from '@/lib/utils'
import { riskLevelBadgeStyle, riskLevelLabel } from '@/lib/style-maps'

export const dynamic = 'force-dynamic'

// Las "alertas" ya no son inventadas (antes: capturas y bloqueos ficticios) — se arman a partir
// de dos fuentes que ya son reales en el resto de la plataforma: eventos críticos/altos del
// modelo de espectro (lib/spectrum/national.ts) y noticias que la clasificación real de IA
// marcó como críticas (lib/ai/classify-article.ts).
export default async function AlertasPage() {
  const coords = departmentNames.map((name) => departmentCoordinates[name])
  const [weatherList, criticalNews] = await Promise.all([
    fetchWeatherBatch(coords),
    prisma.newsArticle.findMany({
      where: { importance: 'critical' },
      orderBy: { publishedAt: 'desc' },
      take: 30,
    }),
  ])
  const weatherByDept: Record<string, CurrentWeather | null> = {}
  departmentNames.forEach((name, i) => (weatherByDept[name] = weatherList[i]))
  const snapshot = computeNationalSnapshot(weatherByDept)

  const totalActive = snapshot.events.length + criticalNews.length

  return (
    <PageTransition>
      <PageHeader
        title="Centro de Alertas"
        subtitle="Eventos críticos reales: espectro RF y noticias clasificadas por IA"
        badge={
          <span className="flex items-center gap-2 rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-destructive">
            <Bell className="size-3.5" />
            {totalActive} activas
          </span>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Alertas de espectro RF" icon={<Antenna className="size-4 text-[var(--accent-orange)]" />}>
          <EventFeed events={snapshot.events} />
        </SectionCard>

        <SectionCard title="Noticias críticas" icon={<Newspaper className="size-4 text-[var(--accent-red)]" />}>
          {criticalNews.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Sin noticias críticas detectadas.
            </p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {criticalNews.map((a) => (
                <div key={a.id} className="glass flex items-start gap-3 rounded-xl p-3.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground">{a.title}</h3>
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
                        style={riskLevelBadgeStyle(a.riskLevel)}
                      >
                        {riskLevelLabel[a.riskLevel]}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{a.aiSummary}</p>
                    <p className="mt-1.5 text-[11px] text-muted-foreground/70">
                      {a.source} · {a.department} · {formatTimeAgo(a.publishedAt.toISOString())}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </PageTransition>
  )
}
