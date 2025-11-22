'use client'
import React, { useState, useEffect, useMemo, useCallback, memo } from 'react'
import { useNBARecommendations, type NBARecommendation } from '../../hooks/useNBARecommendations'
import { ErrorBoundary, ErrorState, AsyncWrapper } from '../ui/error-boundary'
import { RecommendationLoading } from '../ui/loading-states'
import { 
  CheckCircle, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  Zap,
  Droplets,
  Scissors,
  Truck,
  Activity,
  X,
  Eye,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react'
import { ensureArray } from '../../lib/utils'
interface NBARecommendationsProps {
  farmId: string
  className?: string
}
const NBARecommendations = memo(function NBARecommendations({ farmId, className = '' }: NBARecommendationsProps) {
  const {
    recommendations,
    loading,
    error,
    generateRecommendations,
    acceptRecommendation,
    rejectRecommendation,
    dismissRecommendation,
    getUrgentRecommendations,
    getHighValueRecommendations
  } = useNBARecommendations(farmId)
  const [selectedRecommendation, setSelectedRecommendation] = useState<NBARecommendation | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const handleGenerateRecommendations = useCallback(async () => {
    setIsGenerating(true)
    try {
      await generateRecommendations({
        farmId,
        excludeCompletedTasks: true,
        maxRecommendations: 8
      })
    } catch (err) {
    } finally {
      setIsGenerating(false)
    }
  }, [farmId, generateRecommendations])
  useEffect(() => {
    if (farmId && recommendations.length === 0 && !loading) {
      handleGenerateRecommendations()
    }
  }, [farmId, recommendations.length, loading, handleGenerateRecommendations])
  const getRecommendationIcon = (type: NBARecommendation['type']) => {
    const iconProps = { className: "h-5 w-5" }
    switch (type) {
      case 'SPRAY': return <Scissors {...iconProps} />
      case 'HARVEST': return <Truck {...iconProps} />
      case 'IRRIGATE': return <Droplets {...iconProps} />
      case 'LIVESTOCK_HEALTH': return <Activity {...iconProps} />
      case 'MARKET_SELL': return <DollarSign {...iconProps} />
      default: return <Zap {...iconProps} />
    }
  }
  const getPriorityColor = (priority: NBARecommendation['priority']) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800 border-red-200'
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'LOW': return 'bg-[#F8FAF8] text-[#7A8F78] border-[#DDE4D8]'
    }
  }
  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return '$0'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount)
  }
  const formatDate = (date: Date | undefined) => {
    if (!date) return ''
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }
  // Memoized computed values for performance
  const urgentRecs = useMemo(() => getUrgentRecommendations(), [getUrgentRecommendations])
  const highValueRecs = useMemo(() => getHighValueRecommendations(1000), [getHighValueRecommendations])
  const pendingRecs = useMemo(() => ensureArray(recommendations).filter(r => r.status === 'PENDING'), [recommendations])
  // Memoized event handlers
  const handleAcceptRecommendation = useCallback(async (id: string) => {
    try {
      await acceptRecommendation(id, 'Accepted via dashboard')
    } catch (err) {
    }
  }, [acceptRecommendation])
  const handleRejectRecommendation = useCallback(async (id: string, reason?: string) => {
    try {
      await rejectRecommendation(id, reason || 'Rejected via dashboard')
    } catch (err) {
    }
  }, [rejectRecommendation])
  const handleDismissRecommendation = useCallback(async (id: string) => {
    try {
      await dismissRecommendation(id)
    } catch (err) {
    }
  }, [dismissRecommendation])
  // Add input validation
  if (!farmId) {
    return (
      <ErrorState 
        title="Farm not selected"
        message="Please select a farm to view recommendations"
        showRetry={false}
      />
    )
  }
  return (
    <ErrorBoundary 
      fallback={
        <ErrorState 
          title="Recommendations Error"
          message="Unable to load farm recommendations. Please refresh and try again."
          onRetry={handleGenerateRecommendations}
        />
      }
    >
      <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
        <div className="p-6 border-b border-[#E6E6E6]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#1A1A1A]">Next Best Actions</h2>
              <p className="text-sm text-[#555555] mt-1">
                AI-powered farm operation recommendations based on current conditions
              </p>
            </div>
            <button
              onClick={handleGenerateRecommendations}
              disabled={isGenerating || loading}
              className="flex items-center gap-2 px-4 py-2 bg-[#7A8F78] text-white rounded-lg hover:bg-[#5E6F5A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Zap className="h-4 w-4" />
              )}
              {isGenerating ? 'Analyzing...' : 'Refresh'}
            </button>
          </div>
          {/* Quick Stats */}
          <div className="flex gap-6 mt-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-[#555555]">
                {urgentRecs.length} urgent
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#8FBF7F]" />
              <span className="text-sm text-[#555555]">
                {highValueRecs.length} high-value
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-[#555555]">
                {pendingRecs.length} pending
              </span>
            </div>
          </div>
        </div>
        <AsyncWrapper 
          loading={loading && recommendations.length === 0}
          error={error}
          onRetry={handleGenerateRecommendations}
          loadingComponent={
            <div className="p-6">
              <RecommendationLoading />
            </div>
          }
          isEmpty={pendingRecs.length === 0}
          emptyState={
            <div className="p-6">
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-[#8FBF7F] mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[#1A1A1A] mb-2">All caught up!</h3>
                <p className="text-[#555555]">
                  No urgent actions needed right now. Check back later or generate new recommendations.
                </p>
              </div>
            </div>
          }
        >
          <div className="p-6">
            <div className="space-y-4">
              {ensureArray(pendingRecs).slice(0, 5).map((rec) => (
              <div
                key={rec.id}
                className="border border-[#E6E6E6] rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {/* Icon and Priority */}
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-[#F8FAF8] rounded-lg">
                        {getRecommendationIcon(rec.type)}
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(rec.priority)}`}>
                        {rec.priority}
                      </div>
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-[#1A1A1A] mb-1">{rec.title}</h3>
                      <p className="text-sm text-[#555555] mb-2">{rec.description}</p>
                      {/* Financial Impact */}
                      <div className="flex items-center gap-4 text-xs text-[#555555] mb-2">
                        {rec.estimatedImpact.revenue && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            <span>{formatCurrency(rec.estimatedImpact.revenue)} revenue</span>
                          </div>
                        )}
                        {rec.estimatedImpact.costSavings && (
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            <span>{formatCurrency(rec.estimatedImpact.costSavings)} savings</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <span className="text-[#555555] font-medium">{rec.confidence}% confidence</span>
                        </div>
                      </div>
                      {/* Timing */}
                      {rec.timing.idealStart && (
                        <div className="flex items-center gap-1 text-xs text-[#555555]">
                          <Clock className="h-3 w-3" />
                          <span>Best time: {formatDate(rec.timing.idealStart)}</span>
                          {rec.timing.mustCompleteBy && (
                            <span className="text-orange-600">
                              (by {formatDate(rec.timing.mustCompleteBy)})
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => setSelectedRecommendation(rec)}
                      className="p-2 text-[#555555] hover:text-[#555555] transition-colors"
                      title="View details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleAcceptRecommendation(rec.id)}
                      className="p-2 text-[#8FBF7F] hover:text-[#8FBF7F] transition-colors"
                      title="Accept recommendation"
                    >
                      <ThumbsUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleRejectRecommendation(rec.id)}
                      className="p-2 text-red-400 hover:text-red-600 transition-colors"
                      title="Reject recommendation"
                    >
                      <ThumbsDown className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => dismissRecommendation(rec.id)}
                      className="p-2 text-[#555555] hover:text-[#555555] transition-colors"
                      title="Dismiss"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {pendingRecs.length > 5 && (
              <div className="text-center pt-4">
                <button
                  onClick={handleGenerateRecommendations}
                  className="text-[#555555] hover:text-[#555555] text-sm font-medium"
                >
                  View all {pendingRecs.length} recommendations →
                </button>
              </div>
            )}
            </div>
          </div>
        </AsyncWrapper>
      </div>
      {/* Recommendation Detail Modal */}
      {selectedRecommendation && (
        <RecommendationModal
          recommendation={selectedRecommendation}
          onClose={() => setSelectedRecommendation(null)}
          onAccept={() => handleAcceptRecommendation(selectedRecommendation.id)}
          onReject={() => handleRejectRecommendation(selectedRecommendation.id)}
        />
      )}
    </ErrorBoundary>
  )
})
interface RecommendationModalProps {
  recommendation: NBARecommendation
  onClose: () => void
  onAccept: () => void
  onReject: () => void
}
function RecommendationModal({ recommendation, onClose, onAccept, onReject }: RecommendationModalProps) {
  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return '$0'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount)
  }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-[#E6E6E6]">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#1A1A1A]">{recommendation.title}</h2>
            <button
              onClick={onClose}
              className="text-[#555555] hover:text-[#555555] transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="font-medium text-[#1A1A1A] mb-2">Description</h3>
            <p className="text-[#555555]">{recommendation.description}</p>
          </div>
          {/* Financial Impact */}
          <div>
            <h3 className="font-medium text-[#1A1A1A] mb-3">Financial Impact</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {recommendation.estimatedImpact.revenue && (
                <div className="bg-[#F8FAF8] border border-[#DDE4D8] rounded-lg p-3">
                  <div className="text-[#7A8F78] font-medium">Revenue</div>
                  <div className="text-2xl font-bold text-green-900">
                    {formatCurrency(recommendation.estimatedImpact.revenue)}
                  </div>
                </div>
              )}
              {recommendation.estimatedImpact.costSavings && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-[#7A8F78] font-medium">Cost Savings</div>
                  <div className="text-2xl font-bold text-blue-900">
                    {formatCurrency(recommendation.estimatedImpact.costSavings)}
                  </div>
                </div>
              )}
              <div className="bg-[#F8FAF8] border border-[#DDE4D8] rounded-lg p-3">
                <div className="text-[#1A1A1A] font-medium">Confidence</div>
                <div className="text-2xl font-bold text-#1A1A1A">
                  {recommendation.confidence}%
                </div>
              </div>
            </div>
          </div>
          {/* Explanation */}
          <div>
            <h3 className="font-medium text-[#1A1A1A] mb-2">Analysis</h3>
            <p className="text-[#555555]">{recommendation.explanation}</p>
          </div>
          {/* Action Steps */}
          <div>
            <h3 className="font-medium text-[#1A1A1A] mb-3">Action Steps</h3>
            <ol className="list-decimal list-inside space-y-2">
              {recommendation.actionSteps.map((step, index) => (
                <li key={index} className="text-[#555555]">{step}</li>
              ))}
            </ol>
          </div>
          {/* Resource Requirements */}
          {recommendation.resourceRequirements && recommendation.resourceRequirements.length > 0 && (
            <div>
              <h3 className="font-medium text-[#1A1A1A] mb-3">Required Resources</h3>
              <div className="flex flex-wrap gap-2">
                {recommendation.resourceRequirements.map((resource, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-[#F5F5F5] text-[#1A1A1A] rounded-lg text-sm"
                  >
                    {resource}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="p-6 border-t border-[#E6E6E6] flex justify-end gap-3">
          <button
            onClick={() => {
              onReject()
              onClose()
            }}
            className="px-4 py-2 text-[#555555] bg-[#F5F5F5] hover:bg-[#F5F5F5] rounded-lg transition-colors"
          >
            Not Now
          </button>
          <button
            onClick={() => {
              onAccept()
              onClose()
            }}
            className="px-4 py-2 bg-[#7A8F78] text-white hover:bg-[#5E6F5A] rounded-lg transition-colors"
          >
            Accept & Proceed
          </button>
        </div>
      </div>
    </div>
  )
}
export default NBARecommendations