import type { ActivityLevel, Importance, RiskLevel } from '@/lib/types'

export const accentMap: Record<string, { text: string; bg: string; border: string; hex: string }> = {
  blue: { text: 'text-primary', bg: 'bg-primary/10', border: 'bg-primary', hex: '#3b82f6' },
  red: { text: 'text-destructive', bg: 'bg-destructive/10', border: 'bg-destructive', hex: '#ef4444' },
  orange: { text: 'text-warning', bg: 'bg-warning/10', border: 'bg-warning', hex: '#f59e0b' },
  green: { text: 'text-success', bg: 'bg-success/10', border: 'bg-success', hex: '#10b981' },
  purple: { text: 'text-purple', bg: 'bg-purple/10', border: 'bg-purple', hex: '#a78bfa' },
  cyan: { text: 'text-cyan', bg: 'bg-cyan/10', border: 'bg-cyan', hex: '#22d3ee' },
}

export const importanceBorder: Record<Importance, string> = {
  critical: 'border-l-destructive',
  high: 'border-l-warning',
  normal: 'border-l-success',
}

export const importanceLabel: Record<Importance, string> = {
  critical: 'Crítica',
  high: 'Alta',
  normal: 'Normal',
}

export const activityColor: Record<ActivityLevel, string> = {
  low: '#134e2f',
  medium: '#a16207',
  high: '#ea580c',
  critical: '#dc2626',
}

export const activityLabel: Record<ActivityLevel, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  critical: 'Crítica',
}

// Mismos 4 niveles/colores que activityColor (low/medium/high/critical) — clasificación real de
// riesgo por IA (lib/ai/classify-article.ts) a partir del contenido de cada noticia, reemplaza el
// antiguo "sentimiento" positivo/negativo/neutral que no era útil para monitoreo de seguridad.
export const riskLevelLabel: Record<RiskLevel, string> = {
  low: 'Bajo',
  medium: 'Medio',
  high: 'Alto',
  critical: 'Crítico',
}

export function riskLevelBadgeStyle(level: RiskLevel): { backgroundColor: string; color: string } {
  return { backgroundColor: `${activityColor[level]}22`, color: activityColor[level] }
}
