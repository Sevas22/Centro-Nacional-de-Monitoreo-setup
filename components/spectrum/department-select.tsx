'use client'

import { useRouter } from 'next/navigation'
import { departmentNames } from '@/lib/spectrum/department-capitals'

export function DepartmentSelect({ current }: { current: string }) {
  const router = useRouter()

  return (
    <select
      value={current}
      onChange={(e) => router.push(`/espectro?depto=${encodeURIComponent(e.target.value)}`)}
      className="h-9 rounded-lg border border-border bg-background/50 px-3 text-sm text-foreground outline-none focus:border-primary/50"
    >
      {departmentNames.map((d) => (
        <option key={d} value={d}>
          {d}
        </option>
      ))}
    </select>
  )
}
