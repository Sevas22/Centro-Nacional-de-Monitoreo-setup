'use client'

import { useState } from 'react'
import { heatmapData, heatmapDepts } from '@/data/mock'

// Interpolate dark green -> yellow -> red
function heatColor(value: number) {
  const t = Math.min(Math.max(value / 100, 0), 1)
  if (t < 0.5) {
    const k = t / 0.5
    const r = Math.round(19 + k * (234 - 19))
    const g = Math.round(78 + k * (179 - 78))
    const b = Math.round(47 + k * (8 - 47))
    return `rgb(${r},${g},${b})`
  }
  const k = (t - 0.5) / 0.5
  const r = Math.round(234 + k * (220 - 234))
  const g = Math.round(179 + k * (38 - 179))
  const b = Math.round(8 + k * (38 - 8))
  return `rgb(${r},${g},${b})`
}

export function Heatmap() {
  const [hover, setHover] = useState<{ dept: string; hour: number; value: number } | null>(null)

  return (
    <div className="relative">
      <div className="overflow-x-auto pb-1">
        <div className="min-w-[640px]">
          <div className="flex flex-col gap-1">
            {heatmapDepts.map((dept) => (
              <div key={dept} className="flex items-center gap-2">
                <span className="w-28 shrink-0 truncate text-right text-[11px] text-muted-foreground">{dept}</span>
                <div className="flex flex-1 gap-1">
                  {Array.from({ length: 24 }, (_, hour) => {
                    const cell = heatmapData.find((c) => c.dept === dept && c.hour === hour)!
                    return (
                      <div
                        key={hour}
                        onMouseEnter={() => setHover({ dept, hour, value: cell.value })}
                        onMouseLeave={() => setHover(null)}
                        className="h-6 flex-1 rounded-sm transition-transform hover:scale-125"
                        style={{ backgroundColor: heatColor(cell.value) }}
                      />
                    )
                  })}
                </div>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <span className="w-28 shrink-0" />
              <div className="flex flex-1 gap-1">
                {Array.from({ length: 24 }, (_, hour) => (
                  <span key={hour} className="flex-1 text-center text-[9px] text-muted-foreground">
                    {hour % 3 === 0 ? String(hour).padStart(2, '0') : ''}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {hover && (
        <div className="glass pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2 rounded-lg px-2.5 py-1.5 text-xs shadow-xl">
          <span className="font-semibold text-foreground">{hover.dept}</span>
          <span className="text-muted-foreground"> · {String(hover.hour).padStart(2, '0')}:00 · </span>
          <span className="font-mono font-semibold text-primary">{hover.value}</span>
        </div>
      )}
    </div>
  )
}
