'use client'
import { useRouter } from 'next/navigation'
import { useSession } from '../../lib/auth-unified'
import { useEffect, useState } from 'react'
import { ModernCard } from '../../components/ui/modern-card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Navbar } from '../../components/navigation/navbar'
import { FieldsQuickActions, FieldsNavigateButton } from '../../components/fields/fields-quick-actions'
import { FieldsHeaderActions } from '../../components/fields/fields-header-actions'
import { Leaf, MapPin, Plus } from 'lucide-react'
export default function FieldsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [allFields, setAllFields] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
    // Fetch farms and fields data
    const fetchFieldsData = async () => {
      try {
        const response = await fetch('/api/farms')
        if (response.ok) {
          const farms = await response.json()
          // Flatten all fields from all farms
          const fields = farms.flatMap((farm: any) => 
            (farm.fields || []).map((field: any) => ({
              id: field.id,
              name: field.name,
              farmName: farm.name,
              farmId: farm.id,
              size: field.area || 0,
              crop: field.crops?.[0]?.cropType || 'Not specified',
              plantingDate: field.crops?.[0]?.plantingDate || null,
              expectedHarvest: field.crops?.[0]?.expectedHarvestDate || null,
              health: getHealthStatus(field.satelliteData?.[0]?.ndvi),
              ndvi: field.satelliteData?.[0]?.ndvi || 0,
              soilMoisture: Math.round(Math.random() * 40 + 40),
              lastUpdate: field.satelliteData?.[0]?.captureDate 
                ? getRelativeTime(new Date(field.satelliteData[0].captureDate))
                : 'No data',
              soilType: field.soilType || 'Unknown'
            }))
          )
          setAllFields(fields)
        }
      } catch (error) {
        console.error('Error fetching fields data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchFieldsData()
  }, [session, status, router])
  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7A8F78]"></div>
        <p className="ml-4 text-[#555555]">Loading fields...</p>
      </div>
    )
  }
  if (!session) {
    return null
  }
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
      case 'Excellent': return 'bg-[#F8FAF8] text-[#7A8F78]'
      case 'Good': return 'bg-blue-100 text-blue-800'
      case 'Fair': return 'bg-yellow-100 text-yellow-800'
      case 'Poor': return 'bg-red-100 text-red-800'
      default: return 'bg-[#F5F5F5] text-[#1A1A1A]'
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
              <h1 className="text-3xl font-bold text-[#1A1A1A]">Field Management</h1>
              <p className="text-[#555555]">Monitor and analyze individual field performance</p>
            </div>
            <FieldsHeaderActions />
          </div>
          {/* Summary Stats */}
          {allFields.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <ModernCard>
                <div className="p-6">
                  <h3 className="text-sm font-medium text-[#555555] mb-2">Total Fields</h3>
                  <div className="text-2xl font-bold text-[#7A8F78]">{allFields.length}</div>
                </div>
              </ModernCard>
              <ModernCard>
                <div className="p-6">
                  <h3 className="text-sm font-medium text-[#555555] mb-2">Total Area</h3>
                  <div className="text-2xl font-bold text-[#7A8F78]">
                    {allFields.reduce((total, field) => total + field.size, 0).toFixed(1)} ha
                  </div>
                </div>
              </ModernCard>
              <ModernCard>
                <div className="p-6">
                  <h3 className="text-sm font-medium text-[#555555] mb-2">Avg NDVI</h3>
                  <div className="text-2xl font-bold text-[#7A8F78]">
                    {allFields.filter(f => f.ndvi > 0).length > 0
                      ? (allFields.reduce((total, field) => total + field.ndvi, 0) / allFields.filter(f => f.ndvi > 0).length).toFixed(2)
                      : 'N/A'
                    }
                  </div>
                </div>
              </ModernCard>
              <ModernCard>
                <div className="p-6">
                  <h3 className="text-sm font-medium text-[#555555] mb-2">Healthy Fields</h3>
                  <div className="text-2xl font-bold text-[#7A8F78]">
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
                    <FieldsNavigateButton />
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
                      <p className="text-[#555555]">{field.farmName} • {field.size.toFixed(1)} ha</p>
                    </div>
                    <Badge className={getHealthColor(field.health)}>
                      {field.health}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Crop Info */}
                    <div>
                      <h4 className="font-medium text-[#1A1A1A] mb-2">Crop Information</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-[#555555]">Crop:</span>
                          <span className="font-medium">{field.crop}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#555555]">Planted:</span>
                          <span>{field.plantingDate ? new Date(field.plantingDate).toLocaleDateString() : 'Not specified'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#555555]">Harvest:</span>
                          <span>{field.expectedHarvest ? new Date(field.expectedHarvest).toLocaleDateString() : 'Not specified'}</span>
                        </div>
                      </div>
                    </div>
                    {/* Health Metrics */}
                    <div>
                      <h4 className="font-medium text-[#1A1A1A] mb-2">Health Metrics</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-[#555555]">NDVI:</span>
                          <span className="font-medium text-[#7A8F78]">
                            {field.ndvi > 0 ? field.ndvi.toFixed(2) : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#555555]">Soil Moisture:</span>
                          <span className={field.soilMoisture > 50 ? 'text-[#7A8F78]' : 'text-yellow-600'}>
                            {field.soilMoisture}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#555555]">Updated:</span>
                          <span>{field.lastUpdate}</span>
                        </div>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div>
                      <h4 className="font-medium text-[#1A1A1A] mb-2">Growing Season</h4>
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
                                <span className="text-[#555555]">Progress</span>
                                <span>{progress}%</span>
                              </div>
                              <div className="w-full bg-[#F5F5F5] rounded-full h-2">
                                <div className="bg-[#7A8F78] h-2 rounded-full" style={{width: `${progress}%`}}></div>
                              </div>
                              <div className="text-xs text-[#555555]">
                                {daysRemaining > 0 ? `${daysRemaining} days until harvest` : 'Ready for harvest'}
                              </div>
                            </div>
                          )
                        })()
                      ) : (
                        <p className="text-sm text-[#555555]">No planting schedule set</p>
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
                <p className="text-[#555555] mb-6">Advanced monitoring and analysis capabilities</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                    <div className="font-medium">NDVI Analysis</div>
                    <div className="text-sm text-[#555555] mt-1">Monitor vegetation health</div>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                    <div className="font-medium">Stress Detection</div>
                    <div className="text-sm text-[#555555] mt-1">Identify crop stress patterns</div>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                    <div className="font-medium">Yield Prediction</div>
                    <div className="text-sm text-[#555555] mt-1">AI-powered yield forecasts</div>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                    <div className="font-medium">Field Comparison</div>
                    <div className="text-sm text-[#555555] mt-1">Compare field performance</div>
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