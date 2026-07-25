import { prisma } from '@/lib/db'
import { computeMunicipioActivity } from '@/lib/news/aggregate'
import { MunicipiosClient } from '@/components/dashboard/municipios-client'

export const dynamic = 'force-dynamic'

export default async function MunicipiosPage() {
  const rows = await prisma.newsArticle.findMany({
    orderBy: { publishedAt: 'desc' },
    take: 300,
    select: { department: true, municipality: true },
  })
  const municipalities = computeMunicipioActivity(rows)

  return <MunicipiosClient municipalities={municipalities} />
}
