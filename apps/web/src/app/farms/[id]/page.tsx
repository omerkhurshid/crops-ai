'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from '../../../lib/auth-unified'
import { useEffect, useState } from 'react'
import { Badge } from '../../../components/ui/badge'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription, MetricCard } from '../../../components/ui/modern-card'
import { InfoTooltip } from '../../../components/ui/info-tooltip'
import { TOOLTIP_CONTENT } from '../../../lib/tooltip-content'
import { InlineFloatingButton } from '../../../components/ui/floating-button'
import { ClientFloatingButton } from '../../../components/ui/client-floating-button'
import { NoFieldsEmptyState, EmptyStateCard } from '../../../components/ui/empty-states'
import { DashboardLayout } from '../../../components/layout/dashboard-layout'
import { SatelliteViewer } from '../../../components/satellite/satellite-viewer'
import { MarketDashboard } from '../../../components/market/market-dashboard'
import { AnalyticsDashboard } from '../../../components/analytics/charts'
import { VisualFarmMap } from '../../../components/farm/visual-farm-map'
import { EnhancedFarmMap } from '../../../components/farm/enhanced-farm-map'
import { FarmHealthCard } from '../../../components/farms/farm-health-card'
import { FieldStatusToggle } from '../../../components/farm/field-status-toggle'
import { prisma } from '../../../lib/prisma'
import { 
  Sprout, MapPin, Activity, AlertTriangle, TrendingUp, Clock, 
  CloudRain, Sun, Droplets, Wind, Thermometer, BarChart,
  Satellite, Brain, DollarSign, Calendar, ArrowLeft, Eye, Plus, Settings
} from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getFarmDetails(farmId: string, userId: string) {
  try {
    const farm = await prisma.farm.findFirst({
      where: { 
        id: farmId,
        ownerId: userId
      },
      include: {
        fields: {
          include: {
            crops: {
              where: { status: { not: 'HARVESTED' } },
              orderBy: { createdAt: 'desc' },
              take: 1
            },
            satelliteData: {
              orderBy: { captureDate: 'desc' },
              take: 1
            }
          }
        }
      }
    })

    if (!farm) {
      return null
    }

    // Calculate aggregate stats
    const totalArea = (farm.fields || []).reduce((sum, field) => sum + field.area, 0)
    const averageNDVI = (farm.fields || []).reduce((sum, field) => {
      const latestData = field.satelliteData?.[0]
      return sum + (latestData?.ndvi || 0)
    }, 0) / ((farm.fields || []).length || 1)

    return {
      ...farm,
      stats: {
        totalArea,
        averageNDVI,
        fieldsCount: (farm.fields || []).length,
        healthScore: Math.round(averageNDVI * 100)
      }
    }
  } catch (error) {
    console.error('Error fetching farm details:', error)
    return null
  }
}

export default function FarmDetailsPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [farm, setFarm] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    async function fetchFarm() {
      try {
        const response = await fetch(`/api/farms/${params.id}`)
        if (response.ok) {
          const farmData = await response.json()
          setFarm(farmData)
        } else if (response.status === 404) {
          router.push('/farms')
        }
      } catch (error) {
        console.error('Error fetching farm:', error)
        router.push('/farms')
      } finally {
        setIsLoading(false)
      }
    }

    fetchFarm()
  }, [session, status, router, params.id])

  if (status === 'loading' || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="ml-4 text-gray-600">Loading farm details...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!session || !farm) {
    return null
  }

  return (
    <DashboardLayout>
      {/* Floating Action Button */}
      <ClientFloatingButton
        icon={<Settings className="h-5 w-5" />}
        label="Farm Settings"
        variant="primary"
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        {/* Modern Header with Asymmetric Layout */}
        <div className="mb-12 relative">
          <Link href="/farms" className="inline-flex items-center text-sm text-sage-600 hover:text-sage-800 mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Farms
          </Link>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Main Farm Info - Takes 2 columns */}
            <div className="lg:col-span-2">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light text-sage-800 tracking-tight">{farm.name}</h1>
                    <InfoTooltip {...TOOLTIP_CONTENT.farm} size="md" />
                  </div>
                  <div className="flex items-center text-sage-600 mb-4">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{farm.address || `${farm.region || 'Unknown'}, ${farm.country || 'Unknown'}`}</span>
                  </div>
                </div>
                <Badge className="bg-sage-100 text-sage-700 border-sage-200 px-3 py-1">
                  Active
                </Badge>
              </div>
            </div>
            
            {/* Quick Action Panel */}
            <div className="lg:col-span-1">
              <ModernCard variant="glass" className="h-full">
                <ModernCardContent className="p-4">
                  <h3 className="font-medium text-sage-800 mb-3">Quick Actions</h3>
                  <div className="space-y-2">
                    <Link href={`/farms/${farm.id}/fields/create`}>
                      <InlineFloatingButton
                        icon={<Plus className="h-4 w-4" />}
                        label="Add Field"
                        showLabel={true}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                      />
                    </Link>
                    <InlineFloatingButton
                      icon={<BarChart className="h-4 w-4" />}
                      label="View Analytics"
                      showLabel={true}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                    />
                  </div>
                </ModernCardContent>
              </ModernCard>
            </div>
          </div>
        </div>

        {/* Sophisticated Stats Grid - Mobile Optimized */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8 lg:mb-12">
          <MetricCard
            title="Total Area"
            value={`${farm.stats.totalArea.toFixed(1)} ha`}
            description={`${(farm.stats.totalArea * 2.47).toFixed(1)} acres`}
            icon={<Sprout className="h-6 w-6" />}
            variant="soft"
            tooltip={TOOLTIP_CONTENT.area}
          />
          
          <MetricCard
            title="Fields"
            value={farm.stats.fieldsCount.toString()}
            description="Monitored"
            icon={<MapPin className="h-6 w-6" />}
            variant="glass"
            tooltip={TOOLTIP_CONTENT.field}
          />
          
          <MetricCard
            title="Health"
            value={`${farm.stats.healthScore}%`}
            description="NDVI-based"
            icon={<Activity className="h-6 w-6" />}
            variant="glow"
            tooltip={TOOLTIP_CONTENT.healthScore}
          />
          
          <MetricCard
            title="Next Task"
            value="Inspection"
            description="3 days"
            icon={<Calendar className="h-6 w-6" />}
            variant="glow"
          />
        </div>

        {/* Enhanced Farm Map with NDVI - Full Width */}
        <div className="mb-8">
          <EnhancedFarmMap farm={farm} />
        </div>

        {/* Asymmetric Magazine-Style Layout - Mobile Optimized */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Main Content Area - Takes 8 columns, full width on mobile */}
          <div className="lg:col-span-8 space-y-6 lg:space-y-8 order-2 lg:order-1">
            {/* Farm Health Metrics */}
            <FarmHealthCard farmId={farm.id} farmName={farm.name} />

            {/* Fields Overview with Modern Design */}
            <ModernCard variant="floating" className="overflow-hidden">
              <ModernCardHeader className="bg-gradient-to-r from-sage-50 to-cream-50">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <ModernCardTitle className="text-sage-800">Fields Overview</ModernCardTitle>
                    <InfoTooltip {...TOOLTIP_CONTENT.field} />
                  </div>
                  <Link href={`/farms/${farm.id}/fields/create`}>
                    <InlineFloatingButton
                      icon={<Plus className="h-4 w-4" />}
                      label="Add Field"
                      variant="secondary"
                      size="sm"
                    />
                  </Link>
                </div>
                <ModernCardDescription>
                  Monitor and manage all field operations from a single dashboard
                </ModernCardDescription>
              </ModernCardHeader>
              <ModernCardContent>
                {(farm.fields || []).length > 0 ? (
                  <div className="space-y-4">
                    {(farm.fields || []).map((field: any, index: number) => (
                      <ModernCard key={field.id} variant="soft" className="hover:variant-floating transition-all duration-300 cursor-pointer group">
                        <ModernCardContent className="p-5">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-sage-800 group-hover:text-sage-900">{field.name}</h4>
                                <InfoTooltip {...TOOLTIP_CONTENT.field} size="sm" />
                              </div>
                              <div className="flex items-center gap-4 text-sm text-sage-600 mb-2">
                                <div className="flex items-center gap-1">
                                  <Sprout className="h-3 w-3" />
                                  <span>{field.crops[0]?.cropType || 'No crop'}</span>
                                  <InfoTooltip {...TOOLTIP_CONTENT.cropType} size="sm" />
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>{field.area.toFixed(1)} ha</span>
                                  <InfoTooltip {...TOOLTIP_CONTENT.area} size="sm" />
                                </div>
                              </div>
                              <FieldStatusToggle
                                fieldId={field.id}
                                fieldName={field.name}
                                initialStatus={field.isActive ?? true}
                              />
                            </div>
                            
                            <div className="text-right">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-sage-700">NDVI:</span>
                                <InfoTooltip {...TOOLTIP_CONTENT.ndvi} size="sm" />
                                <span className="text-lg font-semibold text-sage-800">
                                  {field.satelliteData[0]?.ndvi.toFixed(2) || 'N/A'}
                                </span>
                              </div>
                              <div className="text-xs text-sage-500">
                                {field.satelliteData[0] ? 
                                  new Date(field.satelliteData[0].captureDate).toLocaleDateString() : 
                                  'No data available'}
                              </div>
                            </div>
                          </div>
                          
                          {field.satelliteData[0] && (
                            <div className="mt-4 flex items-center justify-between">
                              <div className="flex gap-3">
                                <Badge className="bg-sage-100 text-sage-700 border-sage-200 text-xs">
                                  <Activity className="h-3 w-3 mr-1" />
                                  Health: {(field.satelliteData[0].ndvi * 100).toFixed(0)}%
                                </Badge>
                                <Badge className="bg-cream-100 text-earth-700 border-earth-200 text-xs">
                                  Stress: {field.satelliteData[0].stressLevel?.toLowerCase() || 'Low'}
                                </Badge>
                              </div>
                              <InlineFloatingButton
                                icon={<Eye className="h-3 w-3" />}
                                label="View Details"
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              />
                            </div>
                          )}
                        </ModernCardContent>
                      </ModernCard>
                    ))}
                  </div>
                ) : (
                  <EmptyStateCard>
                    <NoFieldsEmptyState farmId={farm.id} />
                  </EmptyStateCard>
                )}
              </ModernCardContent>
            </ModernCard>

            {/* Visual Farm Map */}
            <VisualFarmMap 
              farm={{
                id: farm.id,
                name: farm.name,
                latitude: farm.latitude,
                longitude: farm.longitude,
                totalArea: farm.totalArea,
                address: farm.address || undefined
              }}
              onFieldUpdate={(fieldId, updates) => {
                // Handle field updates - refresh page or update state
                window.location.reload()
              }}
            />

            {/* Satellite Imagery */}
            {(farm.fields || []).length > 0 && (
              <div className="space-y-6">
                {(farm.fields || []).map((field: any) => (
                  <SatelliteViewer
                    key={field.id}
                    fieldId={field.id}
                    fieldName={field.name}
                  />
                ))}
              </div>
            )}

            {/* Market Intelligence */}
            <div className="mt-8">
              <MarketDashboard 
                cropTypes={(farm.fields || []).map((f: any) => f.crops?.[0]?.cropType).filter(Boolean)}
              />
            </div>

            {/* Analytics Dashboard */}
            <div className="mt-8">
              <AnalyticsDashboard farmId={farm.id} />
            </div>
          </div>

          {/* Right Column - Weather & Insights, appears first on mobile */}
          <div className="lg:col-span-4 space-y-4 lg:space-y-6 order-1 lg:order-2">
            {/* Weather Widget - Data Not Available */}
            <ModernCard variant="glass" className="overflow-hidden">
              <ModernCardHeader className="bg-gradient-to-br from-sage-50/80 to-cream-50/80">
                <div className="flex items-center gap-3">
                  <ModernCardTitle className="text-sage-800">Weather Data</ModernCardTitle>
                  <InfoTooltip {...TOOLTIP_CONTENT.temperature} />
                </div>
                <ModernCardDescription>
                  Live conditions for optimal farming decisions
                </ModernCardDescription>
              </ModernCardHeader>
              <ModernCardContent>
                <div className="space-y-6">
                  <div className="text-center py-8">
                    <CloudRain className="h-12 w-12 text-sage-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-sage-800 mb-2">
                      Weather Data Unavailable
                    </h3>
                    <p className="text-sm text-sage-600 mb-6">
                      Connect a weather service to view current conditions
                    </p>
                    <Link href={`/weather?farmId=${farm.id}`}>
                      <InlineFloatingButton
                        icon={<CloudRain className="h-4 w-4" />}
                        label="Configure Weather Service"
                        showLabel={true}
                        variant="secondary"
                        size="md"
                      />
                    </Link>
                  </div>
                </div>
              </ModernCardContent>
            </ModernCard>

            {/* AI Insights */}
            <ModernCard variant="floating" className="overflow-hidden">
              <ModernCardHeader className="bg-gradient-to-br from-sage-50/90 to-cream-50/90">
                <div className="flex items-center gap-3">
                  <ModernCardTitle className="text-sage-800">AI Insights</ModernCardTitle>
                  <InfoTooltip {...TOOLTIP_CONTENT.confidence} />
                </div>
                <ModernCardDescription>
                  Smart recommendations powered by satellite data and weather patterns
                </ModernCardDescription>
              </ModernCardHeader>
              <ModernCardContent>
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 text-sage-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-sage-800 mb-2">
                    AI Insights Coming Soon
                  </h3>
                  <p className="text-sm text-sage-600 mb-6">
                    Connect satellite and weather data to receive AI-powered recommendations
                  </p>
                  <Link href={`/recommendations?farmId=${farm.id}`}>
                    <InlineFloatingButton
                      icon={<Brain className="h-4 w-4" />}
                      label="Configure AI Insights"
                      showLabel={true}
                      variant="secondary"
                      size="md"
                    />
                  </Link>
                </div>
              </ModernCardContent>
            </ModernCard>

            {/* Market Prices */}
            <ModernCard variant="soft" className="overflow-hidden">
              <ModernCardHeader className="bg-gradient-to-br from-cream-100/80 to-earth-50/80">
                <div className="flex items-center gap-3">
                  <ModernCardTitle className="text-sage-800">Market Prices</ModernCardTitle>
                  <InfoTooltip {...TOOLTIP_CONTENT.commodityPrice} />
                </div>
                <ModernCardDescription>
                  Live commodity pricing for strategic selling decisions
                </ModernCardDescription>
              </ModernCardHeader>
              <ModernCardContent>
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 text-sage-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-sage-800 mb-2">
                    Market Data Unavailable
                  </h3>
                  <p className="text-sm text-sage-600 mb-6">
                    Connect to market data feeds to view live commodity prices
                  </p>
                  <InlineFloatingButton
                    icon={<BarChart className="h-4 w-4" />}
                    label="Configure Market Feed"
                    showLabel={true}
                    variant="ghost"
                    size="md"
                    className="w-full justify-center"
                  />
                </div>
              </ModernCardContent>
            </ModernCard>
          </div>
        </div>

        {/* Modern Action Buttons */}
        <div className="mt-12">
          <ModernCard variant="glass" className="max-w-2xl mx-auto">
            <ModernCardContent className="p-6">
              <div className="flex flex-col gap-3 sm:gap-4 justify-center items-center">
                <Link href={`/farms/${farm.id}/fields/create`}>
                  <InlineFloatingButton
                    icon={<MapPin className="h-4 w-4" />}
                    label="Add New Field"
                    showLabel={true}
                    variant="primary"
                    size="lg"
                    className="min-w-[160px]"
                  />
                </Link>
                <Link href={`/farms/${farm.id}/edit`}>
                  <InlineFloatingButton
                    icon={<Settings className="h-4 w-4" />}
                    label="Edit Farm Details"
                    showLabel={true}
                    variant="secondary"
                    size="lg"
                    className="min-w-[160px]"
                  />
                </Link>
                <Link href={`/reports?farmId=${farm.id}`}>
                  <InlineFloatingButton
                    icon={<BarChart className="h-4 w-4" />}
                    label="Generate Report"
                    showLabel={true}
                    variant="ghost"
                    size="lg"
                    className="min-w-[160px]"
                  />
                </Link>
              </div>
            </ModernCardContent>
          </ModernCard>
        </div>
      </main>
    </DashboardLayout>
  )
}