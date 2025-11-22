'use client'
import React, { useState, useEffect } from 'react'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../ui/modern-card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { 
  Heart, TrendingUp, TrendingDown, AlertTriangle, Thermometer, 
  Calendar, MapPin, DollarSign, Activity, Target, BarChart3,
  Droplets, Scale, Clock, Baby, Beef, Egg, Milk, RefreshCw,
  Users, PlusCircle, ShieldCheck, AlertCircle, Zap
} from 'lucide-react'
import { LivestockAnalytics, LIVESTOCK_DATABASE, type LivestockData } from '../../lib/agriculture/livestock-knowledge-base'
import { cn } from '../../lib/utils'
interface LivestockAnalyticsDashboardProps {
  farmId: string
  selectedLivestock?: string
}
interface LivestockPerformanceData {
  livestockId: string
  animalCount: number
  breedingDate?: string
  expectedProduction: number
  actualProduction?: number
  productionStage: 'growing' | 'adult' | 'breeding' | 'lactating'
  healthScore: number
  riskFactors: Array<{
    type: 'disease' | 'nutrition' | 'housing' | 'breeding'
    severity: 'low' | 'moderate' | 'high'
    description: string
  }>
  recentTreatments: Array<{
    date: string
    type: 'vaccination' | 'medication' | 'nutrition' | 'breeding'
    description: string
    cost: number
  }>
}
export function LivestockAnalyticsDashboard({ farmId, selectedLivestock }: LivestockAnalyticsDashboardProps) {
  const [selectedLivestockId, setSelectedLivestockId] = useState(selectedLivestock || 'dairy_cattle')
  const [timeframe, setTimeframe] = useState<'current' | 'month' | 'quarter' | 'year'>('current')
  const [performanceData, setPerformanceData] = useState<LivestockPerformanceData[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    // Mock data - in production, this would fetch from your database
    const mockPerformanceData: LivestockPerformanceData[] = [
      {
        livestockId: 'dairy_cattle',
        animalCount: 45,
        breedingDate: '2024-02-15',
        expectedProduction: 1350, // liters per day
        actualProduction: 1420,
        productionStage: 'lactating',
        healthScore: 92,
        riskFactors: [
          { type: 'disease', severity: 'low', description: 'Seasonal mastitis risk elevated' },
          { type: 'nutrition', severity: 'moderate', description: 'Copper deficiency detected in 3 animals' }
        ],
        recentTreatments: [
          { date: '2024-05-15', type: 'vaccination', description: 'IBR/BVD annual vaccination', cost: 450 },
          { date: '2024-05-10', type: 'medication', description: 'Mastitis treatment for cow #23', cost: 85 }
        ]
      },
      {
        livestockId: 'beef_cattle',
        animalCount: 120,
        breedingDate: '2024-03-01',
        expectedProduction: 72000, // kg live weight at harvest
        actualProduction: undefined,
        productionStage: 'growing',
        healthScore: 88,
        riskFactors: [
          { type: 'disease', severity: 'moderate', description: 'Bovine respiratory disease detected in feedlot' }
        ],
        recentTreatments: [
          { date: '2024-05-20', type: 'medication', description: 'BRD treatment - metaphylaxis', cost: 1200 },
          { date: '2024-04-15', type: 'vaccination', description: 'BRSV/PI3 vaccination', cost: 600 }
        ]
      },
      {
        livestockId: 'layer_chickens',
        animalCount: 2500,
        breedingDate: undefined,
        expectedProduction: 2125, // eggs per day
        actualProduction: 2180,
        productionStage: 'adult',
        healthScore: 95,
        riskFactors: [],
        recentTreatments: [
          { date: '2024-05-18', type: 'vaccination', description: 'Newcastle Disease booster', cost: 350 },
          { date: '2024-05-01', type: 'nutrition', description: 'Layer feed calcium adjustment', cost: 120 }
        ]
      }
    ]
    setPerformanceData(mockPerformanceData)
    setLoading(false)
  }, [farmId])
  const selectedLivestockData = LivestockAnalytics.getLivestockById(selectedLivestockId)
  const currentLivestockPerformance = performanceData.find(p => p.livestockId === selectedLivestockId)
  if (!selectedLivestockData) {
    return <div>Livestock data not found</div>
  }
  const getHealthStatusColor = (score: number) => {
    if (score >= 90) return 'text-[#8FBF7F] bg-[#F8FAF8]'
    if (score >= 80) return 'text-yellow-600 bg-yellow-100'
    if (score >= 70) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }
  const getRiskSeverityColor = (severity: 'low' | 'moderate' | 'high') => {
    switch (severity) {
      case 'low': return 'text-[#8FBF7F] bg-[#F8FAF8]'
      case 'moderate': return 'text-yellow-600 bg-yellow-100'
      case 'high': return 'text-red-600 bg-red-100'
    }
  }
  const getProductIcon = (primaryProduct: string) => {
    switch (primaryProduct) {
      case 'milk': return <Milk className="h-6 w-6 text-blue-600" />
      case 'meat': return <Beef className="h-6 w-6 text-red-600" />
      case 'eggs': return <Egg className="h-6 w-6 text-yellow-600" />
      default: return <Activity className="h-6 w-6 text-[#555555]" />
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Livestock Analytics Dashboard</h1>
          <p className="text-[#555555]">Comprehensive livestock performance analysis and production forecasting</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedLivestockId} onValueChange={setSelectedLivestockId}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LIVESTOCK_DATABASE.map(livestock => (
                <SelectItem key={livestock.id} value={livestock.id}>
                  {livestock.name}
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
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="quarter">Quarter</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
      {/* Livestock Overview Card */}
      <ModernCard variant="glow">
        <ModernCardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getProductIcon(selectedLivestockData.primaryProduct)}
              <div>
                <ModernCardTitle className="text-xl">{selectedLivestockData.name}</ModernCardTitle>
                <p className="text-[#555555] italic">{selectedLivestockData.scientificName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-[#F8FAF8] text-gray-900">{selectedLivestockData.category}</Badge>
              <Badge className="bg-blue-100 text-blue-800 capitalize">{selectedLivestockData.primaryProduct}</Badge>
            </div>
          </div>
        </ModernCardHeader>
        <ModernCardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {selectedLivestockData.physicalCharacteristics.matureAge}
              </div>
              <div className="text-sm text-[#555555]">Mature Age (months)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {selectedLivestockData.breeding.litterSize.average}
              </div>
              <div className="text-sm text-[#555555]">Average Litter Size</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#8FBF7F]">
                {selectedLivestockData.breeding.gestationPeriod}
              </div>
              <div className="text-sm text-[#555555]">Gestation (days)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                ${selectedLivestockData.economics.revenue.primary.value}
              </div>
              <div className="text-sm text-[#555555]">
                Price ({selectedLivestockData.economics.revenue.primary.unit})
              </div>
            </div>
          </div>
        </ModernCardContent>
      </ModernCard>
      {/* Performance Metrics */}
      {currentLivestockPerformance && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Animal Health Status */}
          <ModernCard>
            <ModernCardHeader>
              <ModernCardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Herd Health
              </ModernCardTitle>
            </ModernCardHeader>
            <ModernCardContent>
              <div className="text-center">
                <div className={cn(
                  'inline-flex items-center justify-center w-20 h-20 rounded-full text-2xl font-bold mb-3',
                  getHealthStatusColor(currentLivestockPerformance.healthScore)
                )}>
                  {currentLivestockPerformance.healthScore}%
                </div>
                <div className="text-[#555555]">Overall Health Score</div>
                <div className="text-sm text-[#555555] mt-2">
                  Herd Size: <span className="font-medium">{currentLivestockPerformance.animalCount} animals</span>
                </div>
                <div className="text-sm text-[#555555]">
                  Stage: <span className="font-medium capitalize">{currentLivestockPerformance.productionStage}</span>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>
          {/* Production Forecast */}
          <ModernCard>
            <ModernCardHeader>
              <ModernCardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Production Forecast
              </ModernCardTitle>
            </ModernCardHeader>
            <ModernCardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[#555555]">Expected:</span>
                  <span className="font-bold text-blue-600">
                    {currentLivestockPerformance.expectedProduction.toLocaleString()} 
                    {selectedLivestockData.primaryProduct === 'milk' ? ' L/day' : 
                     selectedLivestockData.primaryProduct === 'eggs' ? ' eggs/day' : ' kg'}
                  </span>
                </div>
                {currentLivestockPerformance.actualProduction && (
                  <div className="flex justify-between items-center">
                    <span className="text-[#555555]">Actual:</span>
                    <span className="font-bold text-[#8FBF7F]">
                      {currentLivestockPerformance.actualProduction.toLocaleString()}
                      {selectedLivestockData.primaryProduct === 'milk' ? ' L/day' : 
                       selectedLivestockData.primaryProduct === 'eggs' ? ' eggs/day' : ' kg'}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-[#555555]">Performance:</span>
                  <span className={cn(
                    "font-medium",
                    currentLivestockPerformance.actualProduction && 
                    currentLivestockPerformance.actualProduction > currentLivestockPerformance.expectedProduction
                      ? "text-[#8FBF7F]" : "text-orange-600"
                  )}>
                    {currentLivestockPerformance.actualProduction ? 
                      `${Math.round((currentLivestockPerformance.actualProduction / currentLivestockPerformance.expectedProduction) * 100)}%` : 
                      'Tracking'
                    }
                  </span>
                </div>
                <div className="pt-2 border-t">
                  <div className="text-sm text-[#555555]">
                    Est. Revenue: <span className="font-medium text-gray-900">
                      ${LivestockAnalytics.calculateProductionForecast(
                        selectedLivestockId, 
                        currentLivestockPerformance.animalCount, 
                        30
                      ).primaryProduct.revenue.toLocaleString()}
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
                {currentLivestockPerformance.riskFactors.length > 0 ? (
                  currentLivestockPerformance.riskFactors.map((risk, index) => (
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
                    <div className="text-2xl mb-2">
                      <ShieldCheck className="h-8 w-8 mx-auto" />
                    </div>
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
        {/* Breeding Calendar */}
        <ModernCard>
          <ModernCardHeader>
            <ModernCardTitle className="flex items-center gap-2">
              <Baby className="h-5 w-5 text-pink-600" />
              Breeding Calendar
            </ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent>
            <div className="space-y-4">
              {LivestockAnalytics.getBreedingCalendar(selectedLivestockId).map((stage, index) => (
                <div key={index} className="border-l-4 border-pink-300 pl-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{stage.stage}</h4>
                    <span className="text-sm text-[#555555]">Day {stage.daysFromBreeding}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-[#555555]">
                      <strong>Activities:</strong> {stage.activities.join(', ')}
                    </div>
                    <div className="text-sm text-[#555555]">
                      <strong>Monitor:</strong> {stage.monitoring.join(', ')}
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
                  <div className="text-sm text-[#555555]">Initial Investment</div>
                  <div className="text-xl font-bold text-gray-900">
                    ${selectedLivestockData.economics.initialInvestment.animal}
                  </div>
                  <div className="text-xs text-[#555555]">per animal</div>
                </div>
                <div>
                  <div className="text-sm text-[#555555]">Annual Operating Cost</div>
                  <div className="text-xl font-bold text-red-600">
                    ${selectedLivestockData.economics.operatingCosts.total}
                  </div>
                  <div className="text-xs text-[#555555]">per animal</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-[#555555]">Feed:</span>
                  <span className="text-sm font-medium">${selectedLivestockData.economics.operatingCosts.feed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[#555555]">Healthcare:</span>
                  <span className="text-sm font-medium">${selectedLivestockData.economics.operatingCosts.healthcare}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[#555555]">Labor:</span>
                  <span className="text-sm font-medium">${selectedLivestockData.economics.operatingCosts.labor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[#555555]">Utilities:</span>
                  <span className="text-sm font-medium">${selectedLivestockData.economics.operatingCosts.utilities}</span>
                </div>
              </div>
              <div className="pt-3 border-t">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-[#555555]">Profitability Index:</span>
                  <div className="flex">
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          'w-3 h-3 rounded-full mr-1',
                          i < selectedLivestockData.economics.profitabilityIndex
                            ? 'bg-[#8FBF7F]'
                            : 'bg-[#F5F5F5]'
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">
                    {selectedLivestockData.economics.profitabilityIndex}/10
                  </span>
                </div>
                <div className="text-sm text-[#555555]">
                  Break-even: {selectedLivestockData.economics.breakEven.timeframe} months 
                  with {selectedLivestockData.economics.breakEven.animalCount} animals minimum
                </div>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>
      </div>
      {/* Recent Treatments and Interventions */}
      {currentLivestockPerformance && currentLivestockPerformance.recentTreatments.length > 0 && (
        <ModernCard>
          <ModernCardHeader>
            <ModernCardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-600" />
              Recent Treatments & Interventions
            </ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent>
            <div className="space-y-3">
              {currentLivestockPerformance.recentTreatments.map((treatment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-[#F8FAF8] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#DDE4D8] rounded-full">
                      {treatment.type === 'vaccination' && <ShieldCheck className="h-4 w-4 text-blue-600" />}
                      {treatment.type === 'medication' && <Activity className="h-4 w-4 text-red-600" />}
                      {treatment.type === 'nutrition' && <Scale className="h-4 w-4 text-[#8FBF7F]" />}
                      {treatment.type === 'breeding' && <Baby className="h-4 w-4 text-pink-600" />}
                    </div>
                    <div>
                      <div className="font-medium text-sm capitalize">{treatment.type}</div>
                      <div className="text-xs text-[#555555]">{treatment.description}</div>
                      <div className="text-xs text-[#555555]">
                        {new Date(treatment.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">${treatment.cost}</div>
                  </div>
                </div>
              ))}
              <div className="pt-3 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-[#555555]">Total Treatment Costs:</span>
                  <span className="font-bold text-gray-900">
                    ${currentLivestockPerformance.recentTreatments.reduce((sum, t) => sum + t.cost, 0)}
                  </span>
                </div>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>
      )}
      {/* Environmental and Housing Requirements */}
      <ModernCard>
        <ModernCardHeader>
          <ModernCardTitle className="flex items-center gap-2">
            <Thermometer className="h-5 w-5 text-orange-600" />
            Housing & Environmental Requirements
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
                    {selectedLivestockData.housing.temperatureRange.optimal.min}°C - {selectedLivestockData.housing.temperatureRange.optimal.max}°C
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[#555555]">Range:</span>
                  <span className="text-sm font-medium">
                    {selectedLivestockData.housing.temperatureRange.min}°C - {selectedLivestockData.housing.temperatureRange.max}°C
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Space Requirements
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-[#555555]">Adult:</span>
                  <span className="text-sm font-medium">{selectedLivestockData.housing.spaceRequirement.adult} m²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[#555555]">Growing:</span>
                  <span className="text-sm font-medium">{selectedLivestockData.housing.spaceRequirement.growing} m²</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Ventilation & Flooring
              </h4>
              <div className="space-y-2">
                <div className="text-sm text-[#555555]">
                  <strong>Ventilation:</strong> {selectedLivestockData.housing.ventilationRequirement}
                </div>
                <div className="text-sm text-[#555555]">
                  <strong>Flooring:</strong> {selectedLivestockData.housing.flooring.join(', ')}
                </div>
              </div>
            </div>
          </div>
        </ModernCardContent>
      </ModernCard>
    </div>
  )
}