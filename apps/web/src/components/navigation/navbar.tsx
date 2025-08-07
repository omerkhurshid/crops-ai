'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '../ui/button'

export function Navbar() {
  const { data: session, status } = useSession()

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <nav className="absolute top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-8 lg:px-16">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
              <span className="text-xl font-light text-white/90 tracking-wider">
                CROPS.AI
              </span>
            </Link>
          </div>

          {session && (
            <div className="hidden md:flex md:space-x-8">
              <Link
                href="/dashboard"
                className="text-white/80 hover:text-white text-lg font-light transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/farms"
                className="text-white/80 hover:text-white text-lg font-light transition-colors"
              >
                Farms
              </Link>
              <Link
                href="/weather"
                className="text-white/80 hover:text-white text-lg font-light transition-colors"
              >
                Weather
              </Link>
              <Link
                href="/crop-health"
                className="text-white/80 hover:text-white text-lg font-light transition-colors"
              >
                Crop Health
              </Link>
              <Link
                href="/recommendations"
                className="text-white/80 hover:text-white text-lg font-light transition-colors"
              >
                AI Insights
              </Link>
              <Link
                href="/reports"
                className="text-white/80 hover:text-white text-lg font-light transition-colors"
              >
                Reports
              </Link>
            </div>
          )}

          <div className="flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
            ) : session ? (
              <div className="flex items-center space-x-4">
                <span className="text-white/80">
                  Welcome, {session.user?.name}
                </span>
                <button 
                  onClick={handleSignOut}
                  className="border-2 border-white/30 bg-transparent text-white hover:bg-white/10 transition-all duration-300 rounded-full px-6 py-2 font-light"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/register">
                  <button className="border-2 border-white/30 bg-transparent text-white hover:bg-white/10 transition-all duration-300 rounded-full px-6 py-2 font-light">
                    Sign Up
                  </button>
                </Link>
                <Link href="/login">
                  <button className="border-2 border-white/30 bg-transparent text-white hover:bg-white/10 transition-all duration-300 rounded-full px-6 py-2 font-light">
                    Login
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}