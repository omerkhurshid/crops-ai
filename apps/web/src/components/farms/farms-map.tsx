'use client'

import React, { useState } from 'react'
import { ModernCard, ModernCardContent } from '../ui/modern-card'
import { TrafficLightStatus, getHealthStatus } from '../ui/traffic-light-status'
import { Badge } from '../ui/badge'
import { 
  MapPin, 
  Maximize2, 
  Minimize2, 
  Navigation, 
  Layers,
  TrendingUp,
  TrendingDown,
  Eye
} from 'lucide-react'
import { cn } from '../../lib/utils'

interface Farm {
  id: string
  name: string
  totalArea: number
  latitude: number
  longitude: number
  health: number
  healthTrend: number
  stressedAreas: number
  fieldsCount: number
  isPrimary?: boolean
}

interface FarmsMapProps {
  farms: Farm[]
  onFarmSelect: (farmId: string) => void
  selectedFarmId?: string
  className?: string
}

export function FarmsMap({ farms, onFarmSelect, selectedFarmId, className }: FarmsMapProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [mapType, setMapType] = useState<'satellite' | 'terrain'>('satellite')
  const [showNavigation, setShowNavigation] = useState(false)

  // Mock implementation - replace with actual map library (Mapbox/Leaflet)
  return (
    <ModernCard 
      variant="floating" 
      className={cn(
        'relative overflow-hidden',
        isFullscreen && 'fixed inset-4 z-50',
        className
      )}
    >
      <ModernCardContent className="p-0">
        {/* Map Container */}
        <div className={cn(
          'relative bg-sage-50',
          isFullscreen ? 'h-full' : 'h-[500px]'
        )}>
          {/* Realistic Satellite Map Background */}
          <div className="absolute inset-0">
            {/* Placeholder for when no farms exist */}
            {farms.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-sage-400 mx-auto mb-4" />
                  <p className="text-sage-600 font-medium">No Farms to Display</p>
                  <p className="text-sage-500 text-sm mt-2">
                    Add your first farm to see it on the map
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Map Background - changes based on mapType */}
                <div className="absolute inset-0">
                  {mapType === 'satellite' ? (
                    /* Satellite View */
                    <div className="absolute inset-0 bg-gradient-to-br from-green-100 via-emerald-50 to-lime-100">
                      {/* Agricultural field patterns */}
                      <div className="absolute inset-0 opacity-60">
                        {/* Field parcels simulation */}
                        <div className="absolute top-0 left-0 w-1/3 h-1/2 bg-gradient-to-br from-green-200 to-green-300 border border-green-400/30" />
                        <div className="absolute top-0 left-1/3 w-1/3 h-1/2 bg-gradient-to-br from-yellow-100 to-green-200 border border-green-400/30" />
                        <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-gradient-to-br from-emerald-200 to-green-300 border border-green-400/30" />
                        
                        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-green-300 to-emerald-300 border border-green-400/30" />
                        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-br from-lime-200 to-green-300 border border-green-400/30" />
                        
                        {/* Roads and infrastructure */}
                        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-300 opacity-60" />
                        <div className="absolute top-0 bottom-0 left-1/3 w-1 bg-gray-300 opacity-60" />
                        <div className="absolute top-0 bottom-0 right-1/3 w-1 bg-gray-300 opacity-60" />
                        
                        {/* Water features */}
                        <div className="absolute bottom-4 left-4 w-20 h-12 bg-blue-200 rounded-lg opacity-70" />
                        
                        {/* Forested areas */}
                        <div className="absolute top-4 right-4 w-16 h-16 bg-green-600 rounded-full opacity-40" />
                        <div className="absolute bottom-8 right-8 w-12 h-12 bg-green-700 rounded-full opacity-40" />
                      </div>
                    </div>
                  ) : (
                    /* Terrain View */
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
                      {/* Topographic-style patterns */}
                      <div className="absolute inset-0 opacity-50">
                        {/* Elevation contours */}
                        <div className="absolute top-1/4 left-0 right-0 h-0.5 bg-amber-300 opacity-40" />
                        <div className="absolute top-2/4 left-0 right-0 h-0.5 bg-amber-400 opacity-40" />
                        <div className="absolute top-3/4 left-0 right-0 h-0.5 bg-amber-500 opacity-40" />
                        
                        {/* Hills and valleys */}
                        <div className="absolute top-0 left-1/4 w-1/2 h-1/3 bg-gradient-radial from-amber-200 to-transparent rounded-full opacity-60" />
                        <div className="absolute bottom-0 right-1/4 w-1/3 h-1/2 bg-gradient-radial from-orange-200 to-transparent rounded-full opacity-60" />
                        
                        {/* Grid lines */}
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(217,119,6,0.1)_1px,transparent_1px),linear-gradient(rgba(217,119,6,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Geographic indicators */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-xs text-sage-700 bg-white/90 px-3 py-1.5 rounded-lg shadow-sm border">
                  {mapType === 'satellite' ? '🛰️' : '🗺️'} Regional Farm Overview - {mapType === 'satellite' ? 'Satellite' : 'Terrain'} View
                </div>
              </>
            )}

            {/* Farm Markers */}
            {farms.map((farm, index) => {
              const healthStatus = getHealthStatus(farm.health)
              const isSelected = farm.id === selectedFarmId
              
              return (
                <button
                  key={farm.id}
                  onClick={() => onFarmSelect(farm.id)}
                  className={cn(
                    'absolute transform -translate-x-1/2 -translate-y-1/2',
                    'transition-all duration-300 hover:scale-110',
                    isSelected && 'scale-125 z-10'
                  )}
                  style={{
                    // Use actual coordinates if available, otherwise distribute farms across the map
                    left: farm.latitude && farm.longitude 
                      ? `${Math.min(Math.max(15, ((farm.longitude + 180) / 360) * 70 + 15), 85)}%`
                      : `${20 + (index % 4) * 20}%`,
                    top: farm.latitude && farm.longitude
                      ? `${Math.min(Math.max(15, ((90 - farm.latitude) / 180) * 70 + 15), 85)}%`
                      : `${25 + Math.floor(index / 4) * 20}%`
                  }}
                >
                  {/* Farm Marker */}
                  <div className="relative group">
                    <div className={cn(
                      'w-12 h-12 rounded-full border-4 border-white shadow-lg',
                      'flex items-center justify-center transition-all',
                      healthStatus === 'excellent' && 'bg-green-500',
                      healthStatus === 'good' && 'bg-yellow-400',
                      healthStatus === 'warning' && 'bg-orange-500',
                      healthStatus === 'critical' && 'bg-red-500',
                      isSelected && 'ring-4 ring-sage-400 ring-offset-2'
                    )}>
                      <span className="text-white font-bold text-sm">
                        {farm.fieldsCount}
                      </span>
                    </div>

                    {/* Tooltip */}
                    <div className={cn(
                      'absolute bottom-full left-1/2 -translate-x-1/2 mb-2',
                      'bg-white rounded-lg shadow-xl p-3 min-w-[200px]',
                      'opacity-0 group-hover:opacity-100 transition-opacity',
                      'pointer-events-none'
                    )}>
                      <div className="text-sm font-semibold text-sage-800">
                        {farm.name}
                      </div>
                      <div className="text-xs text-sage-600 mt-1">
                        {farm.totalArea.toFixed(1)} ha • {farm.fieldsCount} fields
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1">
                          <TrafficLightStatus status={healthStatus} size="sm" showIcon={false} />
                          <span className="text-xs">{farm.health}%</span>
                        </div>
                        <div className={cn(
                          'flex items-center gap-0.5 text-xs',
                          farm.healthTrend > 0 ? 'text-green-600' : 'text-red-600'
                        )}>
                          {farm.healthTrend > 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {Math.abs(farm.healthTrend)}%
                        </div>
                      </div>
                    </div>

                    {/* Primary Farm Badge */}
                    {farm.isPrimary && (
                      <div className="absolute -top-1 -right-1 bg-sage-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                        PRIMARY
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Map Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4 text-sage-700" />
              ) : (
                <Maximize2 className="h-4 w-4 text-sage-700" />
              )}
            </button>
            
            <button
              onClick={() => setMapType(mapType === 'satellite' ? 'terrain' : 'satellite')}
              className={cn(
                "p-2 rounded-lg shadow-md hover:shadow-lg transition-all",
                mapType === 'satellite' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
              )}
              title={`Switch to ${mapType === 'satellite' ? 'terrain' : 'satellite'} view`}
            >
              <Layers className="h-4 w-4" />
            </button>

            <button 
              onClick={() => setShowNavigation(!showNavigation)}
              className={cn(
                "p-2 rounded-lg shadow-md hover:shadow-lg transition-all",
                showNavigation ? 'bg-blue-100 text-blue-700' : 'bg-white text-sage-700'
              )}
              title="Toggle navigation info"
            >
              <Navigation className="h-4 w-4" />
            </button>
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur rounded-lg p-3">
            <h4 className="text-xs font-semibold text-sage-800 mb-2">Health Status</h4>
            <div className="space-y-1">
              {['excellent', 'good', 'warning', 'critical'].map((status) => (
                <div key={status} className="flex items-center gap-2">
                  <TrafficLightStatus 
                    status={status as any} 
                    size="sm" 
                    showIcon={false} 
                    showText={false} 
                  />
                  <span className="text-xs text-sage-600 capitalize">{status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Info Panel */}
          {showNavigation && (
            <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur rounded-lg p-3 max-w-xs">
              <h4 className="text-xs font-semibold text-sage-800 mb-2 flex items-center gap-1">
                <Navigation className="h-3 w-3" />
                Navigation Info
              </h4>
              <div className="space-y-2 text-xs text-sage-600">
                <div className="flex justify-between">
                  <span>View:</span>
                  <span className="font-medium capitalize">{mapType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Farms:</span>
                  <span className="font-medium">{farms.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Fields:</span>
                  <span className="font-medium">{farms.reduce((sum, farm) => sum + farm.fieldsCount, 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Area:</span>
                  <span className="font-medium">{farms.reduce((sum, farm) => sum + farm.totalArea, 0).toFixed(1)} ha</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="text-xs text-sage-500">
                    💡 Click farm markers to view details
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Selected Farm Summary */}
          {selectedFarmId && (
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur rounded-lg p-4 max-w-xs">
              {(() => {
                const farm = farms.find(f => f.id === selectedFarmId)
                if (!farm) return null
                
                return (
                  <>
                    <h3 className="font-semibold text-sage-800 mb-1">{farm.name}</h3>
                    <div className="text-sm text-sage-600 space-y-1">
                      <div>Area: {farm.totalArea.toFixed(1)} ha</div>
                      <div>Fields: {farm.fieldsCount}</div>
                      <div>Stressed areas: {farm.stressedAreas}%</div>
                    </div>
                    <button className="mt-3 flex items-center gap-1 text-sm font-medium text-sage-700 hover:text-sage-800">
                      <Eye className="h-4 w-4" />
                      View Details
                    </button>
                  </>
                )
              })()}
            </div>
          )}
        </div>
      </ModernCardContent>
    </ModernCard>
  )
}

// KPI Card for farms
export function FarmKPICard({
  farm,
  onViewDetails,
  className
}: {
  farm: Farm
  onViewDetails: () => void
  className?: string
}) {
  const healthStatus = getHealthStatus(farm.health)

  return (
    <ModernCard variant="soft" className={cn('hover:shadow-soft transition-all', className)}>
      <ModernCardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-sage-800">
              {farm.name}
            </h3>
            <p className="text-sm text-sage-600 mt-1">
              {farm.totalArea.toFixed(1)} ha • {farm.fieldsCount} fields
            </p>
          </div>
          {farm.isPrimary && (
            <Badge className="bg-sage-100 text-sage-700">Primary</Badge>
          )}
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <div className="text-xs text-sage-600 mb-1">Health</div>
            <div className="flex items-center gap-1">
              <TrafficLightStatus status={healthStatus} size="sm" showIcon={false} />
              <span className="font-semibold text-sage-800">{farm.health}%</span>
            </div>
          </div>
          
          <div>
            <div className="text-xs text-sage-600 mb-1">7-day trend</div>
            <div className={cn(
              'flex items-center gap-0.5 font-semibold',
              farm.healthTrend > 0 ? 'text-green-600' : 'text-red-600'
            )}>
              {farm.healthTrend > 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {Math.abs(farm.healthTrend)}%
            </div>
          </div>

          <div>
            <div className="text-xs text-sage-600 mb-1">Stress</div>
            <div className="font-semibold text-orange-600">
              {farm.stressedAreas}%
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <button 
            onClick={onViewDetails}
            className="flex-1 px-3 py-1.5 bg-sage-700 hover:bg-sage-800 text-white text-sm font-medium rounded-lg transition-colors"
          >
            View Details
          </button>
          <button className="px-3 py-1.5 bg-sage-100 hover:bg-sage-200 text-sage-700 text-sm font-medium rounded-lg transition-colors">
            Health Report
          </button>
        </div>
      </ModernCardContent>
    </ModernCard>
  )
}