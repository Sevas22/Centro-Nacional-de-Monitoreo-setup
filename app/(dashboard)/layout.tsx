import type { ReactNode } from 'react'
import { cookies } from 'next/headers'
import { Sidebar } from '@/components/layout/sidebar'
import { Navbar } from '@/components/layout/navbar'
import { ToastProvider } from '@/components/toast-provider'
import { DashboardProvider } from '@/lib/store/dashboard-context'
import { SESSION_COOKIE_NAME, verifySession } from '@/lib/auth/session'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies()
  const session = await verifySession(cookieStore.get(SESSION_COOKIE_NAME)?.value)

  return (
    <ToastProvider>
      <DashboardProvider>
        <div className="min-h-screen bg-background grid-bg">
          <Sidebar username={session?.email ?? 'Administrador'} />
          <Navbar />
          <main className="ml-[220px] pt-[58px]">
            <div className="mx-auto max-w-[1600px] px-5 py-6">{children}</div>
          </main>
        </div>
      </DashboardProvider>
    </ToastProvider>
  )
}
