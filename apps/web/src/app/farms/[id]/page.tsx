import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '../../../lib/auth/session'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription, MetricCard } from '../../../components/ui/modern-card'
import { InfoTooltip, TOOLTIP_CONTENT } from '../../../components/ui/info-tooltip'
import { FloatingActionButton, InlineFloatingButton } from '../../../components/ui/floating-button'
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
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-sage-50/30 to-cream-100">
      <Navbar />
      
      {/* Floating Action Button */}
      <FloatingActionButton
        icon={<Settings className="h-5 w-5" />}
        label="Farm Settings"
        variant="primary"
        onClick={() => {}} // Add functionality later
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
          <MetricCard
            title="Total Area"
            value={farm.stats.totalArea.toFixed(1)}
            unit=" ha"
            description={`${(farm.stats.totalArea * 2.47).toFixed(1)} acres equivalent`}
            icon={<Sprout className="h-5 w-5 text-sage-600" />}
            tooltip={TOOLTIP_CONTENT.area}
            variant="floating"
          />
          
          <MetricCard
            title="Active Fields"
            value={farm.stats.fieldsCount}
            description="All monitored and tracked"
            icon={<MapPin className="h-5 w-5 text-sage-600" />}
            tooltip={TOOLTIP_CONTENT.field}
            variant="floating"
          />
          
          <MetricCard
            title="Health Score"
            value={farm.stats.healthScore}
            unit="%"
            trend={farm.stats.healthScore >= 80 ? 'up' : farm.stats.healthScore >= 60 ? 'stable' : 'down'}
            description="Based on NDVI analysis"
            icon={<Activity className="h-5 w-5 text-sage-600" />}
            tooltip={TOOLTIP_CONTENT.healthScore}
            variant="floating"
          />
          
          <MetricCard
            title="Next Action"
            value="Field Inspection"
            description="Scheduled in 3 days"
            icon={<Calendar className="h-5 w-5 text-earth-600" />}
            variant="soft"
          />
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
          <div className="space-y-6">
            {/* Weather Widget */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CloudRain className="h-5 w-5 mr-2" />
                  Current Weather
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Sun className="h-8 w-8 text-yellow-500 mr-3" />
                      <div>
                        <div className="text-2xl font-bold">
                          22°C
                        </div>
                        <div className="text-sm text-gray-600">
                          Partly Cloudy
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center">
                      <Droplets className="h-4 w-4 text-blue-500 mr-2" />
                      <div>
                        <div className="text-sm font-medium">
                          65%
                        </div>
                        <div className="text-xs text-gray-500">Humidity</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Wind className="h-4 w-4 text-gray-500 mr-2" />
                      <div>
                        <div className="text-sm font-medium">
                          12 km/h
                        </div>
                        <div className="text-xs text-gray-500">Wind</div>
                      </div>
                    </div>
                  </div>

                  <Link href={`/weather?farmId=${farm.id}`}>
                    <Button className="w-full" size="sm" variant="outline">
                      View Detailed Forecast
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-start">
                      <TrendingUp className="h-4 w-4 text-green-600 mr-2 mt-1" />
                      <div>
                        <p className="text-sm font-medium text-green-900">
                          Optimal harvest window approaching
                        </p>
                        <p className="text-xs text-green-700 mt-1">
                          Field A expected to reach optimal maturity in 12-15 days
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-start">
                      <AlertTriangle className="h-4 w-4 text-orange-600 mr-2 mt-1" />
                      <div>
                        <p className="text-sm font-medium text-orange-900">
                          Irrigation recommended
                        </p>
                        <p className="text-xs text-orange-700 mt-1">
                          Soil moisture below optimal levels in Field B
                        </p>
                      </div>
                    </div>
                  </div>

                  <Link href={`/recommendations?farmId=${farm.id}`}>
                    <Button className="w-full" size="sm" variant="outline">
                      View All Recommendations
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Market Prices */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Market Prices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">Wheat</div>
                      <div className="text-xs text-gray-500">Chicago Board</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">$7.85/bu</div>
                      <div className="text-xs text-green-600">+2.3%</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">Corn</div>
                      <div className="text-xs text-gray-500">Chicago Board</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">$6.42/bu</div>
                      <div className="text-xs text-red-600">-0.8%</div>
                    </div>
                  </div>

                  <Button className="w-full" size="sm" variant="outline">
                    View Market Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 justify-center">
          <Link href={`/farms/${farm.id}/fields/create`}>
            <Button>
              <MapPin className="h-4 w-4 mr-2" />
              Add Field
            </Button>
          </Link>
          <Link href={`/farms/${farm.id}/edit`}>
            <Button variant="outline">
              Edit Farm Details
            </Button>
          </Link>
          <Link href={`/reports?farmId=${farm.id}`}>
            <Button variant="outline">
              <BarChart className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}