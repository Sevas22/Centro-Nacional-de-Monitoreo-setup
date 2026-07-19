import type { LucideIcon } from 'lucide-react'
import { Construction } from 'lucide-react'
import { PageHeader, PageTransition } from '@/components/page-shell'

export function ComingSoon({
  title,
  subtitle,
  icon: Icon = Construction,
  note,
}: {
  title: string
  subtitle: string
  icon?: LucideIcon
  note?: string
}) {
  return (
    <PageTransition>
      <PageHeader title={title} subtitle={subtitle} />
      <div className="glass flex min-h-[340px] flex-col items-center justify-center rounded-xl p-8 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="size-7" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-foreground">Módulo en construcción</h2>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          {note ?? 'Esta sección estará disponible próximamente con nuevas herramientas de análisis e inteligencia.'}
        </p>
      </div>
    </PageTransition>
  )
}
