'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '../ui/button'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import Image from 'next/image'

export function Navbar() {
  const { data: session, status } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/farms', label: 'Farms' },
    { href: '/weather', label: 'Weather' },
    { href: '/crop-health', label: 'Crop Health' },
    { href: '/recommendations', label: 'AI Insights' },
    { href: '/financial', label: 'Financials' },
    { href: '/reports', label: 'Reports' },
  ]

  return (
    <nav className="bg-white/90 backdrop-blur-lg shadow-sm sticky top-0 left-0 right-0 z-50 border-b border-sage-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center group">
              <div className="w-10 h-10 mr-3 group-hover:scale-105 transition-transform">
                <Image 
                  src="/crops-ai-logo.png" 
                  alt="Crops.AI Logo" 
                  width={40} 
                  height={40}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-2xl font-medium text-sage-800 tracking-tight">
                Crops<span className="text-sage-600">.AI</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {session && (
            <div className="hidden lg:flex lg:items-center lg:space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sage-700 hover:text-sage-900 hover:bg-sage-50 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            {status === 'loading' ? (
              <div className="animate-pulse bg-sage-100 h-9 w-24 rounded-lg"></div>
            ) : session ? (
              <>
                <div className="hidden sm:flex items-center space-x-3">
                  <span className="text-sm text-sage-700 font-medium">
                    {session.user?.name || 'User'}
                  </span>
                  <button 
                    onClick={handleSignOut}
                    className="bg-white border border-sage-200 text-sage-700 hover:bg-sage-50 hover:border-sage-300 transition-all duration-200 rounded-lg px-4 py-2 text-sm font-medium"
                  >
                    Sign Out
                  </button>
                </div>
                {/* Mobile menu button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden p-2 rounded-lg text-sage-600 hover:bg-sage-50"
                >
                  {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <button className="text-sage-700 hover:text-sage-900 px-4 py-2 text-sm font-medium">
                    Sign In
                  </button>
                </Link>
                <Link href="/register">
                  <button className="bg-sage-600 text-white hover:bg-sage-700 transition-all duration-200 rounded-lg px-4 py-2 text-sm font-medium">
                    Get Started
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {session && isMobileMenuOpen && (
          <div className="lg:hidden border-t border-sage-100 py-3">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-sage-700 hover:text-sage-900 hover:bg-sage-50 px-3 py-2 rounded-lg text-sm font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 mt-3 border-t border-sage-100 sm:hidden">
                <div className="px-3 py-2 text-sm text-sage-600">
                  {session.user?.name || 'User'}
                </div>
                <button 
                  onClick={handleSignOut}
                  className="w-full text-left text-sage-700 hover:text-sage-900 hover:bg-sage-50 px-3 py-2 rounded-lg text-sm font-medium"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}