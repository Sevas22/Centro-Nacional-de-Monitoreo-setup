'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Inbox } from 'lucide-react'
import type { NewsArticle } from '@/lib/types'
import { NewsCard } from '@/components/dashboard/news-card'
import { NewsDetailModal } from '@/components/dashboard/news-detail-modal'

export function DepartmentNewsFeed({ articles }: { articles: NewsArticle[] }) {
  const [selected, setSelected] = useState<NewsArticle | null>(null)

  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
        <Inbox className="size-8 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">Sin noticias registradas para este departamento.</p>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-2.5">
        <AnimatePresence initial={false}>
          {articles.map((article, i) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.05, 0.4), duration: 0.3 }}
            >
              <NewsCard article={article} onClick={() => setSelected(article)} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <NewsDetailModal article={selected} onClose={() => setSelected(null)} />
    </>
  )
}
