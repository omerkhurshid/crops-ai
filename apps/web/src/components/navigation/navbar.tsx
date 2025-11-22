'use client'
import { useSession, unifiedAuth } from '../../lib/auth-unified'
import Link from 'next/link'
import { Button } from '../ui/button'
import { KeyboardShortcuts } from './keyboard-shortcuts'
import { Menu, X, HelpCircle, Home, BarChart3, CloudRain, Activity, Brain, DollarSign, FileText } from 'lucide-react'
import { useState } from 'react'
import { CroppleLogo } from '../ui/cropple-logo'

export function Navbar() {
  const { data: session, status } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = () => {
    unifiedAuth.signOut({ callbackUrl: '/' })
  }

  const navLinks = [
    { href: '/dashboard', label: 'Command Center', icon: <Home className="h-4 w-4" /> },
    { href: '/farms', label: 'Farms', icon: <BarChart3 className="h-4 w-4" /> },
    { href: '/weather', label: 'Weather', icon: <CloudRain className="h-4 w-4" /> },
    { href: '/crop-health', label: 'Crop Health', icon: <Activity className="h-4 w-4" /> },
    { href: '/recommendations', label: 'AI Recommendations', icon: <Brain className="h-4 w-4" /> },
    { href: '/financial', label: 'Financials', icon: <DollarSign className="h-4 w-4" /> },
    { href: '/reports', label: 'Reports', icon: <FileText className="h-4 w-4" /> },
    { href: '/help', label: 'Help', icon: <HelpCircle className="h-4 w-4" /> },
  ]

  return (
    <nav className="sage-nav sticky top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="group hover:scale-105 transition-transform">
              <CroppleLogo size="md" textColor="text-[#7A8F78]" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          {session && (
            <div className="hidden md:flex md:items-center md:space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-800 hover:text-[#7A8F78] px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-[#F8FAF8] transition-colors"
                  style={{ color: '#2D3748' }}
                >
                  {link.icon}
                  <span className="hidden lg:inline text-xs xl:text-sm">{link.label}</span>
                </Link>
              ))}
            </div>
          )}

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            {status === 'loading' ? (
              <div className="animate-pulse bg-[#DDE4D8] h-9 w-24 rounded-lg"></div>
            ) : session ? (
              <>
                <div className="hidden sm:flex items-center space-x-3">
                  <span className="text-sm text-gray-800 font-semibold" style={{ color: '#2D3748' }}>
                    {session.user?.name || 'Farmer'}
                  </span>
                  <button 
                    onClick={handleSignOut}
                    className="btn-secondary text-sm"
                  >
                    Sign Out
                  </button>
                </div>
                {/* Mobile menu button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 rounded-lg text-gray-800 hover:text-[#7A8F78] hover:bg-[#F8FAF8]"
                  style={{ color: '#2D3748' }}
                >
                  {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <button className="text-gray-800 hover:text-[#7A8F78] px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200" style={{ color: '#2D3748' }}>
                    Sign In
                  </button>
                </Link>
                <Link href="/register">
                  <button className="btn-primary text-sm">
                    <span className="hidden sm:inline">Start Farming Smarter</span>
                    <span className="sm:hidden">Sign Up</span>
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {session && isMobileMenuOpen && (
          <div className="md:hidden border-t border-[#F3F4F6] py-3 bg-white/95">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 text-gray-800 hover:text-[#7A8F78] hover:bg-[#F8FAF8] px-3 py-2 rounded-lg text-sm font-semibold"
                  style={{ color: '#2D3748' }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 mt-3 border-t border-[#F3F4F6] sm:hidden">
                <div className="px-3 py-2 text-sm text-gray-800 font-semibold" style={{ color: '#2D3748' }}>
                  {session.user?.name || 'User'}
                </div>
                <button 
                  onClick={handleSignOut}
                  className="w-full text-left text-gray-800 hover:text-[#7A8F78] hover:bg-[#F8FAF8] px-3 py-2 rounded-lg text-sm font-semibold"
                  style={{ color: '#2D3748' }}
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts System */}
      {session && <KeyboardShortcuts />}
    </nav>
  )
}