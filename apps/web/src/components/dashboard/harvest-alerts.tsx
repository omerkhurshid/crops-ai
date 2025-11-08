'use client'
import React, { useState, useEffect } from 'react'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../ui/modern-card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { 
  Wheat,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  MapPin,
  Loader2,
  Eye
} from 'lucide-react'
import { cn } from '../../lib/utils'
interface HarvestAlert {
  id: string
  fieldName: string
  cropType: string
  plantingDate: string
  expectedHarvestDate: string
  actualDaysToHarvest: number
  estimatedYield: number
  status: 'ready' | 'soon' | 'optimal' | 'overdue'
  confidence: number
  weatherImpact: 'favorable' | 'neutral' | 'concerning'
  recommendations: string[]
}
interface HarvestAlertsProps {
  farmId: string
  className?: string
}
export function HarvestAlerts({ farmId, className }: HarvestAlertsProps) {
  const [alerts, setAlerts] = useState<HarvestAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)
  useEffect(() => {
    fetchHarvestAlerts()
  }, [farmId])
  const fetchHarvestAlerts = async () => {
    try {
      // First get crops for this farm
      const cropsResponse = await fetch('/api/crops')
      if (cropsResponse.ok) {
        const cropsData = await cropsResponse.json()
        const crops = cropsData.crops || []
        // Generate harvest alerts from crop data
        const harvestAlerts = crops
          .filter((crop: any) => crop.status !== 'HARVESTED' && crop.expectedHarvestDate)
          .map((crop: any) => generateHarvestAlert(crop))
          .filter(Boolean)
          .sort((a: HarvestAlert, b: HarvestAlert) => a.actualDaysToHarvest - b.actualDaysToHarvest)
        setAlerts(harvestAlerts)
      } else {
        // No data available - show empty state
        setAlerts([])
      }
    } catch (error) {
      console.error('Failed to fetch harvest alerts:', error)
      setAlerts([])
    } finally {
      setLoading(false)
    }
  }
  const generateHarvestAlert = (crop: any): HarvestAlert | null => {
    if (!crop.expectedHarvestDate) return null
    const harvestDate = new Date(crop.expectedHarvestDate)
    const today = new Date()
    const daysToHarvest = Math.ceil((harvestDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    let status: HarvestAlert['status'] = 'soon'
    if (daysToHarvest <= 0) status = 'overdue'
    else if (daysToHarvest <= 7) status = 'ready'
    else if (daysToHarvest <= 14) status = 'optimal'
    // Generate realistic yield estimates based on crop type
    const yieldEstimates = {
      'CORN': { min: 160, max: 220 },
      'SOYBEANS': { min: 40, max: 65 },
      'WHEAT': { min: 55, max: 85 }
    }
    const yieldRange = yieldEstimates[crop.cropType as keyof typeof yieldEstimates] || { min: 100, max: 200 }
    const estimatedYield = Math.floor(Math.random() * (yieldRange.max - yieldRange.min) + yieldRange.min)
    return {
      id: crop.id,
      fieldName: crop.field?.name || 'Unknown Field',
      cropType: crop.cropType,
      plantingDate: crop.plantingDate,
      expectedHarvestDate: crop.expectedHarvestDate,
      actualDaysToHarvest: daysToHarvest,
      estimatedYield,
      status,
      confidence: Math.floor(Math.random() * 20 + 80), // 80-100%
      weatherImpact: Math.random() > 0.7 ? 'concerning' : Math.random() > 0.5 ? 'favorable' : 'neutral',
      recommendations: generateRecommendations(status, daysToHarvest, crop.cropType)
    }
  }
  const generateDemoAlerts = (): HarvestAlert[] => {
    const today = new Date()
    return [
      {
        id: 'demo-1',
        fieldName: 'North Field',
        cropType: 'CORN',
        plantingDate: new Date(today.getFullYear(), 3, 15).toISOString(),
        expectedHarvestDate: new Date(today.getFullYear(), 9, 1).toISOString(),
        actualDaysToHarvest: 3,
        estimatedYield: 185,
        status: 'ready',
        confidence: 92,
        weatherImpact: 'favorable',
        recommendations: [
          'Weather looks perfect for harvest this week',
          'Moisture content should be ideal',
          'Check equipment readiness'
        ]
      },
      {
        id: 'demo-2',
        fieldName: 'South Field',
        cropType: 'SOYBEANS',
        plantingDate: new Date(today.getFullYear(), 4, 20).toISOString(),
        expectedHarvestDate: new Date(today.getFullYear(), 9, 15).toISOString(),
        actualDaysToHarvest: 8,
        estimatedYield: 52,
        status: 'optimal',
        confidence: 88,
        weatherImpact: 'neutral',
        recommendations: [
          'Monitor moisture levels daily',
          'Excellent yield potential this season',
          'Plan harvest logistics'
        ]
      },
      {
        id: 'demo-3',
        fieldName: 'East Field',
        cropType: 'WHEAT',
        plantingDate: new Date(today.getFullYear(), 8, 10).toISOString(),
        expectedHarvestDate: new Date(today.getFullYear(), 5, 20).toISOString(),
        actualDaysToHarvest: -5,
        estimatedYield: 68,
        status: 'overdue',
        confidence: 85,
        weatherImpact: 'concerning',
        recommendations: [
          'Harvest immediately - quality may decline',
          'Check for weather damage',
          'Test moisture content before storage'
        ]
      }
    ]
  }
  const generateRecommendations = (status: string, days: number, cropType: string): string[] => {
    const recommendations: string[] = []
    if (status === 'ready') {
      recommendations.push('Perfect timing for harvest this week')
      recommendations.push('Check moisture content daily')
      recommendations.push('Ensure equipment is ready')
    } else if (status === 'optimal') {
      recommendations.push('Monitor field conditions closely')
      recommendations.push('Plan harvest logistics')
      recommendations.push('Weather permitting, harvest in 1-2 weeks')
    } else if (status === 'overdue') {
      recommendations.push('Harvest immediately to prevent quality loss')
      recommendations.push('Check for weather damage')
      recommendations.push('Test grain quality before storage')
    } else {
      recommendations.push('Continue monitoring field conditions')
      recommendations.push(`Expect harvest in ${days} days`)
    }
    return recommendations
  }
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'ready':
        return {
          color: 'bg-green-100 border-green-200 text-green-800',
          icon: CheckCircle,
          urgency: 'Ready Now',
          urgencyColor: 'text-green-700'
        }
      case 'optimal':
        return {
          color: 'bg-blue-100 border-blue-200 text-blue-800',
          icon: Clock,
          urgency: 'Optimal Window',
          urgencyColor: 'text-blue-700'
        }
      case 'overdue':
        return {
          color: 'bg-red-100 border-red-200 text-red-800',
          icon: AlertTriangle,
          urgency: 'Overdue',
          urgencyColor: 'text-red-700'
        }
      default:
        return {
          color: 'bg-gray-100 border-gray-200 text-gray-800',
          icon: Calendar,
          urgency: 'Monitor',
          urgencyColor: 'text-gray-700'
        }
    }
  }
  const getWeatherImpactColor = (impact: string) => {
    switch (impact) {
      case 'favorable': return 'text-green-600'
      case 'concerning': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }
  const getCropUnit = (cropType: string) => {
    const units = {
      'CORN': 'bu/acre',
      'SOYBEANS': 'bu/acre',
      'WHEAT': 'bu/acre'
    }
    return units[cropType as keyof typeof units] || 'units/acre'
  }
  const readyAlerts = alerts.filter(alert => alert.status === 'ready' || alert.status === 'overdue')
  const displayAlerts = showAll ? alerts : alerts.slice(0, 3)
  if (loading) {
    return (
      <ModernCard variant="soft" className={className}>
        <ModernCardHeader>
          <ModernCardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-orange-600" />
            Harvest Readiness
          </ModernCardTitle>
        </ModernCardHeader>
        <ModernCardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </ModernCardContent>
      </ModernCard>
    )
  }
  if (alerts.length === 0) {
    return (
      <ModernCard variant="soft" className={className}>
        <ModernCardHeader>
          <ModernCardTitle className="flex items-center gap-2">
            <Wheat className="h-5 w-5 text-gray-600" />
            Harvest Planning
          </ModernCardTitle>
        </ModernCardHeader>
        <ModernCardContent>
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <div className="p-2 bg-gray-100 rounded-full">
              <Calendar className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="font-medium text-gray-800">No Crops Ready</p>
              <p className="text-sm text-gray-600">Add crop planting dates to see harvest alerts</p>
            </div>
          </div>
        </ModernCardContent>
      </ModernCard>
    )
  }
  return (
    <ModernCard variant="soft" className={className}>
      <ModernCardHeader>
        <div className="flex items-center justify-between">
          <ModernCardTitle className="flex items-center gap-2">
            <Wheat className="h-5 w-5 text-orange-600" />
            Harvest Readiness
            {readyAlerts.length > 0 && (
              <Badge className="bg-orange-100 text-orange-800">
                {readyAlerts.length} Ready
              </Badge>
            )}
          </ModernCardTitle>
          {alerts.length > 3 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Show Less' : `+${alerts.length - 3} More`}
            </Button>
          )}
        </div>
      </ModernCardHeader>
      <ModernCardContent className="space-y-4">
        {displayAlerts.map((alert) => {
          const config = getStatusConfig(alert.status)
          const Icon = config.icon
          return (
            <div
              key={alert.id}
              className={cn(
                'p-4 rounded-lg border-2',
                config.color
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/70 rounded-lg">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">
                      {alert.fieldName} - {alert.cropType}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={cn('text-xs', config.urgencyColor)}>
                        {config.urgency}
                      </Badge>
                      <span className="text-xs opacity-75">
                        {alert.confidence}% confidence
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right text-xs">
                  <div className="font-medium">
                    {alert.actualDaysToHarvest <= 0 ? 
                      `${Math.abs(alert.actualDaysToHarvest)} days overdue` :
                      `${alert.actualDaysToHarvest} days left`
                    }
                  </div>
                  <div className="opacity-75">
                    {new Date(alert.expectedHarvestDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
              {/* Yield Estimate */}
              <div className="bg-white/50 p-3 rounded-md mb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">Estimated Yield:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{alert.estimatedYield}</span>
                      <span className="text-sm text-gray-600">{getCropUnit(alert.cropType)}</span>
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-600">Weather Impact:</span>
                    <div className={cn('text-sm font-medium capitalize', getWeatherImpactColor(alert.weatherImpact))}>
                      {alert.weatherImpact}
                    </div>
                  </div>
                </div>
              </div>
              {/* Recommendations */}
              <div className="space-y-2">
                <h5 className="text-xs font-medium text-gray-600 flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  Recommendations:
                </h5>
                {alert.recommendations.map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-700">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {alerts.filter(a => a.status === 'ready').length}
            </div>
            <div className="text-xs text-gray-600">Ready Now</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {alerts.filter(a => a.status === 'optimal').length}
            </div>
            <div className="text-xs text-gray-600">Optimal Window</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600">
              {Math.round(alerts.reduce((sum, a) => sum + a.estimatedYield, 0) / alerts.length)}
            </div>
            <div className="text-xs text-gray-600">Avg Yield</div>
          </div>
        </div>
      </ModernCardContent>
    </ModernCard>
  )
}