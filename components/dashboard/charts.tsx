'use client'

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { hourlyNews, categoryData, sentimentData, topDepartmentsBar, newsSources } from '@/data/mock'
import { activityColor } from '@/lib/style-maps'

const axisStyle = { fontSize: 10, fill: '#7c8aa5' }

function DarkTooltip({ active, payload, label, suffix }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-lg px-3 py-2 text-xs shadow-xl">
      {label && <p className="mb-1 font-semibold text-foreground">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-muted-foreground">
          <span className="font-mono font-semibold" style={{ color: p.color || p.payload?.fill }}>
            {typeof p.value === 'number' ? p.value.toLocaleString('es-CO') : p.value}
            {suffix ?? ''}
          </span>{' '}
          {p.name}
        </p>
      ))}
    </div>
  )
}

export function HourlyChart() {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={hourlyNews} margin={{ top: 5, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="hourlyFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="hour" tick={axisStyle} tickLine={false} axisLine={false} interval={3} />
        <YAxis tick={axisStyle} tickLine={false} axisLine={false} width={36} />
        <Tooltip content={<DarkTooltip />} cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeOpacity: 0.3 }} />
        <Area type="monotone" dataKey="count" name="noticias" stroke="#3b82f6" strokeWidth={2} fill="url(#hourlyFill)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function TopDeptsChart() {
  const max = Math.max(...topDepartmentsBar.map((d) => d.count))
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={topDepartmentsBar} layout="vertical" margin={{ top: 0, right: 12, left: 8, bottom: 0 }}>
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#cbd5e1' }} tickLine={false} axisLine={false} width={92} />
        <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
        <Bar dataKey="count" name="noticias" radius={[0, 4, 4, 0]} barSize={16}>
          {topDepartmentsBar.map((d, i) => {
            const ratio = d.count / max
            const color = ratio > 0.75 ? '#dc2626' : ratio > 0.5 ? '#ea580c' : ratio > 0.3 ? '#f59e0b' : '#10b981'
            return <Cell key={i} fill={color} />
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function SentimentDonut() {
  return (
    <div className="flex items-center gap-4">
      <ResponsiveContainer width="55%" height={180}>
        <PieChart>
          <Pie data={sentimentData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={72} paddingAngle={3} stroke="none">
            {sentimentData.map((s, i) => (
              <Cell key={i} fill={s.color} />
            ))}
          </Pie>
          <Tooltip content={<DarkTooltip suffix="%" />} />
        </PieChart>
      </ResponsiveContainer>
      <ul className="flex flex-col gap-2.5">
        {sentimentData.map((s) => (
          <li key={s.name} className="flex items-center gap-2">
            <span className="size-2.5 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-xs text-muted-foreground">{s.name}</span>
            <span className="ml-auto font-mono text-xs font-semibold text-foreground">{s.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function CategoryChart() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={categoryData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <XAxis dataKey="category" tick={{ fontSize: 9, fill: '#7c8aa5' }} tickLine={false} axisLine={false} angle={-30} textAnchor="end" height={50} interval={0} />
        <YAxis tick={axisStyle} tickLine={false} axisLine={false} width={36} />
        <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
        <Bar dataKey="count" name="noticias" fill="#a78bfa" radius={[4, 4, 0, 0]} barSize={22} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function SourcesChart() {
  const data = [...newsSources].sort((a, b) => b.newsToday - a.newsToday).slice(0, 8).map((s) => ({ name: s.name, count: s.newsToday }))
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 12, left: 8, bottom: 0 }}>
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#cbd5e1' }} tickLine={false} axisLine={false} width={92} />
        <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
        <Bar dataKey="count" name="noticias" fill="#22d3ee" radius={[0, 4, 4, 0]} barSize={16} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export { activityColor }
