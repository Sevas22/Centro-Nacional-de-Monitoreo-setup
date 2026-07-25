'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Inbox } from 'lucide-react'
import type { NewsArticle } from '@/lib/types'
import { NewsCard } from '@/components/dashboard/news-card'
import { NewsDetailModal } from '@/components/dashboard/news-detail-modal'

// El filtrado real (departamento/categoría/sentimiento/fuente/búsqueda/fecha) ya lo hizo el
// servidor vía lib/news/query.ts — este componente solo muestra lo que ya llegó filtrado.
export function NewsFeed({ articles }: { articles: NewsArticle[] }) {
  const [selected, setSelected] = useState<NewsArticle | null>(null)

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
      </div>
      <NewsDetailModal article={selected} onClose={() => setSelected(null)} allArticles={articles} />
    </>
  )
}
