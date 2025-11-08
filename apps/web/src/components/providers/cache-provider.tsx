/**
 * Cache Provider Component
 * Initializes and manages the API cache system
 */
'use client'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { apiCache } from '../../lib/cache/api-cache'
// Logger replaced with console for local development
interface CacheContextValue {
  isReady: boolean
  cacheStats: {
    size: number
    entries: { key: string; age: number; ttl: number }[]
  }
  clearCache: () => void
  invalidatePattern: (pattern: string) => number
}
const CacheContext = createContext<CacheContextValue | null>(null)
interface CacheProviderProps {
  children: React.ReactNode
  enableDebugLogging?: boolean
}
export function CacheProvider({ children, enableDebugLogging = false }: CacheProviderProps) {
  const [isReady, setIsReady] = useState(false)
  const [cacheStats, setCacheStats] = useState(() => apiCache.getStats())
  useEffect(() => {
    // Initialize cache system
    const initializeCache = async () => {
      try {
        // Set up cache event listeners if needed
        // You could add cache hit/miss metrics here
        setIsReady(true)
      } catch (error) {
        console.error('Failed to initialize cache system', error)
        setIsReady(true) // Still mark as ready to not block the app
      }
    }
    initializeCache()
  }, [])
  useEffect(() => {
    if (!enableDebugLogging) return
    // Update cache stats periodically for debugging
    const interval = setInterval(() => {
      setCacheStats(apiCache.getStats())
    }, 5000)
    return () => clearInterval(interval)
  }, [enableDebugLogging])
  useEffect(() => {
    // Clear cache on app visibility change (when user returns from background)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Could implement smart cache invalidation here
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])
  const clearCache = () => {
    apiCache.clear()
    setCacheStats(apiCache.getStats())
  }
  const invalidatePattern = (pattern: string) => {
    const count = apiCache.invalidatePattern(pattern)
    setCacheStats(apiCache.getStats())
    return count
  }
  const contextValue: CacheContextValue = {
    isReady,
    cacheStats,
    clearCache,
    invalidatePattern
  }
  return (
    <CacheContext.Provider value={contextValue}>
      {children}
    </CacheContext.Provider>
  )
}
export function useCache(): CacheContextValue {
  const context = useContext(CacheContext)
  if (!context) {
    throw new Error('useCache must be used within a CacheProvider')
  }
  return context
}
/**
 * Cache Debug Component for development
 */
export function CacheDebugPanel() {
  const { cacheStats, clearCache, invalidatePattern } = useCache()
  const [pattern, setPattern] = useState('')
  if (process.env.NODE_ENV !== 'development') {
    return null
  }
  return (
    <div className="fixed bottom-4 right-4 bg-white border rounded-lg shadow-lg p-4 max-w-sm z-50">
      <h3 className="font-semibold mb-2">Cache Debug</h3>
      <div className="text-sm mb-2">
        <div>Entries: {cacheStats.size}</div>
      </div>
      <div className="space-y-2">
        <button
          onClick={clearCache}
          className="text-xs bg-red-500 text-white px-2 py-1 rounded"
        >
          Clear All
        </button>
        <div className="flex gap-1">
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="Pattern to invalidate"
            className="text-xs border rounded px-1 py-1 flex-1"
          />
          <button
            onClick={() => {
              if (pattern) {
                invalidatePattern(pattern)
                setPattern('')
              }
            }}
            className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
          >
            Clear
          </button>
        </div>
      </div>
      <div className="mt-2 max-h-32 overflow-y-auto">
        <div className="text-xs font-semibold">Cached Keys:</div>
        {cacheStats.entries.map((entry, index) => (
          <div key={index} className="text-xs text-gray-600 truncate">
            {entry.key} ({Math.round(entry.age / 1000)}s old)
          </div>
        ))}
      </div>
    </div>
  )
}