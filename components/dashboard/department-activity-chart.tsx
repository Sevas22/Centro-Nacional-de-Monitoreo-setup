'use client'

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const axisStyle = { fontSize: 10, fill: '#7c8aa5' }

function DarkTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="mb-1 font-semibold text-foreground">{label}</p>
      <p className="text-muted-foreground">
        <span className="font-mono font-semibold text-primary">{payload[0].value}</span> noticias
      </p>
    </div>
  )
}

export function DepartmentActivityChart({ points }: { points: { hour: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={points} margin={{ top: 5, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="deptActivityFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="hour" tick={axisStyle} tickLine={false} axisLine={false} interval={3} />
        <YAxis tick={axisStyle} tickLine={false} axisLine={false} width={32} />
        <Tooltip content={<DarkTooltip />} cursor={{ stroke: '#a78bfa', strokeWidth: 1, strokeOpacity: 0.3 }} />
        <Area type="monotone" dataKey="count" stroke="#a78bfa" strokeWidth={2} fill="url(#deptActivityFill)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
