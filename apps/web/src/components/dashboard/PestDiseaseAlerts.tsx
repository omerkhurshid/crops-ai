/**
 * Pest & Disease Alerts Dashboard Component
 * 
 * Displays comprehensive pest and disease outbreak predictions,
 * risk assessments, and management recommendations for farmers.
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { Progress } from '../ui/progress'
import {
  AlertTriangle,
  Bug,
  Leaf,
  Calendar,
  TrendingUp,
  Shield,
  Activity,
  Clock,
  MapPin,
  Target,
  Zap,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Thermometer,
  Droplets,
  Wind,
  Eye
} from 'lucide-react'
import { ensureArray } from '../../lib/utils'

interface PestThreat {
  name: string
  type: 'insect' | 'fungal' | 'bacterial' | 'viral' | 'nematode' | 'weed'
  riskScore: number
  riskLevel: 'low' | 'moderate' | 'high' | 'extreme'
  confidence: number
  environmentalFactors: string[]
  cropStageVulnerability: number
  treatments: {
    method: string
    timing: string
    effectiveness: number
    cost: 'low' | 'moderate' | 'high'
    environmentalImpact: 'low' | 'moderate' | 'high'
  }[]
  preventiveMeasures: string[]
  monitoringSchedule?: {
    activity: string
    frequency: string
    criticalPeriod: string
    indicators: string[]
  }[]
}

interface PestPrediction {
  fieldId: string
  cropType: string
  analysisDate: Date
  threats: PestThreat[]
  overallRiskLevel: 'low' | 'moderate' | 'high' | 'extreme'
  weatherRiskFactors: {
    temperature: number
    humidity: number
    precipitation: number
    windSpeed: number
  }
  cropStageRisk: {
    currentStage: string
    stageVulnerability: number
    criticalPeriods: string[]
    recommendedActions: string[]
  }
  regionalThreatLevel: number
}

interface PestDiseaseAlertsProps {
  fieldId?: string
  cropType?: string
  latitude?: number
  longitude?: number
  plantingDate?: Date
  className?: string
}

export default function PestDiseaseAlerts({
  fieldId = 'demo-field-001',
  cropType = 'corn',
  latitude = 41.8781,
  longitude = -87.6298,
  plantingDate = new Date('2024-05-01'),
  className = ''
}: PestDiseaseAlertsProps) {
  const [prediction, setPrediction] = useState<PestPrediction | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedThreat, setSelectedThreat] = useState<PestThreat | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchPestPrediction()
  }, [fieldId, cropType, latitude, longitude, plantingDate])

  const fetchPestPrediction = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/crops/pest-prediction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fieldId,
          cropType,
          latitude,
          longitude,
          plantingDate: plantingDate.toISOString(),
          action: 'predict'
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch pest predictions')
      }

      setPrediction({
        ...data.data,
        analysisDate: new Date(data.data.analysisDate)
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      console.error('Error fetching pest predictions:', err)
    } finally {
      setLoading(false)
    }
  }

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100'
      case 'moderate': return 'text-yellow-600 bg-yellow-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'extreme': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'low': return <CheckCircle className="h-4 w-4" />
      case 'moderate': return <AlertCircle className="h-4 w-4" />
      case 'high': return <AlertTriangle className="h-4 w-4" />
      case 'extreme': return <XCircle className="h-4 w-4" />
      default: return <Info className="h-4 w-4" />
    }
  }

  const getThreatTypeIcon = (type: string) => {
    switch (type) {
      case 'insect': return <Bug className="h-4 w-4" />
      case 'fungal': return <Leaf className="h-4 w-4" />
      case 'bacterial': return <Activity className="h-4 w-4" />
      case 'viral': return <Zap className="h-4 w-4" />
      case 'nematode': return <Target className="h-4 w-4" />
      case 'weed': return <Leaf className="h-4 w-4" />
      default: return <AlertTriangle className="h-4 w-4" />
    }
  }

  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Pest & Disease Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-muted-foreground">Analyzing field conditions...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Error Loading Pest Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Analysis Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={fetchPestPrediction} className="mt-4">
            Retry Analysis
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!prediction) return null

  const highRiskThreats = prediction.threats.filter(t => t.riskLevel === 'high' || t.riskLevel === 'extreme')
  const avgConfidence = prediction.threats.reduce((sum, t) => sum + t.confidence, 0) / prediction.threats.length

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overview Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bug className="h-5 w-5" />
              Pest & Disease Risk Assessment
            </div>
            <Badge className={getRiskLevelColor(prediction.overallRiskLevel)}>
              {getRiskIcon(prediction.overallRiskLevel)}
              {prediction.overallRiskLevel.toUpperCase()} RISK
            </Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {fieldId} • {cropType.charAt(0).toUpperCase() + cropType.slice(1)} • 
            {prediction.analysisDate.toLocaleDateString()}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Target className="h-4 w-4" />
                Threats Identified
              </div>
              <div className="text-2xl font-bold">{prediction.threats.length}</div>
              <div className="text-xs text-muted-foreground">
                {highRiskThreats.length} high risk
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <TrendingUp className="h-4 w-4" />
                Prediction Confidence
              </div>
              <div className="text-2xl font-bold">{formatPercentage(avgConfidence)}</div>
              <Progress value={avgConfidence * 100} className="h-1" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Activity className="h-4 w-4" />
                Current Growth Stage
              </div>
              <div className="text-lg font-semibold">{prediction.cropStageRisk.currentStage}</div>
              <div className="text-xs text-muted-foreground">
                {formatPercentage(prediction.cropStageRisk.stageVulnerability)} vulnerable
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <MapPin className="h-4 w-4" />
                Regional Threat Level
              </div>
              <div className="text-2xl font-bold">{formatPercentage(prediction.regionalThreatLevel)}</div>
              <Progress value={prediction.regionalThreatLevel * 100} className="h-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="threats">Threats</TabsTrigger>
          <TabsTrigger value="environment">Environment</TabsTrigger>
          <TabsTrigger value="recommendations">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* High Priority Alerts */}
          {highRiskThreats.length > 0 && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertTitle className="text-orange-800">High Priority Threats Detected</AlertTitle>
              <AlertDescription className="text-orange-700">
                {highRiskThreats.length} high-risk threat{highRiskThreats.length !== 1 ? 's' : ''} requiring immediate attention: {' '}
                {highRiskThreats.map(t => t.name).join(', ')}
              </AlertDescription>
            </Alert>
          )}

          {/* Threat Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ensureArray(prediction.threats).slice(0, 4).map((threat, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer" 
                    onClick={() => setSelectedThreat(threat)}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      {getThreatTypeIcon(threat.type)}
                      {threat.name}
                    </CardTitle>
                    <Badge className={getRiskLevelColor(threat.riskLevel)}>
                      {threat.riskLevel}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Risk Score</span>
                      <span className="font-medium">{formatPercentage(threat.riskScore)}</span>
                    </div>
                    <Progress value={threat.riskScore * 100} className="h-2" />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Confidence</span>
                      <span className="font-medium">{formatPercentage(threat.confidence)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="threats" className="space-y-4">
          <div className="space-y-3">
            {prediction.threats.map((threat, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {getThreatTypeIcon(threat.type)}
                      {threat.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={getRiskLevelColor(threat.riskLevel)}>
                        {getRiskIcon(threat.riskLevel)}
                        {threat.riskLevel}
                      </Badge>
                      <Badge variant="outline">{threat.type}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm mb-2">Risk Metrics</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Risk Score</span>
                            <span className="font-medium">{formatPercentage(threat.riskScore)}</span>
                          </div>
                          <Progress value={threat.riskScore * 100} className="h-2" />
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Confidence</span>
                            <span className="font-medium">{formatPercentage(threat.confidence)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Stage Vulnerability</span>
                            <span className="font-medium">{formatPercentage(threat.cropStageVulnerability)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm mb-2">Environmental Factors</h4>
                        <div className="flex flex-wrap gap-1">
                          {threat.environmentalFactors.map((factor, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {factor.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm mb-2">Available Treatments</h4>
                        <div className="space-y-2">
                          {threat.treatments.slice(0, 2).map((treatment, i) => (
                            <div key={i} className="p-2 bg-muted rounded-md text-sm">
                              <div className="font-medium">{treatment.method}</div>
                              <div className="text-xs text-muted-foreground">
                                {treatment.timing} • {formatPercentage(treatment.effectiveness)} effective
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm mb-2">Prevention</h4>
                        <div className="space-y-1">
                          {threat.preventiveMeasures.slice(0, 3).map((measure, i) => (
                            <div key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                              <Shield className="h-3 w-3" />
                              {measure}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="environment" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Thermometer className="h-4 w-4" />
                  Weather Risk Factors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm flex items-center gap-2">
                      <Thermometer className="h-3 w-3" />
                      Temperature Risk
                    </span>
                    <span className="font-medium">{formatPercentage(prediction.weatherRiskFactors.temperature)}</span>
                  </div>
                  <Progress value={prediction.weatherRiskFactors.temperature * 100} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm flex items-center gap-2">
                      <Droplets className="h-3 w-3" />
                      Humidity Risk
                    </span>
                    <span className="font-medium">{formatPercentage(prediction.weatherRiskFactors.humidity)}</span>
                  </div>
                  <Progress value={prediction.weatherRiskFactors.humidity * 100} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm flex items-center gap-2">
                      <Droplets className="h-3 w-3" />
                      Precipitation Risk
                    </span>
                    <span className="font-medium">{formatPercentage(prediction.weatherRiskFactors.precipitation)}</span>
                  </div>
                  <Progress value={prediction.weatherRiskFactors.precipitation * 100} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm flex items-center gap-2">
                      <Wind className="h-3 w-3" />
                      Wind Speed Risk
                    </span>
                    <span className="font-medium">{formatPercentage(prediction.weatherRiskFactors.windSpeed)}</span>
                  </div>
                  <Progress value={prediction.weatherRiskFactors.windSpeed * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Crop Stage Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Current Stage</span>
                    <span className="font-medium">{prediction.cropStageRisk.currentStage}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Vulnerability</span>
                    <span className="font-medium">{formatPercentage(prediction.cropStageRisk.stageVulnerability)}</span>
                  </div>
                  <Progress value={prediction.cropStageRisk.stageVulnerability * 100} className="h-2" />
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Critical Periods</h4>
                  <div className="flex flex-wrap gap-1">
                    {prediction.cropStageRisk.criticalPeriods.map((period, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {period}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Stage Actions</h4>
                  <div className="space-y-1">
                    {prediction.cropStageRisk.recommendedActions.slice(0, 3).map((action, i) => (
                      <div key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        {action}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Monitoring Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {prediction.threats
                    .filter(t => t.monitoringSchedule && t.monitoringSchedule.length > 0)
                    .slice(0, 3)
                    .map((threat, threatIndex) => (
                    <div key={threatIndex} className="border-l-2 border-muted pl-3 space-y-2">
                      <div className="font-medium text-sm">{threat.name}</div>
                      {threat.monitoringSchedule!.map((schedule, schedIndex) => (
                        <div key={schedIndex} className="space-y-1">
                          <div className="text-sm">{schedule.activity}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {schedule.frequency}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {schedule.criticalPeriod}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {schedule.indicators.slice(0, 3).map((indicator, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {indicator}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Immediate Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* High priority actions from stage recommendations */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Growth Stage Actions</h4>
                    {prediction.cropStageRisk.recommendedActions.map((action, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>

                  {/* High risk threat actions */}
                  {highRiskThreats.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">High Risk Threat Actions</h4>
                      {highRiskThreats.slice(0, 2).map((threat, i) => (
                        <div key={i} className="border-l-2 border-orange-200 pl-3 space-y-1">
                          <div className="text-sm font-medium text-orange-800">{threat.name}</div>
                          {threat.treatments.slice(0, 1).map((treatment, j) => (
                            <div key={j} className="text-xs text-muted-foreground">
                              {treatment.method} - {treatment.timing}
                            </div>
                          ))}
                          {threat.preventiveMeasures.slice(0, 2).map((measure, j) => (
                            <div key={j} className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Shield className="h-3 w-3" />
                              {measure}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Analysis Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  Based on current field conditions and weather patterns, your {cropType} crop shows{' '}
                  <strong className={prediction.overallRiskLevel === 'high' || prediction.overallRiskLevel === 'extreme' ? 'text-orange-600' : 'text-green-600'}>
                    {prediction.overallRiskLevel} risk
                  </strong>{' '}
                  for pest and disease outbreaks.
                </p>
                <p>
                  Key concerns include {prediction.threats.slice(0, 3).map(t => t.name.toLowerCase()).join(', ')}.
                  Regular monitoring and preventive measures are recommended to maintain crop health.
                </p>
                <p className="text-xs">
                  Analysis confidence: {formatPercentage(avgConfidence)} • 
                  Last updated: {prediction.analysisDate.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}