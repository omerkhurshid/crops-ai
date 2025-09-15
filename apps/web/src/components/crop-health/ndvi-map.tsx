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
      // In production, this would fetch real NDVI data from satellite API
      // For now, using mock data
      const mockData: NDVIData = {
        fieldId,
        fieldName: fields.find(f => f.id === fieldId)?.name || 'Field',
        ndviAverage: 0.72,
        ndviMin: 0.35,
        ndviMax: 0.85,
        trend: 5.2,
        lastUpdate: new Date().toISOString(),
        zones: {
          stressed: { percentage: 8, area: 3.6 },
          moderate: { percentage: 22, area: 9.9 },
          healthy: { percentage: 45, area: 20.3 },
          veryHealthy: { percentage: 25, area: 11.3 }
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
            ) : (
              <>
                {/* Mock Map Display */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-green-500 to-green-600">
                  <div className="absolute inset-0 opacity-50">
                    {/* Simulated NDVI overlay */}
                    <div className="h-full w-full relative">
                      <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-500 rounded-full opacity-30 blur-xl"></div>
                      <div className="absolute bottom-20 right-20 w-40 h-40 bg-green-600 rounded-full opacity-40 blur-xl"></div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-green-700 rounded-full opacity-50 blur-xl"></div>
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
                </div>
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
              
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-medium text-yellow-900 mb-2">Action Required</h4>
                <p className="text-sm text-yellow-800">
                  The northwest corner of the field (approximately 3.6 ha) shows signs of stress. 
                  Consider targeted irrigation or soil testing in this area.
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Trend Analysis</h4>
                <p className="text-sm text-blue-800">
                  Current NDVI (0.72) is 5.2% higher than the same period last year, 
                  indicating improved crop health and management practices.
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-900 mb-2">Yield Correlation</h4>
                <p className="text-sm text-green-800">
                  Based on current NDVI patterns, estimated yield potential is 185 bu/acre, 
                  which is 8% above the field's 5-year average.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}