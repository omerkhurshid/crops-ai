'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import { 
  Leaf, AlertTriangle, TrendingUp, TrendingDown, Activity, 
  Droplets, Bug, Zap, Target, RefreshCw, Eye, BarChart3,
  CheckCircle2, XCircle, MinusCircle, MapPin, Calendar, Sprout
} from 'lucide-react'
import { InfoTooltip } from '../ui/info-tooltip'
import { LoadingCard } from '../ui/loading'
import { ErrorBoundary } from '../ui/error-boundary'

interface FarmerFocusedDashboardProps {
  farmId: string
}

interface SimpleFieldHealth {
  fieldId: string
  fieldName: string
  cropType: string
  healthScore: number
  stressLevel: 'healthy' | 'watch' | 'action_needed'
  lastUpdate: string
  area: number
  mainIssues: string[]
  simpleRecommendations: string[]
  yieldOutlook: 'excellent' | 'good' | 'concerning' | 'poor'
  yieldChange: number // percentage change from expected
  nextAction: {
    task: string
    priority: 'low' | 'medium' | 'high'
    daysUntil: number
  }
}

const healthColors = {
  healthy: 'bg-green-100 text-green-800 border-green-200',
  watch: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  action_needed: 'bg-red-100 text-red-800 border-red-200'
}

const yieldColors = {
  excellent: 'text-green-600',
  good: 'text-blue-600',
  concerning: 'text-orange-600',
  poor: 'text-red-600'
}

export function FarmerFocusedDashboard({ farmId }: FarmerFocusedDashboardProps) {
  const [fields, setFields] = useState<SimpleFieldHealth[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedField, setSelectedField] = useState<string | null>(null)

  useEffect(() => {
    fetchSimpleHealthData()
  }, [farmId])

  const fetchSimpleHealthData = async () => {
    setLoading(true)
    try {
      // In a real app, this would call a simplified API endpoint
      // For now, we'll transform complex data into farmer-friendly format
      setFields(getMockSimpleData())
    } catch (error) {
      console.error('Failed to fetch health data:', error)
      setFields(getMockSimpleData())
    } finally {
      setLoading(false)
    }
  }

  const getMockSimpleData = (): SimpleFieldHealth[] => [
    {
      fieldId: 'field-1',
      fieldName: 'North Field',
      cropType: 'Corn',
      healthScore: 85,
      stressLevel: 'watch',
      lastUpdate: new Date().toISOString(),
      area: 45.2,
      mainIssues: ['Dry spots in southwest corner', 'Minor nitrogen deficiency'],
      simpleRecommendations: [
        'Check irrigation in southwest area this week',
        'Plan nitrogen application for next month',
        'Continue regular field walks'
      ],
      yieldOutlook: 'good',
      yieldChange: +12, // 12% above expected
      nextAction: {
        task: 'Check irrigation system',
        priority: 'medium',
        daysUntil: 3
      }
    },
    {
      fieldId: 'field-2',
      fieldName: 'South Field',
      cropType: 'Soybeans',
      healthScore: 92,
      stressLevel: 'healthy',
      lastUpdate: new Date().toISOString(),
      area: 32.7,
      mainIssues: [],
      simpleRecommendations: [
        'Field is performing excellently',
        'Monitor for aphids weekly',
        'Start planning harvest timeline'
      ],
      yieldOutlook: 'excellent',
      yieldChange: +8,
      nextAction: {
        task: 'Scout for aphids',
        priority: 'low',
        daysUntil: 7
      }
    },
    {
      fieldId: 'field-3',
      fieldName: 'East Field',
      cropType: 'Wheat',
      healthScore: 68,
      stressLevel: 'action_needed',
      lastUpdate: new Date().toISOString(),
      area: 28.5,
      mainIssues: ['Fungal disease pressure', 'Uneven emergence'],
      simpleRecommendations: [
        'Apply fungicide treatment immediately',
        'Investigate drainage issues',
        'Consider replanting affected areas'
      ],
      yieldOutlook: 'concerning',
      yieldChange: -15,
      nextAction: {
        task: 'Apply fungicide',
        priority: 'high',
        daysUntil: 1
      }
    }
  ]

  const getHealthIcon = (stressLevel: string) => {
    switch (stressLevel) {
      case 'healthy': return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case 'watch': return <Eye className="h-5 w-5 text-yellow-600" />
      case 'action_needed': return <AlertTriangle className="h-5 w-5 text-red-600" />
      default: return <MinusCircle className="h-5 w-5 text-gray-400" />
    }
  }

  const getYieldIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <Activity className="h-4 w-4 text-gray-600" />
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const selectedFieldData = fields.find(f => f.fieldId === selectedField) || fields[0]
  const totalArea = fields.reduce((sum, f) => sum + f.area, 0)
  const avgHealth = fields.reduce((sum, f) => sum + f.healthScore, 0) / fields.length
  const fieldsNeedingAction = fields.filter(f => f.stressLevel === 'action_needed').length
  const urgentTasks = fields.filter(f => f.nextAction.priority === 'high').length

  if (loading) {
    return (
      <LoadingCard 
        title="Checking Your Crops" 
        message="Getting the latest information on your field conditions..." 
        type="health" 
      />
    )
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Farm Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-2">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <Sprout className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{Math.round(avgHealth)}%</div>
                  <div className="text-sm text-gray-600">Overall Health</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{fields.length}</div>
                  <div className="text-sm text-gray-600">Fields Monitored</div>
                  <div className="text-xs text-gray-500">{totalArea.toFixed(1)} ha total</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">{fieldsNeedingAction}</div>
                  <div className="text-sm text-gray-600">Need Attention</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-full">
                  <Calendar className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">{urgentTasks}</div>
                  <div className="text-sm text-gray-600">Urgent Tasks</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Field Overview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {fields.map((field) => (
            <Card 
              key={field.fieldId} 
              className={`border-2 cursor-pointer transition-all hover:shadow-md ${
                selectedField === field.fieldId || (selectedField === null && field === fields[0])
                  ? 'ring-2 ring-sage-500 border-sage-300' 
                  : 'hover:border-gray-300'
              }`}
              onClick={() => setSelectedField(field.fieldId)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{field.fieldName}</CardTitle>
                    <CardDescription>{field.cropType} • {field.area.toFixed(1)} ha</CardDescription>
                  </div>
                  {getHealthIcon(field.stressLevel)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Health Score */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Health Score</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">{field.healthScore}%</span>
                      <Badge className={healthColors[field.stressLevel]}>
                        {field.stressLevel.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>

                  {/* Yield Outlook */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Yield Outlook</span>
                    <div className="flex items-center gap-1">
                      {getYieldIcon(field.yieldChange)}
                      <span className={`font-medium ${yieldColors[field.yieldOutlook]}`}>
                        {field.yieldOutlook}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({field.yieldChange > 0 ? '+' : ''}{field.yieldChange}%)
                      </span>
                    </div>
                  </div>

                  {/* Next Action */}
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Next Action</span>
                      <Badge className={getPriorityColor(field.nextAction.priority)}>
                        {field.nextAction.daysUntil} days
                      </Badge>
                    </div>
                    <p className="text-sm mt-1">{field.nextAction.task}</p>
                  </div>

                  {/* Issues Count */}
                  {field.mainIssues.length > 0 && (
                    <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                      {field.mainIssues.length} issue{field.mainIssues.length > 1 ? 's' : ''} detected
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed Field View */}
        {selectedFieldData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Issues */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Current Issues - {selectedFieldData.fieldName}
                </CardTitle>
                <CardDescription>
                  Issues that need your attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedFieldData.mainIssues.length > 0 ? (
                  <div className="space-y-3">
                    {selectedFieldData.mainIssues.map((issue, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                        <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        <span className="text-sm">{issue}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-green-700">No issues detected!</p>
                    <p className="text-xs text-gray-600">This field is performing well.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Plan */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Action Plan - {selectedFieldData.fieldName}
                </CardTitle>
                <CardDescription>
                  Recommended steps to maintain or improve field health
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedFieldData.simpleRecommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5" />
                      <span className="text-sm">{rec}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">Priority Task</span>
                  </div>
                  <p className="text-sm text-green-700">
                    {selectedFieldData.nextAction.task} - 
                    <span className="font-medium"> Due in {selectedFieldData.nextAction.daysUntil} days</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common tasks for field management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <Droplets className="h-6 w-6 text-blue-600" />
                <span className="text-sm">Schedule Irrigation</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <Bug className="h-6 w-6 text-red-600" />
                <span className="text-sm">Report Pest Issue</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <Leaf className="h-6 w-6 text-green-600" />
                <span className="text-sm">Log Field Notes</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <BarChart3 className="h-6 w-6 text-purple-600" />
                <span className="text-sm">View Detailed Analytics</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  )
}