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
      <div className="bg-canvas min-h-screen">
        <Navbar />
        {children}
      </div>
    )
  }

  // For authenticated users, show sidebar + content layout
  return (
    <div className="bg-canvas min-h-screen">
      <Sidebar />
      
      {/* Main Content Area - responsive margin for FieldKit sidebar width */}
      <div style={{ marginLeft: '256px' }} className="min-h-screen lg:block hidden">
        {/* Page Content */}
        <main className="relative">
          {children}
        </main>
      </div>
      
      {/* Mobile layout */}
      <div className="lg:hidden min-h-screen">
        {/* Top Header for mobile */}
        <header className="bg-surface/80 backdrop-blur-sm sticky top-0 z-30 border-b border-fk-border">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-fk-text-muted">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              <div className="text-sm text-fk-text font-semibold">
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