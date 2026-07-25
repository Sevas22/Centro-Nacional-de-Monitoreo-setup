import Link from 'next/link'
import { Building2 } from 'lucide-react'
import { PageHeader, PageTransition } from '@/components/page-shell'
import { SectionCard } from '@/components/dashboard/section-card'
import { prisma } from '@/lib/db'
import { computeDeptActivity } from '@/lib/news/aggregate'
import { activityColor, activityLabel } from '@/lib/style-maps'

export const dynamic = 'force-dynamic'

export default async function DepartamentosPage() {
  const rows = await prisma.newsArticle.findMany({
    orderBy: { publishedAt: 'desc' },
    take: 300,
    select: { department: true },
  })
  const deptActivity = computeDeptActivity(rows)
  const maxCount = Math.max(1, ...deptActivity.map((d) => d.newsCount))

  return (
    <PageTransition>
      <PageHeader title="Departamentos" subtitle="Actividad noticiosa real por departamento (artículos más recientes)" />

      <SectionCard title="Listado de departamentos" icon={<Building2 className="size-4 text-[var(--accent-purple)]" />}>
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Departamento</th>
                <th className="px-4 py-2.5 font-medium">Nivel</th>
                <th className="px-4 py-2.5 font-medium">Noticias</th>
                <th className="hidden px-4 py-2.5 font-medium sm:table-cell">Distribución</th>
              </tr>
            </thead>
            <tbody>
              {[...deptActivity]
                .sort((a, b) => b.newsCount - a.newsCount)
                .map((d) => (
                  <tr key={d.name} className="border-b border-border/50 last:border-0 hover:bg-accent/30">
                    <td className="px-4 py-2.5 font-medium text-foreground">
                      <Link href={`/departamentos/${encodeURIComponent(d.name)}`} className="hover:text-primary hover:underline">
                        {d.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium"
                        style={{ backgroundColor: `${activityColor[d.level]}22`, color: activityColor[d.level] }}
                      >
                        <span className="size-1.5 rounded-full" style={{ backgroundColor: activityColor[d.level] }} />
                        {activityLabel[d.level]}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-mono font-semibold text-foreground">
                      {d.newsCount.toLocaleString('es-CO')}
                    </td>
                    <td className="hidden px-4 py-2.5 sm:table-cell">
                      <div className="h-1.5 w-full max-w-[160px] overflow-hidden rounded-full bg-background">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${(d.newsCount / maxCount) * 100}%`, backgroundColor: activityColor[d.level] }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </PageTransition>
  )
}
