'use client'

import { useSession } from '../../lib/auth-unified'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { DashboardLayout } from '../../components/layout/dashboard-layout'
import { FarmerFocusedDashboard } from '../../components/crop-health/farmer-focused-dashboard'
import { HealthDashboard } from '../../components/crop-health/health-dashboard'
import { AdvancedVisualizations } from '../../components/crop-health/advanced-visualizations'
import { NDVIMap } from '../../components/crop-health/ndvi-map'
import { KnowledgeDrivenHealthDashboard } from '../../components/crop-health/knowledge-driven-health-dashboard'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription, MetricCard } from '../../components/ui/modern-card'
import { InlineFloatingButton } from '../../components/ui/floating-button'
import { ClientFloatingButton } from '../../components/ui/client-floating-button'
import { NoHealthDataEmptyState, EmptyState } from '../../components/ui/empty-states'
import { FarmSelector } from '../../components/weather/farm-selector'
import { Leaf, Satellite, Brain, Activity, Settings, Zap, BarChart3, Eye, TrendingUp } from 'lucide-react'

interface Farm {
  id: string
  name: string
  latitude?: number
  longitude?: number
  fields?: Array<{
    id: string
    name: string
    area: number
  }>
}

export default function CropHealthPage({ searchParams }: { searchParams: { farmId?: string; view?: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [farms, setFarms] = useState<Farm[]>([])
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    // Fetch farms data
    const fetchData = async () => {
      try {
        const farmsResponse = await fetch('/api/farms')
        let farmsData: Farm[] = []
        
        if (farmsResponse.ok) {
          farmsData = await farmsResponse.json()
          setFarms(farmsData)
        }

        if (farmsData.length === 0) {
          router.push('/farms/create-unified')
          return
        }

        // Select farm
        const targetFarmId = searchParams.farmId || farmsData[0]?.id
        const farm = farmsData.find(f => f.id === targetFarmId) || farmsData[0]
        setSelectedFarm(farm)

      } catch (error) {
        console.error('Error fetching farms data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [session, status, router, searchParams])

  if (status === 'loading' || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="ml-4 text-gray-600">Loading crop health data...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!session) {
    return null
  }

  const view = searchParams.view || 'farmer-focused'

  return (
    <DashboardLayout>
      <ClientFloatingButton
        icon={<Settings className="h-5 w-5" />}
        label="Health Settings"
        variant="secondary"
      />

      <main className="max-w-7xl mx-auto pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-light text-sage-800 mb-2 flex items-center gap-3">
                <Leaf className="h-10 w-10 text-green-600" />
                Crop Health Analytics
              </h1>
              <p className="text-lg text-sage-600">
                Monitor crop health, detect diseases early, and optimize field management
              </p>
            </div>

            {farms.length > 0 && (
              <div className="w-64">
                <FarmSelector 
                  farms={farms}
                  currentFarmId={selectedFarm?.id || ''}
                />
              </div>
            )}
          </div>
        </div>

        {/* View Toggle */}
        <div className="mb-8">
          <div className="flex space-x-4">
            <button
              onClick={() => {
                const url = new URL(window.location.href)
                url.searchParams.set('view', 'farmer-focused')
                window.history.pushState({}, '', url.toString())
                window.location.reload()
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                view === 'farmer-focused'
                  ? 'bg-green-600 text-white'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              <Eye className="h-4 w-4 inline mr-2" />
              Farmer View
            </button>
            <button
              onClick={() => {
                const url = new URL(window.location.href)
                url.searchParams.set('view', 'advanced')
                window.history.pushState({}, '', url.toString())
                window.location.reload()
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                view === 'advanced'
                  ? 'bg-green-600 text-white'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              <BarChart3 className="h-4 w-4 inline mr-2" />
              Advanced Analytics
            </button>
          </div>
        </div>

        {/* Main Content */}
        {selectedFarm ? (
          <div className="space-y-8">
            {view === 'farmer-focused' && (
              <FarmerFocusedDashboard farmId={selectedFarm.id} />
            )}
            
            {view === 'advanced' && (
              <>
                <HealthDashboard farmId={selectedFarm.id} />
                <AdvancedVisualizations farmId={selectedFarm.id} />
              </>
            )}

            {view === 'satellite' && selectedFarm.latitude && selectedFarm.longitude && (
              <NDVIMap 
                farmId={selectedFarm.id}
                fields={selectedFarm.fields}
              />
            )}
          </div>
        ) : (
          <EmptyState 
            title="No Farm Selected"
            description="Please select a farm to view crop health analytics."
            icon={<Leaf className="h-12 w-12" />}
          />
        )}
      </main>
    </DashboardLayout>
  )
}