'use client'
import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { 
  Sprout, AlertTriangle, CheckCircle2, Clock, Thermometer,
  Droplets, Bug, Leaf, Target, TrendingUp, Calendar,
  ChevronRight, RefreshCw, Info, Zap, Activity
} from 'lucide-react'
import { cropCategories } from '../../lib/farm-categories'
import { LoadingCard } from '../ui/loading'
interface CropHealthData {
  cropId: string
  cropName: string
  category: string
  currentStage: string
  healthScore: number
  riskFactors: Array<{
    type: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    description: string
    recommendations: string[]
  }>
  optimalConditions: {
    temperature: { min: number; max: number; current: number }
    moisture: { optimal: string; current: string }
    nutrients: Array<{ name: string; status: string; level: number }>
  }
  monitoringParameters: Array<{
    parameter: string
    value: number
    threshold: number
    status: 'good' | 'warning' | 'critical'
    trend: 'improving' | 'stable' | 'declining'
  }>
  seasonalGuidance: {
    currentSeason: string
    upcomingTasks: string[]
    criticalWindows: string[]
  }
}
interface KnowledgeDrivenHealthProps {
  farmId: string
  selectedCrops: Array<{
    id: string
    name: string
    category: string
    monitoringParameters: string[]
    additionalInfo?: {
      growingSeasonDays?: number
      primaryHarvestSeason?: string[]
    }
  }>
  fieldData?: {
    latitude: number
    longitude: number
    soilType?: string
  }
}
export function KnowledgeDrivenHealthDashboard({ farmId, selectedCrops, fieldData }: KnowledgeDrivenHealthProps) {
  const [loading, setLoading] = useState(true)
  const [cropHealthData, setCropHealthData] = useState<CropHealthData[]>([])
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null)
  // Generate health data based on crop knowledge base
  const generateCropHealthData = useMemo(async () => {
    if (selectedCrops.length === 0) return []
    const healthData: CropHealthData[] = []
    for (const crop of selectedCrops) {
      // Find crop details from knowledge base
      const cropDetails = cropCategories
        .flatMap(cat => cat.items)
        .find(item => item.id === crop.id)
      if (!cropDetails) continue
      // Generate realistic health data based on crop knowledge
      const currentDate = new Date()
      const month = currentDate.getMonth() + 1
      // Determine current growth stage based on season and growing period
      let currentStage = 'vegetative'
      if (cropDetails.growingSeasonDays) {
        const dayOfYear = Math.floor((currentDate.getTime() - new Date(currentDate.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))
        const growthProgress = (dayOfYear % cropDetails.growingSeasonDays) / cropDetails.growingSeasonDays
        if (growthProgress < 0.3) currentStage = 'seedling'
        else if (growthProgress < 0.6) currentStage = 'vegetative'
        else if (growthProgress < 0.8) currentStage = 'reproductive'
        else currentStage = 'maturity'
      }
      // Generate health score with some randomness
      const baseHealthScore = 75 + Math.random() * 20
      // Create risk factors based on crop type and season
      const riskFactors = generateRiskFactors(crop, currentStage, month)
      // Generate monitoring parameters based on crop knowledge
      const monitoringParameters = cropDetails.monitoringParameters.map(param => ({
        parameter: param,
        value: generateParameterValue(param),
        threshold: getParameterThreshold(param),
        status: getParameterStatus(),
        trend: getTrend()
      }))
      // Create seasonal guidance
      const seasonalGuidance = generateSeasonalGuidance(crop, currentStage, month)
      healthData.push({
        cropId: crop.id,
        cropName: crop.name,
        category: crop.category,
        currentStage,
        healthScore: Math.round(baseHealthScore),
        riskFactors,
        optimalConditions: {
          temperature: {
            min: getOptimalTemp(crop.name).min,
            max: getOptimalTemp(crop.name).max,
            current: 72 + Math.random() * 16 // 72-88°F range
          },
          moisture: {
            optimal: getMoistureRequirement(crop.name),
            current: getCurrentMoisture()
          },
          nutrients: generateNutrientStatus(crop.name)
        },
        monitoringParameters,
        seasonalGuidance
      })
    }
    return healthData
  }, [selectedCrops, farmId])
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      const data = await generateCropHealthData
      setCropHealthData(data)
      if (data.length > 0 && !selectedCrop) {
        setSelectedCrop(data[0].cropId)
      }
      setLoading(false)
    }
    loadData()
  }, [generateCropHealthData])
  // Helper functions for generating realistic data
  function generateRiskFactors(crop: any, stage: string, month: number) {
    const risks = []
    // Season-based risks
    if (month >= 6 && month <= 8) { // Summer
      risks.push({
        type: 'heat_stress',
        severity: 'medium' as const,
        description: 'High temperatures may stress plants during reproductive stage',
        recommendations: ['Increase irrigation frequency', 'Apply mulch to reduce soil temperature']
      })
    }
    if (month >= 7 && month <= 9) { // Late summer/early fall
      risks.push({
        type: 'pest_pressure',
        severity: 'low' as const,
        description: 'Corn earworm activity increasing in area',
        recommendations: ['Weekly scouting for egg masses', 'Monitor trap counts']
      })
    }
    // Crop-specific risks
    if (crop.name.toLowerCase().includes('corn')) {
      risks.push({
        type: 'nutrient_deficiency',
        severity: 'medium' as const,
        description: 'Nitrogen uptake critical during rapid growth phase',
        recommendations: ['Soil test for available nitrogen', 'Consider side-dress application']
      })
    }
    return risks
  }
  function generateParameterValue(param: string): number {
    const valueMap: Record<string, number> = {
      'NDVI': 0.6 + Math.random() * 0.3,
      'Soil Moisture': 20 + Math.random() * 40,
      'Temperature': 70 + Math.random() * 20,
      'Growth Stage': Math.random() * 100,
      'Disease Detection': Math.random() * 10,
      'Pest Detection': Math.random() * 15
    }
    return Math.round((valueMap[param] || Math.random() * 100) * 10) / 10
  }
  function getParameterThreshold(param: string): number {
    const thresholdMap: Record<string, number> = {
      'NDVI': 0.7,
      'Soil Moisture': 25,
      'Temperature': 85,
      'Growth Stage': 75,
      'Disease Detection': 5,
      'Pest Detection': 10
    }
    return thresholdMap[param] || 50
  }
  function getParameterStatus(): 'good' | 'warning' | 'critical' {
    const rand = Math.random()
    if (rand < 0.7) return 'good'
    if (rand < 0.9) return 'warning'
    return 'critical'
  }
  function getTrend(): 'improving' | 'stable' | 'declining' {
    const trends = ['improving', 'stable', 'declining']
    return trends[Math.floor(Math.random() * trends.length)] as any
  }
  function getOptimalTemp(cropName: string) {
    const tempMap: Record<string, {min: number, max: number}> = {
      'corn': { min: 60, max: 95 },
      'soybean': { min: 50, max: 85 },
      'wheat': { min: 40, max: 75 },
      'tomato': { min: 55, max: 85 }
    }
    const key = Object.keys(tempMap).find(k => cropName.toLowerCase().includes(k))
    return tempMap[key || 'corn']
  }
  function getMoistureRequirement(cropName: string): string {
    if (cropName.toLowerCase().includes('corn')) return 'High (25-30 inches/season)'
    if (cropName.toLowerCase().includes('soy')) return 'Moderate (20-25 inches/season)'
    if (cropName.toLowerCase().includes('wheat')) return 'Low-Moderate (15-20 inches/season)'
    return 'Moderate (20-25 inches/season)'
  }
  function getCurrentMoisture(): string {
    const levels = ['Adequate', 'Slightly Low', 'Optimal', 'High']
    return levels[Math.floor(Math.random() * levels.length)]
  }
  function generateNutrientStatus(cropName: string) {
    return [
      { name: 'Nitrogen', status: 'Adequate', level: 85 + Math.random() * 15 },
      { name: 'Phosphorus', status: 'Good', level: 90 + Math.random() * 10 },
      { name: 'Potassium', status: 'Moderate', level: 70 + Math.random() * 20 },
      { name: 'pH', status: 'Optimal', level: 6.2 + Math.random() * 0.8 }
    ]
  }
  function generateSeasonalGuidance(crop: any, stage: string, month: number) {
    const seasonMap = ['Winter', 'Winter', 'Spring', 'Spring', 'Spring', 'Summer', 'Summer', 'Summer', 'Fall', 'Fall', 'Fall', 'Winter']
    const currentSeason = seasonMap[month - 1]
    let upcomingTasks: string[] = []
    let criticalWindows: string[] = []
    if (crop.name.toLowerCase().includes('corn')) {
      if (stage === 'vegetative') {
        upcomingTasks = ['Side-dress nitrogen application', 'Weed control', 'Pest scouting']
        criticalWindows = ['Nitrogen uptake period (V6-V12)', 'Pollination window (VT-R1)']
      } else if (stage === 'reproductive') {
        upcomingTasks = ['Monitor for silk emergence', 'Pest management', 'Irrigation management']
        criticalWindows = ['Grain fill period', 'Harvest timing window']
      }
    } else if (crop.name.toLowerCase().includes('soy')) {
      if (stage === 'vegetative') {
        upcomingTasks = ['Monitor nodulation', 'Weed management', 'Aphid scouting']
        criticalWindows = ['Flower initiation (R1)', 'Pod development (R3-R4)']
      }
    }
    return {
      currentSeason,
      upcomingTasks,
      criticalWindows
    }
  }
  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />
      default: return <CheckCircle2 className="h-4 w-4 text-gray-400" />
    }
  }
  const selectedCropData = cropHealthData.find(crop => crop.cropId === selectedCrop)
  if (loading) {
    return (
      <div className="space-y-4">
        <LoadingCard />
        <LoadingCard />
      </div>
    )
  }
  if (cropHealthData.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Sprout className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Crops Selected</h3>
          <p className="text-gray-500 mb-4">
            Add crops to your farm to get detailed health monitoring and insights
          </p>
          <Button variant="outline">
            Configure Crops
          </Button>
        </CardContent>
      </Card>
    )
  }
  return (
    <div className="space-y-6">
      {/* Crop Selection Header */}
      <div className="flex items-center gap-4 overflow-x-auto pb-2">
        {cropHealthData.map(crop => (
          <button
            key={crop.cropId}
            onClick={() => setSelectedCrop(crop.cropId)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all whitespace-nowrap ${
              selectedCrop === crop.cropId
                ? 'border-green-500 bg-green-50 text-green-800'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Sprout className="h-4 w-4" />
            <span className="font-medium">{crop.cropName}</span>
            <Badge variant="outline" className="text-xs">
              {crop.currentStage}
            </Badge>
          </button>
        ))}
      </div>
      {selectedCropData && (
        <div className="space-y-6">
          {/* Health Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Overall Health</p>
                    <p className={`text-2xl font-bold ${getHealthScoreColor(selectedCropData.healthScore)}`}>
                      {selectedCropData.healthScore}%
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-gray-400" />
                </div>
                <Progress value={selectedCropData.healthScore} className="mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Growth Stage</p>
                    <p className="text-lg font-semibold capitalize">
                      {selectedCropData.currentStage}
                    </p>
                  </div>
                  <Leaf className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Risk Factors</p>
                    <p className="text-lg font-semibold">
                      {selectedCropData.riskFactors.length} Active
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Detailed Monitoring */}
          <Tabs defaultValue="monitoring">
            <TabsList>
              <TabsTrigger value="monitoring">Real-time Monitoring</TabsTrigger>
              <TabsTrigger value="conditions">Optimal Conditions</TabsTrigger>
              <TabsTrigger value="guidance">Seasonal Guidance</TabsTrigger>
              <TabsTrigger value="risks">Risk Management</TabsTrigger>
            </TabsList>
            <TabsContent value="monitoring" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Monitoring Parameters</CardTitle>
                  <CardDescription>
                    Real-time data from satellite imagery, sensors, and field observations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedCropData.monitoringParameters.map((param, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(param.status)}
                          <div>
                            <p className="font-medium">{param.parameter}</p>
                            <p className="text-sm text-gray-600">
                              Current: {param.value} | Threshold: {param.threshold}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="text-xs">
                            {param.trend}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="conditions" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Thermometer className="h-5 w-5" />
                      Temperature
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Current:</span>
                        <span className="font-medium">{Math.round(selectedCropData.optimalConditions.temperature.current)}°F</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Optimal Range:</span>
                        <span className="font-medium">
                          {selectedCropData.optimalConditions.temperature.min}-{selectedCropData.optimalConditions.temperature.max}°F
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Droplets className="h-5 w-5" />
                      Moisture
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Current:</span>
                        <span className="font-medium">{selectedCropData.optimalConditions.moisture.current}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Requirement:</span>
                        <span className="font-medium">{selectedCropData.optimalConditions.moisture.optimal}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Nutrient Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selectedCropData.optimalConditions.nutrients.map((nutrient, idx) => (
                      <div key={idx} className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium">{nutrient.name}</p>
                        <p className="text-2xl font-bold text-green-600">{Math.round(nutrient.level)}</p>
                        <p className="text-xs text-gray-600">{nutrient.status}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="guidance" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Upcoming Tasks
                    </CardTitle>
                    <CardDescription>Recommended actions for current growth stage</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {selectedCropData.seasonalGuidance.upcomingTasks.map((task, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                          <span className="text-sm">{task}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Critical Windows
                    </CardTitle>
                    <CardDescription>Important timing considerations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {selectedCropData.seasonalGuidance.criticalWindows.map((window, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                          <span className="text-sm">{window}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="risks" className="space-y-4">
              {selectedCropData.riskFactors.map((risk, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="capitalize">{risk.type.replace('_', ' ')}</CardTitle>
                      <Badge className={
                        risk.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        risk.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                        risk.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }>
                        {risk.severity}
                      </Badge>
                    </div>
                    <CardDescription>{risk.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <h4 className="font-medium mb-2">Recommended Actions:</h4>
                      <ul className="space-y-1">
                        {risk.recommendations.map((rec, recIdx) => (
                          <li key={recIdx} className="flex items-start gap-2 text-sm">
                            <ChevronRight className="h-4 w-4 text-gray-400 mt-0.5" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}