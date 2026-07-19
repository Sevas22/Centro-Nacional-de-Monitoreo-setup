'use client'

import { useEffect, useRef, useState } from 'react'
import { Search, ChevronDown, Zap, Satellite, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ReportModal } from '@/components/report-modal'
import { useDashboard, type DashboardFilters } from '@/lib/store/dashboard-context'
import { useDebounce } from '@/lib/hooks/use-debounce'
import { departments, categoryData } from '@/data/mock'

const filterFields: { field: keyof DashboardFilters; label: string; options: string[] }[] = [
  { field: 'dateRange', label: 'Fecha', options: ['Hoy', 'Ayer', 'Últimos 7 días', 'Últimos 30 días'] },
  { field: 'source', label: 'Fuentes', options: ['Todas', 'Prensa', 'Radio', 'Revista', 'Digital'] },
  { field: 'department', label: 'Departamento', options: ['Todos', ...departments.map((d) => d.name)] },
  { field: 'category', label: 'Categoría', options: ['Todas', ...categoryData.map((c) => c.category)] },
  { field: 'sentiment', label: 'Sentimiento', options: ['Todos', 'Positivo', 'Negativo', 'Neutral'] },
]

function FilterDropdown({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: string[]
  value: string
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium transition-colors',
          open ? 'border-primary/50 text-foreground' : 'text-muted-foreground hover:text-foreground',
        )}
      >
        <span className="text-muted-foreground">{label}:</span>
        <span className="max-w-[110px] truncate text-foreground">{value}</span>
        <ChevronDown className={cn('size-3.5 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1.5 max-h-72 min-w-[180px] overflow-y-auto rounded-lg border border-border bg-popover p-1 shadow-2xl">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                onChange(opt)
                setOpen(false)
              }}
              className={cn(
                'flex w-full items-center rounded-md px-2.5 py-1.5 text-left text-xs transition-colors',
                value === opt ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function Navbar() {
  const [reportOpen, setReportOpen] = useState(false)
  const { state, setFilter, clearFilters } = useDashboard()
  const [searchInput, setSearchInput] = useState(state.filters.query)
  const debouncedSearch = useDebounce(searchInput, 300)

  useEffect(() => {
    setFilter('query', debouncedSearch)
  }, [debouncedSearch, setFilter])

  const hasActiveFilters =
    state.filters.department !== 'Todos' ||
    state.filters.category !== 'Todas' ||
    state.filters.sentiment !== 'Todos' ||
    state.filters.source !== 'Todas' ||
    state.filters.query !== ''

  return (
    <header className="fixed inset-x-0 left-[220px] top-0 z-30 flex h-[58px] items-center gap-3 border-b border-border bg-surface/80 px-4 backdrop-blur-xl">
      <div className="flex items-center gap-2 lg:hidden">
        <Satellite className="size-5 text-primary" />
      </div>

      <div className="relative w-full max-w-xs">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Buscar noticias, entidades, lugares..."
          className="h-9 w-full rounded-lg border border-border bg-background/60 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
        />
      </div>

      <div className="mx-1 h-6 w-px bg-border" />

      <div className="hidden flex-1 items-center gap-1.5 xl:flex">
        {filterFields.map((f) => (
          <FilterDropdown
            key={f.field}
            label={f.label}
            options={f.options}
            value={state.filters[f.field]}
            onChange={(value) => setFilter(f.field, value)}
          />
        ))}
        {hasActiveFilters && (
          <button
            onClick={() => {
              clearFilters()
              setSearchInput('')
            }}
            className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-destructive"
          >
            <X className="size-3.5" />
            Limpiar
          </button>
        )}
      </div>

      <div className="ml-auto flex items-center gap-3">
        <button
          onClick={() => setReportOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-primary to-info px-3 py-2 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5"
        >
          <Zap className="size-3.5" />
          Generar Reporte IA
        </button>

        <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-2.5 py-1.5">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-success" />
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-success">En vivo</span>
        </div>
      </div>

      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} />
    </header>
  )
}
