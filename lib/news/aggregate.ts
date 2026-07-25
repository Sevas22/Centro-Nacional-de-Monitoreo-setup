import type { NewsArticle } from '@/lib/generated/prisma/client'
import type { ActivityLevel, NewsArticle as UiNewsArticle } from '@/lib/types'
import { departmentNames } from '@/lib/spectrum/department-capitals'

/** Convierte una fila real de Prisma al shape que consumen los componentes de UI (fecha como
 * ISO string, municipality null -> undefined) — un solo lugar para esta conversión. */
export function serializeArticle(a: NewsArticle): UiNewsArticle {
  return {
    ...a,
    publishedAt: a.publishedAt.toISOString(),
    municipality: a.municipality ?? undefined,
    fullText: a.fullText ?? undefined,
  }
}

export interface DashboardKPIs {
  totalNewsToday: number
  breakingNews: number
  activeDepartments: number
  trendingTopics: number
  positivePercent: number
  negativePercent: number
  neutralPercent: number
  criticalAlerts: number
  totalSources: number
  avgArticlesPerHour: number
}

export interface DeptActivity {
  name: string
  newsCount: number
  level: ActivityLevel
}

export interface DashboardData {
  kpis: DashboardKPIs
  hourlyNews: { hour: string; count: number }[]
  categoryData: { category: string; count: number }[]
  sentimentData: { name: string; value: number; color: string }[]
  topDepartmentsBar: { name: string; count: number; level: ActivityLevel }[]
  wordCloud: { text: string; size: number; color: 'blue' | 'green' | 'purple' }[]
  heatmapDepts: string[]
  heatmapData: { dept: string; hour: number; value: number }[]
  deptActivity: DeptActivity[]
}

function levelFor(count: number, max: number): ActivityLevel {
  const ratio = max > 0 ? count / max : 0
  if (ratio > 0.75) return 'critical'
  if (ratio > 0.5) return 'high'
  if (ratio > 0.25) return 'medium'
  return 'low'
}

/** Los 33 departamentos siempre presentes (0 si no hay artículos reales) — para el mapa y las
 * páginas de departamentos, que necesitan mostrar el país completo, no solo los que tienen datos. */
export function computeDeptActivity(articles: { department: string }[]): DeptActivity[] {
  const counts = new Map<string, number>()
  for (const a of articles) {
    if (a.department === 'Nacional') continue
    counts.set(a.department, (counts.get(a.department) ?? 0) + 1)
  }
  const max = Math.max(1, ...counts.values())
  return departmentNames.map((name) => {
    const newsCount = counts.get(name) ?? 0
    return { name, newsCount, level: levelFor(newsCount, max) }
  })
}

export interface MunicipioActivity {
  name: string
  departmentName: string
  newsCount: number
  level: ActivityLevel
}

/** Solo incluye municipios con al menos un artículo real detectado (lib/news/departments.ts,
 * detectMunicipality) — no se rellenan los 1.122 municipios con ceros, sería ruido. */
export function computeMunicipioActivity(
  articles: { department: string; municipality: string | null }[],
): MunicipioActivity[] {
  const counts = new Map<string, number>()
  for (const a of articles) {
    if (!a.municipality) continue
    const key = `${a.department}|${a.municipality}`
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  const max = Math.max(1, ...counts.values())
  return [...counts.entries()]
    .map(([key, newsCount]) => {
      const [departmentName, name] = key.split('|')
      return { name, departmentName, newsCount, level: levelFor(newsCount, max) }
    })
    .sort((a, b) => b.newsCount - a.newsCount)
}

export interface SourceStats {
  name: string
  categories: string[]
  newsToday: number
}

// Sin uptime/latencia: no monitoreamos la salud de los feeds RSS, así que no se inventan
// métricas de infraestructura que no medimos — solo lo que sí es real: cuántos artículos trajo
// cada medio y en qué categorías.
export function computeSourceStats(articles: { source: string; category: string }[]): SourceStats[] {
  const bySource = new Map<string, { categories: Set<string>; count: number }>()
  for (const a of articles) {
    const entry = bySource.get(a.source) ?? { categories: new Set<string>(), count: 0 }
    entry.categories.add(a.category)
    entry.count++
    bySource.set(a.source, entry)
  }
  return [...bySource.entries()]
    .map(([name, { categories, count }]) => ({ name, categories: [...categories], newsToday: count }))
    .sort((a, b) => b.newsToday - a.newsToday)
}

/**
 * Todo lo que devuelve esto sale de artículos reales ya ingeridos (lib/news/ingest.ts) — nada
 * se inventa, solo se cuenta/agrupa. Mismo principio que lib/spectrum/national.ts.
 */
export function aggregateDashboard(articles: NewsArticle[]): DashboardData {
  const total = articles.length

  const deptCounts = new Map<string, number>()
  const categoryCounts = new Map<string, number>()
  const sentimentCounts = { positive: 0, negative: 0, neutral: 0 }
  const tagCounts = new Map<string, number>()
  const hourCounts = new Array(24).fill(0)
  const sourceNames = new Set<string>()
  let breakingNews = 0

  for (const a of articles) {
    if (a.department !== 'Nacional') deptCounts.set(a.department, (deptCounts.get(a.department) ?? 0) + 1)
    categoryCounts.set(a.category, (categoryCounts.get(a.category) ?? 0) + 1)
    sentimentCounts[a.sentiment]++
    for (const tag of a.tags) tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
    hourCounts[new Date(a.publishedAt).getHours()]++
    sourceNames.add(a.source)
    if (a.importance === 'critical') breakingNews++
  }

  const topDepartments = [...deptCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8)
  const maxDeptCount = topDepartments[0]?.[1] ?? 0

  const wordColors: ('blue' | 'green' | 'purple')[] = ['blue', 'green', 'purple']
  const topTags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30)
  const maxTagCount = topTags[0]?.[1] ?? 1

  const heatmapDepts = topDepartments.slice(0, 5).map(([name]) => name)
  const heatmapData: { dept: string; hour: number; value: number }[] = []
  for (const dept of heatmapDepts) {
    for (let hour = 0; hour < 24; hour++) {
      const value = articles.filter((a) => a.department === dept && new Date(a.publishedAt).getHours() === hour).length
      heatmapData.push({ dept, hour, value })
    }
  }

  return {
    kpis: {
      totalNewsToday: total,
      breakingNews,
      activeDepartments: deptCounts.size,
      trendingTopics: tagCounts.size,
      positivePercent: total > 0 ? Math.round((sentimentCounts.positive / total) * 100) : 0,
      negativePercent: total > 0 ? Math.round((sentimentCounts.negative / total) * 100) : 0,
      neutralPercent: total > 0 ? Math.round((sentimentCounts.neutral / total) * 100) : 0,
      criticalAlerts: breakingNews,
      totalSources: sourceNames.size,
      avgArticlesPerHour: Math.round((total / 24) * 10) / 10,
    },
    hourlyNews: hourCounts.map((count, hour) => ({ hour: `${String(hour).padStart(2, '0')}:00`, count })),
    categoryData: [...categoryCounts.entries()].map(([category, count]) => ({ category, count })),
    sentimentData: [
      { name: 'Positivo', value: sentimentCounts.positive, color: '#10b981' },
      { name: 'Negativo', value: sentimentCounts.negative, color: '#ef4444' },
      { name: 'Neutral', value: sentimentCounts.neutral, color: '#64748b' },
    ],
    topDepartmentsBar: topDepartments.map(([name, count]) => ({ name, count, level: levelFor(count, maxDeptCount) })),
    wordCloud: topTags.map(([text, count], i) => ({
      text,
      size: 12 + Math.round((count / maxTagCount) * 20),
      color: wordColors[i % wordColors.length],
    })),
    heatmapDepts,
    heatmapData,
    deptActivity: computeDeptActivity(articles),
  }
}
