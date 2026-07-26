'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Search, ChevronDown, Zap, Satellite, X, Menu, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/lib/hooks/use-debounce'
import { departmentNames } from '@/lib/spectrum/department-capitals'
import { newsSources } from '@/lib/news/sources'
import { dateRangeOptions } from '@/lib/news/query'

const sourceNames = [...new Set(newsSources.map((s) => s.name))]
const categoryNames = [...new Set(newsSources.map((s) => s.category))]

// Los filtros viven en la URL (?range=&source=&department=&category=&risk=&q=), no en un
// Context de React — así la página que corresponda (hoy: /dashboard) puede leerlos en el
// servidor y filtrar de verdad con Prisma, en vez de solo esconder tarjetas ya cargadas.
const filterFields: { param: string; label: string; options: { value: string; label: string }[] }[] = [
  { param: 'range', label: 'Fecha', options: dateRangeOptions.map((o) => ({ value: o.value, label: o.label })) },
  {
    param: 'source',
    label: 'Fuentes',
    options: [{ value: 'Todas', label: 'Todas' }, ...sourceNames.map((s) => ({ value: s, label: s }))],
  },
  {
    param: 'department',
    label: 'Departamento',
    options: [
      { value: 'Todos', label: 'Todos' },
      { value: 'Nacional', label: 'Nacional' },
      ...departmentNames.map((d) => ({ value: d, label: d })),
    ],
  },
  {
    param: 'category',
    label: 'Categoría',
    options: [{ value: 'Todas', label: 'Todas' }, ...categoryNames.map((c) => ({ value: c, label: c }))],
  },
  {
    param: 'risk',
    label: 'Riesgo',
    options: [
      { value: 'Todos', label: 'Todos' },
      { value: 'Bajo', label: 'Bajo' },
      { value: 'Medio', label: 'Medio' },
      { value: 'Alto', label: 'Alto' },
      { value: 'Crítico', label: 'Crítico' },
    ],
  },
]

function FilterDropdown({
  label,
  options,
  value,
  onChange,
  fullWidth,
}: {
  label: string
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
  fullWidth?: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = options.find((o) => o.value === value)?.label ?? options[0].label

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div ref={ref} className={cn('relative', fullWidth && 'w-full')}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium transition-colors',
          fullWidth && 'w-full justify-between',
          open ? 'border-primary/50 text-foreground' : 'text-muted-foreground hover:text-foreground',
        )}
      >
        <span className="text-muted-foreground">{label}:</span>
        <span className={cn('truncate text-foreground', !fullWidth && 'max-w-[110px]')}>{current}</span>
        <ChevronDown className={cn('size-3.5 shrink-0 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div
          className={cn(
            'absolute left-0 top-full z-50 mt-1.5 max-h-72 overflow-y-auto rounded-lg border border-border bg-popover p-1 shadow-2xl',
            fullWidth ? 'w-full' : 'min-w-[180px]',
          )}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value)
                setOpen(false)
              }}
              className={cn(
                'flex w-full items-center rounded-md px-2.5 py-1.5 text-left text-xs transition-colors',
                value === opt.value
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [searchInput, setSearchInput] = useState(searchParams.get('q') ?? '')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const debouncedSearch = useDebounce(searchInput, 400)
  // /dashboard es force-dynamic (pega contra Prisma en cada navegación), así que un router.push
  // tarda en resolver. Si "Limpiar" navega y justo después el efecto de abajo dispara su propio
  // push, puede leer un searchParams todavía viejo (de antes de limpiar) y resucitar los filtros
  // que se acababan de borrar. Este flag hace que ese único push post-limpiar se salte.
  const skipNextSyncRef = useRef(false)

  function setParam(key: string, value: string, defaultValue?: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (!value || value === defaultValue) params.delete(key)
    else params.set(key, value)
    router.push(params.size > 0 ? `${pathname}?${params.toString()}` : pathname)
  }

  useEffect(() => {
    if (skipNextSyncRef.current) {
      skipNextSyncRef.current = false
      return
    }
    if (debouncedSearch !== (searchParams.get('q') ?? '')) setParam('q', debouncedSearch)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  const hasActiveFilters = [...searchParams.keys()].length > 0

  function clearFilters() {
    if (searchInput) skipNextSyncRef.current = true
    setSearchInput('')
    router.push(pathname)
  }

  return (
    <header className="fixed inset-x-0 left-0 top-0 z-30 flex h-[58px] items-center gap-2 border-b border-border bg-surface/80 px-3 backdrop-blur-xl sm:gap-3 sm:px-4 md:left-[220px]">
      <button
        onClick={onMenuClick}
        aria-label="Abrir menú"
        className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground md:hidden"
      >
        <Menu className="size-5" />
      </button>

      <div className="flex items-center gap-2 md:hidden">
        <Satellite className="size-5 text-primary" />
      </div>

      <div className="relative min-w-0 flex-1 sm:max-w-xs sm:flex-none">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Buscar noticias..."
          className="h-9 w-full rounded-lg border border-border bg-background/60 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
        />
      </div>

      <div className="mx-1 hidden h-6 w-px bg-border sm:block" />

      <div className="hidden flex-1 items-center gap-1.5 xl:flex">
        {filterFields.map((f) => (
          <FilterDropdown
            key={f.param}
            label={f.label}
            options={f.options}
            value={searchParams.get(f.param) ?? f.options[0].value}
            onChange={(value) => setParam(f.param, value, f.options[0].value)}
          />
        ))}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-destructive"
          >
            <X className="size-3.5" />
            Limpiar
          </button>
        )}
      </div>

      {/* Mismo listado de filtros que arriba, pero en un panel desplegable — por debajo de xl no
          alcanza el ancho para mostrarlos todos en línea (antes directamente desaparecían). */}
      <div className="relative xl:hidden">
        <button
          onClick={() => setMobileFiltersOpen((o) => !o)}
          className={cn(
            'relative flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium transition-colors',
            mobileFiltersOpen ? 'border-primary/50 text-foreground' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <SlidersHorizontal className="size-3.5" />
          <span className="hidden sm:inline">Filtros</span>
          {hasActiveFilters && (
            <span className="absolute -right-1 -top-1 flex size-2.5 items-center justify-center rounded-full bg-primary" />
          )}
        </button>

        {mobileFiltersOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/50"
              onClick={() => setMobileFiltersOpen(false)}
              aria-hidden="true"
            />
            <div className="glass fixed inset-x-3 top-[66px] z-50 flex max-h-[75vh] flex-col gap-3 overflow-y-auto rounded-xl border border-border p-3.5 shadow-2xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-1.5 sm:w-72">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Filtros</p>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  aria-label="Cerrar filtros"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>
              <div className="flex flex-col gap-2.5">
                {filterFields.map((f) => (
                  <div key={f.param} className="flex flex-col gap-1">
                    <label className="text-[11px] text-muted-foreground">{f.label}</label>
                    <FilterDropdown
                      label={f.label}
                      options={f.options}
                      value={searchParams.get(f.param) ?? f.options[0].value}
                      onChange={(value) => setParam(f.param, value, f.options[0].value)}
                      fullWidth
                    />
                  </div>
                ))}
              </div>
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    clearFilters()
                    setMobileFiltersOpen(false)
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-border py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-destructive"
                >
                  <X className="size-3.5" />
                  Limpiar filtros
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <Link
          href="/reportes"
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-primary to-info px-2.5 py-2 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5 sm:px-3"
        >
          <Zap className="size-3.5" />
          <span className="hidden sm:inline">Generar Reporte IA</span>
        </Link>

        <div className="hidden items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-2.5 py-1.5 sm:flex">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-success" />
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-success">En vivo</span>
        </div>
      </div>
    </header>
  )
}
