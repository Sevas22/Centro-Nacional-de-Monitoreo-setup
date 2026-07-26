'use client'

import { useState, type ReactNode } from 'react'
import { Sidebar } from './sidebar'
import { Navbar } from './navbar'

// El sidebar y el navbar necesitan coordinar un solo estado (el drawer de mobile abierto/cerrado)
// pero el layout que los renderiza es un server component -- este wrapper cliente es el punto
// donde vive ese estado compartido, sin tener que convertir todo el layout en cliente.
export function DashboardShell({
  username,
  trendingCount,
  alertsCount,
  children,
}: {
  username: string
  trendingCount: number
  alertsCount: number
  children: ReactNode
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background grid-bg">
      <Sidebar
        username={username}
        trendingCount={trendingCount}
        alertsCount={alertsCount}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <Navbar onMenuClick={() => setMobileMenuOpen(true)} />
      <main className="pt-[58px] md:ml-[220px]">
        <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-5">{children}</div>
      </main>
    </div>
  )
}
