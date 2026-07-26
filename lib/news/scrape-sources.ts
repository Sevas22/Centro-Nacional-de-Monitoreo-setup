// Fuentes sin RSS público — se extraen leyendo el HTML de la página con un selector CSS
// verificado a mano (ver lib/news/scrape.ts). Cada selector se probó con cheerio contra la
// página real antes de agregarlo aquí; nunca se adivina un selector sin confirmar que devuelve
// texto real de artículos (no menús, "Ver más", etc.).
export interface ScrapedSourceConfig {
  name: string
  url: string
  listingSelector: string
  category: string
  enabled: boolean
}

export const scrapedSources: ScrapedSourceConfig[] = [
  {
    name: 'Cauca Noticias Radio',
    url: 'https://caucanoticiasradio.com/',
    listingSelector: 'article h3 a',
    category: 'Regional',
    enabled: true,
  },
  {
    name: 'RTVC Noticias',
    url: 'https://www.rtvcnoticias.com/',
    listingSelector: 'article h3 a',
    category: 'Nacional',
    enabled: true,
  },
  {
    name: 'Noticias RCN Popayán',
    url: 'https://www.noticiasrcn.com/temas/popayan',
    listingSelector: 'h3.title a',
    category: 'Regional',
    enabled: true,
  },
  {
    name: 'Policía Nacional',
    url: 'https://www.policia.gov.co/',
    listingSelector: '.views-field-title a',
    category: 'Seguridad',
    enabled: true,
  },
  {
    name: 'Defensoría del Pueblo',
    url: 'https://www.defensoria.gov.co/',
    listingSelector: 'article h3 a',
    category: 'Seguridad',
    enabled: true,
  },
]
