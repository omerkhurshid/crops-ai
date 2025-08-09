import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../lib/auth/session'
import { Navbar } from '../../components/navigation/navbar'
import { WeatherDashboard } from '../../components/weather/weather-dashboard'
import { WeatherAnalytics } from '../../components/weather/weather-analytics'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '../../components/ui/modern-card'
import { InfoTooltip, TOOLTIP_CONTENT } from '../../components/ui/info-tooltip'
import { InlineFloatingButton } from '../../components/ui/floating-button'
import { ClientFloatingButton } from '../../components/ui/client-floating-button'
import { FarmSelector } from '../../components/weather/farm-selector'
import { CloudRain, MapPin, Thermometer, Settings, BarChart } from 'lucide-react'
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
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const farm = await getFarmLocation(searchParams.farmId || null, user.id)
  const allFarms = await getAllUserFarms(user.id)

  // If no farm found, redirect to farms page
  if (!farm) {
    redirect('/farms')
  }

  // Use farm coordinates or default to farm center (US Midwest)
  const latitude = farm.latitude || 41.8781
  const longitude = farm.longitude || -87.6298

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-sage-50/30 to-cream-100">
      <Navbar />
      
      {/* Floating Action Button */}
      <ClientFloatingButton
        icon={<Settings className="h-5 w-5" />}
        label="Weather Settings"
        variant="primary"
      />
      
      <main className="max-w-7xl mx-auto pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          {/* Modern Header with Asymmetric Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-4 bg-gradient-to-br from-sage-100 to-cream-100 rounded-2xl">
                  <CloudRain className="h-8 w-8 text-sage-700" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-6xl font-light text-sage-800 mb-2 tracking-tight">
                    Weather Intelligence
                  </h1>
                  <div className="flex items-center gap-3">
                    <p className="text-xl text-sage-600 font-light">
                      Real-time data for <span className="font-semibold text-sage-800">{farm.name}</span>
                    </p>
                    <InfoTooltip {...TOOLTIP_CONTENT.farm} />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sage-600">
                <MapPin className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {latitude.toFixed(4)}°N, {Math.abs(longitude).toFixed(4)}°{longitude < 0 ? 'W' : 'E'}
                </span>
                <InfoTooltip title="Location" description="GPS coordinates used for precise weather data collection and forecasting accuracy." size="sm" />
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
                    <InfoTooltip {...TOOLTIP_CONTENT.temperature} />
                  </div>
                  <TabsList className="bg-white/60 border border-sage-200/50">
                    <TabsTrigger value="current" className="data-[state=active]:bg-sage-100 data-[state=active]:text-sage-800">
                      <div className="flex items-center gap-2">
                        <Thermometer className="h-4 w-4" />
                        Current Weather
                      </div>
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="data-[state=active]:bg-sage-100 data-[state=active]:text-sage-800">
                      <div className="flex items-center gap-2">
                        <BarChart className="h-4 w-4" />
                        Advanced Analytics
                      </div>
                    </TabsTrigger>
                  </TabsList>
                </div>
                <ModernCardDescription>
                  Comprehensive weather monitoring and forecasting for precise agricultural decision making
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
    </div>
  )
}