'use client'

import { useRouter } from 'next/navigation'
import { useSession } from '../../../lib/auth-unified'
import { useEffect, useState } from 'react'
import { DashboardLayout } from '../../../components/layout/dashboard-layout'
import { AnimalRegistry } from '../../../components/livestock/animal-registry'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../../../components/ui/modern-card'
import { ClientFloatingButton } from '../../../components/ui/client-floating-button'
import { Plus, Users, Heart, TrendingUp } from 'lucide-react'

export default function AnimalsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userFarms, setUserFarms] = useState<any[]>([])
  const [animals, setAnimals] = useState<any[]>([])
  const [stats, setStats] = useState({ total: 0, healthy: 0, needingAttention: 0, growthRate: 0 })
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
            router.push('/farms/create?from=animals')
            return
          }

          // Fetch animals
          const animalsResponse = await fetch('/api/livestock/animals')
          if (animalsResponse.ok) {
            const animalsData = await animalsResponse.json()
            setAnimals(animalsData)
            
            // Calculate stats
            const calculatedStats = {
              total: animalsData.length,
              healthy: animalsData.filter((a: any) => a.healthStatus === 'healthy').length,
              needingAttention: animalsData.filter((a: any) => a.healthStatus === 'attention').length,
              growthRate: animalsData.length > 0 ? Math.round(Math.random() * 20 + 5) : 0 // Mock growth rate
            }
            setStats(calculatedStats)
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
          <p className="ml-4 text-gray-600">Loading animals...</p>
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
            <p className="text-gray-600 mb-6">You need to create a farm before adding animals.</p>
            <button 
              onClick={() => router.push('/farms/create?from=animals')}
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
            <h1 className="text-3xl font-bold text-gray-900">Animal Registry</h1>
            <p className="text-gray-600">Individual animal profiles and tracking</p>
          </div>
          <div className="flex gap-3">
            <ClientFloatingButton
              href="/livestock/animals/add"
              icon={<Plus className="h-5 w-5" />}
              label="Add Animal"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <ModernCard>
            <ModernCardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Animals</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>

          <ModernCard>
            <ModernCardContent className="p-6">
              <div className="flex items-center">
                <Heart className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Healthy</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.healthy}</p>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>

          <ModernCard>
            <ModernCardContent className="p-6">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <div className="h-4 w-4 bg-yellow-600 rounded-full"></div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Needing Attention</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.needingAttention}</p>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>

          <ModernCard>
            <ModernCardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-indigo-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Growth (lbs/month)</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.growthRate.toFixed(1)}</p>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>
        </div>

        {/* Animal Registry */}
        <ModernCard>
          <ModernCardHeader>
            <ModernCardTitle>Your Animals</ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent>
            <AnimalRegistry animals={animals} farms={userFarms} />
          </ModernCardContent>
        </ModernCard>
      </div>
    </DashboardLayout>
  )
}