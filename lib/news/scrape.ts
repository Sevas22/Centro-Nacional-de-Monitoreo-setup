import * as cheerio from 'cheerio'
import type { ScrapedSourceConfig } from './scrape-sources'

export interface ScrapedItem {
  title: string
  link: string
}

const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'

// Sin fecha real: la página listado no trae la hora de publicación de cada nota (a diferencia
// de RSS, que sí la trae). publishedAt para estos artículos queda como el momento de la
// ingesta — es honesto (así se enteró el sistema) pero no pretende ser la hora real de
// publicación del medio, que estas páginas no exponen.
export async function scrapeSource(config: ScrapedSourceConfig): Promise<ScrapedItem[]> {
  const res = await fetch(config.url, {
    signal: AbortSignal.timeout(15000),
    headers: { 'User-Agent': BROWSER_UA },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const html = await res.text()
  const $ = cheerio.load(html)

  const seen = new Set<string>()
  const items: ScrapedItem[] = []
  $(config.listingSelector).each((_, el) => {
    const title = $(el).text().trim().replace(/\s+/g, ' ')
    const href = $(el).attr('href')
    // Filtra "Ver más", paginación y enlaces vacíos — nunca guarda un título que no sea
    // texto real de artículo.
    if (!href || title.length < 15) return
    const link = new URL(href, config.url).toString()
    if (seen.has(link)) return
    seen.add(link)
    items.push({ title, link })
  })
  return items.slice(0, 30)
}
