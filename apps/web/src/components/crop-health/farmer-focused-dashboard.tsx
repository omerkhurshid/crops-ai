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
      // Fetch real farm data
      const response = await fetch(`/api/crop-health/disease-pest-analysis?farmId=${farmId}`)
      if (response.ok) {
        const data = await response.json()
        // Transform real API data into farmer-friendly format
        const transformedFields = data.fieldAnalysis?.map((field: any) => ({
          fieldId: field.fieldId,
          fieldName: field.fieldName || `Field ${field.fieldId}`,
          cropType: field.cropType || 'Mixed Crops',
          healthScore: Math.round(field.healthScore || 75),
          stressLevel: field.healthScore > 80 ? 'healthy' : field.healthScore > 60 ? 'watch' : 'action_needed',
          lastUpdate: new Date().toISOString(),
          area: field.area || 25,
          mainIssues: field.risks?.filter((r: any) => r.level === 'high').map((r: any) => r.description) || [],
          simpleRecommendations: field.recommendations?.slice(0, 3) || ['Monitor field conditions regularly'],
          yieldOutlook: field.healthScore > 85 ? 'excellent' : field.healthScore > 70 ? 'good' : field.healthScore > 50 ? 'concerning' : 'poor',
          yieldChange: Math.round((field.healthScore - 75) / 2), // Convert health to yield change estimate
          nextAction: {
            task: field.recommendations?.[0] || 'Regular monitoring',
            priority: field.healthScore < 60 ? 'high' : field.healthScore < 80 ? 'medium' : 'low',
            daysUntil: field.healthScore < 60 ? 1 : field.healthScore < 80 ? 3 : 7
          }
        })) || []
        setFields(transformedFields.length > 0 ? transformedFields : getEmptyStateData())
      } else {
        // Fallback to empty state if API fails
        setFields(getEmptyStateData())
      }
    } catch (error) {
      console.error('Failed to fetch health data:', error)
      setFields(getEmptyStateData())
    } finally {
      setLoading(false)
    }
  }
  const getEmptyStateData = (): SimpleFieldHealth[] => {
    // Return empty array when no real data is available
    // This will trigger the appropriate empty state UI
    return []
  }
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