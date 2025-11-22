'use client'
import React, { useState, useEffect } from 'react'
import { GoogleMap, LoadScript, Polygon, Marker, InfoWindow } from '@react-google-maps/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { 
  MapPin, 
  Palette, 
  Sprout, 
  BarChart3, 
  Calendar,
  Edit3,
  Save,
  X,
  Eye,
  EyeOff,
  Loader2,
  Info
} from 'lucide-react'
const libraries: ("drawing" | "geometry")[] = ["drawing", "geometry"]
interface Farm {
  id: string
  name: string
  latitude: number
  longitude: number
  totalArea: number
  address?: string
  boundary?: Array<{ lat: number; lng: number }>
}
interface Field {
  id: string
  name: string
  area: number
  color?: string
  cropType?: string
  status?: string
  boundary?: Array<{ lat: number; lng: number }>
  soilType?: string
  lastAnalysis?: {
    date: string
    ndvi: number
    stressLevel: string
  }
}
interface VisualFarmMapProps {
  farm: Farm
  onFieldUpdate?: (fieldId: string, updates: Partial<Field>) => void
}
const defaultFieldColors = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
  '#ec4899', // pink
  '#6b7280', // gray
]
const mapContainerStyle = {
  width: '100%',
  height: '500px'
}
export function VisualFarmMap({ farm, onFieldUpdate }: VisualFarmMapProps) {
  const [fields, setFields] = useState<Field[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedField, setSelectedField] = useState<Field | null>(null)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<Field>>({})
  const [visibleFields, setVisibleFields] = useState<Set<string>>(new Set())
  const [showInfoWindow, setShowInfoWindow] = useState(false)
  const [mapCenter, setMapCenter] = useState({ lat: farm.latitude, lng: farm.longitude })
  const [mapZoom, setMapZoom] = useState(15)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  // Fetch fields for this farm
  const fetchFields = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/fields?farmId=${farm.id}`)
      if (response.ok) {
        const data = await response.json()
        const farmFields = data.fields.filter((field: any) => field.farmId === farm.id)
        // Process fields and assign colors if not set
        const processedFields = farmFields.map((field: any, index: number) => ({
          id: field.id,
          name: field.name,
          area: field.area,
          color: field.color || defaultFieldColors[index % defaultFieldColors.length],
          cropType: field.cropType,
          status: field.status || 'active',
          soilType: field.soilType,
          lastAnalysis: field.lastAnalysis,
          // Parse boundary from database if it exists
          boundary: field.boundary ? parseFieldBoundary(field.boundary) : undefined
        }))
        setFields(processedFields)
        // Initially show all fields
        setVisibleFields(new Set(processedFields.map((f: Field) => f.id)))
      }
    } catch (error) {
      console.error('Error fetching fields:', error)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchFields()
  }, [farm.id])
  const handleLoadMap = () => {
    setShowMap(true)
  }
  // Parse field boundary from database format
  const parseFieldBoundary = (boundary: any): Array<{ lat: number; lng: number }> | undefined => {
    try {
      if (typeof boundary === 'string') {
        return JSON.parse(boundary)
      }
      if (Array.isArray(boundary)) {
        return boundary
      }
      return undefined
    } catch {
      return undefined
    }
  }
  const handleFieldClick = (field: Field) => {
    setSelectedField(field)
    setShowInfoWindow(true)
  }
  const startEditing = (field: Field) => {
    setEditingField(field.id)
    setEditData({
      name: field.name,
      color: field.color,
      cropType: field.cropType,
      status: field.status
    })
  }
  const saveFieldEdits = async () => {
    if (!editingField || !editData) return
    try {
      const response = await fetch(`/api/fields/${editingField}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      })
      if (response.ok) {
        // Update local state
        setFields(prev => prev.map(field => 
          field.id === editingField 
            ? { ...field, ...editData }
            : field
        ))
        // Callback to parent component
        if (onFieldUpdate && editingField) {
          onFieldUpdate(editingField, editData)
        }
        setEditingField(null)
        setEditData({})
      }
    } catch (error) {
      console.error('Error updating field:', error)
    }
  }
  const toggleFieldVisibility = (fieldId: string) => {
    setVisibleFields(prev => {
      const newSet = new Set(prev)
      if (newSet.has(fieldId)) {
        newSet.delete(fieldId)
      } else {
        newSet.add(fieldId)
      }
      return newSet
    })
  }
  const formatArea = (area: number) => {
    return `${area.toFixed(1)} acres`
  }
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-[#F8FAF8] text-[#7A8F78]'
      case 'fallow': return 'bg-yellow-100 text-yellow-800'
      case 'preparation': return 'bg-blue-100 text-[#7A8F78]'
      default: return 'bg-[#F5F5F5] text-[#1A1A1A]'
    }
  }
  if (!apiKey) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-[#555555]">
            Google Maps API key required for map visualization
          </div>
        </CardContent>
      </Card>
    )
  }
  return (
    <div className="space-y-6">
      {/* Farm Map */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {farm.name} - Field Map
          </CardTitle>
          <CardDescription>
            Interactive map showing farm boundaries and color-coded fields
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg overflow-hidden border">
            {!showMap ? (
              <div className="h-96 flex items-center justify-center bg-[#F5F5F5]">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-[#555555] mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">
                    Interactive Farm Map
                  </h3>
                  <p className="text-[#555555] mb-4 max-w-sm">
                    View your farm boundaries and color-coded fields in satellite view
                  </p>
                  <Button onClick={handleLoadMap} className="mb-2">
                    <MapPin className="h-4 w-4 mr-2" />
                    Load Map
                  </Button>
                  <p className="text-xs text-[#555555]">
                    {fields.length} fields ready to display
                  </p>
                </div>
              </div>
            ) : (
              <LoadScript
                googleMapsApiKey={apiKey}
                libraries={libraries}
                loadingElement={
                  <div className="h-96 flex items-center justify-center bg-[#F5F5F5]">
                    <div className="text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-[#555555]" />
                      <p className="text-sm text-[#555555]">Loading farm map...</p>
                    </div>
                  </div>
                }
              >
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={mapCenter}
                zoom={mapZoom}
                options={{
                  mapTypeId: 'satellite',
                  disableDefaultUI: false,
                  zoomControl: true,
                  mapTypeControl: true,
                  scaleControl: true,
                  streetViewControl: false,
                  rotateControl: false,
                  fullscreenControl: true
                }}
              >
                {/* Farm center marker */}
                <Marker 
                  position={{ lat: farm.latitude, lng: farm.longitude }}
                  title={farm.name}
                />
                {/* Farm boundary */}
                {farm.boundary && farm.boundary.length > 0 && (
                  <Polygon
                    paths={farm.boundary}
                    options={{
                      fillColor: '#22c55e',
                      fillOpacity: 0.1,
                      strokeColor: '#22c55e',
                      strokeOpacity: 0.8,
                      strokeWeight: 3,
                    }}
                  />
                )}
                {/* Field boundaries */}
                {fields.map((field) => (
                  field.boundary && 
                  field.boundary.length > 0 && 
                  visibleFields.has(field.id) && (
                    <Polygon
                      key={field.id}
                      paths={field.boundary}
                      options={{
                        fillColor: field.color,
                        fillOpacity: 0.4,
                        strokeColor: field.color,
                        strokeOpacity: 1,
                        strokeWeight: 2,
                        clickable: true
                      }}
                      onClick={() => handleFieldClick(field)}
                    />
                  )
                ))}
                {/* Info window for selected field */}
                {selectedField && showInfoWindow && selectedField.boundary && (
                  <InfoWindow
                    position={selectedField.boundary[0]}
                    onCloseClick={() => setShowInfoWindow(false)}
                  >
                    <div className="p-2 max-w-xs">
                      <h3 className="font-semibold">{selectedField.name}</h3>
                      <div className="text-sm space-y-1 mt-2">
                        <p>Area: {formatArea(selectedField.area)}</p>
                        {selectedField.cropType && (
                          <p>Crop: {selectedField.cropType}</p>
                        )}
                        {selectedField.status && (
                          <p>Status: {selectedField.status}</p>
                        )}
                        {selectedField.lastAnalysis && (
                          <p>Last NDVI: {selectedField.lastAnalysis.ndvi.toFixed(2)}</p>
                        )}
                      </div>
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
              </LoadScript>
            )}
          </div>
        </CardContent>
      </Card>
      {/* Field Management Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Field List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sprout className="h-5 w-5" />
                Field Management
              </CardTitle>
              <CardDescription>
                Manage field colors, crops, and visibility
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-[#F5F5F5] rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : fields.length === 0 ? (
                <div className="text-center py-8 text-[#555555]">
                  <Sprout className="h-12 w-12 mx-auto mb-4 text-[#555555]" />
                  <p>No fields found for this farm</p>
                  <p className="text-sm">Create fields in the farm creation flow</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {fields.map((field) => (
                    <div
                      key={field.id}
                      className={`border rounded-lg p-4 transition-all ${
                        visibleFields.has(field.id) 
                          ? 'border-[#E6E6E6] bg-white' 
                          : 'border-[#F5F5F5] bg-[#FAFAF7]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {/* Color indicator */}
                          <div
                            className="w-6 h-6 rounded-full border-2 border-[#E6E6E6]"
                            style={{ backgroundColor: field.color }}
                          />
                          <div className="flex-1">
                            {editingField === field.id ? (
                              <div className="space-y-2">
                                <Input
                                  value={editData.name || ''}
                                  onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                                  className="font-medium"
                                />
                                <div className="flex gap-2">
                                  <Input
                                    type="color"
                                    value={editData.color || field.color}
                                    onChange={(e) => setEditData(prev => ({ ...prev, color: e.target.value }))}
                                    className="w-16 h-8"
                                  />
                                  <Input
                                    placeholder="Crop type"
                                    value={editData.cropType || ''}
                                    onChange={(e) => setEditData(prev => ({ ...prev, cropType: e.target.value }))}
                                    className="flex-1"
                                  />
                                </div>
                              </div>
                            ) : (
                              <div>
                                <h3 className="font-medium">{field.name}</h3>
                                <div className="flex items-center gap-2 text-sm text-[#555555]">
                                  <span>{formatArea(field.area)}</span>
                                  {field.cropType && (
                                    <>
                                      <span>•</span>
                                      <span>{field.cropType}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {field.status && (
                            <Badge variant="secondary" className={getStatusColor(field.status)}>
                              {field.status}
                            </Badge>
                          )}
                          {editingField === field.id ? (
                            <div className="flex space-x-1">
                              <Button size="sm" onClick={saveFieldEdits}>
                                <Save className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingField(null)}>
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => startEditing(field)}>
                              <Edit3 className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleFieldVisibility(field.id)}
                          >
                            {visibleFields.has(field.id) ? (
                              <Eye className="h-3 w-3" />
                            ) : (
                              <EyeOff className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                      {/* Field stats */}
                      {field.lastAnalysis && (
                        <div className="mt-3 pt-3 border-t border-[#F5F5F5]">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-[#555555]">Last Analysis:</span>
                            <div className="flex items-center space-x-4">
                              <span>NDVI: {field.lastAnalysis.ndvi.toFixed(2)}</span>
                              <span className={`px-2 py-1 rounded text-xs ${
                                field.lastAnalysis.stressLevel === 'low' ? 'bg-[#F8FAF8] text-[#7A8F78]' :
                                field.lastAnalysis.stressLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {field.lastAnalysis.stressLevel} stress
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        {/* Summary Stats */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Farm Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-2xl font-bold">{fields.length}</div>
                  <div className="text-sm text-[#555555]">Total Fields</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{farm.totalArea.toFixed(1)}</div>
                  <div className="text-sm text-[#555555]">Total Acres</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {fields.reduce((sum, field) => sum + field.area, 0).toFixed(1)}
                  </div>
                  <div className="text-sm text-[#555555]">Mapped Acres</div>
                </div>
                {fields.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-[#555555] mb-2">Field Coverage</div>
                    <div className="w-full bg-[#F5F5F5] rounded-full h-2">
                      <div 
                        className="bg-[#7A8F78] h-2 rounded-full"
                        style={{ 
                          width: `${Math.min(100, (fields.reduce((sum, field) => sum + field.area, 0) / farm.totalArea) * 100)}%` 
                        }}
                      />
                    </div>
                    <div className="text-xs text-[#555555] mt-1">
                      {((fields.reduce((sum, field) => sum + field.area, 0) / farm.totalArea) * 100).toFixed(1)}% mapped
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Legend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-4 h-4 rounded bg-[#8FBF7F] opacity-40"></div>
                  <span>Farm Boundary</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-4 h-4 rounded bg-blue-500 opacity-60"></div>
                  <span>Field Boundaries</span>
                </div>
                <div className="text-xs text-[#555555] mt-2">
                  Click on fields to see details. Use eye icon to toggle visibility.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}