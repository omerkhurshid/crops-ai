'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
// Logger replaced with console for local development
import { DashboardData, DashboardDataContextType, CropData } from '../../types/dashboard'
import { 
  useCachedFarmData, 
  useCachedWeatherData, 
  useCachedCropData, 
  useCachedTaskData,
  usePrefetchFarmData
} from '../../hooks/useAPICache'

const DashboardDataContext = createContext<DashboardDataContextType | null>(null)

interface DashboardDataProviderProps {
  children: React.ReactNode
  farmId: string
  farmData?: {
    latitude?: number
    longitude?: number
    totalArea?: number
  }
  crops?: CropData[]
}

export function DashboardDataProvider({ 
  children, 
  farmId, 
  farmData, 
  crops: initialCrops = [] 
}: DashboardDataProviderProps) {
  // Use cached data hooks
  const weatherData = useCachedWeatherData(farmId)
  const cropData = useCachedCropData(farmId)
  const taskData = useCachedTaskData(farmId)
  const { prefetchAll } = usePrefetchFarmData(farmId)

  const [additionalData, setAdditionalData] = useState({
    recommendations: [],
    regionalData: null,
    harvestAlerts: [],
    queueStatus: null,
    budgetData: null
  })

  // Aggregate all data from cached sources
  const data = useMemo((): DashboardData => {
    const loading = weatherData.loading || cropData.loading || taskData.loading
    const error = weatherData.error || cropData.error || taskData.error
    
    return {
      weather: weatherData.data,
      crops: cropData.data || initialCrops,
      tasks: taskData.data || [],
      ...additionalData,
      loading,
      error: error?.message || null,
      lastUpdated: loading ? null : new Date()
    }
  }, [
    weatherData.data, weatherData.loading, weatherData.error,
    cropData.data, cropData.loading, cropData.error,
    taskData.data, taskData.loading, taskData.error,
    additionalData,
    initialCrops
  ])

  const fetchAllData = useCallback(async () => {
    if (!farmId) return

    try {
      // Refetch all cached data
      await Promise.allSettled([
        weatherData.refetch(),
        cropData.refetch(), 
        taskData.refetch()
      ])

      // Fetch additional non-cached data in parallel
      const additionalPromises = [
        fetch(`/api/nba/recommendations?farmId=${farmId}&maxRecommendations=4`).then(res => res.ok ? res.json() : { recommendations: [] }),
        fetch(`/api/crop-health/disease-pest-analysis?farmId=${farmId}`).then(res => res.ok ? res.json() : { harvestAlerts: [] }),
        fetch(`/api/satellite/queue?action=status`).then(res => res.ok ? res.json() : null),
        fetch(`/api/financial/budget?farmId=${farmId}`).then(res => res.ok ? res.json() : null)
      ]

      // Regional data (if coordinates available)
      if (farmData?.latitude && farmData?.longitude) {
        additionalPromises.push(
          fetch(`/api/farms/regional-comparison?latitude=${farmData.latitude}&longitude=${farmData.longitude}`).then(res => res.ok ? res.json() : null)
        )
      } else {
        additionalPromises.push(Promise.resolve(null))
      }

      const [
        recommendationsResponse,
        diseaseResponse,
        queueStatusResponse,
        budgetResponse,
        regionalResponse
      ] = await Promise.all(additionalPromises)

      // Update additional data state
      setAdditionalData({
        recommendations: recommendationsResponse?.recommendations || [],
        harvestAlerts: diseaseResponse?.harvestAlerts || [],
        queueStatus: queueStatusResponse,
        budgetData: budgetResponse,
        regionalData: regionalResponse
      })

    } catch (error) {
      console.error('Dashboard data fetch error', error, { farmId })
    }
  }, [farmId, farmData?.latitude, farmData?.longitude, weatherData, cropData, taskData])

  const updateData = useCallback(<K extends keyof DashboardData>(key: K, newData: DashboardData[K]) => {
    // For cached data, invalidate cache and refetch
    if (key === 'weather') {
      weatherData.invalidate()
      weatherData.refetch()
    } else if (key === 'crops') {
      cropData.invalidate()  
      cropData.refetch()
    } else if (key === 'tasks') {
      taskData.invalidate()
      taskData.refetch()
    } else {
      // For additional data, update state directly
      setAdditionalData(prev => ({
        ...prev,
        [key]: newData
      }))
    }
  }, [weatherData, cropData, taskData])

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    ...data,
    refetch: fetchAllData,
    updateData
  }), [data, fetchAllData, updateData])

  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(fetchAllData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchAllData])

  return (
    <DashboardDataContext.Provider value={contextValue}>
      {children}
    </DashboardDataContext.Provider>
  )
}

export function useDashboardData() {
  const context = useContext(DashboardDataContext)
  if (!context) {
    throw new Error('useDashboardData must be used within a DashboardDataProvider')
  }
  return context
}

// Convenience hooks for specific data
export function useWeatherData() {
  const { weather } = useDashboardData()
  return weather
}

export function useTasksData() {
  const { tasks } = useDashboardData()
  return tasks
}

export function useRecommendationsData() {
  const { recommendations } = useDashboardData()
  return recommendations
}

export function useHarvestAlerts() {
  const { harvestAlerts } = useDashboardData()
  return harvestAlerts
}

export function useQueueStatus() {
  const { queueStatus } = useDashboardData()
  return queueStatus
}

export function useBudgetData() {
  const { budgetData } = useDashboardData()
  return budgetData
}