import type { ReactNode } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Navbar } from '@/components/layout/navbar'
import { ToastProvider } from '@/components/toast-provider'
import { DashboardProvider } from '@/lib/store/dashboard-context'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <DashboardProvider>
        <div className="min-h-screen bg-background grid-bg">
          <Sidebar />
          <Navbar />
          <main className="ml-[220px] pt-[58px]">
            <div className="mx-auto max-w-[1600px] px-5 py-6">{children}</div>
          </main>
        </div>
      </DashboardProvider>
    </ToastProvider>
  )
}
