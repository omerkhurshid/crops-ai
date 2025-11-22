'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Menu, 
  X, 
  Home, 
  TrendingUp, 
  MapPin, 
  DollarSign, 
  Cloud, 
  Settings,
  LogOut,
  User,
  Bell,
  Search,
  Brain
} from 'lucide-react'
interface MobileNavProps {
  user?: {
    name?: string | null
    email?: string | null
  }
  onSignOut?: () => void
}
export function MobileNav({ user, onSignOut }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])
  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])
  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/farms', icon: MapPin, label: 'Farms' },
    { href: '/ai-insights', icon: Brain, label: 'AI Insights' },
    { href: '/financial', icon: DollarSign, label: 'Financial' },
    { href: '/weather', icon: Cloud, label: 'Weather' },
    { href: '/reports', icon: TrendingUp, label: 'Reports' },
    { href: '/settings', icon: Settings, label: 'Settings' },
  ]
  const toggleMenu = () => setIsOpen(!isOpen)
  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-[#F3F4F6] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={toggleMenu}
            className="p-2 rounded-md text-[#555555] hover:text-[#1A1A1A] hover:bg-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-#555555"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <Link href="/dashboard" className="ml-4 text-xl font-semibold text-[#1A1A1A]">
            Cropple.ai
          </Link>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 rounded-md text-[#555555] hover:text-[#1A1A1A] hover:bg-[#F5F5F5]">
            <Search className="h-5 w-5" />
          </button>
          <button className="p-2 rounded-md text-[#555555] hover:text-[#1A1A1A] hover:bg-[#F5F5F5] relative">
            <Bell className="h-5 w-5" />
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></div>
          </button>
        </div>
      </div>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
      {/* Mobile Menu */}
      <div className={`
        lg:hidden fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Menu Header */}
        <div className="flex items-center justify-between px-4 py-6 border-b border-[#F3F4F6]">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-[#7A8F78] rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-[#1A1A1A]">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-[#555555]">
                {user?.email || 'user@crops-ai.com'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-md text-[#555555] hover:text-[#555555] hover:bg-[#F5F5F5]"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        {/* Menu Items */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname?.startsWith(item.href) ?? false
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-[#F8FAF8] text-#1A1A1A border-l-4 border-[#7A8F78]' 
                    : 'text-[#555555] hover:bg-[#F5F5F5] hover:text-[#1A1A1A]'
                  }
                `}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.label}
                {isActive && (
                  <div className="ml-auto h-2 w-2 bg-[#7A8F78] rounded-full"></div>
                )}
              </Link>
            )
          })}
        </nav>
        {/* Quick Actions */}
        <div className="border-t border-[#F3F4F6] px-4 py-4">
          <h3 className="text-xs font-semibold text-[#555555] uppercase tracking-wider mb-3">
            Quick Actions
          </h3>
          <div className="space-y-2">
            <button className="w-full flex items-center px-3 py-2 text-sm text-[#555555] hover:bg-[#F5F5F5] rounded-lg">
              <DollarSign className="h-4 w-4 mr-2" />
              Add Expense
            </button>
            <button className="w-full flex items-center px-3 py-2 text-sm text-[#555555] hover:bg-[#F5F5F5] rounded-lg">
              <TrendingUp className="h-4 w-4 mr-2" />
              Log Harvest
            </button>
            <button className="w-full flex items-center px-3 py-2 text-sm text-[#555555] hover:bg-[#F5F5F5] rounded-lg">
              <Cloud className="h-4 w-4 mr-2" />
              Weather Alert
            </button>
          </div>
        </div>
        {/* Menu Footer */}
        <div className="border-t border-[#F3F4F6] px-4 py-4">
          <div className="space-y-2">
            <Link
              href="/profile"
              className="flex items-center px-3 py-2 text-sm text-[#555555] hover:bg-[#F5F5F5] rounded-lg"
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </Link>
            {onSignOut && (
              <button
                onClick={() => {
                  setIsOpen(false)
                  onSignOut()
                }}
                className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
export default MobileNav