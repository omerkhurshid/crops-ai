import { redirect } from 'next/navigation'
import { getAuthenticatedUser } from '../../lib/auth/server'
import { DashboardLayout } from '../../components/layout/dashboard-layout'
import { WeatherDashboard } from '../../components/weather/weather-dashboard'
import { WeatherAnalytics } from '../../components/weather/weather-analytics'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '../../components/ui/modern-card'
import { InlineFloatingButton } from '../../components/ui/floating-button'
import { ClientFloatingButton } from '../../components/ui/client-floating-button'
import { FarmSelector } from '../../components/weather/farm-selector'
import { WeatherAlertsWidget } from '../../components/dashboard/weather-alerts-widget'
import { CloudRain, MapPin, Thermometer, Settings, BarChart, AlertTriangle } from 'lucide-react'
import { prisma } from '../../lib/prisma'

export const dynamic = 'force-dynamic'

async function getFarmLocation(farmId: string | null, userId: string) {
  if (!farmId) {
    // Get the user's first farm as default
    const defaultFarm = await prisma.farm.findFirst({
      where: { ownerId: userId },
      select: { id: true, name: true, latitude: true, longitude: true }
    })
    return defaultFarm
  }

  // Get specific farm
  const farm = await prisma.farm.findFirst({
    where: { 
      id: farmId,
      ownerId: userId 
    },
    select: { id: true, name: true, latitude: true, longitude: true }
  })
  
  return farm
}

async function getAllUserFarms(userId: string) {
  const farms = await prisma.farm.findMany({
    where: { ownerId: userId },
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  })
  return farms
}

export default async function WeatherPage({ searchParams }: { searchParams: { farmId?: string } }) {
  const user = await getAuthenticatedUser()

  if (!user) {
    redirect('/login')
  }

  const farm = await getFarmLocation(searchParams.farmId || null, user.id)
  const allFarms = await getAllUserFarms(user.id)

  // If no farm found, redirect to farms page
  if (!farm) {
    redirect('/farms')
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