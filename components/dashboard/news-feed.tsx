'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Inbox } from 'lucide-react'
import { newsArticles, newsSources } from '@/data/mock'
import type { NewsArticle } from '@/lib/types'
import { NewsCard } from '@/components/dashboard/news-card'
import { NewsDetailModal } from '@/components/dashboard/news-detail-modal'
import { useDashboard } from '@/lib/store/dashboard-context'

const sentimentLabelToValue: Record<string, NewsArticle['sentiment']> = {
  Positivo: 'positive',
  Negativo: 'negative',
  Neutral: 'neutral',
}

// Pool of "incoming" articles for the live simulation
const incomingPool: NewsArticle[] = [
  {
    id: 'live-a',
    title: 'Última hora: consejo de seguridad extraordinario en Cali',
    summary: 'La Alcaldía convoca consejo de seguridad tras reporte de disturbios en el sur de la ciudad.',
    source: 'El País',
    department: 'Valle del Cauca',
    municipality: 'Cali',
    time: 'ahora',
    category: 'Seguridad',
    importance: 'critical',
    sentiment: 'negative',
    aiSummary: 'La IA detecta un evento en desarrollo con alta velocidad de propagación en redes sociales.',
    tags: ['seguridad', 'última hora'],
  },
  {
    id: 'live-b',
    title: 'Banco de la República mantiene tasa de interés',
    summary: 'La junta directiva decidió mantener la tasa de intervención, en línea con las expectativas del mercado.',
    source: 'Portafolio',
    department: 'Cundinamarca',
    municipality: 'Bogotá D.C.',
    time: 'ahora',
    category: 'Economía',
    importance: 'high',
    sentiment: 'neutral',
    aiSummary: 'Decisión monetaria alineada con proyecciones. La IA anticipa impacto moderado en mercados.',
    tags: ['banrep', 'economía'],
  },
  {
    id: 'live-c',
    title: 'Nuevo corredor vial conectará el Caribe con el interior',
    summary: 'El Gobierno adjudica la construcción de un corredor estratégico que reducirá tiempos de transporte de carga.',
    source: 'El Heraldo',
    department: 'Atlántico',
    municipality: 'Barranquilla',
    time: 'ahora',
    category: 'Economía',
    importance: 'normal',
    sentiment: 'positive',
    aiSummary: 'Proyecto de infraestructura con impacto positivo en competitividad regional según la IA.',
    tags: ['infraestructura', 'vías'],
  },
]

export function NewsFeed() {
  const [items, setItems] = useState<NewsArticle[]>(newsArticles)
  const [selected, setSelected] = useState<NewsArticle | null>(null)
  const [newIds, setNewIds] = useState<Set<string>>(new Set())
  const { state } = useDashboard()
  const { filters } = state

  const filtered = useMemo(() => {
    const sourceNames =
      filters.source === 'Todas' ? null : new Set(newsSources.filter((s) => s.type === filters.source).map((s) => s.name))
    const query = filters.query.trim().toLowerCase()

    return items.filter((a) => {
      if (filters.department !== 'Todos' && a.department !== filters.department) return false
      if (filters.category !== 'Todas' && a.category !== filters.category) return false
      if (filters.sentiment !== 'Todos' && a.sentiment !== sentimentLabelToValue[filters.sentiment]) return false
      if (sourceNames && !sourceNames.has(a.source)) return false
      if (query && !`${a.title} ${a.summary} ${a.tags.join(' ')}`.toLowerCase().includes(query)) return false
      return true
    })
  }, [items, filters])

  useEffect(() => {
    let count = 0
    const interval = setInterval(() => {
      const template = incomingPool[count % incomingPool.length]
      const id = `${template.id}-${Date.now()}`
      const fresh = { ...template, id }
      count += 1
      setItems((prev) => [fresh, ...prev].slice(0, 40))
      setNewIds((prev) => new Set(prev).add(id))
      setTimeout(() => {
        setNewIds((prev) => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
      }, 2200)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <div aria-live="polite" className="flex max-h-[520px] flex-col gap-2.5 overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {filtered.map((article, i) => (
            <motion.div
              key={article.id}
              layout
              initial={i < newsArticles.length ? { opacity: 0, y: 10 } : { opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              transition={
                i < newsArticles.length
                  ? { delay: Math.min(i * 0.04, 0.4), duration: 0.3 }
                  : { type: 'spring', stiffness: 380, damping: 30 }
              }
            >
              <NewsCard article={article} isNew={newIds.has(article.id)} onClick={() => setSelected(article)} />
            </motion.div>
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <Inbox className="size-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Sin noticias con estos filtros.</p>
          </div>
        )}
      </div>
      <NewsDetailModal article={selected} onClose={() => setSelected(null)} />
    </>
  )
}
