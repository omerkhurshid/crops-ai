'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

interface DashboardData {
  weather: {
    current: any
    alerts: any[]
    forecast: any[]
  } | null
  crops: any[]
  tasks: any[]
  recommendations: any[]
  regionalData: any | null
  harvestAlerts: any[]
  loading: boolean
  error: string | null
  lastUpdated: Date | null
}

interface DashboardDataContextType extends DashboardData {
  refetch: () => Promise<void>
  updateData: (key: keyof DashboardData, data: any) => void
}

const DashboardDataContext = createContext<DashboardDataContextType | null>(null)

interface DashboardDataProviderProps {
  children: React.ReactNode
  farmId: string
  farmData?: {
    latitude?: number
    longitude?: number
    totalArea?: number
  }
  crops?: any[]
}

export function DashboardDataProvider({ 
  children, 
  farmId, 
  farmData, 
  crops: initialCrops = [] 
}: DashboardDataProviderProps) {
  const [data, setData] = useState<DashboardData>({
    weather: null,
    crops: initialCrops,
    tasks: [],
    recommendations: [],
    regionalData: null,
    harvestAlerts: [],
    loading: true,
    error: null,
    lastUpdated: null
  })

  const fetchAllData = useCallback(async () => {
    if (!farmId) return

    setData(prev => ({ ...prev, loading: true, error: null }))

    try {
      // Batch all API calls to run in parallel
      const promises = []

      // Weather data (if coordinates available)
      if (farmData?.latitude && farmData?.longitude) {
        promises.push(
          fetch('/api/weather/current').then(res => res.ok ? res.json() : null),
          fetch(`/api/weather/alerts?latitude=${farmData.latitude}&longitude=${farmData.longitude}`).then(res => res.ok ? res.json() : { alerts: [] })
        )
      } else {
        promises.push(Promise.resolve(null), Promise.resolve({ alerts: [] }))
      }

      // Other data
      promises.push(
        fetch(`/api/tasks?farmId=${farmId}`).then(res => res.ok ? res.json() : { tasks: [] }),
        fetch(`/api/ml/recommendations?farmId=${farmId}&limit=4`).then(res => res.ok ? res.json() : { recommendations: [] }),
        fetch(`/api/crop-health/disease-pest-analysis?farmId=${farmId}`).then(res => res.ok ? res.json() : { harvestAlerts: [] })
      )

      // Regional data (if coordinates available)
      if (farmData?.latitude && farmData?.longitude) {
        promises.push(
          fetch(`/api/farms/regional-comparison?latitude=${farmData.latitude}&longitude=${farmData.longitude}`).then(res => res.ok ? res.json() : null)
        )
      } else {
        promises.push(Promise.resolve(null))
      }

      const [
        currentWeather,
        weatherAlertsResponse,
        tasksResponse,
        recommendationsResponse,
        diseaseResponse,
        regionalResponse
      ] = await Promise.all(promises)

      // Update state with all data at once
      setData(prev => ({
        ...prev,
        weather: {
          current: currentWeather,
          alerts: weatherAlertsResponse?.alerts || [],
          forecast: currentWeather?.forecast || []
        },
        tasks: tasksResponse?.tasks || [],
        recommendations: recommendationsResponse?.recommendations || [],
        harvestAlerts: diseaseResponse?.harvestAlerts || [],
        regionalData: regionalResponse,
        loading: false,
        lastUpdated: new Date()
      }))

    } catch (error) {
      console.error('Dashboard data fetch error:', error)
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load dashboard data'
      }))
    }
  }, [farmId, farmData?.latitude, farmData?.longitude])

  const updateData = useCallback((key: keyof DashboardData, newData: any) => {
    setData(prev => ({
      ...prev,
      [key]: newData,
      lastUpdated: new Date()
    }))
  }, [])

  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(fetchAllData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchAllData])

  const contextValue: DashboardDataContextType = {
    ...data,
    refetch: fetchAllData,
    updateData
  }

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