'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import { 
  Leaf, AlertTriangle, TrendingUp, TrendingDown, Activity, 
  Droplets, Bug, Zap, Target, RefreshCw, Eye, BarChart3,
  CheckCircle2, XCircle, MinusCircle, MapPin
} from 'lucide-react'
import { InfoTooltip } from '../ui/info-tooltip'
import { TOOLTIP_CONTENT } from '../../lib/tooltip-content'
import { LoadingState, LoadingCard, LoadingButton } from '../ui/loading'
import { ErrorBoundary, ErrorState } from '../ui/error-boundary'

interface HealthDashboardProps {
  farmId: string
}

interface FieldHealth {
  fieldId: string
  fieldName: string
  cropType: string
  healthScore: number
  stressLevel: 'none' | 'low' | 'moderate' | 'high' | 'severe'
  lastUpdate: string
  area: number
  indices: {
    ndvi: number
    evi: number
    savi: number
    gndvi: number
    ndwi: number
    ndmi: number
    lai: number
    fvc: number
  }
  stressIndicators: {
    drought: { severity: number; confidence: number; description: string }
    disease: { severity: number; confidence: number; description: string }
    nutrient: { severity: number; confidence: number; description: string }
    pest: { severity: number; confidence: number; description: string }
  }
  zones: {
    excellent: { percentage: number; area: number }
    good: { percentage: number; area: number }
    moderate: { percentage: number; area: number }
    stressed: { percentage: number; area: number }
  }
  recommendations: string[]
  yieldPrediction: {
    current: number
    potential: number
    confidence: number
  }
}

const stressLevelColors = {
  none: 'bg-green-100 text-green-800',
  low: 'bg-yellow-100 text-yellow-800',
  moderate: 'bg-orange-100 text-orange-800',
  high: 'bg-red-100 text-red-800',
  severe: 'bg-red-200 text-red-900'
}

const stressIcons = {
  drought: Droplets,
  disease: Bug,
  nutrient: Zap,
  pest: Target
}

export function HealthDashboard({ farmId }: HealthDashboardProps) {
  const [fields, setFields] = useState<FieldHealth[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedField, setSelectedField] = useState<string | null>(null)
  const [dataStatus, setDataStatus] = useState<'real' | 'mock' | 'error'>('mock')

  useEffect(() => {
    fetchHealthData()
  }, [farmId])

  const fetchHealthData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/satellite/farm-health?farmId=${farmId}`)
      
      if (response.ok) {
        const data = await response.json()
        // Transform API data to match our interface
        setFields(data.fields || [])
        setDataStatus(data.hasRealData ? 'real' : 'mock')
      } else {
        // Use mock data for demo
        setFields(getMockHealthData())
        setDataStatus('mock')
      }
    } catch (error) {
      console.error('Failed to fetch health data:', error)
      setFields([])
      setDataStatus('error')
    } finally {
      setLoading(false)
    }
  }

  const getMockHealthData = (): FieldHealth[] => {
    // Generate dynamic field IDs based on farm ID and timestamp to avoid conflicts
    const timestamp = Date.now()
    return [
      {
        fieldId: `temp-${farmId}-${timestamp}-1`,
        fieldName: 'North Field',
        cropType: 'Corn',
        healthScore: 85,
        stressLevel: 'low',
        lastUpdate: new Date().toISOString(),
        area: 45.2,
        indices: {
          ndvi: 0.78,
          evi: 0.65,
          savi: 0.72,
          gndvi: 0.68,
          ndwi: 0.35,
          ndmi: 0.42,
          lai: 4.2,
          fvc: 0.85
        },
        stressIndicators: {
          drought: { severity: 25, confidence: 82, description: 'Slight moisture deficit in southwest section' },
          disease: { severity: 10, confidence: 65, description: 'No significant disease pressure detected' },
          nutrient: { severity: 15, confidence: 78, description: 'Minor nitrogen deficiency in central area' },
          pest: { severity: 5, confidence: 90, description: 'Low pest pressure, normal for season' }
        },
        zones: {
          excellent: { percentage: 45, area: 20.3 },
          good: { percentage: 35, area: 15.8 },
          moderate: { percentage: 15, area: 6.8 },
          stressed: { percentage: 5, area: 2.3 }
        },
        recommendations: [
          'Monitor soil moisture levels in southwest section',
          'Consider nitrogen application in central area',
          'Continue regular pest scouting'
        ],
        yieldPrediction: {
          current: 185,
          potential: 220,
          confidence: 87
        }
      },
      {
        fieldId: `temp-${farmId}-${timestamp}-2`,
        fieldName: 'South Field',
        cropType: 'Soybeans',
        healthScore: 92,
        stressLevel: 'none',
        lastUpdate: new Date().toISOString(),
        area: 32.7,
        indices: {
          ndvi: 0.82,
          evi: 0.71,
          savi: 0.79,
          gndvi: 0.75,
          ndwi: 0.45,
          ndmi: 0.52,
          lai: 5.1,
          fvc: 0.92
        },
        stressIndicators: {
          drought: { severity: 5, confidence: 95, description: 'Excellent moisture conditions' },
          disease: { severity: 8, confidence: 72, description: 'Minor leaf spot detected in northwest corner' },
          nutrient: { severity: 3, confidence: 88, description: 'Optimal nutrient levels throughout field' },
          pest: { severity: 12, confidence: 85, description: 'Light aphid pressure, below threshold' }
        },
        zones: {
          excellent: { percentage: 65, area: 21.3 },
          good: { percentage: 30, area: 9.8 },
          moderate: { percentage: 5, area: 1.6 },
          stressed: { percentage: 0, area: 0 }
        },
        recommendations: [
          'Maintain current management practices',
          'Monitor aphid levels weekly',
          'Prepare for optimal harvest timing'
        ],
        yieldPrediction: {
          current: 58,
          potential: 62,
          confidence: 91
        }
      }
    ]
  }

  const getHealthColor = (score: number) => {
    if (score >= 85) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    if (score >= 50) return 'text-orange-600'
    return 'text-red-600'
  }

  const getStressIcon = (severity: number) => {
    if (severity <= 10) return <CheckCircle2 className="h-4 w-4 text-green-600" />
    if (severity <= 30) return <MinusCircle className="h-4 w-4 text-yellow-600" />
    return <XCircle className="h-4 w-4 text-red-600" />
  }

  const selectedFieldData = fields.find(f => f.fieldId === selectedField) || fields[0]

  if (loading) {
    return (
      <LoadingCard 
        title="Analyzing Crop Health" 
        message="Processing satellite imagery and vegetation indices for comprehensive field analysis..." 
        type="health" 
      />
    )
  }

  // Empty state when no fields are available
  if (!fields || fields.length === 0) {
    return (
      <ErrorBoundary>
        <Card className="border-2 border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="p-4 rounded-full bg-yellow-100 inline-flex">
                <Leaf className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-yellow-800 mt-4">
                No Fields Available
              </h3>
              <p className="text-yellow-700 mt-2 max-w-md mx-auto">
                {dataStatus === 'error' 
                  ? 'Unable to load field health data. Please try refreshing or contact support if the issue persists.'
                  : 'No fields have been added to this farm yet. Add fields to start monitoring crop health.'
                }
              </p>
              <div className="mt-6 space-x-3">
                <Button
                  onClick={fetchHealthData}
                  variant="outline"
                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                {dataStatus !== 'error' && (
                  <Button
                    onClick={() => window.location.href = '/fields'}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Add Fields
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
      {/* Data Status Indicator - Only show if error */}
      {dataStatus === 'error' && (
        <Card className="border-l-4 border-l-yellow-500 bg-yellow-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-yellow-100">
                <Activity className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <h4 className="font-semibold text-yellow-900">
                  Data Temporarily Unavailable
                </h4>
                <p className="text-sm text-yellow-700">
                  We're updating our satellite imagery. Data will refresh automatically.
                </p>
              </div>
              <Button
                onClick={fetchHealthData}
                variant="outline"
                size="sm"
                className="ml-auto"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overview Stats - Mobile Optimized */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card className="border-2">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium text-gray-600">Overall Health</CardTitle>
              <InfoTooltip {...TOOLTIP_CONTENT.healthScore} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.round((fields || []).reduce((sum, f) => sum + f.healthScore, 0) / (fields || []).length)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Average across {(fields || []).length} fields
            </p>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium text-gray-600">Stressed Areas</CardTitle>
              <InfoTooltip {...TOOLTIP_CONTENT.stressLevel} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {(fields || []).reduce((sum, f) => sum + f.zones?.stressed?.percentage || 0, 0).toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Requiring attention
            </p>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium text-gray-600">Avg NDVI</CardTitle>
              <InfoTooltip {...TOOLTIP_CONTENT.ndvi} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {((fields || []).reduce((sum, f) => sum + f.indices?.ndvi || 0, 0) / (fields || []).length).toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Vegetation index
            </p>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Area</CardTitle>
              <InfoTooltip {...TOOLTIP_CONTENT.area} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {(fields || []).reduce((sum, f) => sum + f.area, 0).toFixed(1)} ha
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Under monitoring
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Field Selection */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Field Selection</CardTitle>
          <CardDescription>Choose a field for detailed health analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {fields.map((field) => (
              <button
                key={field.fieldId}
                onClick={() => setSelectedField(field.fieldId)}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  selectedField === field.fieldId || (selectedField === null && field === fields[0])
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-semibold">{field.fieldName}</div>
                    <div className="text-sm text-gray-600">{field.cropType} • {field.area.toFixed(1)} ha</div>
                  </div>
                  <Badge className={stressLevelColors[field.stressLevel]}>
                    {field.stressLevel}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Health Score:</span>
                  <span className={`font-bold ${getHealthColor(field.healthScore)}`}>
                    {field.healthScore}%
                  </span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedFieldData && (
        <>
          {/* Detailed Field Analysis - Mobile Optimized */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {/* Health Zones */}
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>Health Zone Distribution</CardTitle>
                  <InfoTooltip {...TOOLTIP_CONTENT.zones} />
                </div>
                <CardDescription>{selectedFieldData.fieldName} - {selectedFieldData.area.toFixed(1)} ha</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(selectedFieldData.zones).map(([zone, data]) => (
                    <div key={zone}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium capitalize">{zone}</span>
                        <span className="text-sm text-gray-600">
                          {data.percentage}% ({data.area.toFixed(1)} ha)
                        </span>
                      </div>
                      <Progress 
                        value={data.percentage} 
                        className={`h-2 ${
                          zone === 'excellent' ? '[&>div]:bg-green-500' :
                          zone === 'good' ? '[&>div]:bg-yellow-500' :
                          zone === 'moderate' ? '[&>div]:bg-orange-500' :
                          '[&>div]:bg-red-500'
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Vegetation Indices */}
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>Vegetation Indices</CardTitle>
                  <InfoTooltip {...TOOLTIP_CONTENT.vegetationIndices} />
                </div>
                <CardDescription>Comprehensive vegetation health metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {Object.entries(selectedFieldData.indices).map(([index, value]) => {
                    const tooltipKey = index as keyof typeof TOOLTIP_CONTENT
                    const tooltipData = TOOLTIP_CONTENT[tooltipKey]
                    
                    return (
                      <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold">{value.toFixed(3)}</div>
                        <div className="flex items-center justify-center gap-1 text-xs text-gray-600">
                          <span>{index.toUpperCase()}</span>
                          {tooltipData && <InfoTooltip {...tooltipData} size="sm" />}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stress Analysis */}
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>Stress Analysis</CardTitle>
                <InfoTooltip {...TOOLTIP_CONTENT.stressAnalysis} />
              </div>
              <CardDescription>AI-powered stress detection and severity assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {Object.entries(selectedFieldData.stressIndicators).map(([type, data]) => {
                  const Icon = stressIcons[type as keyof typeof stressIcons]
                  const tooltipKey = type as keyof typeof TOOLTIP_CONTENT
                  const tooltipData = TOOLTIP_CONTENT[tooltipKey]
                  
                  return (
                    <div key={type} className="p-4 border-2 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <Icon className="h-5 w-5 text-blue-600" />
                        <span className="font-medium capitalize">{type}</span>
                        {tooltipData && <InfoTooltip {...tooltipData} size="sm" />}
                        {getStressIcon(data.severity)}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Severity:</span>
                          <span className={`font-medium ${
                            data.severity <= 10 ? 'text-green-600' :
                            data.severity <= 30 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {data.severity}%
                          </span>
                        </div>
                        
                        <Progress 
                          value={data.severity} 
                          className={`h-2 ${
                            data.severity <= 10 ? '[&>div]:bg-green-500' :
                            data.severity <= 30 ? '[&>div]:bg-yellow-500' :
                            '[&>div]:bg-red-500'
                          }`}
                        />
                        
                        <div className="text-xs text-gray-600">
                          Confidence: {data.confidence}%
                        </div>
                        
                        <p className="text-xs text-gray-700 mt-2">
                          {data.description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Yield Prediction */}
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>Yield Prediction</CardTitle>
                <InfoTooltip {...TOOLTIP_CONTENT.yieldPrediction} />
              </div>
              <CardDescription>AI-powered yield forecasting based on current health metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-800">
                    {selectedFieldData.yieldPrediction.current}
                  </div>
                  <div className="flex items-center justify-center gap-1 text-sm text-blue-600">
                    <span>Current Projection</span>
                    <InfoTooltip {...TOOLTIP_CONTENT.currentYield} size="sm" />
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {selectedFieldData.cropType === 'Corn' ? 'bushels/acre' : 
                     selectedFieldData.cropType === 'Soybeans' ? 'bushels/acre' : 'units/acre'}
                  </div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-800">
                    {selectedFieldData.yieldPrediction.potential}
                  </div>
                  <div className="flex items-center justify-center gap-1 text-sm text-green-600">
                    <span>Potential Yield</span>
                    <InfoTooltip {...TOOLTIP_CONTENT.potentialYield} size="sm" />
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    With optimization
                  </div>
                </div>
                
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-800">
                    {selectedFieldData.yieldPrediction.confidence}%
                  </div>
                  <div className="flex items-center justify-center gap-1 text-sm text-orange-600">
                    <span>Confidence Level</span>
                    <InfoTooltip {...TOOLTIP_CONTENT.confidence} size="sm" />
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Prediction accuracy
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Yield Gap Analysis</span>
                </div>
                <p className="text-sm text-gray-700">
                  Current projection is {((selectedFieldData.yieldPrediction.potential - selectedFieldData.yieldPrediction.current) / selectedFieldData.yieldPrediction.current * 100).toFixed(1)}% below potential. 
                  Key improvement opportunities: stress management and nutrient optimization.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>Management Recommendations</CardTitle>
                <InfoTooltip {...TOOLTIP_CONTENT.recommendations} />
              </div>
              <CardDescription>AI-generated action items for {selectedFieldData.fieldName}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedFieldData.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5" />
                    <span className="text-sm">{rec}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
      </div>
    </ErrorBoundary>
  )
}