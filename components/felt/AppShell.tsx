'use client'

import { ReactNode } from 'react'
import { SidebarProvider, useSidebar } from './SidebarContext'
import FeltSidebar from './FeltSidebar'
import MobileTabBar from './MobileTabBar'

function Inner({ children }: { children: ReactNode }) {
  const { collapsed } = useSidebar()
  const sidebarW = collapsed ? 56 : 220

  return (
    <div className="flex min-h-screen">
      <FeltSidebar />
      <main
        className="app-main flex-1 pb-20 md:pb-0 px-6 md:px-12 py-8 md:py-10 min-h-screen"
        style={{ transition: 'margin-left 200ms' }}
      >
        {/* Inject responsive margin so mobile is unaffected */}
        <style>{`@media (min-width: 768px) { .app-main { margin-left: ${sidebarW}px; } }`}</style>
        {children}
      </main>
      <MobileTabBar />
    </div>
  )
}

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <Inner>{children}</Inner>
    </SidebarProvider>
  )
}
