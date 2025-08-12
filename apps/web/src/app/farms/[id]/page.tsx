import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '../../../lib/auth/session'
import { Badge } from '../../../components/ui/badge'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription, MetricCard } from '../../../components/ui/modern-card'
import { InfoTooltip } from '../../../components/ui/info-tooltip'
import { TOOLTIP_CONTENT } from '../../../lib/tooltip-content'
import { InlineFloatingButton } from '../../../components/ui/floating-button'
import { ClientFloatingButton } from '../../../components/ui/client-floating-button'
import { Navbar } from '../../../components/navigation/navbar'
import { SatelliteViewer } from '../../../components/satellite/satellite-viewer'
import { MarketDashboard } from '../../../components/market/market-dashboard'
import { AnalyticsDashboard } from '../../../components/analytics/charts'
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
    const totalArea = farm.fields.reduce((sum, field) => sum + field.area, 0)
    const averageNDVI = farm.fields.reduce((sum, field) => {
      const latestData = field.satelliteData[0]
      return sum + (latestData?.ndvi || 0)
    }, 0) / (farm.fields.length || 1)

    return {
      ...farm,
      stats: {
        totalArea,
        averageNDVI,
        fieldsCount: farm.fields.length,
        healthScore: Math.round(averageNDVI * 100)
      }
    }
  } catch (error) {
    console.error('Error fetching farm details:', error)
    return null
  }
}

export default async function FarmDetailsPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  const farm = await getFarmDetails(params.id, user.id)

  if (!farm) {
    redirect('/farms')
  }

  return (
    <div className="minimal-page">
      <Navbar />
      
      {/* Floating Action Button */}
      <ClientFloatingButton
        icon={<Settings className="h-5 w-5" />}
        label="Farm Settings"
        variant="primary"
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Modern Header with Asymmetric Layout */}
        <div className="mb-12 relative">
          <Link href="/farms" className="inline-flex items-center text-sm text-sage-600 hover:text-sage-800 mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Farms
          </Link>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Farm Info - Takes 2 columns */}
            <div className="lg:col-span-2">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-4xl font-light text-sage-800 tracking-tight">{farm.name}</h1>
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

        {/* Sophisticated Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="polished-card card-sage rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Sprout className="h-8 w-8 text-white" />
              <InfoTooltip {...TOOLTIP_CONTENT.area} variant="light" />
            </div>
            <div className="text-3xl font-bold mb-2">{farm.stats.totalArea.toFixed(1)} ha</div>
            <div className="text-xl font-medium mb-2">Total Area</div>
            <div className="text-sm opacity-90">
              {(farm.stats.totalArea * 2.47).toFixed(1)} acres equivalent
            </div>
          </div>
          
          <div className="polished-card card-forest rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <MapPin className="h-8 w-8 text-white" />
              <InfoTooltip {...TOOLTIP_CONTENT.field} variant="light" />
            </div>
            <div className="text-3xl font-bold mb-2">{farm.stats.fieldsCount}</div>
            <div className="text-xl font-medium mb-2">Active Fields</div>
            <div className="text-sm opacity-90">
              All monitored and tracked
            </div>
          </div>
          
          <div className="polished-card card-earth rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Activity className="h-8 w-8 text-white" />
              <InfoTooltip {...TOOLTIP_CONTENT.healthScore} variant="light" />
            </div>
            <div className="text-3xl font-bold mb-2">{farm.stats.healthScore}%</div>
            <div className="text-xl font-medium mb-2">Health Score</div>
            <div className="text-sm opacity-90">
              Based on NDVI analysis
            </div>
          </div>
          
          <div className="polished-card card-golden rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <div className="text-3xl font-bold mb-2">Field Inspection</div>
            <div className="text-xl font-medium mb-2">Next Action</div>
            <div className="text-sm opacity-90">
              Scheduled in 3 days
            </div>
          </div>
        </div>

        {/* Asymmetric Magazine-Style Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content Area - Takes 8 columns */}
          <div className="lg:col-span-8 space-y-8">
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
                {farm.fields.length > 0 ? (
                  <div className="space-y-4">
                    {farm.fields.map((field, index) => (
                      <ModernCard key={field.id} variant="soft" className="hover:variant-floating transition-all duration-300 cursor-pointer group">
                        <ModernCardContent className="p-5">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-sage-800 group-hover:text-sage-900">{field.name}</h4>
                                <InfoTooltip {...TOOLTIP_CONTENT.field} size="sm" />
                              </div>
                              <div className="flex items-center gap-4 text-sm text-sage-600">
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
                  <div className="text-center py-12">
                    <div className="relative">
                      <Sprout className="h-16 w-16 text-sage-300 mx-auto mb-4 animate-pulse-soft" />
                      <div className="absolute inset-0 rounded-full bg-sage-100 opacity-20 animate-float"></div>
                    </div>
                    <h3 className="font-medium text-sage-700 mb-2">No fields added yet</h3>
                    <p className="text-sage-500 text-sm mb-4">Start by adding your first field to begin monitoring</p>
                    <Link href={`/farms/${farm.id}/fields/create`}>
                      <InlineFloatingButton
                        icon={<Plus className="h-4 w-4" />}
                        label="Add Your First Field"
                        showLabel={true}
                        variant="primary"
                      />
                    </Link>
                  </div>
                )}
              </ModernCardContent>
            </ModernCard>

            {/* Satellite Imagery */}
            {farm.fields.length > 0 && (
              <div className="space-y-6">
                {farm.fields.map((field) => (
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
                cropTypes={farm.fields.map(f => f.crops[0]?.cropType).filter(Boolean)}
              />
            </div>

            {/* Analytics Dashboard */}
            <div className="mt-8">
              <AnalyticsDashboard farmId={farm.id} />
            </div>
          </div>

          {/* Right Column - Weather & Insights */}
          <div className="lg:col-span-4 space-y-6">
            {/* Weather Widget */}
            <ModernCard variant="glass" className="overflow-hidden">
              <ModernCardHeader className="bg-gradient-to-br from-sage-50/80 to-cream-50/80">
                <div className="flex items-center gap-3">
                  <ModernCardTitle className="text-sage-800">Current Weather</ModernCardTitle>
                  <InfoTooltip {...TOOLTIP_CONTENT.temperature} />
                </div>
                <ModernCardDescription>
                  Live conditions for optimal farming decisions
                </ModernCardDescription>
              </ModernCardHeader>
              <ModernCardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-3 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl mr-4">
                        <Sun className="h-8 w-8 text-yellow-600" />
                      </div>
                      <div>
                        <div className="text-3xl font-light text-sage-800">
                          22°C
                        </div>
                        <div className="text-sm text-sage-600 font-medium">
                          Partly Cloudy
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center p-3 bg-sage-50 rounded-xl">
                      <Droplets className="h-4 w-4 text-blue-500 mr-3" />
                      <div>
                        <div className="text-lg font-semibold text-sage-800">
                          65%
                        </div>
                        <div className="text-xs text-sage-600 flex items-center gap-1">
                          Humidity
                          <InfoTooltip {...TOOLTIP_CONTENT.humidity} size="sm" />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-sage-50 rounded-xl">
                      <Wind className="h-4 w-4 text-sage-500 mr-3" />
                      <div>
                        <div className="text-lg font-semibold text-sage-800">
                          12 km/h
                        </div>
                        <div className="text-xs text-sage-600 flex items-center gap-1">
                          Wind Speed
                          <InfoTooltip {...TOOLTIP_CONTENT.windSpeed} size="sm" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Link href={`/weather?farmId=${farm.id}`}>
                    <InlineFloatingButton
                      icon={<CloudRain className="h-4 w-4" />}
                      label="View Detailed Forecast"
                      showLabel={true}
                      variant="secondary"
                      size="md"
                      className="w-full justify-center"
                    />
                  </Link>
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
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-sage-50 to-sage-100/50 rounded-xl border border-sage-200/30">
                    <div className="flex items-start">
                      <div className="p-2 bg-sage-200 rounded-lg mr-3">
                        <TrendingUp className="h-4 w-4 text-sage-700" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-sage-800 mb-1">
                          Optimal harvest window approaching
                        </p>
                        <p className="text-xs text-sage-600 leading-relaxed">
                          Field A expected to reach optimal maturity in 12-15 days based on current growth patterns
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-earth-50 to-earth-100/50 rounded-xl border border-earth-200/30">
                    <div className="flex items-start">
                      <div className="p-2 bg-earth-200 rounded-lg mr-3">
                        <AlertTriangle className="h-4 w-4 text-earth-700" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-earth-800 mb-1">
                          Irrigation recommended
                        </p>
                        <p className="text-xs text-earth-600 leading-relaxed">
                          Soil moisture below optimal levels in Field B - consider watering within 48 hours
                        </p>
                      </div>
                    </div>
                  </div>

                  <Link href={`/recommendations?farmId=${farm.id}`}>
                    <InlineFloatingButton
                      icon={<Brain className="h-4 w-4" />}
                      label="View All Recommendations"
                      showLabel={true}
                      variant="secondary"
                      size="md"
                      className="w-full justify-center"
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
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-white/70 rounded-lg border border-sage-100">
                    <div>
                      <div className="font-semibold text-sage-800">Wheat</div>
                      <div className="text-xs text-sage-500">Chicago Board</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-sage-800">$7.85/bu</div>
                      <div className="text-xs text-sage-600 flex items-center gap-1">
                        +2.3%
                        <InfoTooltip {...TOOLTIP_CONTENT.priceChange} size="sm" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-white/70 rounded-lg border border-sage-100">
                    <div>
                      <div className="font-semibold text-sage-800">Corn</div>
                      <div className="text-xs text-sage-500">Chicago Board</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-sage-800">$6.42/bu</div>
                      <div className="text-xs text-earth-600 flex items-center gap-1">
                        -0.8%
                        <InfoTooltip {...TOOLTIP_CONTENT.priceChange} size="sm" />
                      </div>
                    </div>
                  </div>

                  <InlineFloatingButton
                    icon={<BarChart className="h-4 w-4" />}
                    label="View Market Analysis"
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
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
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
    </div>
  )
}