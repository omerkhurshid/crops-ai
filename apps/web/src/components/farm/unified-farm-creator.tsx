'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { ModernCard, ModernCardContent, ModernCardDescription, ModernCardHeader, ModernCardTitle } from '../ui/modern-card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { 
  MapPin, Locate, Search, Loader2, CheckCircle,
  Wheat, Beef, TreePine, Apple, Flower2, 
  AlertCircle, Satellite, Plus, Sprout, Trash2, Edit, RotateCcw
} from 'lucide-react'
import { GoogleMap, LoadScript, Polygon, DrawingManager, Marker } from '@react-google-maps/api'
import { Alert, AlertDescription } from '../ui/alert'
import { SmartAgricultureSelector } from './smart-agriculture-selector'
const libraries: ("drawing" | "geometry")[] = ["drawing", "geometry"]
interface SelectedItem {
  id: string
  name: string
  category: string
  type: 'crop' | 'livestock'
  scientificName?: string
  monitoringParameters: string[]
  additionalInfo?: {
    growingSeasonDays?: number
    primaryHarvestSeason?: string[]
    primaryPurpose?: string[]
    typicalHerdSize?: string
  }
}
interface Farm {
  name: string
  type: string
  location: { lat: number; lng: number; address?: string }
  totalArea?: number
  boundaries?: Array<{ lat: number; lng: number }>
  fields?: Field[]
  selectedAgriculture?: SelectedItem[]
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
    location: { lat: 0, lng: 0 },
    selectedAgriculture: []
  })
  const [locationInput, setLocationInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [detectingLocation, setDetectingLocation] = useState(false)
  const [geocodingLocation, setGeocodingLocation] = useState(false)
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
  const handleAgricultureSelection = (selectedItems: SelectedItem[]) => {
    setFarm(prev => ({
      ...prev,
      selectedAgriculture: selectedItems
    }))
  }
  const getCurrentLocation = () => {
    setDetectingLocation(true)
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          try {
            // Try to get a friendly location name using reverse geocoding
            const response = await fetch(`/api/weather/reverse-geocoding?latitude=${lat}&longitude=${lng}&limit=1`)
            if (response.ok) {
              const data = await response.json()
              const locationName = data.results?.[0]?.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
              setFarm(prev => ({
                ...prev,
                location: { lat, lng, address: locationName }
              }))
            } else {
              setFarm(prev => ({
                ...prev,
                location: { lat, lng }
              }))
            }
          } catch (error) {
            console.error('Error getting location name:', error)
            setFarm(prev => ({
              ...prev,
              location: { lat, lng }
            }))
          }
          setDetectingLocation(false)
          setShowMap(true)
        },
        (error) => {
          console.error('Error getting location:', error)
          setDetectingLocation(false)
          let errorMessage = 'Unable to get your location. Please enter it manually.'
          if (error.code === error.PERMISSION_DENIED) {
            errorMessage = 'Location access denied. Please enable location permissions or enter your address manually.'
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            errorMessage = 'Location information unavailable. Please enter your address manually.'
          } else if (error.code === error.TIMEOUT) {
            errorMessage = 'Location request timed out. Please try again or enter your address manually.'
          }
          alert(errorMessage)
        }
      )
    } else {
      setDetectingLocation(false)
      alert('Geolocation is not supported by this browser. Please enter your address manually.')
    }
  }
  const parseLocationInput = async () => {
    if (!locationInput.trim()) return
    setGeocodingLocation(true)
    const coordPattern = /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/
    if (coordPattern.test(locationInput.trim())) {
      // Direct coordinate input
      const [lat, lng] = locationInput.split(',').map(coord => parseFloat(coord.trim()))
      try {
        // Try to get location name from coordinates using reverse geocoding
        const response = await fetch(`/api/weather/reverse-geocoding?latitude=${lat}&longitude=${lng}&limit=1`)
        if (response.ok) {
          const data = await response.json()
          const locationName = data.results?.[0]?.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
          setFarm(prev => ({ 
            ...prev, 
            location: { lat, lng, address: locationName }
          }))
        } else {
          setFarm(prev => ({ ...prev, location: { lat, lng } }))
        }
      } catch (error) {
        console.error('Error getting location name:', error)
        setFarm(prev => ({ ...prev, location: { lat, lng } }))
      }
      setShowMap(true)
    } else {
      // Address input - use geocoding to get coordinates
      try {
        const response = await fetch(`/api/weather/geocoding?address=${encodeURIComponent(locationInput.trim())}&limit=1`)
        if (response.ok) {
          const data = await response.json()
          if (data.results && data.results.length > 0) {
            const result = data.results[0]
            setFarm(prev => ({
              ...prev,
              location: { 
                lat: result.lat, 
                lng: result.lon, 
                address: result.display_name || locationInput 
              }
            }))
            setShowMap(true)
          } else {
            alert('Location not found. Please try a different address or use coordinates.')
          }
        } else {
          // Fallback to default coordinates if geocoding fails
          setFarm(prev => ({
            ...prev,
            location: { lat: 40.7128, lng: -74.0060, address: locationInput }
          }))
          setShowMap(true)
        }
      } catch (error) {
        console.error('Geocoding error:', error)
        // Fallback to default coordinates
        setFarm(prev => ({
          ...prev,
          location: { lat: 40.7128, lng: -74.0060, address: locationInput }
        }))
        setShowMap(true)
      }
    }
    setGeocodingLocation(false)
  }
  const resetCoordinates = () => {
    const hasData = farm.boundaries || farm.fields?.length
    const message = hasData 
      ? 'This will reset your location and remove all farm boundaries and fields. Are you sure?'
      : 'This will reset your farm location. Are you sure?'
    if (window.confirm(message)) {
      setFarm(prev => ({
        ...prev,
        location: { lat: 0, lng: 0 },
        boundaries: undefined,
        totalArea: undefined,
        fields: undefined
      }))
      setLocationInput('')
      setShowMap(false)
      setActiveField(null)
      // Reset drawing manager if it exists
      if (drawingManager) {
        drawingManager.setDrawingMode(null)
      }
    }
  }
  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
    // Wait for all required Google Maps APIs to load with timeout protection
    let attempts = 0
    const maxAttempts = 100 // 10 seconds timeout
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
  const onFarmBoundaryComplete = useCallback((polygon: google.maps.Polygon) => {
    if (!window.google?.maps?.geometry) {
      console.error('Google Maps geometry library not loaded')
      return
    }
    if (!googleMapsLoaded) {
      console.error('Google Maps not fully loaded yet')
      return
    }
    
    try {
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
      console.log('Farm boundary created:', areaInAcres, 'acres')
    } catch (error) {
      console.error('Error creating farm boundary:', error)
    } finally {
      polygon.setMap(null)
      if (drawingManager) {
        drawingManager.setDrawingMode(null)
      }
    }
  }, [drawingManager, googleMapsLoaded])
  const onFieldBoundaryComplete = useCallback((polygon: google.maps.Polygon) => {
    if (!window.google?.maps?.geometry) {
      console.error('Google Maps geometry library not loaded')
      return
    }
    if (!googleMapsLoaded) {
      console.error('Google Maps not fully loaded yet')
      return
    }
    if (!hasValidBoundaries) return
    
    try {
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
      console.log('Field created:', newField.name, areaInAcres, 'acres')
    } catch (error) {
      console.error('Error creating field boundary:', error)
    } finally {
      polygon.setMap(null)
      if (drawingManager) {
        drawingManager.setDrawingMode(null)
      }
    }
  }, [drawingManager, googleMapsLoaded, hasValidBoundaries, farm.fields])
  const deleteField = (fieldId: string) => {
    setFarm(prev => ({
      ...prev,
      fields: prev.fields?.filter(f => f.id !== fieldId) || []
    }))
  }
  const resetBoundaries = () => {
    const hasFields = farm.fields?.length
    const message = hasFields
      ? 'This will remove farm boundaries and all field boundaries. Are you sure?'
      : 'This will remove your farm boundaries. Are you sure?'
    if (window.confirm(message)) {
      setFarm(prev => ({
        ...prev,
        boundaries: undefined,
        totalArea: undefined,
        fields: undefined
      }))
      setActiveField(null)
      // Reset drawing manager if it exists
      if (drawingManager) {
        drawingManager.setDrawingMode(null)
      }
    }
  }
  const clearAllFields = () => {
    if (window.confirm('This will remove all field boundaries. Are you sure?')) {
      setFarm(prev => ({
        ...prev,
        fields: undefined
      }))
      setActiveField(null)
    }
  }
  const getFieldColor = (index: number) => fieldColors[index % fieldColors.length]
  const submitFarm = async () => {
    if (!isBasicInfoComplete) return
    setIsLoading(true)
    try {
      console.log('=== UNIFIED FARM CREATION DEBUG START ===')
      
      // Get authentication token
      let authToken = null
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession()
        authToken = session?.access_token
        console.log('Session status:', {
          hasSession: !!session,
          hasToken: !!authToken,
          expiresAt: session?.expires_at,
          currentTime: Math.floor(Date.now() / 1000)
        })
      }

      if (!authToken) {
        console.log('ERROR: No auth token available')
        throw new Error('Your session has expired. Please sign in again.')
      }

      const farmData = {
        name: farm.name,
        latitude: farm.location.lat,
        longitude: farm.location.lng,
        address: farm.location.address || '',
        country: 'US',
        totalArea: farm.totalArea || 0,
        primaryProduct: farm.type,
        selectedAgriculture: farm.selectedAgriculture || []
      }

      console.log('Creating farm with data:', farmData)
      console.log('Using auth token:', authToken.substring(0, 20) + '...')

      const response = await fetch('/api/farms', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        credentials: 'include',
        body: JSON.stringify(farmData)
      })
      console.log('API Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.log('API Error response:', errorData)
        throw new Error(`Failed to create farm: ${response.status} - ${JSON.stringify(errorData)}`)
      }

      const result = await response.json()
      console.log('Farm created successfully:', result.farm?.id)
      
      // Create fields if mapped
      if (farm.fields && result.farm?.id) {
        console.log('Creating', farm.fields.length, 'fields...')
        for (let i = 0; i < farm.fields.length; i++) {
          const field = farm.fields[i]
          console.log('Creating field:', field.name)
          const fieldResponse = await fetch('/api/fields', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            },
            credentials: 'include',
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
          
          if (!fieldResponse.ok) {
            console.error('Field creation failed for:', field.name)
          } else {
            console.log('Field created successfully:', field.name)
          }
        }
      }
      
      console.log('=== UNIFIED FARM CREATION DEBUG END ===')
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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Basic Information */}
        <ModernCard variant="soft">
          <ModernCardHeader>
            <ModernCardTitle className="flex items-center gap-2">
              <Sprout className="h-5 w-5 text-green-600" />
              Farm Information
            </ModernCardTitle>
            <ModernCardDescription>Basic details about your farming operation</ModernCardDescription>
          </ModernCardHeader>
          <ModernCardContent className="space-y-4">
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
              <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-2 mt-2">
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
                        <span className="font-medium text-sm">{type.label}</span>
                      </div>
                      <p className="text-xs text-gray-600">{type.desc}</p>
                    </button>
                  )
                })}
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>
        {/* Smart Agriculture Selection */}
        <ModernCard variant="soft">
          <ModernCardHeader>
            <ModernCardTitle className="flex items-center gap-2">
              <Sprout className="h-5 w-5 text-green-600" />
              What Are You Growing or Raising?
            </ModernCardTitle>
            <ModernCardDescription>
              Select your crops and livestock to get personalized AI insights and monitoring
            </ModernCardDescription>
          </ModernCardHeader>
          <ModernCardContent>
            <SmartAgricultureSelector
              selectedFarmType={farm.type}
              onSelectionChange={handleAgricultureSelection}
              showRecommendations={true}
            />
          </ModernCardContent>
        </ModernCard>
        {/* Location */}
        <ModernCard variant="soft">
          <ModernCardHeader>
            <ModernCardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Farm Location
            </ModernCardTitle>
            <ModernCardDescription>Where is your farm located?</ModernCardDescription>
          </ModernCardHeader>
          <ModernCardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Address or coordinates (lat, lng)"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={parseLocationInput} 
                variant="outline" 
                disabled={geocodingLocation}
              >
                {geocodingLocation ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
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
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Location set: {farm.location.lat.toFixed(4)}, {farm.location.lng.toFixed(4)}
                  {farm.location.address && (
                    <span className="text-green-700 font-medium">({farm.location.address})</span>
                  )}
                </div>
                <Button
                  onClick={resetCoordinates}
                  variant="outline"
                  size="sm"
                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-300"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reset
                </Button>
              </div>
            )}
          </ModernCardContent>
        </ModernCard>
        {/* Farm Mapping */}
        <ModernCard variant="soft">
          <ModernCardHeader>
            <div className="flex items-center justify-between">
              <div>
                <ModernCardTitle className="flex items-center gap-2">
                  <Satellite className="h-5 w-5 text-green-600" />
                  Farm Mapping {hasValidBoundaries && <Badge variant="secondary" className="ml-2">Boundaries Set</Badge>}
                </ModernCardTitle>
                <ModernCardDescription>
                  {!hasValidBoundaries 
                    ? "Draw your farm boundaries on the map" 
                    : "Farm boundaries set. Now you can add field boundaries."
                  }
                </ModernCardDescription>
              </div>
              {hasValidBoundaries && (
                <Button
                  onClick={resetBoundaries}
                  variant="outline"
                  size="sm"
                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-300"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reset Boundaries
                </Button>
              )}
            </div>
          </ModernCardHeader>
          <ModernCardContent>
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
              <div className="space-y-4">
                <div className="h-96 rounded-lg overflow-hidden border">
                  <LoadScript 
                    googleMapsApiKey={apiKey} 
                    libraries={libraries}
                    onLoad={() => console.log('Google Maps Script loaded')}
                    onError={(err) => console.error('Google Maps loading error:', err)}
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
                      {googleMapsLoaded && window.google?.maps?.drawing && (
                        <DrawingManager
                          onLoad={onDrawingManagerLoad}
                          onPolygonComplete={!hasValidBoundaries ? onFarmBoundaryComplete : onFieldBoundaryComplete}
                          options={{
                            drawingControl: true,
                            drawingControlOptions: {
                              position: window.google.maps.ControlPosition.TOP_CENTER,
                              drawingModes: [window.google.maps.drawing.OverlayType.POLYGON]
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
                {/* Enhanced Map Instructions */}
                <div className="space-y-3">
                  {!hasValidBoundaries ? (
                    <Alert className="border-green-200 bg-green-50">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">1</span>
                          </div>
                        </div>
                        <div className="flex-grow">
                          <AlertDescription className="text-green-800">
                            <strong>Click the Polygon Tool</strong> (📐) on the map above, then click around your farm perimeter to draw boundaries. Click your first point again to close the shape.
                          </AlertDescription>
                        </div>
                        <div className="flex-shrink-0">
                          <div className="bg-green-200 p-2 rounded-lg animate-pulse">
                            <div className="w-6 h-6 border-2 border-green-600 bg-green-100 flex items-center justify-center text-xs">📐</div>
                          </div>
                        </div>
                      </div>
                    </Alert>
                  ) : (
                    <Alert className="border-blue-200 bg-blue-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-blue-800">
                        <strong>✅ Farm boundaries complete!</strong> Now you can optionally use the polygon tool to draw individual field boundaries within your farm.
                      </AlertDescription>
                    </Alert>
                  )}
                  {farm.totalArea && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        Farm Area: <span className="font-semibold text-green-600">{farm.totalArea} acres</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-gray-600">Google Maps API key required</p>
              </div>
            )}
          </ModernCardContent>
        </ModernCard>
        {/* Field Summary */}
        {hasValidBoundaries && (
          <ModernCard variant="soft">
            <ModernCardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <ModernCardTitle className="flex items-center gap-2">
                    <Satellite className="h-5 w-5 text-purple-600" />
                    Fields ({farm.fields?.length || 0})
                  </ModernCardTitle>
                  <ModernCardDescription>
                    Individual field boundaries within your farm
                  </ModernCardDescription>
                </div>
                {farm.fields && farm.fields.length > 0 && (
                  <Button
                    onClick={clearAllFields}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Clear All Fields
                  </Button>
                )}
              </div>
            </ModernCardHeader>
            <ModernCardContent>
              {farm.fields && farm.fields.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {farm.fields.map((field, index) => (
                    <div key={field.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full border-2 border-white shadow"
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
                <div className="text-center py-8 text-gray-500">
                  <Satellite className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="font-medium">No fields created yet</p>
                  <p className="text-sm">Use the polygon tool on the map above to draw field boundaries</p>
                </div>
              )}
            </ModernCardContent>
          </ModernCard>
        )}
        {/* Create Farm Button */}
        <ModernCard variant="soft">
          <ModernCardContent className="pt-6">
            {!isBasicInfoComplete && (
              <Alert className="mb-4">
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
            <p className="text-sm text-gray-600 text-center mt-3">
              {hasValidBoundaries 
                ? "Fields are optional - you can add them later from your dashboard"
                : "Farm boundaries are optional - you can add them later for field mapping"
              }
            </p>
          </ModernCardContent>
        </ModernCard>
      </div>
    </div>
  )
}