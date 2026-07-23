'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Sparkles } from 'lucide-react'
import { useToast } from '@/components/toast-provider'

export function GenerateBriefingButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  async function handleClick() {
    setLoading(true)
    try {
      const res = await fetch('/api/briefings/generate', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error generando el briefing')

      toast({ variant: 'success', title: 'Briefing generado', description: 'Ya está disponible en el historial.' })
      router.refresh()
    } catch (err) {
      toast({
        variant: 'warning',
        title: 'No se pudo generar el briefing',
        description: err instanceof Error ? err.message : 'Error desconocido',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-primary to-info px-3 py-2 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5 disabled:opacity-60"
    >
      {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
      {loading ? 'Generando…' : 'Generar briefing ejecutivo'}
    </button>
  )
}
