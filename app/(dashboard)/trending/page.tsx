'use client'

import { Flame, TrendingUp, ArrowUp } from 'lucide-react'
import { PageHeader, PageTransition, RealtimeBadge } from '@/components/page-shell'
import { SectionCard } from '@/components/dashboard/section-card'
import { WordCloud } from '@/components/dashboard/word-cloud'
import { CategoryChart } from '@/components/dashboard/charts'

const topics = [
  { rank: 1, tag: 'reforma pensional', mentions: 4821, change: '+128%' },
  { rank: 2, tag: 'paro transportadores', mentions: 3944, change: '+312%' },
  { rank: 3, tag: 'bloqueos cauca', mentions: 3210, change: '+340%' },
  { rank: 4, tag: 'inversión medellín', mentions: 2876, change: '+64%' },
  { rank: 5, tag: 'alerta ideam', mentions: 2455, change: '+98%' },
  { rank: 6, tag: 'feria de las flores', mentions: 2103, change: '+45%' },
  { rank: 7, tag: 'selección colombia', mentions: 1998, change: '+27%' },
  { rank: 8, tag: 'ciberataque banca', mentions: 1654, change: '+156%' },
]

export default function TrendingPage() {
  return (
    <PageTransition>
      <PageHeader
        title="Trending Topics"
        subtitle="Los temas que están marcando la conversación nacional ahora mismo"
        badge={<RealtimeBadge />}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Top temas del momento" icon={<Flame className="size-4 text-[var(--accent-red)]" />}>
          <ul className="flex flex-col gap-1">
            {topics.map((t) => (
              <li
                key={t.rank}
                className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-accent/30"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-mono text-xs font-bold text-primary">
                  {t.rank}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">#{t.tag.replace(/ /g, '')}</p>
                  <p className="text-[11px] text-muted-foreground">{t.mentions.toLocaleString('es-CO')} menciones</p>
                </div>
                <span className="flex items-center gap-0.5 text-xs font-semibold text-success">
                  <ArrowUp className="size-3" />
                  {t.change}
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Nube de palabras clave" icon={<TrendingUp className="size-4 text-[var(--accent-cyan)]" />}>
          <WordCloud />
        </SectionCard>
      </div>

      <SectionCard
        title="Distribución por categoría"
        icon={<TrendingUp className="size-4 text-[var(--accent-purple)]" />}
        className="mt-6"
      >
        <CategoryChart />
      </SectionCard>
    </PageTransition>
  )
}
