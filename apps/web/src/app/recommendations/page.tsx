import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../lib/auth/session'
import { Navbar } from '../../components/navigation/navbar'
import { RecommendationsDashboard } from '../../components/ai/recommendations-dashboard'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription, MetricCard } from '../../components/ui/modern-card'
import { InfoTooltip, TOOLTIP_CONTENT } from '../../components/ui/info-tooltip'
import { FloatingActionButton, InlineFloatingButton } from '../../components/ui/floating-button'
import { Badge } from '../../components/ui/badge'
import { prisma } from '../../lib/prisma'
import { FarmSelector } from '../../components/weather/farm-selector'
import { Brain, Zap, Target, Settings, Activity, TrendingUp } from 'lucide-react'

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
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-sage-50/30 to-cream-100">
      <Navbar />
      
      {/* Floating Action Button */}
      <FloatingActionButton
        icon={<Settings className="h-5 w-5" />}
        label="AI Settings"
        variant="primary"
        onClick={() => {}} // Add functionality later
      />
      
      <main className="max-w-7xl mx-auto pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          {/* Modern Header with Asymmetric Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <div className="flex items-start gap-6">
                <div className="p-4 bg-gradient-to-br from-sage-100 to-earth-100 rounded-2xl relative overflow-hidden">
                  <Brain className="h-10 w-10 text-sage-700 relative z-10" />
                  <div className="absolute inset-0 bg-gradient-to-br from-sage-200/30 to-earth-200/30 animate-pulse-soft"></div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <h1 className="text-4xl md:text-6xl font-light text-sage-800 tracking-tight">
                      AI Recommendations
                    </h1>
                    <InfoTooltip {...TOOLTIP_CONTENT.confidence} size="md" />
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-xl text-sage-600 font-light">
                      Intelligent farming insights for <span className="font-semibold text-sage-800">{farmName}</span>
                    </p>
                    <Badge className="bg-sage-100 text-sage-700 border-sage-200">
                      AI-Powered
                    </Badge>
                  </div>
                  <p className="text-sm text-sage-500 leading-relaxed">
                    Advanced machine learning algorithms analyze satellite data, weather patterns, and crop science to deliver precision farming recommendations
                  </p>
                </div>
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

        {/* AI Intelligence Overview */}
        <div className="mb-16">
          <ModernCard variant="glow" className="overflow-hidden">
            <ModernCardHeader className="bg-gradient-to-r from-sage-50/90 to-cream-50/90">
              <div className="flex items-center gap-3">
                <ModernCardTitle className="text-sage-800">AI Intelligence Overview - {farmName}</ModernCardTitle>
                <InfoTooltip {...TOOLTIP_CONTENT.confidence} />
              </div>
              <ModernCardDescription>
                Real-time data processing and machine learning analysis powering intelligent agricultural recommendations
              </ModernCardDescription>
            </ModernCardHeader>
            <ModernCardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="group">
                  <div className="text-center p-6 bg-gradient-to-br from-sage-100 to-sage-50 rounded-2xl hover:shadow-soft transition-all duration-300 border border-sage-200/30">
                    <div className="p-3 bg-sage-200 rounded-xl mx-auto w-fit mb-4">
                      <Activity className="h-6 w-6 text-sage-700" />
                    </div>
                    <div className="text-2xl font-bold text-sage-800 mb-2">Active</div>
                    <div className="text-sm text-sage-600">Farm Status</div>
                    <InfoTooltip title="Farm Status" description="Real-time operational status and system connectivity for continuous monitoring." size="sm" className="mt-2" />
                  </div>
                </div>
                
                <div className="group">
                  <div className="text-center p-6 bg-gradient-to-br from-earth-100 to-earth-50 rounded-2xl hover:shadow-soft transition-all duration-300 border border-earth-200/30">
                    <div className="p-3 bg-earth-200 rounded-xl mx-auto w-fit mb-4">
                      <Zap className="h-6 w-6 text-earth-700" />
                    </div>
                    <div className="text-2xl font-bold text-earth-800 mb-2">Real-time</div>
                    <div className="text-sm text-earth-600">Data Sources</div>
                    <InfoTooltip title="Real-time Data" description="Live satellite imagery, weather data, and sensor networks updated continuously." size="sm" className="mt-2" />
                  </div>
                </div>
                
                <div className="group">
                  <div className="text-center p-6 bg-gradient-to-br from-cream-100 to-cream-50 rounded-2xl hover:shadow-soft transition-all duration-300 border border-cream-200/30">
                    <div className="p-3 bg-cream-200 rounded-xl mx-auto w-fit mb-4">
                      <Brain className="h-6 w-6 text-sage-700" />
                    </div>
                    <div className="text-2xl font-bold text-sage-800 mb-2">ML-Powered</div>
                    <div className="text-sm text-sage-600">Analysis</div>
                    <InfoTooltip {...TOOLTIP_CONTENT.confidence} size="sm" className="mt-2" />
                  </div>
                </div>
                
                <div className="group">
                  <div className="text-center p-6 bg-gradient-to-br from-sage-100/70 to-earth-100/70 rounded-2xl hover:shadow-soft transition-all duration-300 border border-sage-200/30">
                    <div className="p-3 bg-sage-200 rounded-xl mx-auto w-fit mb-4">
                      <Target className="h-6 w-6 text-sage-700" />
                    </div>
                    <div className="text-2xl font-bold text-sage-800 mb-2">Actionable</div>
                    <div className="text-sm text-sage-600">Insights</div>
                    <InfoTooltip title="Actionable Insights" description="Practical recommendations with clear steps for implementation and expected outcomes." size="sm" className="mt-2" />
                  </div>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>
        </div>

        {/* Recommendations Dashboard with Modern Wrapper */}
        <div className="space-y-8">
          <RecommendationsDashboard farmId={farmId} />
        </div>
      </main>
    </div>
  )
}