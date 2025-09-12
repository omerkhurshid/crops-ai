'use client'

import { useSession } from 'next-auth/react'
import { Sidebar } from '../navigation/sidebar'
import { Navbar } from '../navigation/navbar'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession()

  // For unauthenticated users, show full-width layout with navbar
  if (!session) {
    return (
      <div className="page-background-gradient">
        <Navbar />
        {children}
      </div>
    )
  }

  // For authenticated users, show sidebar + content layout
  return (
    <div className="page-background-gradient">
      <Sidebar />
      
      {/* Main Content Area - responsive margin */}
      <div className="lg:ml-64 min-h-screen">
        {/* Top Header for authenticated users */}
        <header className="glass-nav sticky top-0 z-30 border-b border-corn-accent/20 lg:hidden">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-corn-muted">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              <div className="text-sm text-corn-light font-medium">
                Welcome back, {session.user?.name || 'Farmer'}!
              </div>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="relative">
          {children}
        </main>
      </div>
    </div>
  )
}