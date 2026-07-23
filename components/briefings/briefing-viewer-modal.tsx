'use client'

import { Modal } from '@/components/modal'
import { MarkdownLite } from './markdown-lite'

export interface BriefingSummary {
  id: string
  kind: string
  content: string
  generatedAt: string
  sourceSummary: {
    departmentsWithData: number
    eventCount: number
    gaoItemCount: number
    historicalSnapshotCount: number
  }
}

export function BriefingViewerModal({
  briefing,
  onClose,
}: {
  briefing: BriefingSummary | null
  onClose: () => void
}) {
  return (
    <Modal
      open={!!briefing}
      onClose={onClose}
      title={briefing ? (briefing.kind === 'diario' ? 'Boletín diario' : 'Briefing ejecutivo') : undefined}
      maxWidth="max-w-2xl"
    >
      {briefing && (
        <div className="max-h-[70vh] overflow-y-auto p-5">
          <p className="mb-4 text-xs text-muted-foreground">
            Generado {new Date(briefing.generatedAt).toLocaleString('es-CO')} · fuentes: {briefing.sourceSummary.departmentsWithData}{' '}
            departamentos, {briefing.sourceSummary.eventCount} eventos de espectro, {briefing.sourceSummary.gaoItemCount} ítems
            de fuentes abiertas (24h)
          </p>
          <MarkdownLite content={briefing.content} />
        </div>
      )}
    </Modal>
  )
}
