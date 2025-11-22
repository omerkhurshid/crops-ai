'use client'
import React, { useState, useEffect } from 'react'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../ui/modern-card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { 
  Sprout, TrendingUp, TrendingDown, AlertTriangle, Thermometer, Droplets,
  Calendar, MapPin, DollarSign, Activity, Target, BarChart3, LineChart,
  Leaf, Sun, CloudRain, Bug, Beaker, Scale, Clock
} from 'lucide-react'
import { CropAnalytics, CROP_DATABASE, type CropData } from '../../lib/agriculture/crop-knowledge-base'
import { cn } from '../../lib/utils'
interface CropAnalyticsDashboardProps {
  farmId: string
  selectedCrop?: string
}
interface CropPerformanceData {
  cropId: string
  plantedArea: number
  plantedDate: string
  expectedYield: number
  actualYield?: number
  growthStage: string
  healthScore: number
  riskFactors: Array<{
    type: 'pest' | 'disease' | 'weather' | 'nutrition'
    severity: 'low' | 'moderate' | 'high'
    description: string
  }>
  interventions: Array<{
    date: string
    type: 'fertilizer' | 'pesticide' | 'irrigation' | 'cultivation'
    description: string
    cost: number
  }>
}
export function CropAnalyticsDashboard({ farmId, selectedCrop }: CropAnalyticsDashboardProps) {
  const [selectedCropId, setSelectedCropId] = useState(selectedCrop || 'corn')
  const [timeframe, setTimeframe] = useState<'current' | 'season' | 'year'>('current')
  const [performanceData, setPerformanceData] = useState<CropPerformanceData[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    // Fetch real crop performance data from API
    const fetchPerformanceData = async () => {
      try {
        const response = await fetch(`/api/farms/${farmId}/crop-analytics`)
        if (response.ok) {
          const result = await response.json()
          setPerformanceData(result.data || [])
        } else {
          setPerformanceData([])
        }
      } catch (error) {
        console.error('Error fetching crop analytics:', error)
        setPerformanceData([])
      } finally {
        setLoading(false)
      }
    }
    fetchPerformanceData()
  }, [farmId])
  const selectedCropData = CropAnalytics.getCropById(selectedCropId)
  const currentCropPerformance = performanceData.find(p => p.cropId === selectedCropId)
  if (!selectedCropData) {
    return <div>Crop data not found</div>
  }
  const getHealthStatusColor = (score: number) => {
    if (score >= 90) return 'text-[#8FBF7F] bg-[#F8FAF8]'
    if (score >= 75) return 'text-yellow-600 bg-yellow-100'
    if (score >= 60) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }
  const getRiskSeverityColor = (severity: 'low' | 'moderate' | 'high') => {
    switch (severity) {
      case 'low': return 'text-[#8FBF7F] bg-[#F8FAF8]'
      case 'moderate': return 'text-yellow-600 bg-yellow-100'
      case 'high': return 'text-red-600 bg-red-100'
    }
  }
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-[#F5F5F5] rounded-2xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-48 bg-[#F5F5F5] rounded-2xl"></div>
            <div className="h-48 bg-[#F5F5F5] rounded-2xl"></div>
            <div className="h-48 bg-[#F5F5F5] rounded-2xl"></div>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Crop Analytics Dashboard</h1>
          <p className="text-[#555555]">Comprehensive crop performance analysis and yield forecasting</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedCropId} onValueChange={setSelectedCropId}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CROP_DATABASE.map(crop => (
                <SelectItem key={crop.id} value={crop.id}>
                  {crop.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current</SelectItem>
              <SelectItem value="season">Season</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {/* Crop Overview Card */}
      <ModernCard variant="glow">
        <ModernCardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sprout className="h-8 w-8 text-[#8FBF7F]" />
              <div>
                <ModernCardTitle className="text-xl">{selectedCropData.name}</ModernCardTitle>
                <p className="text-[#555555] italic">{selectedCropData.scientificName}</p>
              </div>
            </div>
            <Badge className="bg-[#F8FAF8] text-gray-900">{selectedCropData.category}</Badge>
          </div>
        </ModernCardHeader>
        <ModernCardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{selectedCropData.growingPeriod.optimal}</div>
              <div className="text-sm text-[#555555]">Growing Days</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {selectedCropData.yield.typical.min}-{selectedCropData.yield.typical.max}
              </div>
              <div className="text-sm text-[#555555]">Typical Yield ({selectedCropData.yield.typical.unit})</div>
            </div>
            <div className="text-2xl font-bold text-[#8FBF7F] text-center">
              {selectedCropData.soil.pH.optimal}
            </div>
            <div className="text-sm text-[#555555] text-center">Optimal pH</div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">${selectedCropData.economics.market_price.current}</div>
              <div className="text-sm text-[#555555]">Market Price ({selectedCropData.economics.market_price.unit})</div>
            </div>
          </div>
        </ModernCardContent>
      </ModernCard>
      {/* Performance Metrics */}
      {currentCropPerformance && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Current Health Status */}
          <ModernCard>
            <ModernCardHeader>
              <ModernCardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-[#8FBF7F]" />
                Crop Health
              </ModernCardTitle>
            </ModernCardHeader>
            <ModernCardContent>
              <div className="text-center">
                <div className={cn(
                  'inline-flex items-center justify-center w-20 h-20 rounded-full text-2xl font-bold mb-3',
                  getHealthStatusColor(currentCropPerformance.healthScore)
                )}>
                  {currentCropPerformance.healthScore}%
                </div>
                <div className="text-[#555555]">Overall Health Score</div>
                <div className="text-sm text-[#555555] mt-2">
                  Growth Stage: <span className="font-medium">{currentCropPerformance.growthStage}</span>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>
          {/* Yield Forecast */}
          <ModernCard>
            <ModernCardHeader>
              <ModernCardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Yield Forecast
              </ModernCardTitle>
            </ModernCardHeader>
            <ModernCardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[#555555]">Expected:</span>
                  <span className="font-bold text-blue-600">
                    {currentCropPerformance.expectedYield.toFixed(1)} {selectedCropData.yield.typical.unit}
                  </span>
                </div>
                {currentCropPerformance.actualYield && (
                  <div className="flex justify-between items-center">
                    <span className="text-[#555555]">Actual:</span>
                    <span className="font-bold text-[#8FBF7F]">
                      {currentCropPerformance.actualYield.toFixed(1)} {selectedCropData.yield.typical.unit}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-[#555555]">Area:</span>
                  <span className="font-medium">{currentCropPerformance.plantedArea} ha</span>
                </div>
                <div className="pt-2 border-t">
                  <div className="text-sm text-[#555555]">
                    Estimated Revenue: <span className="font-medium text-gray-900">
                      ${(currentCropPerformance.expectedYield * currentCropPerformance.plantedArea * 
                        selectedCropData.economics.market_price.current).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>
          {/* Risk Assessment */}
          <ModernCard>
            <ModernCardHeader>
              <ModernCardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Risk Factors
              </ModernCardTitle>
            </ModernCardHeader>
            <ModernCardContent>
              <div className="space-y-3">
                {currentCropPerformance.riskFactors.length > 0 ? (
                  currentCropPerformance.riskFactors.map((risk, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Badge className={cn('text-xs', getRiskSeverityColor(risk.severity))}>
                        {risk.severity}
                      </Badge>
                      <div className="flex-1">
                        <div className="font-medium text-sm capitalize">{risk.type}</div>
                        <div className="text-xs text-[#555555]">{risk.description}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-[#8FBF7F]">
                    <div className="text-2xl mb-2">✓</div>
                    <div className="text-sm">No current risk factors detected</div>
                  </div>
                )}
              </div>
            </ModernCardContent>
          </ModernCard>
        </div>
      )}
      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growing Calendar */}
        <ModernCard>
          <ModernCardHeader>
            <ModernCardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#555555]" />
              Growing Calendar
            </ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent>
            <div className="space-y-4">
              {CropAnalytics.getGrowingCalendar(selectedCropId).map((stage, index) => (
                <div key={index} className="border-l-4 border-[#DDE4D8] pl-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{stage.stage}</h4>
                    <span className="text-sm text-[#555555]">Day {stage.daysFromPlanting}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-[#555555]">
                      <strong>Activities:</strong> {stage.activities.join(', ')}
                    </div>
                    <div className="text-sm text-[#555555]">
                      <strong>Critical factors:</strong> {stage.criticalFactors.join(', ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ModernCardContent>
        </ModernCard>
        {/* Economic Analysis */}
        <ModernCard>
          <ModernCardHeader>
            <ModernCardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-[#8FBF7F]" />
              Economic Analysis
            </ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-[#555555]">Production Cost/ha</div>
                  <div className="text-xl font-bold text-gray-900">
                    ${selectedCropData.economics.cost_per_hectare.total}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-[#555555]">Market Price</div>
                  <div className="text-xl font-bold text-[#8FBF7F]">
                    ${selectedCropData.economics.market_price.current}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-[#555555]">Seed:</span>
                  <span className="text-sm font-medium">${selectedCropData.economics.cost_per_hectare.seed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[#555555]">Fertilizer:</span>
                  <span className="text-sm font-medium">${selectedCropData.economics.cost_per_hectare.fertilizer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[#555555]">Pesticides:</span>
                  <span className="text-sm font-medium">${selectedCropData.economics.cost_per_hectare.pesticides}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[#555555]">Labor:</span>
                  <span className="text-sm font-medium">${selectedCropData.economics.cost_per_hectare.labor}</span>
                </div>
              </div>
              <div className="pt-3 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#555555]">Profitability Index:</span>
                  <div className="flex">
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          'w-3 h-3 rounded-full mr-1',
                          i < selectedCropData.economics.profitability_index
                            ? 'bg-[#8FBF7F]'
                            : 'bg-[#F5F5F5]'
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">
                    {selectedCropData.economics.profitability_index}/10
                  </span>
                </div>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>
      </div>
      {/* Interventions and Treatments */}
      {currentCropPerformance && currentCropPerformance.interventions.length > 0 && (
        <ModernCard>
          <ModernCardHeader>
            <ModernCardTitle className="flex items-center gap-2">
              <Beaker className="h-5 w-5 text-purple-600" />
              Recent Interventions
            </ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent>
            <div className="space-y-3">
              {currentCropPerformance.interventions.map((intervention, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-[#F8FAF8] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#DDE4D8] rounded-full">
                      {intervention.type === 'fertilizer' && <Leaf className="h-4 w-4 text-[#8FBF7F]" />}
                      {intervention.type === 'pesticide' && <Bug className="h-4 w-4 text-red-600" />}
                      {intervention.type === 'irrigation' && <Droplets className="h-4 w-4 text-blue-600" />}
                      {intervention.type === 'cultivation' && <Activity className="h-4 w-4 text-brown-600" />}
                    </div>
                    <div>
                      <div className="font-medium text-sm capitalize">{intervention.type}</div>
                      <div className="text-xs text-[#555555]">{intervention.description}</div>
                      <div className="text-xs text-[#555555]">
                        {new Date(intervention.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">${intervention.cost}</div>
                  </div>
                </div>
              ))}
              <div className="pt-3 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-[#555555]">Total Interventions Cost:</span>
                  <span className="font-bold text-gray-900">
                    ${currentCropPerformance.interventions.reduce((sum, i) => sum + i.cost, 0)}
                  </span>
                </div>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>
      )}
      {/* Environmental Requirements */}
      <ModernCard>
        <ModernCardHeader>
          <ModernCardTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5 text-yellow-600" />
            Environmental Requirements
          </ModernCardTitle>
        </ModernCardHeader>
        <ModernCardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <Thermometer className="h-4 w-4" />
                Temperature
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-[#555555]">Optimal:</span>
                  <span className="text-sm font-medium">
                    {selectedCropData.temperature.optimal.min}°C - {selectedCropData.temperature.optimal.max}°C
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[#555555]">Range:</span>
                  <span className="text-sm font-medium">
                    {selectedCropData.temperature.min}°C - {selectedCropData.temperature.max}°C
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <Droplets className="h-4 w-4" />
                Water
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-[#555555]">Annual need:</span>
                  <span className="text-sm font-medium">{selectedCropData.waterRequirement.annual}mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[#555555]">Drought tolerance:</span>
                  <span className="text-sm font-medium capitalize">
                    {selectedCropData.waterRequirement.drought_tolerance}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <Scale className="h-4 w-4" />
                Soil
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-[#555555]">pH Range:</span>
                  <span className="text-sm font-medium">
                    {selectedCropData.soil.pH.min} - {selectedCropData.soil.pH.max}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[#555555]">Drainage:</span>
                  <span className="text-sm font-medium capitalize">{selectedCropData.soil.drainage}</span>
                </div>
                <div className="text-xs text-[#555555]">
                  Types: {selectedCropData.soil.types.join(', ')}
                </div>
              </div>
            </div>
          </div>
        </ModernCardContent>
      </ModernCard>
    </div>
  )
}