'use client'

import { ReactNode } from 'react'
import TopNavBar from './TopNavBar'

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen" style={{ position: 'relative', zIndex: 1 }}>
      <TopNavBar />
      {children}
    </div>
  )
}
