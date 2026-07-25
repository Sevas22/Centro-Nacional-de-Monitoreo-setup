import Parser from 'rss-parser'
import { prisma } from '@/lib/db'
import { newsSources } from './sources'
import { detectDepartment, detectMunicipality } from './departments'
import { classifyArticles, type ArticleClassification } from '@/lib/ai/classify-article'

const parser = new Parser({ timeout: 15000 })

export interface NewsIngestResult {
  source: string
  fetched: number
  new: number
  error?: string
}

interface RawItem {
  sourceUrl: string
  title: string
  summary: string
  publishedAt: Date
  source: string
  category: string
  tags: string[]
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

export async function ingestNewsSources(): Promise<NewsIngestResult[]> {
  const results: NewsIngestResult[] = []
  const rawItems: RawItem[] = []

  for (const src of newsSources) {
    if (!src.enabled) continue

    try {
      const feed = await parser.parseURL(src.feedUrl)
      let fetched = 0
      for (const item of feed.items) {
        if (!item.link || !item.title) continue
        fetched++
        rawItems.push({
          sourceUrl: item.link,
          title: item.title,
          summary: (item.contentSnippet ?? item.summary ?? '').slice(0, 800),
          publishedAt: item.isoDate ? new Date(item.isoDate) : new Date(),
          source: src.name,
          category: src.category,
          tags: (item.categories ?? []).slice(0, 8),
        })
      }
      results.push({ source: `${src.name} (${src.category})`, fetched, new: 0 })
    } catch (err) {
      results.push({
        source: `${src.name} (${src.category})`,
        fetched: 0,
        new: 0,
        error: err instanceof Error ? err.message : 'Error desconocido',
      })
    }
  }

  if (rawItems.length === 0) return results

  // Dedupe entre feeds (el mismo artículo puede aparecer en varias categorías del mismo medio)
  // y contra lo que ya está en la base, para no re-clasificar con IA lo que ya existe.
  const uniqueByUrl = new Map(rawItems.map((r) => [r.sourceUrl, r]))
  const urls = [...uniqueByUrl.keys()]
  const existing = await prisma.newsArticle.findMany({
    where: { sourceUrl: { in: urls } },
    select: { sourceUrl: true },
  })
  const existingUrls = new Set(existing.map((e) => e.sourceUrl))
  const newItems = [...uniqueByUrl.values()].filter((r) => !existingUrls.has(r.sourceUrl))

  if (newItems.length === 0) return results

  const classifications = new Map<string, ArticleClassification>()
  for (const batch of chunk(newItems, 20)) {
    try {
      const batchClassifications = await classifyArticles(
        batch.map((r) => ({ id: r.sourceUrl, title: r.title, summary: r.summary })),
      )
      for (const c of batchClassifications) classifications.set(c.id, c)
    } catch {
      // Si la clasificación falla (p. ej. sin ANTHROPIC_API_KEY), los artículos se guardan igual
      // con un fallback honesto abajo — nunca se descarta una noticia real por esto.
    }
  }

  const rows = newItems.map((item) => {
    const c = classifications.get(item.sourceUrl)
    const text = `${item.title} ${item.summary}`
    const department = detectDepartment(text)
    return {
      title: item.title,
      summary: item.summary,
      source: item.source,
      sourceUrl: item.sourceUrl,
      department,
      municipality: detectMunicipality(text, department),
      publishedAt: item.publishedAt,
      category: item.category,
      importance: c?.importance ?? ('normal' as const),
      sentiment: c?.sentiment ?? ('neutral' as const),
      aiSummary: c?.aiSummary ?? item.summary,
      tags: item.tags,
    }
  })

  await prisma.newsArticle.createMany({ data: rows, skipDuplicates: true })

  const newBySource = new Map<string, number>()
  for (const item of newItems) {
    const key = `${item.source} (${item.category})`
    newBySource.set(key, (newBySource.get(key) ?? 0) + 1)
  }
  for (const r of results) r.new = newBySource.get(r.source) ?? 0

  return results
}
