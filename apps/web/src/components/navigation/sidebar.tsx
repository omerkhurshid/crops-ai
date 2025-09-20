'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { CroppleLogo } from '../ui/cropple-logo'
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
  ChevronDown,
  ChevronRight,
  Settings,
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
  const [expandedSections, setExpandedSections] = useState<string[]>(['farms'])

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  // Main navigation links
  const mainNavLinks = [
    { href: '/dashboard', label: 'Command Center', icon: Home },
    { 
      href: '/farms', 
      label: 'Farms', 
      icon: BarChart3,
      id: 'farms',
      children: [
        { href: '/crops', label: 'Crop Planning', icon: Sprout },
        { href: '/crop-health', label: 'Crop Health', icon: Activity },
        { href: '/livestock', label: 'Livestock', icon: Users },
      ]
    },
    { href: '/weather', label: 'Weather', icon: CloudRain },
    { href: '/tasks', label: 'Tasks', icon: CheckSquare },
    { href: '/recommendations', label: 'AI Insights', icon: Brain },
    { href: '/financial', label: 'Financials', icon: DollarSign },
    { href: '/reports', label: 'Reports', icon: FileText },
  ]

  // Secondary navigation links (below divider)
  const secondaryNavLinks = [
    { href: '/settings', label: 'Settings', icon: Settings },
    { href: '/help', label: 'Help', icon: HelpCircle },
  ]

  const isActive = (href: string) => pathname?.startsWith(href) || pathname === href
  
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const isSectionExpanded = (sectionId: string) => expandedSections.includes(sectionId)
  
  const isParentActive = (children: any[]) => {
    return children?.some(child => isActive(child.href))
  }

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
          <Link href="/" className="group hover:scale-105 transition-transform">
            <CroppleLogo size="sm" textColor="text-white" />
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
        {mainNavLinks.map((link) => {
          const Icon = link.icon
          const active = isActive(link.href)
          const hasChildren = link.children && link.children.length > 0
          const isExpanded = hasChildren && link.id ? isSectionExpanded(link.id) : false
          const parentActive = hasChildren ? isParentActive(link.children) : false
          
          return (
            <div key={link.href}>
              {/* Parent Link */}
              <div
                className={`relative flex items-center px-3 py-3 rounded-control text-sm font-semibold transition-all duration-micro ease-fk group ${
                  active || parentActive
                    ? 'text-white'
                    : 'text-white/90 hover:text-white hover:bg-sidebar-600'
                }`}
                style={(active || parentActive) ? { backgroundColor: 'rgba(255,255,255,0.14)' } : {}}
              >
                {(active || parentActive) && <div className="absolute left-0 top-0 bottom-0 w-1 bg-fk-primary rounded-r" />}
                
                {hasChildren ? (
                  <>
                    <div className="flex items-center w-full">
                      <Link href={link.href} className="flex items-center flex-1">
                        <Icon className={`h-5 w-5 ${collapsed ? 'mx-auto' : 'mr-3'} ${
                          active || parentActive ? 'text-white' : 'text-white/90 group-hover:text-white'
                        }`} />
                        {!collapsed && (
                          <span className="truncate flex-1 text-left">{link.label}</span>
                        )}
                      </Link>
                      {!collapsed && (
                        <button
                          onClick={() => link.id && toggleSection(link.id)}
                          className="p-1 hover:bg-white/10 rounded"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <Link href={link.href} className="flex items-center w-full">
                    <Icon className={`h-5 w-5 ${collapsed ? 'mx-auto' : 'mr-3'} ${
                      active ? 'text-white' : 'text-white/90 group-hover:text-white'
                    }`} />
                    {!collapsed && (
                      <span className="truncate">{link.label}</span>
                    )}
                  </Link>
                )}
              </div>
              
              {/* Child Links */}
              {hasChildren && isExpanded && !collapsed && (
                <div className="ml-4 mt-1 space-y-1">
                  {link.children.map((child) => {
                    const ChildIcon = child.icon
                    const childActive = isActive(child.href)
                    
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`relative flex items-center px-3 py-2 rounded-control text-sm transition-all duration-micro ease-fk group ${
                          childActive
                            ? 'text-white bg-white/10'
                            : 'text-white/80 hover:text-white hover:bg-sidebar-600'
                        }`}
                      >
                        {childActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-fk-primary rounded-r" />}
                        <ChildIcon className={`h-4 w-4 mr-3 ${
                          childActive ? 'text-white' : 'text-white/80 group-hover:text-white'
                        }`} />
                        <span className="truncate">{child.label}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Secondary Navigation Links */}
      <div className="px-2 py-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
        {secondaryNavLinks.map((link) => {
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
      </div>

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