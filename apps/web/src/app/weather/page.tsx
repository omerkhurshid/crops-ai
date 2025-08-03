import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../lib/auth/session'
import { Navbar } from '../../components/navigation/navbar'
import { WeatherDashboard } from '../../components/weather/weather-dashboard'
import { WeatherAnalytics } from '../../components/weather/weather-analytics'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'

export default async function WeatherPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  // Default coordinates (New York City) - in production this would come from user's farm locations
  const defaultLatitude = 40.7128
  const defaultLongitude = -74.0060

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Weather Intelligence</h1>
            <p className="text-gray-600">
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