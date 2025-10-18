/**
 * Service Worker Hook
 * Manages service worker registration and offline capabilities
 */

import { useEffect, useState, useCallback } from 'react'
import { serviceWorkerManager } from '../lib/service-worker/sw-register'
// Logger replaced with console for local development

interface ServiceWorkerState {
  isSupported: boolean
  isRegistered: boolean
  isOffline: boolean
  updateAvailable: boolean
  offlineReady: boolean
  networkInfo: {
    online: boolean
    effectiveType?: string
    downlink?: number
  }
}

interface UseServiceWorkerReturn extends ServiceWorkerState {
  register: () => Promise<boolean>
  skipWaiting: () => Promise<void>
  requestNotificationPermission: () => Promise<boolean>
  queueForSync: (data: any) => Promise<void>
}

export function useServiceWorker(): UseServiceWorkerReturn {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: 'serviceWorker' in navigator,
    isRegistered: false,
    isOffline: !navigator.onLine,
    updateAvailable: false,
    offlineReady: false,
    networkInfo: serviceWorkerManager.getNetworkInfo()
  })

  // Register service worker on mount
  useEffect(() => {
    const registerSW = async () => {
      try {
        const registered = await serviceWorkerManager.register()
        setState(prev => ({ ...prev, isRegistered: registered }))
      } catch (error) {
        console.error('Service worker registration failed', error)
      }
    }

    if (state.isSupported) {
      registerSW()
    }
  }, [state.isSupported])

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ 
        ...prev, 
        isOffline: false,
        networkInfo: serviceWorkerManager.getNetworkInfo()
      }))

    }

    const handleOffline = () => {
      setState(prev => ({ 
        ...prev, 
        isOffline: true,
        networkInfo: serviceWorkerManager.getNetworkInfo()
      }))

    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Listen for service worker updates
  useEffect(() => {
    const handleSWUpdate = (event: CustomEvent) => {
      const { type, message } = event.detail

      setState(prev => ({
        ...prev,
        updateAvailable: type === 'update-available',
        offlineReady: type === 'offline-ready'
      }))

      // Show user notification
      if (type === 'update-available') {

        // You can show a toast or modal here
      } else if (type === 'offline-ready') {

        // You can show a toast notification here
      }
    }

    window.addEventListener('swUpdate', handleSWUpdate as EventListener)

    return () => {
      window.removeEventListener('swUpdate', handleSWUpdate as EventListener)
    }
  }, [])

  // Update network info periodically
  useEffect(() => {
    const updateNetworkInfo = () => {
      setState(prev => ({
        ...prev,
        networkInfo: serviceWorkerManager.getNetworkInfo()
      }))
    }

    const interval = setInterval(updateNetworkInfo, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const register = useCallback(async (): Promise<boolean> => {
    try {
      const registered = await serviceWorkerManager.register()
      setState(prev => ({ ...prev, isRegistered: registered }))
      return registered
    } catch (error) {
      console.error('Service worker registration failed', error)
      return false
    }
  }, [])

  const skipWaiting = useCallback(async (): Promise<void> => {
    try {
      await serviceWorkerManager.skipWaiting()
      setState(prev => ({ ...prev, updateAvailable: false }))
    } catch (error) {
      console.error('Skip waiting failed', error)
    }
  }, [])

  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    try {
      return await serviceWorkerManager.requestNotificationPermission()
    } catch (error) {
      console.error('Notification permission request failed', error)
      return false
    }
  }, [])

  const queueForSync = useCallback(async (data: any): Promise<void> => {
    try {
      await serviceWorkerManager.queueForSync(data)
    } catch (error) {
      console.error('Failed to queue data for sync', error)
    }
  }, [])

  return {
    ...state,
    register,
    skipWaiting,
    requestNotificationPermission,
    queueForSync
  }
}

/**
 * Hook for detecting network status changes
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [networkInfo, setNetworkInfo] = useState(serviceWorkerManager.getNetworkInfo())

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setNetworkInfo(serviceWorkerManager.getNetworkInfo())
    }

    const handleOffline = () => {
      setIsOnline(false)
      setNetworkInfo(serviceWorkerManager.getNetworkInfo())
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return { isOnline, networkInfo }
}