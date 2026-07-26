import * as cheerio from 'cheerio'
import type { ScrapedSourceConfig } from './scrape-sources'

export interface ScrapedItem {
  title: string
  link: string
}

const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'

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

/**
 * La página de listado no trae la hora de publicación (a diferencia de RSS) — hay que entrar a
 * cada artículo. Prueba, en orden, los 3 mecanismos estándar que usan los sitios reales para
 * exponer la fecha de publicación (varía cuál tiene cada uno, nunca hay que adivinar cuál usa
 * un sitio dado — se prueban los tres y se usa el primero que aparezca):
 *   1. <meta property="article:published_time"> (Yoast SEO / Open Graph, el más común)
 *   2. <time datetime="..."> (HTML5 semántico)
 *   3. JSON-LD ("datePublished" dentro de <script type="application/ld+json">)
 * Si un sitio no expone ninguno de los tres, se devuelve null — mejor no tener fecha real que
 * inventar una, aunque eso obligue a usar la hora de ingesta como respaldo en ese caso.
 */
export async function fetchPublishedDate(url: string): Promise<Date | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10000),
      headers: { 'User-Agent': BROWSER_UA },
    })
    if (!res.ok) return null
    const html = await res.text()
    const $ = cheerio.load(html)

    const metaContent = $('meta[property="article:published_time"]').attr('content')
    if (metaContent) {
      const d = new Date(metaContent)
      if (!Number.isNaN(d.getTime())) return d
    }

    const timeAttr = $('time[datetime]').first().attr('datetime')
    if (timeAttr) {
      const d = new Date(timeAttr)
      if (!Number.isNaN(d.getTime())) return d
    }

    let jsonLdDate: Date | null = null
    $('script[type="application/ld+json"]').each((_, el) => {
      if (jsonLdDate) return
      const raw = $(el).html()
      if (!raw) return
      try {
        const parsed = JSON.parse(raw) as Record<string, unknown> | Record<string, unknown>[]
        const obj = Array.isArray(parsed) ? parsed[0] : parsed
        const dateStr = obj?.datePublished
        if (typeof dateStr === 'string') {
          const d = new Date(dateStr)
          if (!Number.isNaN(d.getTime())) jsonLdDate = d
        }
      } catch {
        // JSON-LD malformado — se ignora, se sigue probando lo que quede.
      }
    })
    return jsonLdDate
  } catch {
    return null
  }
}
