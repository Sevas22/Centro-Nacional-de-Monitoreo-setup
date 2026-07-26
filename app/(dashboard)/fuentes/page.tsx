import { Radio, Newspaper, Signal } from 'lucide-react'
import { PageHeader, PageTransition } from '@/components/page-shell'
import { SectionCard } from '@/components/dashboard/section-card'
import { SourcesChart } from '@/components/dashboard/charts'
import { prisma } from '@/lib/db'
import { computeSourceStats } from '@/lib/news/aggregate'

export const dynamic = 'force-dynamic'

export default async function FuentesPage() {
  const rows = await prisma.newsArticle.findMany({
    orderBy: { publishedAt: 'desc' },
    take: 300,
    select: { source: true, category: true },
  })
  const sources = computeSourceStats(rows)
  const totalRecent = sources.reduce((acc, s) => acc + s.newsToday, 0)

  return (
    <PageTransition>
      <PageHeader
        title="Fuentes de Información"
        subtitle="Medios reales ingeridos por RSS (artículos más recientes)"
        badge={
          <span className="flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-success">
            <Signal className="size-3.5" />
            {sources.length} fuentes activas
          </span>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionCard
          title="Volumen por fuente"
          icon={<Newspaper className="size-4 text-[var(--accent-blue)]" />}
          className="lg:col-span-2"
        >
          {sources.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Sin artículos ingeridos todavía.</p>
          ) : (
            <SourcesChart data={sources.map((s) => ({ name: s.name, count: s.newsToday }))} />
          )}
        </SectionCard>

        <div className="flex flex-col gap-6">
          <div className="glass rounded-xl p-4">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Noticias recientes</p>
            <p className="mt-1 font-mono text-3xl font-bold text-foreground">{totalRecent.toLocaleString('es-CO')}</p>
          </div>
        </div>
      </div>

      <SectionCard
        title="Detalle de fuentes"
        icon={<Radio className="size-4 text-[var(--accent-cyan)]" />}
        className="mt-6"
      >
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className="border-b border-border bg-background/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Fuente</th>
                <th className="hidden px-4 py-2.5 font-medium sm:table-cell">Categorías cubiertas</th>
                <th className="px-4 py-2.5 font-medium">Artículos recientes</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((s) => (
                <tr key={s.name} className="border-b border-border/50 last:border-0 hover:bg-accent/30">
                  <td className="px-4 py-2.5">
                    <span className="flex items-center gap-2 font-medium text-foreground">
                      <Newspaper className="size-4 shrink-0 text-muted-foreground" />
                      {s.name}
                    </span>
                  </td>
                  <td className="hidden px-4 py-2.5 text-muted-foreground sm:table-cell">{s.categories.join(', ')}</td>
                  <td className="px-4 py-2.5 font-mono text-foreground">{s.newsToday}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </PageTransition>
  )
}
