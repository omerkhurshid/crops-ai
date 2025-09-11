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
          {/* Placeholder Map */}
          <div className="absolute inset-0 bg-gradient-to-br from-sage-100 to-earth-100">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-sage-400 mx-auto mb-4" />
                <p className="text-sage-600 font-medium">Interactive Map View</p>
                <p className="text-sage-500 text-sm mt-2">
                  Farms colored by health status
                </p>
              </div>
            </div>

            {/* Farm Markers (Mock) */}
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
                    left: `${20 + (index % 3) * 30}%`,
                    top: `${30 + Math.floor(index / 3) * 25}%`
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
              className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <Layers className="h-4 w-4 text-sage-700" />
            </button>

            <button className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <Navigation className="h-4 w-4 text-sage-700" />
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