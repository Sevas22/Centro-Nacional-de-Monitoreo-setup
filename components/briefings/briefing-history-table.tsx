'use client'

import { useState } from 'react'
import { Eye } from 'lucide-react'
import { BriefingViewerModal, type BriefingSummary } from './briefing-viewer-modal'

export function BriefingHistoryTable({ briefings }: { briefings: BriefingSummary[] }) {
  const [selected, setSelected] = useState<BriefingSummary | null>(null)

  if (briefings.length === 0) {
    return (
      <p className="px-1 py-6 text-center text-sm text-muted-foreground">
        Aún no se ha generado ningún boletín o briefing. El boletín diario se genera automáticamente; también puedes
        generar un briefing ejecutivo ahora mismo arriba.
      </p>
    )
  }

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-background/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-2.5 font-medium">Tipo</th>
              <th className="px-4 py-2.5 font-medium">Fecha</th>
              <th className="hidden px-4 py-2.5 font-medium sm:table-cell">Fuentes</th>
              <th className="px-4 py-2.5 font-medium text-right">Acción</th>
            </tr>
          </thead>
          <tbody>
            {briefings.map((b) => (
              <tr key={b.id} className="border-b border-border/50 last:border-0 hover:bg-accent/30">
                <td className="px-4 py-2.5 font-medium text-foreground">
                  {b.kind === 'diario' ? 'Boletín diario' : 'Briefing ejecutivo'}
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">{new Date(b.generatedAt).toLocaleString('es-CO')}</td>
                <td className="hidden px-4 py-2.5 text-muted-foreground sm:table-cell">
                  {b.sourceSummary.departmentsWithData} deptos · {b.sourceSummary.eventCount} eventos ·{' '}
                  {b.sourceSummary.gaoItemCount} GAO
                </td>
                <td className="px-4 py-2.5 text-right">
                  <button
                    onClick={() => setSelected(b)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Eye className="size-3.5" />
                    Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <BriefingViewerModal briefing={selected} onClose={() => setSelected(null)} />
    </>
  )
}
