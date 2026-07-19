'use client'

import { Sparkles, MapPin, Clock, Radio } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NewsArticle } from '@/lib/types'
import { importanceBorder, sentimentStyle } from '@/lib/style-maps'

interface NewsCardProps {
  article: NewsArticle
  onClick?: () => void
  isNew?: boolean
}

export function NewsCard({ article, onClick, isNew }: NewsCardProps) {
  const sent = sentimentStyle[article.sentiment]

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full rounded-xl border border-border border-l-2 bg-card/60 p-3.5 text-left transition-all hover:border-primary/50 hover:bg-card',
        importanceBorder[article.importance],
        isNew && 'flash-border',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-pretty text-sm font-semibold leading-snug text-foreground">{article.title}</h3>
        <span className={cn('shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold', sent.className)}>
          {sent.label}
        </span>
      </div>

      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{article.summary}</p>

      <div className="mt-2.5 rounded-lg border border-purple/20 bg-purple/[0.07] p-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="size-3 text-purple" />
          <span className="text-[10px] font-semibold uppercase tracking-wide text-purple">Resumen IA</span>
        </div>
        <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-foreground/80">{article.aiSummary}</p>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Radio className="size-3" />
          {article.source}
        </span>
        <span className="inline-flex items-center gap-1">
          <MapPin className="size-3" />
          {article.department}
        </span>
        <span className="rounded-md bg-accent/60 px-1.5 py-0.5 text-[10px] font-medium text-foreground/70">
          {article.category}
        </span>
        <span className="ml-auto inline-flex items-center gap-1">
          <Clock className="size-3" />
          {article.time}
        </span>
      </div>
    </button>
  )
}
