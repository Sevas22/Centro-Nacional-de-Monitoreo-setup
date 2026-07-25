import type { Sentiment } from '@/lib/types'

export const dateRangeOptions = [
  { value: 'recientes', label: 'Más recientes' },
  { value: 'hoy', label: 'Hoy' },
  { value: 'ayer', label: 'Ayer' },
  { value: '7d', label: 'Últimos 7 días' },
  { value: '30d', label: 'Últimos 30 días' },
] as const

export type DateRangeValue = (typeof dateRangeOptions)[number]['value']

const sentimentLabelToValue: Record<string, Sentiment> = {
  Positivo: 'positive',
  Negativo: 'negative',
  Neutral: 'neutral',
}

export interface NewsFilterParams {
  range?: string
  source?: string
  department?: string
  category?: string
  sentiment?: string
  q?: string
}

interface DateWindow {
  gte?: Date
  lt?: Date
}

/**
 * "recientes" (por defecto, sin filtro explícito del usuario) no le pone piso de fecha — trae los
 * N artículos más recientes que haya, sin importar cuánto tiempo pasó desde la última ingesta.
 * Esto evita que el dashboard se vea vacío solo porque el cron no corrió en las últimas horas.
 * Cuando el usuario elige explícitamente "Hoy"/"Ayer"/etc. sí se aplica el rango real — si de
 * verdad no hay noticias en esa ventana, mostrar "sin resultados" es lo honesto.
 */
export function dateWindowFor(range: string | undefined): DateWindow {
  const day = 24 * 60 * 60 * 1000
  const now = Date.now()
  switch (range) {
    case 'hoy':
      return { gte: new Date(now - day) }
    case 'ayer':
      return { gte: new Date(now - 2 * day), lt: new Date(now - day) }
    case '7d':
      return { gte: new Date(now - 7 * day) }
    case '30d':
      return { gte: new Date(now - 30 * day) }
    default:
      return {}
  }
}

/** where-clause de Prisma para NewsArticle a partir de los filtros — usado tanto en el fetch
 * principal del dashboard como en cualquier otra página que necesite el mismo filtrado real. */
export function buildNewsWhere(filters: NewsFilterParams) {
  const where: Record<string, unknown> = {}

  const window = dateWindowFor(filters.range)
  if (window.gte || window.lt) {
    where.publishedAt = { ...(window.gte && { gte: window.gte }), ...(window.lt && { lt: window.lt }) }
  }

  if (filters.department && filters.department !== 'Todos') where.department = filters.department
  if (filters.category && filters.category !== 'Todas') where.category = filters.category
  if (filters.source && filters.source !== 'Todas') where.source = filters.source
  if (filters.sentiment && filters.sentiment !== 'Todos' && sentimentLabelToValue[filters.sentiment]) {
    where.sentiment = sentimentLabelToValue[filters.sentiment]
  }
  if (filters.q?.trim()) {
    const q = filters.q.trim()
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { summary: { contains: q, mode: 'insensitive' } },
    ]
  }

  return where
}
