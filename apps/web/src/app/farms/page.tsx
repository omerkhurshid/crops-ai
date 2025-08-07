import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '../../lib/auth/session'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Navbar } from '../../components/navigation/navbar'

export const dynamic = 'force-dynamic'

async function getUserFarms() {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/farms`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch user farms')
    }
    
    const data = await response.json()
    return data.farms || []
  } catch (error) {
    console.error('Error fetching user farms:', error)
    return []
  }
}

export default async function FarmsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const userFarms = await getUserFarms()

  return (
    <div className="min-h-screen bg-agricultural">
      <div className="absolute inset-0 agricultural-overlay"></div>
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 relative z-10">
        <div className="px-8 lg:px-16 py-12 sm:px-0">
          {/* Header */}
          <div className="mb-12 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">My Farms</h1>
              <p className="text-2xl text-white/80 font-light">Manage and monitor your agricultural operations</p>
            </div>
            <Link href="/farms/create">
              <button className="border-2 border-white/50 bg-transparent text-white hover:bg-white/10 transition-all duration-300 rounded-full px-8 py-4 font-light text-lg">
                + Add New Farm
              </button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Farms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{userFarms.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Area</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {userFarms.reduce((total: number, farm: any) => total + (farm.totalArea || 0), 0).toFixed(1)} ha
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Active Fields</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {userFarms.reduce((total: number, farm: any) => total + (farm.fieldsCount || 0), 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Regions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {new Set(userFarms.map((farm: any) => farm.region || 'Unknown').filter((r: string) => r !== 'Unknown')).size}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Farms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userFarms.length > 0 ? userFarms.map((farm: any) => (
              <Card key={farm.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{farm.name}</CardTitle>
                      <CardDescription>
                        {farm.address || `${farm.region || 'Unknown'}, ${farm.country || 'Unknown'}`}
                      </CardDescription>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Area:</span>
                      <span className="text-sm font-medium">{farm.totalArea?.toFixed(1) || 0} ha</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Fields:</span>
                      <span className="text-sm font-medium">{farm.fieldsCount || 0} fields</span>
                    </div>

                    {farm.fieldsTotalArea && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Field Area:</span>
                        <span className="text-sm font-medium">{farm.fieldsTotalArea} ha</span>
                      </div>
                    )}

                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          Created {new Date(farm.createdAt).toLocaleDateString()}
                        </span>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )) : (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-500">
                  <p className="text-lg font-medium mb-2">No farms yet</p>
                  <p className="text-sm mb-4">Create your first farm to get started with agricultural monitoring</p>
                  <Button asChild>
                    <Link href="/farms/create">
                      Create Your First Farm
                    </Link>
                  </Button>
                </div>
              </div>
            )}
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