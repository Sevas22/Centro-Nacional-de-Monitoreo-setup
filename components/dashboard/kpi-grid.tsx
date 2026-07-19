'use client'

import { useEffect, useState } from 'react'
import { kpis } from '@/data/mock'
import { KPICard } from '@/components/dashboard/kpi-card'

export function KpiGrid() {
  const [total, setTotal] = useState(2847)

  useEffect(() => {
    const interval = setInterval(() => {
      setTotal((t) => t + Math.floor(Math.random() * 5) + 1)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {kpis.map((kpi, i) => (
        <KPICard
          key={kpi.key}
          index={i}
          icon={kpi.icon}
          value={kpi.key === 'total' ? total : kpi.value}
          label={kpi.label}
          change={kpi.change}
          changeDir={kpi.changeDir}
          accent={kpi.accent}
        />
      ))}
    </div>
  )
}
