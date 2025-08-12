'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { SatelliteMapViewer } from './satellite-map-viewer'
import { 
  MapPin, Plus, Save, AlertCircle, Map, Loader2, 
  ChevronRight, CheckCircle, MousePointer2 
} from 'lucide-react'

interface FieldFormWithMapProps {
  farmId: string
  farmName: string
  farmLatitude: number | null
  farmLongitude: number | null
  farmTotalArea?: number
  existingFields?: Array<{ id: string; name: string; area: number }>
}

interface DetectedField {
  id: string
  area: number
  boundaries: Array<{ lat: number; lng: number }>
  selected?: boolean
}

const cropTypes = [
  'Corn', 'Soybean', 'Wheat', 'Cotton', 'Rice', 'Barley', 'Oats', 'Canola', 
  'Sunflower', 'Potato', 'Tomato', 'Lettuce', 'Carrot', 'Onion', 'Other'
]

const soilTypes = [
  'Clay', 'Sandy', 'Loam', 'Silt', 'Sandy Loam', 'Clay Loam', 'Silty Clay', 
  'Silty Clay Loam', 'Sandy Clay', 'Sandy Clay Loam', 'Unknown'
]

export function FieldFormWithMap({ 
  farmId, 
  farmName, 
  farmLatitude, 
  farmLongitude,
  farmTotalArea,
  existingFields = []
}: FieldFormWithMapProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [detectedFields, setDetectedFields] = useState<DetectedField[]>([])
  const [selectedFields, setSelectedFields] = useState<DetectedField[]>([])
  const [manualBoundary, setManualBoundary] = useState<Array<{ lat: number; lng: number }>>([])
  const [fieldDetails, setFieldDetails] = useState<Record<string, { name: string; cropType: string; soilType: string }>>({})

  // Calculate remaining area
  const usedArea = existingFields.reduce((sum, field) => sum + field.area, 0)
  const remainingArea = farmTotalArea ? farmTotalArea - usedArea : 0

  // Handle field detection from satellite
  const handleFieldsDetected = useCallback((fields: any[]) => {
    const newDetectedFields = fields.map((field, index) => ({
      ...field,
      id: field.id || `detected-${index}`,
      selected: false
    }))
    setDetectedFields(newDetectedFields)
  }, [])

  // Handle manual boundary drawing
  const handleBoundarySet = useCallback((boundaries: Array<{ lat: number; lng: number }>) => {
    setManualBoundary(boundaries)
    // Calculate area from boundaries
    if (boundaries.length >= 3) {
      const area = calculatePolygonArea(boundaries)
      const manualField: DetectedField = {
        id: 'manual-field',
        area: area,
        boundaries: boundaries,
        selected: true
      }
      setSelectedFields([manualField])
    }
  }, [])

  // Calculate polygon area in hectares
  const calculatePolygonArea = (coordinates: Array<{ lat: number; lng: number }>): number => {
    if (coordinates.length < 3) return 0
    
    const R = 6371000 // Earth's radius in meters
    let area = 0
    
    for (let i = 0; i < coordinates.length; i++) {
      const j = (i + 1) % coordinates.length
      const lat1 = coordinates[i].lat * Math.PI / 180
      const lat2 = coordinates[j].lat * Math.PI / 180
      const lng1 = coordinates[i].lng * Math.PI / 180
      const lng2 = coordinates[j].lng * Math.PI / 180
      
      area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2))
    }
    
    area = Math.abs(area * R * R / 2)
    return area / 10000 // Convert to hectares
  }

  // Toggle field selection
  const toggleFieldSelection = (field: DetectedField) => {
    if (selectedFields.find(f => f.id === field.id)) {
      setSelectedFields(selectedFields.filter(f => f.id !== field.id))
      const { [field.id]: _, ...rest } = fieldDetails
      setFieldDetails(rest)
    } else {
      setSelectedFields([...selectedFields, field])
      setFieldDetails({
        ...fieldDetails,
        [field.id]: { name: `Field ${selectedFields.length + 1}`, cropType: '', soilType: '' }
      })
    }
  }

  // Update field details
  const updateFieldDetail = (fieldId: string, key: string, value: string) => {
    setFieldDetails({
      ...fieldDetails,
      [fieldId]: {
        ...fieldDetails[fieldId],
        [key]: value
      }
    })
  }

  // Validate form
  const validateForm = () => {
    if (selectedFields.length === 0) return 'Please select or draw at least one field'
    
    for (const field of selectedFields) {
      const details = fieldDetails[field.id]
      if (!details?.name?.trim()) return 'All fields must have a name'
      if (!details?.cropType) return 'All fields must have a crop type'
    }
    
    return null
  }

  // Handle submit
  const handleSubmit = async () => {
    setError(null)
    setLoading(true)

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      setLoading(false)
      return
    }

    try {
      // Create each selected field
      for (const field of selectedFields) {
        const details = fieldDetails[field.id]
        
        const response = await fetch('/api/fields', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            farmId,
            name: details.name,
            area: field.area,
            cropType: details.cropType,
            soilType: details.soilType || undefined,
            boundary: field.boundaries
          })
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error?.message || 'Failed to create field')
        }
      }

      router.push(`/farms/${farmId}`)
      router.refresh()
    } catch (err) {
      console.error('Field creation error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          {[1, 2].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                currentStep >= step 
                  ? 'bg-sage-600 text-white' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {currentStep > step ? <CheckCircle className="h-5 w-5" /> : step}
              </div>
              {step < 2 && (
                <ChevronRight className={`mx-2 h-5 w-5 ${
                  currentStep > step ? 'text-sage-600' : 'text-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="text-sm text-gray-600">
          {currentStep === 1 ? 'Select Fields' : 'Field Details'}
        </div>
      </div>

      {/* Step 1: Map Selection */}
      {currentStep === 1 && (
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Select Fields on Map</CardTitle>
            <CardDescription>
              Use satellite imagery to detect fields automatically or draw boundaries manually
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Farm Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">{farmName}</p>
                  <p className="text-sm text-blue-700">
                    Total area: {farmTotalArea?.toFixed(1) || '?'} ha • 
                    Used: {usedArea.toFixed(1)} ha • 
                    Available: {remainingArea.toFixed(1)} ha
                  </p>
                  {existingFields.length > 0 && (
                    <p className="text-xs text-blue-600 mt-1">
                      Existing fields: {existingFields.map(f => f.name).join(', ')}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Satellite Map */}
            {farmLatitude && farmLongitude && (
              <div className="border rounded-lg overflow-hidden">
                <SatelliteMapViewer
                  initialLocation={{ lat: farmLatitude, lng: farmLongitude }}
                  onFieldsDetected={handleFieldsDetected}
                  onBoundariesSet={handleBoundarySet}
                  showFieldDetection={true}
                  showBoundaryMarking={true}
                  height="500px"
                />
              </div>
            )}

            {/* Instructions */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">How to select fields:</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Click "Auto-detect Fields" to find field boundaries automatically</li>
                <li>• Or click the pin icon and draw boundaries manually</li>
                <li>• Click on detected fields below to select them</li>
                <li>• You can select multiple fields to create at once</li>
              </ul>
            </div>

            {/* Detected Fields List */}
            {detectedFields.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Detected Fields</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {detectedFields.map((field, index) => (
                    <button
                      key={field.id}
                      onClick={() => toggleFieldSelection(field)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedFields.find(f => f.id === field.id)
                          ? 'border-sage-600 bg-sage-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-sm font-medium">Field {index + 1}</div>
                      <div className="text-lg font-semibold">{field.area.toFixed(1)} ha</div>
                      <div className="text-xs text-gray-600">
                        {(field.area * 2.47).toFixed(1)} acres
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Manual Field */}
            {manualBoundary.length >= 3 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-green-900">Manually Drawn Field</p>
                    <p className="text-sm text-green-700">
                      Area: {selectedFields[0]?.area.toFixed(1)} ha ({(selectedFields[0]?.area * 2.47).toFixed(1)} acres)
                    </p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && currentStep === 1 && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                onClick={() => setCurrentStep(2)}
                disabled={selectedFields.length === 0}
                className="bg-sage-600 hover:bg-sage-700"
              >
                Continue ({selectedFields.length} field{selectedFields.length !== 1 ? 's' : ''} selected)
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Field Details */}
      {currentStep === 2 && (
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Field Information</CardTitle>
            <CardDescription>
              Provide details for each selected field
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {selectedFields.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">
                    {field.id === 'manual-field' ? 'Manually Drawn Field' : `Detected Field ${index + 1}`}
                  </h4>
                  <Badge variant="secondary">
                    {field.area.toFixed(1)} ha
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`name-${field.id}`}>Field Name *</Label>
                    <Input
                      id={`name-${field.id}`}
                      type="text"
                      placeholder="e.g. North Field"
                      value={fieldDetails[field.id]?.name || ''}
                      onChange={(e) => updateFieldDetail(field.id, 'name', e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`crop-${field.id}`}>Crop Type *</Label>
                    <select
                      id={`crop-${field.id}`}
                      value={fieldDetails[field.id]?.cropType || ''}
                      onChange={(e) => updateFieldDetail(field.id, 'cropType', e.target.value)}
                      required
                      disabled={loading}
                      className="flex h-10 w-full rounded-md border-2 border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Select a crop</option>
                      {cropTypes.map(crop => (
                        <option key={crop} value={crop}>{crop}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor={`soil-${field.id}`}>Soil Type (Optional)</Label>
                    <select
                      id={`soil-${field.id}`}
                      value={fieldDetails[field.id]?.soilType || ''}
                      onChange={(e) => updateFieldDetail(field.id, 'soilType', e.target.value)}
                      disabled={loading}
                      className="flex h-10 w-full rounded-md border-2 border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Select soil type</option>
                      {soilTypes.map(soil => (
                        <option key={soil} value={soil}>{soil}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(1)}
                disabled={loading}
              >
                Back
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={loading}
                className="bg-sage-600 hover:bg-sage-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Fields...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create {selectedFields.length} Field{selectedFields.length !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}