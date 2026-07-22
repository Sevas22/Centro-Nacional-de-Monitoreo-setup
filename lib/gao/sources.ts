export interface GaoSource {
  name: string
  feedUrl: string
  enabled: boolean
}

export const gaoSources: GaoSource[] = [
  { name: 'INDEPAZ', feedUrl: 'https://indepaz.org.co/feed/', enabled: true },
  { name: 'PARES', feedUrl: 'https://pares.com.co/feed/', enabled: true },
  // Blog suspendido públicamente por CERAC hasta agosto 2026 — reactivar cuando vuelva.
  { name: 'CERAC', feedUrl: 'https://blog.cerac.org.co/feed/', enabled: false },
]
