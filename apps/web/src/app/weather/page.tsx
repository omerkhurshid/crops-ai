import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../lib/auth/session'
import { Navbar } from '../../components/navigation/navbar'
import { WeatherDashboard } from '../../components/weather/weather-dashboard'
import { WeatherAnalytics } from '../../components/weather/weather-analytics'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { FarmSelector } from '../../components/weather/farm-selector'
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
    <div className="min-h-screen bg-agricultural">
      <div className="absolute inset-0 agricultural-overlay"></div>
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 relative z-10">
        <div className="px-8 lg:px-16 py-12 sm:px-0">
          <div className="mb-12">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">Weather Intelligence</h1>
                <p className="text-2xl text-white/80 font-light">
                  Real-time weather data for {farm.name}
                </p>
                <p className="text-lg text-white/60 font-light mt-2">
                  Coordinates: {latitude.toFixed(4)}°N, {Math.abs(longitude).toFixed(4)}°{longitude < 0 ? 'W' : 'E'}
                </p>
              </div>
              <FarmSelector farms={allFarms} currentFarmId={farm.id} />
            </div>
          </div>

          <Tabs defaultValue="current" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="current">Current Weather</TabsTrigger>
              <TabsTrigger value="analytics">Advanced Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="current">
              <WeatherDashboard 
                latitude={latitude} 
                longitude={longitude} 
              />
            </TabsContent>
            
            <TabsContent value="analytics">
              <WeatherAnalytics 
                latitude={latitude} 
                longitude={longitude} 
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}