import { Flame, TrendingUp, List } from 'lucide-react'
import { PageHeader, PageTransition, RealtimeBadge } from '@/components/page-shell'
import { SectionCard } from '@/components/dashboard/section-card'
import { WordCloud } from '@/components/dashboard/word-cloud'
import { CategoryChart } from '@/components/dashboard/charts'
import { CategoryTable } from '@/components/dashboard/category-table'
import { prisma } from '@/lib/db'
import { aggregateDashboard } from '@/lib/news/aggregate'

export const dynamic = 'force-dynamic'

export default async function TrendingPage() {
  const rows = await prisma.newsArticle.findMany({ orderBy: { publishedAt: 'desc' }, take: 300 })
  const data = aggregateDashboard(rows)
  // Mismo conteo de tags que alimenta la nube de palabras — ordenado, es el ranking real de temas.
  const topics = [...data.wordCloud].sort((a, b) => b.size - a.size).slice(0, 8)

  return (
    <PageTransition>
      <PageHeader
        title="Trending Topics"
        subtitle="Temas más frecuentes en las noticias reales más recientes"
        badge={<RealtimeBadge />}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Top temas del momento" icon={<Flame className="size-4 text-[var(--accent-red)]" />}>
          {topics.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Sin temas suficientes todavía.</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {topics.map((t, i) => (
                <li
                  key={t.text}
                  className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-accent/30"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-mono text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">#{t.text.replace(/ /g, '')}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Nube de palabras clave" icon={<TrendingUp className="size-4 text-[var(--accent-cyan)]" />}>
          <WordCloud words={data.wordCloud} />
        </SectionCard>
      </div>

      <SectionCard
        title="Distribución por categoría"
        icon={<TrendingUp className="size-4 text-[var(--accent-purple)]" />}
        className="mt-6"
      >
        <CategoryChart data={data.categoryData} />
      </SectionCard>

      <SectionCard
        title="Listado de categorías"
        icon={<List className="size-4 text-[var(--accent-cyan)]" />}
        className="mt-6"
      >
        <CategoryTable data={data.categoryData} />
      </SectionCard>
    </PageTransition>
  )
}
