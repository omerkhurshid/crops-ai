'use client'

import { useRouter } from 'next/navigation'
import { useSession } from '../../../lib/auth-unified'
import { useEffect, useState } from 'react'
import { DashboardLayout } from '../../../components/layout/dashboard-layout'
import { WeightTracking } from '../../../components/livestock/weight-tracking'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../../../components/ui/modern-card'
import { ClientFloatingButton } from '../../../components/ui/client-floating-button'
import { Plus, Weight, TrendingUp, Activity, Target } from 'lucide-react'


export default function WeightPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userFarms, setUserFarms] = useState<any[]>([])
  const [weightRecords, setWeightRecords] = useState<any[]>([])
  const [animals, setAnimals] = useState<any[]>([])
  const [stats, setStats] = useState({ 
    totalRecords: 0, 
    animalsTracked: 0, 
    avgGrowthRate: 0, 
    recentMeasurements: 0 
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
            router.push('/farms/create?from=weight')
            return
          }

          // Fetch weight records and animals
          const [weightResponse, animalsResponse] = await Promise.all([
            fetch('/api/livestock/weight'),
            fetch('/api/livestock/animals')
          ])

          if (weightResponse.ok && animalsResponse.ok) {
            const records = await weightResponse.json()
            const animalsData = await animalsResponse.json()
            const activeAnimals = animalsData.filter((animal: any) => animal.status === 'active')
            
            setWeightRecords(records)
            setAnimals(activeAnimals)
            calculateStats(records)
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

  const calculateStats = (records: any[]) => {
    // Calculate stats
    const newStats = {
      totalRecords: records.length,
      animalsTracked: 0,
      avgGrowthRate: 0,
      recentMeasurements: 0
    }
    
    // Count unique animals with weight records
    const uniqueAnimals = new Set(records.map((record: any) => record.animalId))
    newStats.animalsTracked = uniqueAnimals.size

    // Calculate average growth rate
    const animalGrowthRates: number[] = []
    uniqueAnimals.forEach(animalId => {
      const animalRecords = records
        .filter((record: any) => record.animalId === animalId)
        .sort((a: any, b: any) => new Date(a.weighDate).getTime() - new Date(b.weighDate).getTime())
      
      if (animalRecords.length >= 2) {
        const firstRecord = animalRecords[0]
        const lastRecord = animalRecords[animalRecords.length - 1]
        const weightChange = lastRecord.weight - firstRecord.weight
        const daysDiff = Math.abs(
          new Date(lastRecord.weighDate).getTime() - new Date(firstRecord.weighDate).getTime()
        ) / (1000 * 60 * 60 * 24)
        
        if (daysDiff > 0) {
          const growthRatePerDay = weightChange / daysDiff
          animalGrowthRates.push(growthRatePerDay * 30) // Monthly growth rate
        }
      }
    })

    if (animalGrowthRates.length > 0) {
      newStats.avgGrowthRate = animalGrowthRates.reduce((sum, rate) => sum + rate, 0) / animalGrowthRates.length
    }

    // Count recent measurements (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    newStats.recentMeasurements = records.filter((record: any) => 
      new Date(record.weighDate) >= thirtyDaysAgo
    ).length

    setStats(newStats)
  }

  if (status === 'loading' || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="ml-4 text-gray-600">Loading weight tracking data...</p>
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
            <p className="text-gray-600 mb-6">You need to create a farm before tracking animal weights.</p>
            <button 
              onClick={() => router.push('/farms/create?from=weight')}
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
            <h1 className="text-3xl font-bold text-gray-900">Weight Tracking</h1>
            <p className="text-gray-600">Monitor growth and body condition of your livestock</p>
          </div>
          <div className="flex gap-3">
            <ClientFloatingButton
              href="/livestock/weight/add"
              icon={<Plus className="h-5 w-5" />}
              label="Record Weight"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <ModernCard>
            <ModernCardContent className="p-6">
              <div className="flex items-center">
                <Weight className="h-8 w-8 text-indigo-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Records</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalRecords}</p>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>

          <ModernCard>
            <ModernCardContent className="p-6">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Animals Tracked</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.animalsTracked}</p>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>

          <ModernCard>
            <ModernCardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Growth (lbs/month)</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.avgGrowthRate.toFixed(1)}</p>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>

          <ModernCard>
            <ModernCardContent className="p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Recent Measurements</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.recentMeasurements}</p>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>
        </div>

        {/* Weight Tracking */}
        <ModernCard>
          <ModernCardHeader>
            <ModernCardTitle>Weight Records</ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent>
            <WeightTracking 
              weightRecords={weightRecords} 
              farms={userFarms}
              animals={animals}
            />
          </ModernCardContent>
        </ModernCard>
      </div>
    </DashboardLayout>
  )
}