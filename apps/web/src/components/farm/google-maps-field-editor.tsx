'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { GoogleMap, LoadScript, Polygon, DrawingManager, Marker } from '@react-google-maps/api'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { 
  MapPin, Trash2, Save, AlertCircle, Satellite as SatelliteIcon, 
  Square, Edit3, Check, X, Loader2, RotateCcw 
} from 'lucide-react'
import { Alert, AlertDescription } from '../ui/alert'

interface Field {
  id: string
  name: string
  area: number
  boundaries: google.maps.LatLngLiteral[]
  centerLat: number
  centerLng: number
}

interface GoogleMapsFieldEditorProps {
  farmLocation: { lat: number; lng: number }
  farmBoundaries?: google.maps.LatLngLiteral[]
  onFieldsDetected: (fields: Field[]) => void
  onClose?: () => void
}

const mapContainerStyle = {
  width: '100%',
  height: '600px'
}

const defaultOptions = {
  mapTypeId: 'satellite' as google.maps.MapTypeId,
  mapTypeControl: true,
  mapTypeControlOptions: {
    position: 3, // TOP_RIGHT
    mapTypeIds: ['satellite', 'hybrid', 'terrain']
  },
  fullscreenControl: true,
  streetViewControl: false,
  zoomControl: true,
  drawingControl: false
}

const getDrawingOptions = () => ({
  drawingControl: true,
  drawingControlOptions: {
    position: 2, // TOP_CENTER
    drawingModes: [google.maps.drawing.OverlayType.POLYGON]
  },
  polygonOptions: {
    fillColor: '#22c55e',
    fillOpacity: 0.3,
    strokeColor: '#16a34a',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    clickable: true,
    editable: true,
    draggable: false
  }
})

const libraries: ("drawing" | "geometry" | "places" | "visualization")[] = ["drawing", "geometry"]

export function GoogleMapsFieldEditor({ 
  farmLocation, 
  farmBoundaries,
  onFieldsDetected, 
  onClose 
}: GoogleMapsFieldEditorProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [fields, setFields] = useState<Field[]>([])
  const [selectedField, setSelectedField] = useState<string | null>(null)
  const [isDetecting, setIsDetecting] = useState(false)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [drawingManager, setDrawingManager] = useState<google.maps.drawing.DrawingManager | null>(null)
  const polygonsRef = useRef<Map<string, google.maps.Polygon>>(new Map())

  // Load map
  const onLoad = useCallback((map: google.maps.Map) => {
    const bounds = new google.maps.LatLngBounds()
    
    if (farmBoundaries && farmBoundaries.length > 0) {
      farmBoundaries.forEach(coord => bounds.extend(coord))
    } else {
      // Default bounds around farm location
      bounds.extend({ 
        lat: farmLocation.lat - 0.01, 
        lng: farmLocation.lng - 0.01 
      })
      bounds.extend({ 
        lat: farmLocation.lat + 0.01, 
        lng: farmLocation.lng + 0.01 
      })
    }
    
    map.fitBounds(bounds)
    setMap(map)
  }, [farmLocation, farmBoundaries])

  // Initialize drawing manager
  const onDrawingManagerLoad = useCallback((drawingManager: google.maps.drawing.DrawingManager) => {
    setDrawingManager(drawingManager)
  }, [])

  // Handle polygon complete
  const onPolygonComplete = useCallback((polygon: google.maps.Polygon) => {
    const path = polygon.getPath()
    const coordinates: google.maps.LatLngLiteral[] = []
    
    for (let i = 0; i < path.getLength(); i++) {
      const latLng = path.getAt(i)
      coordinates.push({ lat: latLng.lat(), lng: latLng.lng() })
    }

    // Calculate area and center
    const area = google.maps.geometry.spherical.computeArea(path)
    const bounds = new google.maps.LatLngBounds()
    coordinates.forEach(coord => bounds.extend(coord))
    const center = bounds.getCenter()

    const newField: Field = {
      id: `field-${Date.now()}`,
      name: `Field ${fields.length + 1}`,
      area: Math.round(area / 4047), // Convert to acres
      boundaries: coordinates,
      centerLat: center?.lat() || farmLocation.lat,
      centerLng: center?.lng() || farmLocation.lng
    }

    // Store polygon reference
    polygonsRef.current.set(newField.id, polygon)

    // Add click listener to polygon
    polygon.addListener('click', () => {
      setSelectedField(newField.id)
    })

    setFields([...fields, newField])
    
    // Hide the polygon temporarily as we'll render it through React
    polygon.setMap(null)

    // Reset drawing mode
    if (drawingManager) {
      drawingManager.setDrawingMode(null)
    }
  }, [fields, farmLocation, drawingManager])

  // Auto-detect fields using satellite analysis
  const autoDetectFields = async () => {
    setIsDetecting(true)
    
    try {
      // Get map bounds
      const bounds = map?.getBounds()
      if (!bounds) return

      const ne = bounds.getNorthEast()
      const sw = bounds.getSouthWest()

      // Call our field detection API
      const response = await fetch('/api/satellite/detect-fields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bbox: {
            north: ne.lat(),
            south: sw.lat(),
            east: ne.lng(),
            west: sw.lng()
          }
        })
      })

      if (response.ok) {
        const { fields: detectedFields } = await response.json()
        
        const newFields: Field[] = detectedFields.map((field: any, index: number) => ({
          id: field.id,
          name: field.name || `Field ${fields.length + index + 1}`,
          area: field.area,
          boundaries: field.boundaries,
          centerLat: field.center?.lat || field.centerLat,
          centerLng: field.center?.lng || field.centerLng
        }))

        setFields([...fields, ...newFields])
      }
    } catch (error) {
      console.error('Field detection error:', error)
    } finally {
      setIsDetecting(false)
    }
  }

  // Delete field
  const deleteField = (fieldId: string) => {
    setFields(fields.filter(f => f.id !== fieldId))
    const polygon = polygonsRef.current.get(fieldId)
    if (polygon) {
      polygon.setMap(null)
      polygonsRef.current.delete(fieldId)
    }
    if (selectedField === fieldId) {
      setSelectedField(null)
    }
  }

  // Save fields
  const saveFields = () => {
    onFieldsDetected(fields)
  }

  // Calculate total area
  const totalArea = fields.reduce((sum, field) => sum + field.area, 0)

  // Check if Google Maps API key is available
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  
  if (!apiKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Google Maps Field Editor
          </CardTitle>
          <CardDescription>
            Interactive field boundary mapping with satellite imagery
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Google Maps API key is not configured. Please configure the NEXT_PUBLIC_GOOGLE_MAPS_API_KEY environment variable to use this feature.
              <br />
              <br />
              <Button 
                onClick={() => onFieldsDetected([])}
                className="mt-2"
              >
                Continue without field mapping
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <LoadScript
      googleMapsApiKey={apiKey}
      libraries={libraries}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Container */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Define Your Fields</CardTitle>
              <CardDescription>
                Draw field boundaries on the map or auto-detect them using satellite imagery
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={farmLocation}
                zoom={15}
                onLoad={onLoad}
                options={defaultOptions}
              >
                {/* Farm boundaries if provided */}
                {farmBoundaries && (
                  <Polygon
                    paths={farmBoundaries}
                    options={{
                      fillColor: '#3b82f6',
                      fillOpacity: 0.1,
                      strokeColor: '#2563eb',
                      strokeOpacity: 0.8,
                      strokeWeight: 3,
                      clickable: false
                    }}
                  />
                )}

                {/* Render fields */}
                {fields.map(field => (
                  <Polygon
                    key={field.id}
                    paths={field.boundaries}
                    options={{
                      fillColor: selectedField === field.id ? '#f59e0b' : '#22c55e',
                      fillOpacity: 0.3,
                      strokeColor: selectedField === field.id ? '#d97706' : '#16a34a',
                      strokeOpacity: 0.8,
                      strokeWeight: selectedField === field.id ? 3 : 2,
                      clickable: true,
                      editable: editingField === field.id,
                      draggable: false
                    }}
                    onClick={() => setSelectedField(field.id)}
                  />
                ))}

                {/* Field center markers */}
                {fields.map(field => (
                  <Marker
                    key={`marker-${field.id}`}
                    position={{ lat: field.centerLat, lng: field.centerLng }}
                    label={{
                      text: field.name,
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  />
                ))}

                {/* Drawing Manager */}
                <DrawingManager
                  onLoad={onDrawingManagerLoad}
                  onPolygonComplete={onPolygonComplete}
                  options={getDrawingOptions()}
                />
              </GoogleMap>

              {/* Map Controls */}
              <div className="absolute bottom-4 left-4 flex gap-2">
                <Button
                  onClick={() => drawingManager?.setDrawingMode(google.maps.drawing.OverlayType.POLYGON)}
                  size="sm"
                  variant="default"
                  className="shadow-lg"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Draw Field
                </Button>
                <Button
                  onClick={autoDetectFields}
                  size="sm"
                  variant="secondary"
                  className="shadow-lg"
                  disabled={isDetecting}
                >
                  {isDetecting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <SatelliteIcon className="h-4 w-4 mr-2" />
                  )}
                  Auto-Detect
                </Button>
              </div>

              {/* Satellite Analysis Integration */}
              {fields.length > 0 && (
                <div className="absolute top-4 right-4">
                  <Button
                    onClick={() => {
                      // Trigger satellite analysis for all defined fields
                      console.log('Starting satellite analysis for fields:', fields)
                      // This will be connected to the field analysis pipeline
                    }}
                    size="sm"
                    variant="outline"
                    className="shadow-lg bg-white/90"
                  >
                    <SatelliteIcon className="h-4 w-4 mr-2" />
                    Analyze Health
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Field List */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fields ({fields.length})</CardTitle>
              <CardDescription>
                Total area: {totalArea.toLocaleString()} acres
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {fields.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Draw field boundaries on the map or use auto-detect
                  </AlertDescription>
                </Alert>
              ) : (
                fields.map(field => (
                  <div
                    key={field.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedField === field.id 
                        ? 'border-orange-500 bg-orange-50' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedField(field.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{field.name}</h4>
                        <p className="text-sm text-gray-600">
                          {field.area.toLocaleString()} acres
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingField(field.id)
                          }}
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteField(field.id)
                          }}
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={saveFields}
              className="flex-1"
              disabled={fields.length === 0}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Fields
            </Button>
            {onClose && (
              <Button
                onClick={onClose}
                variant="outline"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </div>
    </LoadScript>
  )
}