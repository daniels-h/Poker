'use client'

import { ReactNode } from 'react'
import TopNavBar from './TopNavBar'

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <TopNavBar />
      {children}
    </div>
  )
}
