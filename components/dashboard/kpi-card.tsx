'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import * as Icons from 'lucide-react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { accentMap } from '@/lib/style-maps'
import { useCountUp } from '@/lib/hooks/use-count-up'

interface KPICardProps {
  icon: string
  value: string | number
  label: string
  change: string
  changeDir: 'up' | 'down'
  accent: string
  index?: number
}

export function KPICard({ icon, value, label, change, changeDir, accent, index = 0 }: KPICardProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const a = accentMap[accent] ?? accentMap.blue
  const Icon = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[icon] ?? Icons.Circle

  // Parse numeric value for count-up. Preserve prefix/suffix.
  const strValue = String(value)
  const numMatch = strValue.match(/[\d,.]+/)
  const numeric = numMatch ? parseFloat(numMatch[0].replace(/,/g, '')) : null
  const counted = useCountUp(numeric ?? 0, mounted && numeric !== null)

  let display: string = strValue
  if (numeric !== null && numMatch) {
    const formatted = counted.toLocaleString('es-CO')
    display = strValue.replace(numMatch[0], formatted)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: 'easeOut' }}
      className="glass group relative overflow-hidden rounded-xl p-4 transition-transform hover:-translate-y-1"
    >
      <span className={`absolute inset-x-0 top-0 h-0.5 ${a.border}`} />
      <span className="pointer-events-none absolute -right-2 -top-3 select-none font-mono text-6xl font-bold text-foreground/[0.03]">
        {display}
      </span>

      <div className="relative flex items-center justify-between">
        <div className={`flex size-9 items-center justify-center rounded-lg ${a.bg} ${a.text}`}>
          <Icon className="size-4.5" />
        </div>
        <div
          className={`flex items-center gap-0.5 text-xs font-semibold ${
            changeDir === 'up' ? 'text-success' : 'text-destructive'
          }`}
        >
          {changeDir === 'up' ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
          {change}
        </div>
      </div>

      <p className="relative mt-3 font-mono text-2xl font-bold tabular-nums text-foreground">{display}</p>
      <p className="relative mt-0.5 text-xs text-muted-foreground">{label}</p>
    </motion.div>
  )
}
