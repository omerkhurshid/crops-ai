import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../lib/auth/session'
import { DashboardLayout } from '../../components/layout/dashboard-layout'
import { HealthDashboard } from '../../components/crop-health/health-dashboard'
import { AdvancedVisualizations } from '../../components/crop-health/advanced-visualizations'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription, MetricCard } from '../../components/ui/modern-card'
import { InlineFloatingButton } from '../../components/ui/floating-button'
import { ClientFloatingButton } from '../../components/ui/client-floating-button'
import { NoHealthDataEmptyState, EmptyStateCard } from '../../components/ui/empty-states'
import { FarmSelector } from '../../components/weather/farm-selector'
import { prisma } from '../../lib/prisma'
import { Leaf, Satellite, Brain, Activity, Settings, Zap, BarChart3 } from 'lucide-react'

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
        label="Health Settings"
        variant="primary"
      />
      
      <main className="max-w-7xl mx-auto pt-8 pb-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-8">
          {/* Page Header - Consistent with other pages */}
          <h1 className="text-4xl font-light text-sage-800 mb-2">Crop Health Monitoring</h1>
          <p className="text-lg text-sage-600 mb-6">
            Monitor crop health and vegetation status for {farmName}
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

        {/* Technology Overview Cards */}
        <div className="mb-8">
          <ModernCard variant="floating" className="overflow-hidden">
            <ModernCardHeader className="bg-gradient-to-r from-sage-50 to-cream-50">
              <div className="flex items-center gap-3">
                <ModernCardTitle className="text-sage-800">Crop Health Technology</ModernCardTitle>
              </div>
              <ModernCardDescription>
                Satellite imagery and vegetation analysis to monitor crop health
              </ModernCardDescription>
            </ModernCardHeader>
            <ModernCardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center group">
                  <div className="p-6 bg-gradient-to-br from-sage-100 to-sage-50 rounded-2xl mb-4 group-hover:shadow-soft transition-all duration-300">
                    <Satellite className="h-10 w-10 text-sage-700 mx-auto mb-4" />
                    <div className="font-semibold text-sage-900 text-lg mb-2">Satellite Data</div>
                    <div className="text-sm text-sage-700 leading-relaxed">
                      High-resolution imagery updated every few days
                    </div>
                  </div>
                </div>
                
                <div className="text-center group">
                  <div className="p-6 bg-gradient-to-br from-earth-100 to-earth-50 rounded-2xl mb-4 group-hover:shadow-soft transition-all duration-300">
                    <Leaf className="h-10 w-10 text-earth-700 mx-auto mb-4" />
                    <div className="font-semibold text-earth-900 text-lg mb-2">Vegetation Health</div>
                    <div className="text-sm text-earth-700 leading-relaxed">
                      NDVI and other metrics to assess plant vigor
                    </div>
                  </div>
                </div>
                
                <div className="text-center group">
                  <div className="p-6 bg-gradient-to-br from-cream-100 to-cream-50 rounded-2xl mb-4 group-hover:shadow-soft transition-all duration-300">
                    <Brain className="h-10 w-10 text-sage-700 mx-auto mb-4" />
                    <div className="font-semibold text-sage-900 text-lg mb-2">Analysis</div>
                    <div className="text-sm text-sage-700 leading-relaxed">
                      Identify problem areas and trends over time
                    </div>
                  </div>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>
        </div>

        {/* Health Dashboard with Modern Wrapper */}
        {showEmptyState ? (
          <EmptyStateCard className="max-w-3xl mx-auto">
            <NoHealthDataEmptyState />
          </EmptyStateCard>
        ) : (
          <div className="space-y-8">
            <HealthDashboard farmId={farmId} />
          </div>
        )}

        {/* Advanced Visualizations Section */}
        {!showEmptyState && (
          <div className="space-y-8">
            <ModernCard variant="floating">
              <ModernCardHeader>
                <ModernCardTitle className="text-sage-800 flex items-center gap-3">
                  <BarChart3 className="h-6 w-6" />
                  Advanced Health Analytics
                </ModernCardTitle>
                <ModernCardDescription>
                  Detailed charts and analysis of crop health trends
                </ModernCardDescription>
              </ModernCardHeader>
              <ModernCardContent>
                <AdvancedVisualizations farmId={farmId} />
              </ModernCardContent>
            </ModernCard>
          </div>
        )}
      </main>
    </DashboardLayout>
  )
}