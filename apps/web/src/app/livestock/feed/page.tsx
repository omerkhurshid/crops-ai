'use client'
import { useRouter } from 'next/navigation'
import { useSession } from '../../../lib/auth-unified'
import { useEffect, useState } from 'react'
import { DashboardLayout } from '../../../components/layout/dashboard-layout'
import { FeedManagement } from '../../../components/livestock/feed-management'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../../../components/ui/modern-card'
import { ClientFloatingButton } from '../../../components/ui/client-floating-button'
import { Plus, Activity, DollarSign, TrendingUp, Wheat } from 'lucide-react'
export default function FeedPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userFarms, setUserFarms] = useState<any[]>([])
  const [feedRecords, setFeedRecords] = useState<any[]>([])
  const [animals, setAnimals] = useState<any[]>([])
  const [stats, setStats] = useState({ 
    totalRecords: 0, 
    totalCost30Days: 0, 
    avgCostPerDay: 0, 
    totalQuantity30Days: 0 
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
            router.push('/farms/create?from=feed')
            return
          }
          // Fetch feed records
          const feedResponse = await fetch('/api/livestock/feed')
          if (feedResponse.ok) {
            const records = await feedResponse.json()
            setFeedRecords(records)
            // Calculate stats on client side
            const thirtyDaysAgo = new Date()
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
            const recentRecords = records.filter((record: any) => 
              new Date(record.feedDate) >= thirtyDaysAgo
            )
            const calculatedStats = {
              totalRecords: records.length,
              totalCost30Days: recentRecords.reduce((sum: number, record: any) => sum + (record.totalCost || 0), 0),
              avgCostPerDay: 0, // Will calculate below
              totalQuantity30Days: recentRecords.reduce((sum: number, record: any) => sum + (record.quantity || 0), 0)
            }
            calculatedStats.avgCostPerDay = calculatedStats.totalCost30Days / 30
            setStats(calculatedStats)
          }
          // Fetch animals for feeding
          const animalsResponse = await fetch('/api/livestock/animals')
          if (animalsResponse.ok) {
            const animalsData = await animalsResponse.json()
            const activeAnimals = animalsData.filter((animal: any) => animal.status === 'active')
            setAnimals(activeAnimals)
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
  if (status === 'loading' || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="ml-4 text-gray-600">Loading feed data...</p>
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
            <p className="text-gray-600 mb-6">You need to create a farm before managing feed records.</p>
            <button 
              onClick={() => router.push('/farms/create?from=feed')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg"
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Feed Management</h1>
            <p className="text-gray-600">Track feed costs and nutrition for your livestock</p>
          </div>
          <div className="flex gap-3">
            <ClientFloatingButton
              href="/livestock/feed/add"
              icon={<Plus className="h-5 w-5" />}
              label="Record Feeding"
            />
          </div>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <ModernCard>
            <ModernCardContent className="p-6">
              <div className="flex items-center">
                <Wheat className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Feed Records</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalRecords}</p>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>
          <ModernCard>
            <ModernCardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Feed Cost (30 days)</p>
                  <p className="text-2xl font-bold text-gray-900">${stats.totalCost30Days.toFixed(0)}</p>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>
          <ModernCard>
            <ModernCardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Daily Avg Cost</p>
                  <p className="text-2xl font-bold text-gray-900">${stats.avgCostPerDay.toFixed(0)}</p>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>
          <ModernCard>
            <ModernCardContent className="p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Quantity (30d)</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalQuantity30Days.toFixed(0)} lbs</p>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>
        </div>
        {/* Feed Management */}
        <ModernCard>
          <ModernCardHeader>
            <ModernCardTitle>Feed Records</ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent>
            <FeedManagement 
              feedRecords={feedRecords} 
              farms={userFarms}
              animals={animals}
            />
          </ModernCardContent>
        </ModernCard>
      </div>
    </DashboardLayout>
  )
}