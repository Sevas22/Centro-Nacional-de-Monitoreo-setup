'use client'

import { useState, useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Inbox, Loader2 } from 'lucide-react'
import type { NewsArticle } from '@/lib/types'
import { NewsCard } from '@/components/dashboard/news-card'
import { NewsDetailModal } from '@/components/dashboard/news-detail-modal'
import { DEFAULT_FEED_LIMIT, FEED_LIMIT_STEP, limitFor } from '@/lib/news/query'

// El filtrado real (departamento/categoría/sentimiento/fuente/búsqueda/fecha) ya lo hizo el
// servidor vía lib/news/query.ts — este componente solo muestra lo que ya llegó filtrado.
export function NewsFeed({ articles, totalCount }: { articles: NewsArticle[]; totalCount: number }) {
  const [selected, setSelected] = useState<NewsArticle | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const hasMore = totalCount > articles.length

  function loadMore() {
    const params = new URLSearchParams(searchParams.toString())
    const currentLimit = limitFor({ limit: params.get('limit') ?? undefined })
    params.set('limit', String(currentLimit + FEED_LIMIT_STEP))
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }

  return (
    <>
      <div aria-live="polite" className="flex max-h-[520px] flex-col gap-2.5 overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {articles.map((article, i) => (
            <motion.div
              key={article.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              transition={{ delay: Math.min(i * 0.04, 0.4), duration: 0.3 }}
            >
              <NewsCard article={article} onClick={() => setSelected(article)} />
            </motion.div>
          ))}
        </AnimatePresence>
        {articles.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <Inbox className="size-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Sin noticias con estos filtros.</p>
          </div>
        )}
        {hasMore && (
          <button
            onClick={loadMore}
            disabled={isPending}
            className="mt-1 flex items-center justify-center gap-2 rounded-lg border border-border py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              `Cargar más (${totalCount - articles.length} restantes)`
            )}
          </button>
        )}
      </div>
      <NewsDetailModal article={selected} onClose={() => setSelected(null)} allArticles={articles} />
    </>
  )
}
