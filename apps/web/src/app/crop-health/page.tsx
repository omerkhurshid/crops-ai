import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../lib/auth/session'
import { Navbar } from '../../components/navigation/navbar'
import { HealthDashboard } from '../../components/crop-health/health-dashboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { FarmSelector } from '../../components/weather/farm-selector'
import { prisma } from '../../lib/prisma'
import { Leaf, Satellite, Brain } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getUserFarms(userId: string) {
  const farms = await prisma.farm.findMany({
    where: { ownerId: userId },
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  })
  return farms
}

async function getSelectedFarm(farmId: string | null, userId: string) {
  if (!farmId) {
    // Get the user's first farm as default
    const defaultFarm = await prisma.farm.findFirst({
      where: { ownerId: userId },
      select: { id: true, name: true }
    })
    return defaultFarm
  }

  // Get specific farm
  const farm = await prisma.farm.findFirst({
    where: { 
      id: farmId,
      ownerId: userId 
    },
    select: { id: true, name: true }
  })
  
  return farm
}

export default async function CropHealthPage({ searchParams }: { searchParams: { farmId?: string } }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const farms = await getUserFarms(user.id)
  const selectedFarm = await getSelectedFarm(searchParams.farmId || null, user.id)

  // If no farms exist, redirect to create farm
  if (farms.length === 0) {
    redirect('/farms/create')
  }

  // If no farm selected or invalid farm, use first farm
  const farmId = selectedFarm?.id || farms[0].id
  const farmName = selectedFarm?.name || farms[0].name

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Crop Health Monitoring</h1>
              <p className="text-gray-600 mt-2">
                Real-time vegetation health analysis for {farmName}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Powered by satellite imagery, AI analysis, and vegetation indices
              </p>
            </div>
            {farms.length > 1 && (
              <div className="mt-4">
                <FarmSelector farms={farms} currentFarmId={farmId} />
              </div>
            )}
          </div>
        </div>

        {/* Technology Overview */}
        <div className="mb-8">
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Advanced Crop Health Technology</CardTitle>
              <CardDescription>
                Comprehensive vegetation monitoring using cutting-edge remote sensing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-green-100 to-green-50 rounded-lg">
                  <Satellite className="h-8 w-8 text-green-700 mx-auto mb-3" />
                  <div className="font-semibold text-green-900">Satellite Imagery</div>
                  <div className="text-sm text-green-700 mt-1">
                    Multi-spectral analysis from Copernicus Sentinel-2
                  </div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg">
                  <Leaf className="h-8 w-8 text-blue-700 mx-auto mb-3" />
                  <div className="font-semibold text-blue-900">Vegetation Indices</div>
                  <div className="text-sm text-blue-700 mt-1">
                    NDVI, EVI, SAVI, LAI and 5+ advanced metrics
                  </div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg">
                  <Brain className="h-8 w-8 text-purple-700 mx-auto mb-3" />
                  <div className="font-semibold text-purple-900">AI Analysis</div>
                  <div className="text-sm text-purple-700 mt-1">
                    Machine learning stress detection and yield prediction
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Health Dashboard */}
        <HealthDashboard farmId={farmId} />
      </main>
    </div>
  )
}