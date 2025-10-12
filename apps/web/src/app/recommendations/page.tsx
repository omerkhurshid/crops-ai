import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../lib/auth/session'
import { DashboardLayout } from '../../components/layout/dashboard-layout'
import { RecommendationsDashboard } from '../../components/ai/recommendations-dashboard'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription, MetricCard } from '../../components/ui/modern-card'
import { InlineFloatingButton } from '../../components/ui/floating-button'
import { ClientFloatingButton } from '../../components/ui/client-floating-button'
import { NoRecommendationsEmptyState, EmptyStateCard } from '../../components/ui/empty-states'
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

  // If no farms exist, show empty state instead of redirect
  const showEmptyState = farms.length === 0

  // If no farm selected or invalid farm, use first farm
  const farmId = selectedFarm?.id || farms[0].id
  const farmName = selectedFarm?.name || farms[0].name

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
          {/* Page Header - Consistent with other pages */}
          <h1 className="text-4xl font-light text-sage-800 mb-2">AI Recommendations</h1>
          <p className="text-lg text-sage-600 mb-6">
            AI-powered farming insights and recommendations for {farmName}
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
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
        <div className="mb-8">
          <ModernCard variant="glow" className="overflow-hidden">
            <ModernCardHeader className="bg-gradient-to-r from-sage-50/90 to-cream-50/90">
              <div className="flex items-center gap-3">
                <ModernCardTitle className="text-sage-800">AI Analysis Overview</ModernCardTitle>
              </div>
              <ModernCardDescription>
                Smart recommendations based on your farm data and conditions
              </ModernCardDescription>
            </ModernCardHeader>
            <ModernCardContent className="p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="group">
                  <div className="text-center p-6 bg-gradient-to-br from-sage-100 to-sage-50 rounded-2xl hover:shadow-soft transition-all duration-300 border border-sage-200/30">
                    <div className="p-3 bg-sage-200 rounded-xl mx-auto w-fit mb-4">
                      <Activity className="h-6 w-6 text-sage-700" />
                    </div>
                    <div className="text-2xl font-bold text-sage-800 mb-2">Active</div>
                    <div className="text-sm text-sage-600">Farm Status</div>
                  </div>
                </div>
                
                <div className="group">
                  <div className="text-center p-6 bg-gradient-to-br from-earth-100 to-earth-50 rounded-2xl hover:shadow-soft transition-all duration-300 border border-earth-200/30">
                    <div className="p-3 bg-earth-200 rounded-xl mx-auto w-fit mb-4">
                      <Zap className="h-6 w-6 text-earth-700" />
                    </div>
                    <div className="text-2xl font-bold text-earth-800 mb-2">Real-time</div>
                    <div className="text-sm text-earth-600">Data Sources</div>
                  </div>
                </div>
                
                <div className="group">
                  <div className="text-center p-6 bg-gradient-to-br from-cream-100 to-cream-50 rounded-2xl hover:shadow-soft transition-all duration-300 border border-cream-200/30">
                    <div className="p-3 bg-cream-200 rounded-xl mx-auto w-fit mb-4">
                      <Brain className="h-6 w-6 text-sage-700" />
                    </div>
                    <div className="text-2xl font-bold text-sage-800 mb-2">Smart</div>
                    <div className="text-sm text-sage-600">Analysis</div>
                  </div>
                </div>
                
                <div className="group">
                  <div className="text-center p-6 bg-gradient-to-br from-sage-100/70 to-earth-100/70 rounded-2xl hover:shadow-soft transition-all duration-300 border border-sage-200/30">
                    <div className="p-3 bg-sage-200 rounded-xl mx-auto w-fit mb-4">
                      <Target className="h-6 w-6 text-sage-700" />
                    </div>
                    <div className="text-2xl font-bold text-sage-800 mb-2">Actionable</div>
                    <div className="text-sm text-sage-600">Insights</div>
                  </div>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>
        </div>

        {/* Recommendations Dashboard with Modern Wrapper */}
        {showEmptyState ? (
          <EmptyStateCard className="max-w-3xl mx-auto">
            <NoRecommendationsEmptyState />
          </EmptyStateCard>
        ) : (
          <div className="space-y-8">
            <RecommendationsDashboard farmId={farmId} />
          </div>
        )}
      </main>
    </DashboardLayout>
  )
}