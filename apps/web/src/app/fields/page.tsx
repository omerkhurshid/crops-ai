import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../lib/auth/session'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Navbar } from '../../components/navigation/navbar'

export const dynamic = 'force-dynamic'

export default async function FieldsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  // Demo field data for testing
  const demoFields = [
    {
      id: 'field-1',
      name: 'North Field',
      farmName: 'Greenfield Acres',
      size: 85,
      crop: 'Corn',
      plantingDate: '2025-04-15',
      expectedHarvest: '2025-09-20',
      health: 'Excellent',
      ndvi: 0.82,
      soilMoisture: 65,
      lastUpdate: '2 hours ago'
    },
    {
      id: 'field-2',
      name: 'South Pasture',
      farmName: 'Greenfield Acres', 
      size: 120,
      crop: 'Soybeans',
      plantingDate: '2025-05-01',
      expectedHarvest: '2025-10-15',
      health: 'Good',
      ndvi: 0.75,
      soilMoisture: 58,
      lastUpdate: '4 hours ago'
    },
    {
      id: 'field-3',
      name: 'East Quarter',
      farmName: 'Sunrise Farm',
      size: 90,
      crop: 'Wheat',
      plantingDate: '2025-03-10',
      expectedHarvest: '2025-08-05',
      health: 'Fair',
      ndvi: 0.68,
      soilMoisture: 42,
      lastUpdate: '1 day ago'
    }
  ]

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
            <Button className="bg-green-600 hover:bg-green-700">
              + Add New Field
            </Button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Fields</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{demoFields.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Acreage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {demoFields.reduce((total, field) => total + field.size, 0)} acres
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Avg NDVI</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {(demoFields.reduce((total, field) => total + field.ndvi, 0) / demoFields.length).toFixed(2)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Healthy Fields</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {demoFields.filter(field => field.health === 'Excellent' || field.health === 'Good').length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Fields List */}
          <div className="space-y-6">
            {demoFields.map((field) => (
              <Card key={field.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{field.name}</CardTitle>
                      <CardDescription>{field.farmName} • {field.size} acres</CardDescription>
                    </div>
                    <Badge className={getHealthColor(field.health)}>
                      {field.health}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
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
                          <span>{new Date(field.plantingDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Harvest:</span>
                          <span>{new Date(field.expectedHarvest).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Health Metrics */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Health Metrics</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">NDVI:</span>
                          <span className="font-medium text-green-600">{field.ndvi}</span>
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
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span>65%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{width: '65%'}}></div>
                        </div>
                        <div className="text-xs text-gray-500">120 days until harvest</div>
                      </div>
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
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Field Analysis Tools</CardTitle>
                <CardDescription>Advanced monitoring and analysis capabilities</CardDescription>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}