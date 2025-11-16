'use client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from '../../lib/auth-unified'
import { useEffect, useState } from 'react'
import { Badge } from '../../components/ui/badge'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '../../components/ui/modern-card'
import { Button } from '../../components/ui/button'
import { RefreshButton } from '../../components/ui/refresh-button'
import { DashboardLayout } from '../../components/layout/dashboard-layout'
import dynamicImport from 'next/dynamic'

// Dynamic imports for heavy dashboard components to improve LCP
const FarmerDashboard = dynamicImport(() => import('../../components/dashboard/farmer-dashboard').then(mod => ({ default: mod.FarmerDashboard })), {
  loading: () => <div className="h-64 bg-[#F5F5F5] rounded-lg animate-pulse"></div>
})

const GlobalFAB = dynamicImport(() => import('../../components/ui/global-fab').then(mod => ({ default: mod.GlobalFAB })), {
  ssr: false
})

const MobileFAB = dynamicImport(() => import('../../components/ui/global-fab').then(mod => ({ default: mod.MobileFAB })), {
  ssr: false
})

const NBARecommendations = dynamicImport(() => import('../../components/dashboard/nba-recommendations'), {
  loading: () => <div className="h-32 bg-[#F5F5F5] rounded-lg animate-pulse"></div>
})

import { 
  Sprout, MapPin, AlertTriangle, TrendingUp, Clock, Plus, Brain, CloudRain, DollarSign,
  ThermometerSun, Droplets, Bell, ChevronDown, BarChart3, Activity, Zap, Cat
} from 'lucide-react'

import { ensureArray } from '../../lib/utils'
import { OnboardingTooltips, dashboardTooltips } from '../../components/onboarding/onboarding-tooltips'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [dashboardStats, setDashboardStats] = useState<any>(null)
  const [farms, setFarms] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }

    async function fetchData() {
      try {
        setError(null)
        
        // Fetch farms first
        const farmResponse = await fetch('/api/farms', {
          credentials: 'include'
        })
        
        if (farmResponse.ok) {
          const farmData = await farmResponse.json()
          setFarms(farmData)
        } else {
          console.error('Failed to fetch farms:', farmResponse.status)
          if (farmResponse.status === 401) {
            setError('Authentication failed. Please log in again.')
            return
          }
        }

        // Fetch dashboard stats
        const statsResponse = await fetch('/api/dashboard/stats', {
          credentials: 'include'
        })
        
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setDashboardStats(statsData.data)
        } else {
          console.error('Failed to fetch dashboard stats:', statsResponse.status)
        }

      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [session, status, router])

  // Check if user should see onboarding
  useEffect(() => {
    if (farms.length > 0 && !localStorage.getItem('dashboard-onboarding-completed')) {
      const timer = setTimeout(() => {
        setShowOnboarding(true)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [farms])

  if (status === 'loading' || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7A8F78]"></div>
          <p className="ml-4 text-[#555555]">Loading dashboard...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!session) {
    return null
  }

  // Show error state
  if (error) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto pt-8 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-[#1A1A1A] mb-4">Something went wrong</h1>
            <p className="text-[#555555] mb-6">{error}</p>
            <Button onClick={() => window.location.reload()}>Try again</Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Show onboarding for new users
  if (farms.length === 0) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto pt-8 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="text-left mb-12">
            <div className="mb-6">
              <h1 className="text-4xl font-light text-[#7A8F78] mb-4">Welcome to Your Farm Dashboard</h1>
              <p className="text-xl text-[#555555] max-w-2xl">
                Add your first farm to start tracking crops, weather, and financials
              </p>
            </div>
            <Link href="/farms/create-unified">
              <Button data-tour="add-farm-button" className="bg-[#7A8F78] hover:bg-[#5E6F5A] text-white px-8 py-3 text-lg">
                <Plus className="h-5 w-5 mr-2" />
                Add Your First Farm
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-lg shadow-sm border">
              <h3 className="font-semibold text-[#1A1A1A] mb-2">Weather Tracking</h3>
              <p className="text-[#555555] text-sm">Get weather alerts to help you time planting, irrigation, and harvests</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm border">
              <h3 className="font-semibold text-[#1A1A1A] mb-2">Crop Health</h3>
              <p className="text-[#555555] text-sm">Monitor your fields to catch problems early and maximize yields</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm border">
              <h3 className="font-semibold text-[#1A1A1A] mb-2">Financial Reports</h3>
              <p className="text-[#555555] text-sm">Track your income and expenses to improve farm profitability</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        {/* Page Header - Consistent with other pages */}
        <div className="mb-8">
          <h1 className="text-4xl font-light text-[#7A8F78] mb-2">Farm Dashboard</h1>
          <p className="text-lg text-[#555555]">Monitor your operations and stay on top of important tasks</p>
        </div>

        {/* Use the new farmer-friendly dashboard */}
        <FarmerDashboard 
          farmId={farms[0]?.id || 'default'}
          farmData={farms[0]}
          allFarms={farms}
          financialData={dashboardStats?.financialData || []}
          weatherAlerts={dashboardStats?.weatherAlerts || []}
          crops={dashboardStats?.crops || []}
          livestock={dashboardStats?.livestock || []}
          user={session.user}
        />
      </div>

      {/* Global Floating Action Button */}
      <GlobalFAB role="farmer" />
      
      {/* Onboarding Tooltips */}
      {showOnboarding && (
        <OnboardingTooltips
          steps={dashboardTooltips}
          onComplete={() => {
            localStorage.setItem('dashboard-onboarding-completed', 'true')
            setShowOnboarding(false)
          }}
          onSkip={() => {
            localStorage.setItem('dashboard-onboarding-completed', 'true')
            setShowOnboarding(false)
          }}
          theme="sage"
        />
      )}
    </DashboardLayout>
  )
}