'use client'
import React, { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn, ensureArray } from '../../lib/utils'
interface MarketPrice {
  commodity: string
  price: number
  change: number
  unit: string
}
interface MarketTickerProps {
  className?: string
}
export function MarketTicker({ className }: MarketTickerProps) {
  const [prices, setPrices] = useState<MarketPrice[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    async function fetchMarketPrices() {
      try {
        const response = await fetch('/api/market/live-prices?symbols=CORN,WHEAT,SOYBEANS')
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data.prices) {
            // Transform API response to expected format
            const transformedPrices = data.data.prices.map((price: any) => ({
              commodity: price.name || price.symbol,
              price: price.price,
              change: price.percentChange || 0, // Use real change or 0
              unit: price.unit || 'bu'
            }))
            setPrices(transformedPrices)
          } else {
            // No data available
            setPrices([])
          }
        } else {
          // No data available
          setPrices([])
        }
      } catch (error) {
        console.error('Failed to fetch market prices:', error)
        // No data available
        setPrices([])
      } finally {
        setLoading(false)
      }
    }
    fetchMarketPrices()
    // Refresh prices every 5 minutes
    const interval = setInterval(fetchMarketPrices, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])
  if (loading) {
    return (
      <div className={cn('bg-sage-50 border-b border-sage-200 px-4 py-2', className)}>
        <div className="animate-pulse flex gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-4 bg-sage-200 rounded w-24"></div>
          ))}
        </div>
      </div>
    )
  }
  if (prices.length === 0) {
    return (
      <div className={cn('bg-sage-50 border-b border-sage-200 px-4 py-2 text-center', className)}>
        <span className="text-sm text-sage-600">Market data unavailable</span>
      </div>
    )
  }
  return (
    <div className={cn(
      'bg-gradient-to-r from-sage-50 to-cream-50 border-b border-sage-200',
      'overflow-hidden',
      className
    )}>
      <div className="animate-scroll-left flex gap-6 px-4 py-2 text-sm">
        {/* Duplicate for seamless scroll */}
        {[...ensureArray(prices), ...ensureArray(prices)].map((price, index) => (
          <div key={index} className="flex items-center gap-2 whitespace-nowrap">
            <span className="font-medium text-sage-800">{price.commodity}:</span>
            <span className="font-semibold text-sage-900">
              ${price.price.toFixed(2)}/{price.unit}
            </span>
            <span className={cn(
              'flex items-center gap-0.5 font-medium',
              price.change > 0 ? 'text-green-600' : 'text-red-600'
            )}>
              {price.change > 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {price.change > 0 ? '+' : ''}{price.change.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
// Mobile-optimized version
export function MobileMarketTicker({ className }: MarketTickerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [prices, setPrices] = useState<MarketPrice[]>([])
  useEffect(() => {
    async function fetchPrices() {
      try {
        const response = await fetch('/api/market/live-prices?symbols=CORN,WHEAT,SOYBEANS')
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data.prices) {
            const transformedPrices = data.data.prices.map((price: any) => ({
              commodity: price.name || price.symbol,
              price: price.price,
              change: price.percentChange || 0,
              unit: price.unit || 'bu'
            }))
            setPrices(transformedPrices)
          }
        }
      } catch (error) {
        console.error('Failed to fetch market prices for mobile:', error)
      }
    }
    fetchPrices()
  }, [])
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % prices.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [prices.length])
  const currentPrice = prices[currentIndex]
  return (
    <div className={cn(
      'bg-gradient-to-r from-sage-50 to-cream-50 px-3 py-1.5',
      'flex items-center justify-between text-xs',
      className
    )}>
      <div className="flex items-center gap-2">
        <span className="font-medium text-sage-700">{currentPrice.commodity}:</span>
        <span className="font-semibold text-sage-900">
          ${currentPrice.price.toFixed(2)}
        </span>
        <span className={cn(
          'flex items-center gap-0.5',
          currentPrice.change > 0 ? 'text-green-600' : 'text-red-600'
        )}>
          {currentPrice.change > 0 ? '↑' : '↓'}
          {Math.abs(currentPrice.change).toFixed(1)}%
        </span>
      </div>
    </div>
  )
}