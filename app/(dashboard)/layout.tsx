import type { ReactNode } from 'react'
import { cookies } from 'next/headers'
import { Sidebar } from '@/components/layout/sidebar'
import { Navbar } from '@/components/layout/navbar'
import { ToastProvider } from '@/components/toast-provider'
import { SESSION_COOKIE_NAME, verifySession } from '@/lib/auth/session'
import { prisma } from '@/lib/db'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies()
  const session = await verifySession(cookieStore.get(SESSION_COOKIE_NAME)?.value)

  // Sin piso de fecha: los N artículos más recientes que haya, para que estos contadores nunca
  // se queden en 0 solo porque pasó tiempo desde la última ingesta (ver lib/news/query.ts).
  const [recentTags, recentImportance] = await Promise.all([
    prisma.newsArticle.findMany({ orderBy: { publishedAt: 'desc' }, take: 300, select: { tags: true } }),
    prisma.newsArticle.findMany({
      orderBy: { publishedAt: 'desc' },
      take: 300,
      select: { importance: true },
    }),
  ])
  const trendingCount = new Set(recentTags.flatMap((r) => r.tags)).size
  const alertsCount = recentImportance.filter((r) => r.importance === 'critical').length

  return (
    <ToastProvider>
      <div className="min-h-screen bg-background grid-bg">
        <Sidebar username={session?.email ?? 'Administrador'} trendingCount={trendingCount} alertsCount={alertsCount} />
        <Navbar />
        <main className="ml-[220px] pt-[58px]">
          <div className="mx-auto max-w-[1600px] px-5 py-6">{children}</div>
        </main>
      </div>
    </ToastProvider>
  )
}
