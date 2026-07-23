import { FileText, CalendarClock, Sparkles } from 'lucide-react'
import { PageHeader, PageTransition } from '@/components/page-shell'
import { SectionCard } from '@/components/dashboard/section-card'
import { GenerateBriefingButton } from '@/components/briefings/generate-briefing-button'
import { BriefingHistoryTable } from '@/components/briefings/briefing-history-table'
import { prisma } from '@/lib/db'
import type { BriefingSummary } from '@/components/briefings/briefing-viewer-modal'

export const dynamic = 'force-dynamic'

export default async function ReportesPage() {
  const rows = await prisma.briefing.findMany({ orderBy: { generatedAt: 'desc' }, take: 30 })
  const briefings: BriefingSummary[] = rows.map((b) => ({
    id: b.id,
    kind: b.kind,
    content: b.content,
    generatedAt: b.generatedAt.toISOString(),
    sourceSummary: b.sourceSummary as BriefingSummary['sourceSummary'],
  }))

  return (
    <PageTransition>
      <PageHeader
        title="Reportes"
        subtitle="Boletines diarios y briefings ejecutivos generados con IA a partir de datos reales"
        badge={<GenerateBriefingButton />}
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="glass flex items-start gap-3 rounded-xl p-4">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <CalendarClock className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Boletín diario</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Se genera automáticamente todos los días a partir del panorama nacional de espectro y las últimas 24h de
              fuentes abiertas del módulo GAO.
            </p>
          </div>
        </div>
        <div className="glass flex items-start gap-3 rounded-xl p-4">
          <div className="flex size-10 items-center justify-center rounded-lg bg-cyan/10 text-cyan">
            <Sparkles className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Briefing ejecutivo</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Mismo análisis, generado bajo demanda cuando lo necesites — usa el botón &quot;Generar briefing
              ejecutivo&quot; arriba.
            </p>
          </div>
        </div>
      </div>

      <SectionCard title="Historial de boletines y briefings" icon={<FileText className="size-4 text-[var(--accent-blue)]" />}>
        <BriefingHistoryTable briefings={briefings} />
      </SectionCard>
    </PageTransition>
  )
}
