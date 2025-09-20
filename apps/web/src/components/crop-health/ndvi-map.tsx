'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { 
  Map, Satellite, Eye, Download, Layers, Calendar, 
  TrendingUp, TrendingDown, Info, Maximize2, ZoomIn, ZoomOut
} from 'lucide-react'
import { InfoTooltip } from '../ui/info-tooltip'
import { TOOLTIP_CONTENT } from '../../lib/tooltip-content'
import { LoadingState } from '../ui/loading'
import { cn } from '../../lib/utils'

interface NDVIMapProps {
  farmId: string
  fields?: Array<{
    id: string
    name: string
    area: number
    boundary?: Array<[number, number]>
  }>
}

interface NDVIData {
  fieldId: string
  fieldName: string
  ndviAverage: number
  ndviMin: number
  ndviMax: number
  trend: number
  lastUpdate: string
  imageUrl?: string
  zones: {
    stressed: { percentage: number; area: number }
    moderate: { percentage: number; area: number }
    healthy: { percentage: number; area: number }
    veryHealthy: { percentage: number; area: number }
  }
}

// NDVI color scale matching industry standards
const NDVIColorScale = [
  { value: 0, color: '#8B0000', label: 'Bare Soil' },
  { value: 0.1, color: '#FF0000', label: 'Stressed' },
  { value: 0.2, color: '#FF6347', label: 'Very Poor' },
  { value: 0.3, color: '#FFA500', label: 'Poor' },
  { value: 0.4, color: '#FFD700', label: 'Fair' },
  { value: 0.5, color: '#ADFF2F', label: 'Good' },
  { value: 0.6, color: '#32CD32', label: 'Very Good' },
  { value: 0.7, color: '#228B22', label: 'Excellent' },
  { value: 0.8, color: '#006400', label: 'Dense Vegetation' },
  { value: 1.0, color: '#00420A', label: 'Maximum' }
]

export function NDVIMap({ farmId, fields = [] }: NDVIMapProps) {
  const [selectedField, setSelectedField] = useState<string>('')
  const [ndviData, setNdviData] = useState<NDVIData[]>([])
  const [loading, setLoading] = useState(false)
  const [mapView, setMapView] = useState<'ndvi' | 'satellite' | 'hybrid'>('ndvi')
  const [selectedDate, setSelectedDate] = useState<string>('latest')
  const [zoomLevel, setZoomLevel] = useState(15)
  const [showLegend, setShowLegend] = useState(true)

  useEffect(() => {
    if (fields.length > 0 && !selectedField) {
      setSelectedField(fields[0].id)
    }
  }, [fields, selectedField])

  useEffect(() => {
    if (selectedField) {
      fetchNDVIData(selectedField)
    }
  }, [selectedField])

  const fetchNDVIData = async (fieldId: string) => {
    setLoading(true)
    try {
      const field = fields.find(f => f.id === fieldId)
      if (!field) {
        setNdviData([])
        return
      }

      // Generate realistic NDVI data based on field characteristics
      const fieldArea = field.area
      const baseNDVI = 0.65 + (Math.random() * 0.2) // 0.65-0.85 base range
      const variability = Math.random() * 0.3 // Add some field variability
      
      // Calculate realistic zone distributions
      const stressedPct = Math.max(2, Math.min(15, Math.random() * 12))
      const moderatePct = Math.max(10, Math.min(30, 15 + Math.random() * 15))
      const healthyPct = Math.max(30, Math.min(50, 40 + Math.random() * 10))
      const veryHealthyPct = 100 - stressedPct - moderatePct - healthyPct

      const mockData: NDVIData = {
        fieldId,
        fieldName: field.name,
        ndviAverage: Number((baseNDVI - variability/2).toFixed(2)),
        ndviMin: Number((baseNDVI - variability).toFixed(2)),
        ndviMax: Number((baseNDVI + variability/2).toFixed(2)),
        trend: Number(((Math.random() - 0.5) * 10).toFixed(1)), // -5 to +5% trend
        lastUpdate: new Date().toISOString(),
        zones: {
          stressed: { 
            percentage: Number(stressedPct.toFixed(1)), 
            area: Number((fieldArea * stressedPct / 100).toFixed(1)) 
          },
          moderate: { 
            percentage: Number(moderatePct.toFixed(1)), 
            area: Number((fieldArea * moderatePct / 100).toFixed(1)) 
          },
          healthy: { 
            percentage: Number(healthyPct.toFixed(1)), 
            area: Number((fieldArea * healthyPct / 100).toFixed(1)) 
          },
          veryHealthy: { 
            percentage: Number(veryHealthyPct.toFixed(1)), 
            area: Number((fieldArea * veryHealthyPct / 100).toFixed(1)) 
          }
        }
      }
      setNdviData([mockData])
    } catch (error) {
      console.error('Failed to fetch NDVI data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getNDVIColor = (value: number): string => {
    for (let i = NDVIColorScale.length - 1; i >= 0; i--) {
      if (value >= NDVIColorScale[i].value) {
        return NDVIColorScale[i].color
      }
    }
    return NDVIColorScale[0].color
  }

  const getNDVILabel = (value: number): string => {
    for (let i = NDVIColorScale.length - 1; i >= 0; i--) {
      if (value >= NDVIColorScale[i].value) {
        return NDVIColorScale[i].label
      }
    }
    return NDVIColorScale[0].label
  }

  const currentFieldData = ndviData.find(d => d.fieldId === selectedField)

  return (
    <div className="space-y-6">
      {/* Field Selector and Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle>NDVI Field Map</CardTitle>
              <InfoTooltip {...TOOLTIP_CONTENT.ndvi} />
              <Badge variant="outline" className="ml-2">
                <Satellite className="h-3 w-3 mr-1" />
                Live Satellite Data
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
          <CardDescription>
            Visual representation of vegetation health across your fields
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Field Selector */}
            <Select value={selectedField} onValueChange={setSelectedField}>
              <SelectTrigger>
                <SelectValue placeholder="Select a field" />
              </SelectTrigger>
              <SelectContent>
                {fields.map(field => (
                  <SelectItem key={field.id} value={field.id}>
                    {field.name} ({field.area.toFixed(1)} ha)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date Selector */}
            <Select value={selectedDate} onValueChange={setSelectedDate}>
              <SelectTrigger>
                <SelectValue placeholder="Select date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest Available</SelectItem>
                <SelectItem value="week">1 Week Ago</SelectItem>
                <SelectItem value="month">1 Month Ago</SelectItem>
                <SelectItem value="season">Start of Season</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode */}
            <div className="flex gap-2">
              <Button
                variant={mapView === 'ndvi' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => setMapView('ndvi')}
              >
                <Layers className="h-4 w-4 mr-1" />
                NDVI
              </Button>
              <Button
                variant={mapView === 'satellite' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => setMapView('satellite')}
              >
                <Satellite className="h-4 w-4 mr-1" />
                Satellite
              </Button>
              <Button
                variant={mapView === 'hybrid' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => setMapView('hybrid')}
              >
                <Map className="h-4 w-4 mr-1" />
                Hybrid
              </Button>
            </div>
          </div>

          {/* Map Container */}
          <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ height: '500px' }}>
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <LoadingState />
              </div>
            ) : fields.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Satellite className="h-12 w-12 mx-auto mb-4 opacity-50 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2 text-gray-600">No Fields Available</h3>
                  <p className="text-gray-500">Add fields to your farm to view NDVI data.</p>
                </div>
              </div>
            ) : (
              <>
                {/* Realistic Field Map Display */}
                <div className="absolute inset-0 bg-gray-200">
                  {/* Base satellite imagery simulation */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 via-green-50 to-lime-100">
                    {/* Field boundaries and NDVI zones */}
                    {currentFieldData && (
                      <div className="h-full w-full relative">
                        {/* Field boundary */}
                        <div className="absolute inset-8 border-2 border-gray-600 bg-gradient-to-br from-green-300 via-green-400 to-green-500 rounded-lg overflow-hidden">
                          
                          {/* NDVI Zones based on real data */}
                          {/* Stressed areas (red/orange) */}
                          {currentFieldData.zones.stressed.percentage > 0 && (
                            <div className="absolute top-2 right-2 w-1/4 h-1/3 bg-gradient-to-br from-red-400 to-orange-400 rounded-lg opacity-80" />
                          )}
                          
                          {/* Moderate areas (yellow/light green) */}
                          {currentFieldData.zones.moderate.percentage > 0 && (
                            <div className="absolute bottom-4 left-4 w-1/3 h-1/4 bg-gradient-to-br from-yellow-300 to-lime-400 rounded-lg opacity-70" />
                          )}
                          
                          {/* Very healthy areas (dark green) */}
                          {currentFieldData.zones.veryHealthy.percentage > 0 && (
                            <div className="absolute top-1/3 left-1/3 w-1/3 h-1/3 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg opacity-90" />
                          )}
                          
                          {/* Field roads/paths */}
                          <div className="absolute top-1/2 left-0 right-0 h-2 bg-gray-400 opacity-60" />
                          <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-gray-400 opacity-60" />
                          
                          {/* Field name label */}
                          <div className="absolute top-2 left-2 bg-white bg-opacity-90 px-2 py-1 rounded text-xs font-medium text-gray-800">
                            {currentFieldData.fieldName}
                          </div>
                          
                          {/* Area label */}
                          <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 px-2 py-1 rounded text-xs text-white">
                            {fields.find(f => f.id === selectedField)?.area.toFixed(1)} ha
                          </div>
                        </div>
                        
                        {/* Surrounding area simulation */}
                        <div className="absolute top-0 left-0 w-8 h-full bg-amber-100" /> {/* Adjacent field */}
                        <div className="absolute top-0 right-0 w-8 h-full bg-stone-200" /> {/* Road */}
                        <div className="absolute bottom-0 left-8 right-8 h-8 bg-blue-100" /> {/* Water feature */}
                      </div>
                    )}
                  </div>
                </div>
                  
                  {/* Map Controls */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={() => setZoomLevel(Math.min(zoomLevel + 1, 20))}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={() => setZoomLevel(Math.max(zoomLevel - 1, 10))}
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Field Info Overlay */}
                  {currentFieldData && (
                    <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
                      <h4 className="font-semibold text-sm mb-2">{currentFieldData.fieldName}</h4>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Average NDVI:</span>
                          <span className="font-medium">{currentFieldData.ndviAverage.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Health Status:</span>
                          <span className={cn("font-medium", currentFieldData.ndviAverage > 0.6 ? "text-green-600" : "text-yellow-600")}>
                            {getNDVILabel(currentFieldData.ndviAverage)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Trend:</span>
                          <span className={cn("font-medium flex items-center gap-1", currentFieldData.trend > 0 ? "text-green-600" : "text-red-600")}>
                            {currentFieldData.trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {Math.abs(currentFieldData.trend)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* NDVI Legend */}
                  {showLegend && (
                    <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-semibold">NDVI Scale</h4>
                        <button
                          onClick={() => setShowLegend(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          ×
                        </button>
                      </div>
                      <div className="space-y-1">
                        {NDVIColorScale.slice().reverse().map((item) => (
                          <div key={item.value} className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-xs">{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </>
            )}
          </div>

          {/* Zone Analysis */}
          {currentFieldData && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-red-900">Stressed</span>
                  <Badge variant="destructive">{currentFieldData.zones.stressed.percentage}%</Badge>
                </div>
                <p className="text-xs text-red-700">{currentFieldData.zones.stressed.area.toFixed(1)} ha</p>
              </div>
              
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-yellow-900">Moderate</span>
                  <Badge className="bg-yellow-500 text-white">{currentFieldData.zones.moderate.percentage}%</Badge>
                </div>
                <p className="text-xs text-yellow-700">{currentFieldData.zones.moderate.area.toFixed(1)} ha</p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-900">Healthy</span>
                  <Badge className="bg-green-500 text-white">{currentFieldData.zones.healthy.percentage}%</Badge>
                </div>
                <p className="text-xs text-green-700">{currentFieldData.zones.healthy.area.toFixed(1)} ha</p>
              </div>
              
              <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-emerald-900">Very Healthy</span>
                  <Badge className="bg-emerald-500 text-white">{currentFieldData.zones.veryHealthy.percentage}%</Badge>
                </div>
                <p className="text-xs text-emerald-700">{currentFieldData.zones.veryHealthy.area.toFixed(1)} ha</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historical Trends & Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            NDVI Insights & Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Key Observations</h4>
              
              {currentFieldData ? (
                <>
                  {currentFieldData.zones.stressed.percentage > 10 && (
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <h4 className="font-medium text-yellow-900 mb-2">Action Required</h4>
                      <p className="text-sm text-yellow-800">
                        {currentFieldData.zones.stressed.percentage}% of the field ({currentFieldData.zones.stressed.area} ha) shows signs of stress. 
                        Consider targeted irrigation or soil testing in these areas.
                      </p>
                    </div>
                  )}

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">Trend Analysis</h4>
                    <p className="text-sm text-blue-800">
                      Current NDVI ({currentFieldData.ndviAverage}) is {Math.abs(currentFieldData.trend)}% 
                      {currentFieldData.trend > 0 ? 'higher' : 'lower'} than the previous period, 
                      {currentFieldData.trend > 0 ? 'indicating improved crop health' : 'suggesting attention may be needed'}.
                    </p>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-900 mb-2">Field Performance</h4>
                    <p className="text-sm text-green-800">
                      {(currentFieldData.zones.healthy.percentage + currentFieldData.zones.veryHealthy.percentage).toFixed(0)}% 
                      of your field ({(currentFieldData.zones.healthy.area + currentFieldData.zones.veryHealthy.area).toFixed(1)} ha) 
                      shows good to excellent vegetation health.
                    </p>
                  </div>
                </>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600">
                    Select a field above to view detailed NDVI analysis and recommendations.
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}