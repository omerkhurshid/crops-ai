'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { MapPin, Move, Square, RotateCcw, Check, X, Shapes, MapPinned, Info, ZoomIn, ZoomOut } from 'lucide-react'

interface InteractiveFieldMapProps {
  fieldId: string
  onBoundariesDetected: (boundaries: Array<{ lat: number; lng: number }>) => void
  onClose: () => void
}

interface MapPoint {
  id: string
  lat: number
  lng: number
  x: number
  y: number
  isDragging: boolean
}

export function InteractiveFieldMap({ fieldId, onBoundariesDetected, onClose }: InteractiveFieldMapProps) {
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 })
  const [coordinates, setCoordinates] = useState({
    centerLat: '',
    centerLng: '',
    zoom: '16'
  })
  const [currentZoom, setCurrentZoom] = useState(16)
  const [points, setPoints] = useState<MapPoint[]>([])
  const [dragPoint, setDragPoint] = useState<string | null>(null)
  const [mode, setMode] = useState<'satellite' | 'manual'>('manual')
  const [mapLoaded, setMapLoaded] = useState(false)
  const [isDetecting, setIsDetecting] = useState(false)
  const [detectedFields, setDetectedFields] = useState<any[]>([])
  const [selectedField, setSelectedField] = useState<number | null>(null)
  
  const mapRef = useRef<HTMLDivElement>(null)
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const [satelliteImage, setSatelliteImage] = useState<string | null>(null)
  const [loadingImage, setLoadingImage] = useState(false)

  useEffect(() => {
    // Simulate map loading and create initial square
    const timer = setTimeout(() => {
      setMapLoaded(true)
      // Only create initial square on first load
      if (points.length === 0) {
        createSquareField()
      }
    }, 500)
    return () => clearTimeout(timer)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch satellite image when center changes
  useEffect(() => {
    const fetchSatelliteImage = async () => {
      // Only fetch if we have valid coordinates and map is loaded
      if (!mapCenter.lat || !mapCenter.lng || !mapLoaded) {

        return
      }
      
      // Skip if coordinates haven't been explicitly set by user
      if (coordinates.centerLat === '' && coordinates.centerLng === '') {

        return
      }
      
      setLoadingImage(true)
      try {
        const bbox = {
          west: mapCenter.lng - 0.01,
          south: mapCenter.lat - 0.01,
          east: mapCenter.lng + 0.01,
          north: mapCenter.lat + 0.01
        }

        // Use a date range for the last 30 days to find available imagery
        const endDate = new Date()
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - 30)
        
        // Calculate bbox size based on zoom level (higher zoom = smaller area = better resolution)
        const zoomFactor = Math.pow(2, 16 - currentZoom) // Base zoom 16
        const bboxSize = 0.01 * zoomFactor
        
        const adjustedBbox = {
          west: mapCenter.lng - bboxSize,
          south: mapCenter.lat - bboxSize,
          east: mapCenter.lng + bboxSize,
          north: mapCenter.lat + bboxSize
        }
        
        const params = new URLSearchParams({
          west: adjustedBbox.west.toString(),
          south: adjustedBbox.south.toString(),
          east: adjustedBbox.east.toString(),
          north: adjustedBbox.north.toString(),
          type: 'true-color',
          width: '800',
          height: '600',
          date: endDate.toISOString().split('T')[0]
        })

        const response = await fetch(`/api/satellite/images?${params}`, {
          method: 'GET'
        })

        if (response.ok) {
          const result = await response.json()
          
          // Handle both wrapped and direct API responses
          const data = result.data || result; // result.data if wrapped, result if direct response
          
          if (data) {
            // Check for different response formats
            if (data.imageUrl) {

              setSatelliteImage(data.imageUrl)
            } else if (data.imageData) {

              setSatelliteImage(data.imageData)
            } else {

            }
          } else {

          }
        } else {
          const errorText = await response.text()
          console.error('Satellite API error:', response.status, errorText)
        }
      } catch (error) {
        console.error('Failed to fetch satellite image:', error)
      } finally {
        setLoadingImage(false)
      }
    }

    fetchSatelliteImage()
  }, [mapCenter, mapLoaded, coordinates.centerLat, coordinates.centerLng, currentZoom])

  const updateMapCenter = () => {
    const lat = parseFloat(coordinates.centerLat)
    const lng = parseFloat(coordinates.centerLng)

    if (!isNaN(lat) && !isNaN(lng)) {
      setMapCenter({ lat, lng })
      // Clear existing points when changing location
      setPoints([])
      setDetectedFields([])
      setSelectedField(null)

    } else {

      alert('Please enter valid numeric coordinates')
    }
  }

  const zoomIn = () => {
    if (currentZoom < 20) {
      setCurrentZoom(prev => prev + 1)
      setCoordinates(prev => ({ ...prev, zoom: (currentZoom + 1).toString() }))
    }
  }

  const zoomOut = () => {
    if (currentZoom > 10) {
      setCurrentZoom(prev => prev - 1)
      setCoordinates(prev => ({ ...prev, zoom: (currentZoom - 1).toString() }))
    }
  }

  const detectBoundariesFromSatellite = async () => {
    if (!mapCenter.lat || !mapCenter.lng || mapCenter.lat === 0 || mapCenter.lng === 0) {
      alert('Please enter coordinates and click "Update Map" first')
      return
    }

    setIsDetecting(true)
    try {
      const lat = parseFloat(coordinates.centerLat)
      const lng = parseFloat(coordinates.centerLng)
      const radiusKm = 2 // Fixed 2km radius for detection

      // Create bounding box around the center point
      const bbox = {
        west: lng - radiusKm * 0.01,
        south: lat - radiusKm * 0.01,
        east: lng + radiusKm * 0.01,
        north: lat + radiusKm * 0.01
      }

      const response = await fetch('/api/satellite/boundaries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'detect',
          bbox,
          date: new Date().toISOString().split('T')[0],
          options: {
            method: 'edge-detection',
            sensitivity: 'medium',
            minFieldSize: 1,
            maxFieldSize: 500,
            smoothing: true,
            mergeAdjacent: true,
            excludeWater: true,
            excludeUrban: true
          }
        })
      })

      const result = await response.json()
      
      if (result.success && result.data.boundaries) {
        setDetectedFields(result.data.boundaries)
        // Convert first detected field to points for visualization
        if (result.data.boundaries.length > 0) {
          convertFieldToPoints(result.data.boundaries[0])
        }
      } else {
        throw new Error(result.message || 'Failed to detect boundaries')
      }
    } catch (error) {
      console.error('Boundary detection failed:', error)
      alert('Failed to detect field boundaries. You can still manually define the field perimeter.')
    } finally {
      setIsDetecting(false)
    }
  }

  const convertFieldToPoints = (field: any) => {
    if (field.geometry?.coordinates?.[0]) {
      const coords = field.geometry.coordinates[0]
      const newPoints: MapPoint[] = coords.slice(0, -1).map((coord: number[], index: number) => ({
        id: `point-${index}`,
        lat: coord[1],
        lng: coord[0],
        x: 100 + index * 100, // Simplified positioning
        y: 100 + (index % 2) * 100,
        isDragging: false
      }))
      setPoints(newPoints)
    }
  }

  const createSquareField = () => {
    const centerX = 400
    const centerY = 300
    const size = 150
    
    const squarePoints: MapPoint[] = [
      { id: 'p1', lat: mapCenter.lat + 0.001, lng: mapCenter.lng - 0.001, x: centerX - size/2, y: centerY - size/2, isDragging: false },
      { id: 'p2', lat: mapCenter.lat + 0.001, lng: mapCenter.lng + 0.001, x: centerX + size/2, y: centerY - size/2, isDragging: false },
      { id: 'p3', lat: mapCenter.lat - 0.001, lng: mapCenter.lng + 0.001, x: centerX + size/2, y: centerY + size/2, isDragging: false },
      { id: 'p4', lat: mapCenter.lat - 0.001, lng: mapCenter.lng - 0.001, x: centerX - size/2, y: centerY + size/2, isDragging: false }
    ]
    
    setPoints(squarePoints)
  }

  const addCustomPoint = (e: React.MouseEvent<HTMLDivElement>) => {
    if (mode !== 'manual') return
    
    const rect = mapRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Convert screen coordinates to approximate lat/lng (simplified)
    const lat = mapCenter.lat + (300 - y) * 0.00001
    const lng = mapCenter.lng + (x - 400) * 0.00001

    const newPoint: MapPoint = {
      id: `point-${Date.now()}`,
      lat,
      lng,
      x,
      y,
      isDragging: false
    }

    setPoints(prev => [...prev, newPoint])
  }

  const handleMouseDown = (e: React.MouseEvent, pointId: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    const rect = mapRef.current?.getBoundingClientRect()
    if (!rect) return

    const point = points.find(p => p.id === pointId)
    if (!point) return

    dragOffset.current = {
      x: e.clientX - point.x,
      y: e.clientY - point.y
    }

    setDragPoint(pointId)
    setPoints(prev => prev.map(p => 
      p.id === pointId ? { ...p, isDragging: true } : p
    ))
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragPoint) return

    const rect = mapRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left - dragOffset.current.x
    const y = e.clientY - rect.top - dragOffset.current.y

    // Convert to lat/lng (simplified conversion)
    const lat = mapCenter.lat + (300 - y) * 0.00001
    const lng = mapCenter.lng + (x - 400) * 0.00001

    setPoints(prev => prev.map(p => 
      p.id === dragPoint ? { ...p, x, y, lat, lng } : p
    ))
  }

  const handleMouseUp = () => {
    if (dragPoint) {
      setPoints(prev => prev.map(p => 
        p.id === dragPoint ? { ...p, isDragging: false } : p
      ))
      setDragPoint(null)
    }
  }

  const clearPoints = () => {
    setPoints([])
    setDetectedFields([])
    setSelectedField(null)
  }

  const calculateArea = () => {
    if (points.length < 3) return 0
    
    // Simplified area calculation (hectares)
    let area = 0
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length
      area += points[i].lat * points[j].lng
      area -= points[j].lat * points[i].lng
    }
    return Math.abs(area) * 6378137 * 6378137 / 20000000 // Rough conversion to hectares
  }

  const confirmField = () => {
    if (points.length < 3) {
      alert('Please define at least 3 points to create a field boundary')
      return
    }

    const boundaries = points.map(p => ({ lat: p.lat, lng: p.lng }))
    onBoundariesDetected(boundaries)
    onClose()
  }

  const selectDetectedField = (index: number) => {
    setSelectedField(index)
    if (detectedFields[index]) {
      convertFieldToPoints(detectedFields[index])
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-6xl max-h-[95vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Define Field Boundaries</span>
          </CardTitle>
          <CardDescription>
            Define your field boundaries by drawing on the map or using automatic satellite detection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Location Input */}
            <div>
              <h4 className="font-medium mb-4">1. Set Map Location (Optional)</h4>
              
              {/* Location helpers */}
              <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-start space-x-2">
                <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Skip coordinates and draw directly!</p>
                  <p className="text-xs">Just select &quot;Manual Drawing&quot; below and start creating your field boundaries.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="center-lat">Latitude</Label>
                  <Input
                    id="center-lat"
                    type="number"
                    step="any"
                    placeholder="40.7128"
                    value={coordinates.centerLat}
                    onChange={(e) => setCoordinates(prev => ({ ...prev, centerLat: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="center-lng">Longitude</Label>
                  <Input
                    id="center-lng"
                    type="number"
                    step="any"
                    placeholder="-74.0060"
                    value={coordinates.centerLng}
                    onChange={(e) => setCoordinates(prev => ({ ...prev, centerLng: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="zoom">Zoom Level</Label>
                  <Input
                    id="zoom"
                    type="number"
                    min="10"
                    max="20"
                    value={coordinates.zoom}
                    onChange={(e) => setCoordinates(prev => ({ ...prev, zoom: e.target.value }))}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={updateMapCenter} variant="outline" className="w-full">
                    Update Map
                  </Button>
                </div>
              </div>
            </div>

            {/* Mode Selection */}
            <div>
              <h4 className="font-medium mb-4">2. Choose Detection Method</h4>
              <div className="flex space-x-4 mb-4">
                <Button
                  variant={mode === 'satellite' ? 'default' : 'outline'}
                  onClick={() => setMode('satellite')}
                  className="flex items-center space-x-2"
                >
                  <MapPin className="h-4 w-4" />
                  <span>Satellite Detection</span>
                </Button>
                <Button
                  variant={mode === 'manual' ? 'default' : 'outline'}
                  onClick={() => setMode('manual')}
                  className="flex items-center space-x-2"
                >
                  <Move className="h-4 w-4" />
                  <span>Manual Drawing</span>
                </Button>
              </div>

              {mode === 'satellite' && (
                <div className="flex space-x-4">
                  <Button 
                    onClick={detectBoundariesFromSatellite}
                    disabled={isDetecting}
                  >
                    {isDetecting ? 'Analyzing...' : 'Detect from Satellite'}
                  </Button>
                </div>
              )}

              {mode === 'manual' && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Click on the map to add points, or use a preset shape:</p>
                  <div className="flex space-x-4">
                    <Button onClick={createSquareField} variant="outline">
                      <Square className="h-4 w-4 mr-2" />
                      Start with Square
                    </Button>
                    <Button onClick={clearPoints} variant="outline">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Clear All
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Map */}
            <div>
              <h4 className="font-medium mb-4">3. Interactive Map</h4>
              <div className="border rounded-lg overflow-hidden">
                {/* Map Container */}
                <div 
                  ref={mapRef}
                  className="relative w-full h-96 bg-gray-100 cursor-crosshair select-none overflow-hidden"
                  onClick={mode === 'manual' ? addCustomPoint : undefined}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  {/* Satellite imagery background or fallback */}
                  {loadingImage ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                      <div className="text-gray-600">Loading satellite image...</div>
                    </div>
                  ) : satelliteImage ? (
                    <Image 
                      src={satelliteImage} 
                      alt="Satellite view"
                      fill
                      className="object-cover"
                      unoptimized // Since it's a dynamic satellite image
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-green-200 via-green-300 to-green-400 opacity-70"></div>
                  )}
                  
                  {/* Grid overlay for reference */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <defs>
                      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff20" strokeWidth="1"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>

                  {/* Zoom Controls */}
                  <div className="absolute top-4 right-4 flex flex-col space-y-2 z-10">
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-white/90 hover:bg-white/100 p-2"
                      onClick={zoomIn}
                      disabled={currentZoom >= 20}
                      title="Zoom In"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <div className="bg-white/90 px-2 py-1 rounded text-xs font-mono text-center">
                      Z{currentZoom}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-white/90 hover:bg-white/100 p-2"
                      onClick={zoomOut}
                      disabled={currentZoom <= 10}
                      title="Zoom Out"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Center marker - only show if coordinates are set */}
                  {(coordinates.centerLat !== '' && coordinates.centerLng !== '') && (
                    <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-500">
                      <MapPin className="h-6 w-6" />
                    </div>
                  )}

                  {/* Field boundary polygon */}
                  {points.length > 2 && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      <polygon
                        points={points.map(p => `${p.x},${p.y}`).join(' ')}
                        fill="rgba(34, 197, 94, 0.3)"
                        stroke="rgb(34, 197, 94)"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                      />
                    </svg>
                  )}

                  {/* Field boundary lines */}
                  {points.length > 1 && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      {points.map((point, index) => {
                        const nextPoint = points[(index + 1) % points.length]
                        return (
                          <line
                            key={`line-${index}`}
                            x1={point.x}
                            y1={point.y}
                            x2={nextPoint.x}
                            y2={nextPoint.y}
                            stroke="rgb(34, 197, 94)"
                            strokeWidth="2"
                          />
                        )
                      })}
                    </svg>
                  )}

                  {/* Draggable points */}
                  {points.map((point, index) => (
                    <div
                      key={point.id}
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-move ${
                        point.isDragging ? 'scale-125' : 'hover:scale-110'
                      } transition-transform`}
                      style={{ left: point.x, top: point.y }}
                      onMouseDown={(e) => handleMouseDown(e, point.id)}
                    >
                      <div className="w-4 h-4 bg-crops-green-600 border-2 border-white rounded-full shadow-lg flex items-center justify-center">
                        <span className="text-xs text-white font-bold">{index + 1}</span>
                      </div>
                    </div>
                  ))}

                  {/* Instructions overlay */}
                  {mode === 'manual' && points.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white bg-opacity-90 rounded-lg p-4 text-center">
                        <Shapes className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                        <p className="font-medium text-gray-800">Click to add points</p>
                        <p className="text-sm text-gray-600">Create your field boundary</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Map Info Bar */}
                <div className="bg-gray-50 px-4 py-2 flex justify-between items-center text-sm">
                  <div className="flex space-x-4">
                    <span>Points: {points.length}</span>
                    <span>Area: {calculateArea().toFixed(2)} ha</span>
                    <span>Zoom: {currentZoom}</span>
                    <span>Center: {mapCenter.lat !== 0 ? `${mapCenter.lat.toFixed(4)}, ${mapCenter.lng.toFixed(4)}` : 'Not set'}</span>
                  </div>
                  <div className="text-gray-500">
                    {mode === 'manual' ? 'Click to add • Drag to move • Zoom for detail' : 'Satellite detection mode'}
                  </div>
                </div>
              </div>
            </div>

            {/* Detected Fields List */}
            {detectedFields.length > 0 && (
              <div>
                <h4 className="font-medium mb-4">4. Detected Fields</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-40 overflow-y-auto">
                  {detectedFields.map((field, index) => (
                    <div
                      key={index}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedField === index
                          ? 'border-crops-green-500 bg-crops-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => selectDetectedField(index)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">Field {index + 1}</h5>
                        <Badge variant="outline">
                          {Math.round(field.confidence * 100)}% match
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>Area: {field.area?.toFixed(2) || 'Unknown'} hectares</div>
                        <div>Shape: {field.characteristics?.shape || 'Polygon'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={confirmField}
                disabled={points.length < 3}
                className="bg-crops-green-600 hover:bg-crops-green-700"
              >
                <Check className="h-4 w-4 mr-2" />
                Use This Field ({points.length} points)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}