'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, Bell, BellOff, CheckCircle2 } from 'lucide-react'
import { PageHeader, PageTransition } from '@/components/page-shell'
import { alerts as initialAlerts } from '@/data/mock'
import { useToast } from '@/components/toast-provider'
import type { AlertItem } from '@/lib/types'

const severityStyle: Record<AlertItem['severity'], { color: string; label: string }> = {
  critical: { color: 'var(--accent-red)', label: 'Crítica' },
  high: { color: 'var(--accent-orange)', label: 'Alta' },
  medium: { color: 'var(--accent-blue)', label: 'Media' },
  low: { color: 'var(--accent-green)', label: 'Baja' },
}

export default function AlertasPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>(initialAlerts)
  const { toast } = useToast()

  const dismiss = (id: string) => {
    const alert = alerts.find((a) => a.id === id)
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, active: false } : a)))
    toast({ variant: 'success', title: 'Alerta resuelta', description: alert?.title })
  }

  const activeCount = alerts.filter((a) => a.active).length

  return (
    <PageTransition>
      <PageHeader
        title="Centro de Alertas"
        subtitle="Notificaciones automáticas generadas por el sistema de inteligencia"
        badge={
          <span className="flex items-center gap-2 rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-destructive">
            <Bell className="size-3.5" />
            {activeCount} activas
          </span>
        }
      />

      <div className="flex flex-col gap-3">
        <AnimatePresence initial={false}>
          {alerts.map((alert) => {
            const style = severityStyle[alert.severity]
            return (
              <motion.div
                key={alert.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`glass flex items-start gap-4 rounded-xl p-4 ${alert.active ? '' : 'opacity-60'}`}
                style={{ borderLeft: `3px solid ${alert.active ? style.color : 'var(--border)'}` }}
              >
                <div
                  className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${style.color}1f`, color: style.color }}
                >
                  {alert.active ? <AlertTriangle className="size-5" /> : <CheckCircle2 className="size-5" />}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">{alert.title}</h3>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
                      style={{ backgroundColor: `${style.color}22`, color: style.color }}
                    >
                      {style.label}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{alert.description}</p>
                  <p className="mt-1.5 text-[11px] text-muted-foreground/70">{alert.time}</p>
                </div>

                {alert.active ? (
                  <button
                    onClick={() => dismiss(alert.id)}
                    className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-success/40 hover:text-success"
                  >
                    <CheckCircle2 className="size-3.5" />
                    Resolver
                  </button>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs text-success">
                    <BellOff className="size-3.5" />
                    Resuelta
                  </span>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </PageTransition>
  )
}
