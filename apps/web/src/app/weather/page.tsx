'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from '../../lib/auth-unified'
import { useEffect, useState } from 'react'
import { DashboardLayout } from '../../components/layout/dashboard-layout'
import { WeatherDashboard } from '../../components/weather/weather-dashboard'
import { WeatherAnalytics } from '../../components/weather/weather-analytics'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '../../components/ui/modern-card'
import { ClientFloatingButton } from '../../components/ui/client-floating-button'
import { FarmSelector } from '../../components/weather/farm-selector'
import { WeatherAlertsWidget } from '../../components/dashboard/weather-alerts-widget'
import { CloudRain, MapPin, Thermometer, Settings, BarChart, AlertTriangle } from 'lucide-react'

interface Farm {
  id: string
  name: string
  latitude: number | null
  longitude: number | null
}

interface FarmListItem {
  id: string
  name: string
}

export default function WeatherPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const farmId = searchParams?.get('farmId')
  
  const [farm, setFarm] = useState<Farm | null>(null)
  const [allFarms, setAllFarms] = useState<FarmListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    async function fetchFarmData() {
      try {
        setLoading(true)
        setError(null)

        // Fetch all user farms
        const farmsResponse = await fetch('/api/farms')
        if (!farmsResponse.ok) {
          throw new Error('Failed to fetch farms')
        }

        const farmsData = await farmsResponse.json()
        const userFarms = farmsData.farms || []
        setAllFarms(userFarms.map((f: any) => ({ id: f.id, name: f.name })))

        // Determine which farm to load
        let targetFarmId = farmId
        if (!targetFarmId && userFarms.length > 0) {
          targetFarmId = userFarms[0].id
        }

        if (!targetFarmId) {
          // No farms available, redirect to farms page
          router.push('/farms')
          return
        }

        // Fetch specific farm details
        const farmResponse = await fetch(`/api/farms/${targetFarmId}`)
        if (!farmResponse.ok) {
          throw new Error('Failed to fetch farm details')
        }

        const farmData = await farmResponse.json()
        const selectedFarm = farmData

        if (!selectedFarm) {
          router.push('/farms')
          return
        }

        setFarm({
          id: selectedFarm.id,
          name: selectedFarm.name,
          latitude: selectedFarm.latitude,
          longitude: selectedFarm.longitude
        })

      } catch (error) {
        console.error('Error fetching farm data:', error)
        setError('Failed to load farm data')
      } finally {
        setLoading(false)
      }
    }

    fetchFarmData()
  }, [session, status, router, farmId])

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout>
        <main className="max-w-7xl mx-auto pt-8 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="space-y-2">
              <div className="h-10 bg-gray-200 rounded w-1/3"></div>
              <div className="h-6 bg-gray-200 rounded w-2/3"></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="lg:col-span-4">
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-sage-200 p-6">
              <div className="space-y-4">
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </main>
      </DashboardLayout>
    )
  }

  if (!session) {
    return null
  }

  if (error) {
    return (
      <DashboardLayout>
        <main className="max-w-7xl mx-auto pt-8 pb-12 px-4 sm:px-6 lg:px-8">
          <ModernCard variant="floating">
            <ModernCardContent className="p-6 text-center">
              <div className="text-red-600 mb-2">Error</div>
              <div className="text-sage-600">{error}</div>
            </ModernCardContent>
          </ModernCard>
        </main>
      </DashboardLayout>
    )
  }

  if (!farm) {
    return null
  }

  // Use farm coordinates or default to geographic center of US
  const latitude = farm.latitude || 39.8283  // Geographic center of US
  const longitude = farm.longitude || -98.5795

  return (
    <DashboardLayout>
      
      {/* Floating Action Button */}
      <ClientFloatingButton
        icon={<Settings className="h-5 w-5" />}
        label="Weather Settings"
        variant="primary"
      />
      
      <main className="max-w-7xl mx-auto pt-8 pb-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-8">
          {/* Page Header - Consistent with other pages */}
          <h1 className="text-4xl font-light text-sage-800 mb-2">Weather Intelligence</h1>
          <p className="text-lg text-sage-600 mb-6">
            Real-time weather data and forecasting for {farm.name}
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <div className="flex items-center gap-2 text-sage-600">
                <MapPin className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {latitude.toFixed(4)}°N, {Math.abs(longitude).toFixed(4)}°{longitude < 0 ? 'W' : 'E'}
                </span>
              </div>
            </div>
            <div className="lg:col-span-4">
              <ModernCard variant="glass">
                <ModernCardContent className="p-4">
                  <FarmSelector farms={allFarms} currentFarmId={farm.id} />
                </ModernCardContent>
              </ModernCard>
            </div>
          </div>
        </div>

        {/* Modern Tabs with Enhanced Styling */}
        <div className="space-y-8">
          <ModernCard variant="floating" className="overflow-hidden">
            <Tabs defaultValue="current" className="space-y-0">
              <ModernCardHeader className="bg-gradient-to-r from-sage-50/80 to-cream-50/80 border-b border-sage-200/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ModernCardTitle className="text-sage-800">Weather Data</ModernCardTitle>
                  </div>
                  <TabsList className="bg-white/60 border border-sage-200/50">
                    <TabsTrigger value="current">
                      <div className="flex items-center gap-2">
                        <Thermometer className="h-4 w-4" />
                        Current Weather
                      </div>
                    </TabsTrigger>
                    <TabsTrigger value="alerts">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Weather Alerts
                      </div>
                    </TabsTrigger>
                    <TabsTrigger value="analytics">
                      <div className="flex items-center gap-2">
                        <BarChart className="h-4 w-4" />
                        Advanced Analytics
                      </div>
                    </TabsTrigger>
                  </TabsList>
                </div>
                <ModernCardDescription>
                  Current conditions and forecasting data to help with farming decisions
                </ModernCardDescription>
              </ModernCardHeader>
              
              <TabsContent value="current" className="m-0">
                <div className="p-0">
                  <WeatherDashboard 
                    latitude={latitude} 
                    longitude={longitude} 
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="alerts" className="m-0">
                <div className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-sage-800 mb-2">Active Weather Alerts</h3>
                      <p className="text-sage-600 text-sm mb-4">
                        Real-time weather alerts and farming recommendations for {farm.name}
                      </p>
                    </div>
                    <WeatherAlertsWidget 
                      farmData={{
                        latitude: latitude,
                        longitude: longitude
                      }}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="analytics" className="m-0">
                <div className="p-0">
                  <WeatherAnalytics 
                    latitude={latitude} 
                    longitude={longitude} 
                  />
                </div>
              </TabsContent>
            </Tabs>
          </ModernCard>
        </div>
      </main>
    </DashboardLayout>
  )
}