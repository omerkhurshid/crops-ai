'use client'
import React, { useMemo } from 'react'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../ui/modern-card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { useRecommendationsData, useDashboardData } from './dashboard-data-provider'
import { 
  Brain, 
  TrendingUp, 
  Droplets, 
  Leaf, 
  AlertTriangle,
  Clock,
  Target,
  ChevronRight
} from 'lucide-react'
interface OptimizedRecommendationsProps {
  className?: string
  limit?: number
}
export function OptimizedRecommendations({ className, limit = 4 }: OptimizedRecommendationsProps) {
  const recommendations = useRecommendationsData()
  const { loading } = useDashboardData()
  const topRecommendations = useMemo(() => {
    if (!recommendations) return []
    return recommendations
      .sort((a: any, b: any) => (b.priority || 0) - (a.priority || 0))
      .slice(0, limit)
  }, [recommendations, limit])
  const getRecommendationIcon = (category: string) => {
    const iconMap: { [key: string]: React.ElementType } = {
      irrigation: Droplets,
      fertilizer: Leaf,
      pest_control: AlertTriangle,
      harvest: Target,
      planting: TrendingUp
    }
    const IconComponent = iconMap[category] || Brain
    return <IconComponent className="h-4 w-4" />
  }
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-[#F8FAF8] text-green-800 border-[#DDE4D8]'
    }
  }
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600'
    if (confidence >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }
  if (loading) {
    return (
      <ModernCard className={className}>
        <ModernCardHeader>
          <ModernCardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Recommendations
          </ModernCardTitle>
        </ModernCardHeader>
        <ModernCardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-[#F5F5F5] h-4 rounded mb-2" />
                <div className="bg-[#F5F5F5] h-12 rounded" />
              </div>
            ))}
          </div>
        </ModernCardContent>
      </ModernCard>
    )
  }
  return (
    <ModernCard className={className}>
      <ModernCardHeader>
        <div className="flex items-center justify-between">
          <ModernCardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Recommendations
            {topRecommendations.length > 0 && (
              <Badge variant="outline">{topRecommendations.length}</Badge>
            )}
          </ModernCardTitle>
          <Button variant="ghost" size="sm" className="flex items-center gap-1">
            View All
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </ModernCardHeader>
      <ModernCardContent>
        {topRecommendations.length > 0 ? (
          <div className="space-y-4">
            {topRecommendations.map((rec: any, index: number) => (
              <div
                key={rec.id || index}
                className="p-4 border rounded-lg hover:bg-[#FAFAF7] transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 p-2 bg-blue-100 rounded-lg">
                    {getRecommendationIcon(rec.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-[#1A1A1A] line-clamp-1">
                        {rec.title}
                      </h4>
                      <Badge className={getPriorityColor(rec.priority)}>
                        {rec.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-[#555555] line-clamp-2 mb-3">
                      {rec.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-[#555555]">
                        {rec.estimatedTime && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {rec.estimatedTime}
                          </div>
                        )}
                        {rec.confidence && (
                          <div className={`font-medium ${getConfidenceColor(rec.confidence)}`}>
                            {rec.confidence}% confidence
                          </div>
                        )}
                      </div>
                      {rec.estimatedImpact && (
                        <div className="text-sm font-medium text-green-600">
                          {rec.estimatedImpact}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Brain className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-[#555555]">No recommendations available</p>
            <p className="text-xs text-[#555555] mt-1">
              Add field data to get personalized insights
            </p>
          </div>
        )}
      </ModernCardContent>
    </ModernCard>
  )
}