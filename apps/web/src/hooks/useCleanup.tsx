'use client'

import { useEffect, useRef, useCallback } from 'react'

/**
 * Hook to prevent memory leaks by cleaning up effects and cancelling async operations
 */
export function useCleanup() {
  const isMountedRef = useRef(true)
  const cleanupFunctionsRef = useRef<(() => void)[]>([])

  useEffect(() => {
    return () => {
      isMountedRef.current = false
      // Run all cleanup functions
      cleanupFunctionsRef.current.forEach(cleanup => {
        try {
          cleanup()
        } catch (error) {
          console.error('Error during cleanup:', error)
        }
      })
      cleanupFunctionsRef.current = []
    }
  }, [])

  const isMounted = useCallback(() => isMountedRef.current, [])

  const addCleanup = useCallback((cleanupFunction: () => void) => {
    cleanupFunctionsRef.current.push(cleanupFunction)
  }, [])

  const safeSetState = useCallback(<T,>(
    setter: (value: T) => void,
    value: T
  ) => {
    if (isMountedRef.current) {
      setter(value)
    }
  }, [])

  return {
    isMounted,
    addCleanup,
    safeSetState
  }
}

/**
 * Hook for safely handling async operations with automatic cleanup
 */
export function useSafeAsync<T>() {
  const { isMounted, addCleanup } = useCleanup()

  const execute = useCallback(async (
    asyncOperation: () => Promise<T>,
    onSuccess?: (result: T) => void,
    onError?: (error: Error) => void
  ) => {
    try {
      const result = await asyncOperation()
      
      if (isMounted() && onSuccess) {
        onSuccess(result)
      }
      
      return result
    } catch (error) {
      if (isMounted() && onError) {
        onError(error as Error)
      }
      throw error
    }
  }, [isMounted])

  return execute
}

/**
 * Hook for creating cancellable fetch requests
 */
export function useCancellableFetch() {
  const { addCleanup } = useCleanup()

  const fetchWithCancel = useCallback((
    url: string,
    options: RequestInit = {}
  ) => {
    const controller = new AbortController()
    
    // Add cleanup to cancel the request
    addCleanup(() => {
      controller.abort()
    })

    const fetchPromise = fetch(url, {
      ...options,
      signal: controller.signal
    })

    return {
      promise: fetchPromise,
      cancel: () => controller.abort()
    }
  }, [addCleanup])

  return fetchWithCancel
}

/**
 * Hook for safely setting intervals that are automatically cleared
 */
export function useSafeInterval() {
  const { addCleanup } = useCleanup()

  const setInterval = useCallback((
    callback: () => void,
    delay: number
  ) => {
    const intervalId = window.setInterval(callback, delay)
    
    addCleanup(() => {
      clearInterval(intervalId)
    })

    return intervalId
  }, [addCleanup])

  return setInterval
}

/**
 * Hook for safely setting timeouts that are automatically cleared
 */
export function useSafeTimeout() {
  const { addCleanup } = useCleanup()

  const setTimeout = useCallback((
    callback: () => void,
    delay: number
  ) => {
    const timeoutId = window.setTimeout(callback, delay)
    
    addCleanup(() => {
      clearTimeout(timeoutId)
    })

    return timeoutId
  }, [addCleanup])

  return setTimeout
}

/**
 * Hook for managing WebSocket connections with automatic cleanup
 */
export function useWebSocket(url?: string) {
  const { addCleanup, isMounted } = useCleanup()
  const wsRef = useRef<WebSocket | null>(null)

  const connect = useCallback(() => {
    if (!url || wsRef.current?.readyState === WebSocket.OPEN) return

    const ws = new WebSocket(url)
    wsRef.current = ws

    addCleanup(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close()
      }
    })

    return ws
  }, [url, addCleanup])

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
  }, [])

  const send = useCallback((data: string | ArrayBufferLike | Blob | ArrayBufferView) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && isMounted()) {
      wsRef.current.send(data)
    }
  }, [isMounted])

  return {
    connect,
    disconnect,
    send,
    websocket: wsRef.current
  }
}

/**
 * Hook for managing event listeners with automatic cleanup
 */
export function useEventListener<K extends keyof WindowEventMap>(
  event: K,
  handler: (event: WindowEventMap[K]) => void,
  element: Window | Element = window,
  options?: boolean | AddEventListenerOptions
) {
  const { addCleanup } = useCleanup()

  useEffect(() => {
    if (!element) return

    element.addEventListener(event, handler as EventListener, options)
    
    addCleanup(() => {
      element.removeEventListener(event, handler as EventListener, options)
    })
  }, [event, handler, element, options, addCleanup])
}

/**
 * Hook for managing ResizeObserver with automatic cleanup
 */
export function useResizeObserver(
  callback: ResizeObserverCallback,
  element?: Element | null
) {
  const { addCleanup } = useCleanup()

  useEffect(() => {
    if (!element) return

    const observer = new ResizeObserver(callback)
    observer.observe(element)

    addCleanup(() => {
      observer.disconnect()
    })
  }, [callback, element, addCleanup])
}

/**
 * Hook for managing IntersectionObserver with automatic cleanup
 */
export function useIntersectionObserver(
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit,
  element?: Element | null
) {
  const { addCleanup } = useCleanup()

  useEffect(() => {
    if (!element) return

    const observer = new IntersectionObserver(callback, options)
    observer.observe(element)

    addCleanup(() => {
      observer.disconnect()
    })
  }, [callback, options, element, addCleanup])
}