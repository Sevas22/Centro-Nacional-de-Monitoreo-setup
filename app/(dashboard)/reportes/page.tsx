'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FileText,
  Building2,
  ShieldAlert,
  LineChart,
  Sparkles,
  Download,
  Plus,
} from 'lucide-react'
import { PageHeader, PageTransition } from '@/components/page-shell'
import { SectionCard } from '@/components/dashboard/section-card'
import { ReportModal } from '@/components/report-modal'
import { fadeInUp, fadeInUpTransition, staggerContainer } from '@/lib/animations'

const templates = [
  {
    id: 'daily',
    name: 'Reporte diario ejecutivo',
    description: 'Resumen de KPIs, tendencias y focos críticos de las últimas 24 horas.',
    icon: FileText,
    accent: 'text-primary bg-primary/10',
  },
  {
    id: 'department',
    name: 'Análisis por departamento',
    description: 'Actividad noticiosa, sentimiento y riesgo desagregados por departamento.',
    icon: Building2,
    accent: 'text-purple bg-purple/10',
  },
  {
    id: 'security',
    name: 'Monitoreo de seguridad',
    description: 'Eventos de orden público, capturas y alertas críticas correlacionadas.',
    icon: ShieldAlert,
    accent: 'text-destructive bg-destructive/10',
  },
  {
    id: 'economy',
    name: 'Informe económico',
    description: 'Indicadores de inversión, comercio y cobertura del sector productivo.',
    icon: LineChart,
    accent: 'text-success bg-success/10',
  },
  {
    id: 'custom',
    name: 'Reporte personalizado',
    description: 'Define fuentes, departamentos y categorías para un análisis a la medida.',
    icon: Sparkles,
    accent: 'text-cyan bg-cyan/10',
  },
]

interface HistoryEntry {
  id: string
  name: string
  format: string
  type: string
  date: string
}

const initialHistory: HistoryEntry[] = [
  { id: 'h1', name: 'Reporte diario ejecutivo', format: 'PDF', type: 'Diario', date: 'hace 2 h' },
  { id: 'h2', name: 'Análisis por departamento — Cauca', format: 'Excel', type: 'Departamental', date: 'ayer' },
  { id: 'h3', name: 'Monitoreo de seguridad semanal', format: 'PowerPoint', type: 'Seguridad', date: 'hace 3 días' },
]

export default function ReportesPage() {
  const [target, setTarget] = useState<{ id: string; name: string } | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>(initialHistory)

  function handleGenerated(templateName: string, format: string) {
    setHistory((prev) => [
      { id: `h${Date.now()}`, name: templateName, format, type: 'Personalizado', date: 'ahora' },
      ...prev,
    ])
  }

  return (
    <PageTransition>
      <PageHeader
        title="Reportes"
        subtitle="Genera y descarga reportes personalizados de inteligencia con IA"
        badge={
          <button
            onClick={() => setTarget({ id: 'custom', name: 'Reporte personalizado' })}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-primary to-info px-3 py-2 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5"
          >
            <Plus className="size-3.5" />
            Nuevo reporte
          </button>
        }
      />

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {templates.map((t) => {
          const Icon = t.icon
          return (
            <motion.button
              key={t.id}
              variants={fadeInUp}
              transition={fadeInUpTransition}
              onClick={() => setTarget({ id: t.id, name: t.name })}
              className="glass flex flex-col items-start gap-3 rounded-xl p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40"
            >
              <div className={`flex size-10 items-center justify-center rounded-lg ${t.accent}`}>
                <Icon className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{t.name}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t.description}</p>
              </div>
            </motion.button>
          )
        })}
      </motion.div>

      <SectionCard
        title="Historial de reportes generados"
        icon={<FileText className="size-4 text-[var(--accent-blue)]" />}
        className="mt-6"
      >
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Nombre</th>
                <th className="hidden px-4 py-2.5 font-medium sm:table-cell">Tipo</th>
                <th className="px-4 py-2.5 font-medium">Formato</th>
                <th className="px-4 py-2.5 font-medium">Fecha</th>
                <th className="px-4 py-2.5 font-medium text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id} className="border-b border-border/50 last:border-0 hover:bg-accent/30">
                  <td className="px-4 py-2.5 font-medium text-foreground">{h.name}</td>
                  <td className="hidden px-4 py-2.5 text-muted-foreground sm:table-cell">{h.type}</td>
                  <td className="px-4 py-2.5">
                    <span className="rounded-md bg-accent/60 px-1.5 py-0.5 text-[11px] font-medium text-foreground/70">
                      {h.format}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{h.date}</td>
                  <td className="px-4 py-2.5 text-right">
                    <button className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
                      <Download className="size-3.5" />
                      Descargar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <ReportModal
        open={!!target}
        onClose={() => setTarget(null)}
        reportName={target?.name}
        onGenerated={(_format, label) => target && handleGenerated(target.name, label)}
      />
    </PageTransition>
  )
}
