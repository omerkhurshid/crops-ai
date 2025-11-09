'use client'
import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ModernCard, ModernCardContent, ModernCardDescription, ModernCardHeader, ModernCardTitle } from '../ui/modern-card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { 
  MapPin, Locate, Search, Loader2, CheckCircle,
  Wheat, Beef, TreePine, Apple, Flower2, 
  AlertCircle, Satellite, Plus, Sprout, Trash2, Edit, RotateCcw,
  ChevronRight, ChevronLeft, Map
} from 'lucide-react'
import { GoogleMap, LoadScript, Polygon, DrawingManager, Marker } from '@react-google-maps/api'
import { Alert, AlertDescription } from '../ui/alert'
import { useSession } from '../../lib/auth-unified'

const libraries: ("drawing" | "geometry")[] = ["drawing", "geometry"]

interface Coordinates {
  lat: number
  lng: number
}

interface Field {
  id: string
  name: string
  area: number
  boundaries: Coordinates[]
  color: string
  cropType?: string
  cropVariety?: string
  fieldType?: 'crop' | 'livestock'
  selectedCategory?: string
}

interface Farm {
  name: string
  location: { lat: number; lng: number; address?: string }
  totalArea?: number
  boundaries?: Coordinates[]
  isMultiField: boolean
  fields: Field[]
}

interface CropOption {
  id: string
  name: string
  category: string
  scientificName?: string
}

const fieldColors = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6b7280',
  '#1e40af', '#047857', '#b45309', '#dc2626', '#7c3aed'
]

// Mock crop data - replace with API call
const mockCrops: CropOption[] = [
  { id: '1', name: 'Corn', category: 'Grains', scientificName: 'Zea mays' },
  { id: '2', name: 'Soybeans', category: 'Legumes', scientificName: 'Glycine max' },
  { id: '3', name: 'Wheat', category: 'Grains', scientificName: 'Triticum aestivum' },
  { id: '4', name: 'Tomatoes', category: 'Vegetables', scientificName: 'Solanum lycopersicum' },
  { id: '5', name: 'Cotton', category: 'Cash Crops', scientificName: 'Gossypium' },
  { id: '6', name: 'Rice', category: 'Grains', scientificName: 'Oryza sativa' },
  { id: '7', name: 'Potatoes', category: 'Vegetables', scientificName: 'Solanum tuberosum' },
  { id: '8', name: 'Apples', category: 'Fruits', scientificName: 'Malus domestica' },
]

export function ThreeStepFarmCreator() {
  const [currentStep, setCurrentStep] = useState(1)
  const [farm, setFarm] = useState<Farm>({
    name: '',
    location: { lat: 0, lng: 0 },
    isMultiField: false,
    fields: []
  })
  const [locationInput, setLocationInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [detectingLocation, setDetectingLocation] = useState(false)
  const [geocodingLocation, setGeocodingLocation] = useState(false)
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [drawingManager, setDrawingManager] = useState<google.maps.drawing.DrawingManager | null>(null)
  const [drawingMode, setDrawingMode] = useState<'farm' | 'field'>('farm')
  const [activeFieldIndex, setActiveFieldIndex] = useState(-1)
  const [crops, setCrops] = useState<CropOption[]>(mockCrops)
  const [groupedCrops, setGroupedCrops] = useState<Record<string, CropOption[]>>({})
  
  const router = useRouter()
  const { data: session, status } = useSession()
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  // Load crops from API
  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const response = await fetch('/api/crop-types')
        if (response.ok) {
          const data = await response.json()
          if (data.crops) {
            setCrops(data.crops)
          }
          if (data.groupedCrops) {
            setGroupedCrops(data.groupedCrops)
          }
        }
      } catch (error) {
        console.error('Error loading crops:', error)
        // Keep using mock data
      }
    }
    fetchCrops()
  }, [])

  const getCurrentLocation = () => {
    setDetectingLocation(true)
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          try {
            const response = await fetch(`/api/weather/reverse-geocoding?latitude=${lat}&longitude=${lng}&limit=1`)
            if (response.ok) {
              const data = await response.json()
              const locationName = data.results?.[0]?.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
              setFarm(prev => ({
                ...prev,
                location: { lat, lng, address: locationName }
              }))
              setLocationInput(locationName)
            } else {
              setFarm(prev => ({ ...prev, location: { lat, lng } }))
              setLocationInput(`${lat.toFixed(4)}, ${lng.toFixed(4)}`)
            }
          } catch (error) {
            console.error('Error getting location name:', error)
            setFarm(prev => ({ ...prev, location: { lat, lng } }))
            setLocationInput(`${lat.toFixed(4)}, ${lng.toFixed(4)}`)
          }
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
      alert('Geolocation is not supported by this browser.')
    }
  }

  const parseLocationInput = async () => {
    if (!locationInput.trim()) return
    setGeocodingLocation(true)
    
    const coordPattern = /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/
    if (coordPattern.test(locationInput.trim())) {
      const [lat, lng] = locationInput.split(',').map(coord => parseFloat(coord.trim()))
      try {
        const response = await fetch(`/api/weather/reverse-geocoding?latitude=${lat}&longitude=${lng}&limit=1`)
        if (response.ok) {
          const data = await response.json()
          const locationName = data.results?.[0]?.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
          setFarm(prev => ({ ...prev, location: { lat, lng, address: locationName } }))
        } else {
          setFarm(prev => ({ ...prev, location: { lat, lng } }))
        }
      } catch (error) {
        setFarm(prev => ({ ...prev, location: { lat, lng } }))
      }
    } else {
      try {
        const response = await fetch(`/api/weather/geocoding?address=${encodeURIComponent(locationInput.trim())}&limit=1`)
        if (response.ok) {
          const data = await response.json()
          if (data.results && data.results.length > 0) {
            const result = data.results[0]
            setFarm(prev => ({
              ...prev,
              location: { lat: result.lat, lng: result.lon, address: result.display_name || locationInput }
            }))
          } else {
            alert('Location not found. Please try a different address.')
            setGeocodingLocation(false)
            return
          }
        }
      } catch (error) {
        console.error('Geocoding error:', error)
        alert('Error finding location. Please try again.')
        setGeocodingLocation(false)
        return
      }
    }
    setGeocodingLocation(false)
  }

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
    let attempts = 0
    const maxAttempts = 100
    const checkGoogleMapsReady = () => {
      if (window.google?.maps?.geometry && window.google?.maps?.drawing) {
        console.log('Google Maps APIs loaded successfully')
        setGoogleMapsLoaded(true)
      } else if (attempts < maxAttempts) {
        attempts++
        setTimeout(checkGoogleMapsReady, 100)
      } else {
        console.error('Google Maps APIs failed to load within timeout')
      }
    }
    checkGoogleMapsReady()
  }, [])

  const onDrawingManagerLoad = useCallback((drawingManager: google.maps.drawing.DrawingManager) => {
    setDrawingManager(drawingManager)
  }, [])

  const calculateArea = useCallback((coordinates: Coordinates[]) => {
    if (!window.google?.maps?.geometry || coordinates.length < 3) return 0
    
    const path = new google.maps.MVCArray()
    coordinates.forEach(coord => {
      path.push(new google.maps.LatLng(coord.lat, coord.lng))
    })
    
    const area = window.google.maps.geometry.spherical.computeArea(path)
    return Math.round(area / 4047) // Convert to acres
  }, [])

  const onFarmBoundaryComplete = useCallback((polygon: google.maps.Polygon) => {
    if (!window.google?.maps?.geometry || !googleMapsLoaded) return
    
    try {
      const path = polygon.getPath()
      const coordinates: Coordinates[] = []
      for (let i = 0; i < path.getLength(); i++) {
        const latLng = path.getAt(i)
        coordinates.push({ lat: latLng.lat(), lng: latLng.lng() })
      }
      
      const area = calculateArea(coordinates)
      setFarm(prev => ({
        ...prev,
        boundaries: coordinates,
        totalArea: area
      }))
      
      console.log('Farm boundary created:', area, 'acres')
      polygon.setMap(null)
      if (drawingManager) {
        drawingManager.setDrawingMode(null)
      }
    } catch (error) {
      console.error('Error creating farm boundary:', error)
    }
  }, [drawingManager, googleMapsLoaded, calculateArea])

  const onFieldBoundaryComplete = useCallback((polygon: google.maps.Polygon) => {
    if (!window.google?.maps?.geometry || !googleMapsLoaded) return
    
    try {
      const path = polygon.getPath()
      const coordinates: Coordinates[] = []
      for (let i = 0; i < path.getLength(); i++) {
        const latLng = path.getAt(i)
        coordinates.push({ lat: latLng.lat(), lng: latLng.lng() })
      }
      
      const area = calculateArea(coordinates)
      const newField: Field = {
        id: `field-${Date.now()}`,
        name: `Field ${farm.fields.length + 1}`,
        area,
        boundaries: coordinates,
        color: fieldColors[farm.fields.length % fieldColors.length]
      }
      
      setFarm(prev => ({
        ...prev,
        fields: [...prev.fields, newField]
      }))
      
      console.log('Field created:', newField.name, area, 'acres')
      polygon.setMap(null)
      if (drawingManager) {
        drawingManager.setDrawingMode(null)
      }
    } catch (error) {
      console.error('Error creating field boundary:', error)
    }
  }, [drawingManager, googleMapsLoaded, calculateArea, farm.fields.length])

  const deleteField = (fieldId: string) => {
    setFarm(prev => ({
      ...prev,
      fields: prev.fields.filter(f => f.id !== fieldId)
    }))
  }

  const updateFieldCrop = (fieldId: string, cropId: string) => {
    const crop = crops.find(c => c.id === cropId)
    setFarm(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === fieldId 
          ? { ...field, cropType: crop?.name, cropVariety: crop?.scientificName }
          : field
      )
    }))
  }

  const updateFieldName = (fieldId: string, name: string) => {
    setFarm(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === fieldId ? { ...field, name } : field
      )
    }))
  }

  const submitFarm = async () => {
    setIsLoading(true)
    try {
      // Check session before making the API call
      if (status !== 'authenticated' || !session) {
        throw new Error('Please sign in to create a farm')
      }

      const response = await fetch('/api/farms', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: farm.name,
          latitude: farm.location.lat,
          longitude: farm.location.lng,
          address: farm.location.address || '',
          country: 'US',
          totalArea: farm.totalArea || 0,
          boundaries: farm.boundaries,
          fields: farm.fields.map(field => ({
            name: field.name,
            area: field.area,
            boundaries: field.boundaries,
            color: field.color,
            cropType: field.cropType,
            status: 'active'
          }))
        })
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Your session has expired. Please sign in again.')
        }
        const errorText = await response.text()
        console.error('Farm creation failed:', response.status, errorText)
        throw new Error(`Failed to create farm: ${response.status}`)
      }
      
      router.push('/dashboard')
    } catch (error) {
      console.error('Error creating farm:', error)
      const message = error instanceof Error ? error.message : 'An error occurred. Please try again.'
      alert(message) // Replace with proper toast/notification system
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const canProceedStep1 = farm.name.length >= 2
  const canProceedStep2 = farm.location.lat !== 0 && farm.boundaries && farm.boundaries.length >= 3

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
              step === currentStep 
                ? 'bg-sage-600 text-white' 
                : step < currentStep 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
            }`}>
              {step < currentStep ? <CheckCircle className="h-5 w-5" /> : step}
            </div>
            {step < 3 && (
              <div className={`w-20 h-1 mx-2 ${
                step < currentStep ? 'bg-green-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Farm Name */}
      {currentStep === 1 && (
        <ModernCard variant="soft" className="max-w-2xl mx-auto">
          <ModernCardHeader className="text-center">
            <ModernCardTitle className="text-2xl">What's your farm called?</ModernCardTitle>
            <ModernCardDescription>
              Give your farm a name to get started
            </ModernCardDescription>
          </ModernCardHeader>
          <ModernCardContent className="space-y-6">
            <div>
              <Label htmlFor="farm-name" className="text-lg">Farm Name</Label>
              <Input
                id="farm-name"
                placeholder="e.g., Smith Family Farm, Green Acres, Oak Hill Ranch"
                value={farm.name}
                onChange={(e) => setFarm(prev => ({ ...prev, name: e.target.value }))}
                className="mt-2 text-lg p-4"
                autoFocus
              />
            </div>
            <div className="flex justify-end">
              <Button 
                onClick={nextStep} 
                disabled={!canProceedStep1}
                className="bg-sage-600 hover:bg-sage-700"
              >
                Continue <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </ModernCardContent>
        </ModernCard>
      )}

      {/* Step 2: Location & Mapping */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <ModernCard variant="soft">
            <ModernCardHeader>
              <ModernCardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                Farm Location
              </ModernCardTitle>
              <ModernCardDescription>Where is {farm.name} located?</ModernCardDescription>
            </ModernCardHeader>
            <ModernCardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter address or coordinates (lat, lng)"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  className="flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && parseLocationInput()}
                />
                <Button 
                  onClick={parseLocationInput} 
                  variant="outline" 
                  disabled={geocodingLocation || !locationInput.trim()}
                >
                  {geocodingLocation ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
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
                Use Current Location
              </Button>
            </ModernCardContent>
          </ModernCard>

          {/* Google Maps */}
          {farm.location.lat !== 0 && apiKey && (
            <ModernCard variant="soft">
              <ModernCardHeader>
                <ModernCardTitle className="flex items-center gap-2">
                  <Map className="h-5 w-5 text-green-600" />
                  Draw Your Farm Boundaries
                </ModernCardTitle>
                <ModernCardDescription>
                  Use the drawing tool to outline your farm boundaries
                </ModernCardDescription>
              </ModernCardHeader>
              <ModernCardContent>
                <div className="space-y-4">
                  <div className="h-96 rounded-lg overflow-hidden border">
                    <LoadScript 
                      googleMapsApiKey={apiKey} 
                      libraries={libraries}
                      onLoad={() => console.log('Google Maps Script loaded')}
                    >
                      <GoogleMap
                        mapContainerStyle={{ width: '100%', height: '100%' }}
                        center={farm.location}
                        zoom={16}
                        onLoad={onMapLoad}
                        options={{
                          mapTypeId: 'satellite',
                          disableDefaultUI: true,
                          zoomControl: true,
                          mapTypeControl: true,
                        }}
                      >
                        <Marker position={farm.location} />
                        
                        {farm.boundaries && farm.boundaries.length > 0 && (
                          <Polygon
                            paths={farm.boundaries}
                            options={{
                              fillColor: '#22c55e',
                              fillOpacity: farm.isMultiField ? 0.1 : 0.3,
                              strokeColor: '#22c55e',
                              strokeOpacity: 0.8,
                              strokeWeight: 3,
                            }}
                          />
                        )}

                        {/* Field boundaries for multi-field mode */}
                        {farm.isMultiField && farm.fields.map((field) => (
                          <Polygon
                            key={field.id}
                            paths={field.boundaries}
                            options={{
                              fillColor: field.color,
                              fillOpacity: 0.4,
                              strokeColor: field.color,
                              strokeOpacity: 1,
                              strokeWeight: 2,
                            }}
                          />
                        ))}
                        
                        {googleMapsLoaded && window.google?.maps?.drawing && (
                          <DrawingManager
                            onLoad={onDrawingManagerLoad}
                            onPolygonComplete={
                              !farm.boundaries || farm.boundaries.length === 0
                                ? onFarmBoundaryComplete
                                : farm.isMultiField
                                  ? onFieldBoundaryComplete
                                  : undefined
                            }
                            options={{
                              drawingControl: !farm.boundaries || (farm.boundaries.length > 0 && farm.isMultiField),
                              drawingControlOptions: {
                                position: window.google.maps.ControlPosition.TOP_CENTER,
                                drawingModes: [window.google.maps.drawing.OverlayType.POLYGON]
                              },
                              polygonOptions: {
                                fillColor: !farm.boundaries || farm.boundaries.length === 0
                                  ? '#22c55e'
                                  : fieldColors[farm.fields.length % fieldColors.length],
                                fillOpacity: 0.3,
                                strokeColor: !farm.boundaries || farm.boundaries.length === 0
                                  ? '#22c55e'
                                  : fieldColors[farm.fields.length % fieldColors.length],
                                strokeOpacity: 0.8,
                                strokeWeight: 2,
                                editable: true
                              }
                            }}
                          />
                        )}
                        
                        {!googleMapsLoaded && (
                          <div style={{
                            position: 'absolute',
                            top: '10px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'rgba(0,0,0,0.7)',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            zIndex: 1000
                          }}>
                            Loading drawing tools...
                          </div>
                        )}
                      </GoogleMap>
                    </LoadScript>
                  </div>

                  {farm.boundaries && farm.boundaries.length > 0 && (
                    <div className="space-y-4">
                      <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          <strong>Farm boundaries complete!</strong> Total area: {farm.totalArea} acres
                        </AlertDescription>
                      </Alert>

                      {/* Field Configuration Choice */}
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <h3 className="font-semibold mb-3">How do you want to organize your fields?</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <button
                            onClick={() => setFarm(prev => ({ ...prev, isMultiField: false, fields: [] }))}
                            className={`p-4 rounded-lg border-2 text-left transition-all ${
                              !farm.isMultiField
                                ? 'border-sage-600 bg-sage-600 text-white'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-sage-300 hover:bg-sage-50'
                            }`}
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                !farm.isMultiField 
                                  ? 'bg-white/20' 
                                  : 'bg-sage-100'
                              }`}>
                                <Wheat className={`h-3 w-3 ${
                                  !farm.isMultiField 
                                    ? 'text-white' 
                                    : 'text-sage-600'
                                }`} />
                              </div>
                              <span className="font-medium text-sm">Single Field</span>
                            </div>
                            <p className={`text-xs ${
                              !farm.isMultiField 
                                ? 'text-white/80' 
                                : 'text-gray-600'
                            }`}>
                              Treat entire farm as one field
                            </p>
                          </button>

                          <button
                            onClick={() => setFarm(prev => ({ ...prev, isMultiField: true }))}
                            className={`p-4 rounded-lg border-2 text-left transition-all ${
                              farm.isMultiField
                                ? 'border-sage-600 bg-sage-600 text-white'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-sage-300 hover:bg-sage-50'
                            }`}
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                farm.isMultiField 
                                  ? 'bg-white/20' 
                                  : 'bg-blue-100'
                              }`}>
                                <Satellite className={`h-3 w-3 ${
                                  farm.isMultiField 
                                    ? 'text-white' 
                                    : 'text-blue-600'
                                }`} />
                              </div>
                              <span className="font-medium text-sm">Multiple Fields</span>
                            </div>
                            <p className={`text-xs ${
                              farm.isMultiField 
                                ? 'text-white/80' 
                                : 'text-gray-600'
                            }`}>
                              Draw separate field boundaries
                            </p>
                          </button>
                        </div>

                        {/* Single Field Configuration */}
                        {!farm.isMultiField && (
                          <div className="mt-4 p-3 bg-white rounded-lg border">
                            <Label className="text-sm font-medium">What are you growing?</Label>
                            <Select onValueChange={(value) => {
                              const crop = crops.find(c => c.id === value)
                              setFarm(prev => ({ 
                                ...prev, 
                                fields: [{
                                  id: 'single',
                                  name: farm.name,
                                  area: farm.totalArea || 0,
                                  boundaries: farm.boundaries || [],
                                  color: fieldColors[0],
                                  cropType: crop?.name,
                                  cropVariety: crop?.scientificName
                                }]
                              }))
                            }}>
                              <SelectTrigger className="mt-2">
                                <SelectValue placeholder="Select crop type" />
                              </SelectTrigger>
                              <SelectContent>
                                {crops.map((crop) => (
                                  <SelectItem key={crop.id} value={crop.id}>
                                    <div className="flex flex-col">
                                      <span className="font-medium">{crop.name}</span>
                                      <span className="text-xs text-gray-500">{crop.category}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {/* Multiple Fields Instructions */}
                        {farm.isMultiField && (
                          <div className="mt-4">
                            {farm.fields.length === 0 ? (
                              <Alert className="border-blue-200 bg-blue-50">
                                <AlertCircle className="h-4 w-4 text-blue-600" />
                                <AlertDescription className="text-blue-800">
                                  Use the polygon tool above to draw individual field boundaries within your farm.
                                </AlertDescription>
                              </Alert>
                            ) : (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium text-sm">Fields Created</h4>
                                  <Badge variant="secondary">{farm.fields.length} fields</Badge>
                                </div>
                                {farm.fields.map((field, index) => (
                                  <div key={field.id} className="flex items-center justify-between p-3 bg-white rounded border">
                                    <div className="flex items-center gap-3">
                                      <div
                                        className="w-3 h-3 rounded-full border border-white shadow"
                                        style={{ backgroundColor: field.color }}
                                      />
                                      <div>
                                        <Input
                                          value={field.name}
                                          onChange={(e) => updateFieldName(field.id, e.target.value)}
                                          className="font-medium border-none p-0 h-auto text-sm"
                                        />
                                        <p className="text-xs text-gray-600">{field.area} acres</p>
                                      </div>
                                    </div>
                                    <Button
                                      onClick={() => deleteField(field.id)}
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-600 hover:text-red-700 h-6 w-6 p-0"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {(!farm.boundaries || farm.boundaries.length === 0) && (
                    <Alert className="border-blue-200 bg-blue-50">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800">
                        Click the polygon tool (📐) above the map, then click around your farm perimeter to draw boundaries.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
                
                <div className="flex justify-between mt-6">
                  <Button onClick={prevStep} variant="outline">
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button 
                    onClick={nextStep} 
                    disabled={!canProceedStep2 || (!farm.isMultiField && !farm.fields.length)}
                    className="bg-sage-600 hover:bg-sage-700"
                  >
                    Continue <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </ModernCardContent>
            </ModernCard>
          )}
        </div>
      )}

      {/* Step 3: Crop Selection for Multi-Field */}
      {currentStep === 3 && farm.isMultiField && (
        <div className="space-y-6">
          <ModernCard variant="soft">
            <ModernCardHeader>
              <ModernCardTitle>Configure Your Fields</ModernCardTitle>
              <ModernCardDescription>
                Select what crops you're growing in each field
              </ModernCardDescription>
            </ModernCardHeader>
            <ModernCardContent className="space-y-6">
              {farm.fields.length > 0 ? (
                <div className="space-y-4">
                  {farm.fields.map((field, index) => (
                    <div key={field.id} className="border rounded-lg p-4 bg-white">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full border-2 border-white shadow"
                            style={{ backgroundColor: field.color }}
                          />
                          <div>
                            <h3 className="font-medium">{field.name}</h3>
                            <p className="text-sm text-gray-600">{field.area} acres</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => deleteField(field.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">What's the purpose of this field?</Label>
                        <div className="space-y-3 mt-2">
                          {/* Field Type Selection */}
                          <Select onValueChange={(value) => {
                            const updatedFields = farm.fields.map(f => 
                              f.id === field.id 
                                ? { ...f, fieldType: value as 'crop' | 'livestock', cropType: '' }
                                : f
                            )
                            setFarm({ ...farm, fields: updatedFields })
                          }}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select field purpose" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="crop">🌾 Growing Crops</SelectItem>
                              <SelectItem value="livestock">🐄 Livestock Grazing/Housing</SelectItem>
                            </SelectContent>
                          </Select>

                          {/* Category Selection (only for crop fields) */}
                          {field.fieldType === 'crop' && (
                            <Select onValueChange={(value) => {
                              const updatedFields = farm.fields.map(f => 
                                f.id === field.id 
                                  ? { ...f, selectedCategory: value, cropType: '' }
                                  : f
                              )
                              setFarm({ ...farm, fields: updatedFields })
                            }}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select crop category" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.keys(groupedCrops).map((category) => (
                                  <SelectItem key={category} value={category}>
                                    {category}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}

                          {/* Specific Crop Selection */}
                          {field.fieldType === 'crop' && field.selectedCategory && (
                            <Select onValueChange={(value) => updateFieldCrop(field.id, value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select specific crop" />
                              </SelectTrigger>
                              <SelectContent>
                                {groupedCrops[field.selectedCategory]?.map((crop: any) => (
                                  <SelectItem key={crop.id} value={crop.id}>
                                    <div className="flex flex-col">
                                      <span className="font-medium">{crop.name}</span>
                                      {crop.scientificName && (
                                        <span className="text-xs text-gray-500 italic">{crop.scientificName}</span>
                                      )}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}

                          {/* Livestock Type Selection */}
                          {field.fieldType === 'livestock' && (
                            <Select onValueChange={(value) => updateFieldCrop(field.id, `livestock-${value}`)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select livestock type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="cattle">🐄 Cattle</SelectItem>
                                <SelectItem value="dairy">🥛 Dairy Cows</SelectItem>
                                <SelectItem value="sheep">🐑 Sheep</SelectItem>
                                <SelectItem value="goats">🐐 Goats</SelectItem>
                                <SelectItem value="pigs">🐷 Pigs</SelectItem>
                                <SelectItem value="chickens">🐔 Chickens</SelectItem>
                                <SelectItem value="horses">🐎 Horses</SelectItem>
                                <SelectItem value="mixed">🦎 Mixed Livestock</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Satellite className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="font-medium text-gray-700 mb-2">No fields created yet</h3>
                  <p className="text-sm text-gray-600 mb-4">Go back to step 2 to draw your field boundaries</p>
                  <Button onClick={prevStep} variant="outline">
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back to Mapping
                  </Button>
                </div>
              )}

              {/* Navigation & Submit */}
              {farm.fields.length > 0 && (
                <div className="flex justify-between">
                  <Button onClick={prevStep} variant="outline">
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button
                    onClick={submitFarm}
                    disabled={isLoading}
                    className="bg-sage-600 hover:bg-sage-700 px-8"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Creating Farm...
                      </>
                    ) : (
                      <>
                        <Plus className="h-5 w-5 mr-2" />
                        Create Farm with {farm.fields.length} Fields
                      </>
                    )}
                  </Button>
                </div>
              )}
            </ModernCardContent>
          </ModernCard>
        </div>
      )}

      {/* Step 3: Single Field Complete */}
      {currentStep === 3 && !farm.isMultiField && (
        <div className="space-y-6">
          <ModernCard variant="soft">
            <ModernCardHeader className="text-center">
              <ModernCardTitle className="text-2xl">Ready to Create Your Farm!</ModernCardTitle>
              <ModernCardDescription>
                Your farm setup is complete and ready to be created
              </ModernCardDescription>
            </ModernCardHeader>
            <ModernCardContent className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Farm Name:</span>
                    <span>{farm.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Total Area:</span>
                    <span>{farm.totalArea} acres</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Field Type:</span>
                    <span>Single field</span>
                  </div>
                  {farm.fields[0]?.cropType && (
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Crop:</span>
                      <span>{farm.fields[0].cropType}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between">
                <Button onClick={prevStep} variant="outline">
                  <ChevronLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button
                  onClick={submitFarm}
                  disabled={isLoading}
                  className="bg-sage-600 hover:bg-sage-700 px-8"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Creating Farm...
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5 mr-2" />
                      Create Farm
                    </>
                  )}
                </Button>
              </div>
            </ModernCardContent>
          </ModernCard>
        </div>
      )}
    </div>
  )
}