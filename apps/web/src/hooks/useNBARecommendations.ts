import { useState, useEffect } from 'react'
import { ensureArray } from '../lib/utils'

export interface NBARecommendation {
  id: string
  type: 'SPRAY' | 'HARVEST' | 'IRRIGATE' | 'LIVESTOCK_HEALTH' | 'MARKET_SELL'
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW'
  title: string
  description: string
  confidence: number
  totalScore: number
  timing: {
    idealStart?: Date
    idealEnd?: Date
    mustCompleteBy?: Date
  }
  estimatedImpact: {
    revenue?: number
    costSavings?: number
    yieldIncrease?: number
  }
  weatherRequirements?: any
  resourceRequirements?: string[]
  explanation: string
  actionSteps: string[]
  alternatives?: string[]
  targetField?: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED'
  userResponse?: string
  actualOutcome?: any
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
}

export interface NBAMetadata {
  farmName: string
  totalDecisionsEvaluated: number
  recommendationsReturned: number
  averageConfidence: number
  generatedAt: string
}

export interface GenerateRecommendationsParams {
  farmId: string
  includeDecisionTypes?: NBARecommendation['type'][]
  excludeCompletedTasks?: boolean
  maxRecommendations?: number
}

export interface UpdateRecommendationParams {
  status?: NBARecommendation['status']
  userResponse?: string
  actualOutcome?: {
    completed: boolean
    actualYield?: number
    actualCost?: number
    actualRevenue?: number
    satisfactionRating?: number
    notes?: string
    wouldRecommendAgain?: boolean
  }
}

export function useNBARecommendations(farmId?: string) {
  const [recommendations, setRecommendations] = useState<NBARecommendation[]>([])
  const [metadata, setMetadata] = useState<NBAMetadata | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Generate new recommendations
  const generateRecommendations = async (params: GenerateRecommendationsParams) => {
    // Input validation
    if (!params.farmId) {
      const error = new Error('Farm ID is required')
      setError(error.message)
      throw error
    }
    
    if (!params.farmId.trim()) {
      const error = new Error('Invalid farm ID provided')
      setError(error.message)
      throw error
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s timeout
      
      const response = await fetch('/api/nba/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...params,
          // Add default values for safety
          excludeCompletedTasks: params.excludeCompletedTasks ?? true,
          maxRecommendations: Math.min(params.maxRecommendations || 10, 20)
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        let errorMessage = 'Failed to generate recommendations'
        
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch {
          // If JSON parsing fails, use status-based messages
          if (response.status === 401) {
            errorMessage = 'Please log in to continue'
          } else if (response.status === 403) {
            errorMessage = 'You do not have permission to access this farm'
          } else if (response.status === 404) {
            errorMessage = 'Farm not found'
          } else if (response.status >= 500) {
            errorMessage = 'Server error. Please try again later'
          }
        }
        
        throw new Error(errorMessage)
      }

      const data = await response.json()
      
      // Validate response structure
      if (!data.recommendations || !Array.isArray(data.recommendations)) {
        throw new Error('Invalid response format from server')
      }

      const processedRecommendations = ensureArray(data.recommendations).map((rec: any) => {
        try {
          return {
            ...rec,
            createdAt: rec.createdAt ? new Date(rec.createdAt) : new Date(),
            updatedAt: rec.updatedAt ? new Date(rec.updatedAt) : new Date(),
            completedAt: rec.completedAt ? new Date(rec.completedAt) : undefined,
            timing: {
              ...rec.timing,
              idealStart: rec.timing?.idealStart ? new Date(rec.timing.idealStart) : undefined,
              idealEnd: rec.timing?.idealEnd ? new Date(rec.timing.idealEnd) : undefined,
              mustCompleteBy: rec.timing?.mustCompleteBy ? new Date(rec.timing.mustCompleteBy) : undefined,
            }
          }
        } catch (dateError) {

          return {
            ...rec,
            createdAt: new Date(),
            updatedAt: new Date(),
            completedAt: undefined,
            timing: {
              ...rec.timing,
              idealStart: undefined,
              idealEnd: undefined,
              mustCompleteBy: undefined,
            }
          }
        }
      })

      setRecommendations(processedRecommendations)
      setMetadata(data.metadata)
      return data
    } catch (err) {
      let message = 'Failed to generate recommendations'
      
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          message = 'Request timed out. Please try again'
        } else {
          message = err.message
        }
      }
      
      setError(message)
      console.error('Generate recommendations error:', err)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }

  // Fetch existing recommendations
  const fetchRecommendations = async (
    farmId: string, 
    status: string = 'PENDING', 
    limit: number = 10
  ) => {
    if (!farmId) throw new Error('Farm ID is required')
    
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams({
        farmId,
        status,
        limit: limit.toString()
      })

      const response = await fetch(`/api/nba/recommendations?${params}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch recommendations')
      }

      const data = await response.json()
      const formattedRecs = ensureArray(data.recommendations).map((rec: any) => ({
        ...rec,
        createdAt: new Date(rec.createdAt),
        updatedAt: new Date(rec.updatedAt),
        completedAt: rec.completedAt ? new Date(rec.completedAt) : undefined,
        timing: {
          ...rec.timing,
          idealStart: rec.timing.idealStart ? new Date(rec.timing.idealStart) : undefined,
          idealEnd: rec.timing.idealEnd ? new Date(rec.timing.idealEnd) : undefined,
          mustCompleteBy: rec.timing.mustCompleteBy ? new Date(rec.timing.mustCompleteBy) : undefined,
        }
      }))
      
      setRecommendations(formattedRecs)
      return formattedRecs
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Update recommendation status
  const updateRecommendation = async (
    recommendationId: string, 
    updates: UpdateRecommendationParams
  ) => {
    setError(null)
    
    try {
      const response = await fetch(`/api/nba/recommendations/${recommendationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update recommendation')
      }

      const data = await response.json()
      
      // Update local state
      setRecommendations(prev => 
        prev.map(rec => 
          rec.id === recommendationId 
            ? { 
                ...rec, 
                status: updates.status || rec.status,
                userResponse: updates.userResponse || rec.userResponse,
                actualOutcome: updates.actualOutcome || rec.actualOutcome,
                updatedAt: new Date(),
                completedAt: updates.status === 'COMPLETED' ? new Date() : rec.completedAt
              }
            : rec
        )
      )
      
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      throw err
    }
  }

  // Accept recommendation
  const acceptRecommendation = async (
    recommendationId: string, 
    userResponse?: string
  ) => {
    return updateRecommendation(recommendationId, {
      status: 'ACCEPTED',
      userResponse: userResponse || 'Accepted by user'
    })
  }

  // Reject recommendation
  const rejectRecommendation = async (
    recommendationId: string, 
    userResponse?: string
  ) => {
    return updateRecommendation(recommendationId, {
      status: 'REJECTED',
      userResponse: userResponse || 'Rejected by user'
    })
  }

  // Complete recommendation with outcome
  const completeRecommendation = async (
    recommendationId: string, 
    outcome: NonNullable<UpdateRecommendationParams['actualOutcome']>,
    userResponse?: string
  ) => {
    return updateRecommendation(recommendationId, {
      status: 'COMPLETED',
      userResponse: userResponse || 'Completed by user',
      actualOutcome: outcome
    })
  }

  // Delete/dismiss recommendation
  const dismissRecommendation = async (recommendationId: string) => {
    setError(null)
    
    try {
      const response = await fetch(`/api/nba/recommendations/${recommendationId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to dismiss recommendation')
      }

      // Remove from local state
      setRecommendations(prev => prev.filter(rec => rec.id !== recommendationId))
      
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      throw err
    }
  }

  // Auto-fetch recommendations when farmId changes
  useEffect(() => {
    if (farmId) {
      fetchRecommendations(farmId).catch(console.error)
    }
  }, [farmId])

  // Helper functions
  const getRecommendationsByStatus = (status: NBARecommendation['status']) => {
    return recommendations.filter(rec => rec.status === status)
  }

  const getRecommendationsByPriority = (priority: NBARecommendation['priority']) => {
    return recommendations.filter(rec => rec.priority === priority)
  }

  const getUrgentRecommendations = () => {
    return recommendations.filter(rec => 
      rec.priority === 'URGENT' && 
      rec.status === 'PENDING'
    )
  }

  const getHighValueRecommendations = (minValue = 1000) => {
    return recommendations.filter(rec => {
      const totalValue = (rec.estimatedImpact.revenue || 0) + 
                        (rec.estimatedImpact.costSavings || 0)
      return totalValue >= minValue && rec.status === 'PENDING'
    })
  }

  return {
    recommendations,
    metadata,
    loading,
    error,
    generateRecommendations,
    fetchRecommendations,
    updateRecommendation,
    acceptRecommendation,
    rejectRecommendation,
    completeRecommendation,
    dismissRecommendation,
    getRecommendationsByStatus,
    getRecommendationsByPriority,
    getUrgentRecommendations,
    getHighValueRecommendations
  }
}