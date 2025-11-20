'use client'
import { useSession } from '../../lib/auth-unified'
import { useState } from 'react'
import { Sidebar } from '../navigation/sidebar'
import { Navbar } from '../navigation/navbar'
import { MobileNavbar } from '../navigation/mobile-navbar'
interface DashboardLayoutProps {
  children: React.ReactNode
}
export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  // For unauthenticated users, show full-width layout with navbar
  if (!session) {
    return (
      <div className="bg-canvas min-h-screen">
        <Navbar />
        {children}
      </div>
    )
  }
  // For authenticated users, show responsive sidebar + content layout
  return (
    <div className="bg-canvas min-h-screen">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <Sidebar />
      </div>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40 bg-[#1A1A1A]/80 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Mobile Sidebar */}
          <div className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </>
      )}
      {/* Main Content Area */}
      <div className="lg:pl-64">
        {/* Mobile Top Navigation */}
        <div className="sticky top-0 z-40 lg:hidden">
          <MobileNavbar 
            onMenuClick={() => setSidebarOpen(true)}
            user={session.user}
          />
        </div>
        {/* Page Content */}
        <main className="relative">
          <div className="px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}