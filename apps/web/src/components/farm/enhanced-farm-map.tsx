'use client'
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { 
  MapPin, 
  Palette, 
  Sprout, 
  BarChart3, 
  Calendar,
  Activity,
  Droplets,
  Thermometer,
  Eye,
  EyeOff,
  Loader2,
  Info,
  TrendingUp,
  TrendingDown,
  AlertTriangle
} from 'lucide-react'
interface Field {
  id: string
  name: string
  area: number
  color?: string | null
  cropType?: string | null
  status?: string | null
  ndvi?: number
  ndviChange?: number
  stressLevel?: 'none' | 'low' | 'moderate' | 'high' | 'severe'
  lastAnalysisDate?: string
  soilMoisture?: number
  temperature?: number
}
interface Farm {
  id: string
  name: string
  latitude?: number | null
  longitude?: number | null
  totalArea?: number
  fields?: Field[]
}
interface EnhancedFarmMapProps {
  farm: Farm
}
// NDVI color scale (red to green)
const getNDVIColor = (ndvi: number) => {
  if (ndvi < 0.2) return '#ff4444' // Red - Bare soil/Very poor
  if (ndvi < 0.3) return '#ff8844' // Orange - Poor
  if (ndvi < 0.4) return '#ffaa44' // Yellow - Fair
  if (ndvi < 0.5) return '#88dd44' // Light green - Good
  if (ndvi < 0.6) return '#44dd44' // Green - Very good
  return '#00aa00' // Dark green - Excellent
}
const getStressColor = (stressLevel: string) => {
  switch (stressLevel) {
    case 'none': return '#00aa00'
    case 'low': return '#88dd44'
    case 'moderate': return '#ffaa44'
    case 'high': return '#ff8844'
    case 'severe': return '#ff4444'
    default: return '#cccccc'
  }
}
export function EnhancedFarmMap({ farm }: EnhancedFarmMapProps) {
  const [selectedField, setSelectedField] = useState<Field | null>(null)
  const [showNDVI, setShowNDVI] = useState(true)
  const [loading, setLoading] = useState(true)
  const [fields, setFields] = useState<Field[]>([])
  // Fetch field data with NDVI
  useEffect(() => {
    async function fetchFieldData() {
      try {
        const response = await fetch(`/api/farms/${farm.id}/fields-with-ndvi`)
        if (response.ok) {
          const data = await response.json()
          setFields(data)
        }
      } catch (error) {
        console.error('Failed to fetch field data:', error)
        // Use farm fields if available
        if (farm.fields) {
          setFields(farm.fields)
        }
      } finally {
        setLoading(false)
      }
    }
    fetchFieldData()
  }, [farm.id, farm.fields])
  if (loading) {
    return (
      <Card className="bg-surface rounded-card shadow-fk-md border border-fk-border">
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-fk-primary" />
            <p className="text-fk-text-muted">Loading farm map data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }
  return (
    <div className="space-y-6">
      {/* Map Controls */}
      <Card className="bg-surface rounded-card shadow-fk-sm border border-fk-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-fk-text flex items-center gap-2">
              <MapPin className="h-5 w-5 text-fk-primary" />
              Farm Map View
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={showNDVI ? "default" : "outline"}
                size="sm"
                onClick={() => setShowNDVI(!showNDVI)}
                className={showNDVI ? "bg-fk-primary hover:bg-fk-primary-600" : ""}
              >
                {showNDVI ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
                NDVI
              </Button>
              <Badge className="bg-fk-info/10 text-fk-info border-fk-info/30">
                {fields.length} Fields
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Placeholder - In a real implementation, this would be an actual map */}
        <div className="lg:col-span-2">
          <Card className="bg-surface rounded-card shadow-fk-md border border-fk-border h-[600px]">
            <CardContent className="p-0 h-full relative">
              {/* Simplified map visualization */}
              <div className="absolute inset-0 bg-gradient-to-br from-fk-primary/5 to-fk-accent-sky/5">
                <div className="grid grid-cols-3 gap-4 p-8 h-full">
                  {fields.length > 0 ? (
                    fields.map((field, index) => (
                      <div
                        key={field.id}
                        className="relative group cursor-pointer"
                        onClick={() => setSelectedField(field)}
                      >
                        <div
                          className="h-full rounded-lg border-2 border-white shadow-lg transition-all duration-micro hover:scale-105 hover:shadow-xl"
                          style={{
                            backgroundColor: showNDVI && field.ndvi 
                              ? getNDVIColor(field.ndvi)
                              : field.color || '#88dd44',
                            opacity: selectedField?.id === field.id ? 1 : 0.8
                          }}
                        >
                          <div className="p-4 h-full flex flex-col justify-between">
                            <div>
                              <h4 className="font-bold text-white text-shadow">{field.name}</h4>
                              <p className="text-sm text-white/90 text-shadow">{field.area} ha</p>
                            </div>
                            {showNDVI && field.ndvi && (
                              <div className="bg-black/20 rounded p-2">
                                <p className="text-xs text-white font-medium">
                                  NDVI: {field.ndvi.toFixed(2)}
                                </p>
                                {field.ndviChange !== undefined && (
                                  <p className="text-xs text-white flex items-center gap-1">
                                    {field.ndviChange > 0 ? (
                                      <TrendingUp className="h-3 w-3" />
                                    ) : (
                                      <TrendingDown className="h-3 w-3" />
                                    )}
                                    {Math.abs(field.ndviChange).toFixed(1)}%
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 flex items-center justify-center h-full">
                      <div className="text-center">
                        <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50 text-fk-text-muted" />
                        <h3 className="text-lg font-semibold mb-2 text-fk-text-muted">No fields mapped yet</h3>
                        <p className="text-fk-text-muted">Add fields to see them on the map</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {/* Map Legend */}
              {showNDVI && fields.length > 0 && (
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur rounded-lg p-3 shadow-lg">
                  <h4 className="text-xs font-bold mb-2 text-fk-text">NDVI Scale</h4>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#00aa00' }}></div>
                      <span className="text-xs">Excellent ({'>'}0.6)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#44dd44' }}></div>
                      <span className="text-xs">Very Good (0.5-0.6)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#88dd44' }}></div>
                      <span className="text-xs">Good (0.4-0.5)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ffaa44' }}></div>
                      <span className="text-xs">Fair (0.3-0.4)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ff8844' }}></div>
                      <span className="text-xs">Poor (0.2-0.3)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ff4444' }}></div>
                      <span className="text-xs">Very Poor ({'<'}0.2)</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        {/* Field Details Panel */}
        <div className="lg:col-span-1">
          <Card className="bg-surface rounded-card shadow-fk-md border border-fk-border">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-fk-text">
                {selectedField ? 'Field Details' : 'Select a Field'}
              </CardTitle>
              <CardDescription>
                {selectedField ? 'Current health metrics and information' : 'Click on a field to view details'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedField ? (
                <div className="space-y-4">
                  {/* Field Info */}
                  <div>
                    <h3 className="font-bold text-lg text-fk-text mb-2">{selectedField.name}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-fk-text-muted">Area:</span>
                        <span className="text-sm font-medium">{selectedField.area} ha</span>
                      </div>
                      {selectedField.cropType && (
                        <div className="flex justify-between">
                          <span className="text-sm text-fk-text-muted">Crop:</span>
                          <span className="text-sm font-medium">{selectedField.cropType}</span>
                        </div>
                      )}
                      {selectedField.status && (
                        <div className="flex justify-between">
                          <span className="text-sm text-fk-text-muted">Status:</span>
                          <Badge className="text-xs">{selectedField.status}</Badge>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* NDVI Health Metrics */}
                  {selectedField.ndvi !== undefined && (
                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-sm text-fk-text mb-3 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-fk-primary" />
                        Vegetation Health
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-fk-text-muted">NDVI Score</span>
                            <span className="text-sm font-bold" style={{ color: getNDVIColor(selectedField.ndvi) }}>
                              {selectedField.ndvi.toFixed(2)}
                            </span>
                          </div>
                          <div className="w-full bg-[#F5F5F5] rounded-full h-2">
                            <div 
                              className="h-2 rounded-full transition-all duration-standard"
                              style={{ 
                                width: `${selectedField.ndvi * 100}%`,
                                backgroundColor: getNDVIColor(selectedField.ndvi)
                              }}
                            ></div>
                          </div>
                        </div>
                        {selectedField.ndviChange !== undefined && (
                          <div className="flex items-center justify-between p-3 bg-fk-primary/5 rounded-lg">
                            <span className="text-sm">Change (7 days)</span>
                            <span className={`text-sm font-bold flex items-center gap-1 ${
                              selectedField.ndviChange > 0 ? 'text-fk-success' : 'text-fk-danger'
                            }`}>
                              {selectedField.ndviChange > 0 ? (
                                <TrendingUp className="h-4 w-4" />
                              ) : (
                                <TrendingDown className="h-4 w-4" />
                              )}
                              {Math.abs(selectedField.ndviChange).toFixed(1)}%
                            </span>
                          </div>
                        )}
                        {selectedField.stressLevel && (
                          <div className="flex items-center justify-between p-3 bg-fk-warning/5 rounded-lg">
                            <span className="text-sm flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-fk-warning" />
                              Stress Level
                            </span>
                            <Badge 
                              className="text-xs"
                              style={{ 
                                backgroundColor: `${getStressColor(selectedField.stressLevel)}20`,
                                color: getStressColor(selectedField.stressLevel),
                                borderColor: getStressColor(selectedField.stressLevel)
                              }}
                            >
                              {selectedField.stressLevel}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {/* Additional Metrics */}
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-sm text-fk-text mb-3">Environmental Conditions</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-fk-info/5 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Droplets className="h-4 w-4 text-fk-info" />
                          <span className="text-xs text-fk-text-muted">Soil Moisture</span>
                        </div>
                        <p className="text-lg font-bold text-fk-text">
                          {selectedField.soilMoisture || 'N/A'}%
                        </p>
                      </div>
                      <div className="p-3 bg-fk-accent-wheat/5 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Thermometer className="h-4 w-4 text-fk-accent-wheat" />
                          <span className="text-xs text-fk-text-muted">Temperature</span>
                        </div>
                        <p className="text-lg font-bold text-fk-text">
                          {selectedField.temperature || 'N/A'}°C
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Last Analysis */}
                  {selectedField.lastAnalysisDate && (
                    <div className="text-xs text-fk-text-muted text-center pt-2">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      Last updated: {new Date(selectedField.lastAnalysisDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Info className="h-12 w-12 mx-auto mb-4 opacity-50 text-fk-text-muted" />
                  <p className="text-fk-text-muted">Click on any field in the map to view its details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Farm Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-surface rounded-card shadow-fk-sm border border-fk-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-fk-text-muted">Average NDVI</p>
                <p className="text-2xl font-bold text-fk-success">
                  {(fields || []).length > 0 
                    ? ((fields || []).reduce((sum, f) => sum + (f.ndvi || 0), 0) / (fields || []).filter(f => f.ndvi).length).toFixed(2)
                    : 'N/A'}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-fk-success" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-surface rounded-card shadow-fk-sm border border-fk-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-fk-text-muted">Healthy Fields</p>
                <p className="text-2xl font-bold text-fk-primary">
                  {(fields || []).filter(f => f.ndvi && f.ndvi > 0.5).length}/{(fields || []).length}
                </p>
              </div>
              <Activity className="h-8 w-8 text-fk-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-surface rounded-card shadow-fk-sm border border-fk-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-fk-text-muted">Stressed Areas</p>
                <p className="text-2xl font-bold text-fk-warning">
                  {(fields || []).filter(f => f.stressLevel && f.stressLevel !== 'none' && f.stressLevel !== 'low').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-fk-warning" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-surface rounded-card shadow-fk-sm border border-fk-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-fk-text-muted">Total Area</p>
                <p className="text-2xl font-bold text-fk-earth">
                  {farm.totalArea} ha
                </p>
              </div>
              <MapPin className="h-8 w-8 text-fk-earth" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
// Add text shadow utility
const styles = `
  .text-shadow {
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  }
`
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}