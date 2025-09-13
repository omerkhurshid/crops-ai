'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { useState } from 'react'
import { 
  Home, 
  BarChart3, 
  CloudRain, 
  Activity, 
  Brain, 
  DollarSign, 
  FileText,
  HelpCircle,
  Users,
  CheckSquare,
  Sprout,
  Menu,
  ChevronLeft,
  LogOut,
  User
} from 'lucide-react'

interface SidebarProps {
  collapsed?: boolean
}

export function Sidebar({ collapsed: propCollapsed = false }: SidebarProps) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(propCollapsed)

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  const navLinks = [
    { href: '/dashboard', label: 'Command Center', icon: Home },
    { href: '/farms', label: 'Farms', icon: BarChart3 },
    { href: '/crops', label: 'Crop Planning', icon: Sprout },
    { href: '/weather', label: 'Weather', icon: CloudRain },
    { href: '/crop-health', label: 'Crop Health', icon: Activity },
    { href: '/livestock', label: 'Livestock', icon: Users },
    { href: '/tasks', label: 'Tasks', icon: CheckSquare },
    { href: '/recommendations', label: 'AI Insights', icon: Brain },
    { href: '/financial', label: 'Financials', icon: DollarSign },
    { href: '/reports', label: 'Reports', icon: FileText },
    { href: '/help', label: 'Help', icon: HelpCircle },
  ]

  const isActive = (href: string) => pathname?.startsWith(href) || pathname === href

  if (!session) {
    return null
  }

  return (
    <div className={`fixed left-0 top-0 h-full bg-sidebar border-r border-white/20 shadow-fk-md z-40 transition-all duration-standard ease-fk hidden lg:block ${
      collapsed ? 'w-18' : 'w-64'
    }`} style={{ width: collapsed ? '72px' : '256px' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
        {!collapsed && (
          <Link href="/" className="flex items-center group">
            <div className="w-8 h-8 mr-3 group-hover:scale-105 transition-transform">
              <Image 
                src="/crops-ai-logo.png" 
                alt="Crops.AI Logo" 
                width={32} 
                height={32}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-lg font-semibold text-white tracking-tight">
              Cropple<span className="text-fk-primary-200">.ai</span>
            </span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-control text-white/70 hover:text-white hover:bg-sidebar-600 transition-colors duration-micro"
        >
          {collapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navLinks.map((link) => {
          const Icon = link.icon
          const active = isActive(link.href)
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`relative flex items-center px-3 py-3 rounded-control text-sm font-semibold transition-all duration-micro ease-fk group ${
                active
                  ? 'text-white'
                  : 'text-white/90 hover:text-white hover:bg-sidebar-600'
              }`}
              style={active ? { backgroundColor: 'rgba(255,255,255,0.14)' } : {}}
            >
              {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-fk-primary rounded-r" />}
              <Icon className={`h-5 w-5 ${collapsed ? 'mx-auto' : 'mr-3'} ${
                active ? 'text-white' : 'text-white/90 group-hover:text-white'
              }`} />
              {!collapsed && (
                <span className="truncate">{link.label}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Menu */}
      <div className="border-t p-4" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} mb-3`}>
          {!collapsed && (
            <div className="flex items-center min-w-0">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {session.user?.name || 'Farmer'}
                </p>
                <p className="text-xs text-white/70 truncate">
                  {session.user?.email}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={handleSignOut}
            className={`p-2 rounded-control text-white/70 hover:text-white hover:bg-fk-danger/20 transition-colors duration-micro ${
              collapsed ? 'mx-auto' : ''
            }`}
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}