'use client'
import { useState, useEffect } from 'react'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../ui/modern-card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  X, 
  RefreshCw,
  DollarSign,
  Calendar,
  Lightbulb,
  Target,
  ChevronRight
} from 'lucide-react'
interface Recommendation {
  id: string
  type: 'fertilizer' | 'irrigation' | 'pest_control' | 'planting' | 'harvest' | 'financial' | 'equipment'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  title: string
  description: string
  actionRequired: string
  potentialImpact: string
  confidenceLevel: 'low' | 'medium' | 'high'
  estimatedCost?: number
  estimatedRoi?: number
  optimalTiming: string
  expiresAt?: string
  status: string
  fieldName?: string
  cropType?: string
  createdAt: string
}
interface RecommendationsWidgetProps {
  farmId: string
  limit?: number
  showHeader?: boolean
  className?: string
}
const priorityColors = {
  low: 'bg-blue-50 text-blue-700 border-blue-200',
  medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  high: 'bg-orange-50 text-orange-700 border-orange-200',
  urgent: 'bg-red-50 text-red-700 border-red-200'
}
const typeIcons = {
  fertilizer: '🌱',
  irrigation: '💧',
  pest_control: '🦗',
  planting: '🌾',
  harvest: '🚜',
  financial: '💰',
  equipment: '🔧'
}
const confidenceColors = {
  low: 'text-gray-500',
  medium: 'text-blue-500',
  high: 'text-green-500'
}
export function RecommendationsWidget({ 
  farmId, 
  limit = 5, 
  showHeader = true,
  className = ''
}: RecommendationsWidgetProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    fetchRecommendations()
  }, [farmId])
  const fetchRecommendations = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/recommendations?farmId=${farmId}&limit=${limit}`)
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations')
      }
      const data = await response.json()
      setRecommendations(data.recommendations || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recommendations')
    } finally {
      setLoading(false)
    }
  }
  const generateNewRecommendations = async () => {
    try {
      setGenerating(true)
      const response = await fetch(`/api/recommendations?farmId=${farmId}&generateNew=true`)
      if (!response.ok) {
        throw new Error('Failed to generate recommendations')
      }
      const data = await response.json()
      setRecommendations(data.recommendations || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate recommendations')
    } finally {
      setGenerating(false)
    }
  }
  const updateRecommendation = async (recommendationId: string, action: 'complete' | 'dismiss') => {
    try {
      const response = await fetch('/api/recommendations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recommendationId, action })
      })
      if (!response.ok) {
        throw new Error('Failed to update recommendation')
      }
      // Remove from list
      setRecommendations(prev => prev.filter(r => r.id !== recommendationId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update recommendation')
    }
  }
  const formatCurrency = (amount?: number) => {
    if (!amount) return null
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays < 7) return `In ${diffDays} days`
    if (diffDays < 30) return `In ${Math.ceil(diffDays / 7)} weeks`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  if (loading) {
    return (
      <ModernCard className={className}>
        {showHeader && (
          <ModernCardHeader>
            <ModernCardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-sage-600" />
              Smart Recommendations
            </ModernCardTitle>
          </ModernCardHeader>
        )}
        <ModernCardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </ModernCardContent>
      </ModernCard>
    )
  }
  return (
    <ModernCard className={className}>
      {showHeader && (
        <ModernCardHeader>
          <div className="flex items-center justify-between">
            <ModernCardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-sage-600" />
              Smart Recommendations
              {recommendations.length > 0 && (
                <Badge className="bg-sage-100 text-sage-700 border-sage-200">
                  {recommendations.length}
                </Badge>
              )}
            </ModernCardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={generateNewRecommendations}
                disabled={generating}
                className="text-sage-600 hover:text-sage-700"
              >
                <RefreshCw className={`h-4 w-4 ${generating ? 'animate-spin' : ''}`} />
                {generating ? 'Analyzing...' : 'Refresh'}
              </Button>
            </div>
          </div>
        </ModernCardHeader>
      )}
      <ModernCardContent>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-red-700 text-sm">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </div>
          </div>
        )}
        {recommendations.length === 0 && !error && (
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Recommendations Yet</h3>
            <p className="text-gray-600 mb-4">
              Generate personalized farming insights based on your data
            </p>
            <Button 
              onClick={generateNewRecommendations} 
              disabled={generating}
              className="bg-sage-700 hover:bg-sage-800"
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              {generating ? 'Analyzing Farm Data...' : 'Generate Recommendations'}
            </Button>
          </div>
        )}
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <div 
              key={rec.id} 
              className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{typeIcons[rec.type]}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900 text-sm">
                        {rec.title}
                      </h4>
                      <Badge className={`text-xs ${priorityColors[rec.priority]}`}>
                        {rec.priority}
                      </Badge>
                    </div>
                    {rec.fieldName && (
                      <p className="text-xs text-gray-500">
                        {rec.fieldName} {rec.cropType && `• ${rec.cropType}`}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateRecommendation(rec.id, 'complete')}
                    className="p-1 h-6 w-6 text-green-600 hover:bg-green-50"
                    title="Mark as completed"
                  >
                    <CheckCircle className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateRecommendation(rec.id, 'dismiss')}
                    className="p-1 h-6 w-6 text-gray-400 hover:bg-gray-50"
                    title="Dismiss"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              {/* Content */}
              <div className="space-y-2">
                <p className="text-sm text-gray-700">
                  {rec.description}
                </p>
                <div className="bg-sage-50 border border-sage-200 rounded p-2">
                  <p className="text-sm font-medium text-sage-800 mb-1">
                    Action Required:
                  </p>
                  <p className="text-sm text-sage-700">
                    {rec.actionRequired}
                  </p>
                </div>
                {rec.potentialImpact && (
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <p className="text-xs text-green-600 font-medium">
                      {rec.potentialImpact}
                    </p>
                  </div>
                )}
              </div>
              {/* Footer */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(rec.optimalTiming)}
                  </div>
                  {rec.estimatedCost && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {formatCurrency(rec.estimatedCost)} cost
                    </div>
                  )}
                  {rec.estimatedRoi && (
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      {formatCurrency(rec.estimatedRoi)} potential return
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium ${confidenceColors[rec.confidenceLevel]}`}>
                    {rec.confidenceLevel} confidence
                  </span>
                  <ChevronRight className="h-3 w-3 text-gray-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </ModernCardContent>
    </ModernCard>
  )
}