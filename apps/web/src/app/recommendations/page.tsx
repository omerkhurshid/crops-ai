import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../lib/auth/session'
import { Navbar } from '../../components/navigation/navbar'
import { RecommendationsDashboard } from '../../components/ai/recommendations-dashboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { prisma } from '../../lib/prisma'
import { FarmSelector } from '../../components/weather/farm-selector'

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

export default async function RecommendationsPage({ searchParams }: { searchParams: { farmId?: string } }) {
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
              <h1 className="text-3xl font-bold text-gray-900">AI-Powered Recommendations</h1>
              <p className="text-gray-600 mt-2">
                Intelligent farming insights for {farmName}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Powered by machine learning, satellite data, and weather analytics
              </p>
            </div>
            {farms.length > 1 && (
              <div className="mt-4">
                <FarmSelector farms={farms} currentFarmId={farmId} />
              </div>
            )}
          </div>
        </div>

        {/* Farm Overview */}
        <div className="mb-8">
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Farm Overview - {farmName}</CardTitle>
              <CardDescription>
                Current status and key metrics for AI recommendation generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-green-100 to-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-800">Active</div>
                  <div className="text-sm text-green-600">Farm Status</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-800">Real-time</div>
                  <div className="text-sm text-blue-600">Data Sources</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-800">ML-Powered</div>
                  <div className="text-sm text-purple-600">Analysis</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-orange-100 to-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-800">Actionable</div>
                  <div className="text-sm text-orange-600">Insights</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations Dashboard */}
        <RecommendationsDashboard farmId={farmId} />
      </main>
    </div>
  )
}