'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { 
  MapPin, Locate, Search, Loader2, ChevronRight, CheckCircle,
  Wheat, Beef, TreePine, Apple, Flower2, 
  Users, AlertCircle, Navigation, Satellite,
  FastForward, Play
} from 'lucide-react'
import { GoogleMap, LoadScript, Polygon, DrawingManager, Marker } from '@react-google-maps/api'
import { Alert, AlertDescription } from '../ui/alert'

interface Farm {
  name: string
  type: 'crops' | 'livestock' | 'orchard' | 'mixed'
  location: {
    lat: number
    lng: number
    address?: string
  }
  boundaries?: Array<{ lat: number; lng: number }>
  totalArea?: number
  fields?: Array<{
    id: string
    name: string
    area: number
    boundaries: Array<{ lat: number; lng: number }>
  }>
}

const farmTypes = [
  {
    id: 'crops',
    name: 'Row Crops',
    description: 'Corn, soybeans, wheat, etc.',
    icon: <Wheat className="h-8 w-8" />,
    color: 'border-green-500 bg-green-50 text-green-700'
  },
  {
    id: 'livestock',
    name: 'Livestock',
    description: 'Cattle, poultry, swine, etc.',
    icon: <Beef className="h-8 w-8" />,
    color: 'border-orange-500 bg-orange-50 text-orange-700'
  },
  {
    id: 'orchard',
    name: 'Orchard',
    description: 'Fruits, nuts, berries',
    icon: <Apple className="h-8 w-8" />,
    color: 'border-red-500 bg-red-50 text-red-700'
  },
  {
    id: 'mixed',
    name: 'Mixed Farm',
    description: 'Multiple operations',
    icon: <TreePine className="h-8 w-8" />,
    color: 'border-blue-500 bg-blue-50 text-blue-700'
  }
]

const mapContainerStyle = {
  width: '100%',
  height: '400px'
}

// Libraries needed for Google Maps
const libraries: ("drawing" | "geometry")[] = ["drawing", "geometry"]

// Helper function to get consistent field colors
const getFieldColor = (index: number): string => {
  const colors = [
    '#3b82f6', // blue
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // violet
    '#06b6d4', // cyan
    '#84cc16', // lime
    '#f97316', // orange
  ]
  return colors[index % colors.length]
}

export function UnifiedFarmCreator() {
  const [currentStep, setCurrentStep] = useState(1)
  const [farm, setFarm] = useState<Farm>({
    name: '',
    type: 'crops',
    location: { lat: 0, lng: 0 }
  })
  const [locationInput, setLocationInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [detectingLocation, setDetectingLocation] = useState(false)
  const [showFieldMapping, setShowFieldMapping] = useState(false)
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false)
  const [googleMapsError, setGoogleMapsError] = useState<string | null>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [drawingManager, setDrawingManager] = useState<google.maps.drawing.DrawingManager | null>(null)
  const router = useRouter()

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
          setDetectingLocation(false)
        },
        (error) => {
          console.error('Error getting location:', error)
          setDetectingLocation(false)
          alert('Unable to get your location. Please enter it manually.')
        }
      )
    }
  }

  const parseLocationInput = async () => {
    const coordPattern = /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/
    
    if (coordPattern.test(locationInput.trim())) {
      const [lat, lng] = locationInput.split(',').map(coord => parseFloat(coord.trim()))
      setFarm(prev => ({ ...prev, location: { lat, lng } }))
    } else {
      // For address input, use default coordinates (in production would geocode)
      setFarm(prev => ({
        ...prev,
        location: { lat: 40.7128, lng: -74.0060, address: locationInput }
      }))
    }
  }

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
    setGoogleMapsLoaded(true)
    console.log('Google Maps loaded successfully')
  }, [])

  const onDrawingManagerLoad = useCallback((drawingManager: google.maps.drawing.DrawingManager) => {
    setDrawingManager(drawingManager)
  }, [])

  const onPolygonComplete = useCallback((polygon: google.maps.Polygon) => {
    if (!window.google?.maps?.geometry) {
      console.error('Google Maps geometry library not loaded')
      return
    }

    const path = polygon.getPath()
    const coordinates: Array<{ lat: number; lng: number }> = []
    
    for (let i = 0; i < path.getLength(); i++) {
      const latLng = path.getAt(i)
      coordinates.push({ lat: latLng.lat(), lng: latLng.lng() })
    }

    // Calculate area using geometry library
    const area = window.google.maps.geometry.spherical.computeArea(path)
    const areaInAcres = Math.round(area / 4047) // Convert sq meters to acres

    const newField = {
      id: `field-${Date.now()}`,
      name: `Field ${(farm.fields?.length || 0) + 1}`,
      area: areaInAcres,
      boundaries: coordinates
    }

    setFarm(prev => ({
      ...prev,
      fields: [...(prev.fields || []), newField]
    }))

    // Remove the polygon from the map since we'll render it ourselves
    polygon.setMap(null)

    // Reset drawing mode
    if (drawingManager) {
      drawingManager.setDrawingMode(null)
    }
  }, [farm.fields, drawingManager])

  const handleSubmit = async () => {
    if (!farm.name || !farm.type || farm.location.lat === 0) {
      alert('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    try {
      // Create the farm
      const response = await fetch('/api/farms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: farm.name,
          latitude: farm.location.lat,
          longitude: farm.location.lng,
          address: farm.location.address || '',
          country: 'US',
          totalArea: farm.totalArea || farm.fields?.reduce((sum, field) => sum + field.area, 0) || 100,
          primaryProduct: farm.type === 'crops' ? 'corn-field' : 'cattle-beef',
          boundaries: farm.boundaries,
          metadata: {
            farmType: farm.type,
            hasFields: !!farm.fields?.length,
            hasBoundaries: !!farm.boundaries?.length
          }
        })
      })

      if (!response.ok) throw new Error('Failed to create farm')
      
      const result = await response.json()
      
      // Create fields if mapped
      if (farm.fields && result.farm?.id) {
        for (let i = 0; i < farm.fields.length; i++) {
          const field = farm.fields[i]
          await fetch('/api/fields', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              farmId: result.farm.id,
              name: field.name,
              area: field.area,
              latitude: field.boundaries[0]?.lat || farm.location.lat,
              longitude: field.boundaries[0]?.lng || farm.location.lng,
              boundaries: field.boundaries,
              color: getFieldColor(i),
              cropType: null,
              status: 'active'
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

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const isBasicInfoComplete = farm.name && farm.type && farm.location.lat !== 0

  // Step 1: Basic Information
  if (currentStep === 1) {
    return (
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-light">Create Your Farm</CardTitle>
          <CardDescription>
            Let's get your farm set up in Cropple.ai
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Farm Name */}
          <div>
            <Label htmlFor="farm-name" className="text-base font-medium">
              What's your farm called?
            </Label>
            <Input
              id="farm-name"
              type="text"
              placeholder="e.g., Smith Family Farm"
              value={farm.name}
              onChange={(e) => setFarm(prev => ({ ...prev, name: e.target.value }))}
              className="mt-2 text-lg h-12"
              autoFocus
            />
          </div>

          {/* Farm Type */}
          <div>
            <Label className="text-base font-medium mb-3 block">
              What type of farming do you do?
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {farmTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setFarm(prev => ({ ...prev, type: type.id as any }))}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    farm.type === type.id
                      ? type.color
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={farm.type === type.id ? '' : 'text-gray-400'}>
                      {type.icon}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{type.name}</div>
                      <div className="text-xs text-gray-600">{type.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <Label className="text-base font-medium mb-3 block">
              Where is your farm located?
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Enter address or GPS coordinates (lat, lng)"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={parseLocationInput}
                    disabled={!locationInput}
                    variant="outline"
                  >
                    <Search className="h-4 w-4 mr-1" />
                    Find
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-center">
                <div className="text-center space-y-2 w-full">
                  <span className="text-sm text-gray-500 block">or</span>
                  <Button
                    onClick={getCurrentLocation}
                    disabled={detectingLocation}
                    variant="outline"
                    className="w-full"
                  >
                    {detectingLocation ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Navigation className="h-4 w-4 mr-2" />
                    )}
                    Use My Current Location
                  </Button>
                </div>
              </div>
            </div>

            {/* Location Preview with Map */}
            {farm.location.lat !== 0 && (
              <div className="mt-3 space-y-3">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-800">
                        Location set: {farm.location.lat.toFixed(4)}, {farm.location.lng.toFixed(4)}
                      </p>
                      {farm.location.address && (
                        <p className="text-sm text-green-700">{farm.location.address}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Map with Boundary Drawing */}
                {apiKey && (
                  <div className="space-y-3">
                    {/* Instructions */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium text-blue-800 mb-1">
                            Optional: Draw Your Farm Boundaries
                          </h4>
                          <p className="text-sm text-blue-700">
                            Use the drawing tools to outline your farm's perimeter. This helps us provide more accurate satellite analysis and field management.
                          </p>
                          <div className="mt-2 text-xs text-blue-600">
                            💡 Tip: Use satellite view to see property lines clearly
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg overflow-hidden border border-green-200">
                      <LoadScript
                        googleMapsApiKey={apiKey}
                        libraries={libraries}
                        loadingElement={
                          <div className="h-48 flex items-center justify-center bg-gray-100">
                            <div className="text-center">
                              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-gray-600" />
                              <p className="text-sm text-gray-600">Loading map...</p>
                            </div>
                          </div>
                        }
                      >
                        <GoogleMap
                          mapContainerStyle={{ width: '100%', height: '400px' }}
                          center={farm.location}
                          zoom={16}
                          options={{
                            mapTypeId: 'satellite',
                            disableDefaultUI: true,
                            zoomControl: true,
                            mapTypeControl: true,
                            gestureHandling: 'greedy'
                          }}
                          onPolygonComplete={(polygon) => {
                            const path = polygon.getPath()
                            const boundaries = []
                            for (let i = 0; i < path.getLength(); i++) {
                              const point = path.getAt(i)
                              boundaries.push({
                                lat: point.lat(),
                                lng: point.lng()
                              })
                            }
                            setFarm(prev => ({ ...prev, boundaries }))
                          }}
                        >
                          <Marker position={farm.location} />
                          
                          {/* Farm boundary if drawn */}
                          {farm.boundaries && farm.boundaries.length > 0 && (
                            <Polygon
                              paths={farm.boundaries}
                              options={{
                                fillColor: '#22c55e',
                                fillOpacity: 0.15,
                                strokeColor: '#22c55e',
                                strokeOpacity: 0.8,
                                strokeWeight: 3,
                              }}
                            />
                          )}

                          {/* Field boundaries */}
                          {farm.fields?.map((field, index) => (
                            field.boundaries.length > 0 && (
                              <Polygon
                                key={field.id}
                                paths={field.boundaries}
                                options={{
                                  fillColor: getFieldColor(index),
                                  fillOpacity: 0.3,
                                  strokeColor: getFieldColor(index),
                                  strokeOpacity: 1,
                                  strokeWeight: 2,
                                }}
                              />
                            )
                          ))}

                          {/* Drawing Manager */}
                          <DrawingManager
                            options={{
                              drawingMode: null,
                              drawingControl: true,
                              drawingControlOptions: {
                                position: 2, // TOP_CENTER
                                drawingModes: ['polygon']
                              },
                              polygonOptions: {
                                fillColor: '#22c55e',
                                fillOpacity: 0.2,
                                strokeColor: '#22c55e',
                                strokeOpacity: 0.8,
                                strokeWeight: 2,
                                clickable: false,
                                editable: true,
                                zIndex: 1
                              }
                            }}
                            onPolygonComplete={(polygon) => {
                              const path = polygon.getPath()
                              const boundaries = []
                              for (let i = 0; i < path.getLength(); i++) {
                                const point = path.getAt(i)
                                boundaries.push({
                                  lat: point.lat(),
                                  lng: point.lng()
                                })
                              }
                              setFarm(prev => ({ ...prev, boundaries }))
                              
                              // Calculate area (rough approximation)
                              const area = google.maps.geometry.spherical.computeArea(path) * 0.000247105 // Convert to acres
                              setFarm(prev => ({ ...prev, totalArea: area }))
                              
                              // Remove the polygon to prevent multiple overlays
                              polygon.setMap(null)
                            }}
                          />
                        </GoogleMap>
                      </LoadScript>
                    </div>

                    {/* Boundary Info */}
                    {farm.boundaries && farm.boundaries.length > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <div>
                            <p className="text-sm font-medium text-green-800">
                              Farm boundary saved!
                            </p>
                            <p className="text-xs text-green-700">
                              Area: {farm.totalArea?.toFixed(1) || 'calculating...'} acres
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Field Creation Section */}
                {farm.location.lat !== 0 && apiKey && (
                  <div className="space-y-4 mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          Add Fields (Optional)
                        </h3>
                        <p className="text-sm text-gray-600">
                          Create individual fields within your farm boundaries for better management
                        </p>
                      </div>
                      <Button
                        onClick={() => {
                          const newField = {
                            id: `field-${Date.now()}`,
                            name: `Field ${(farm.fields?.length || 0) + 1}`,
                            area: 0,
                            boundaries: []
                          }
                          setFarm(prev => ({
                            ...prev,
                            fields: [...(prev.fields || []), newField]
                          }))
                        }}
                        variant="outline"
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Field
                      </Button>
                    </div>

                    {/* Instructions for Field Drawing */}
                    {farm.fields && farm.fields.length > 0 && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <Sprout className="h-5 w-5 text-amber-600 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-medium text-amber-800 mb-1">
                              How to Add Field Boundaries
                            </h4>
                            <div className="text-sm text-amber-700 space-y-1">
                              <p>1. Click on a field below to select it</p>
                              <p>2. Use the polygon tool in the map to draw the field boundaries</p>
                              <p>3. Fields will appear in different colors for easy identification</p>
                              <p>4. You can edit field names by clicking on them</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Field List */}
                    {farm.fields && farm.fields.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">Your Fields:</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {farm.fields.map((field, index) => (
                            <div
                              key={field.id}
                              className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <div
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: getFieldColor(index) }}
                                  />
                                  <Input
                                    value={field.name}
                                    onChange={(e) => {
                                      const updatedFields = farm.fields!.map(f =>
                                        f.id === field.id ? { ...f, name: e.target.value } : f
                                      )
                                      setFarm(prev => ({ ...prev, fields: updatedFields }))
                                    }}
                                    className="border-none p-0 h-auto font-medium text-sm"
                                  />
                                </div>
                                <div className="flex items-center space-x-2">
                                  {field.area > 0 && (
                                    <span className="text-xs text-gray-500">
                                      {field.area.toFixed(1)} acres
                                    </span>
                                  )}
                                  <Button
                                    onClick={() => {
                                      const updatedFields = farm.fields!.filter(f => f.id !== field.id)
                                      setFarm(prev => ({ ...prev, fields: updatedFields }))
                                    }}
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                                  >
                                    ×
                                  </Button>
                                </div>
                              </div>
                              {field.boundaries.length === 0 && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Click "Add Field", then draw on the map
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Next Steps */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => router.push('/farms')}>
              Cancel
            </Button>
            <Button
              onClick={() => setCurrentStep(2)}
              disabled={!isBasicInfoComplete}
              className="px-8"
            >
              Next: Field Setup
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Step 2: Field Setup (Optional)
  if (currentStep === 2) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-light">Field Setup (Optional)</CardTitle>
          <CardDescription>
            You can map your field boundaries now or skip and add them later from your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Field Mapping Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Option 1: Skip Field Mapping</h3>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <FastForward className="h-5 w-5 text-gray-600" />
                  <span className="font-medium">Quick Start</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Get started immediately with your farm. You can add field boundaries later from your dashboard when you need them.
                </p>
                <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating Farm...
                    </>
                  ) : (
                    <>
                      Skip & Create Farm
                      <Play className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Option 2: Map Field Boundaries</h3>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <Satellite className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Detailed Setup</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Draw your field boundaries on satellite imagery for precise monitoring and analysis.
                </p>
                <Button 
                  onClick={() => setShowFieldMapping(true)} 
                  variant="outline" 
                  className="w-full"
                  disabled={!apiKey}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Start Field Mapping
                </Button>
                {!apiKey && (
                  <p className="text-xs text-red-500 mt-2">
                    Google Maps API key required for field mapping
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Field Mapping Interface */}
          {showFieldMapping && apiKey && (
            <div className="border-t pt-6">
              <LoadScript
                googleMapsApiKey={apiKey}
                libraries={libraries}
                onLoad={() => console.log('LoadScript completed')}
                onError={(error) => {
                  console.error('LoadScript error:', error)
                  setGoogleMapsError('Failed to load Google Maps. Please check your API key.')
                }}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium">Draw Your Field Boundaries</h4>
                    <Badge variant="outline">
                      {farm.fields?.length || 0} fields mapped
                    </Badge>
                  </div>

                  {googleMapsError ? (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{googleMapsError}</AlertDescription>
                    </Alert>
                  ) : (
                    <div className="rounded-lg overflow-hidden border">
                      <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={farm.location}
                        zoom={15}
                        onLoad={onMapLoad}
                        options={{
                          mapTypeId: 'satellite',
                          mapTypeControl: true,
                          streetViewControl: false,
                        }}
                      >
                        {googleMapsLoaded && (
                          <DrawingManager
                            onLoad={onDrawingManagerLoad}
                            onPolygonComplete={onPolygonComplete}
                            options={{
                              drawingControl: true,
                              drawingControlOptions: {
                                position: window.google?.maps?.ControlPosition?.TOP_CENTER,
                                drawingModes: [window.google?.maps?.drawing?.OverlayType?.POLYGON]
                              },
                              polygonOptions: {
                                fillColor: '#22c55e',
                                fillOpacity: 0.3,
                                strokeColor: '#16a34a',
                                strokeWeight: 2,
                                clickable: true,
                                editable: true
                              }
                            }}
                          />
                        )}

                        {/* Render existing fields */}
                        {farm.fields?.map(field => (
                          <Polygon
                            key={field.id}
                            paths={field.boundaries}
                            options={{
                              fillColor: '#22c55e',
                              fillOpacity: 0.3,
                              strokeColor: '#16a34a',
                              strokeWeight: 2
                            }}
                          />
                        ))}
                      </GoogleMap>
                    </div>
                  )}

                  {/* Field List */}
                  {farm.fields && farm.fields.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="font-medium">Mapped Fields:</h5>
                      {farm.fields.map(field => (
                        <div key={field.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="font-medium">{field.name}</span>
                          <span className="text-sm text-gray-600">{field.area} acres</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Field Mapping Actions */}
                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowFieldMapping(false)}
                    >
                      Close Mapping
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating Farm...
                        </>
                      ) : (
                        <>
                          Create Farm with Fields
                          <CheckCircle className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </LoadScript>
            </div>
          )}

          {/* Navigation */}
          {!showFieldMapping && (
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                Back
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return null
}