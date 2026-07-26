import Parser from 'rss-parser'
import { prisma } from '@/lib/db'
import { newsSources } from './sources'
import { scrapedSources } from './scrape-sources'
import { scrapeSource, fetchPublishedDate } from './scrape'
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
  // true solo para items por scraping (sin RSS) — su publishedAt inicial es la hora de ingesta,
  // un placeholder honesto pero no la fecha real de publicación. Se reemplaza más abajo por la
  // fecha real (leída del propio artículo) antes de guardar, y solo para los que resultan
  // nuevos — no tiene sentido re-visitar artículos que ya están en la base.
  needsDateFetch?: boolean
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

// Algunos feeds (ej. La República) usan <category domain="...">Texto</category> — el parser XML
// entrega eso como { _: "Texto", $: {...} } en vez de un string plano. Sin esto, Prisma rechaza
// el insert entero apenas aparece un feed con ese formato.
function normalizeTag(raw: unknown): string | null {
  if (typeof raw === 'string') return raw
  if (raw && typeof raw === 'object' && '_' in raw && typeof (raw as { _: unknown })._ === 'string') {
    return (raw as { _: string })._
  }
  return null
}

export async function ingestNewsSources(): Promise<NewsIngestResult[]> {
  // Con ~20 fuentes, traerlas una por una agotaría el límite de duración de la función serverless
  // (10s por defecto en Vercel Hobby) mucho antes de terminar. En paralelo, el tiempo total es el
  // de la fuente más lenta, no la suma de todas — y una fuente caída no bloquea a las demás.
  const rssResults = newsSources
    .filter((src) => src.enabled)
    .map(async (src) => {
      try {
        const feed = await parser.parseURL(src.feedUrl)
        const items: RawItem[] = []
        for (const item of feed.items) {
          if (!item.link || !item.title) continue
          items.push({
            sourceUrl: item.link,
            title: item.title,
            summary: (item.contentSnippet ?? item.summary ?? '').slice(0, 800),
            publishedAt: item.isoDate ? new Date(item.isoDate) : new Date(),
            source: src.name,
            category: src.category,
            tags: (item.categories ?? [])
              .map(normalizeTag)
              .filter((t): t is string => t !== null)
              .slice(0, 8),
          })
        }
        return { result: { source: `${src.name} (${src.category})`, fetched: items.length, new: 0 }, items }
      } catch (err) {
        return {
          result: {
            source: `${src.name} (${src.category})`,
            fetched: 0,
            new: 0,
            error: err instanceof Error ? err.message : 'Error desconocido',
          },
          items: [] as RawItem[],
        }
      }
    })

  // Fuentes sin RSS (ver lib/news/scrape-sources.ts): mismo patrón try/catch por fuente, para
  // que un sitio caído o que cambió de diseño no tumbe la ingesta completa.
  const scrapedResults = scrapedSources
    .filter((src) => src.enabled)
    .map(async (src) => {
      try {
        const scraped = await scrapeSource(src)
        const items: RawItem[] = scraped.map((s) => ({
          sourceUrl: s.link,
          title: s.title,
          summary: '',
          publishedAt: new Date(),
          source: src.name,
          category: src.category,
          tags: [],
          needsDateFetch: true,
        }))
        return { result: { source: `${src.name} (${src.category})`, fetched: items.length, new: 0 }, items }
      } catch (err) {
        return {
          result: {
            source: `${src.name} (${src.category})`,
            fetched: 0,
            new: 0,
            error: err instanceof Error ? err.message : 'Error desconocido',
          },
          items: [] as RawItem[],
        }
      }
    })

  const perSourceResults = await Promise.all([...rssResults, ...scrapedResults])

  const results = perSourceResults.map((r) => r.result)
  const rawItems = perSourceResults.flatMap((r) => r.items)

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

  // Solo para lo nuevo por scraping: entra a cada artículo y busca su fecha real de publicación
  // (meta tag / <time> / JSON-LD — ver lib/news/scrape.ts). Si el sitio no expone ninguna, se
  // queda con la hora de ingesta como respaldo honesto, no se inventa una fecha.
  await Promise.all(
    newItems
      .filter((item) => item.needsDateFetch)
      .map(async (item) => {
        const real = await fetchPublishedDate(item.sourceUrl)
        if (real) item.publishedAt = real
      }),
  )

  const classifications = new Map<string, ArticleClassification>()
  for (const batch of chunk(newItems, 20)) {
    try {
      const batchClassifications = await classifyArticles(
        batch.map((r) => ({ id: r.sourceUrl, title: r.title, summary: r.summary })),
      )
      for (const c of batchClassifications) classifications.set(c.id, c)
    } catch {
      // Si la clasificación falla (p. ej. sin GROQ_API_KEY), los artículos se guardan igual
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
      riskLevel: c?.riskLevel ?? ('low' as const),
      // Las fuentes por scraping no traen resumen (la página listado solo da título + link) —
      // usar el título como respaldo es honesto (no inventa contenido) y evita dejar el bloque
      // "Resumen IA" vacío en la tarjeta.
      aiSummary: c?.aiSummary ?? (item.summary || item.title),
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
