'use client'

import { Sparkles, MapPin, Clock, Radio, Share2, Bookmark, ExternalLink, Users, Building, Briefcase, Landmark } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Modal } from '@/components/modal'
import { useToast } from '@/components/toast-provider'
import type { NewsArticle } from '@/lib/types'
import { importanceLabel, sentimentStyle } from '@/lib/style-maps'
import { newsArticles } from '@/data/mock'

export function NewsDetailModal({ article, onClose }: { article: NewsArticle | null; onClose: () => void }) {
  const { toast } = useToast()
  const related = article
    ? newsArticles.filter((n) => n.department === article.department && n.id !== article.id).slice(0, 3)
    : []

  const entities = article?.entities

  return (
    <Modal open={!!article} onClose={onClose} maxWidth="max-w-2xl">
      {article && (
        <div>
          <div className="flex items-start justify-between gap-4 border-b border-border p-5">
            <div className="flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className={cn('rounded-md px-2 py-0.5 text-[11px] font-semibold', sentimentStyle[article.sentiment].className)}>
                  {sentimentStyle[article.sentiment].label}
                </span>
                <span className="rounded-md bg-accent/60 px-2 py-0.5 text-[11px] font-medium text-foreground/70">
                  {article.category}
                </span>
                <span className="rounded-md bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive">
                  Importancia {importanceLabel[article.importance]}
                </span>
              </div>
              <h2 className="text-pretty text-lg font-semibold leading-snug text-foreground">{article.title}</h2>
            </div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-5">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Radio className="size-3.5" />{article.source}</span>
              <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />{article.department}, {article.municipality}</span>
              <span className="inline-flex items-center gap-1"><Clock className="size-3.5" />{article.time}</span>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-foreground/90">{article.summary}</p>

            <div className="mt-4 rounded-xl border border-purple/20 bg-purple/[0.07] p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-purple" />
                <span className="text-xs font-semibold uppercase tracking-wide text-purple">Análisis de Inteligencia Artificial</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-foreground/85">{article.aiSummary}</p>
            </div>

            {entities && (
              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Entidades detectadas</p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <EntityGroup icon={Users} label="Personas" items={entities.persons} tone="text-primary" />
                  <EntityGroup icon={Building} label="Organizaciones" items={entities.organizations} tone="text-success" />
                  <EntityGroup icon={Briefcase} label="Empresas" items={entities.companies} tone="text-warning" />
                  <EntityGroup icon={Landmark} label="Lugares" items={entities.locations} tone="text-purple" />
                </div>
              </div>
            )}

            {related.length > 0 && (
              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Noticias relacionadas</p>
                <div className="flex flex-col gap-2">
                  {related.map((r) => (
                    <div key={r.id} className="rounded-lg border border-border bg-background/40 p-2.5">
                      <p className="text-xs font-medium text-foreground">{r.title}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{r.source} · {r.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 border-t border-border p-4">
            <button
              onClick={() => toast({ variant: 'success', title: 'Noticia guardada', description: 'Añadida a tus marcadores.' })}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <Bookmark className="size-3.5" /> Guardar
            </button>
            <button
              onClick={() => toast({ variant: 'info', title: 'Enlace copiado', description: 'El enlace de la noticia se copió al portapapeles.' })}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <Share2 className="size-3.5" /> Compartir
            </button>
            {article.sourceUrl ? (
              <a
                href={article.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                <ExternalLink className="size-3.5" /> Ver fuente original
              </a>
            ) : (
              <button
                disabled
                className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-primary/50 px-3 py-2 text-xs font-semibold text-primary-foreground/70"
              >
                <ExternalLink className="size-3.5" /> Ver fuente original
              </button>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}

function EntityGroup({
  icon: Icon,
  label,
  items,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  items: string[]
  tone: string
}) {
  return (
    <div className="rounded-lg border border-border bg-background/40 p-3">
      <div className={cn('flex items-center gap-1.5', tone)}>
        <Icon className="size-3.5" />
        <span className="text-[11px] font-semibold">{label}</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {items.length === 0 && <span className="text-[11px] text-muted-foreground">—</span>}
        {items.map((it) => (
          <span key={it} className="rounded-md bg-accent/60 px-1.5 py-0.5 text-[11px] text-foreground/80">
            {it}
          </span>
        ))}
      </div>
    </div>
  )
}
