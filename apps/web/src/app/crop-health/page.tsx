import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../lib/auth/session'
import { DashboardLayout } from '../../components/layout/dashboard-layout'
import { FarmerFocusedDashboard } from '../../components/crop-health/farmer-focused-dashboard'
import { HealthDashboard } from '../../components/crop-health/health-dashboard'
import { AdvancedVisualizations } from '../../components/crop-health/advanced-visualizations'
import { NDVIMap } from '../../components/crop-health/ndvi-map'
import { KnowledgeDrivenHealthDashboard } from '../../components/crop-health/knowledge-driven-health-dashboard'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription, MetricCard } from '../../components/ui/modern-card'
import { InlineFloatingButton } from '../../components/ui/floating-button'
import { ClientFloatingButton } from '../../components/ui/client-floating-button'
import { NoHealthDataEmptyState, EmptyStateCard } from '../../components/ui/empty-states'
import { FarmSelector } from '../../components/weather/farm-selector'
import { prisma } from '../../lib/prisma'
import { Leaf, Satellite, Brain, Activity, Settings, Zap, BarChart3, Eye, TrendingUp } from 'lucide-react'

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
    // Get the user's first farm as default with fields
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

  // Get specific farm with fields
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

export default async function CropHealthPage({ searchParams }: { searchParams: { farmId?: string; view?: string } }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const farms = await getUserFarms(user.id)
  const selectedFarm = await getSelectedFarm(searchParams.farmId || null, user.id)
  const viewMode = searchParams.view || 'farmer' // 'farmer' or 'detailed'

  // If no farms exist, show empty state instead of redirect
  const showEmptyState = farms.length === 0

  // If no farm selected or invalid farm, use first farm
  const farmId = selectedFarm?.id || farms[0]?.id
  const farmName = selectedFarm?.name || farms[0]?.name
  const fields = selectedFarm?.fields || []

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
            <div className="lg:col-span-6">
              {/* View Toggle */}
              <div className="flex items-center gap-2">
                <a 
                  href={`/crop-health?farmId=${farmId}&view=farmer`}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === 'farmer' 
                      ? 'bg-sage-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Eye className="h-4 w-4 inline mr-2" />
                  Farmer View
                </a>
                <a 
                  href={`/crop-health?farmId=${farmId}&view=knowledge`}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === 'knowledge' 
                      ? 'bg-sage-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Brain className="h-4 w-4 inline mr-2" />
                  AI Insights
                </a>
                <a 
                  href={`/crop-health?farmId=${farmId}&view=detailed`}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === 'detailed' 
                      ? 'bg-sage-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <BarChart3 className="h-4 w-4 inline mr-2" />
                  Technical View
                </a>
              </div>
            </div>
            <div className="lg:col-span-6">
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

        {/* Health Dashboard with Modern Wrapper */}
        {showEmptyState ? (
          <EmptyStateCard className="max-w-3xl mx-auto">
            <NoHealthDataEmptyState />
          </EmptyStateCard>
        ) : viewMode === 'farmer' ? (
          <div className="space-y-8">
            {/* NDVI Map - Killer Feature (Simplified for Farmers) */}
            <ModernCard variant="floating">
              <ModernCardHeader>
                <ModernCardTitle className="text-sage-800 flex items-center gap-3">
                  <Satellite className="h-6 w-6" />
                  Satellite Field View
                </ModernCardTitle>
                <ModernCardDescription>
                  See the health of your crops from space - green areas are healthy, red areas need attention
                </ModernCardDescription>
              </ModernCardHeader>
              <ModernCardContent>
                <NDVIMap farmId={farmId} fields={fields} />
              </ModernCardContent>
            </ModernCard>

            {/* Farmer-Focused Dashboard */}
            <FarmerFocusedDashboard farmId={farmId} />
          </div>
        ) : viewMode === 'knowledge' ? (
          <div className="space-y-8">
            {/* Knowledge-Driven Health Dashboard */}
            <ModernCard variant="floating">
              <ModernCardHeader>
                <ModernCardTitle className="text-sage-800 flex items-center gap-3">
                  <Brain className="h-6 w-6" />
                  AI-Powered Crop Intelligence
                </ModernCardTitle>
                <ModernCardDescription>
                  Crop-specific insights powered by our agricultural knowledge base and ML models
                </ModernCardDescription>
              </ModernCardHeader>
              <ModernCardContent>
                <KnowledgeDrivenHealthDashboard 
                  farmId={farmId} 
                  selectedCrops={[]}
                  fieldData={selectedFarm ? {
                    latitude: selectedFarm.latitude || 39.8283,
                    longitude: selectedFarm.longitude || -98.5795,
                    soilType: 'Unknown'
                  } : undefined}
                />
              </ModernCardContent>
            </ModernCard>
          </div>
        ) : (
          <div className="space-y-8">
            {/* NDVI Map - Technical Version */}
            <ModernCard variant="floating">
              <ModernCardHeader>
                <ModernCardTitle className="text-sage-800 flex items-center gap-3">
                  <Satellite className="h-6 w-6" />
                  Field NDVI Map - Technical Analysis
                </ModernCardTitle>
                <ModernCardDescription>
                  Visual satellite analysis showing vegetation health across your fields with detailed indices
                </ModernCardDescription>
              </ModernCardHeader>
              <ModernCardContent>
                <NDVIMap farmId={farmId} fields={fields} />
              </ModernCardContent>
            </ModernCard>

            {/* Technical Health Dashboard */}
            <HealthDashboard farmId={farmId} />

            {/* Advanced Visualizations */}
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