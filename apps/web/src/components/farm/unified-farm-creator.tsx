'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { 
  MapPin, Locate, Search, Loader2, CheckCircle,
  Wheat, Beef, TreePine, Apple, Flower2, 
  AlertCircle, Satellite, Plus, Sprout, Trash2, Edit
} from 'lucide-react'
import { GoogleMap, LoadScript, Polygon, DrawingManager, Marker } from '@react-google-maps/api'
import { Alert, AlertDescription } from '../ui/alert'

const libraries: ("drawing" | "geometry")[] = ["drawing", "geometry"]

interface Farm {
  name: string
  type: string
  location: { lat: number; lng: number; address?: string }
  totalArea?: number
  boundaries?: Array<{ lat: number; lng: number }>
  fields?: Field[]
}

interface Field {
  id: string
  name: string
  area: number
  boundaries: Array<{ lat: number; lng: number }>
  color?: string
}

const farmTypes = [
  { id: 'crops', label: 'Row Crops', icon: Wheat, desc: 'Corn, soybeans, wheat' },
  { id: 'livestock', label: 'Livestock', icon: Beef, desc: 'Cattle, pigs, sheep' },
  { id: 'orchard', label: 'Orchard', icon: Apple, desc: 'Fruit trees, nuts' },
  { id: 'forestry', label: 'Forestry', icon: TreePine, desc: 'Timber, wood products' },
  { id: 'greenhouse', label: 'Greenhouse', icon: Flower2, desc: 'Protected cultivation' },
]

const fieldColors = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6b7280'
]

export function UnifiedFarmCreator() {
  const [farm, setFarm] = useState<Farm>({
    name: '',
    type: 'crops',
    location: { lat: 0, lng: 0 }
  })
  const [locationInput, setLocationInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [detectingLocation, setDetectingLocation] = useState(false)
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [drawingManager, setDrawingManager] = useState<google.maps.drawing.DrawingManager | null>(null)
  const [activeField, setActiveField] = useState<string | null>(null)
  const [showMap, setShowMap] = useState(false)
  const router = useRouter()

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const isBasicInfoComplete = farm.name && farm.type && farm.location.lat !== 0
  const hasValidBoundaries = farm.boundaries && farm.boundaries.length >= 3
  const canCreateFields = hasValidBoundaries

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
          setShowMap(true)
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
      setShowMap(true)
    } else {
      // For address input, use default coordinates (in production would geocode)
      setFarm(prev => ({
        ...prev,
        location: { lat: 40.7128, lng: -74.0060, address: locationInput }
      }))
      setShowMap(true)
    }
  }

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
    setGoogleMapsLoaded(true)
  }, [])

  const onDrawingManagerLoad = useCallback((drawingManager: google.maps.drawing.DrawingManager) => {
    setDrawingManager(drawingManager)
  }, [])

  const onFarmBoundaryComplete = useCallback((polygon: google.maps.Polygon) => {
    if (!window.google?.maps?.geometry) return

    const path = polygon.getPath()
    const coordinates: Array<{ lat: number; lng: number }> = []
    
    for (let i = 0; i < path.getLength(); i++) {
      const latLng = path.getAt(i)
      coordinates.push({ lat: latLng.lat(), lng: latLng.lng() })
    }

    // Calculate area
    const area = window.google.maps.geometry.spherical.computeArea(path)
    const areaInAcres = Math.round(area / 4047) // Convert sq meters to acres

    setFarm(prev => ({
      ...prev,
      boundaries: coordinates,
      totalArea: areaInAcres
    }))

    polygon.setMap(null)
    if (drawingManager) {
      drawingManager.setDrawingMode(null)
    }
  }, [drawingManager])

  const onFieldBoundaryComplete = useCallback((polygon: google.maps.Polygon) => {
    if (!window.google?.maps?.geometry || !hasValidBoundaries) return

    const path = polygon.getPath()
    const coordinates: Array<{ lat: number; lng: number }> = []
    
    for (let i = 0; i < path.getLength(); i++) {
      const latLng = path.getAt(i)
      coordinates.push({ lat: latLng.lat(), lng: latLng.lng() })
    }

    const area = window.google.maps.geometry.spherical.computeArea(path)
    const areaInAcres = Math.round(area / 4047)

    const newField: Field = {
      id: `field-${Date.now()}`,
      name: `Field ${(farm.fields?.length || 0) + 1}`,
      area: areaInAcres,
      boundaries: coordinates,
      color: fieldColors[(farm.fields?.length || 0) % fieldColors.length]
    }

    setFarm(prev => ({
      ...prev,
      fields: [...(prev.fields || []), newField]
    }))

    polygon.setMap(null)
    if (drawingManager) {
      drawingManager.setDrawingMode(null)
    }
  }, [drawingManager, hasValidBoundaries, farm.fields])

  const deleteField = (fieldId: string) => {
    setFarm(prev => ({
      ...prev,
      fields: prev.fields?.filter(f => f.id !== fieldId) || []
    }))
  }

  const getFieldColor = (index: number) => fieldColors[index % fieldColors.length]

  const submitFarm = async () => {
    if (!isBasicInfoComplete) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/farms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: farm.name,
          latitude: farm.location.lat,
          longitude: farm.location.lng,
          address: farm.location.address || '',
          country: 'US',
          totalArea: farm.totalArea || 0,
          primaryProduct: farm.type
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
              color: field.color,
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

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Farm</h1>
        <p className="text-lg text-gray-600">Set up your farm profile and map your fields</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Farm Details */}
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sprout className="h-5 w-5 text-green-600" />
                Farm Information
              </CardTitle>
              <CardDescription>Basic details about your farming operation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="farm-name">Farm Name</Label>
                <Input
                  id="farm-name"
                  placeholder="e.g., Smith Family Farm"
                  value={farm.name}
                  onChange={(e) => setFarm(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Farm Type</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {farmTypes.map((type) => {
                    const Icon = type.icon
                    return (
                      <button
                        key={type.id}
                        onClick={() => setFarm(prev => ({ ...prev, type: type.id }))}
                        className={`p-3 rounded-lg border-2 transition-all text-left ${
                          farm.type === type.id
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="h-4 w-4" />
                          <span className="font-medium">{type.label}</span>
                        </div>
                        <p className="text-sm text-gray-600">{type.desc}</p>
                      </button>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                Farm Location
              </CardTitle>
              <CardDescription>Where is your farm located?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Address or coordinates (lat, lng)"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={parseLocationInput} variant="outline">
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={getCurrentLocation}
                  disabled={detectingLocation}
                  variant="outline"
                  className="flex-1"
                >
                  {detectingLocation ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Locate className="h-4 w-4 mr-2" />
                  )}
                  Use Current Location
                </Button>
              </div>

              {farm.location.lat !== 0 && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Location set: {farm.location.lat.toFixed(4)}, {farm.location.lng.toFixed(4)}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Field Summary */}
          {hasValidBoundaries && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Satellite className="h-5 w-5 text-purple-600" />
                  Fields ({farm.fields?.length || 0})
                </CardTitle>
                <CardDescription>
                  {farm.totalArea ? `Total farm area: ${farm.totalArea} acres` : 'Draw farm boundary first'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {farm.fields && farm.fields.length > 0 ? (
                  <div className="space-y-2">
                    {farm.fields.map((field, index) => (
                      <div key={field.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: field.color }}
                          />
                          <div>
                            <p className="font-medium">{field.name}</p>
                            <p className="text-sm text-gray-600">{field.area} acres</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => deleteField(field.id)}
                          variant="ghost"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-4">
                    No fields created yet. Draw your farm boundary first, then add fields.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Map */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                Farm Mapping
              </CardTitle>
              <CardDescription>
                {!hasValidBoundaries 
                  ? "First, draw your farm boundaries" 
                  : "Farm boundaries set. Now you can add field boundaries."
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!showMap ? (
                <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Set your farm location first</p>
                    <Button
                      onClick={() => setShowMap(true)}
                      disabled={farm.location.lat === 0}
                      variant={farm.location.lat === 0 ? "outline" : "default"}
                    >
                      Load Map
                    </Button>
                  </div>
                </div>
              ) : apiKey ? (
                <div className="h-96 rounded-lg overflow-hidden border">
                  <LoadScript googleMapsApiKey={apiKey} libraries={libraries}>
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
                        gestureHandling: 'greedy'
                      }}
                    >
                      <Marker position={farm.location} />
                      
                      {/* Farm boundary */}
                      {farm.boundaries && farm.boundaries.length > 0 && (
                        <Polygon
                          paths={farm.boundaries}
                          options={{
                            fillColor: '#22c55e',
                            fillOpacity: 0.2,
                            strokeColor: '#22c55e',
                            strokeOpacity: 0.8,
                            strokeWeight: 3,
                          }}
                        />
                      )}

                      {/* Field boundaries */}
                      {farm.fields?.map((field) => (
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

                      {googleMapsLoaded && (
                        <DrawingManager
                          onLoad={onDrawingManagerLoad}
                          onPolygonComplete={!hasValidBoundaries ? onFarmBoundaryComplete : onFieldBoundaryComplete}
                          options={{
                            drawingControl: true,
                            drawingControlOptions: {
                              position: window.google?.maps?.ControlPosition?.TOP_CENTER,
                              drawingModes: [window.google?.maps?.drawing?.OverlayType?.POLYGON].filter(Boolean)
                            },
                            polygonOptions: {
                              fillColor: !hasValidBoundaries ? '#22c55e' : fieldColors[(farm.fields?.length || 0) % fieldColors.length],
                              fillOpacity: 0.3,
                              strokeColor: !hasValidBoundaries ? '#22c55e' : fieldColors[(farm.fields?.length || 0) % fieldColors.length],
                              strokeOpacity: 0.8,
                              strokeWeight: 2,
                              editable: true
                            }
                          }}
                        />
                      )}
                    </GoogleMap>
                  </LoadScript>
                </div>
              ) : (
                <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg">
                  <p className="text-gray-600">Google Maps API key required</p>
                </div>
              )}

              {/* Map Instructions */}
              <div className="mt-4 space-y-2">
                {!hasValidBoundaries ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Step 1:</strong> Click the polygon tool on the map and draw your farm boundaries by clicking to create points. Click the first point again to close the shape.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Farm boundaries set!</strong> Now you can use the polygon tool to draw individual field boundaries within your farm.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Create Farm Button */}
          <div className="space-y-4">
            {!isBasicInfoComplete && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please complete farm name, type, and location to continue.
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={submitFarm}
              disabled={!isBasicInfoComplete || isLoading}
              className="w-full h-12 text-lg"
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
                  Create Farm {hasValidBoundaries && farm.fields?.length ? `with ${farm.fields.length} Fields` : ''}
                </>
              )}
            </Button>

            <p className="text-sm text-gray-600 text-center">
              {hasValidBoundaries 
                ? "Fields are optional - you can add them later from your dashboard"
                : "Farm boundaries are optional - you can add them later for field mapping"
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}