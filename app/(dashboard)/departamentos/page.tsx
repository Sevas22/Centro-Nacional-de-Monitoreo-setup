import { prisma } from '@/lib/db'
import { computeDeptActivity } from '@/lib/news/aggregate'
import { DepartamentosClient } from '@/components/dashboard/departamentos-client'

export const dynamic = 'force-dynamic'

export default async function DepartamentosPage() {
  const rows = await prisma.newsArticle.findMany({
    orderBy: { publishedAt: 'desc' },
    take: 2000,
    select: { department: true },
  })
  const deptActivity = computeDeptActivity(rows)

  return <DepartamentosClient deptActivity={deptActivity} />
}
