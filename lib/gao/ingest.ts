import Parser from 'rss-parser'
import { prisma } from '@/lib/db'
import { gaoSources } from './sources'
import { detectMentionedGroups } from './groups'

const parser = new Parser({ timeout: 15000 })

export interface IngestResult {
  source: string
  fetched: number
  upserted: number
  error?: string
}

export async function ingestGaoSources(): Promise<IngestResult[]> {
  const results: IngestResult[] = []

  for (const src of gaoSources) {
    if (!src.enabled) continue

    try {
      const feed = await parser.parseURL(src.feedUrl)
      let upserted = 0

      for (const item of feed.items) {
        if (!item.link || !item.title) continue

        const summary = (item.contentSnippet ?? item.summary ?? '').slice(0, 600)
        const mentionedGroups = detectMentionedGroups(`${item.title} ${summary}`)
        const publishedAt = item.isoDate ? new Date(item.isoDate) : new Date()
        const categories = (item.categories ?? []).slice(0, 10)

        await prisma.gaoSourceItem.upsert({
          where: { link: item.link },
          update: { title: item.title, summary, publishedAt, categories, mentionedGroups },
          create: {
            source: src.name,
            title: item.title,
            link: item.link,
            summary,
            publishedAt,
            categories,
            mentionedGroups,
          },
        })
        upserted++
      }

      results.push({ source: src.name, fetched: feed.items.length, upserted })
    } catch (err) {
      results.push({
        source: src.name,
        fetched: 0,
        upserted: 0,
        error: err instanceof Error ? err.message : 'Error desconocido',
      })
    }
  }

  return results
}
