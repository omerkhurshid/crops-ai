'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Alert, AlertDescription } from '../ui/alert'
import { Progress } from '../ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { 
  Satellite, TrendingUp, AlertTriangle, DollarSign, 
  Target, Zap, CheckCircle, Clock, Download, Share,
  MapPin, BarChart3, Activity, Sprout, Droplets,
  Thermometer, Wind, Cloud, Sun
} from 'lucide-react'
// import { GoogleMapsFieldEditor } from '../farm/google-maps-field-editor' // Temporarily disabled
import { WorkflowDemo } from '../satellite/workflow-demo'
interface FarmMetrics {
  farmOverview: {
    totalFields: number
    totalArea: number
    avgHealthScore: number
    avgNDVI: number
    healthDistribution: {
      excellent: number
      good: number
      fair: number
      poor: number
    }
  }
  stressAnalysis: {
    primaryStressor: string
    stressFactors: {
      drought: number
      disease: number
      nutrient: number
    }
  }
  precisionMetrics: {
    totalInvestment: number
    expectedReturn: number
    netBenefit: number
    averageROI: number
    sustainabilityScore: number
  }
  riskAssessment: {
    overallRisk: string
    immediateActions: number
    monitoringRequired: number
    lowPriority: number
  }
}
interface CriticalAlert {
  id: string
  fieldName: string
  title: string
  message: string
  severity: 'high' | 'critical' | 'emergency'
  urgencyLevel: number
  detectedAt: string
  actionItems: Array<{
    task: string
    priority: 'immediate' | 'within_24h' | 'within_week'
    estimatedCost?: number
  }>
}
interface PrecisionRecommendation {
  id: string
  fieldName: string
  applicationType: string
  recommendation: {
    product: string
    totalQuantity: number
    estimatedCost: number
  }
  expectedOutcome: {
    yieldIncrease: number
    costSavings: number
    roi: number
  }
  timing: {
    optimalWindow: { start: string; end: string }
  }
}
interface UnifiedFarmDashboardProps {
  farmId: string
  farmLocation: { lat: number; lng: number }
}
export function UnifiedFarmDashboard({ farmId, farmLocation }: UnifiedFarmDashboardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [farmMetrics, setFarmMetrics] = useState<FarmMetrics | null>(null)
  const [criticalAlerts, setCriticalAlerts] = useState<CriticalAlert[]>([])
  const [precisionRecommendations, setPrecisionRecommendations] = useState<PrecisionRecommendation[]>([])
  const [activeTab, setActiveTab] = useState('overview')
  const [runningAnalysis, setRunningAnalysis] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  useEffect(() => {
    loadFarmData()
  }, [farmId])
  const loadFarmData = async () => {
    try {
      setIsLoading(true)
      // Load existing farm analysis or trigger new one
      const response = await fetch(`/api/satellite/precision-analysis?farmId=${farmId}`)
      const data = await response.json()
      if (data.success && data.summary) {
        setLastUpdated(data.summary.lastAnalysis || new Date().toISOString())
      }
      // Load mock data for demonstration
      setFarmMetrics({
        farmOverview: {
          totalFields: 4,
          totalArea: 285.7,
          avgHealthScore: 74.2,
          avgNDVI: 0.687,
          healthDistribution: {
            excellent: 1,
            good: 2,
            fair: 1,
            poor: 0
          }
        },
        stressAnalysis: {
          primaryStressor: 'drought',
          stressFactors: {
            drought: 0.65,
            disease: 0.23,
            nutrient: 0.41
          }
        },
        precisionMetrics: {
          totalInvestment: 8420,
          expectedReturn: 24680,
          netBenefit: 16260,
          averageROI: 193.2,
          sustainabilityScore: 87.5
        },
        riskAssessment: {
          overallRisk: 'Moderate',
          immediateActions: 2,
          monitoringRequired: 3,
          lowPriority: 1
        }
      })
      setCriticalAlerts([
        {
          id: 'alert-1',
          fieldName: 'North Field',
          title: 'Critical Drought Stress',
          message: 'Severe drought stress detected affecting 34.2% of field',
          severity: 'critical',
          urgencyLevel: 4,
          detectedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          actionItems: [
            { task: 'Increase irrigation frequency to 2x daily', priority: 'immediate', estimatedCost: 150 },
            { task: 'Apply water stress-reducing treatments', priority: 'within_24h', estimatedCost: 75 }
          ]
        },
        {
          id: 'alert-2',
          fieldName: 'East Field',
          title: 'Potential Disease Outbreak',
          message: 'Disease stress indicators suggest potential outbreak affecting 18.7% of field',
          severity: 'high',
          urgencyLevel: 3,
          detectedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          actionItems: [
            { task: 'Scout field for visible disease symptoms', priority: 'immediate', estimatedCost: 50 },
            { task: 'Collect samples for laboratory analysis', priority: 'within_24h', estimatedCost: 100 }
          ]
        }
      ])
      setPrecisionRecommendations([
        {
          id: 'rec-1',
          fieldName: 'North Field',
          applicationType: 'irrigation',
          recommendation: {
            product: 'Variable-rate irrigation',
            totalQuantity: 2.3,
            estimatedCost: 180
          },
          expectedOutcome: {
            yieldIncrease: 12.0,
            costSavings: 200,
            roi: 340
          },
          timing: {
            optimalWindow: { 
              start: new Date().toISOString().split('T')[0],
              end: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            }
          }
        },
        {
          id: 'rec-2',
          fieldName: 'West Field',
          applicationType: 'fertilizer',
          recommendation: {
            product: 'Variable-rate nitrogen application',
            totalQuantity: 2850,
            estimatedCost: 1283
          },
          expectedOutcome: {
            yieldIncrease: 8.5,
            costSavings: 150,
            roi: 285
          },
          timing: {
            optimalWindow: { 
              start: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              end: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            }
          }
        }
      ])
    } catch (error) {
      console.error('Error loading farm data:', error)
    } finally {
      setIsLoading(false)
    }
  }
  const runComprehensiveAnalysis = async () => {
    try {
      setRunningAnalysis(true)
      const response = await fetch('/api/satellite/precision-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmId,
          analysisType: 'comprehensive'
        })
      })
      const data = await response.json()
      if (data.success) {
        setLastUpdated(data.timestamp)
        // Refresh data after analysis
        await loadFarmData()
      }
    } catch (error) {
      console.error('Error running comprehensive analysis:', error)
    } finally {
      setRunningAnalysis(false)
    }
  }
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'emergency': return 'bg-red-600 text-white'
      case 'critical': return 'bg-red-500 text-white'
      case 'high': return 'bg-orange-500 text-white'
      default: return 'bg-yellow-500 text-white'
    }
  }
  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'critical': return 'text-red-600'
      case 'high': return 'text-orange-600'
      case 'moderate': return 'text-yellow-600'
      default: return 'text-green-600'
    }
  }
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.round((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.round(diffInHours / 24)
    return `${diffInDays}d ago`
  }
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Satellite className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg font-semibold">Loading farm intelligence...</p>
          <p className="text-gray-600">Analyzing satellite data and precision agriculture insights</p>
        </div>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Precision Farm Intelligence</h1>
          <p className="text-gray-600">
            Complete farm-to-satellite analysis with AI-powered recommendations
          </p>
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {formatTimeAgo(lastUpdated)}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={runComprehensiveAnalysis}
            disabled={runningAnalysis}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {runningAnalysis ? (
              <>
                <Satellite className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Run Analysis
              </>
            )}
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      {/* Quick Stats */}
      {farmMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Fields Monitored</p>
                  <p className="text-2xl font-bold">{farmMetrics.farmOverview.totalFields}</p>
                  <p className="text-sm text-gray-500">{farmMetrics.farmOverview.totalArea.toFixed(1)} acres</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Health Score</p>
                  <p className="text-2xl font-bold">{farmMetrics.farmOverview.avgHealthScore.toFixed(1)}%</p>
                  <p className="text-sm text-gray-500">NDVI: {farmMetrics.farmOverview.avgNDVI.toFixed(3)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className={`h-8 w-8 ${getRiskColor(farmMetrics.riskAssessment.overallRisk)}`} />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Risk Level</p>
                  <p className={`text-2xl font-bold ${getRiskColor(farmMetrics.riskAssessment.overallRisk)}`}>
                    {farmMetrics.riskAssessment.overallRisk}
                  </p>
                  <p className="text-sm text-gray-500">{farmMetrics.riskAssessment.immediateActions} urgent actions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Projected ROI</p>
                  <p className="text-2xl font-bold">{farmMetrics.precisionMetrics.averageROI.toFixed(0)}%</p>
                  <p className="text-sm text-gray-500">{formatCurrency(farmMetrics.precisionMetrics.netBenefit)} net benefit</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center text-red-700">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Critical Alerts Requiring Attention
            </CardTitle>
            <CardDescription className="text-red-600">
              {criticalAlerts.length} critical issues detected across your fields
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {criticalAlerts.slice(0, 2).map((alert) => (
                <div key={alert.id} className="bg-white p-4 rounded-lg border border-red-200">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <span className="font-medium">{alert.fieldName}</span>
                        <span className="text-sm text-gray-500">{formatTimeAgo(alert.detectedAt)}</span>
                      </div>
                      <h4 className="font-semibold text-red-800">{alert.title}</h4>
                      <p className="text-sm text-red-700 mb-3">{alert.message}</p>
                    </div>
                  </div>
                  <div className="bg-red-50 p-3 rounded-md">
                    <p className="font-medium text-red-800 mb-2">Immediate Actions:</p>
                    <div className="space-y-1">
                      {alert.actionItems.slice(0, 2).map((action, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-red-700">• {action.task}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {action.priority.replace('_', ' ')}
                            </Badge>
                            {action.estimatedCost && (
                              <span className="text-red-600 font-medium">
                                {formatCurrency(action.estimatedCost)}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="satellite">Satellite Analysis</TabsTrigger>
          <TabsTrigger value="precision">Precision Ag</TabsTrigger>
          <TabsTrigger value="workflow">Workflow Demo</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-6">
          {farmMetrics && (
            <>
              {/* Health Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Field Health Distribution</CardTitle>
                  <CardDescription>Overall crop health across all monitored fields</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-700">
                        {farmMetrics.farmOverview.healthDistribution.excellent}
                      </div>
                      <div className="text-sm text-green-600">Excellent</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-700">
                        {farmMetrics.farmOverview.healthDistribution.good}
                      </div>
                      <div className="text-sm text-blue-600">Good</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-700">
                        {farmMetrics.farmOverview.healthDistribution.fair}
                      </div>
                      <div className="text-sm text-yellow-600">Fair</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-700">
                        {farmMetrics.farmOverview.healthDistribution.poor}
                      </div>
                      <div className="text-sm text-red-600">Poor</div>
                    </div>
                  </div>
                  {/* Stress Analysis */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Primary Stress Factors</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Drought Stress</span>
                          <span className="text-sm text-gray-600">
                            {(farmMetrics.stressAnalysis.stressFactors.drought * 100).toFixed(1)}%
                          </span>
                        </div>
                        <Progress 
                          value={farmMetrics.stressAnalysis.stressFactors.drought * 100}
                          className="h-2"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Nutrient Deficiency</span>
                          <span className="text-sm text-gray-600">
                            {(farmMetrics.stressAnalysis.stressFactors.nutrient * 100).toFixed(1)}%
                          </span>
                        </div>
                        <Progress 
                          value={farmMetrics.stressAnalysis.stressFactors.nutrient * 100}
                          className="h-2"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Disease Pressure</span>
                          <span className="text-sm text-gray-600">
                            {(farmMetrics.stressAnalysis.stressFactors.disease * 100).toFixed(1)}%
                          </span>
                        </div>
                        <Progress 
                          value={farmMetrics.stressAnalysis.stressFactors.disease * 100}
                          className="h-2"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* Financial Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Precision Agriculture Investment Analysis</CardTitle>
                  <CardDescription>Projected returns from implementing precision agriculture recommendations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600">Total Investment</p>
                      <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(farmMetrics.precisionMetrics.totalInvestment)}
                      </p>
                      <p className="text-sm text-gray-500">Equipment, inputs, services</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600">Expected Return</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(farmMetrics.precisionMetrics.expectedReturn)}
                      </p>
                      <p className="text-sm text-gray-500">Increased yield value</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600">Net Benefit</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatCurrency(farmMetrics.precisionMetrics.netBenefit)}
                      </p>
                      <p className="text-sm text-gray-500">ROI: {farmMetrics.precisionMetrics.averageROI.toFixed(0)}%</p>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      <div>
                        <p className="font-medium text-green-800">
                          Strong ROI Justification
                        </p>
                        <p className="text-sm text-green-700">
                          Sustainability Score: {farmMetrics.precisionMetrics.sustainabilityScore.toFixed(1)}/100
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
        <TabsContent value="satellite" className="space-y-6">
          {/* Satellite Analysis would go here - showing placeholder for now */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Satellite className="h-5 w-5 mr-2" />
                Real-Time Satellite Monitoring
              </CardTitle>
              <CardDescription>
                Sentinel-2 satellite imagery with AI-powered crop stress detection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Current NDVI Analysis</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-green-600">0.687</p>
                        <p className="text-sm text-gray-600">Average NDVI</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-600">74.2%</p>
                        <p className="text-sm text-gray-600">Health Score</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium">Field Health Zones:</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>🟢 Healthy vegetation</span>
                        <span>62.3%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>🟡 Moderate stress</span>
                        <span>23.5%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>🔴 Stressed areas</span>
                        <span>14.2%</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold">Environmental Conditions</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                      <Thermometer className="h-6 w-6 text-blue-600 mr-2" />
                      <div>
                        <p className="font-medium">78°F</p>
                        <p className="text-xs text-gray-600">Temperature</p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-green-50 rounded-lg">
                      <Droplets className="h-6 w-6 text-green-600 mr-2" />
                      <div>
                        <p className="font-medium">0.2"</p>
                        <p className="text-xs text-gray-600">Soil Moisture</p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                      <Wind className="h-6 w-6 text-yellow-600 mr-2" />
                      <div>
                        <p className="font-medium">8 mph</p>
                        <p className="text-xs text-gray-600">Wind Speed</p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                      <Sun className="h-6 w-6 text-orange-600 mr-2" />
                      <div>
                        <p className="font-medium">12%</p>
                        <p className="text-xs text-gray-600">Cloud Cover</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="precision" className="space-y-6">
          {/* Precision Agriculture Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Variable-Rate Application Recommendations</CardTitle>
              <CardDescription>
                AI-generated precision agriculture plans based on satellite analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {precisionRecommendations.map((rec) => (
                  <div key={rec.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{rec.fieldName} - {rec.applicationType.charAt(0).toUpperCase() + rec.applicationType.slice(1)}</h4>
                        <p className="text-sm text-gray-600">{rec.recommendation.product}</p>
                      </div>
                      <Badge variant="outline">{rec.timing.optimalWindow.start} to {rec.timing.optimalWindow.end}</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-blue-800">Application</p>
                        <p className="text-lg font-bold text-blue-600">
                          {rec.recommendation.totalQuantity.toLocaleString()} 
                          {rec.applicationType === 'irrigation' ? ' in/week' : ' lbs'}
                        </p>
                        <p className="text-sm text-blue-600">Cost: {formatCurrency(rec.recommendation.estimatedCost)}</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-green-800">Expected Yield Increase</p>
                        <p className="text-lg font-bold text-green-600">+{rec.expectedOutcome.yieldIncrease.toFixed(1)}%</p>
                        <p className="text-sm text-green-600">Savings: {formatCurrency(rec.expectedOutcome.costSavings)}</p>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-purple-800">ROI</p>
                        <p className="text-lg font-bold text-purple-600">{rec.expectedOutcome.roi.toFixed(0)}%</p>
                        <p className="text-sm text-purple-600">Return on investment</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="workflow" className="space-y-6">
          <WorkflowDemo 
            farmLocation={farmLocation}
            onComplete={(fields) => {
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}