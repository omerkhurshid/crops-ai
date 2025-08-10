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
    <nav className="bg-white/95 backdrop-blur-md shadow-soft sticky top-0 left-0 right-0 z-50 border-b border-sage-200/50">
      <div className="max-w-7xl mx-auto px-8 lg:px-16">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-sage-500 to-earth-600 rounded-full flex items-center justify-center mr-3">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
              <span className="text-xl font-light text-sage-800 tracking-wider">
                CROPS.AI
              </span>
            </Link>
          </div>

          {session && (
            <div className="hidden md:flex md:space-x-8">
              <Link
                href="/dashboard"
                className="text-sage-600 hover:text-sage-800 text-lg font-medium transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/farms"
                className="text-sage-600 hover:text-sage-800 text-lg font-medium transition-colors"
              >
                Farms
              </Link>
              <Link
                href="/weather"
                className="text-sage-600 hover:text-sage-800 text-lg font-medium transition-colors"
              >
                Weather
              </Link>
              <Link
                href="/crop-health"
                className="text-sage-600 hover:text-sage-800 text-lg font-medium transition-colors"
              >
                Crop Health
              </Link>
              <Link
                href="/recommendations"
                className="text-sage-600 hover:text-sage-800 text-lg font-medium transition-colors"
              >
                AI Insights
              </Link>
              <Link
                href="/financial"
                className="text-sage-600 hover:text-sage-800 text-lg font-medium transition-colors"
              >
                Financials
              </Link>
              <Link
                href="/reports"
                className="text-sage-600 hover:text-sage-800 text-lg font-medium transition-colors"
              >
                Reports
              </Link>
            </div>
          )}

          <div className="flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="animate-pulse bg-sage-200 h-8 w-20 rounded"></div>
            ) : session ? (
              <div className="flex items-center space-x-4">
                <span className="text-sage-600">
                  Welcome, {session.user?.name}
                </span>
                <button 
                  onClick={handleSignOut}
                  className="border-2 border-sage-500 bg-transparent text-sage-600 hover:bg-sage-500 hover:text-white transition-all duration-300 rounded-full px-6 py-2 font-medium"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/register">
                  <button className="border-2 border-sage-500 bg-transparent text-sage-600 hover:bg-sage-500 hover:text-white transition-all duration-300 rounded-full px-6 py-2 font-medium">
                    Sign Up
                  </button>
                </Link>
                <Link href="/login">
                  <button className="bg-sage-500 text-white hover:bg-sage-600 transition-all duration-300 rounded-full px-6 py-2 font-medium">
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