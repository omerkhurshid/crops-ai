import React from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../lib/auth/session'
import { ModernCard, ModernCardContent, ModernCardDescription, ModernCardHeader, ModernCardTitle } from '../../components/ui/modern-card'
import { InlineFloatingButton } from '../../components/ui/floating-button'
import { ClientFloatingButton } from '../../components/ui/client-floating-button'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Navbar } from '../../components/navigation/navbar'
import { MapPin, Activity, Wheat, Droplets, Satellite, Plus, Eye, BarChart, Settings } from 'lucide-react'

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
      
      {/* Floating Action Button */}
      <ClientFloatingButton
        icon={<Settings className="h-5 w-5" />}
        label="Field Settings"
        variant="primary"
      />
      
      {/* Animated Background with Floating Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-sage-50/80 to-earth-50/80 -z-10"></div>
      <div className="absolute top-20 left-20 p-6 bg-white/70 backdrop-blur-md rounded-3xl shadow-floating animate-float">
        <MapPin className="h-8 w-8 text-sage-600" />
      </div>
      <div className="absolute bottom-20 right-20 p-6 bg-white/70 backdrop-blur-md rounded-3xl shadow-floating animate-float" style={{ animationDelay: '2s' }}>
        <Activity className="h-8 w-8 text-sage-600" />
      </div>
      
      <main className="max-w-7xl mx-auto pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-16">
          {/* Enhanced Header */}
          <div className="text-center max-w-4xl mx-auto mb-12">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-br from-sage-100 to-earth-100 rounded-2xl relative overflow-hidden">
                <MapPin className="h-10 w-10 text-sage-700 relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-br from-sage-200/30 to-earth-200/30 animate-pulse-soft"></div>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-light text-sage-800 mb-6 tracking-tight">
              Field Management
            </h1>
            <p className="text-xl text-sage-600 font-light leading-relaxed mb-6">
              Monitor and analyze individual field performance with satellite intelligence
            </p>
            <Badge className="bg-sage-100 text-sage-700 border-sage-200">
              <Satellite className="h-4 w-4 mr-2" />
              AI-Powered Field Analytics
            </Badge>
            
            <div className="flex justify-center mt-6">
              <InlineFloatingButton
                icon={<Plus className="h-5 w-5" />}
                label="Add New Field"
                showLabel={true}
                variant="primary"
                size="lg"
                className="min-w-[200px]"
              />
            </div>
          </div>
        </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
            <div className="polished-card card-sage rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold mb-2">{demoFields.length}</div>
              <div className="text-xl font-medium mb-2">Total Fields</div>
              <div className="text-sm opacity-90">Active monitoring zones</div>
            </div>

            <div className="polished-card card-forest rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <Wheat className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold mb-2">
                {demoFields.reduce((total, field) => total + field.size, 0)} acres
              </div>
              <div className="text-xl font-medium mb-2">Total Acreage</div>
              <div className="text-sm opacity-90">Under cultivation</div>
            </div>

            <div className="polished-card card-earth rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <Activity className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold mb-2">
                {(demoFields.reduce((total, field) => total + field.ndvi, 0) / demoFields.length).toFixed(2)}
              </div>
              <div className="text-xl font-medium mb-2">Avg NDVI</div>
              <div className="text-sm opacity-90">Vegetation health index</div>
            </div>

            <div className="polished-card card-golden rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <BarChart className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold mb-2">
                {demoFields.filter(field => field.health === 'Excellent' || field.health === 'Good').length}
              </div>
              <div className="text-xl font-medium mb-2">Healthy Fields</div>
              <div className="text-sm opacity-90">Optimal performance</div>
            </div>
          </div>

          {/* Fields List */}
          <div className="space-y-6">
            {demoFields.map((field) => (
              <ModernCard key={field.id} variant="floating" className="hover:scale-[1.02] transition-all duration-300">
                <ModernCardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <ModernCardTitle className="text-lg text-sage-800">{field.name}</ModernCardTitle>
                      <ModernCardDescription>{field.farmName} • {field.size} acres</ModernCardDescription>
                    </div>
                    <Badge className={getHealthColor(field.health)}>
                      {field.health}
                    </Badge>
                  </div>
                </ModernCardHeader>
                <ModernCardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Crop Info */}
                    <div>
                      <h4 className="font-medium text-sage-800 mb-2">Crop Information</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-sage-600">Crop:</span>
                          <span className="font-medium text-sage-800">{field.crop}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sage-600">Planted:</span>
                          <span className="text-sage-800">{new Date(field.plantingDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sage-600">Harvest:</span>
                          <span className="text-sage-800">{new Date(field.expectedHarvest).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Health Metrics */}
                    <div>
                      <h4 className="font-medium text-sage-800 mb-2">Health Metrics</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-sage-600">NDVI:</span>
                          <span className="font-medium text-forest-600">{field.ndvi}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sage-600">Soil Moisture:</span>
                          <span className={field.soilMoisture > 50 ? 'text-forest-600' : 'text-earth-600'}>
                            {field.soilMoisture}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sage-600">Updated:</span>
                          <span className="text-sage-800">{field.lastUpdate}</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <h4 className="font-medium text-sage-800 mb-2">Growing Season</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-sage-600">Progress</span>
                          <span className="text-sage-800">65%</span>
                        </div>
                        <div className="w-full bg-sage-200 rounded-full h-2">
                          <div className="bg-forest-600 h-2 rounded-full" style={{width: '65%'}}></div>
                        </div>
                        <div className="text-xs text-sage-600">120 days until harvest</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col space-y-2">
                      <Button variant="outline" size="sm" className="border-sage-300 text-sage-700 hover:bg-sage-50">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm" className="border-sage-300 text-sage-700 hover:bg-sage-50">
                        <Satellite className="h-4 w-4 mr-2" />
                        Satellite View
                      </Button>
                      <Button variant="outline" size="sm" className="border-sage-300 text-sage-700 hover:bg-sage-50">
                        <Activity className="h-4 w-4 mr-2" />
                        Weather Data
                      </Button>
                    </div>
                  </div>
                </ModernCardContent>
              </ModernCard>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <ModernCard variant="floating" className="overflow-hidden">
              <ModernCardHeader className="bg-gradient-to-r from-sage-50 to-cream-50">
                <ModernCardTitle className="text-sage-800">Field Analysis Tools</ModernCardTitle>
                <ModernCardDescription>Advanced monitoring and analysis capabilities</ModernCardDescription>
              </ModernCardHeader>
              <ModernCardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="polished-card card-sage rounded-xl p-4 text-white hover:scale-105 transition-all duration-300 cursor-pointer">
                    <div className="flex items-center mb-2">
                      <BarChart className="h-5 w-5 mr-2" />
                      <div className="font-medium">NDVI Analysis</div>
                    </div>
                    <div className="text-sm opacity-90">Monitor vegetation health</div>
                  </div>
                  
                  <div className="polished-card card-forest rounded-xl p-4 text-white hover:scale-105 transition-all duration-300 cursor-pointer">
                    <div className="flex items-center mb-2">
                      <Activity className="h-5 w-5 mr-2" />
                      <div className="font-medium">Stress Detection</div>
                    </div>
                    <div className="text-sm opacity-90">Identify crop stress patterns</div>
                  </div>
                  
                  <div className="polished-card card-earth rounded-xl p-4 text-white hover:scale-105 transition-all duration-300 cursor-pointer">
                    <div className="flex items-center mb-2">
                      <Wheat className="h-5 w-5 mr-2" />
                      <div className="font-medium">Yield Prediction</div>
                    </div>
                    <div className="text-sm opacity-90">AI-powered yield forecasts</div>
                  </div>

                  <div className="polished-card card-golden rounded-xl p-4 text-white hover:scale-105 transition-all duration-300 cursor-pointer">
                    <div className="flex items-center mb-2">
                      <BarChart className="h-5 w-5 mr-2" />
                      <div className="font-medium">Field Comparison</div>
                    </div>
                    <div className="text-sm opacity-90">Compare field performance</div>
                  </div>
                </div>
              </ModernCardContent>
            </ModernCard>
          </div>
        </div>
      </main>
    </div>
  )
}