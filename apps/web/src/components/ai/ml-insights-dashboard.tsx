'use client'
import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { 
  Brain, TrendingUp, Target, Zap, ChartBar, AlertTriangle,
  Sprout, CloudRain, Bug, DollarSign, Activity, Lightbulb,
  RefreshCw, ChevronRight, Clock, CheckCircle2
} from 'lucide-react'
import { modelRegistry } from '../../lib/ml/model-registry'
import { LoadingState, LoadingCard } from '../ui/loading'
interface MLInsightsProps {
  farmId: string
  selectedAgriculture?: Array<{
    id: string
    name: string
    type: 'crop' | 'livestock'
    category: string
    monitoringParameters: string[]
  }>
  farmLocation?: {
    latitude: number
    longitude: number
  }
}
interface ModelInsight {
  modelId: string
  modelName: string
  category: string
  prediction: any
  confidence: number
  relevantTo: string[]
  actionableInsights: string[]
  dataFreshness: 'real-time' | 'hourly' | 'daily' | 'weekly'
  lastUpdated: Date
}
interface SmartRecommendation {
  id: string
  title: string
  description: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  basedOnModels: string[]
  expectedImpact: {
    yield?: number
    cost?: number
    risk?: number
  }
  actionSteps: string[]
  timeframe: string
}
export function MLInsightsDashboard({ farmId, selectedAgriculture = [], farmLocation }: MLInsightsProps) {
  const [loading, setLoading] = useState(true)
  const [modelInsights, setModelInsights] = useState<ModelInsight[]>([])
  const [smartRecommendations, setSmartRecommendations] = useState<SmartRecommendation[]>([])
  const [activeTab, setActiveTab] = useState('insights')
  // Get relevant models based on selected agriculture
  const relevantModels = useMemo(() => {
    const availableData = [
      'temperature', 'precipitation', 'ndvi', 'soil_moisture',
      ...selectedAgriculture.flatMap(item => item.monitoringParameters.map(p => p.toLowerCase().replace(/\s+/g, '_')))
    ]
    return modelRegistry.recommendModels({
      cropType: selectedAgriculture.find(item => item.type === 'crop')?.name,
      dataAvailable: availableData,
      objective: 'yield'
    })
  }, [selectedAgriculture])
  useEffect(() => {
    generateInsights()
  }, [farmId, selectedAgriculture, farmLocation])
  const generateInsights = async () => {
    setLoading(true)
    try {
      // Simulate ML model execution with realistic data
      await new Promise(resolve => setTimeout(resolve, 2000))
      const insights = await generateModelInsights()
      const recommendations = await generateSmartRecommendations(insights)
      setModelInsights(insights)
      setSmartRecommendations(recommendations)
    } catch (error) {
      console.error('Error generating insights:', error)
    } finally {
      setLoading(false)
    }
  }
  const generateModelInsights = async (): Promise<ModelInsight[]> => {
    const insights: ModelInsight[] = []
    for (const model of relevantModels.slice(0, 4)) { // Limit to 4 most relevant models
      let prediction: any = {}
      let actionableInsights: string[] = []
      switch (model.category) {
        case 'yield_prediction':
          if (selectedAgriculture.some(item => item.name.toLowerCase().includes('corn'))) {
            prediction = {
              expectedYield: 165.5,
              yieldRange: { min: 152.3, max: 178.7 },
              comparedToAverage: '+12.3%',
              factors: ['Favorable weather', 'Good soil conditions', 'Optimal planting date']
            }
            actionableInsights = [
              'Current trajectory suggests above-average yield',
              'Maintain current irrigation schedule',
              'Monitor for late-season pest pressure'
            ]
          } else if (selectedAgriculture.some(item => item.name.toLowerCase().includes('soy'))) {
            prediction = {
              expectedYield: 48.2,
              yieldRange: { min: 44.1, max: 52.3 },
              comparedToAverage: '+8.7%',
              factors: ['Good nodulation', 'Adequate moisture', 'Disease-free']
            }
            actionableInsights = [
              'Excellent pod fill conditions expected',
              'Continue current management practices',
              'Consider early harvest for quality premium'
            ]
          }
          break
        case 'crop_health':
          prediction = {
            overallHealth: 87,
            stressIndicators: {
              water: 'normal',
              nutrient: 'slight_deficiency',
              disease: 'none_detected'
            },
            affectedAreas: '3.2%',
            trendDirection: 'improving'
          }
          actionableInsights = [
            'Crop health is above average for this time of year',
            'Minor nitrogen deficiency detected in Field 3',
            'Weather conditions favor continued healthy growth'
          ]
          break
        case 'weather':
          prediction = {
            sevenDayForecast: {
              temperature: { min: 68, max: 84, trend: 'stable' },
              precipitation: { total: 0.8, probability: 65, pattern: 'scattered' },
              conditions: 'Favorable for crop development'
            },
            alerts: [
              { type: 'beneficial_rain', timing: '3-4 days', confidence: 75 }
            ]
          }
          actionableInsights = [
            'Beneficial rain expected mid-week',
            'Temperature optimal for crop development',
            'Good window for field operations early week'
          ]
          break
        case 'pest_disease':
          prediction = {
            riskLevel: 'moderate',
            primaryThreats: [
              { pest: 'corn_rootworm', probability: 25, timing: '2-3 weeks' },
              { disease: 'gray_leaf_spot', probability: 15, timing: '4-6 weeks' }
            ],
            preventiveActions: ['Scout weekly', 'Monitor humidity', 'Check trap counts']
          }
          actionableInsights = [
            'Pest pressure below normal for this date',
            'Begin weekly scouting program',
            'Weather favors beneficial insects'
          ]
          break
        case 'market':
          prediction = {
            priceOutlook: {
              current: 4.85,
              thirtyDay: 4.92,
              trend: 'bullish',
              volatility: 'moderate'
            },
            marketingWindow: 'September 15-30',
            factors: ['Export demand strong', 'Weather premiums possible']
          }
          actionableInsights = [
            'Prices trending higher into harvest',
            'Consider forward contracting 30% of crop',
            'Watch for weather premium opportunities'
          ]
          break
      }
      insights.push({
        modelId: model.id,
        modelName: model.name,
        category: model.category,
        prediction,
        confidence: model.performance.confidence || model.performance.accuracy || 0.85,
        relevantTo: selectedAgriculture.map(item => item.name),
        actionableInsights,
        dataFreshness: 'daily',
        lastUpdated: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000) // Random within last 24h
      })
    }
    return insights
  }
  const generateSmartRecommendations = async (insights: ModelInsight[]): Promise<SmartRecommendation[]> => {
    return [
      {
        id: '1',
        title: 'Optimize Nitrogen Timing',
        description: 'ML models suggest optimal nitrogen application window opening in 3-5 days based on weather predictions and crop development stage.',
        priority: 'high',
        basedOnModels: ['weather', 'crop_health', 'yield_prediction'],
        expectedImpact: { yield: 8.5, cost: -120 },
        actionSteps: [
          'Soil test current nitrogen levels',
          'Check weather forecast for application window',
          'Apply side-dress nitrogen at 75 lbs/acre'
        ],
        timeframe: '3-5 days'
      },
      {
        id: '2',
        title: 'Enhanced Pest Monitoring',
        description: 'Pest prediction models indicate increasing risk. Implementing enhanced monitoring now can prevent significant crop loss.',
        priority: 'medium',
        basedOnModels: ['pest_disease', 'weather'],
        expectedImpact: { yield: 12.0, cost: -850 },
        actionSteps: [
          'Install additional pheromone traps',
          'Increase scouting frequency to twice weekly',
          'Monitor beneficial insect populations'
        ],
        timeframe: 'This week'
      },
      {
        id: '3',
        title: 'Market Timing Strategy',
        description: 'Price forecasting models suggest favorable marketing window approaching. Consider pre-positioning for harvest sales.',
        priority: 'medium',
        basedOnModels: ['market', 'yield_prediction'],
        expectedImpact: { cost: 2400 },
        actionSteps: [
          'Review current forward contract positions',
          'Consider pricing 25-30% of expected production',
          'Monitor export demand indicators'
        ],
        timeframe: '1-2 weeks'
      }
    ]
  }
  const getModelIcon = (category: string) => {
    const icons = {
      'yield_prediction': TrendingUp,
      'crop_health': Sprout,
      'weather': CloudRain,
      'pest_disease': Bug,
      'market': DollarSign,
      'soil': Target
    }
    return icons[category as keyof typeof icons] || Brain
  }
  const getPriorityColor = (priority: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-blue-100 text-blue-800 border-blue-200'
    }
    return colors[priority as keyof typeof colors] || colors.medium
  }
  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingCard />
        <LoadingCard />
        <LoadingCard />
      </div>
    )
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">AI Insights</h2>
          <p className="text-[#555555]">
            Powered by {relevantModels.length} ML models analyzing your farm data
          </p>
        </div>
        <Button variant="outline" onClick={generateInsights} disabled={loading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Insights
        </Button>
      </div>
      {/* Model Coverage Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Active ML Models
          </CardTitle>
          <CardDescription>
            {relevantModels.length} models running based on your crops and available data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relevantModels.map(model => {
              const Icon = getModelIcon(model.category)
              return (
                <div key={model.id} className="flex items-center gap-3 p-3 bg-[#FAFAF7] rounded-lg">
                  <Icon className="h-5 w-5 text-[#555555]" />
                  <div>
                    <p className="font-medium text-sm">{model.name}</p>
                    <p className="text-xs text-[#555555]">
                      {Math.round((model.performance.confidence || 0.85) * 100)}% accuracy
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="insights">Model Insights</TabsTrigger>
          <TabsTrigger value="recommendations">Smart Recommendations</TabsTrigger>
        </TabsList>
        <TabsContent value="insights" className="space-y-4">
          {modelInsights.map(insight => {
            const Icon = getModelIcon(insight.category)
            return (
              <Card key={insight.modelId}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      {insight.modelName}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {Math.round(insight.confidence * 100)}% confident
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {insight.dataFreshness}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Prediction Data */}
                  <div className="p-4 bg-[#FAFAF7] rounded-lg">
                    <h4 className="font-medium mb-2">Current Analysis</h4>
                    <pre className="text-sm text-[#555555] whitespace-pre-wrap">
                      {JSON.stringify(insight.prediction, null, 2)}
                    </pre>
                  </div>
                  {/* Actionable Insights */}
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-600" />
                      Key Insights
                    </h4>
                    <ul className="space-y-1">
                      {insight.actionableInsights.map((insight, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-[#8FBF7F] mt-0.5 flex-shrink-0" />
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>
        <TabsContent value="recommendations" className="space-y-4">
          {smartRecommendations.map(rec => (
            <Card key={rec.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{rec.title}</CardTitle>
                  <Badge className={getPriorityColor(rec.priority)}>
                    {rec.priority.toUpperCase()}
                  </Badge>
                </div>
                <CardDescription>{rec.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Expected Impact */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 bg-blue-50 rounded-lg">
                  {rec.expectedImpact.yield && (
                    <div className="text-center">
                      <p className="text-sm text-[#555555]">Yield Impact</p>
                      <p className="font-semibold text-[#8FBF7F]">+{rec.expectedImpact.yield}%</p>
                    </div>
                  )}
                  {rec.expectedImpact.cost && (
                    <div className="text-center">
                      <p className="text-sm text-[#555555]">Cost Impact</p>
                      <p className={`font-semibold ${rec.expectedImpact.cost < 0 ? 'text-[#8FBF7F]' : 'text-orange-600'}`}>
                        ${rec.expectedImpact.cost > 0 ? '+' : ''}${rec.expectedImpact.cost}
                      </p>
                    </div>
                  )}
                  {rec.expectedImpact.risk && (
                    <div className="text-center">
                      <p className="text-sm text-[#555555]">Risk Reduction</p>
                      <p className="font-semibold text-blue-600">{rec.expectedImpact.risk}%</p>
                    </div>
                  )}
                </div>
                {/* Action Steps */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    Action Steps
                  </h4>
                  <ol className="space-y-1">
                    {rec.actionSteps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
                {/* Metadata */}
                <div className="flex items-center justify-between text-sm text-[#555555] pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Timeframe: {rec.timeframe}</span>
                  </div>
                  <div>
                    Based on: {rec.basedOnModels.join(', ')}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}