import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../lib/auth/session'
import { prisma } from '../../lib/prisma'
import { ModernCard } from '../../components/ui/modern-card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Navbar } from '../../components/navigation/navbar'
import { Leaf, MapPin, Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function FieldsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user's farms and fields
  const userFarms = await prisma.farm.findMany({
    where: {
      OR: [
        { ownerId: user.id },
        { managers: { some: { userId: user.id } } }
      ]
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

  // Flatten all fields from all farms
  const allFields = userFarms.flatMap(farm => 
    farm.fields.map(field => ({
      id: field.id,
      name: field.name,
      farmName: farm.name,
      farmId: farm.id,
      size: field.area,
      crop: field.crops[0]?.cropType || 'Not specified',
      plantingDate: field.crops[0]?.plantingDate?.toISOString().split('T')[0] || null,
      expectedHarvest: field.crops[0]?.expectedHarvestDate?.toISOString().split('T')[0] || null,
      health: getHealthStatus(field.satelliteData[0]?.ndvi),
      ndvi: field.satelliteData[0]?.ndvi || 0,
      soilMoisture: Math.round(Math.random() * 40 + 40), // Mock soil moisture for now
      lastUpdate: field.satelliteData[0]?.captureDate 
        ? getRelativeTime(field.satelliteData[0].captureDate)
        : 'No data',
      soilType: field.soilType || 'Unknown'
    }))
  )

  function getHealthStatus(ndvi?: number) {
    if (!ndvi) return 'Unknown'
    if (ndvi >= 0.8) return 'Excellent'
    if (ndvi >= 0.7) return 'Good'
    if (ndvi >= 0.5) return 'Fair'
    return 'Poor'
  }

  function getRelativeTime(date: Date) {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`
    } else {
      return 'Recently'
    }
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'Excellent': return 'bg-green-100 text-green-800'
      case 'Good': return 'bg-blue-100 text-blue-800'
      case 'Fair': return 'bg-yellow-100 text-yellow-800'
      case 'Poor': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="minimal-page">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Field Management</h1>
              <p className="text-gray-600">Monitor and analyze individual field performance</p>
            </div>
            <Button className="bg-sage-600 hover:bg-sage-700">
              + Add New Field
            </Button>
          </div>

          {/* Summary Stats */}
          {allFields.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <ModernCard>
                <div className="p-6">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Total Fields</h3>
                  <div className="text-2xl font-bold text-green-600">{allFields.length}</div>
                </div>
              </ModernCard>

              <ModernCard>
                <div className="p-6">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Total Area</h3>
                  <div className="text-2xl font-bold text-green-600">
                    {allFields.reduce((total, field) => total + field.size, 0).toFixed(1)} ha
                  </div>
                </div>
              </ModernCard>

              <ModernCard>
                <div className="p-6">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Avg NDVI</h3>
                  <div className="text-2xl font-bold text-green-600">
                    {allFields.filter(f => f.ndvi > 0).length > 0
                      ? (allFields.reduce((total, field) => total + field.ndvi, 0) / allFields.filter(f => f.ndvi > 0).length).toFixed(2)
                      : 'N/A'
                    }
                  </div>
                </div>
              </ModernCard>

              <ModernCard>
                <div className="p-6">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Healthy Fields</h3>
                  <div className="text-2xl font-bold text-green-600">
                    {allFields.filter(field => field.health === 'Excellent' || field.health === 'Good').length}
                  </div>
                </div>
              </ModernCard>
            </div>
          )}

          {/* Fields List */}
          {allFields.length === 0 ? (
            <ModernCard className="border-2 border-yellow-200 bg-yellow-50">
              <div className="p-6">
                <div className="text-center py-12">
                  <div className="p-4 rounded-full bg-yellow-100 inline-flex">
                    <Leaf className="h-10 w-10 text-yellow-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-yellow-800 mt-4">
                    No Fields Found
                  </h3>
                  <p className="text-yellow-700 mt-2 max-w-md mx-auto">
                    You haven't added any fields yet. Start by creating a farm and adding fields to begin monitoring your crops.
                  </p>
                  <div className="mt-6 space-x-3">
                    <Button
                      onClick={() => window.location.href = '/farms'}
                      variant="outline"
                      className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Manage Farms
                    </Button>
                    <Button
                      className="bg-yellow-600 hover:bg-yellow-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Field
                    </Button>
                  </div>
                </div>
              </div>
            </ModernCard>
          ) : (
            <div className="space-y-6">
              {allFields.map((field) => (
              <ModernCard key={field.id} className="hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-lg font-semibold">{field.name}</h3>
                      <p className="text-gray-600">{field.farmName} • {field.size.toFixed(1)} ha</p>
                    </div>
                    <Badge className={getHealthColor(field.health)}>
                      {field.health}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Crop Info */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Crop Information</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Crop:</span>
                          <span className="font-medium">{field.crop}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Planted:</span>
                          <span>{field.plantingDate ? new Date(field.plantingDate).toLocaleDateString() : 'Not specified'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Harvest:</span>
                          <span>{field.expectedHarvest ? new Date(field.expectedHarvest).toLocaleDateString() : 'Not specified'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Health Metrics */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Health Metrics</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">NDVI:</span>
                          <span className="font-medium text-green-600">
                            {field.ndvi > 0 ? field.ndvi.toFixed(2) : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Soil Moisture:</span>
                          <span className={field.soilMoisture > 50 ? 'text-green-600' : 'text-yellow-600'}>
                            {field.soilMoisture}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Updated:</span>
                          <span>{field.lastUpdate}</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Growing Season</h4>
                      {field.plantingDate && field.expectedHarvest ? (
                        (() => {
                          const planted = new Date(field.plantingDate)
                          const harvest = new Date(field.expectedHarvest)
                          const today = new Date()
                          const totalDays = Math.floor((harvest.getTime() - planted.getTime()) / (1000 * 60 * 60 * 24))
                          const daysElapsed = Math.floor((today.getTime() - planted.getTime()) / (1000 * 60 * 60 * 24))
                          const daysRemaining = Math.floor((harvest.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                          const progress = Math.min(100, Math.max(0, Math.round((daysElapsed / totalDays) * 100)))
                          
                          return (
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Progress</span>
                                <span>{progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-green-600 h-2 rounded-full" style={{width: `${progress}%`}}></div>
                              </div>
                              <div className="text-xs text-gray-500">
                                {daysRemaining > 0 ? `${daysRemaining} days until harvest` : 'Ready for harvest'}
                              </div>
                            </div>
                          )
                        })()
                      ) : (
                        <p className="text-sm text-gray-500">No planting schedule set</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col space-y-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        Satellite View
                      </Button>
                      <Button variant="outline" size="sm">
                        Weather Data
                      </Button>
                    </div>
                  </div>
                </div>
              </ModernCard>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-8">
            <ModernCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-2">Field Analysis Tools</h3>
                <p className="text-gray-600 mb-6">Advanced monitoring and analysis capabilities</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                    <div className="font-medium">NDVI Analysis</div>
                    <div className="text-sm text-gray-500 mt-1">Monitor vegetation health</div>
                  </Button>
                  
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                    <div className="font-medium">Stress Detection</div>
                    <div className="text-sm text-gray-500 mt-1">Identify crop stress patterns</div>
                  </Button>
                  
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                    <div className="font-medium">Yield Prediction</div>
                    <div className="text-sm text-gray-500 mt-1">AI-powered yield forecasts</div>
                  </Button>

                  <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                    <div className="font-medium">Field Comparison</div>
                    <div className="text-sm text-gray-500 mt-1">Compare field performance</div>
                  </Button>
                </div>
              </div>
            </ModernCard>
          </div>
        </div>
      </main>
    </div>
  )
}