'use client'

import { useState } from 'react'
import { FileText, FileSpreadsheet, Presentation, FileType2, Loader2 } from 'lucide-react'
import { Modal } from '@/components/modal'
import { useToast } from '@/components/toast-provider'

const formats = [
  { id: 'pdf', label: 'PDF', desc: 'Documento ejecutivo', icon: FileText, color: 'text-destructive', bg: 'bg-destructive/10' },
  { id: 'excel', label: 'Excel', desc: 'Datos y tablas', icon: FileSpreadsheet, color: 'text-success', bg: 'bg-success/10' },
  { id: 'ppt', label: 'PowerPoint', desc: 'Presentación', icon: Presentation, color: 'text-warning', bg: 'bg-warning/10' },
  { id: 'word', label: 'Word', desc: 'Informe editable', icon: FileType2, color: 'text-primary', bg: 'bg-primary/10' },
]

interface ReportModalProps {
  open: boolean
  onClose: () => void
  reportName?: string
  onGenerated?: (format: string, label: string) => void
}

export function ReportModal({ open, onClose, reportName, onGenerated }: ReportModalProps) {
  const [generating, setGenerating] = useState<string | null>(null)
  const { toast } = useToast()

  function generate(id: string, label: string) {
    setGenerating(id)
    setTimeout(() => {
      setGenerating(null)
      onClose()
      onGenerated?.(id, label)
      toast({
        variant: 'success',
        title: `Reporte ${label} generado`,
        description: reportName ? `"${reportName}" está listo para descargar.` : 'El informe de inteligencia está listo para descargar.',
      })
    }, 1600)
  }

  return (
    <Modal open={open} onClose={onClose} title={reportName ? `Generar: ${reportName}` : 'Generar Reporte con IA'} maxWidth="max-w-xl">
      <div className="p-5">
        <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
          Selecciona el formato del reporte. La IA compilará el análisis del período seleccionado,
          incluyendo KPIs, tendencias, entidades y recomendaciones estratégicas.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {formats.map((f) => {
            const Icon = f.icon
            const isGenerating = generating === f.id
            return (
              <button
                key={f.id}
                disabled={generating !== null}
                onClick={() => generate(f.id, f.label)}
                className="flex items-center gap-3 rounded-xl border border-border bg-background/40 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 disabled:opacity-60"
              >
                <div className={`flex size-11 items-center justify-center rounded-lg ${f.bg} ${f.color}`}>
                  {isGenerating ? <Loader2 className="size-5 animate-spin" /> : <Icon className="size-5" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{f.label}</p>
                  <p className="text-xs text-muted-foreground">{isGenerating ? 'Generando...' : f.desc}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </Modal>
  )
}
