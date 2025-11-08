'use client'
import { useSession } from '../../lib/auth-unified'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { DashboardLayout } from '../../components/layout/dashboard-layout'
import { MLInsightsDashboard } from '../../components/ai/ml-insights-dashboard'
import { RecommendationsDashboard } from '../../components/ai/recommendations-dashboard'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '../../components/ui/modern-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { ClientFloatingButton } from '../../components/ui/client-floating-button'
import { FarmSelector } from '../../components/weather/farm-selector'
import { Brain, Target, TrendingUp, Settings, Zap, BarChart } from 'lucide-react'
interface Farm {
  id: string
  name: string
  latitude: number | null
  longitude: number | null
  fields?: Array<{
    id: string
    name: string
    area: number
  }>
}
export default function AIInsightsPage({ searchParams }: { searchParams: { farmId?: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [farms, setFarms] = useState<Farm[]>([])
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
    // Fetch farms data
    const fetchData = async () => {
      try {
        // Fetch user's farms
        const farmsResponse = await fetch('/api/farms')
        let farmsData: Farm[] = []
        if (farmsResponse.ok) {
          farmsData = await farmsResponse.json()
          setFarms(farmsData)
        }
        // If no farms exist, redirect to farm creation
        if (farmsData.length === 0) {
          router.push('/farms/create-unified')
          return
        }
        // Select farm (either from searchParams or first farm)
        const targetFarmId = searchParams.farmId || farmsData[0]?.id
        const farm = farmsData.find(f => f.id === targetFarmId) || farmsData[0]
        setSelectedFarm(farm)
      } catch (error) {
        console.error('Error fetching farms data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [session, status, router, searchParams])
  if (status === 'loading' || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="ml-4 text-gray-600">Loading AI insights...</p>
        </div>
      </DashboardLayout>
    )
  }
  if (!session) {
    return null // Will redirect
  }
  return (
    <DashboardLayout>
      <ClientFloatingButton
        icon={<Settings className="h-5 w-5" />}
        label="AI Settings"
        variant="secondary"
      />
      <main className="max-w-7xl mx-auto pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-light text-sage-800 mb-2 flex items-center gap-3">
                <Brain className="h-10 w-10 text-sage-600" />
                AI Insights
              </h1>
              <p className="text-lg text-sage-600">
                Intelligent crop management and yield optimization powered by machine learning
              </p>
            </div>
            {farms.length > 0 && (
              <div className="w-64">
                <FarmSelector 
                  farms={farms}
                  currentFarmId={selectedFarm?.id || ''}
                />
              </div>
            )}
          </div>
        </div>
        {/* AI Capabilities Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <ModernCard variant="floating">
            <ModernCardContent className="p-6 text-center">
              <Target className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <ModernCardTitle className="text-lg mb-2">Predictive Analytics</ModernCardTitle>
              <ModernCardDescription>
                Forecast crop yields, disease risks, and optimal harvest timing using historical data and ML models
              </ModernCardDescription>
            </ModernCardContent>
          </ModernCard>
          <ModernCard variant="floating">
            <ModernCardContent className="p-6 text-center">
              <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <ModernCardTitle className="text-lg mb-2">Optimization Engine</ModernCardTitle>
              <ModernCardDescription>
                Maximize efficiency with AI-driven recommendations for irrigation, fertilization, and resource allocation
              </ModernCardDescription>
            </ModernCardContent>
          </ModernCard>
          <ModernCard variant="floating">
            <ModernCardContent className="p-6 text-center">
              <Zap className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <ModernCardTitle className="text-lg mb-2">Real-time Intelligence</ModernCardTitle>
              <ModernCardDescription>
                Get instant insights from satellite imagery, weather patterns, and IoT sensor data analysis
              </ModernCardDescription>
            </ModernCardContent>
          </ModernCard>
        </div>
        {/* Main Content Tabs */}
        <Tabs defaultValue="ml-insights" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ml-insights" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              ML Insights
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Smart Recommendations
            </TabsTrigger>
          </TabsList>
          <TabsContent value="ml-insights" className="space-y-6">
            <ModernCard variant="floating">
              <ModernCardHeader>
                <ModernCardTitle>Machine Learning Analytics</ModernCardTitle>
                <ModernCardDescription>
                  Advanced insights and predictions for {selectedFarm?.name || 'your farm'}
                </ModernCardDescription>
              </ModernCardHeader>
              <ModernCardContent>
                <MLInsightsDashboard 
                  farmId={selectedFarm?.id || ''} 
                  farmLocation={selectedFarm?.latitude && selectedFarm?.longitude ? {
                    latitude: selectedFarm.latitude,
                    longitude: selectedFarm.longitude
                  } : undefined}
                />
              </ModernCardContent>
            </ModernCard>
          </TabsContent>
          <TabsContent value="recommendations" className="space-y-6">
            <ModernCard variant="floating">
              <ModernCardHeader>
                <ModernCardTitle>AI-Powered Recommendations</ModernCardTitle>
                <ModernCardDescription>
                  Personalized suggestions to optimize your farming operations
                </ModernCardDescription>
              </ModernCardHeader>
              <ModernCardContent>
                <RecommendationsDashboard farmId={selectedFarm?.id || ''} />
              </ModernCardContent>
            </ModernCard>
          </TabsContent>
        </Tabs>
        {/* Additional AI Tools */}
        <div className="mt-12">
          <h2 className="text-2xl font-light text-sage-800 mb-6">AI-Powered Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ModernCard variant="floating" className="cursor-pointer hover:shadow-lg transition-shadow">
              <ModernCardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-sage-800 mb-2">Crop Health AI</h3>
                <p className="text-sage-600 text-sm">
                  Detect diseases and pests early using computer vision and satellite imagery analysis
                </p>
              </ModernCardContent>
            </ModernCard>
            <ModernCard variant="floating" className="cursor-pointer hover:shadow-lg transition-shadow">
              <ModernCardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-sage-800 mb-2">Yield Predictor</h3>
                <p className="text-sage-600 text-sm">
                  Forecast harvest yields with 90%+ accuracy using weather, soil, and historical data
                </p>
              </ModernCardContent>
            </ModernCard>
            <ModernCard variant="floating" className="cursor-pointer hover:shadow-lg transition-shadow">
              <ModernCardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-sage-800 mb-2">Resource Optimizer</h3>
                <p className="text-sage-600 text-sm">
                  Optimize water, fertilizer, and energy usage with AI-driven efficiency recommendations
                </p>
              </ModernCardContent>
            </ModernCard>
          </div>
        </div>
      </main>
    </DashboardLayout>
  )
}