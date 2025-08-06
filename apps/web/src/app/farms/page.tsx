import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../lib/auth/session'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Navbar } from '../../components/navigation/navbar'

export const dynamic = 'force-dynamic'

export default async function FarmsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  // Demo farm data for testing
  const demoFarms = [
    {
      id: 'farm-1',
      name: 'Greenfield Acres',
      location: 'Iowa, USA',
      size: 250,
      crops: ['Corn', 'Soybeans'],
      status: 'Active',
      lastUpdate: '2 days ago'
    },
    {
      id: 'farm-2', 
      name: 'Sunrise Farm',
      location: 'Nebraska, USA',
      size: 180,
      crops: ['Wheat', 'Corn'],
      status: 'Active',
      lastUpdate: '1 week ago'
    },
    {
      id: 'farm-3',
      name: 'Valley View Ranch',
      location: 'Kansas, USA', 
      size: 320,
      crops: ['Soybeans', 'Alfalfa'],
      status: 'Planning',
      lastUpdate: '3 days ago'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Farms</h1>
              <p className="text-gray-600">Manage and monitor your agricultural operations</p>
            </div>
            <Button className="bg-green-600 hover:bg-green-700">
              + Add New Farm
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Farms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{demoFarms.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Acreage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {demoFarms.reduce((total, farm) => total + farm.size, 0)} acres
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Active Farms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {demoFarms.filter(farm => farm.status === 'Active').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Crop Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {new Set(demoFarms.flatMap(farm => farm.crops)).size}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Farms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {demoFarms.map((farm) => (
              <Card key={farm.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{farm.name}</CardTitle>
                      <CardDescription>{farm.location}</CardDescription>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      farm.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {farm.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Size:</span>
                      <span className="text-sm font-medium">{farm.size} acres</span>
                    </div>
                    
                    <div>
                      <span className="text-sm text-gray-600">Crops:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {farm.crops.map((crop, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                          >
                            {crop}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Last updated {farm.lastUpdate}</span>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common farm management tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                    <div className="font-medium">Weather Monitoring</div>
                    <div className="text-sm text-gray-500 mt-1">Check weather conditions for all farms</div>
                  </Button>
                  
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                    <div className="font-medium">Satellite Analysis</div>
                    <div className="text-sm text-gray-500 mt-1">View NDVI and crop health data</div>
                  </Button>
                  
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                    <div className="font-medium">Yield Predictions</div>
                    <div className="text-sm text-gray-500 mt-1">Generate ML-powered yield forecasts</div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}