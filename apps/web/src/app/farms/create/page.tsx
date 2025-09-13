'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Badge } from '../../../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { DashboardLayout } from '../../../components/layout/dashboard-layout'
import { InteractiveFieldMap } from '../../../components/farm/interactive-field-map'
import { GoogleMapsFieldEditor } from '../../../components/farm/google-maps-field-editor'
import { getCropRecommendations, getLivestockRecommendations } from '../../../lib/farm/regional-crops'
import { COMPREHENSIVE_CROP_DATABASE, getCropsByCategory as getComprehensiveCropsByCategory, CROP_CATEGORIES } from '../../../lib/farm/comprehensive-crops'
import { 
  MapPin, Locate, Search, ChevronRight, CheckCircle, 
  Wheat, Users, Loader2, Navigation, Globe,
  Sprout, TreePine, Flower2, Sun, // Crop icons
  Beef, Egg, Fish, Bird, Truck, Building2, // Livestock icons
  TrendingUp, AlertCircle, Info
} from 'lucide-react'

interface Farm {
  name: string
  type: 'crops' | 'livestock'
  role: 'operator' | 'landowner'
  location: {
    lat: number
    lng: number
    address?: string
  }
  totalArea: number
  detectedFields?: Array<{
    id: string
    name: string
    area: number
    boundaries: Array<{ lat: number; lng: number }>
    centerLat: number
    centerLng: number
    confidence?: number
  }>
  primaryProduct?: string
  secondaryProducts?: string[]
  expectedProfitPerAcre?: number
  topCropRecommendations?: Array<{
    id: string
    name: string
    roi: number
    yieldPerAcre: number
  }>
}

export default function CreateFarmPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [farm, setFarm] = useState<Farm>({
    name: '',
    type: 'crops',
    role: 'operator',
    location: { lat: 0, lng: 0 },
    totalArea: 0
  })
  const [isLoading, setIsLoading] = useState(false)
  const [detectingLocation, setDetectingLocation] = useState(false)
  const [locationInput, setLocationInput] = useState('')
  const [showMap, setShowMap] = useState(false)
  const [regionalRecommendations, setRegionalRecommendations] = useState<any>(null)
  const [loadingRecommendations, setLoadingRecommendations] = useState(false)
  const [livestockCounts, setLivestockCounts] = useState<Record<string, number>>({})
  const [selectedCropCategory, setSelectedCropCategory] = useState<string>('')
  const [selectedSecondaryCropCategory, setSelectedSecondaryCropCategory] = useState<string>('')
  const router = useRouter()

  // Helper function to convert icon string to React component
  const getIconComponent = (iconName: string, size: string = "h-6 w-6") => {
    const iconMap: Record<string, React.ReactNode> = {
      'wheat': <Wheat className={size} />,
      'sprout': <Sprout className={size} />,
      'tree-pine': <TreePine className={size} />,
      'flower-2': <Flower2 className={size} />,
      'sun': <Sun className={size} />
    };
    return iconMap[iconName] || <Wheat className={size} />;
  };

  // Get crops organized by category from comprehensive database
  const cropsByCategory = getComprehensiveCropsByCategory();
  
  // Calculate ROI and profit comparisons for crops
  const calculateCropROI = (cropId: string): { roi: number; profitPerAcre: number } => {
    const crop = COMPREHENSIVE_CROP_DATABASE[cropId];
    if (!crop) return { roi: 0, profitPerAcre: 0 };
    
    const revenue = (crop.yield.typical || 150) * (crop.marketValue.avgPrice || 4);
    const costs = revenue * 0.7; // Assume 70% of revenue goes to costs
    const profit = revenue - costs;
    const roi = (profit / costs) * 100;
    
    return { roi, profitPerAcre: profit };
  };

  // Get top 3 crop recommendations with ROI
  const getTopCropRecommendations = () => {
    if (!regionalRecommendations?.primary) return [];
    
    return regionalRecommendations.primary.slice(0, 3).map((crop: any) => {
      const roiData = calculateCropROI(crop.id);
      return {
        id: crop.id,
        name: crop.name,
        roi: roiData.roi,
        yieldPerAcre: crop.yield?.typical || 150,
        profitPerAcre: roiData.profitPerAcre,
        icon: crop.icon
      };
    });
  };

  // Auto-fetch regional recommendations when location changes
  useEffect(() => {
    if (farm.location.lat !== 0 && farm.location.lng !== 0) {
      setLoadingRecommendations(true)
      // Small delay to show loading state
      setTimeout(() => {
        if (farm.type === 'crops') {
          const recommendations = getCropRecommendations(farm.location.lat, farm.location.lng, 'crops')
          setRegionalRecommendations(recommendations)
        } else {
          const recommendations = getLivestockRecommendations(farm.location.lat, farm.location.lng)
          setRegionalRecommendations(recommendations)
        }
        setLoadingRecommendations(false)
      }, 500)
    } else {
      setRegionalRecommendations(null)
      setLoadingRecommendations(false)
    }
  }, [farm.location.lat, farm.location.lng, farm.type])

  // Auto-select category when primary product exists
  useEffect(() => {
    if (farm.primaryProduct && COMPREHENSIVE_CROP_DATABASE[farm.primaryProduct]) {
      setSelectedCropCategory(COMPREHENSIVE_CROP_DATABASE[farm.primaryProduct].category)
    }
  }, [farm.primaryProduct])

  // Get crop options from regional recommendations or fallback to defaults
  const getCropOptions = () => {
    if (regionalRecommendations && farm.type === 'crops') {
      return {
        primary: regionalRecommendations.primary.slice(0, 4).map((crop: any) => ({
          id: crop.id,
          name: crop.name,
          icon: getIconComponent(crop.icon),
          season: `${crop.plantingWindow.start.replace('-', '/')} - ${crop.harvestWindow.end.replace('-', '/')}`
        })),
        secondary: regionalRecommendations.secondary.slice(0, 4).map((crop: any) => ({
          id: crop.id,
          name: crop.name,
          icon: getIconComponent(crop.icon, "h-5 w-5")
        }))
      }
    }
    // Fallback options
    return {
      primary: [
        { id: 'corn-field', name: 'Corn', icon: <Wheat className="h-6 w-6" />, season: 'Mar-Oct' },
        { id: 'soybeans', name: 'Soybeans', icon: <Sprout className="h-6 w-6" />, season: 'Apr-Sep' },
        { id: 'winter-wheat', name: 'Wheat', icon: <Wheat className="h-6 w-6" />, season: 'Sep-Jul' },
        { id: 'sunflowers', name: 'Sunflowers', icon: <Flower2 className="h-6 w-6" />, season: 'Apr-Nov' }
      ],
      secondary: [
        { id: 'sweet-corn', name: 'Sweet Corn', icon: <Wheat className="h-5 w-5" /> },
        { id: 'tomatoes', name: 'Tomatoes', icon: <Sun className="h-5 w-5" /> },
        { id: 'hemp-industrial', name: 'Hemp', icon: <TreePine className="h-5 w-5" /> },
        { id: 'vegetables', name: 'Vegetables', icon: <Sprout className="h-5 w-5" /> }
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
        { id: 'cattle-beef', name: 'Beef Cattle', icon: <Beef className="h-6 w-6" />, typical: '50-500 head' },
        { id: 'cattle-dairy', name: 'Dairy Cattle', icon: <Beef className="h-6 w-6" />, typical: '100-1000 head' },
        { id: 'poultry', name: 'Poultry', icon: <Bird className="h-6 w-6" />, typical: '1000+ birds' },
        { id: 'swine', name: 'Swine', icon: <Fish className="h-6 w-6" />, typical: '100-5000 head' }
      ],
      secondary: [
        { id: 'sheep', name: 'Sheep', icon: <Egg className="h-5 w-5" /> },
        { id: 'goats', name: 'Goats', icon: <Beef className="h-5 w-5" /> },
        { id: 'horses', name: 'Horses', icon: <Building2 className="h-5 w-5" /> },
        { id: 'mixed', name: 'Mixed Livestock', icon: <Truck className="h-5 w-5" /> }
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

  // Simulate field detection - now handled by GoogleMapsFieldEditor
  const detectFields = () => {
    // This is now handled by the GoogleMapsFieldEditor component
    // The component will call onFieldsDetected with properly formatted fields
    console.log('Field detection handled by GoogleMapsFieldEditor component')
  }

  // Calculate polygon area in hectares from lat/lng coordinates
  const calculatePolygonArea = (coordinates: Array<{ lat: number; lng: number }>): number => {
    if (coordinates.length < 3) return 0;
    
    // Using the Shoelace formula for calculating polygon area
    // Convert to meters for accurate area calculation
    const R = 6371000; // Earth's radius in meters
    let area = 0;
    
    for (let i = 0; i < coordinates.length; i++) {
      const j = (i + 1) % coordinates.length;
      const lat1 = coordinates[i].lat * Math.PI / 180;
      const lat2 = coordinates[j].lat * Math.PI / 180;
      const lng1 = coordinates[i].lng * Math.PI / 180;
      const lng2 = coordinates[j].lng * Math.PI / 180;
      
      area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2));
    }
    
    area = Math.abs(area * R * R / 2);
    // Convert from square meters to hectares
    return area / 10000;
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
          latitude: farm.location.lat,
          longitude: farm.location.lng,
          address: farm.location.address || '',
          country: 'US', // Default to US, in production would determine from coordinates
          totalArea: farm.totalArea,
          primaryProduct: farm.primaryProduct,
          metadata: {
            farmType: farm.type, // Store farm type in metadata since it's not in schema
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
              name: field.name || `Field ${index + 1}`,
              area: field.area,
              latitude: field.centerLat,
              longitude: field.centerLng,
              boundaries: field.boundaries
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
    <DashboardLayout>
      <main className="max-w-4xl mx-auto pt-8 pb-12 px-4 sm:px-6 lg:px-8">
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
            <CardContent className="space-y-8">
              {/* Farm Name */}
              <div>
                <Label htmlFor="farm-name" className="text-base font-medium text-sage-700">
                  What&apos;s your farm called?
                </Label>
                <Input
                  id="farm-name"
                  type="text"
                  placeholder="e.g., Smith Family Farm"
                  value={farm.name}
                  onChange={(e) => setFarm(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-3 text-lg h-12 border-sage-200 focus:border-sage-500 focus:ring-sage-500"
                  autoFocus
                />
              </div>

              {/* Role Selection */}
              <div>
                <Label className="text-base font-medium mb-3 block text-sage-700">
                  Are you an operator or landowner?
                </Label>
                <div className="grid grid-cols-2 gap-6">
                  <button
                    onClick={() => setFarm(prev => ({ ...prev, role: 'operator' }))}
                    className={`p-6 rounded-xl border-2 transition-all hover:shadow-md ${farm.role === 'operator'
                        ? 'border-green-700 bg-green-50 shadow-soft'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className="text-xl font-semibold mb-2">Farm Operator</div>
                    <div className="text-sm text-gray-600">
                      I actively manage the farming operations
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setFarm(prev => ({ ...prev, role: 'landowner' }))}
                    className={`p-6 rounded-xl border-2 transition-all hover:shadow-md ${farm.role === 'landowner'
                        ? 'border-green-700 bg-green-50 shadow-soft'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className="text-xl font-semibold mb-2">Landowner</div>
                    <div className="text-sm text-gray-600">
                      I own the land and lease it out
                    </div>
                  </button>
                </div>
              </div>

              {/* Farm Type Selection */}
              <div>
                <Label className="text-base font-medium mb-3 block text-sage-700">
                  What type of farming do you do?
                </Label>
                <div className="grid grid-cols-2 gap-6">
                  <button
                    onClick={() => setFarm(prev => ({ ...prev, type: 'crops' }))}
                    className={`p-8 rounded-xl border-2 transition-all hover:shadow-md ${
                      farm.type === 'crops'
                        ? 'border-green-700 bg-green-50 shadow-soft'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <Wheat className={`h-14 w-14 mx-auto mb-4 ${
                      farm.type === 'crops' ? 'text-green-700' : 'text-gray-400'
                    }`} />
                    <div className="text-xl font-semibold mb-2">Crop Farming</div>
                    <div className="text-sm text-gray-600">
                      Grains, vegetables, fruits, etc.
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setFarm(prev => ({ ...prev, type: 'livestock' }))}
                    className={`p-8 rounded-xl border-2 transition-all hover:shadow-md ${
                      farm.type === 'livestock'
                        ? 'border-green-700 bg-green-50 shadow-soft'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <Users className={`h-14 w-14 mx-auto mb-4 ${
                      farm.type === 'livestock' ? 'text-green-700' : 'text-gray-400'
                    }`} />
                    <div className="text-xl font-semibold mb-2">Livestock Farming</div>
                    <div className="text-sm text-gray-600">
                      Cattle, poultry, swine, etc.
                    </div>
                  </button>
                </div>
              </div>

              {/* Location Input */}
              <div>
                <Label className="text-base font-medium mb-3 block text-sage-700">
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
                        className="w-full border-sage-200 focus:border-sage-500 focus:ring-sage-500"
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
                  <div className="mt-4">
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-800">
                            Location: {farm.location.lat.toFixed(4)}, {farm.location.lng.toFixed(4)}
                          </p>
                          {farm.location.address && (
                            <p className="text-sm text-green-700 mb-2">{farm.location.address}</p>
                          )}
                          <p className="text-sm text-green-700">
                            <strong>Next:</strong> We&apos;ll show you a satellite view where you can adjust the location, 
                            zoom in/out, and automatically detect your field boundaries.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Google Maps Field Editor - Integrated */}
              {showMap && (
                <div className="mt-6 space-y-4">
                  <div className="border rounded-lg overflow-hidden">
                    <GoogleMapsFieldEditor
                      farmLocation={farm.location}
                      onFieldsDetected={(fields) => setFarm(prev => ({ 
                        ...prev, 
                        detectedFields: fields,
                        totalArea: fields.reduce((sum, field) => sum + field.area, 0)
                      }))}
                    />
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Tip:</strong> Use the Google Maps interface to precisely define your fields:
                      • Draw field boundaries using the drawing tools
                      • Auto-detect fields using satellite imagery analysis
                      • Edit and manage multiple fields within your farm
                      • All field data will be saved with your farm
                    </p>
                  </div>
                </div>
              )}

              {/* Continue Button */}
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => setCurrentStep(2)}
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
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content - Left Side */}
                <div className="lg:col-span-2 space-y-8">

                  {/* Primary Selection */}
                  <div>
                    <Label className="text-base font-medium text-sage-700 mb-3 block">
                      {farm.type === 'crops' ? "What's your main crop this season?" : "What livestock do you raise?"}
                    </Label>
                
                {farm.type === 'crops' ? (
                  <div className="space-y-4">
                    {/* Step-by-Step Crop Selection */}
                    <div className="space-y-4">
                      {/* Step 1: Select Crop Type/Category */}
                      <div>
                        <Label className="text-sm font-medium text-sage-700 mb-2 block">
                          What type of crops do you grow?
                        </Label>
                        <Select
                          value={selectedCropCategory || (farm.primaryProduct ? COMPREHENSIVE_CROP_DATABASE[farm.primaryProduct]?.category : '')}
                          onValueChange={(value) => {
                            setSelectedCropCategory(value);
                            if (farm.primaryProduct && COMPREHENSIVE_CROP_DATABASE[farm.primaryProduct]?.category !== value) {
                              setFarm(prev => ({ ...prev, primaryProduct: '' }));
                            }
                          }}
                        >
                          <SelectTrigger className="w-full h-auto py-3 border-sage-200 focus:border-sage-500 focus:ring-sage-500">
                            <SelectValue placeholder="Select a crop category...">
                              {selectedCropCategory && CROP_CATEGORIES[selectedCropCategory as keyof typeof CROP_CATEGORIES] && (
                                <div className="flex items-center space-x-3">
                                  <div className="text-sage-600">{getIconComponent(CROP_CATEGORIES[selectedCropCategory as keyof typeof CROP_CATEGORIES].icon, 'h-5 w-5')}</div>
                                  <div className="text-left">
                                    <div className="text-sm font-medium">{CROP_CATEGORIES[selectedCropCategory as keyof typeof CROP_CATEGORIES].name}</div>
                                    <div className="text-xs text-gray-500">{CROP_CATEGORIES[selectedCropCategory as keyof typeof CROP_CATEGORIES].description}</div>
                                  </div>
                                </div>
                              )}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(CROP_CATEGORIES).map(([categoryKey, category]) => (
                              <SelectItem key={categoryKey} value={categoryKey} className="py-3">
                                <div className="flex items-center space-x-3">
                                  <div className="text-sage-600 flex-shrink-0">{getIconComponent(category.icon, 'h-5 w-5')}</div>
                                  <div>
                                    <div className="text-sm font-medium">{category.name}</div>
                                    <div className="text-xs text-gray-500">{category.description}</div>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Step 2: Select Specific Crop */}
                      {selectedCropCategory && cropsByCategory[selectedCropCategory] && (
                        <div>
                          <Label className="text-sm font-medium text-sage-700 mb-2 block">
                            Which specific {CROP_CATEGORIES[selectedCropCategory as keyof typeof CROP_CATEGORIES]?.name || 'crop'} is your main one?
                          </Label>
                          <Select
                            value={farm.primaryProduct && cropsByCategory[selectedCropCategory].find((c: any) => c.id === farm.primaryProduct) ? farm.primaryProduct : ''}
                            onValueChange={(value) => handleProductSelection(value, true)}
                          >
                            <SelectTrigger className="w-full h-auto py-3 border-sage-200 focus:border-sage-500 focus:ring-sage-500">
                              <SelectValue placeholder={`Choose your ${CROP_CATEGORIES[selectedCropCategory as keyof typeof CROP_CATEGORIES]?.name || 'crop'}...`}>
                                {farm.primaryProduct && COMPREHENSIVE_CROP_DATABASE[farm.primaryProduct] && (
                                  <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center space-x-3">
                                      <div className="text-sage-600">{getIconComponent(COMPREHENSIVE_CROP_DATABASE[farm.primaryProduct].icon, 'h-5 w-5')}</div>
                                      <div className="text-left">
                                        <div className="text-sm font-medium">{COMPREHENSIVE_CROP_DATABASE[farm.primaryProduct].name}</div>
                                        <div className="text-xs text-gray-500 italic">{COMPREHENSIVE_CROP_DATABASE[farm.primaryProduct].scientificName}</div>
                                        <div className="text-xs text-blue-600">{COMPREHENSIVE_CROP_DATABASE[farm.primaryProduct].botanicalFamily}</div>
                                      </div>
                                    </div>
                                    <div className="text-right ml-4">
                                      <div className="text-xs text-gray-600">{COMPREHENSIVE_CROP_DATABASE[farm.primaryProduct].yield?.typical} {COMPREHENSIVE_CROP_DATABASE[farm.primaryProduct].yield?.unit}/acre</div>
                                      <div className="text-sm font-medium text-green-600">${COMPREHENSIVE_CROP_DATABASE[farm.primaryProduct].marketValue?.avgPrice}</div>
                                    </div>
                                  </div>
                                )}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="max-h-[400px]">
                              {cropsByCategory[selectedCropCategory].map((crop: any) => (
                                <SelectItem key={crop.id} value={crop.id} className="py-3">
                                  <div className="flex items-center justify-between w-full pr-2">
                                    <div className="flex items-center space-x-3 flex-1">
                                      <div className="flex-shrink-0 text-sage-600">{getIconComponent(crop.icon, 'h-5 w-5')}</div>
                                      <div className="min-w-0">
                                        <div className="text-sm font-medium">{crop.name}</div>
                                        <div className="text-xs text-gray-500 italic">{crop.scientificName}</div>
                                        <div className="text-xs text-blue-600">{crop.botanicalFamily}</div>
                                      </div>
                                    </div>
                                    <div className="text-right flex-shrink-0 ml-4">
                                      <div className="text-xs text-gray-600">{crop.yield?.typical} {crop.yield?.unit}/acre</div>
                                      <div className="text-sm font-medium text-green-600">${crop.marketValue?.avgPrice}</div>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>

                    {/* Selected Crop Details */}
                    {farm.primaryProduct && COMPREHENSIVE_CROP_DATABASE[farm.primaryProduct] && (
                      <div className="p-5 bg-sage-50 border border-sage-200 rounded-xl">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 mt-1">
                            {getIconComponent(COMPREHENSIVE_CROP_DATABASE[farm.primaryProduct].icon, 'h-8 w-8')}
                          </div>
                          <div className="flex-1">
                            <div className="mb-3">
                              <h4 className="text-lg font-semibold text-sage-900">
                                {COMPREHENSIVE_CROP_DATABASE[farm.primaryProduct].name}
                              </h4>
                              <p className="text-sm text-sage-700 italic">
                                {COMPREHENSIVE_CROP_DATABASE[farm.primaryProduct].scientificName}
                              </p>
                              <p className="text-xs text-blue-600 font-medium">
                                Family: {COMPREHENSIVE_CROP_DATABASE[farm.primaryProduct].botanicalFamily}
                              </p>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                              <div>
                                <span className="font-medium text-gray-700">Planting Season:</span>
                                <p className="text-sage-800">{COMPREHENSIVE_CROP_DATABASE[farm.primaryProduct].plantingWindow.optimal}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Expected Yield:</span>
                                <p className="text-sage-800">{COMPREHENSIVE_CROP_DATABASE[farm.primaryProduct].yield.typical} {COMPREHENSIVE_CROP_DATABASE[farm.primaryProduct].yield.unit}/acre</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Expected Profit:</span>
                                <p className="text-green-700 font-bold text-lg">${calculateCropROI(farm.primaryProduct).profitPerAcre.toFixed(0)}/acre</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Market Value:</span>
                                <p className="text-green-700 font-medium">${COMPREHENSIVE_CROP_DATABASE[farm.primaryProduct].marketValue.avgPrice}/{COMPREHENSIVE_CROP_DATABASE[farm.primaryProduct].yield.unit}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Growing Season:</span>
                                <p className="text-sage-800">{COMPREHENSIVE_CROP_DATABASE[farm.primaryProduct].harvestWindow.duration} days</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">ROI:</span>
                                <p className="text-blue-700 font-medium">{calculateCropROI(farm.primaryProduct).roi.toFixed(0)}%</p>
                              </div>
                            </div>

                            {/* Total Expected Profit */}
                            {farm.totalArea > 0 && (
                              <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg">
                                <div className="text-center">
                                  <div className="text-sm font-medium text-green-800">Total Expected Profit for {farm.totalArea.toFixed(0)} acres</div>
                                  <div className="text-2xl font-bold text-green-700">
                                    ${(calculateCropROI(farm.primaryProduct).profitPerAcre * farm.totalArea).toLocaleString()}
                                  </div>
                                  <div className="text-xs text-green-600 mt-1">
                                    Based on current market prices and typical yields
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Key Benefits */}
                            {COMPREHENSIVE_CROP_DATABASE[farm.primaryProduct].benefits.length > 0 && (
                              <div className="mt-3 p-2 bg-white/60 rounded-lg">
                                <span className="text-xs font-medium text-gray-700">Key Benefits:</span>
                                <p className="text-xs text-sage-700 mt-1">
                                  {COMPREHENSIVE_CROP_DATABASE[farm.primaryProduct].benefits.slice(0, 3).join(' • ')}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Livestock selection (keep existing format)
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {livestockOptions.primary.map((option: any) => (
                      <button
                        key={option.id}
                        onClick={() => handleProductSelection(option.id, true)}
                        className={`p-5 rounded-xl border-2 transition-all hover:shadow-md ${
                          farm.primaryProduct === option.id
                            ? 'border-sage-600 bg-sage-50 shadow-soft'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex justify-center mb-2 text-gray-600">{option.icon}</div>
                        <div className="text-sm font-medium">{option.name}</div>
                        <div className="text-xs text-gray-600 mt-1">{option.typical}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Expanded Livestock Flow */}
              {farm.type === 'livestock' && farm.primaryProduct && (
                <div className="space-y-6">
                  {/* Herd Size Selection */}
                  <div>
                    <Label className="text-base font-medium mb-3 block">
                      How many {livestockOptions.primary.find((option: any) => option.id === farm.primaryProduct)?.name.toLowerCase()} do you plan to raise?
                    </Label>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                      {[10, 25, 50, 100, 250, 500, 1000, 2500].map((count) => (
                        <button
                          key={count}
                          onClick={() => setLivestockCounts(prev => ({ ...prev, [farm.primaryProduct!]: count }))}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            livestockCounts[farm.primaryProduct!] === count
                              ? 'border-sage-600 bg-sage-50 shadow-soft'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-lg font-semibold">{count}+</div>
                          <div className="text-xs text-gray-600">head</div>
                        </button>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center space-x-4">
                      <Input
                        type="number"
                        placeholder="Custom amount"
                        value={livestockCounts[farm.primaryProduct!] || ''}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          setLivestockCounts(prev => ({ ...prev, [farm.primaryProduct!]: value }));
                        }}
                        className="w-32"
                        min="1"
                      />
                      <span className="text-sm text-gray-600">or enter custom amount</span>
                    </div>
                  </div>

                  {/* Farming Goals */}
                  {livestockCounts[farm.primaryProduct!] && (
                    <div>
                      <Label className="text-base font-medium mb-3 block">
                        What's your main goal with these animals?
                      </Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {farm.primaryProduct.includes('cattle') ? (
                          <>
                            <div className="p-4 border-2 border-gray-200 rounded-lg hover:border-sage-300 cursor-pointer">
                              <div className="font-semibold text-sm mb-1">Beef Production</div>
                              <div className="text-xs text-gray-600">Raising cattle for meat</div>
                            </div>
                            <div className="p-4 border-2 border-gray-200 rounded-lg hover:border-sage-300 cursor-pointer">
                              <div className="font-semibold text-sm mb-1">Dairy Production</div>
                              <div className="text-xs text-gray-600">Milk and dairy products</div>
                            </div>
                            <div className="p-4 border-2 border-gray-200 rounded-lg hover:border-sage-300 cursor-pointer">
                              <div className="font-semibold text-sm mb-1">Breeding Stock</div>
                              <div className="text-xs text-gray-600">Selling breeding animals</div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="p-4 border-2 border-gray-200 rounded-lg hover:border-sage-300 cursor-pointer">
                              <div className="font-semibold text-sm mb-1">Meat Production</div>
                              <div className="text-xs text-gray-600">Primary meat source</div>
                            </div>
                            <div className="p-4 border-2 border-gray-200 rounded-lg hover:border-sage-300 cursor-pointer">
                              <div className="font-semibold text-sm mb-1">Breeding Program</div>
                              <div className="text-xs text-gray-600">Genetics and breeding</div>
                            </div>
                            <div className="p-4 border-2 border-gray-200 rounded-lg hover:border-sage-300 cursor-pointer">
                              <div className="font-semibold text-sm mb-1">Mixed Purpose</div>
                              <div className="text-xs text-gray-600">Multiple revenue streams</div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Feed Strategy Suggestions */}
                  {livestockCounts[farm.primaryProduct!] && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-green-800 mb-2">
                        💡 Smart Feed Strategy for {livestockCounts[farm.primaryProduct!]} {livestockOptions.primary.find((option: any) => option.id === farm.primaryProduct)?.name}
                      </h4>
                      <div className="space-y-2 text-sm text-green-700">
                        <div>• You'll need approximately {Math.ceil((livestockCounts[farm.primaryProduct!] * 2.5) / 100) * 100} lbs of feed per day</div>
                        <div>• Consider rotational grazing across {Math.ceil(farm.totalArea / 10)} paddocks</div>
                        <div>• Recommended pasture: {Math.ceil(livestockCounts[farm.primaryProduct!] * 1.5)} acres for optimal grazing</div>
                        {farm.primaryProduct.includes('cattle') && (
                          <div>• Supplement with hay during winter months (est. {Math.ceil(livestockCounts[farm.primaryProduct!] * 4)} tons/year)</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

                  {/* Secondary Selection (Optional) */}
                  <div>
                    <Label className="text-base font-medium text-sage-700 mb-3 block">
                      Secondary {farm.type === 'crops' ? 'Crops' : 'Livestock'} (Optional)
                    </Label>
                
                {farm.type === 'crops' ? (
                  <div className="space-y-4">
                    {/* Smart Rotation Recommendations */}
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="text-sm font-semibold text-green-800 mb-2">💡 Smart Rotation Strategy</h4>
                      {farm.primaryProduct && COMPREHENSIVE_CROP_DATABASE[farm.primaryProduct] ? (
                        <div className="space-y-2 text-sm text-green-700">
                          <div>
                            <span className="font-medium">After {COMPREHENSIVE_CROP_DATABASE[farm.primaryProduct].name}:</span>
                          </div>
                          <div>• Plant soybeans → improves soil nitrogen, saves $75/acre in fertilizer</div>
                          <div>• Consider cover crops → prevents erosion, adds organic matter</div>
                          <div>• Rotate every 2-3 seasons → breaks pest cycles, improves yields</div>
                          {farm.totalArea > 50 && (
                            <div>• With {farm.totalArea.toFixed(0)} acres, split into 3 sections for optimal rotation</div>
                          )}
                          <div className="mt-3 p-2 bg-white/60 rounded border border-green-300">
                            <span className="font-medium text-green-800">Expected benefit:</span>
                            <div className="text-green-700">15-20% yield increase + $50-75/acre cost savings</div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-green-700">
                          Select your main crop above to see personalized rotation recommendations
                        </div>
                      )}
                    </div>
                    
                    {/* Step-by-Step Secondary Crop Selection */}
                    <div className="space-y-4">
                      {/* Step 1: Select Secondary Crop Type */}
                      <div>
                        <Label className="text-sm font-medium text-sage-700 mb-2 block">
                          Step 1: Select Secondary Crop Type
                        </Label>
                        <Select
                          value={selectedSecondaryCropCategory}
                          onValueChange={(value) => setSelectedSecondaryCropCategory(value)}
                        >
                          <SelectTrigger className="w-full h-auto py-3 border-sage-200 focus:border-sage-500 focus:ring-sage-500">
                            <SelectValue placeholder="Select a crop category for rotation...">
                              {selectedSecondaryCropCategory && CROP_CATEGORIES[selectedSecondaryCropCategory as keyof typeof CROP_CATEGORIES] && (
                                <div className="flex items-center space-x-3">
                                  <div className="text-sage-600">{getIconComponent(CROP_CATEGORIES[selectedSecondaryCropCategory as keyof typeof CROP_CATEGORIES].icon, 'h-5 w-5')}</div>
                                  <div className="text-left">
                                    <div className="text-sm font-medium">{CROP_CATEGORIES[selectedSecondaryCropCategory as keyof typeof CROP_CATEGORIES].name}</div>
                                    <div className="text-xs text-gray-500">{CROP_CATEGORIES[selectedSecondaryCropCategory as keyof typeof CROP_CATEGORIES].description}</div>
                                  </div>
                                </div>
                              )}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(CROP_CATEGORIES).map(([categoryKey, category]) => (
                              <SelectItem key={categoryKey} value={categoryKey} className="py-3">
                                <div className="flex items-center space-x-3">
                                  <div className="text-sage-600 flex-shrink-0">{getIconComponent(category.icon, 'h-5 w-5')}</div>
                                  <div>
                                    <div className="text-sm font-medium">{category.name}</div>
                                    <div className="text-xs text-gray-500">{category.description}</div>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Step 2: Select Specific Secondary Crop */}
                      {selectedSecondaryCropCategory && cropsByCategory[selectedSecondaryCropCategory] && (
                        <div>
                          <Label className="text-sm font-medium text-sage-700 mb-2 block">
                            Step 2: Select Specific {CROP_CATEGORIES[selectedSecondaryCropCategory as keyof typeof CROP_CATEGORIES]?.name || 'Crop'} for Rotation
                          </Label>
                          <Select
                            value=""
                            onValueChange={(value) => {
                              handleProductSelection(value, false);
                              setSelectedSecondaryCropCategory('');
                            }}
                          >
                            <SelectTrigger className="w-full h-auto py-3 border-sage-200 focus:border-sage-500 focus:ring-sage-500">
                              <SelectValue placeholder={`Choose secondary ${CROP_CATEGORIES[selectedSecondaryCropCategory as keyof typeof CROP_CATEGORIES]?.name || 'crop'}...`} />
                            </SelectTrigger>
                            <SelectContent className="max-h-[400px]">
                              {cropsByCategory[selectedSecondaryCropCategory]
                                .filter((crop: any) => crop.id !== farm.primaryProduct && !farm.secondaryProducts?.includes(crop.id))
                                .map((crop: any) => (
                                  <SelectItem key={crop.id} value={crop.id} className="py-3">
                                    <div className="flex items-center justify-between w-full pr-2">
                                      <div className="flex items-center space-x-3 flex-1">
                                        <div className="flex-shrink-0 text-sage-600">{getIconComponent(crop.icon, 'h-5 w-5')}</div>
                                        <div className="min-w-0">
                                          <div className="text-sm font-medium">{crop.name}</div>
                                          <div className="text-xs text-gray-500 italic">{crop.scientificName}</div>
                                          <div className="text-xs text-blue-600">Good for rotation • {crop.botanicalFamily}</div>
                                        </div>
                                      </div>
                                      <div className="text-right flex-shrink-0 ml-4">
                                        <div className="text-xs text-gray-600">{crop.yield?.typical} {crop.yield?.unit}/acre</div>
                                        <div className="text-sm font-medium text-green-600">${crop.marketValue?.avgPrice}</div>
                                      </div>
                                    </div>
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                    
                    {/* Selected Secondary Crops */}
                    {farm.secondaryProducts && farm.secondaryProducts.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Selected Secondary Crops:</Label>
                        <div className="flex flex-wrap gap-2">
                          {farm.secondaryProducts.map(productId => {
                            const crop = COMPREHENSIVE_CROP_DATABASE[productId];
                            if (!crop) return null;
                            return (
                              <div key={productId} className="flex items-center space-x-2 bg-sage-100 px-3 py-2 rounded-full border border-sage-200">
                                {getIconComponent(crop.icon, "h-4 w-4")}
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium">{crop.name}</span>
                                  <span className="text-xs text-gray-500 italic">{crop.botanicalFamily}</span>
                                </div>
                                <button
                                  onClick={() => {
                                    setFarm(prev => ({
                                      ...prev,
                                      secondaryProducts: prev.secondaryProducts?.filter(p => p !== productId)
                                    }));
                                  }}
                                  className="text-gray-500 hover:text-red-500 ml-1 text-lg"
                                  title="Remove crop"
                                >
                                  ×
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Livestock secondary selection (keep existing)
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {livestockOptions.secondary.map((option: any) => (
                      <button
                        key={option.id}
                        onClick={() => handleProductSelection(option.id, false)}
                        className={`p-4 rounded-xl border-2 transition-all hover:shadow-sm ${
                          farm.secondaryProducts?.includes(option.id)
                            ? 'border-sage-600 bg-sage-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <div className="text-gray-600">{option.icon}</div>
                          <div className="text-left">
                            <div className="text-sm font-medium">{option.name}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

                </div>
                
                {/* Right Sidebar - AI Suggestions & Pre-populated Info */}
                <div className="lg:col-span-1 space-y-6">
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

                  {/* Regional Recommendations Banner */}
                  {(loadingRecommendations || regionalRecommendations?.region) && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                      {loadingRecommendations ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                          <p className="text-sm text-blue-800">
                            Analyzing your location for regional crop recommendations...
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center space-x-2 mb-2">
                            <MapPin className="h-4 w-4 text-blue-600" />
                            <p className="text-sm text-blue-800 font-medium">
                              {regionalRecommendations.region} - Recommended for your location
                            </p>
                          </div>
                          <div className="space-y-2">
                            {regionalRecommendations.primary.slice(0, 3).map((crop: any) => (
                              <div key={crop.id} className="text-xs bg-white/60 px-2 py-1 rounded flex justify-between">
                                <span className="font-medium">{crop.name}</span>
                                <span className="text-gray-600">{crop.yield?.typical} {crop.yield?.unit}/acre</span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* AI-Powered Recommendations */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <TrendingUp className="h-5 w-5 text-blue-600 mt-1" />
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-blue-900 mb-2">
                          🤖 Best Crops for Your Land (AI Suggestion)
                        </h4>
                        
                        {farm.type === 'crops' && regionalRecommendations ? (
                          <div className="space-y-3">
                            <p className="text-xs text-blue-800 leading-relaxed">
                              Based on your location, here are the top 3 most profitable crops:
                            </p>
                            
                            {/* Top 3 Crop ROI Comparison */}
                            <div className="space-y-2">
                              {getTopCropRecommendations().map((crop: any, index: number) => (
                                <div key={crop.id} className="bg-white/60 p-3 rounded-lg border border-blue-200">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                        index === 0 ? 'bg-yellow-200 text-yellow-800' :
                                        index === 1 ? 'bg-gray-200 text-gray-800' :
                                        'bg-orange-200 text-orange-800'
                                      }`}>
                                        {index + 1}
                                      </span>
                                      <div>
                                        <div className="text-sm font-semibold text-blue-900">{crop.name}</div>
                                        <div className="text-xs text-blue-700">{crop.yieldPerAcre} bu/acre</div>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-sm font-bold text-green-700">${crop.profitPerAcre.toFixed(0)}/acre</div>
                                      <div className="text-xs text-blue-600">{crop.roi.toFixed(0)}% ROI</div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            <div className="text-xs text-blue-700 italic">
                              💡 Tip: {getTopCropRecommendations()[0]?.name} typically nets ${getTopCropRecommendations()[0]?.profitPerAcre.toFixed(0) || '400'} more per acre than {getTopCropRecommendations()[2]?.name || 'other crops'}
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-blue-800 leading-relaxed">
                            {regionalRecommendations ? regionalRecommendations.reasoning : 
                              farm.location.lat !== 0 && farm.location.lng !== 0 ? 
                                `Analyzing agricultural conditions for your location...` :
                                `Please set your farm location to receive personalized insights.`
                            }
                            {farm.type === 'livestock' && livestockCounts[farm.primaryProduct!] && (
                              ` With ${livestockCounts[farm.primaryProduct!]} head, you'll need approximately ${Math.ceil(farm.totalArea * 0.5)} acres of pasture.`
                            )}
                          </p>
                        )}
                        {regionalRecommendations?.region && (
                          <div className="mt-3 p-2 bg-white/60 rounded-lg">
                            <div className="space-y-1 text-xs">
                              <div>
                                <span className="font-medium text-gray-700">Region:</span>
                                <p className="text-blue-800">{regionalRecommendations.region}</p>
                              </div>
                              {regionalRecommendations.primary && regionalRecommendations.primary.length > 0 && (
                                <div>
                                  <span className="font-medium text-gray-700">Best ROI:</span>
                                  <p className="text-green-700">{regionalRecommendations.primary[0].name}</p>
                                </div>
                              )}
                              {farm.type === 'livestock' && livestockCounts[farm.primaryProduct!] && (
                                <div>
                                  <span className="font-medium text-gray-700">Stock Count:</span>
                                  <p className="text-purple-700">{livestockCounts[farm.primaryProduct!]} head</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        <div className="mt-3 flex items-center text-xs text-blue-600">
                          <Info className="h-3 w-3 mr-1" />
                          Based on climate, soil & market data
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Field Creation Options */}
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                      <Building2 className="h-4 w-4 mr-2 text-gray-600" />
                      Field Management
                    </h4>
                    <p className="text-xs text-gray-700 mb-3">
                      Organize your {farm.totalArea.toFixed(1)}-acre farm
                    </p>
                    <div className="space-y-2">
                      <div className="p-3 bg-white rounded-lg border border-gray-200 hover:border-sage-300 transition-all cursor-pointer">
                        <div className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                          <div>
                            <div className="font-medium text-xs">Single Field</div>
                            <div className="text-xs text-gray-600">Simpler management</div>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-gray-200 hover:border-sage-300 transition-all cursor-pointer">
                        <div className="flex items-start space-x-2">
                          <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5" />
                          <div>
                            <div className="font-medium text-xs">Multiple Fields</div>
                            <div className="text-xs text-gray-600">Advanced rotation</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-gray-600 flex items-center">
                      <Info className="h-3 w-3 mr-1" />
                      Modify later from dashboard
                    </div>
                  </div>
                </div>
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
            <CardContent className="space-y-8">
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
    </DashboardLayout>
  )
}