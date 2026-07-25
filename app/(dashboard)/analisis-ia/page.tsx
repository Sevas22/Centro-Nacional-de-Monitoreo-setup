import { BrainCircuit, Sparkles, TrendingUp } from 'lucide-react'
import { PageHeader, PageTransition } from '@/components/page-shell'
import { SectionCard } from '@/components/dashboard/section-card'
import { SentimentDonut } from '@/components/dashboard/charts'
import { WordCloud } from '@/components/dashboard/word-cloud'
import { AIIntelligencePanel } from '@/components/dashboard/ai-intelligence-panel'
import { prisma } from '@/lib/db'
import { aggregateDashboard, serializeArticle } from '@/lib/news/aggregate'

export const dynamic = 'force-dynamic'

// Esta página tenía "insights" con % de confianza, clusters temáticos y una red de entidades —
// todo hardcodeado, sin ningún modelo real de clustering/relaciones detrás. Se retiró en vez de
// reemplazarlo con otra versión inventada: requeriría NLP real (topic modeling, extracción de
// relaciones entre entidades) que no tenemos, mismo criterio que con la extracción de entidades.
export default async function AnalisisIAPage() {
  const [rows, latestBriefingRow] = await Promise.all([
    prisma.newsArticle.findMany({ orderBy: { publishedAt: 'desc' }, take: 300 }),
    prisma.briefing.findFirst({ where: { kind: 'diario' }, orderBy: { generatedAt: 'desc' } }),
  ])
  const data = aggregateDashboard(rows)
  const criticalArticles = rows.filter((a) => a.importance === 'critical').map(serializeArticle)
  const latestBriefing = latestBriefingRow
    ? { content: latestBriefingRow.content, generatedAt: latestBriefingRow.generatedAt.toISOString() }
    : null

  return (
    <PageTransition>
      <PageHeader
        title="Análisis con Inteligencia Artificial"
        subtitle="Sentimiento y temas derivados de noticias reales, más el boletín ejecutivo generado por IA"
        badge={
          <span className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
            <Sparkles className="size-3.5" />
            IA activa
          </span>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Sentimiento agregado" icon={<TrendingUp className="size-4 text-[var(--accent-green)]" />}>
          <SentimentDonut data={data.sentimentData} />
        </SectionCard>
        <SectionCard title="Temas detectados" icon={<Sparkles className="size-4 text-[var(--accent-cyan)]" />}>
          <WordCloud words={data.wordCloud} />
        </SectionCard>
      </div>

      <div className="mt-6">
        <AIIntelligencePanel briefing={latestBriefing} criticalArticles={criticalArticles} />
      </div>

      <SectionCard
        title="Próximamente"
        icon={<BrainCircuit className="size-4 text-[var(--accent-purple)]" />}
        className="mt-6"
      >
        <p className="text-sm text-muted-foreground">
          Clustering temático y red de relaciones entre entidades requieren un pipeline de NLP real que
          todavía no está construido — se agregará cuando exista, en vez de simularlo.
        </p>
      </SectionCard>
    </PageTransition>
  )
}
