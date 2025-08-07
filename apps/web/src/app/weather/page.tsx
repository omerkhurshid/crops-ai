import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../lib/auth/session'
import { Navbar } from '../../components/navigation/navbar'
import { WeatherDashboard } from '../../components/weather/weather-dashboard'
import { WeatherAnalytics } from '../../components/weather/weather-analytics'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'

export const dynamic = 'force-dynamic'

export default async function WeatherPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  // Default coordinates (New York City) - in production this would come from user's farm locations
  const defaultLatitude = 40.7128
  const defaultLongitude = -74.0060

  return (
    <div className="min-h-screen bg-agricultural">
      <div className="absolute inset-0 agricultural-overlay"></div>
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 relative z-10">
        <div className="px-8 lg:px-16 py-12 sm:px-0">
          <div className="mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">Weather Intelligence</h1>
            <p className="text-2xl text-white/80 font-light">
              Real-time weather data and agricultural insights for your farm locations
            </p>
          </div>

          <Tabs defaultValue="current" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="current">Current Weather</TabsTrigger>
              <TabsTrigger value="analytics">Advanced Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="current">
              <WeatherDashboard 
                latitude={defaultLatitude} 
                longitude={defaultLongitude} 
              />
            </TabsContent>
            
            <TabsContent value="analytics">
              <WeatherAnalytics 
                latitude={defaultLatitude} 
                longitude={defaultLongitude} 
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}