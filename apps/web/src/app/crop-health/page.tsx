import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../lib/auth/session'
import { Navbar } from '../../components/navigation/navbar'
import { HealthDashboard } from '../../components/crop-health/health-dashboard'
import { AdvancedVisualizations } from '../../components/crop-health/advanced-visualizations'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription, MetricCard } from '../../components/ui/modern-card'
import { InfoTooltip } from '../../components/ui/info-tooltip'
import { TOOLTIP_CONTENT } from '../../lib/tooltip-content'
import { InlineFloatingButton } from '../../components/ui/floating-button'
import { ClientFloatingButton } from '../../components/ui/client-floating-button'
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

  // If no farms exist, redirect to create farm
  if (farms.length === 0) {
    redirect('/farms/create')
  }

  // If no farm selected or invalid farm, use first farm
  const farmId = selectedFarm?.id || farms[0].id
  const farmName = selectedFarm?.name || farms[0].name

  return (
    <div className="minimal-page">
      <Navbar />
      
      {/* Floating Action Button */}
      <ClientFloatingButton
        icon={<Settings className="h-5 w-5" />}
        label="Health Settings"
        variant="primary"
      />
      
      <main className="max-w-7xl mx-auto pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          {/* Modern Header with Asymmetric Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <div className="flex items-start gap-6">
                <div className="p-4 bg-gradient-to-br from-sage-100 to-earth-100 rounded-2xl">
                  <Activity className="h-10 w-10 text-sage-700" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h1 className="text-4xl md:text-6xl font-light text-sage-800 tracking-tight">
                      Crop Health Monitoring
                    </h1>
                    <InfoTooltip {...TOOLTIP_CONTENT.healthScore} size="md" />
                  </div>
                  <p className="text-xl text-sage-600 font-light mb-2">
                    Real-time vegetation health analysis for <span className="font-semibold text-sage-800">{farmName}</span>
                  </p>
                  <p className="text-sm text-sage-500 leading-relaxed">
                    Powered by satellite imagery, AI analysis, and advanced vegetation indices for precision agriculture
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

        {/* Technology Overview Cards */}
        <div className="mb-16">
          <ModernCard variant="floating" className="overflow-hidden">
            <ModernCardHeader className="bg-gradient-to-r from-sage-50 to-cream-50">
              <div className="flex items-center gap-3">
                <ModernCardTitle className="text-sage-800">Advanced Crop Health Technology</ModernCardTitle>
                <InfoTooltip title="Health Monitoring" description="Comprehensive vegetation monitoring using cutting-edge remote sensing and AI-powered analysis." />
              </div>
              <ModernCardDescription>
                Multi-layered agricultural intelligence combining satellite data, vegetation science, and machine learning
              </ModernCardDescription>
            </ModernCardHeader>
            <ModernCardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center group">
                  <div className="p-6 bg-gradient-to-br from-sage-100 to-sage-50 rounded-2xl mb-4 group-hover:shadow-soft transition-all duration-300">
                    <Satellite className="h-10 w-10 text-sage-700 mx-auto mb-4" />
                    <div className="font-semibold text-sage-900 text-lg mb-2">Satellite Imagery</div>
                    <div className="text-sm text-sage-700 leading-relaxed">
                      Multi-spectral analysis from Copernicus Sentinel-2 satellites with 10m resolution
                    </div>
                  </div>
                  <InfoTooltip title="Satellite Technology" description="High-resolution multi-spectral imagery captured every 5-10 days from ESA Sentinel missions." size="sm" />
                </div>
                
                <div className="text-center group">
                  <div className="p-6 bg-gradient-to-br from-earth-100 to-earth-50 rounded-2xl mb-4 group-hover:shadow-soft transition-all duration-300">
                    <Leaf className="h-10 w-10 text-earth-700 mx-auto mb-4" />
                    <div className="font-semibold text-earth-900 text-lg mb-2">Vegetation Indices</div>
                    <div className="text-sm text-earth-700 leading-relaxed">
                      NDVI, EVI, SAVI, GNDVI, LAI and 8+ specialized metrics for comprehensive crop analysis
                    </div>
                  </div>
                  <InfoTooltip {...TOOLTIP_CONTENT.ndvi} size="sm" />
                </div>
                
                <div className="text-center group">
                  <div className="p-6 bg-gradient-to-br from-cream-100 to-cream-50 rounded-2xl mb-4 group-hover:shadow-soft transition-all duration-300">
                    <Brain className="h-10 w-10 text-sage-700 mx-auto mb-4" />
                    <div className="font-semibold text-sage-900 text-lg mb-2">AI Analysis</div>
                    <div className="text-sm text-sage-700 leading-relaxed">
                      Machine learning algorithms for stress detection, yield prediction, and anomaly identification
                    </div>
                  </div>
                  <InfoTooltip {...TOOLTIP_CONTENT.confidence} size="sm" />
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>
        </div>

        {/* Health Dashboard with Modern Wrapper */}
        <div className="space-y-8">
          <HealthDashboard farmId={farmId} />
        </div>

        {/* Advanced Visualizations Section */}
        <div className="space-y-8">
          <ModernCard variant="floating">
            <ModernCardHeader>
              <ModernCardTitle className="text-sage-800 flex items-center gap-3">
                <BarChart3 className="h-6 w-6" />
                Advanced Health Analytics
              </ModernCardTitle>
              <ModernCardDescription>
                In-depth visualization and trend analysis of your crop health data
              </ModernCardDescription>
            </ModernCardHeader>
            <ModernCardContent>
              <AdvancedVisualizations farmId={farmId} />
            </ModernCardContent>
          </ModernCard>
        </div>
      </main>
    </div>
  )
}