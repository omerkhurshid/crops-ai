'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Textarea } from '../../../components/ui/textarea'
import { Badge } from '../../../components/ui/badge'
import { Navbar } from '../../../components/navigation/navbar'
import { InteractiveFieldMap } from '../../../components/farm/interactive-field-map'
import { FarmTypeSelector } from '../../../components/farm/farm-type-selector'
import { CropCategorySelector } from '../../../components/farm/crop-category-selector'
import { LivestockCategorySelector } from '../../../components/farm/livestock-category-selector'
import { FarmType, CropItem, CropCategory, LivestockItem, LivestockCategory } from '../../../lib/farm-categories'
import { ArrowLeft, MapPin, CheckCircle, AlertCircle } from 'lucide-react'

interface Field {
  id: string
  name: string
  size: number
  area?: number
  crop?: string
  livestock?: string
  cropData?: CropItem
  livestockData?: LivestockItem
  soilType?: string
  perimeter: Array<{ lat: number; lng: number }>
  notes?: string
  monitoringSettings?: {
    frequency: 'daily' | 'weekly' | 'monthly'
    alerts: string[]
    parameters: string[]
  }
}

interface Farm {
  name: string
  description: string
  farmType: FarmType
  fields: Field[]
  location?: {
    lat: number
    lng: number
    address?: string
    region?: string
    country?: string
  }
}

export default function CreateFarmPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [farm, setFarm] = useState<Farm>({
    name: '',
    description: '',
    farmType: 'crops',
    fields: []
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showMapSelector, setShowMapSelector] = useState<string | null>(null)
  const [currentFieldSelection, setCurrentFieldSelection] = useState<string | null>(null)
  const router = useRouter()

  const calculatePolygonArea = (boundaries: Array<{ lat: number; lng: number }>) => {
    if (boundaries.length < 3) return 0
    
    // Simplified area calculation using shoelace formula (hectares)
    let area = 0
    for (let i = 0; i < boundaries.length; i++) {
      const j = (i + 1) % boundaries.length
      area += boundaries[i].lat * boundaries[j].lng
      area -= boundaries[j].lat * boundaries[i].lng
    }
    return Math.abs(area) * 6378137 * 6378137 / 20000000 // Rough conversion to hectares
  }

  const stepTitles = [
    'Welcome',
    'Farm Type',
    'Farm Details', 
    'Location',
    'Fields/Areas',
    'Data Setup',
    'Review'
  ]

  const addField = () => {
    const fieldType = farm.farmType === 'crops' ? 'Field' : farm.farmType === 'livestock' ? 'Paddock' : 'Area'
    const newField: Field = {
      id: `field-${Date.now()}`,
      name: '',
      size: 0,
      crop: farm.farmType === 'crops' || farm.farmType === 'mixed' ? '' : undefined,
      livestock: farm.farmType === 'livestock' || farm.farmType === 'mixed' ? '' : undefined,
      perimeter: [],
      notes: '',
      monitoringSettings: {
        frequency: 'weekly',
        alerts: [],
        parameters: []
      }
    }
    setFarm(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }))
  }

  const handleCropSelection = (crop: CropItem, category: CropCategory, fieldId: string) => {
    updateField(fieldId, { 
      crop: crop.id,
      cropData: crop,
      monitoringSettings: {
        frequency: 'weekly',
        alerts: ['Weather Changes', 'Growth Stage Updates'],
        parameters: crop.monitoringParameters
      }
    })
    setCurrentFieldSelection(null)
  }

  const handleLivestockSelection = (livestock: LivestockItem, category: LivestockCategory, fieldId: string) => {
    updateField(fieldId, { 
      livestock: livestock.id,
      livestockData: livestock,
      monitoringSettings: {
        frequency: 'daily',
        alerts: ['Animal Health', 'Pasture Changes'],
        parameters: livestock.monitoringParameters
      }
    })
    setCurrentFieldSelection(null)
  }

  const updateField = (fieldId: string, updates: Partial<Field>) => {
    setFarm(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }))
  }

  const removeField = (fieldId: string) => {
    setFarm(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId)
    }))
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      console.log('Creating farm with data:', farm)
      
      // Create the farm via API
      const farmResponse = await fetch('/api/farms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: farm.name,
          farmType: farm.farmType,
          description: farm.description,
          latitude: farm.location?.lat || 0,
          longitude: farm.location?.lng || 0,
          address: farm.location?.address || '',
          region: farm.location?.region || '',
          country: farm.location?.country || 'US',
          totalArea: farm.fields.reduce((total, field) => total + (field.size || 0), 0)
        }),
      })

      if (!farmResponse.ok) {
        const errorText = await farmResponse.text()
        throw new Error(`Failed to create farm: ${errorText}`)
      }

      const farmResult = await farmResponse.json()
      console.log('Farm created successfully:', farmResult)

      // Create fields for the farm
      if (farm.fields.length > 0) {
        for (const field of farm.fields) {
          const fieldResponse = await fetch('/api/fields', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              farmId: farmResult.farm.id,
              name: field.name,
              area: field.size || 0,
              soilType: field.soilType || null,
              // Convert perimeter coordinates to boundary format if available
              boundary: field.perimeter ? JSON.stringify({
                type: 'Polygon',
                coordinates: [field.perimeter.map(p => [p.lng, p.lat])]
              }) : null
            }),
          })

          if (!fieldResponse.ok) {
            console.error(`Failed to create field ${field.name}:`, await fieldResponse.text())
          } else {
            console.log(`Field ${field.name} created successfully`)
          }
        }
      }

      // Redirect to dashboard to see the created farm
      router.push('/dashboard')
    } catch (error) {
      console.error('Error creating farm:', error)
      alert('Failed to create farm. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-agricultural">
      <div className="absolute inset-0 agricultural-overlay"></div>
      <Navbar />
      
      <main className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8 relative z-10">
        <div className="px-4 py-6 sm:px-0">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <h1 className="text-4xl font-bold text-white">Create New Farm</h1>
              <div className="flex items-center space-x-2">
                {stepTitles.map((title, index) => (
                  <div key={index} className="flex items-center">
                    <div className={`flex items-center ${currentStep >= index + 1 ? 'text-sage-400' : 'text-gray-500'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                        currentStep >= index + 1 ? 'bg-sage-600 text-white' : 'bg-gray-300 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="ml-2 text-sm font-medium hidden lg:block">{title}</span>
                    </div>
                    {index < stepTitles.length - 1 && (
                      <div className="w-4 h-0.5 bg-gray-300 ml-2"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Step 1: Welcome & Context */}
          {currentStep === 1 && (
            <Card>
              <CardHeader className="text-center">
                <div className="text-6xl mb-4">🌱</div>
                <CardTitle className="text-2xl">Welcome to Crops.AI Farm Setup</CardTitle>
                <CardDescription className="text-lg">
                  Let&apos;s set up your farm with satellite imagery, live data feeds, and AI-powered insights.
                  This process takes about 5 minutes and will customize your experience.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-sage-50 rounded-lg p-6">
                    <h3 className="font-semibold text-sage-800 mb-3">What we&apos;ll help you set up:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-sage-600" />
                        <span className="text-sm">Farm type selection & optimization</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-sage-600" />
                        <span className="text-sm">Field boundary mapping</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-sage-600" />
                        <span className="text-sm">Satellite data integration</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-sage-600" />
                        <span className="text-sm">Automated monitoring setup</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => router.push('/dashboard')}>
                      Skip Setup (Go to Dashboard)
                    </Button>
                    <Button 
                      onClick={() => setCurrentStep(2)}
                      className="bg-sage-600 hover:bg-sage-700"
                    >
                      Get Started →
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Farm Type Selection */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>What type of farming do you do?</CardTitle>
                <CardDescription>
                  This helps us customize monitoring, alerts, and insights for your specific needs.
                  You can always change this later or add multiple types.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <FarmTypeSelector
                    selectedType={farm.farmType}
                    onSelect={(type) => setFarm(prev => ({ ...prev, farmType: type }))}
                  />

                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentStep(1)}
                    >
                      ← Back
                    </Button>
                    <Button 
                      onClick={() => setCurrentStep(3)}
                      disabled={!farm.farmType}
                      className="bg-sage-600 hover:bg-sage-700"
                    >
                      Next: Farm Details →
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Farm Details */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Tell us about your {farm.farmType === 'mixed' ? 'mixed' : farm.farmType} operation</CardTitle>
                <CardDescription>
                  Basic information to get your farm profile started.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="farm-name">Farm Name *</Label>
                      <Input
                        id="farm-name"
                        type="text"
                        placeholder="Enter farm name"
                        value={farm.name}
                        onChange={(e) => setFarm(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label>Farm Type</Label>
                      <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                        <span className="text-2xl">
                          {farm.farmType === 'crops' ? '🌾' : farm.farmType === 'livestock' ? '🐄' : '🚜'}
                        </span>
                        <span className="font-medium">
                          {farm.farmType === 'crops' ? 'Crop Production' : 
                           farm.farmType === 'livestock' ? 'Livestock Production' : 'Mixed Farming'}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentStep(2)}
                        >
                          Change
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="farm-description">Description (Optional)</Label>
                    <Textarea
                      id="farm-description"
                      placeholder="Describe your farming operation, goals, or any special characteristics"
                      rows={4}
                      value={farm.description}
                      onChange={(e) => setFarm(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentStep(2)}
                    >
                      ← Back
                    </Button>
                    <Button 
                      onClick={() => setCurrentStep(4)}
                      disabled={!farm.name}
                      className="bg-sage-600 hover:bg-sage-700"
                    >
                      Next: Location →
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Location */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Farm Location</CardTitle>
                <CardDescription>
                  Set your farm location for accurate weather data and satellite imagery
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="farm-latitude">Latitude</Label>
                      <Input
                        id="farm-latitude"
                        type="number"
                        step="any"
                        placeholder="e.g., 40.7128"
                        value={farm.location?.lat || ''}
                        onChange={(e) => setFarm(prev => ({
                          ...prev,
                          location: {
                            lat: parseFloat(e.target.value) || 0,
                            lng: prev.location?.lng || 0,
                            address: prev.location?.address,
                            region: prev.location?.region,
                            country: prev.location?.country
                          }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="farm-longitude">Longitude</Label>
                      <Input
                        id="farm-longitude"
                        type="number"
                        step="any"
                        placeholder="e.g., -74.0060"
                        value={farm.location?.lng || ''}
                        onChange={(e) => setFarm(prev => ({
                          ...prev,
                          location: {
                            lat: prev.location?.lat || 0,
                            lng: parseFloat(e.target.value) || 0,
                            address: prev.location?.address,
                            region: prev.location?.region,
                            country: prev.location?.country
                          }
                        }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="farm-address">Address (Optional)</Label>
                      <Input
                        id="farm-address"
                        type="text"
                        placeholder="Farm address"
                        value={farm.location?.address || ''}
                        onChange={(e) => setFarm(prev => ({
                          ...prev,
                          location: {
                            lat: prev.location?.lat || 0,
                            lng: prev.location?.lng || 0,
                            address: e.target.value,
                            region: prev.location?.region,
                            country: prev.location?.country
                          }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="farm-region">Region/State</Label>
                      <Input
                        id="farm-region"
                        type="text"
                        placeholder="e.g., California"
                        value={farm.location?.region || ''}
                        onChange={(e) => setFarm(prev => ({
                          ...prev,
                          location: {
                            lat: prev.location?.lat || 0,
                            lng: prev.location?.lng || 0,
                            address: prev.location?.address,
                            region: e.target.value,
                            country: prev.location?.country
                          }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="farm-country">Country</Label>
                      <Input
                        id="farm-country"
                        type="text"
                        placeholder="e.g., United States"
                        value={farm.location?.country || ''}
                        onChange={(e) => setFarm(prev => ({
                          ...prev,
                          location: {
                            lat: prev.location?.lat || 0,
                            lng: prev.location?.lng || 0,
                            address: prev.location?.address,
                            region: prev.location?.region,
                            country: e.target.value
                          }
                        }))}
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Why do we need your location?</p>
                        <ul className="text-sm space-y-1">
                          <li>• Accurate weather forecasts and alerts</li>
                          <li>• Satellite imagery for field monitoring</li>
                          <li>• Regional crop recommendations</li>
                          <li>• Local market data and pricing</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentStep(3)}
                    >
                      ← Back
                    </Button>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline"
                        onClick={() => setCurrentStep(5)}
                      >
                        Skip Location
                      </Button>
                      <Button 
                        onClick={() => setCurrentStep(5)}
                        disabled={!farm.location?.lat || !farm.location?.lng}
                        className="bg-sage-600 hover:bg-sage-700"
                      >
                        Next: Define Fields →
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Fields/Areas */}
          {currentStep === 5 && (
            <Card>
              <CardHeader>
                <CardTitle>Define {farm.farmType === 'crops' ? 'Fields' : farm.farmType === 'livestock' ? 'Paddocks' : 'Areas'}</CardTitle>
                <CardDescription>
                  Map out your {farm.farmType === 'crops' ? 'crop fields' : farm.farmType === 'livestock' ? 'grazing areas' : 'farming areas'} for monitoring. Each area can have different {farm.farmType === 'crops' ? 'crops' : farm.farmType === 'livestock' ? 'livestock' : 'uses'} and monitoring settings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Fields List */}
                  <div className="space-y-4">
                    {farm.fields.map((field, index) => {
                      const fieldType = farm.farmType === 'crops' ? 'Field' : farm.farmType === 'livestock' ? 'Paddock' : 'Area'
                      return (
                        <div key={field.id} className="p-6 border border-gray-200 rounded-lg bg-gray-50">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="font-medium text-gray-900">{fieldType} {index + 1}</h4>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeField(field.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Remove
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <Label htmlFor={`field-name-${field.id}`}>{fieldType} Name *</Label>
                              <Input
                                id={`field-name-${field.id}`}
                                type="text"
                                placeholder={`e.g., North ${fieldType}`}
                                value={field.name}
                                onChange={(e) => updateField(field.id, { name: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`field-size-${field.id}`}>Size (hectares) *</Label>
                              <Input
                                id={`field-size-${field.id}`}
                                type="number"
                                step="0.1"
                                placeholder="Enter size"
                                value={field.size || ''}
                                onChange={(e) => updateField(field.id, { size: parseFloat(e.target.value) || 0 })}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`field-soil-${field.id}`}>Soil Type (Optional)</Label>
                              <Input
                                id={`field-soil-${field.id}`}
                                type="text"
                                placeholder="e.g., Clay, Sandy, Loam"
                                value={field.soilType || ''}
                                onChange={(e) => updateField(field.id, { soilType: e.target.value })}
                              />
                            </div>
                          </div>

                          {/* Crop/Livestock Selection for Mixed Farms */}
                          {farm.farmType === 'mixed' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <Label>Primary Use</Label>
                                <div className="flex space-x-2 mt-2">
                                  <Button
                                    variant={field.crop ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => {
                                      setCurrentFieldSelection(field.id)
                                      // Will open crop selector modal
                                    }}
                                  >
                                    {field.cropData ? field.cropData.name : 'Select Crop'}
                                  </Button>
                                  <Button
                                    variant={field.livestock ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => {
                                      setCurrentFieldSelection(field.id)
                                      // Will open livestock selector modal
                                    }}
                                  >
                                    {field.livestockData ? field.livestockData.name : 'Select Livestock'}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Field Boundaries */}
                          <div className="mb-4">
                            <Label>Field Boundaries</Label>
                            <div className="mt-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-sage-300 transition-colors">
                              <div className="text-center text-gray-600">
                                <div className="mb-2">
                                  <MapPin className="mx-auto h-8 w-8 text-gray-400" />
                                </div>
                                <p className="text-sm font-medium">Interactive Field Mapping</p>
                                <p className="text-xs text-gray-500 mt-1 mb-3">
                                  {field.perimeter.length > 0 
                                    ? `${field.perimeter.length} boundary points defined` 
                                    : 'Click to define field boundaries with satellite imagery'
                                  }
                                </p>
                                <Button 
                                  type="button" 
                                  variant="outline"
                                  className="text-sm"
                                  onClick={() => setShowMapSelector(field.id)}
                                >
                                  🗺️ Open Interactive Map
                                </Button>
                                {field.perimeter.length > 0 && (
                                  <div className="mt-2 text-xs text-sage-600">
                                    Area: {field.area ? field.area.toFixed(2) : 'Calculating...'} hectares
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div>
                            <Label htmlFor={`field-notes-${field.id}`}>Notes (Optional)</Label>
                            <Textarea
                              id={`field-notes-${field.id}`}
                              placeholder={`Any additional notes about this ${fieldType.toLowerCase()}`}
                              rows={2}
                              value={field.notes || ''}
                              onChange={(e) => updateField(field.id, { notes: e.target.value })}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Add Field Button */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addField}
                    className="w-full py-6 border-2 border-dashed border-gray-300 hover:border-sage-300 hover:bg-sage-50"
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">➕</div>
                      <div className="font-medium text-gray-700">Add Another {farm.farmType === 'crops' ? 'Field' : farm.farmType === 'livestock' ? 'Paddock' : 'Area'}</div>
                      <div className="text-xs text-gray-500 mt-1">Define boundaries with satellite mapping</div>
                    </div>
                  </Button>

                  {/* Information Box */}
                  {farm.fields.length === 0 && (
                    <div className="bg-sage-50 p-4 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-sage-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-sage-800">
                          <p className="font-medium mb-1">Interactive Field Mapping</p>
                          <p className="text-sm">Our satellite-powered mapping tool lets you:</p>
                          <ul className="text-sm mt-2 space-y-1">
                            <li>• Draw field boundaries on high-resolution satellite imagery</li>
                            <li>• Automatically detect existing field boundaries</li>
                            <li>• Calculate accurate field areas</li>
                            <li>• Set up crop-specific monitoring</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentStep(4)}
                    >
                      ← Back
                    </Button>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline"
                        onClick={() => setCurrentStep(6)}
                      >
                        Skip Fields
                      </Button>
                      <Button 
                        onClick={() => setCurrentStep(6)}
                        disabled={farm.fields.length === 0 || farm.fields.some(f => !f.name || !f.size)}
                        className="bg-sage-600 hover:bg-sage-700"
                      >
                        Next: Configure Monitoring →
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 6: Data Setup */}
          {currentStep === 6 && (
            <Card>
              <CardHeader>
                <CardTitle>Configure Monitoring & Data Sources</CardTitle>
                <CardDescription>
                  Set up automated monitoring, alerts, and data collection for your {farm.farmType === 'crops' ? 'crop fields' : farm.farmType === 'livestock' ? 'livestock paddocks' : 'farming areas'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Field-Specific Configuration */}
                  {farm.fields.map((field, index) => {
                    const fieldType = farm.farmType === 'crops' ? 'Field' : farm.farmType === 'livestock' ? 'Paddock' : 'Area'
                    return (
                      <div key={field.id} className="p-6 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-4">{fieldType} {index + 1}: {field.name || 'Unnamed'}</h4>
                        
                        {/* Crop/Livestock Selection */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {(farm.farmType === 'crops' || farm.farmType === 'mixed') && (
                            <div>
                              <Label>Primary Crop</Label>
                              <Button
                                variant={field.cropData ? 'default' : 'outline'}
                                className="w-full justify-start mt-2"
                                onClick={() => setCurrentFieldSelection(field.id)}
                              >
                                {field.cropData ? (
                                  <div className="flex items-center">
                                    <span className="mr-2">{field.cropData.name}</span>
                                    <Badge variant="secondary" className="text-xs">
                                      {field.cropData.growingSeasonDays ? `${field.cropData.growingSeasonDays}d` : 'Crop'}
                                    </Badge>
                                  </div>
                                ) : (
                                  'Select Crop Type'
                                )}
                              </Button>
                            </div>
                          )}
                          
                          {(farm.farmType === 'livestock' || farm.farmType === 'mixed') && (
                            <div>
                              <Label>Primary Livestock</Label>
                              <Button
                                variant={field.livestockData ? 'default' : 'outline'}
                                className="w-full justify-start mt-2"
                                onClick={() => setCurrentFieldSelection(field.id)}
                              >
                                {field.livestockData ? (
                                  <div className="flex items-center">
                                    <span className="mr-2">{field.livestockData.name}</span>
                                    <Badge variant="secondary" className="text-xs">
                                      {field.livestockData.typicalHerdSize || 'Livestock'}
                                    </Badge>
                                  </div>
                                ) : (
                                  'Select Livestock Type'
                                )}
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Monitoring Settings */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label>Monitoring Frequency</Label>
                            <select
                              value={field.monitoringSettings?.frequency || 'weekly'}
                              onChange={(e) => updateField(field.id, {
                                monitoringSettings: {
                                  frequency: e.target.value as 'daily' | 'weekly' | 'monthly',
                                  alerts: field.monitoringSettings?.alerts || [],
                                  parameters: field.monitoringSettings?.parameters || []
                                }
                              })}
                              className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                            >
                              <option value="daily">Daily</option>
                              <option value="weekly">Weekly</option>
                              <option value="monthly">Monthly</option>
                            </select>
                          </div>
                          
                          <div className="md:col-span-2">
                            <Label>Monitoring Parameters</Label>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {(field.cropData?.monitoringParameters || field.livestockData?.monitoringParameters || [
                                'Weather', 'Soil Moisture', 'Temperature', 'Growth Stage'
                              ]).map((param, paramIndex) => (
                                <Badge key={paramIndex} variant="outline" className="text-xs">
                                  {param}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  {/* Global Monitoring Settings */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-4">Farm-Wide Settings</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="font-medium">Data Sources</Label>
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm">Satellite Imagery (Sentinel-2)</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm">Weather Data (OpenWeather)</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm">Soil Data Integration</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="font-medium">Alert Settings</Label>
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center space-x-3">
                            <input type="checkbox" defaultChecked className="rounded" />
                            <span className="text-sm">Weather alerts</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <input type="checkbox" defaultChecked className="rounded" />
                            <span className="text-sm">Growth stage updates</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <input type="checkbox" defaultChecked className="rounded" />
                            <span className="text-sm">Anomaly detection</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentStep(5)}
                    >
                      ← Back
                    </Button>
                    <Button 
                      onClick={() => setCurrentStep(7)}
                      className="bg-sage-600 hover:bg-sage-700"
                    >
                      Next: Review & Create →
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 7: Review */}
          {currentStep === 7 && (
            <Card>
              <CardHeader>
                <CardTitle>Review & Create Farm</CardTitle>
                <CardDescription>
                  Confirm your farm details before creation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Farm Summary */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-4">Farm Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">Farm Name:</span>
                        <p className="font-medium">{farm.name || 'Not set'}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Farm Type:</span>
                        <p className="font-medium flex items-center">
                          <span className="mr-2">
                            {farm.farmType === 'crops' ? '🌾' : 
                             farm.farmType === 'livestock' ? '🐄' : '🚜'}
                          </span>
                          {farm.farmType === 'crops' ? 'Crop Production' : 
                           farm.farmType === 'livestock' ? 'Livestock Production' : 
                           'Mixed Farming'}
                        </p>
                      </div>
                      {farm.location?.lat && farm.location?.lng && (
                        <div className="md:col-span-2">
                          <span className="text-sm text-gray-600">Location:</span>
                          <p className="text-sm">{farm.location.lat.toFixed(4)}, {farm.location.lng.toFixed(4)}</p>
                          {farm.location.address && (
                            <p className="text-sm text-gray-500">{farm.location.address}</p>
                          )}
                        </div>
                      )}
                      {farm.description && (
                        <div className="md:col-span-2">
                          <span className="text-sm text-gray-600">Description:</span>
                          <p className="text-sm">{farm.description}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Fields Summary */}
                  {farm.fields.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">
                        {farm.farmType === 'crops' ? 'Fields' : farm.farmType === 'livestock' ? 'Paddocks' : 'Areas'} ({farm.fields.length})
                      </h3>
                      <div className="space-y-3">
                        {farm.fields.map((field, index) => {
                          const fieldType = farm.farmType === 'crops' ? 'Field' : farm.farmType === 'livestock' ? 'Paddock' : 'Area'
                          return (
                            <div key={field.id} className="bg-gray-50 p-4 rounded-lg">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                  <span className="text-sm text-gray-600">Name:</span>
                                  <p className="font-medium">{field.name || `${fieldType} ${index + 1}`}</p>
                                </div>
                                <div>
                                  <span className="text-sm text-gray-600">Size:</span>
                                  <p className="font-medium">{field.size || field.area || 0} ha</p>
                                </div>
                                <div>
                                  <span className="text-sm text-gray-600">{farm.farmType === 'crops' ? 'Crop' : farm.farmType === 'livestock' ? 'Livestock' : 'Type'}:</span>
                                  <p className="font-medium">
                                    {field.cropData?.name || field.livestockData?.name || 'Not set'}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-sm text-gray-600">Boundaries:</span>
                                  <p className="font-medium">
                                    {field.perimeter.length > 0 ? `${field.perimeter.length} points` : 'Not mapped'}
                                  </p>
                                </div>
                              </div>
                              {field.notes && (
                                <div className="mt-2">
                                  <span className="text-sm text-gray-600">Notes:</span>
                                  <p className="text-sm">{field.notes}</p>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                      <div className="mt-4 p-4 bg-sage-50 rounded-lg">
                        <p className="text-sm text-sage-800">
                          <strong>Total Area:</strong> {farm.fields.reduce((total, field) => total + (field.size || field.area || 0), 0).toFixed(2)} hectares
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Monitoring Summary */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">Monitoring & Data Collection</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-700">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>Satellite imagery integration</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>Weather monitoring</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>Automated alerts</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentStep(6)}
                    >
                      ← Back
                    </Button>
                    <Button 
                      onClick={handleSubmit}
                      disabled={isLoading || !farm.name}
                      className="bg-sage-600 hover:bg-sage-700"
                    >
                      {isLoading ? 'Creating Farm...' : `Create ${farm.farmType === 'crops' ? 'Crop' : farm.farmType === 'livestock' ? 'Livestock' : 'Mixed'} Farm`}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Interactive Field Map Modal */}
          {showMapSelector && (
            <InteractiveFieldMap
              fieldId={showMapSelector}
              onBoundariesDetected={(boundaries) => {
                updateField(showMapSelector, { 
                  perimeter: boundaries,
                  // Calculate approximate area from boundaries
                  area: boundaries.length > 2 ? calculatePolygonArea(boundaries) : 0
                })
                setShowMapSelector(null)
              }}
              onClose={() => setShowMapSelector(null)}
            />
          )}

          {/* Crop Selection Modal */}
          {currentFieldSelection && farm.farmType !== 'livestock' && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <h3 className="text-lg font-medium mb-4">Select Crop Type</h3>
                  <CropCategorySelector
                    selectedCrop={farm.fields.find(f => f.id === currentFieldSelection)?.crop}
                    onSelect={(crop, category) => handleCropSelection(crop, category, currentFieldSelection)}
                  />
                  <div className="flex justify-end mt-6">
                    <Button variant="outline" onClick={() => setCurrentFieldSelection(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Livestock Selection Modal */}
          {currentFieldSelection && farm.farmType !== 'crops' && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <h3 className="text-lg font-medium mb-4">Select Livestock Type</h3>
                  <LivestockCategorySelector
                    selectedLivestock={farm.fields.find(f => f.id === currentFieldSelection)?.livestock}
                    onSelect={(livestock, category) => handleLivestockSelection(livestock, category, currentFieldSelection)}
                  />
                  <div className="flex justify-end mt-6">
                    <Button variant="outline" onClick={() => setCurrentFieldSelection(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}