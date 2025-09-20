'use client'

import { useState, useEffect } from 'react'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '../ui/modern-card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { 
  Calendar, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Target,
  Droplets,
  Users,
  Zap,
  BarChart3
} from 'lucide-react'
import { getCropById, CROP_DATABASE, ClimateZone, CLIMATE_ZONES } from '../../lib/crop-planning/crop-knowledge'
import { 
  calculateSuccessionSchedule, 
  generateSuccessionRecommendations, 
  monitorSuccessionProgress,
  SUCCESSION_SUITABLE_CROPS,
  SuccessionPlan,
  SuccessionPlanting
} from '../../lib/crop-planning/succession-planting'

interface SuccessionPlanningProps {
  farmId: string
  availableFields: any[]
  weatherData?: any
}

export function SuccessionPlanning({ farmId, availableFields, weatherData }: SuccessionPlanningProps) {
  const [selectedCrop, setSelectedCrop] = useState<string>('')
  const [selectedField, setSelectedField] = useState<string>('')
  const [harvestWeeks, setHarvestWeeks] = useState<string>('8')
  const [successionPlan, setSuccessionPlan] = useState<SuccessionPlan | null>(null)
  const [showRecommendations, setShowRecommendations] = useState(false)
  const [loading, setLoading] = useState(false)

  // Get succession-suitable crops from our database
  const successionCrops = CROP_DATABASE.filter(crop => 
    SUCCESSION_SUITABLE_CROPS.includes(crop.id)
  )

  const handleGeneratePlan = async () => {
    if (!selectedCrop || !selectedField || !harvestWeeks) return

    setLoading(true)
    try {
      const crop = getCropById(selectedCrop)
      const field = availableFields.find(f => f.id === selectedField)
      
      if (!crop || !field) return

      // Use a default climate zone (would be determined by farm location)
      const climateZone: ClimateZone = CLIMATE_ZONES.find(z => z.zone === '6a') || CLIMATE_ZONES[0]
      
      const plan = calculateSuccessionSchedule(
        crop,
        field.area, // Use field area in hectares
        parseInt(harvestWeeks),
        climateZone,
        weatherData
      )

      plan.fieldId = selectedField
      setSuccessionPlan(plan)
      setShowRecommendations(true)
      
    } catch (error) {
      console.error('Error generating succession plan:', error)
      alert('Error generating plan: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: SuccessionPlanting['status']) => {
    switch (status) {
      case 'planned': return 'bg-blue-100 text-blue-800'
      case 'planted': return 'bg-green-100 text-green-800'
      case 'growing': return 'bg-yellow-100 text-yellow-800'
      case 'harvesting': return 'bg-orange-100 text-orange-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRiskColor = (risk: 'low' | 'moderate' | 'high') => {
    switch (risk) {
      case 'low': return 'text-green-600'
      case 'moderate': return 'text-yellow-600'
      case 'high': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    })
  }

  const formatArea = (area: number) => {
    return area < 1 ? `${(area * 10000).toFixed(0)} m²` : `${area.toFixed(2)} ha`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-sage-800 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-sage-600" />
            Succession Planting
          </h2>
          <p className="text-sage-600 mt-1">Plan continuous harvests with automated scheduling</p>
        </div>
      </div>

      {/* Planning Form */}
      <ModernCard variant="floating">
        <ModernCardHeader>
          <ModernCardTitle>Create Succession Plan</ModernCardTitle>
          <ModernCardDescription>
            Generate automated planting schedules for continuous harvest
          </ModernCardDescription>
        </ModernCardHeader>
        <ModernCardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">
                Succession Crop
              </label>
              <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                <SelectTrigger>
                  <SelectValue placeholder="Select crop" />
                </SelectTrigger>
                <SelectContent>
                  {successionCrops.map(crop => (
                    <SelectItem key={crop.id} value={crop.id}>
                      {crop.name} ({crop.daysToMaturity} days)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">
                Field
              </label>
              <Select value={selectedField} onValueChange={setSelectedField}>
                <SelectTrigger>
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  {availableFields.map(field => (
                    <SelectItem key={field.id} value={field.id}>
                      {field.name} ({field.area} ha)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">
                Harvest Duration (weeks)
              </label>
              <Input
                type="number"
                min="4"
                max="20"
                value={harvestWeeks}
                onChange={(e) => setHarvestWeeks(e.target.value)}
                placeholder="8"
              />
            </div>
          </div>

          <Button 
            className="w-full bg-sage-600 hover:bg-sage-700"
            onClick={handleGeneratePlan}
            disabled={!selectedCrop || !selectedField || loading}
          >
            {loading ? 'Generating Plan...' : 'Generate Succession Plan'}
          </Button>
        </ModernCardContent>
      </ModernCard>

      {/* Recommendations */}
      {showRecommendations && selectedCrop && (
        <ModernCard variant="soft">
          <ModernCardHeader>
            <ModernCardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Succession Recommendations
            </ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent>
            {(() => {
              const field = availableFields.find(f => f.id === selectedField)
              if (!field) return null

              const recommendations = generateSuccessionRecommendations(
                selectedCrop,
                { latitude: 41.8781, longitude: -87.6298 }, // Default coordinates
                field.area,
                parseInt(harvestWeeks)
              )

              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recommendations.recommendations.map((rec, index) => (
                    <div 
                      key={rec.type}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        index === recommendations.bestOption 
                          ? 'border-sage-500 bg-sage-50' 
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sage-800 capitalize">
                          {rec.type} Planting
                        </h4>
                        {index === recommendations.bestOption && (
                          <Badge className="bg-sage-600 text-white">Recommended</Badge>
                        )}
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="text-sage-700">
                          <span className="font-medium">Interval:</span> Every {rec.interval} days
                        </div>
                        <div className="text-sage-700">
                          <span className="font-medium">Plantings:</span> {rec.numberOfPlantings}
                        </div>
                        <div className="text-sage-700">
                          <span className="font-medium">Area each:</span> {formatArea(rec.areaPerPlanting)}
                        </div>
                        
                        <div className="mt-3">
                          <h5 className="font-medium text-green-700 mb-1">Benefits:</h5>
                          <ul className="space-y-1">
                            {rec.benefits.slice(0, 2).map((benefit, idx) => (
                              <li key={idx} className="text-xs text-green-600">• {benefit}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="mt-3">
                          <h5 className="font-medium text-orange-700 mb-1">Considerations:</h5>
                          <ul className="space-y-1">
                            {rec.considerations.slice(0, 2).map((consideration, idx) => (
                              <li key={idx} className="text-xs text-orange-600">• {consideration}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            })()}
          </ModernCardContent>
        </ModernCard>
      )}

      {/* Generated Plan */}
      {successionPlan && (
        <div className="space-y-6">
          {/* Plan Overview */}
          <ModernCard variant="floating">
            <ModernCardHeader>
              <ModernCardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Plan Overview
              </ModernCardTitle>
            </ModernCardHeader>
            <ModernCardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-sage-800">
                    {successionPlan.numberOfSuccessions}
                  </div>
                  <div className="text-sm text-sage-600">Plantings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-sage-800">
                    {successionPlan.intervalDays}
                  </div>
                  <div className="text-sm text-sage-600">Day Interval</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-sage-800">
                    {Math.round(successionPlan.harvestSchedule.totalSeasonYield)}
                  </div>
                  <div className="text-sm text-sage-600">Total Yield (lbs)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-sage-800">
                    {formatDate(successionPlan.startDate)} - {formatDate(successionPlan.endDate)}
                  </div>
                  <div className="text-sm text-sage-600">Season</div>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>

          {/* Planting Schedule */}
          <ModernCard variant="floating">
            <ModernCardHeader>
              <ModernCardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Planting Schedule
              </ModernCardTitle>
            </ModernCardHeader>
            <ModernCardContent>
              <div className="space-y-3">
                {successionPlan.plantings.map((planting, index) => (
                  <div key={planting.id} className="border rounded-lg p-4 hover:bg-sage-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-sage-600 text-white flex items-center justify-center text-sm font-bold">
                          {planting.sequenceNumber}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sage-800">
                            Planting #{planting.sequenceNumber}
                          </h4>
                          <p className="text-sm text-sage-600">
                            {formatArea(planting.areaAllocated)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(planting.status)}>
                          {planting.status}
                        </Badge>
                        {planting.weatherRisk && (
                          <span className={`text-sm font-medium ${getRiskColor(planting.weatherRisk)}`}>
                            {planting.weatherRisk} risk
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-3 text-sm">
                      <div>
                        <span className="text-sage-500">Plant Date:</span>
                        <div className="font-medium">{formatDate(planting.plantingDate)}</div>
                      </div>
                      <div>
                        <span className="text-sage-500">Harvest Start:</span>
                        <div className="font-medium">{formatDate(planting.harvestStartDate)}</div>
                      </div>
                      <div>
                        <span className="text-sage-500">Harvest End:</span>
                        <div className="font-medium">{formatDate(planting.harvestEndDate)}</div>
                      </div>
                      <div>
                        <span className="text-sage-500">Expected Yield:</span>
                        <div className="font-medium">{Math.round(planting.expectedYield)} lbs</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ModernCardContent>
          </ModernCard>

          {/* Resource Requirements */}
          <ModernCard variant="soft">
            <ModernCardHeader>
              <ModernCardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Resource Requirements
              </ModernCardTitle>
            </ModernCardHeader>
            <ModernCardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sage-800">Seeds</h4>
                    <p className="text-sm text-sage-600">
                      {successionPlan.resourceRequirements.totalSeeds.toLocaleString()} total
                    </p>
                    <p className="text-xs text-sage-500">
                      {successionPlan.resourceRequirements.seedsPerPlanting.toLocaleString()} per planting
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sage-800">Labor</h4>
                    <p className="text-sm text-sage-600">
                      {successionPlan.resourceRequirements.laborHours} hours total
                    </p>
                    <p className="text-xs text-sage-500">
                      {Math.round(successionPlan.resourceRequirements.laborHours / successionPlan.numberOfSuccessions)} hrs per planting
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Droplets className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sage-800">Irrigation</h4>
                    <p className="text-sm text-sage-600">
                      {successionPlan.resourceRequirements.irrigationSchedule.length} events scheduled
                    </p>
                    <p className="text-xs text-sage-500">
                      Every 3 days during growth
                    </p>
                  </div>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>

          {/* Harvest Timeline */}
          <ModernCard variant="floating">
            <ModernCardHeader>
              <ModernCardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Weekly Harvest Schedule
              </ModernCardTitle>
            </ModernCardHeader>
            <ModernCardContent>
              <div className="space-y-2">
                {successionPlan.harvestSchedule.weeklyHarvest
                  .filter(week => week.estimatedYield > 0)
                  .slice(0, 12)
                  .map((week, index) => {
                    const isPeak = successionPlan.harvestSchedule.peakHarvestWeeks
                      .some(peakDate => peakDate.getTime() === week.week.getTime())
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className="text-sm font-medium text-sage-700">
                            Week of {formatDate(week.week)}
                          </div>
                          {isPeak && (
                            <Badge className="bg-orange-100 text-orange-800 text-xs">
                              Peak Harvest
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-bold text-sage-800">
                            {Math.round(week.estimatedYield)} lbs
                          </div>
                          <div 
                            className="w-16 h-2 bg-sage-200 rounded-full overflow-hidden"
                          >
                            <div 
                              className="h-full bg-sage-600 rounded-full"
                              style={{ 
                                width: `${Math.min(100, (week.estimatedYield / Math.max(...successionPlan.harvestSchedule.weeklyHarvest.map(w => w.estimatedYield))) * 100)}%` 
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </ModernCardContent>
          </ModernCard>
        </div>
      )}
    </div>
  )
}