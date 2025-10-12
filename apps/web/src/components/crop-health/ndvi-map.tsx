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
import { getFarmerTerm, getTermDescription, convertNDVI } from '../../lib/farmer-language'

interface NDVIMapProps {
  farmId: string
  fields?: Array<{
    id: string
    name: string
    area: number
    boundary?: Array<[number, number]>
  }>
}

interface HealthData {
  fieldId: string
  fieldName: string
  healthAverage: number
  healthMin: number
  healthMax: number
  trend: number
  lastUpdate: string
  imageUrl?: string
  zones: {
    problemAreas: { percentage: number; area: number }
    averageAreas: { percentage: number; area: number }
    healthyAreas: { percentage: number; area: number }
    thrivingAreas: { percentage: number; area: number }
  }
}

// Plant health color scale for farmers
const HealthColorScale = [
  { value: 0, color: '#8B0000', label: 'No Plants' },
  { value: 0.1, color: '#FF0000', label: 'Problem Areas' },
  { value: 0.2, color: '#FF6347', label: 'Struggling' },
  { value: 0.3, color: '#FFA500', label: 'Needs Help' },
  { value: 0.4, color: '#FFD700', label: 'Getting Better' },
  { value: 0.5, color: '#ADFF2F', label: 'Healthy' },
  { value: 0.6, color: '#32CD32', label: 'Very Healthy' },
  { value: 0.7, color: '#228B22', label: 'Thriving' },
  { value: 0.8, color: '#006400', label: 'Excellent Growth' },
  { value: 1.0, color: '#00420A', label: 'Peak Health' }
]

export function NDVIMap({ farmId, fields = [] }: NDVIMapProps) {
  const [selectedField, setSelectedField] = useState<string>('')
  const [healthData, setHealthData] = useState<HealthData[]>([])
  const [loading, setLoading] = useState(false)
  const [mapView, setMapView] = useState<'health' | 'satellite' | 'hybrid'>('health')
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
      fetchHealthData(selectedField)
    }
  }, [selectedField])

  const fetchHealthData = async (fieldId: string) => {
    setLoading(true)
    try {
      const field = fields.find(f => f.id === fieldId)
      if (!field) {
        setHealthData([])
        return
      }

      // Try to fetch real plant health data from satellite service
      try {
        const healthResponse = await fetch(`/api/satellite/ndvi/${fieldId}`)
        if (healthResponse.ok) {
          const healthResult = await healthResponse.json()
          if (healthResult.data && healthResult.data.ndviData) {
            // Convert NDVI data to farmer-friendly health data
            const ndviData = healthResult.data.ndviData
            const healthData: HealthData = {
              fieldId: ndviData.fieldId,
              fieldName: ndviData.fieldName,
              healthAverage: ndviData.ndviAverage,
              healthMin: ndviData.ndviMin,
              healthMax: ndviData.ndviMax,
              trend: ndviData.trend,
              lastUpdate: ndviData.lastUpdate,
              imageUrl: ndviData.imageUrl,
              zones: {
                problemAreas: ndviData.zones.stressed,
                averageAreas: ndviData.zones.moderate,
                healthyAreas: ndviData.zones.healthy,
                thrivingAreas: ndviData.zones.veryHealthy
              }
            }
            setHealthData([healthData])
            return
          }
        }
      } catch (healthError) {
        console.error('Failed to fetch plant health data:', healthError)
      }
      
      // No real data available
      setHealthData([])
    } catch (error) {
      console.error('Failed to fetch NDVI data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getHealthColor = (value: number): string => {
    for (let i = HealthColorScale.length - 1; i >= 0; i--) {
      if (value >= HealthColorScale[i].value) {
        return HealthColorScale[i].color
      }
    }
    return HealthColorScale[0].color
  }

  const getHealthLabel = (value: number): string => {
    for (let i = HealthColorScale.length - 1; i >= 0; i--) {
      if (value >= HealthColorScale[i].value) {
        return HealthColorScale[i].label
      }
    }
    return HealthColorScale[0].label
  }

  const currentFieldData = healthData.find(d => d.fieldId === selectedField)

  return (
    <div className="space-y-6">
      {/* Field Selector and Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle>Plant Health Map</CardTitle>
              <InfoTooltip description="See how healthy your crops are from space" title="Plant Health Monitoring" />
              <Badge variant="outline" className="ml-2">
                <Satellite className="h-3 w-3 mr-1" />
                Live From Space
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
            See exactly where your crops are healthy (green) or need attention (red)
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
                variant={mapView === 'health' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => setMapView('health')}
              >
                <Layers className="h-4 w-4 mr-1" />
                Health View
              </Button>
              <Button
                variant={mapView === 'satellite' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => setMapView('satellite')}
              >
                <Satellite className="h-4 w-4 mr-1" />
                Photo View
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
                  <p className="text-gray-500">Add fields to your farm to see crop health data.</p>
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
                          
                          {/* Plant Health Zones based on real data */}
                          {/* Problem areas (red/orange) */}
                          {currentFieldData.zones.problemAreas.percentage > 0 && (
                            <div className="absolute top-2 right-2 w-1/4 h-1/3 bg-gradient-to-br from-red-400 to-orange-400 rounded-lg opacity-80" />
                          )}
                          
                          {/* Average areas (yellow/light green) */}
                          {currentFieldData.zones.averageAreas.percentage > 0 && (
                            <div className="absolute bottom-4 left-4 w-1/3 h-1/4 bg-gradient-to-br from-yellow-300 to-lime-400 rounded-lg opacity-70" />
                          )}
                          
                          {/* Thriving areas (dark green) */}
                          {currentFieldData.zones.thrivingAreas.percentage > 0 && (
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
                          <span className="text-gray-600">Plant Health Score:</span>
                          <span className="font-medium">{(currentFieldData.healthAverage * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Overall Status:</span>
                          <span className={cn("font-medium", currentFieldData.healthAverage > 0.6 ? "text-green-600" : "text-yellow-600")}>
                            {getHealthLabel(currentFieldData.healthAverage)}
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
                        <h4 className="text-xs font-semibold">Plant Health Guide</h4>
                        <button
                          onClick={() => setShowLegend(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          ×
                        </button>
                      </div>
                      <div className="space-y-1">
                        {HealthColorScale.slice().reverse().map((item) => (
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
                  <span className="text-sm font-medium text-red-900">Problem Areas</span>
                  <Badge variant="destructive">{currentFieldData.zones.problemAreas.percentage}%</Badge>
                </div>
                <p className="text-xs text-red-700">{currentFieldData.zones.problemAreas.area.toFixed(1)} ha</p>
              </div>
              
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-yellow-900">Average Areas</span>
                  <Badge className="bg-yellow-500 text-white">{currentFieldData.zones.averageAreas.percentage}%</Badge>
                </div>
                <p className="text-xs text-yellow-700">{currentFieldData.zones.averageAreas.area.toFixed(1)} ha</p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-900">Healthy Areas</span>
                  <Badge className="bg-green-500 text-white">{currentFieldData.zones.healthyAreas.percentage}%</Badge>
                </div>
                <p className="text-xs text-green-700">{currentFieldData.zones.healthyAreas.area.toFixed(1)} ha</p>
              </div>
              
              <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-emerald-900">Thriving Areas</span>
                  <Badge className="bg-emerald-500 text-white">{currentFieldData.zones.thrivingAreas.percentage}%</Badge>
                </div>
                <p className="text-xs text-emerald-700">{currentFieldData.zones.thrivingAreas.area.toFixed(1)} ha</p>
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
                  {currentFieldData.zones.problemAreas.percentage > 10 && (
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <h4 className="font-medium text-yellow-900 mb-2">Action Required</h4>
                      <p className="text-sm text-yellow-800">
                        {currentFieldData.zones.problemAreas.percentage}% of the field ({currentFieldData.zones.problemAreas.area} ha) shows signs of stress. 
                        Consider targeted irrigation or soil testing in these areas.
                      </p>
                    </div>
                  )}

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">Trend Analysis</h4>
                    <p className="text-sm text-blue-800">
                      Current Plant Health ({currentFieldData.healthAverage.toFixed(2)}) is {Math.abs(currentFieldData.trend)}% 
                      {currentFieldData.trend > 0 ? 'higher' : 'lower'} than the previous period, 
                      {currentFieldData.trend > 0 ? 'indicating improved crop health' : 'suggesting attention may be needed'}.
                    </p>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-900 mb-2">Field Performance</h4>
                    <p className="text-sm text-green-800">
                      {(currentFieldData.zones.healthyAreas.percentage + currentFieldData.zones.thrivingAreas.percentage).toFixed(0)}% 
                      of your field ({(currentFieldData.zones.healthyAreas.area + currentFieldData.zones.thrivingAreas.area).toFixed(1)} ha) 
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