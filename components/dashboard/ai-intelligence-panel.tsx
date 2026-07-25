import { Bot, Sparkles, Clock, GitBranch } from 'lucide-react'
import { MarkdownLite } from '@/components/briefings/markdown-lite'
import { formatTimeAgo } from '@/lib/utils'
import type { NewsArticle } from '@/lib/types'

export interface LatestBriefing {
  content: string
  generatedAt: string
}

// El resumen ejecutivo es el mismo Briefing real generado por lib/ai/briefing.ts (Sonnet, sobre
// espectro+GAO+noticias críticas reales) — no se genera un análisis nuevo aquí. Las secciones de
// "evaluación de riesgo" y "escenarios posibles" que tenía la versión anterior se eliminaron: eran
// porcentajes/probabilidades inventados sin ningún modelo real detrás.
export function AIIntelligencePanel({
  briefing,
  criticalArticles,
}: {
  briefing: LatestBriefing | null
  criticalArticles: NewsArticle[]
}) {
  return (
    <section className="glass relative overflow-hidden rounded-xl border-primary/25">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-transparent to-cyan/[0.06]" />

      <header className="relative flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Bot className="size-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Resumen Ejecutivo IA</h2>
        </div>
        {briefing && (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
              <Sparkles className="size-3" />
              Boletín diario
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[10px] text-muted-foreground">
              <Clock className="size-3" />
              Actualizado {formatTimeAgo(briefing.generatedAt)}
            </span>
          </div>
        )}
      </header>

      <div className="relative grid grid-cols-1 gap-4 p-4 lg:grid-cols-2">
        <div>
          {briefing ? (
            <MarkdownLite content={briefing.content} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Aún no se ha generado ningún boletín. Ve a{' '}
              <a href="/reportes" className="text-primary hover:underline">
                Reportes
              </a>{' '}
              para generar uno.
            </p>
          )}
        </div>

        <div className="rounded-xl border border-border bg-background/40 p-4">
          <div className="mb-3 flex items-center gap-2">
            <GitBranch className="size-4 text-destructive" />
            <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground">
              Noticias críticas (24h)
            </h3>
          </div>
          {criticalArticles.length === 0 ? (
            <p className="text-xs text-muted-foreground">Sin noticias críticas detectadas en las últimas 24 horas.</p>
          ) : (
            <ol className="flex flex-col gap-3">
              {criticalArticles.slice(0, 8).map((a, i) => (
                <li key={a.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className="size-2.5 rounded-full bg-destructive" />
                    {i < Math.min(criticalArticles.length, 8) - 1 && <span className="mt-1 w-px flex-1 bg-border" />}
                  </div>
                  <div className="pb-1">
                    <p className="font-mono text-[11px] text-muted-foreground">
                      {formatTimeAgo(a.publishedAt)} · {a.department}
                    </p>
                    <p className="text-xs leading-snug text-foreground/90">{a.title}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </section>
  )
}
