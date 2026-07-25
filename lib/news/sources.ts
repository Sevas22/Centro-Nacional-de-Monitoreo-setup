// Cada feed se verificó manualmente (curl, HTTP 200 + contenido real fechado al día de la
// verificación) antes de agregarlo — mismo criterio que lib/gao/sources.ts. La categoría es la
// del feed de origen (dato real de la fuente), no una clasificación inventada.
export interface NewsSourceFeed {
  name: string
  feedUrl: string
  category: string
  enabled: boolean
}

export const newsSources: NewsSourceFeed[] = [
  { name: 'El Tiempo', feedUrl: 'https://www.eltiempo.com/rss/colombia.xml', category: 'Nacional', enabled: true },
  { name: 'El Tiempo', feedUrl: 'https://www.eltiempo.com/rss/justicia.xml', category: 'Seguridad', enabled: true },
  { name: 'El Tiempo', feedUrl: 'https://www.eltiempo.com/rss/politica.xml', category: 'Política', enabled: true },
  { name: 'El Tiempo', feedUrl: 'https://www.eltiempo.com/rss/economia.xml', category: 'Economía', enabled: true },
  { name: 'El Tiempo', feedUrl: 'https://www.eltiempo.com/rss/bogota.xml', category: 'Regional', enabled: true },
  { name: 'Semana', feedUrl: 'https://www.semana.com/arc/outboundfeeds/rss/', category: 'Nacional', enabled: true },
  {
    name: 'Infobae',
    feedUrl: 'https://www.infobae.com/arc/outboundfeeds/rss/category/colombia/',
    category: 'Nacional',
    enabled: true,
  },
]
