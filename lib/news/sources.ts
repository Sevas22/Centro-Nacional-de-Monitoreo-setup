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
  { name: 'El Tiempo', feedUrl: 'https://www.eltiempo.com/rss/deportes.xml', category: 'Deportes', enabled: true },
  { name: 'El Tiempo', feedUrl: 'https://www.eltiempo.com/rss/cultura.xml', category: 'Cultura', enabled: true },
  { name: 'El Tiempo', feedUrl: 'https://www.eltiempo.com/rss/salud.xml', category: 'Salud', enabled: true },
  { name: 'El Tiempo', feedUrl: 'https://www.eltiempo.com/rss/tecnosfera.xml', category: 'Tecnología', enabled: true },
  { name: 'El Tiempo', feedUrl: 'https://www.eltiempo.com/rss/mundo.xml', category: 'Internacional', enabled: true },
  { name: 'El Tiempo', feedUrl: 'https://www.eltiempo.com/rss/vida.xml', category: 'Vida', enabled: true },
  { name: 'Semana', feedUrl: 'https://www.semana.com/arc/outboundfeeds/rss/', category: 'Nacional', enabled: true },
  {
    name: 'Infobae',
    feedUrl: 'https://www.infobae.com/arc/outboundfeeds/rss/category/colombia/',
    category: 'Nacional',
    enabled: true,
  },
  { name: 'El Heraldo', feedUrl: 'https://www.elheraldo.co/arc/outboundfeeds/rss/', category: 'Regional', enabled: true },
  { name: 'El País (Cali)', feedUrl: 'https://www.elpais.com.co/arc/outboundfeeds/rss/', category: 'Regional', enabled: true },
  {
    name: 'El Universal (Cartagena)',
    feedUrl: 'https://www.eluniversal.com.co/arc/outboundfeeds/rss/',
    category: 'Regional',
    enabled: true,
  },
  { name: 'Vanguardia', feedUrl: 'https://www.vanguardia.com/arc/outboundfeeds/rss/', category: 'Regional', enabled: true },
  { name: 'La Silla Vacía', feedUrl: 'https://www.lasillavacia.com/feed/', category: 'Política', enabled: true },
  { name: 'Las2orillas', feedUrl: 'https://www.las2orillas.co/feed/', category: 'Nacional', enabled: true },
  { name: 'Valora Analitik', feedUrl: 'https://www.valoraanalitik.com/feed/', category: 'Economía', enabled: true },
  { name: 'La República', feedUrl: 'https://www.larepublica.co/rss', category: 'Economía', enabled: true },
  { name: 'El Diario', feedUrl: 'https://www.eldiario.com.co/feed/', category: 'Nacional', enabled: true },
  { name: 'El Nuevo Día', feedUrl: 'https://www.elnuevodia.com.co/rss.xml', category: 'Regional', enabled: true },
  { name: "Q'hubo", feedUrl: 'https://www.qhubo.com/feed/', category: 'Nacional', enabled: true },
  { name: 'Diario del Sur', feedUrl: 'https://www.diariodelsur.com.co/feed/', category: 'Regional', enabled: true },
  // Del inventario de fuentes de Cauca que me pasaste (Inventario_URL_Cauca_SIFEM.xlsx) — de las
  // 27, estas 5 son las únicas con RSS real y activo (verificado con curl, contenido fechado a
  // hoy). Las demás no tienen feed (portales HTML puros, radio/TV sin RSS) y quedan pendientes.
  { name: 'Diario del Cauca', feedUrl: 'https://diariodelcauca.com.co/feed/', category: 'Regional', enabled: true },
  { name: 'El Liberal Popayán', feedUrl: 'https://elliberalpopayan.com/feed/', category: 'Regional', enabled: true },
  {
    name: 'Periódico La Campana',
    feedUrl: 'https://www.periodicolacampana.com/feed/',
    category: 'Regional',
    enabled: true,
  },
  { name: 'Periódico Virtual', feedUrl: 'https://periodicovirtual.com/rss/', category: 'Regional', enabled: true },
  { name: 'Fiscalía General', feedUrl: 'https://www.fiscalia.gov.co/feed/', category: 'Seguridad', enabled: true },
]
