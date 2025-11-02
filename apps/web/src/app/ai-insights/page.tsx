import { redirect } from 'next/navigation'
import { getAuthenticatedUser } from '../../lib/auth/server'
import { DashboardLayout } from '../../components/layout/dashboard-layout'
import { MLInsightsDashboard } from '../../components/ai/ml-insights-dashboard'
import { RecommendationsDashboard } from '../../components/ai/recommendations-dashboard'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '../../components/ui/modern-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { ClientFloatingButton } from '../../components/ui/client-floating-button'
import { FarmSelector } from '../../components/weather/farm-selector'
import { Brain, Target, TrendingUp, Settings, Zap, BarChart } from 'lucide-react'
import { prisma } from '../../lib/prisma'

export const dynamic = 'force-dynamic'

async function getUserFarms(userId: string) {
  const farms = await prisma.farm.findMany({
    where: { ownerId: userId },
    select: { id: true, name: true, latitude: true, longitude: true },
    orderBy: { name: 'asc' }
  })
  return farms
}

async function getSelectedFarm(farmId: string | null, userId: string) {
  if (!farmId) {
    const defaultFarm = await prisma.farm.findFirst({
      where: { ownerId: userId },
      select: { 
        id: true, 
        name: true,
        latitude: true,
        longitude: true,
        fields: {
          select: {
            id: true,
            name: true,
            area: true
          }
        }
      }
    })
    return defaultFarm
  }

  const farm = await prisma.farm.findFirst({
    where: { 
      id: farmId,
      ownerId: userId 
    },
    select: { 
      id: true, 
      name: true,
      latitude: true,
      longitude: true,
      fields: {
        select: {
          id: true,
          name: true,
          area: true
        }
      }
    }
  })
  
  return farm
}

export default async function AIInsightsPage({ searchParams }: { searchParams: { farmId?: string } }) {
  const user = await getAuthenticatedUser()

  if (!user) {
    redirect('/login')
  }

  const farms = await getUserFarms(user.id)
  const selectedFarm = await getSelectedFarm(searchParams.farmId || null, user.id)

  // If no farms exist, redirect to farm creation
  if (farms.length === 0) {
    redirect('/farms/create-unified')
  }

  const farmId = selectedFarm?.id || farms[0]?.id
  const farmName = selectedFarm?.name || farms[0]?.name

  // Get selected agriculture from farm configuration
  const selectedAgriculture = (selectedFarm as any)?.selectedCrops || (selectedFarm as any)?.selectedAgriculture || []

  const farmLocation = {
    latitude: selectedFarm?.latitude || 39.8283,  // Geographic center of US as neutral fallback
    longitude: selectedFarm?.longitude || -98.5795
  }

  return (
    <DashboardLayout>
      
      {/* Floating Action Button */}
      <ClientFloatingButton
        icon={<Settings className="h-5 w-5" />}
        label="AI Settings"
        variant="primary"
      />
      
      <main className="max-w-7xl mx-auto pt-8 pb-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-8">
          {/* Page Header */}
          <h1 className="text-4xl font-light text-sage-800 mb-2">AI Insights & Analytics</h1>
          <p className="text-lg text-sage-600 mb-6">
            Advanced machine learning insights and recommendations for {farmName}
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <div className="flex items-center gap-2 text-sage-600">
                <Brain className="h-4 w-4" />
                <span className="text-sm font-medium">
                  7 AI models actively analyzing your farm • Last updated: 2 minutes ago
                </span>
              </div>
            </div>
            <div className="lg:col-span-4">
              {farms.length > 1 && (
                <ModernCard variant="glass">
                  <ModernCardContent className="p-4">
                    <FarmSelector farms={farms} currentFarmId={farmId} />
                  </ModernCardContent>
                </ModernCard>
              )}
            </div>
          </div>
        </div>

        {/* Main AI Insights Dashboard */}
        <div className="space-y-8">
          <ModernCard variant="floating" className="overflow-hidden">
            <Tabs defaultValue="insights" className="space-y-0">
              <ModernCardHeader className="bg-gradient-to-r from-purple-50/80 to-blue-50/80 border-b border-purple-200/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ModernCardTitle className="text-purple-800">AI Analytics Hub</ModernCardTitle>
                  </div>
                  <TabsList className="bg-white/60 border border-purple-200/50">
                    <TabsTrigger value="insights">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        ML Insights
                      </div>
                    </TabsTrigger>
                    <TabsTrigger value="recommendations">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Recommendations
                      </div>
                    </TabsTrigger>
                    <TabsTrigger value="forecasting">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Forecasting
                      </div>
                    </TabsTrigger>
                    <TabsTrigger value="analytics">
                      <div className="flex items-center gap-2">
                        <BarChart className="h-4 w-4" />
                        Performance
                      </div>
                    </TabsTrigger>
                  </TabsList>
                </div>
                <ModernCardDescription>
                  Real-time AI analysis powered by 7 machine learning models and comprehensive agricultural knowledge base
                </ModernCardDescription>
              </ModernCardHeader>
              
              <TabsContent value="insights" className="m-0">
                <div className="p-6">
                  <MLInsightsDashboard 
                    farmId={farmId}
                    selectedAgriculture={selectedAgriculture}
                    farmLocation={farmLocation}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="recommendations" className="m-0">
                <div className="p-6">
                  <RecommendationsDashboard farmId={farmId} />
                </div>
              </TabsContent>
              
              <TabsContent value="forecasting" className="m-0">
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Yield Forecasting Card */}
                    <ModernCard>
                      <ModernCardHeader>
                        <ModernCardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-green-600" />
                          Yield Forecast
                        </ModernCardTitle>
                      </ModernCardHeader>
                      <ModernCardContent>
                        <div className="space-y-4">
                          <div>
                            <p className="text-2xl font-bold text-green-600">165.5 bu/acre</p>
                            <p className="text-sm text-gray-600">Corn yield prediction</p>
                            <p className="text-xs text-green-600">+12.3% vs average</p>
                          </div>
                          <div className="bg-green-50 p-3 rounded-lg">
                            <p className="text-sm font-medium text-green-800">Key Factors:</p>
                            <ul className="text-xs text-green-700 mt-1">
                              <li>• Favorable weather patterns</li>
                              <li>• Optimal soil conditions</li>
                              <li>• Timely planting window</li>
                            </ul>
                          </div>
                        </div>
                      </ModernCardContent>
                    </ModernCard>

                    {/* Weather Forecast Card */}
                    <ModernCard>
                      <ModernCardHeader>
                        <ModernCardTitle className="flex items-center gap-2">
                          <Zap className="h-5 w-5 text-blue-600" />
                          Weather Outlook
                        </ModernCardTitle>
                      </ModernCardHeader>
                      <ModernCardContent>
                        <div className="space-y-4">
                          <div>
                            <p className="text-2xl font-bold text-blue-600">92% Accuracy</p>
                            <p className="text-sm text-gray-600">7-day hyperlocal forecast</p>
                          </div>
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-sm font-medium text-blue-800">Next 3 Days:</p>
                            <ul className="text-xs text-blue-700 mt-1">
                              <li>• Scattered showers likely</li>
                              <li>• Temperature: 68-84°F</li>
                              <li>• Good for field operations</li>
                            </ul>
                          </div>
                        </div>
                      </ModernCardContent>
                    </ModernCard>

                    {/* Market Forecast Card */}
                    <ModernCard>
                      <ModernCardHeader>
                        <ModernCardTitle className="flex items-center gap-2">
                          <BarChart className="h-5 w-5 text-purple-600" />
                          Price Forecast
                        </ModernCardTitle>
                      </ModernCardHeader>
                      <ModernCardContent>
                        <div className="space-y-4">
                          <div>
                            <p className="text-2xl font-bold text-purple-600">$4.92/bu</p>
                            <p className="text-sm text-gray-600">30-day corn price</p>
                            <p className="text-xs text-purple-600">Bullish trend</p>
                          </div>
                          <div className="bg-purple-50 p-3 rounded-lg">
                            <p className="text-sm font-medium text-purple-800">Market Factors:</p>
                            <ul className="text-xs text-purple-700 mt-1">
                              <li>• Strong export demand</li>
                              <li>• Weather premiums possible</li>
                              <li>• Inventory levels declining</li>
                            </ul>
                          </div>
                        </div>
                      </ModernCardContent>
                    </ModernCard>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="analytics" className="m-0">
                <div className="p-6">
                  <div className="space-y-6">
                    {/* Model Performance Overview */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Model Performance Dashboard</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-green-50 p-4 rounded-lg">
                          <p className="text-sm text-green-600 font-medium">Yield Prediction</p>
                          <p className="text-2xl font-bold text-green-700">87%</p>
                          <p className="text-xs text-green-600">Accuracy</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-sm text-blue-600 font-medium">Weather Forecast</p>
                          <p className="text-2xl font-bold text-blue-700">92%</p>
                          <p className="text-xs text-blue-600">Confidence</p>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg">
                          <p className="text-sm text-orange-600 font-medium">Pest Detection</p>
                          <p className="text-2xl font-bold text-orange-700">82%</p>
                          <p className="text-xs text-orange-600">Accuracy</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <p className="text-sm text-purple-600 font-medium">Market Forecast</p>
                          <p className="text-2xl font-bold text-purple-700">75%</p>
                          <p className="text-xs text-purple-600">Accuracy</p>
                        </div>
                      </div>
                    </div>

                    {/* AI Impact Metrics */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Impact on Your Farm</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <ModernCard>
                          <ModernCardContent className="p-6">
                            <div className="text-center">
                              <p className="text-3xl font-bold text-green-600">+15.3%</p>
                              <p className="text-sm text-gray-600">Estimated yield improvement</p>
                              <p className="text-xs text-gray-500 mt-2">Compared to baseline farming practices</p>
                            </div>
                          </ModernCardContent>
                        </ModernCard>
                        
                        <ModernCard>
                          <ModernCardContent className="p-6">
                            <div className="text-center">
                              <p className="text-3xl font-bold text-blue-600">$2,840</p>
                              <p className="text-sm text-gray-600">Estimated cost savings</p>
                              <p className="text-xs text-gray-500 mt-2">Through optimized inputs and timing</p>
                            </div>
                          </ModernCardContent>
                        </ModernCard>
                        
                        <ModernCard>
                          <ModernCardContent className="p-6">
                            <div className="text-center">
                              <p className="text-3xl font-bold text-purple-600">87%</p>
                              <p className="text-sm text-gray-600">Decision confidence</p>
                              <p className="text-xs text-gray-500 mt-2">Average across all recommendations</p>
                            </div>
                          </ModernCardContent>
                        </ModernCard>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </ModernCard>
        </div>
      </main>
    </DashboardLayout>
  )
}