'use client'
import { useRouter } from 'next/navigation'
import { useSession } from '../../lib/auth-unified'
import { useEffect, useState } from 'react'
import { DashboardLayout } from '../../components/layout/dashboard-layout'
import { LivestockDashboard } from '../../components/livestock/livestock-dashboard'
import { LivestockQuickActions } from '../../components/livestock/livestock-quick-actions'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '../../components/ui/modern-card'
import { ClientFloatingButton } from '../../components/ui/client-floating-button'
import { Users, Plus, Stethoscope, Heart, Activity, TrendingUp } from 'lucide-react'
export default function LivestockPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userFarms, setUserFarms] = useState<any[]>([])
  const [livestockEvents, setLivestockEvents] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalAnimals: 0,
    healthScore: 0,
    healthAlerts: 0,
    avgDailyGain: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
    const fetchData = async () => {
      try {
        // Fetch farms
        const farmsResponse = await fetch('/api/farms')
        if (farmsResponse.ok) {
          const farms = await farmsResponse.json()
          setUserFarms(farms)
          // If no farms, redirect to farm creation
          if (farms.length === 0) {
            router.push('/farms/create-unifiedfrom=livestock')
            return
          }
          // Fetch livestock events
          const eventsResponse = await fetch('/api/livestock/events')
          if (eventsResponse.ok) {
            const events = await eventsResponse.json()
            setLivestockEvents(events)
            calculateStats(events)
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [session, status, router])
  const calculateStats = (events: any[]) => {
    // Calculate real statistics from livestockEvent data
    const totalAnimals = events.reduce((sum, event) => sum + (event.animalCount || 0), 0)
    const healthEvents = events.filter(event => 
      event.eventType?.toLowerCase().includes('health') || 
      event.eventType?.toLowerCase().includes('vaccination') ||
      event.eventType?.toLowerCase().includes('treatment')
    )
    const healthAlerts = healthEvents.filter(event => 
      event.notes?.toLowerCase().includes('alert') || 
      event.notes?.toLowerCase().includes('sick') ||
      event.notes?.toLowerCase().includes('urgent')
    ).length
    // Calculate health score based on recent events
    const recentHealthEvents = healthEvents.filter(event => {
      const eventDate = new Date(event.eventDate)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return eventDate >= thirtyDaysAgo
    })
    const healthScore = totalAnimals > 0 ? 
      Math.max(1, 10 - (healthAlerts / totalAnimals) * 2) : 0
    // Calculate average daily gain from weight/growth related events
    const weightEvents = events.filter(event => 
      event.eventType?.toLowerCase().includes('weight') ||
      event.eventType?.toLowerCase().includes('growth') ||
      event.eventType?.toLowerCase().includes('gain')
    )
    const avgDailyGain = weightEvents.length > 0 ? 
      weightEvents.reduce((sum, event) => {
        const weight = parseFloat(event.notes?.match(/(\d+\.?\d*)/)?.[1] || '0')
        return sum + (isNaN(weight) ? 0 : weight)
      }, 0) / weightEvents.length : 0
    setStats({
      totalAnimals,
      healthScore,
      healthAlerts,
      avgDailyGain
    })
  }
  if (status === 'loading' || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7A8F78]"></div>
          <p className="ml-4 text-[#555555]">Loading livestock data...</p>
        </div>
      </DashboardLayout>
    )
  }
  if (!session) {
    return null
  }
  // If no farms, show empty state (this is also handled in useEffect)
  if (userFarms.length === 0) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto pt-8 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Farms Available</h2>
            <p className="text-[#555555] mb-6">You need to create a farm before managing livestock.</p>
            <button 
              onClick={() => router.push('/farms/create-unifiedfrom=livestock')}
              className="bg-[#7A8F78] text-white px-4 py-2 rounded-lg"
            >
              Create Farm
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }
  return (
    <DashboardLayout>
      {/* Floating Action Button */}
      <ClientFloatingButton
        icon={<Plus className="h-5 w-5" />}
        label="Add Animal"
        variant="primary"
      />
      <main className="max-w-7xl mx-auto pt-8 pb-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-8">
          {/* Page Header - Consistent with other pages */}
          <h1 className="text-4xl font-light text-[#7A8F78] mb-2">Livestock Management</h1>
          <p className="text-lg text-[#7A8F78] mb-6">
            Monitor herd health and track animal performance
          </p>
          {/* Getting Started Guide for Livestock */}
          <div className="bg-gradient-to-r from-earth-50 to-#F8FAF8 rounded-xl p-4 mb-6 border border-earth-200">
            <h3 className="font-semibold text-earth-800 mb-2 flex items-center gap-2">
              <Users className="h-5 w-5 text-earth-600" />
              New to Livestock Management?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-earth-700">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-earth-200 flex items-center justify-center text-xs font-bold text-earth-800 flex-shrink-0 mt-0.5">1</div>
                <div>
                  <p className="font-medium">Add Your Animals</p>
                  <p className="text-earth-600">Register cattle, sheep, pigs, or other livestock with basic details</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-earth-200 flex items-center justify-center text-xs font-bold text-earth-800 flex-shrink-0 mt-0.5">2</div>
                <div>
                  <p className="font-medium">Track Health Events</p>
                  <p className="text-earth-600">Log vaccinations, treatments, and regular health checks</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-earth-200 flex items-center justify-center text-xs font-bold text-earth-800 flex-shrink-0 mt-0.5">3</div>
                <div>
                  <p className="font-medium">Monitor Performance</p>
                  <p className="text-earth-600">Track weight gains, breeding cycles, and productivity metrics</p>
                </div>
              </div>
            </div>
            {/* Quick Actions for beginners */}
            <LivestockQuickActions />
          </div>
        </div>
        {/* Quick Stats Overview */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <ModernCard variant="soft" className="group hover:shadow-soft transition-all duration-300">
            <ModernCardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-#F8FAF8 to-#F8FAF8 rounded-2xl">
                  <Users className="h-6 w-6 text-[#5E6F5A]" />
                </div>
              </div>
              <ModernCardTitle>Total Livestock</ModernCardTitle>
              <ModernCardDescription>
                Total animals tracked
              </ModernCardDescription>
            </ModernCardHeader>
            <ModernCardContent>
              <div className="text-center py-4">
                <div className="text-3xl font-bold text-[#7A8F78] mb-2">{stats.totalAnimals || 0}</div>
                <div className="text-sm text-[#7A8F78]">animals registered</div>
              </div>
            </ModernCardContent>
          </ModernCard>
          <ModernCard variant="soft" className="group hover:shadow-soft transition-all duration-300">
            <ModernCardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-#F8FAF8 to-#F8FAF8 rounded-2xl">
                  <Heart className="h-6 w-6 text-[#5E6F5A]" />
                </div>
              </div>
              <ModernCardTitle>Health Score</ModernCardTitle>
              <ModernCardDescription>
                Health status overview
              </ModernCardDescription>
            </ModernCardHeader>
            <ModernCardContent>
              <div className="text-center py-4">
                <div className="text-3xl font-bold text-[#5E6F5A] mb-2">{stats.totalAnimals > 0 ? `${stats.healthScore.toFixed(1)}/10` : '--'}</div>
                <div className="text-sm text-[#7A8F78]">{stats.totalAnimals > 0 ? (stats.healthScore >= 8 ? 'excellent condition' : stats.healthScore >= 6 ? 'good condition' : 'needs attention') : 'no data'}</div>
              </div>
            </ModernCardContent>
          </ModernCard>
          <ModernCard variant="soft" className="group hover:shadow-soft transition-all duration-300">
            <ModernCardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-earth-100 to-earth-50 rounded-2xl">
                  <Stethoscope className="h-6 w-6 text-earth-700" />
                </div>
              </div>
              <ModernCardTitle>Health Alerts</ModernCardTitle>
              <ModernCardDescription>
                Animals needing attention
              </ModernCardDescription>
            </ModernCardHeader>
            <ModernCardContent>
              <div className="text-center py-4">
                <div className="text-3xl font-bold text-earth-600 mb-2">{stats.healthAlerts || 0}</div>
                <div className="text-sm text-earth-600">{stats.healthAlerts === 1 ? 'requires attention' : 'require attention'}</div>
              </div>
            </ModernCardContent>
          </ModernCard>
          <ModernCard variant="soft" className="group hover:shadow-soft transition-all duration-300">
            <ModernCardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-#DDE4D8 to-#F8FAF8 rounded-2xl">
                  <TrendingUp className="h-6 w-6 text-[#7A8F78]" />
                </div>
              </div>
              <ModernCardTitle>Avg Daily Gain</ModernCardTitle>
              <ModernCardDescription>
                Growth tracking
              </ModernCardDescription>
            </ModernCardHeader>
            <ModernCardContent>
              <div className="text-center py-4">
                <div className="text-3xl font-bold text-[#5E6F5A] mb-2">{stats.avgDailyGain > 0 ? `${stats.avgDailyGain.toFixed(1)}kg` : '--'}</div>
                <div className="text-sm text-[#7A8F78]">daily average</div>
              </div>
            </ModernCardContent>
          </ModernCard>
        </div>
        {/* Main Livestock Dashboard */}
        <ModernCard variant="floating">
          <ModernCardContent className="p-6">
            {livestockEvents.length > 0 && livestockEvents[0].farmId ? (
              <LivestockDashboard farmId={livestockEvents[0].farmId} />
            ) : userFarms.length > 0 ? (
              <LivestockDashboard farmId={userFarms[0].id} />
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-[#555555] mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Livestock Data</h3>
                <p className="text-[#555555] mb-6">Start by adding your first livestock event to track your animals.</p>
                <a 
                  href="/livestock/add-event"
                  className="inline-block bg-[#7A8F78] text-white px-4 py-2 rounded-lg hover:bg-[#5E6F5A]"
                >
                  Add Livestock Event
                </a>
              </div>
            )}
          </ModernCardContent>
        </ModernCard>
      </main>
    </DashboardLayout>
  )
}