'use client'

import { Users } from 'lucide-react'

// La extracción de entidades (personas/organizaciones/empresas/lugares mencionados) requiere
// NER real que todavía no tenemos — un keyword-match como el de departamentos sería poco
// confiable para nombres propios. Se deja honesto en vez de rellenar con datos inventados.
export function TopEntities() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      <Users className="size-8 text-muted-foreground/50" />
      <p className="text-sm text-muted-foreground">Extracción de entidades aún no disponible.</p>
      <p className="max-w-xs text-xs text-muted-foreground/70">
        Requiere un pipeline de reconocimiento de entidades (NER) real — pendiente de implementar.
      </p>
    </div>
  )
}
