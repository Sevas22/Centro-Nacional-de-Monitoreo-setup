import type { DashboardKPIs } from '@/lib/news/aggregate'
import { KPICard } from '@/components/dashboard/kpi-card'

// Sin change/changeDir: no tenemos un snapshot de ayer con el que comparar, así que no se
// inventa una variación — mismo criterio que ya se aplicó en las KPIs de /espectro.
export function KpiGrid({ kpis }: { kpis: DashboardKPIs }) {
  const cards = [
    { icon: 'Newspaper', value: kpis.totalNewsToday, label: 'Noticias ingeridas (24h)', accent: 'blue' },
    { icon: 'AlertTriangle', value: kpis.breakingNews, label: 'Noticias críticas', accent: 'red' },
    { icon: 'MapPin', value: kpis.activeDepartments, label: 'Departamentos con actividad', accent: 'orange' },
    { icon: 'Flame', value: kpis.trendingTopics, label: 'Temas distintos detectados', accent: 'purple' },
    { icon: 'ThumbsUp', value: `${kpis.positivePercent}%`, label: 'Sentimiento positivo', accent: 'green' },
    { icon: 'ThumbsDown', value: `${kpis.negativePercent}%`, label: 'Sentimiento negativo', accent: 'red' },
    { icon: 'Radio', value: kpis.totalSources, label: 'Fuentes activas', accent: 'cyan' },
    { icon: 'Activity', value: kpis.avgArticlesPerHour, label: 'Promedio artículos/hora', accent: 'blue' },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((kpi, i) => (
        <KPICard key={kpi.label} index={i} icon={kpi.icon} value={kpi.value} label={kpi.label} accent={kpi.accent} />
      ))}
    </div>
  )
}
