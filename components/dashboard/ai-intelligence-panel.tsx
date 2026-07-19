'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bot, Sparkles, Clock, Lightbulb, ShieldAlert, GitBranch } from 'lucide-react'
import { aiIntelligence } from '@/data/mock'
import { fadeInUp, fadeInUpTransition, staggerContainer } from '@/lib/animations'
import { useLiveUpdates } from '@/lib/hooks/use-live-updates'
import { cn } from '@/lib/utils'

const toneDot: Record<string, string> = {
  red: 'bg-destructive',
  orange: 'bg-warning',
  blue: 'bg-primary',
  green: 'bg-success',
}

const urgencyStyle: Record<string, { border: string; label: string; color: string }> = {
  critical: { border: 'border-l-destructive', label: 'Crítica', color: 'text-destructive' },
  high: { border: 'border-l-warning', label: 'Alta', color: 'text-warning' },
  medium: { border: 'border-l-primary', label: 'Media', color: 'text-primary' },
}

const scenarioStyle: Record<string, { label: string; color: string; bg: string }> = {
  optimista: { label: 'Escenario optimista', color: 'text-success', bg: 'bg-success' },
  base: { label: 'Escenario base', color: 'text-primary', bg: 'bg-primary' },
  riesgo: { label: 'Escenario de riesgo', color: 'text-destructive', bg: 'bg-destructive' },
}

export function AIIntelligencePanel() {
  const [minutesAgo, setMinutesAgo] = useState(aiIntelligence.updatedMinutesAgo)
  useLiveUpdates(() => setMinutesAgo((m) => m + 1), { intervalMs: 60000 })

  return (
    <section className="glass relative overflow-hidden rounded-xl border-primary/25">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-transparent to-cyan/[0.06]" />

      <header className="relative flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Bot className="size-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Resumen Ejecutivo IA</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
            <Sparkles className="size-3" />
            Modelo activo
          </span>
          <span className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[10px] text-muted-foreground">
            <Clock className="size-3" />
            Actualizado hace {minutesAgo} min
          </span>
        </div>
      </header>

      <div className="relative p-4">
        <p className="text-sm leading-relaxed text-muted-foreground">{aiIntelligence.summary}</p>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2"
        >
          <motion.div variants={fadeInUp} transition={fadeInUpTransition} className="rounded-xl border border-border bg-background/40 p-4">
            <div className="mb-3 flex items-center gap-2">
              <GitBranch className="size-4 text-primary" />
              <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground">Eventos principales</h3>
            </div>
            <ol className="flex flex-col gap-3">
              {aiIntelligence.eventTimeline.map((ev, i) => (
                <li key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className={cn('size-2.5 rounded-full', toneDot[ev.tone])} />
                    {i < aiIntelligence.eventTimeline.length - 1 && <span className="mt-1 w-px flex-1 bg-border" />}
                  </div>
                  <div className="pb-1">
                    <p className="font-mono text-[11px] text-muted-foreground">{ev.time}</p>
                    <p className="text-xs leading-snug text-foreground/90">{ev.title}</p>
                  </div>
                </li>
              ))}
            </ol>
          </motion.div>

          <motion.div variants={fadeInUp} transition={fadeInUpTransition} className="rounded-xl border border-border bg-background/40 p-4">
            <div className="mb-3 flex items-center gap-2">
              <ShieldAlert className="size-4 text-warning" />
              <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground">Evaluación de riesgo</h3>
            </div>
            <div className="flex flex-col gap-3">
              {aiIntelligence.riskAssessment.map((r) => (
                <div key={r.label}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{r.label}</span>
                    <span className="font-mono font-semibold text-foreground">{r.value}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-background">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${r.value}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={cn(
                        'h-full rounded-full',
                        r.value >= 70 ? 'bg-destructive' : r.value >= 45 ? 'bg-warning' : 'bg-success',
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} transition={fadeInUpTransition} className="rounded-xl border border-border bg-background/40 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Lightbulb className="size-4 text-cyan" />
              <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground">Recomendaciones</h3>
            </div>
            <div className="flex flex-col gap-2.5">
              {aiIntelligence.recommendations.map((r) => {
                const style = urgencyStyle[r.urgency]
                return (
                  <div key={r.title} className={cn('rounded-lg border border-l-2 border-border bg-background/60 p-2.5', style.border)}>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-foreground">{r.title}</p>
                      <span className={cn('shrink-0 text-[10px] font-semibold uppercase', style.color)}>{style.label}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{r.description}</p>
                  </div>
                )
              })}
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} transition={fadeInUpTransition} className="rounded-xl border border-border bg-background/40 p-4">
            <div className="mb-3 flex items-center gap-2">
              <GitBranch className="size-4 text-purple" />
              <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground">Escenarios posibles</h3>
            </div>
            <div className="flex flex-col gap-2.5">
              {aiIntelligence.scenarios.map((s) => {
                const style = scenarioStyle[s.type]
                return (
                  <div key={s.type} className="rounded-lg border border-border bg-background/60 p-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className={cn('text-[10px] font-semibold uppercase tracking-wide', style.color)}>{style.label}</span>
                      <span className="font-mono text-xs font-semibold text-foreground">{s.probability}%</span>
                    </div>
                    <p className="mt-1 text-xs font-medium text-foreground/90">{s.title}</p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{s.description}</p>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-background">
                      <div className={cn('h-full rounded-full', style.bg)} style={{ width: `${s.probability}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
