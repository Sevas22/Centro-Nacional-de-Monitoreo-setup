'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import type { CategoryPoint } from '@/lib/types'

function intensityColor(count: number, max: number): string {
  const ratio = max > 0 ? count / max : 0
  if (ratio > 0.75) return '#dc2626'
  if (ratio > 0.5) return '#ea580c'
  if (ratio > 0.3) return '#f59e0b'
  return '#10b981'
}

// Mismo dato que alimenta el CategoryChart (lib/news/aggregate.ts -> categoryData), solo que en
// formato tabla — cada categoría real detectada en los artículos ingeridos y cuántos se encontraron.
export function CategoryTable({ data }: { data: CategoryPoint[] }) {
  const [query, setQuery] = useState('')

  const sorted = useMemo(() => [...data].sort((a, b) => b.count - a.count), [data])
  const filtered = useMemo(
    () => sorted.filter((c) => c.category.toLowerCase().includes(query.toLowerCase())),
    [sorted, query],
  )
  const maxCount = Math.max(1, ...sorted.map((c) => c.count))
  const total = sorted.reduce((acc, c) => acc + c.count, 0)

  return (
    <div>
      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar categoría..."
          className="w-full rounded-lg border border-border bg-background/50 py-2 pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50"
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-background/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-2.5 font-medium">Categoría</th>
              <th className="px-4 py-2.5 font-medium">Noticias</th>
              <th className="hidden px-4 py-2.5 font-medium sm:table-cell">% del total</th>
              <th className="hidden px-4 py-2.5 font-medium md:table-cell">Distribución</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const color = intensityColor(c.count, maxCount)
              return (
                <tr key={c.category} className="border-b border-border/50 last:border-0 hover:bg-accent/30">
                  <td className="px-4 py-2.5 font-medium text-foreground">{c.category}</td>
                  <td className="px-4 py-2.5 font-mono font-semibold text-foreground">
                    {c.count.toLocaleString('es-CO')}
                  </td>
                  <td className="hidden px-4 py-2.5 text-muted-foreground sm:table-cell">
                    {total > 0 ? Math.round((c.count / total) * 100) : 0}%
                  </td>
                  <td className="hidden px-4 py-2.5 md:table-cell">
                    <div className="h-1.5 w-full max-w-[160px] overflow-hidden rounded-full bg-background">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${(c.count / maxCount) * 100}%`, backgroundColor: color }}
                      />
                    </div>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No se encontraron categorías.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
