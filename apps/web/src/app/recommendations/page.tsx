'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '../../components/navigation/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'

interface Recommendation {
  id: string
  type: string
  priority: 'high' | 'medium' | 'low'
  confidence: number
  title: string
  description: string
  category: string
  estimatedImpact: {
    yield?: number
    cost?: number
    sustainability?: number
  }
  timeline: string
  actionRequired: string
  deadline?: string
}

interface RecommendationFilters {
  farmId: string
  categories: string[]
  priority: string
  timeHorizon: number
}

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<RecommendationFilters>({
    farmId: 'demo-farm-1', // In real app, this would come from user's farms
    categories: ['planting', 'irrigation', 'fertilization', 'pest_control'],
    priority: 'yield_maximization',
    timeHorizon: 90
  })

  const fetchRecommendations = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ml/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(filters)
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          // Transform the API response to match our UI structure
          const transformedRecommendations = data.data.recommendations?.map((rec: any, index: number) => ({
            id: rec.id || `rec-${index}`,
            type: rec.type || 'general',
            priority: rec.priority || 'medium',
            confidence: rec.confidence || 0.8,
            title: rec.title || rec.action,
            description: rec.description || rec.reasoning,
            category: rec.category,
            estimatedImpact: rec.expectedImpact || rec.impact || {},
            timeline: rec.timeline || 'Next 30 days',
            actionRequired: rec.action || 'Review recommendation',
            deadline: rec.deadline
          })) || []
          
          setRecommendations(transformedRecommendations)
        }
      } else {
        // Fallback to demo data if API fails
        setRecommendations(getDemoRecommendations())
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error)
      // Show demo recommendations as fallback
      setRecommendations(getDemoRecommendations())
    } finally {
      setLoading(false)
    }
  }

  const getDemoRecommendations = (): Recommendation[] => [
    {
      id: 'rec-1',
      type: 'irrigation',
      priority: 'high',
      confidence: 0.92,
      title: 'Optimize Irrigation Schedule',
      description: 'Based on weather forecast and soil moisture data, adjust irrigation timing to improve water efficiency by 15%.',
      category: 'irrigation',
      estimatedImpact: {
        yield: 8,
        cost: -12,
        sustainability: 15
      },
      timeline: 'Next 7 days',
      actionRequired: 'Update irrigation system scheduling',
      deadline: '2024-01-15'
    },
    {
      id: 'rec-2',
      type: 'fertilization',
      priority: 'medium',
      confidence: 0.87,
      title: 'Apply Nitrogen Fertilizer',
      description: 'Corn fields showing nitrogen deficiency based on satellite NDVI analysis. Apply 40kg/ha nitrogen fertilizer.',
      category: 'fertilization',
      estimatedImpact: {
        yield: 12,
        cost: 5,
        sustainability: -2
      },
      timeline: 'Next 14 days',
      actionRequired: 'Schedule fertilizer application',
      deadline: '2024-01-20'
    },
    {
      id: 'rec-3',
      type: 'pest_control',
      priority: 'high',
      confidence: 0.89,
      title: 'Monitor for Aphid Infestation',
      description: 'Weather conditions favor aphid development. Implement preventive scouting and be ready for treatment.',
      category: 'pest_control',
      estimatedImpact: {
        yield: 18,
        cost: 3,
        sustainability: 0
      },
      timeline: 'Immediate',
      actionRequired: 'Begin field scouting',
      deadline: '2024-01-12'
    },
    {
      id: 'rec-4',
      type: 'planting',
      priority: 'low',
      confidence: 0.78,
      title: 'Plan Spring Crop Rotation',
      description: 'Consider rotating to soybeans in Field 3 to improve soil health and break pest cycles.',
      category: 'planting',
      estimatedImpact: {
        yield: 6,
        cost: -8,
        sustainability: 20
      },
      timeline: 'Next 60 days',
      actionRequired: 'Review and plan crop rotation',
      deadline: '2024-03-01'
    }
  ]

  useEffect(() => {
    fetchRecommendations()
  }, [])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getImpactIcon = (value: number) => {
    if (value > 0) return { icon: '↗', color: 'text-green-600' }
    if (value < 0) return { icon: '↘', color: 'text-red-600' }
    return { icon: '→', color: 'text-gray-600' }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">AI-Powered Insights</h1>
            <p className="text-gray-600">
              Intelligent recommendations powered by machine learning, satellite data, and weather analytics
            </p>
          </div>

          <Tabs defaultValue="recommendations" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="recommendations">Current Recommendations</TabsTrigger>
              <TabsTrigger value="settings">Preferences</TabsTrigger>
              <TabsTrigger value="history">History & Feedback</TabsTrigger>
            </TabsList>

            <TabsContent value="recommendations">
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Active Recommendations</p>
                          <p className="text-2xl font-bold text-gray-900">{recommendations.length}</p>
                        </div>
                        <div className="p-2 bg-blue-100 rounded-full">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">High Priority</p>
                          <p className="text-2xl font-bold text-red-600">
                            {recommendations.filter(r => r.priority === 'high').length}
                          </p>
                        </div>
                        <div className="p-2 bg-red-100 rounded-full">
                          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Avg. Confidence</p>
                          <p className="text-2xl font-bold text-green-600">
                            {Math.round((recommendations.reduce((acc, r) => acc + r.confidence, 0) / recommendations.length) * 100) || 0}%
                          </p>
                        </div>
                        <div className="p-2 bg-green-100 rounded-full">
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Button 
                            onClick={fetchRecommendations}
                            disabled={loading}
                            size="sm"
                            className="w-full"
                          >
                            {loading ? 'Updating...' : 'Refresh Insights'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recommendations List */}
                <div className="space-y-4">
                  {recommendations.map((rec) => (
                    <Card key={rec.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <CardTitle className="text-lg">{rec.title}</CardTitle>
                              <Badge className={getPriorityColor(rec.priority)}>
                                {rec.priority.toUpperCase()}
                              </Badge>
                              <Badge variant="outline">
                                {Math.round(rec.confidence * 100)}% confidence
                              </Badge>
                            </div>
                            <CardDescription className="text-sm">
                              Category: {rec.category.replace('_', ' ')} • Timeline: {rec.timeline}
                              {rec.deadline && ` • Deadline: ${rec.deadline}`}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 mb-4">{rec.description}</p>
                        
                        {/* Impact Metrics */}
                        {rec.estimatedImpact && (
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            {rec.estimatedImpact.yield && (
                              <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-center gap-1">
                                  <span className={`text-lg font-semibold ${getImpactIcon(rec.estimatedImpact.yield).color}`}>
                                    {getImpactIcon(rec.estimatedImpact.yield).icon}
                                  </span>
                                  <span className="font-semibold">{Math.abs(rec.estimatedImpact.yield)}%</span>
                                </div>
                                <p className="text-sm text-gray-600">Yield Impact</p>
                              </div>
                            )}
                            {rec.estimatedImpact.cost && (
                              <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-center gap-1">
                                  <span className={`text-lg font-semibold ${getImpactIcon(rec.estimatedImpact.cost).color}`}>
                                    {getImpactIcon(rec.estimatedImpact.cost).icon}
                                  </span>
                                  <span className="font-semibold">{Math.abs(rec.estimatedImpact.cost)}%</span>
                                </div>
                                <p className="text-sm text-gray-600">Cost Impact</p>
                              </div>
                            )}
                            {rec.estimatedImpact.sustainability && (
                              <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-center gap-1">
                                  <span className={`text-lg font-semibold ${getImpactIcon(rec.estimatedImpact.sustainability).color}`}>
                                    {getImpactIcon(rec.estimatedImpact.sustainability).icon}
                                  </span>
                                  <span className="font-semibold">{Math.abs(rec.estimatedImpact.sustainability)}%</span>
                                </div>
                                <p className="text-sm text-gray-600">Sustainability</p>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            <strong>Action Required:</strong> {rec.actionRequired}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              More Details
                            </Button>
                            <Button size="sm" className="bg-crops-green-600 hover:bg-crops-green-700">
                              Implement
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {recommendations.length === 0 && !loading && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <div className="text-gray-500 mb-4">
                        <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Recommendations Available</h3>
                      <p className="text-gray-500 mb-4">
                        Add some farms and fields to start receiving AI-powered insights.
                      </p>
                      <Button onClick={fetchRecommendations}>
                        Generate Recommendations
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Recommendation Preferences</CardTitle>
                  <CardDescription>
                    Customize how AI recommendations are generated for your operations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Optimization Priority</label>
                      <select 
                        value={filters.priority}
                        onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-crops-green-500"
                      >
                        <option value="yield_maximization">Maximize Yield</option>
                        <option value="cost_optimization">Minimize Costs</option>
                        <option value="sustainability">Optimize Sustainability</option>
                        <option value="risk_minimization">Minimize Risk</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Time Horizon (days)</label>
                      <input
                        type="number"
                        min="7"
                        max="365"
                        value={filters.timeHorizon}
                        onChange={(e) => setFilters(prev => ({ ...prev, timeHorizon: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-crops-green-500"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Recommendation Categories</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {['planting', 'irrigation', 'fertilization', 'pest_control', 'harvest_timing', 'soil_management'].map(category => (
                          <label key={category} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={filters.categories.includes(category)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFilters(prev => ({ ...prev, categories: [...prev.categories, category] }))
                                } else {
                                  setFilters(prev => ({ ...prev, categories: prev.categories.filter(c => c !== category) }))
                                }
                              }}
                              className="mr-2"
                            />
                            <span className="text-sm">{category.replace('_', ' ')}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button onClick={fetchRecommendations} className="w-full md:w-auto">
                        Update Recommendations
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Recommendation History</CardTitle>
                  <CardDescription>
                    Track your past recommendations and their effectiveness
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="text-gray-500 mb-4">
                      <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <p className="text-gray-500">
                      Recommendation history will appear here as you implement and provide feedback on suggestions.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}