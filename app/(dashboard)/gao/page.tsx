import { Shield } from 'lucide-react'
import { PageHeader, PageTransition } from '@/components/page-shell'
import { SectionCard } from '@/components/dashboard/section-card'
import { prisma } from '@/lib/db'
import { GaoFeed } from '@/components/gao/gao-feed'
import { armedGroups } from '@/lib/gao/groups'
import { gaoSources } from '@/lib/gao/sources'

export const dynamic = 'force-dynamic'

export default async function GaoPage() {
  const items = await prisma.gaoSourceItem.findMany({
    orderBy: { publishedAt: 'desc' },
    take: 150,
  })

  return (
    <PageTransition>
      <PageHeader
        title="Monitoreo de GAO"
        subtitle="Seguimiento de Grupos Armados Organizados a partir de fuentes independientes de análisis de conflicto (INDEPAZ, PARES, CERAC)"
      />
      <SectionCard
        title={`${items.length} publicaciones monitoreadas`}
        icon={<Shield className="size-4 text-[var(--accent-red)]" />}
      >
        <GaoFeed
          items={items.map((i) => ({
            id: i.id,
            source: i.source,
            title: i.title,
            link: i.link,
            summary: i.summary,
            publishedAt: i.publishedAt.toISOString(),
            categories: i.categories,
            mentionedGroups: i.mentionedGroups,
          }))}
          sources={gaoSources.map((s) => s.name)}
          groups={armedGroups.map((g) => g.label)}
        />
      </SectionCard>
    </PageTransition>
  )
}
