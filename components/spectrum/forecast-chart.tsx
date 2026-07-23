'use client'

import { Bar, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { HourlyPoint } from '@/lib/spectrum/forecast'

const axisStyle = { fontSize: 10, fill: '#7c8aa5' }

function DarkTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="mb-1 font-semibold text-foreground">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-muted-foreground">
          <span className="font-mono font-semibold" style={{ color: p.color }}>
            {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
          </span>{' '}
          {p.name}
        </p>
      ))}
    </div>
  )
}

export function ForecastChart({ points }: { points: HourlyPoint[] }) {
  const data = points.map((p) => ({
    hour: new Date(p.time).toLocaleTimeString('es-CO', { hour: '2-digit' }),
    Temperatura: p.tempC,
    Precipitación: p.precipitationMm,
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <ComposedChart data={data} margin={{ top: 5, right: 8, left: -18, bottom: 0 }}>
        <XAxis dataKey="hour" tick={axisStyle} tickLine={false} axisLine={false} interval={2} />
        <YAxis yAxisId="temp" tick={axisStyle} tickLine={false} axisLine={false} width={32} />
        <YAxis yAxisId="precip" orientation="right" tick={axisStyle} tickLine={false} axisLine={false} width={28} />
        <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
        <Bar yAxisId="precip" dataKey="Precipitación" fill="#0ea5e9" radius={[3, 3, 0, 0]} barSize={10} fillOpacity={0.5} />
        <Line yAxisId="temp" type="monotone" dataKey="Temperatura" stroke="#f59e0b" strokeWidth={2} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
