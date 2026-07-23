export interface DeptAlertSummary {
  department: string
  critico: number
  alto: number
  moderado: number
}

export function AlertRanking({ items }: { items: DeptAlertSummary[] }) {
  if (items.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">Sin departamentos en alerta en este momento.</p>
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((item, i) => (
        <div key={item.department} className="flex items-center gap-3 rounded-lg bg-background/40 px-3 py-2">
          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent/60 text-[10px] font-bold text-foreground">
            {i + 1}
          </span>
          <span className="flex-1 truncate text-sm font-medium text-foreground">{item.department}</span>
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            {item.critico > 0 && (
              <span className="rounded-full bg-destructive/15 px-1.5 py-0.5 text-[10px] font-semibold text-destructive">
                {item.critico} crítico
              </span>
            )}
            {item.alto > 0 && (
              <span className="rounded-full bg-warning/15 px-1.5 py-0.5 text-[10px] font-semibold text-warning">
                {item.alto} alto
              </span>
            )}
            {item.moderado > 0 && (
              <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                {item.moderado} moderado
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
