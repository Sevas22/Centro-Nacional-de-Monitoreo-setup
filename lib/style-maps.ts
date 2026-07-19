import type { ActivityLevel, AlertSeverity, Importance, Sentiment } from '@/lib/types'

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

export const sentimentStyle: Record<Sentiment, { label: string; className: string }> = {
  positive: { label: 'Positivo', className: 'bg-success/15 text-success' },
  negative: { label: 'Negativo', className: 'bg-destructive/15 text-destructive' },
  neutral: { label: 'Neutral', className: 'bg-muted-foreground/15 text-muted-foreground' },
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

export const severityStyle: Record<AlertSeverity, { label: string; className: string; dot: string }> = {
  critical: { label: 'Crítica', className: 'bg-destructive/15 text-destructive', dot: 'bg-destructive' },
  high: { label: 'Alta', className: 'bg-warning/15 text-warning', dot: 'bg-warning' },
  medium: { label: 'Media', className: 'bg-primary/15 text-primary', dot: 'bg-primary' },
  low: { label: 'Baja', className: 'bg-success/15 text-success', dot: 'bg-success' },
}
