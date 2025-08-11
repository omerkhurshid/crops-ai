'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Badge } from '../../../components/ui/badge'
import { Navbar } from '../../../components/navigation/navbar'
import { InteractiveFieldMap } from '../../../components/farm/interactive-field-map'
import { SatelliteMapViewer } from '../../../components/farm/satellite-map-viewer'
import { getCropRecommendations, getLivestockRecommendations } from '../../../lib/farm/regional-crops'
import { 
  MapPin, Locate, Search, ChevronRight, CheckCircle, 
  Wheat, Users, Loader2, Navigation, Globe
} from 'lucide-react'

interface Farm {
  name: string
  type: 'crops' | 'livestock'
  location: {
    lat: number
    lng: number
    address?: string
  }
  totalArea: number
  detectedFields?: Array<{
    id: string
    area: number
    boundaries: Array<{ lat: number; lng: number }>
  }>
  primaryProduct?: string
  secondaryProducts?: string[]
}

export default function CreateFarmPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [farm, setFarm] = useState<Farm>({
    name: '',
    type: 'crops',
    location: { lat: 0, lng: 0 },
    totalArea: 0
  })
  const [isLoading, setIsLoading] = useState(false)
  const [detectingLocation, setDetectingLocation] = useState(false)
  const [locationInput, setLocationInput] = useState('')
  const [showMap, setShowMap] = useState(false)
  const [showSatelliteViewer, setShowSatelliteViewer] = useState(false)
  const [regionalRecommendations, setRegionalRecommendations] = useState<any>(null)
  const router = useRouter()

  // Get crop options from regional recommendations or fallback to defaults
  const getCropOptions = () => {
    if (regionalRecommendations && farm.type === 'crops') {
      return {
        primary: regionalRecommendations.primary.slice(0, 4).map((crop: any) => ({
          id: crop.id,
          name: crop.name,
          icon: crop.icon,
          season: `${crop.plantingWindow.start.replace('-', '/')} - ${crop.harvestWindow.end.replace('-', '/')}`
        })),
        secondary: regionalRecommendations.secondary.slice(0, 4).map((crop: any) => ({
          id: crop.id,
          name: crop.name,
          icon: crop.icon
        }))
      }
    }
    // Fallback options
    return {
      primary: [
        { id: 'corn-field', name: 'Corn', icon: '🌽', season: 'Mar-Oct' },
        { id: 'soybeans', name: 'Soybeans', icon: '🌱', season: 'Apr-Sep' },
        { id: 'winter-wheat', name: 'Wheat', icon: '🌾', season: 'Sep-Jul' },
        { id: 'sunflowers', name: 'Sunflowers', icon: '🌻', season: 'Apr-Nov' }
      ],
      secondary: [
        { id: 'sweet-corn', name: 'Sweet Corn', icon: '🌽' },
        { id: 'tomatoes', name: 'Tomatoes', icon: '🍅' },
        { id: 'hemp-industrial', name: 'Hemp', icon: '🌿' },
        { id: 'vegetables', name: 'Vegetables', icon: '🥬' }
      ]
    }
  }

  const cropOptions = getCropOptions()

  // Get livestock options from regional recommendations or fallback to defaults
  const getLivestockOptions = () => {
    if (regionalRecommendations && farm.type === 'livestock') {
      return {
        primary: regionalRecommendations.primary.map((livestock: any) => ({
          id: livestock.id,
          name: livestock.name,
          icon: livestock.icon,
          typical: livestock.suitability === 'high' ? 'Highly Recommended' : 'Suitable'
        })),
        secondary: regionalRecommendations.secondary.map((livestock: any) => ({
          id: livestock.id,
          name: livestock.name,
          icon: livestock.icon
        }))
      }
    }
    // Fallback options
    return {
      primary: [
        { id: 'cattle-beef', name: 'Beef Cattle', icon: '🐄', typical: '50-500 head' },
        { id: 'cattle-dairy', name: 'Dairy Cattle', icon: '🐄', typical: '100-1000 head' },
        { id: 'poultry', name: 'Poultry', icon: '🐔', typical: '1000+ birds' },
        { id: 'swine', name: 'Swine', icon: '🐖', typical: '100-5000 head' }
      ],
      secondary: [
        { id: 'sheep', name: 'Sheep', icon: '🐑' },
        { id: 'goats', name: 'Goats', icon: '🐐' },
        { id: 'horses', name: 'Horses', icon: '🐴' },
        { id: 'mixed', name: 'Mixed Livestock', icon: '🚜' }
      ]
    }
  }

  const livestockOptions = getLivestockOptions()

  // Get user's current location
  const getCurrentLocation = () => {
    setDetectingLocation(true)
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFarm(prev => ({
            ...prev,
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          }))
          setShowMap(true)
          setDetectingLocation(false)
        },
        (error) => {
          console.error('Error getting location:', error)
          setDetectingLocation(false)
          alert('Unable to get your location. Please enter it manually.')
        }
      )
    } else {
      setDetectingLocation(false)
      alert('Location services not available in your browser.')
    }
  }

  // Parse location input (address or coordinates)
  const parseLocationInput = async () => {
    const coordPattern = /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/
    
    if (coordPattern.test(locationInput.trim())) {
      // It's coordinates
      const [lat, lng] = locationInput.split(',').map(coord => parseFloat(coord.trim()))
      setFarm(prev => ({
        ...prev,
        location: { lat, lng }
      }))
      setShowMap(true)
    } else {
      // It's an address - in production, would geocode it
      // For now, using default coordinates
      alert('Address geocoding would happen here. Using default location.')
      setFarm(prev => ({
        ...prev,
        location: { lat: 40.7128, lng: -74.0060, address: locationInput }
      }))
      setShowMap(true)
    }
  }

  // Simulate field detection
  const detectFields = () => {
    // In production, this would use satellite imagery analysis
    const mockFields = [
      { id: 'field-1', area: 45.5, boundaries: [] },
      { id: 'field-2', area: 38.2, boundaries: [] },
      { id: 'field-3', area: 52.8, boundaries: [] },
      { id: 'field-4', area: 41.5, boundaries: [] }
    ]
    
    setFarm(prev => ({
      ...prev,
      detectedFields: mockFields,
      totalArea: mockFields.reduce((sum, field) => sum + field.area, 0)
    }))
  }

  const handleLocationConfirm = () => {
    setShowSatelliteViewer(true)
    // Get regional crop/livestock recommendations
    if (farm.type === 'crops') {
      const recommendations = getCropRecommendations(farm.location.lat, farm.location.lng, 'crops')
      setRegionalRecommendations(recommendations)
    } else {
      const recommendations = getLivestockRecommendations(farm.location.lat, farm.location.lng)
      setRegionalRecommendations(recommendations)
    }
  }

  const handleSatelliteViewerComplete = (adjustedLocation: { lat: number; lng: number; zoom: number }, detectedFields?: Array<any>) => {
    setFarm(prev => ({
      ...prev,
      location: {
        ...prev.location,
        lat: adjustedLocation.lat,
        lng: adjustedLocation.lng
      },
      detectedFields: detectedFields || prev.detectedFields,
      totalArea: detectedFields ? detectedFields.reduce((sum, field) => sum + field.area, 0) : prev.totalArea
    }))
    if (!detectedFields) {
      detectFields() // Fallback detection if satellite viewer didn't provide fields
    }
    setShowSatelliteViewer(false)
    setCurrentStep(2)
  }

  const handleProductSelection = (productId: string, isPrimary: boolean = true) => {
    if (isPrimary) {
      setFarm(prev => ({ ...prev, primaryProduct: productId }))
    } else {
      setFarm(prev => ({
        ...prev,
        secondaryProducts: prev.secondaryProducts?.includes(productId)
          ? prev.secondaryProducts.filter(p => p !== productId)
          : [...(prev.secondaryProducts || []), productId]
      }))
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      // Create the farm - force redeploy
      const response = await fetch('/api/farms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: farm.name,
          farmType: farm.type,
          latitude: farm.location.lat,
          longitude: farm.location.lng,
          address: farm.location.address || '',
          country: 'US', // Default to US, in production would determine from coordinates
          totalArea: farm.totalArea,
          primaryProduct: farm.primaryProduct,
          metadata: {
            detectedFields: farm.detectedFields?.length || 0,
            secondaryProducts: farm.secondaryProducts
          }
        })
      })

      if (!response.ok) throw new Error('Failed to create farm')
      
      const result = await response.json()
      
      // Create fields if detected
      if (farm.detectedFields && result.farm?.id) {
        for (let index = 0; index < farm.detectedFields.length; index++) {
          const field = farm.detectedFields[index];
          await fetch('/api/fields', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              farmId: result.farm.id,
              name: `Field ${index + 1}`,
              area: field.area
            })
          })
        }
      }

      router.push('/dashboard')
    } catch (error) {
      console.error('Error creating farm:', error)
      alert('Failed to create farm. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const stepTitles = ['Farm Basics', farm.type === 'crops' ? 'Crop Selection' : 'Livestock Selection', 'Review & Create']

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-sage-50/30 to-cream-100">
      <Navbar />
      
      <main className="max-w-4xl mx-auto pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-light text-sage-800">Quick Farm Setup</h1>
            <div className="flex items-center space-x-3">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    currentStep >= step 
                      ? 'bg-sage-600 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {currentStep > step ? <CheckCircle className="h-5 w-5" /> : step}
                  </div>
                  {step < 3 && (
                    <ChevronRight className={`mx-2 h-5 w-5 ${
                      currentStep > step ? 'text-sage-600' : 'text-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-2 flex items-center space-x-6 text-sm text-gray-600">
            {stepTitles.map((title, index) => (
              <span key={index} className={currentStep === index + 1 ? 'text-sage-700 font-medium' : ''}>
                {title}
              </span>
            ))}
          </div>
        </div>

        {/* Step 1: Farm Basics */}
        {currentStep === 1 && (
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-2xl font-light">Let&apos;s set up your farm</CardTitle>
              <CardDescription>
                We&apos;ll help you get started in just 3 quick steps. First, tell us about your farm.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Farm Name */}
              <div>
                <Label htmlFor="farm-name" className="text-base font-medium">
                  What&apos;s your farm called?
                </Label>
                <Input
                  id="farm-name"
                  type="text"
                  placeholder="e.g., Smith Family Farm"
                  value={farm.name}
                  onChange={(e) => setFarm(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-2 text-lg"
                  autoFocus
                />
              </div>

              {/* Farm Type Selection */}
              <div>
                <Label className="text-base font-medium mb-3 block">
                  What type of farming do you do?
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setFarm(prev => ({ ...prev, type: 'crops' }))}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      farm.type === 'crops'
                        ? 'border-sage-600 bg-sage-50 shadow-soft'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Wheat className={`h-12 w-12 mx-auto mb-3 ${
                      farm.type === 'crops' ? 'text-sage-600' : 'text-gray-400'
                    }`} />
                    <div className="text-lg font-medium">Crop Farming</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Grains, vegetables, fruits, etc.
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setFarm(prev => ({ ...prev, type: 'livestock' }))}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      farm.type === 'livestock'
                        ? 'border-sage-600 bg-sage-50 shadow-soft'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Users className={`h-12 w-12 mx-auto mb-3 ${
                      farm.type === 'livestock' ? 'text-sage-600' : 'text-gray-400'
                    }`} />
                    <div className="text-lg font-medium">Livestock Farming</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Cattle, poultry, swine, etc.
                    </div>
                  </button>
                </div>
              </div>

              {/* Location Input */}
              <div>
                <Label className="text-base font-medium mb-3 block">
                  Where&apos;s your farm located?
                </Label>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Input
                        type="text"
                        placeholder="Enter address or GPS coordinates (lat, lng)"
                        value={locationInput}
                        onChange={(e) => setLocationInput(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <Button
                      onClick={parseLocationInput}
                      disabled={!locationInput}
                      variant="outline"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Find
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-center">
                    <span className="text-sm text-gray-500 mx-4">or</span>
                  </div>
                  
                  <Button
                    onClick={getCurrentLocation}
                    disabled={detectingLocation}
                    variant="outline"
                    className="w-full"
                  >
                    {detectingLocation ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Locate className="h-4 w-4 mr-2" />
                    )}
                    Use My Current Location
                  </Button>
                </div>

                {/* Map Preview */}
                {showMap && (
                  <div className="mt-4 space-y-3">
                    <div className="bg-sage-50 p-4 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-5 w-5 text-sage-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-sage-800">
                            Location: {farm.location.lat.toFixed(4)}, {farm.location.lng.toFixed(4)}
                          </p>
                          {farm.location.address && (
                            <p className="text-sm text-sage-600">{farm.location.address}</p>
                          )}
                          <p className="text-xs text-sage-600 mt-1">
                            You can adjust this on the map in the next step
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Next:</strong> We&apos;ll show you a satellite view where you can adjust the location, 
                        zoom in/out, and we&apos;ll automatically detect your field boundaries.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Continue Button */}
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleLocationConfirm}
                  disabled={!farm.name || !showMap}
                  className="bg-sage-600 hover:bg-sage-700"
                >
                  Continue
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Product Selection */}
        {currentStep === 2 && (
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-2xl font-light">
                {farm.type === 'crops' ? 'What are you growing?' : 'What livestock do you raise?'}
              </CardTitle>
              <CardDescription>
                Select your primary {farm.type === 'crops' ? 'crop' : 'livestock type'} for this season. 
                You can add more later from your dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Auto-detected Fields Info */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      We detected {farm.detectedFields?.length || 4} fields on your property
                    </p>
                    <p className="text-sm text-green-700">
                      Total area: {farm.totalArea.toFixed(1)} acres
                    </p>
                  </div>
                </div>
              </div>

              {/* Primary Selection */}
              <div>
                <Label className="text-base font-medium mb-3 block">
                  Primary {farm.type === 'crops' ? 'Crop' : 'Livestock'}
                </Label>
                {regionalRecommendations?.region && (
                  <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800 font-medium">
                      📍 {regionalRecommendations.region} - Top Recommendations
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(farm.type === 'crops' ? cropOptions.primary : livestockOptions.primary).map((option: any) => (
                    <button
                      key={option.id}
                      onClick={() => handleProductSelection(option.id, true)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        farm.primaryProduct === option.id
                          ? 'border-sage-600 bg-sage-50 shadow-soft'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-3xl mb-2">{option.icon}</div>
                      <div className="text-sm font-medium">{option.name}</div>
                      {'season' in option && option.season && (
                        <div className="text-xs text-gray-600 mt-1">{option.season}</div>
                      )}
                      {'typical' in option && option.typical && (
                        <div className="text-xs text-gray-600 mt-1">{option.typical}</div>
                      )}
                      {regionalRecommendations && farm.type === 'crops' && (
                        <div className="text-xs text-green-600 mt-1 font-medium">
                          Recommended
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Secondary Selection (Optional) */}
              <div>
                <Label className="text-base font-medium mb-3 block">
                  Secondary {farm.type === 'crops' ? 'Crops' : 'Livestock'} (Optional)
                </Label>
                {farm.type === 'crops' && regionalRecommendations?.seasonal && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Seasonal Options</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(regionalRecommendations.seasonal).map(([season, crops]: [string, any]) => (
                        <div key={season} className="bg-gray-50 p-2 rounded">
                          <span className="font-medium capitalize">{season}:</span>
                          <div className="mt-1">
                            {crops.slice(0, 2).map((crop: any) => crop.name).join(', ')}
                            {crops.length > 2 && ` +${crops.length - 2} more`}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(farm.type === 'crops' ? cropOptions.secondary : livestockOptions.secondary).map((option: any) => (
                    <button
                      key={option.id}
                      onClick={() => handleProductSelection(option.id, false)}
                      className={`p-3 rounded-lg border transition-all ${
                        farm.secondaryProducts?.includes(option.id)
                          ? 'border-sage-600 bg-sage-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{option.icon}</span>
                        <div className="text-left">
                          <div className="text-sm font-medium">{option.name}</div>
                          {regionalRecommendations && farm.type === 'crops' && regionalRecommendations.secondary.find((c: any) => c.id === option.id) && (
                            <div className="text-xs text-blue-600">Regional match</div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Smart Recommendations */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Regional Insight:</strong> {regionalRecommendations ? regionalRecommendations.reasoning : `Based on your location, 
                  ${farm.type === 'crops' 
                    ? ' corn and soybeans are the most profitable crops in your area this season.'
                    : ' beef cattle operations have shown the highest returns in your region.'}`}
                </p>
                {regionalRecommendations?.region && (
                  <p className="text-xs text-blue-600 mt-2">
                    Agricultural Region: {regionalRecommendations.region}
                  </p>
                )}
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                >
                  Back
                </Button>
                <Button
                  onClick={() => setCurrentStep(3)}
                  disabled={!farm.primaryProduct}
                  className="bg-sage-600 hover:bg-sage-700"
                >
                  Continue
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Review & Create */}
        {currentStep === 3 && (
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-2xl font-light">Ready to launch your smart farm!</CardTitle>
              <CardDescription>
                Review your setup and create your farm. You can customize everything later from your dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Farm Summary */}
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">{farm.name}</h3>
                    <p className="text-sm text-gray-600 flex items-center mt-1">
                      {farm.type === 'crops' ? <Wheat className="h-4 w-4 mr-1" /> : <Users className="h-4 w-4 mr-1" />}
                      {farm.type === 'crops' ? 'Crop Farm' : 'Livestock Farm'}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    {farm.totalArea.toFixed(1)} acres
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Location:</span>
                    <p className="font-medium">{farm.location.lat.toFixed(4)}, {farm.location.lng.toFixed(4)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Fields Detected:</span>
                    <p className="font-medium">{farm.detectedFields?.length || 4} fields</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Primary {farm.type === 'crops' ? 'Crop' : 'Livestock'}:</span>
                    <p className="font-medium">
                      {farm.primaryProduct && (farm.type === 'crops' ? cropOptions : livestockOptions).primary.find(
                        (p: any) => p.id === farm.primaryProduct
                      )?.name}
                    </p>
                  </div>
                  {farm.secondaryProducts && farm.secondaryProducts.length > 0 && (
                    <div>
                      <span className="text-gray-600">Also {farm.type === 'crops' ? 'growing' : 'raising'}:</span>
                      <p className="font-medium">{farm.secondaryProducts.length} other types</p>
                    </div>
                  )}
                </div>
              </div>

              {/* What Happens Next */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Your farm will be ready with:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Satellite Monitoring Active</p>
                      <p className="text-xs text-gray-600">Weekly imagery & health analysis</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Weather Alerts Enabled</p>
                      <p className="text-xs text-gray-600">Real-time conditions & forecasts</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">AI Recommendations</p>
                      <p className="text-xs text-gray-600">
                        {farm.type === 'crops' ? 'Planting & harvest timing' : 'Feed & health optimization'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Financial Tracking</p>
                      <p className="text-xs text-gray-600">Cost & revenue management</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Start Tips */}
              <div className="bg-sage-50 border border-sage-200 rounded-lg p-4">
                <p className="text-sm text-sage-800">
                  <strong>Quick Start:</strong> After creation, you&apos;ll see your personalized dashboard with:
                </p>
                <ul className="text-sm text-sage-700 mt-2 space-y-1">
                  <li>• Current {farm.type === 'crops' ? 'crop health' : 'livestock'} status</li>
                  <li>• Today&apos;s weather and 7-day forecast</li>
                  <li>• Recommended actions for this week</li>
                  <li>• Quick setup tasks to complete your profile</li>
                </ul>
              </div>

              {/* Create Button */}
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="bg-sage-600 hover:bg-sage-700 px-8"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating Farm...
                    </>
                  ) : (
                    <>
                      Create Farm & Go to Dashboard
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Satellite Map Viewer Modal */}
      {showSatelliteViewer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
          <div className="min-h-screen px-4 py-8">
            <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-light text-sage-800">Adjust Your Farm Location</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      View satellite imagery, adjust location, and detect field boundaries
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowSatelliteViewer(false)}
                  >
                    Cancel
                  </Button>
                </div>
                
                <SatelliteMapViewer
                  initialLocation={farm.location}
                  onLocationChange={(location) => setFarm(prev => ({ ...prev, location }))}
                  onFieldsDetected={(fields) => setFarm(prev => ({ 
                    ...prev, 
                    detectedFields: fields,
                    totalArea: fields.reduce((sum, field) => sum + field.area, 0)
                  }))}
                  onBoundariesSet={(boundaries) => {
                    // Convert boundaries to a detected field for area calculation
                    if (boundaries.length >= 3) {
                      const mockField = {
                        id: 'user-marked-field',
                        area: 25.0, // Rough estimate - in production would calculate actual area
                        boundaries
                      };
                      setFarm(prev => ({
                        ...prev,
                        detectedFields: [mockField],
                        totalArea: mockField.area
                      }));
                    }
                  }}
                  showFieldDetection={true}
                  showBoundaryMarking={true}
                  height="600px"
                />
                
                <div className="mt-6 flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setShowSatelliteViewer(false)}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => handleSatelliteViewerComplete({ ...farm.location, zoom: 15 }, farm.detectedFields)}
                    className="bg-sage-600 hover:bg-sage-700"
                  >
                    Continue with This Location
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}