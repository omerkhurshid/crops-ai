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
                  Let's set up your farm with satellite imagery, live data feeds, and AI-powered insights.
                  This process takes about 5 minutes and will customize your experience.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-sage-50 rounded-lg p-6">
                    <h3 className="font-semibold text-sage-800 mb-3">What we'll help you set up:</h3>
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

          {/* Step 2: Add Fields */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Farm Fields</CardTitle>
                  <CardDescription>
                    Add fields to your farm. Each field can have different crops and be managed separately.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {farm.fields.map((field, index) => (
                      <div key={field.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-medium text-gray-900">Field {index + 1}</h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeField(field.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor={`field-name-${field.id}`}>Field Name *</Label>
                            <Input
                              id={`field-name-${field.id}`}
                              type="text"
                              placeholder="e.g., North Field"
                              value={field.name}
                              onChange={(e) => updateField(field.id, { name: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`field-size-${field.id}`}>Size (acres) *</Label>
                            <Input
                              id={`field-size-${field.id}`}
                              type="number"
                              placeholder="Enter size"
                              value={field.size || ''}
                              onChange={(e) => updateField(field.id, { size: parseFloat(e.target.value) || 0 })}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`field-crop-${field.id}`}>Primary Crop *</Label>
                            <select
                              id={`field-crop-${field.id}`}
                              value={field.crop}
                              onChange={(e) => updateField(field.id, { crop: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-crops-green-500 focus:border-transparent"
                            >
                              <option value="">Select crop</option>
                              {cropOptions.map(crop => (
                                <option key={crop.value} value={crop.value}>
                                  {crop.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="mt-4">
                          <Label>Field Perimeter</Label>
                          <div className="mt-2 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                            <div className="text-center text-gray-500">
                              <div className="mb-2">
                                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                </svg>
                              </div>
                              <p className="text-sm">Click to open map and draw field perimeter</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {field.perimeter.length > 0 
                                  ? `${field.perimeter.length} points defined` 
                                  : 'No perimeter defined yet'
                                }
                              </p>
                              <Button 
                                type="button" 
                                variant="outline" 
                                className="mt-2"
                                onClick={() => setShowMapSelector(field.id)}
                              >
                                📍 Define Field Boundaries
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4">
                          <Label htmlFor={`field-notes-${field.id}`}>Notes (Optional)</Label>
                          <Textarea
                            id={`field-notes-${field.id}`}
                            placeholder="Any additional notes about this field"
                            rows={2}
                            value={field.notes || ''}
                            onChange={(e) => updateField(field.id, { notes: e.target.value })}
                          />
                        </div>
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      onClick={addField}
                      className="w-full py-8 border-2 border-dashed border-gray-300 hover:border-crops-green-300"
                    >
                      <div className="text-center">
                        <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Another Field
                      </div>
                    </Button>
                  </div>

                  <div className="flex justify-between pt-6">
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentStep(1)}
                    >
                      Back
                    </Button>
                    <Button 
                      onClick={() => setCurrentStep(3)}
                      disabled={farm.fields.length === 0 || farm.fields.some(f => !f.name || !f.crop || !f.size)}
                      className="bg-crops-green-600 hover:bg-crops-green-700"
                    >
                      Review & Create
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Review Farm Details</CardTitle>
                  <CardDescription>
                    Please review your farm information before creating
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Farm Information</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm text-gray-600">Name:</span>
                            <p className="font-medium">{farm.name}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Type:</span>
                            <p className="font-medium">{farm.farmType}</p>
                          </div>
                        </div>
                        {farm.description && (
                          <div className="mt-2">
                            <span className="text-sm text-gray-600">Description:</span>
                            <p className="text-sm">{farm.description}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Fields ({farm.fields.length})</h4>
                      <div className="space-y-3">
                        {farm.fields.map((field, index) => (
                          <div key={field.id} className="bg-gray-50 p-4 rounded-lg">
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <span className="text-sm text-gray-600">Name:</span>
                                <p className="font-medium">{field.name}</p>
                              </div>
                              <div>
                                <span className="text-sm text-gray-600">Size:</span>
                                <p className="font-medium">{field.size} acres</p>
                              </div>
                              <div>
                                <span className="text-sm text-gray-600">Crop:</span>
                                <p className="font-medium">{cropOptions.find(c => c.value === field.crop)?.label}</p>
                              </div>
                            </div>
                            {field.notes && (
                              <div className="mt-2">
                                <span className="text-sm text-gray-600">Notes:</span>
                                <p className="text-sm">{field.notes}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between pt-6">
                      <Button 
                        variant="outline" 
                        onClick={() => setCurrentStep(2)}
                      >
                        Back to Fields
                      </Button>
                      <Button 
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="bg-crops-green-600 hover:bg-crops-green-700"
                      >
                        {isLoading ? 'Creating Farm...' : 'Create Farm'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Interactive Field Map Modal */}
          {showMapSelector && (
            <InteractiveFieldMap
              fieldId={showMapSelector}
              onBoundariesDetected={(boundaries) => {
                updateField(showMapSelector, { perimeter: boundaries })
                setShowMapSelector(null)
              }}
              onClose={() => setShowMapSelector(null)}
            />
          )}
        </div>
      </main>
    </div>
  )
}