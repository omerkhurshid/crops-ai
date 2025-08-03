'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '../components/ui/button'

export function Navbar() {
  const { data: session, status } = useSession()

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-crops-green-700">
              Crops.AI
            </Link>
            
            {session && (
              <div className="hidden md:ml-10 md:flex md:space-x-8">
                <Link
                  href="/dashboard"
                  className="text-gray-900 hover:text-crops-green-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/farms"
                  className="text-gray-500 hover:text-crops-green-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Farms
                </Link>
                <Link
                  href="/fields"
                  className="text-gray-500 hover:text-crops-green-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Fields
                </Link>
                <Link
                  href="/weather"
                  className="text-gray-500 hover:text-crops-green-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Weather
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
            ) : session ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  Welcome, {session.user?.name}
                </span>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}