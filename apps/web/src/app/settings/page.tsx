'use client'
import { useRouter } from 'next/navigation'
import { useSession } from '../../lib/auth-unified'
import { useEffect, useState } from 'react'
import { DashboardLayout } from '../../components/layout/dashboard-layout'
import { SettingsForm } from '../../components/settings/settings-form'
interface UserPreferences {
  id: string
  name: string
  email: string
  currency: string
  landUnit: string
  temperatureUnit: string
  timezone: string
  language: string
}
export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [user, setUser] = useState<UserPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
    async function fetchUserPreferences() {
      try {
        setLoading(true)
        // Fetch user preferences from the API
        const response = await fetch('/api/users/preferences')
        if (!response.ok) {
          throw new Error('Failed to fetch user preferences')
        }
        const data = await response.json()
        // Combine session user data with preferences
        const fullUser: UserPreferences = {
          id: session?.user?.id || '',
          name: session?.user?.name || '',
          email: session?.user?.email || '',
          currency: data.preferences?.currency || 'USD',
          landUnit: data.preferences?.landUnit || 'hectares',
          temperatureUnit: data.preferences?.temperatureUnit || 'celsius',
          timezone: data.preferences?.timezone || 'UTC',
          language: data.preferences?.language || 'en'
        }
        setUser(fullUser)
      } catch (error) {
        console.error('Error fetching user preferences:', error)
        setError('Failed to load user preferences')
        // Use basic session data as fallback
        const fallbackUser: UserPreferences = {
          id: session?.user?.id || '',
          name: session?.user?.name || '',
          email: session?.user?.email || '',
          currency: 'USD',
          landUnit: 'hectares',
          temperatureUnit: 'celsius',
          timezone: 'UTC',
          language: 'en'
        }
        setUser(fallbackUser)
      } finally {
        setLoading(false)
      }
    }
    fetchUserPreferences()
  }, [session, status, router])
  if (status === 'loading' || loading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto pt-8 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-sage-200 p-8">
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }
  if (!session || !user) {
    return null
  }
  if (error && !user) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto pt-8 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Error loading settings: {error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-4xl font-light text-sage-800 mb-3">Account Settings</h1>
          <p className="text-lg text-sage-600 leading-relaxed">
            Manage your account preferences and system settings
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-sage-200">
          <SettingsForm user={user} />
        </div>
      </div>
    </DashboardLayout>
  )
}