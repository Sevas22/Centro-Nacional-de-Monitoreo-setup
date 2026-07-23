import type { ReactNode } from 'react'

// Renderizador mínimo para el markdown estructurado que pedimos generar en lib/ai/briefing.ts
// (solo encabezados ##, listas -, y párrafos). No se agrega una dependencia de markdown
// completa para un formato tan acotado y controlado por nuestro propio prompt.
export function MarkdownLite({ content }: { content: string }) {
  const lines = content.split('\n')
  const blocks: ReactNode[] = []
  let listItems: string[] = []

  function flushList() {
    if (listItems.length === 0) return
    blocks.push(
      <ul key={`ul-${blocks.length}`} className="ml-4 list-disc space-y-1">
        {listItems.map((item, i) => (
          <li key={i} className="text-sm leading-relaxed text-muted-foreground">
            {item}
          </li>
        ))}
      </ul>,
    )
    listItems = []
  }

  for (const raw of lines) {
    const line = raw.trim()
    if (line.startsWith('## ')) {
      flushList()
      blocks.push(
        <h3 key={`h-${blocks.length}`} className="mt-4 text-sm font-semibold uppercase tracking-wide text-primary first:mt-0">
          {line.slice(3)}
        </h3>,
      )
    } else if (line.startsWith('- ')) {
      listItems.push(line.slice(2))
    } else if (line.length > 0) {
      flushList()
      blocks.push(
        <p key={`p-${blocks.length}`} className="text-sm leading-relaxed text-foreground/90">
          {line}
        </p>,
      )
    }
  }
  flushList()

  return <div className="space-y-2">{blocks}</div>
}
