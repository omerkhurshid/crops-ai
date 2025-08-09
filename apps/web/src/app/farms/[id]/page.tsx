import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '../../../lib/auth/session'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Navbar } from '../../../components/navigation/navbar'
import { SatelliteViewer } from '../../../components/satellite/satellite-viewer'
import { MarketDashboard } from '../../../components/market/market-dashboard'
import { AnalyticsDashboard } from '../../../components/analytics/charts'
import { prisma } from '../../../lib/prisma'
import { 
  Sprout, MapPin, Activity, AlertTriangle, TrendingUp, Clock, 
  CloudRain, Sun, Droplets, Wind, Thermometer, BarChart,
  Satellite, Brain, DollarSign, Calendar, ArrowLeft, Eye
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/farms" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Farms
          </Link>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{farm.name}</h1>
              <p className="text-gray-600 mt-1 flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {farm.address || `${farm.region || 'Unknown'}, ${farm.country || 'Unknown'}`}
              </p>
            </div>
            <Badge variant="default" className="bg-green-100 text-green-800">
              Active
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Area</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {farm.stats.totalArea.toFixed(1)} ha
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {(farm.stats.totalArea * 2.47).toFixed(1)} acres
              </p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Fields</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {farm.stats.fieldsCount}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                All monitored
              </p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Health Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {farm.stats.healthScore}%
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Based on NDVI
              </p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Next Action</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold text-orange-600">
                Field Inspection
              </div>
              <p className="text-xs text-gray-500 mt-1">
                In 3 days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Field Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Fields Overview */}
            <Card className="border-2">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Fields Overview</CardTitle>
                  <Link href={`/farms/${farm.id}/fields/create`}>
                    <Button size="sm" variant="outline">
                      Add Field
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {farm.fields.length > 0 ? (
                  <div className="space-y-4">
                    {farm.fields.map((field) => (
                      <div key={field.id} className="border-2 rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{field.name}</h4>
                            <p className="text-sm text-gray-600">
                              {field.crops[0]?.cropType || 'No crop'} • {field.area.toFixed(1)} ha
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              NDVI: {field.satelliteData[0]?.ndvi.toFixed(2) || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {field.satelliteData[0] ? 
                                new Date(field.satelliteData[0].captureDate).toLocaleDateString() : 
                                'No data'}
                            </div>
                          </div>
                        </div>
                        {field.satelliteData[0] && (
                          <div className="mt-2 flex gap-2">
                            <Badge variant="outline" className="text-xs">
                              Health: {(field.satelliteData[0].ndvi * 100).toFixed(0)}%
                            </Badge>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Sprout className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No fields added yet</p>
                    <Link href={`/farms/${farm.id}/fields/create`}>
                      <Button className="mt-4" size="sm">
                        Add Your First Field
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

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