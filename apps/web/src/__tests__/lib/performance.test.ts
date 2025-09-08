/**
 * Performance Optimization Tests
 */

import { 
  memoize, 
  debounce, 
  throttle, 
  PerformanceMonitor,
  withCache,
  BatchProcessor
} from '../../lib/performance/optimizations'

// Mock cache
jest.mock('../../lib/cache/redis-client', () => ({
  cache: {
    get: jest.fn(),
    set: jest.fn()
  },
  CacheTTL: {
    FARM_DATA: 1800
  }
}))

describe('Performance Optimizations', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('memoize', () => {
    it('caches function results', () => {
      const expensiveFunction = jest.fn((x: number) => x * 2)
      const memoized = memoize(expensiveFunction)

      const result1 = memoized(5)
      const result2 = memoized(5)

      expect(result1).toBe(10)
      expect(result2).toBe(10)
      expect(expensiveFunction).toHaveBeenCalledTimes(1)
    })

    it('uses custom key function', () => {
      const fn = jest.fn((obj: { id: number, name: string }) => obj.id * 2)
      const memoized = memoize(fn, (obj) => obj.id.toString())

      memoized({ id: 1, name: 'John' })
      memoized({ id: 1, name: 'Jane' }) // Different name, same id

      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('respects TTL', () => {
      const fn = jest.fn((x: number) => x * 2)
      const memoized = memoize(fn, undefined, 1) // 1 second TTL

      memoized(5)
      
      // Advance time past TTL
      jest.advanceTimersByTime(2000)
      
      memoized(5)

      expect(fn).toHaveBeenCalledTimes(2)
    })
  })

  describe('debounce', () => {
    it('delays function execution', () => {
      const fn = jest.fn()
      const debounced = debounce(fn, 100)

      debounced()
      debounced()
      debounced()

      expect(fn).not.toHaveBeenCalled()

      jest.advanceTimersByTime(100)

      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('cancels previous calls', () => {
      const fn = jest.fn()
      const debounced = debounce(fn, 100)

      debounced()
      jest.advanceTimersByTime(50)
      debounced() // This should cancel the previous call

      jest.advanceTimersByTime(100)

      expect(fn).toHaveBeenCalledTimes(1)
    })
  })

  describe('throttle', () => {
    it('limits function calls', () => {
      const fn = jest.fn()
      const throttled = throttle(fn, 100)

      throttled()
      throttled()
      throttled()

      expect(fn).toHaveBeenCalledTimes(1)

      jest.advanceTimersByTime(100)

      throttled()
      expect(fn).toHaveBeenCalledTimes(2)
    })
  })

  describe('PerformanceMonitor', () => {
    it('tracks timing metrics', () => {
      PerformanceMonitor.startTimer('test-operation')
      
      jest.advanceTimersByTime(100)
      
      const duration = PerformanceMonitor.endTimer('test-operation')
      
      expect(duration).toBeGreaterThan(0)
      
      const metrics = PerformanceMonitor.getMetrics('test-operation')
      expect(metrics).toMatchObject({
        count: 1,
        totalTime: duration,
        avgTime: duration
      })
    })

    it('calculates average timing', () => {
      PerformanceMonitor.startTimer('multi-test')
      jest.advanceTimersByTime(100)
      PerformanceMonitor.endTimer('multi-test')

      PerformanceMonitor.startTimer('multi-test')
      jest.advanceTimersByTime(200)
      PerformanceMonitor.endTimer('multi-test')

      const metrics = PerformanceMonitor.getMetrics('multi-test')
      expect(metrics?.count).toBe(2)
      expect(metrics?.avgTime).toBe(metrics!.totalTime / 2)
    })

    it('handles missing timer', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
      
      const duration = PerformanceMonitor.endTimer('nonexistent')
      
      expect(duration).toBe(0)
      expect(consoleSpy).toHaveBeenCalledWith("Timer 'nonexistent' was not started")
      
      consoleSpy.mockRestore()
    })

    it('clears metrics', () => {
      PerformanceMonitor.startTimer('clear-test')
      PerformanceMonitor.endTimer('clear-test')

      PerformanceMonitor.clearMetrics()

      const metrics = PerformanceMonitor.getMetrics('clear-test')
      expect(metrics).toBeUndefined()
    })
  })

  describe('withCache', () => {
    it('uses cached data when available', async () => {
      const { cache } = require('../../lib/cache/redis-client')
      cache.get.mockResolvedValue({ cached: true })

      const fetcher = jest.fn(() => Promise.resolve({ fresh: true }))
      
      const result = await withCache('test-key', fetcher)
      
      expect(result).toEqual({ cached: true })
      expect(fetcher).not.toHaveBeenCalled()
    })

    it('fetches fresh data when cache miss', async () => {
      const { cache } = require('../../lib/cache/redis-client')
      cache.get.mockResolvedValue(null)
      cache.set.mockResolvedValue(true)

      const fetcher = jest.fn(() => Promise.resolve({ fresh: true }))
      
      const result = await withCache('test-key', fetcher)
      
      expect(result).toEqual({ fresh: true })
      expect(fetcher).toHaveBeenCalled()
      expect(cache.set).toHaveBeenCalledWith('test-key', { fresh: true }, expect.any(Object))
    })

    it('forces refresh when requested', async () => {
      const { cache } = require('../../lib/cache/redis-client')
      cache.get.mockResolvedValue({ cached: true })
      cache.set.mockResolvedValue(true)

      const fetcher = jest.fn(() => Promise.resolve({ fresh: true }))
      
      const result = await withCache('test-key', fetcher, { forceRefresh: true })
      
      expect(result).toEqual({ fresh: true })
      expect(fetcher).toHaveBeenCalled()
    })
  })

  describe('BatchProcessor', () => {
    it('batches requests', async () => {
      const processor = jest.fn((items: number[]) => 
        Promise.resolve(items.map(x => x * 2))
      )
      
      const batcher = new BatchProcessor(processor, 3, 50)
      
      const promises = [
        batcher.add(1),
        batcher.add(2),
        batcher.add(3)
      ]
      
      const results = await Promise.all(promises)
      
      expect(results).toEqual([2, 4, 6])
      expect(processor).toHaveBeenCalledWith([1, 2, 3])
    })

    it('processes on timeout', async () => {
      const processor = jest.fn((items: number[]) => 
        Promise.resolve(items.map(x => x * 2))
      )
      
      const batcher = new BatchProcessor(processor, 10, 100)
      
      const promise = batcher.add(1)
      
      jest.advanceTimersByTime(100)
      
      const result = await promise
      
      expect(result).toBe(2)
      expect(processor).toHaveBeenCalledWith([1])
    })

    it('handles processor errors', async () => {
      const processor = jest.fn(() => Promise.reject(new Error('Batch error')))
      
      const batcher = new BatchProcessor(processor, 2, 50)
      
      const promise1 = batcher.add(1)
      const promise2 = batcher.add(2)
      
      await expect(Promise.all([promise1, promise2])).rejects.toThrow('Batch error')
    })
  })
})