'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import { 
  Brain, TrendingUp, Droplets, Sprout, Bug, Calendar,
  DollarSign, AlertTriangle, CheckCircle2, Clock,
  RefreshCw, ChevronRight, Target, Lightbulb
} from 'lucide-react'
import { LoadingState, LoadingCard, LoadingButton, AsyncWrapper } from '../ui/loading'
import { ErrorBoundary } from '../ui/error-boundary'

interface RecommendationsProps {
  farmId: string
  fieldId?: string
}

interface Recommendation {
  id: string
  title: string
  category: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  description: string
  reasoning: string
  timeline: string
  confidence: number
  impact: {
    yield: number
    cost: number
    sustainability: number
  }
  actions: Array<{
    title: string
    description: string
    timeframe: string
    cost: number
  }>
}

const categoryIcons = {
  'planting': Sprout,
  'irrigation': Droplets,
  'fertilization': TrendingUp,
  'pest_control': Bug,
  'harvest_timing': Calendar,
  'soil_management': Target,
  'equipment': CheckCircle2,
  'marketing': DollarSign
}

const priorityColors = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-blue-100 text-blue-800 border-blue-200'
}

export function RecommendationsDashboard({ farmId, fieldId }: RecommendationsProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'planting', 'irrigation', 'fertilization', 'pest_control', 'harvest_timing'
  ])
  const [priority, setPriority] = useState<'cost_optimization' | 'yield_maximization' | 'sustainability' | 'risk_minimization'>('yield_maximization')

  useEffect(() => {
    fetchRecommendations()
  }, [farmId, fieldId])

  const fetchRecommendations = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ml/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmId,
          fieldId,
          categories: selectedCategories,
          priority,
          timeHorizon: 90
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch recommendations')
      }

      const data = await response.json()
      setRecommendations(data.data.recommendations || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getImpactColor = (value: number) => {
    if (value >= 15) return 'text-green-600'
    if (value >= 5) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Generating AI recommendations...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-2">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-3" />
            <p className="text-red-600 font-medium">Error loading recommendations</p>
            <p className="text-sm text-gray-500 mt-1">{error}</p>
            <Button onClick={fetchRecommendations} className="mt-4" size="sm" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <ErrorBoundary>
      <AsyncWrapper 
        loading={loading} 
        error={error}
        onRetry={fetchRecommendations}
        loadingComponent={<LoadingCard title="Generating AI Recommendations" message="Our AI is analyzing your farm data to provide personalized recommendations..." type="ai" />}
      >
        <div className="space-y-6">
      {/* Settings */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="h-5 w-5 mr-2" />
            AI Recommendation Settings
          </CardTitle>
          <CardDescription>
            Customize recommendations based on your priorities and focus areas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Priority Focus</label>
              <select 
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full p-2 border-2 border-input rounded-md"
              >
                <option value="yield_maximization">Maximize Yield</option>
                <option value="cost_optimization">Minimize Costs</option>
                <option value="sustainability">Sustainability Focus</option>
                <option value="risk_minimization">Minimize Risk</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Focus Categories</label>
              <div className="flex flex-wrap gap-2">
                {Object.keys(categoryIcons).map((category) => {
                  const Icon = categoryIcons[category as keyof typeof categoryIcons]
                  const isSelected = selectedCategories.includes(category)
                  return (
                    <button
                      key={category}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedCategories(prev => prev.filter(c => c !== category))
                        } else {
                          setSelectedCategories(prev => [...prev, category])
                        }
                      }}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full border-2 text-sm font-medium transition-colors ${
                        isSelected 
                          ? 'bg-green-100 text-green-800 border-green-200' 
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-3 w-3" />
                      {category.replace('_', ' ')}
                    </button>
                  )
                })}
              </div>
            </div>

            <Button onClick={fetchRecommendations} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Generate New Recommendations
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">AI Recommendations ({recommendations.length})</h3>
          <div className="flex gap-2">
            <Badge variant="outline">
              {recommendations.filter(r => r.priority === 'critical' || r.priority === 'high').length} High Priority
            </Badge>
          </div>
        </div>

        {recommendations.length === 0 ? (
          <Card className="border-2">
            <CardContent className="flex items-center justify-center h-32">
              <div className="text-center">
                <Lightbulb className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No recommendations available</p>
                <p className="text-sm text-gray-500 mt-1">Try adjusting your settings and regenerate</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          (recommendations || []).map((recommendation) => {
            const Icon = categoryIcons[recommendation.category as keyof typeof categoryIcons] || Target
            return (
              <Card key={recommendation.id} className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <Icon className="h-6 w-6 text-green-600 mt-1" />
                      <div>
                        <CardTitle className="text-lg">{recommendation.title}</CardTitle>
                        <CardDescription>{recommendation.description}</CardDescription>
                      </div>
                    </div>
                    <Badge className={`${priorityColors[recommendation.priority]} border-2`}>
                      {recommendation.priority}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Impact Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">Expected Yield Impact</div>
                        <div className={`text-lg font-semibold ${getImpactColor(recommendation.impact.yield)}`}>
                          +{recommendation.impact.yield.toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Cost Impact</div>
                        <div className={`text-lg font-semibold ${recommendation.impact.cost > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          ${Math.abs(recommendation.impact.cost).toFixed(0)}
                          {recommendation.impact.cost > 0 ? ' cost' : ' savings'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Confidence</div>
                        <div className="flex items-center gap-2">
                          <Progress value={recommendation.confidence} className="flex-1" />
                          <span className="text-sm font-medium">{recommendation.confidence}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Reasoning */}
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="text-sm font-medium text-blue-900 mb-1">AI Reasoning</div>
                      <p className="text-sm text-blue-700">{recommendation.reasoning}</p>
                    </div>

                    {/* Timeline */}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Timeline: {recommendation.timeline}</span>
                    </div>

                    {/* Actions */}
                    {recommendation.actions && recommendation.actions.length > 0 && (
                      <div>
                        <div className="text-sm font-medium mb-2">Recommended Actions</div>
                        <div className="space-y-2">
                          {(recommendation.actions || []).slice(0, 2).map((action, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                              <div>
                                <div className="text-sm font-medium">{action.title}</div>
                                <div className="text-xs text-gray-600">{action.description}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium">${action.cost}</div>
                                <div className="text-xs text-gray-500">{action.timeframe}</div>
                              </div>
                            </div>
                          ))}
                          {recommendation.actions.length > 2 && (
                            <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                              View {recommendation.actions.length - 2} more actions
                              <ChevronRight className="h-3 w-3 ml-1" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" className="flex-1">
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Implement
                      </Button>
                      <Button size="sm" variant="outline">
                        Learn More
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
        </div>
      </AsyncWrapper>
    </ErrorBoundary>
  )
}