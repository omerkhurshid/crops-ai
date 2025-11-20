'use client'
import React from 'react'
import { Loader2, RefreshCw } from 'lucide-react'
// Basic spinner component
export function Spinner({ size = 'default', className = '' }: { 
  size?: 'small' | 'default' | 'large'
  className?: string 
}) {
  const sizeClasses = {
    small: 'h-4 w-4',
    default: 'h-6 w-6',
    large: 'h-8 w-8'
  }
  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  )
}
// Skeleton loaders for different content types
export function SkeletonLine({ width = 'w-full' }: { width?: string }) {
  return (
    <div className={`h-4 bg-[#F5F5F5] rounded animate-pulse ${width}`} />
  )
}
export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine 
          key={i} 
          width={i === lines - 1 ? 'w-3/4' : 'w-full'} 
        />
      ))}
    </div>
  )
}
export function SkeletonCard() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="animate-pulse">
        <div className="flex items-center space-x-4 mb-4">
          <div className="h-10 w-10 bg-[#F5F5F5] rounded-full" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-[#F5F5F5] rounded w-1/4" />
            <div className="h-3 bg-[#F5F5F5] rounded w-1/2" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-[#F5F5F5] rounded" />
          <div className="h-3 bg-[#F5F5F5] rounded w-5/6" />
          <div className="h-3 bg-[#F5F5F5] rounded w-4/6" />
        </div>
      </div>
    </div>
  )
}
export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number, cols?: number }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Header */}
      <div className="bg-[#FAFAF7] p-4 border-b animate-pulse">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="h-4 bg-[#F5F5F5] rounded" />
          ))}
        </div>
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="p-4 border-b last:border-b-0 animate-pulse">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {Array.from({ length: cols }).map((_, colIndex) => (
              <div key={colIndex} className="h-4 bg-[#F5F5F5] rounded" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
// Loading overlays
export function LoadingOverlay({ isLoading, children, message = "Loading..." }: {
  isLoading: boolean
  children: React.ReactNode
  message?: string
}) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-lg z-50">
          <div className="text-center">
            <Spinner size="large" className="text-[#555555] mb-2" />
            <p className="text-sm text-[#555555] font-medium">{message}</p>
          </div>
        </div>
      )}
    </div>
  )
}
// Inline loading states
export function InlineLoading({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 text-[#555555]">
      <Spinner size="small" />
      <span className="text-sm">{message}</span>
    </div>
  )
}
// Page loading state
export function PageLoading({ title = "Loading page...", description }: { 
  title?: string
  description?: string 
}) {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center">
        <Spinner size="large" className="text-[#555555] mb-4" />
        <h2 className="text-lg font-semibold text-[#1A1A1A] mb-2">{title}</h2>
        {description && (
          <p className="text-[#555555] text-sm">{description}</p>
        )}
      </div>
    </div>
  )
}
// Full page loading with branded spinner
export function FullPageLoading() {
  return (
    <div className="fixed inset-0 bg-[#F8FAF8] flex items-center justify-center z-50">
      <div className="text-center">
        <div className="relative mb-6">
          {/* Animated logo/brand element */}
          <div className="h-16 w-16 bg-[#7A8F78] rounded-full mx-auto mb-4 animate-pulse" />
          <Spinner size="large" className="text-[#555555]" />
        </div>
        <h2 className="text-xl font-semibold text-[#1A1A1A] mb-2">
          Crops.AI
        </h2>
        <p className="text-[#555555]">Loading your farm data...</p>
      </div>
    </div>
  )
}
// Button loading state
export function LoadingButton({ 
  children, 
  isLoading = false, 
  loadingText = "Loading...",
  ...props 
}: {
  children: React.ReactNode
  isLoading?: boolean
  loadingText?: string
  [key: string]: any
}) {
  return (
    <button 
      {...props} 
      disabled={isLoading || props.disabled}
      className={`${props.className} flex items-center justify-center gap-2`}
    >
      {isLoading ? (
        <>
          <Spinner size="small" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  )
}
// Data loading states for lists/grids
export function ListLoading({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white p-4 rounded-lg border animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="h-8 w-8 bg-[#F5F5F5] rounded" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-[#F5F5F5] rounded w-1/3" />
              <div className="h-3 bg-[#F5F5F5] rounded w-1/2" />
            </div>
            <div className="h-8 w-16 bg-[#F5F5F5] rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}
export function GridLoading({ count = 6, cols = 3 }: { count?: number, cols?: number }) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4'
  }[cols] || 'grid-cols-3'
  return (
    <div className={`grid ${gridCols} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
// Dashboard specific loading states
export function DashboardMetricLoading() {
  return (
    <div className="bg-white rounded-lg p-4 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-5 w-5 bg-[#F5F5F5] rounded" />
        <div className="h-4 w-16 bg-[#F5F5F5] rounded" />
      </div>
      <div className="h-8 bg-[#F5F5F5] rounded mb-2" />
      <div className="h-3 bg-[#F5F5F5] rounded w-2/3" />
    </div>
  )
}
export function ChartLoading({ height = "h-64" }: { height?: string }) {
  return (
    <div className={`bg-white rounded-lg border p-6 animate-pulse`}>
      <div className="flex justify-between items-center mb-6">
        <div className="h-5 bg-[#F5F5F5] rounded w-1/4" />
        <div className="h-4 bg-[#F5F5F5] rounded w-16" />
      </div>
      <div className={`${height} bg-[#F5F5F5] rounded-lg flex items-end justify-around p-4`}>
        {Array.from({ length: 7 }).map((_, i) => (
          <div 
            key={i} 
            className="bg-[#F5F5F5] rounded-t w-8"
            style={{ height: `${Math.random() * 80 + 20}%` }}
          />
        ))}
      </div>
    </div>
  )
}
// NBA Recommendations loading state
export function RecommendationLoading() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white border border-[#E6E6E6] rounded-lg p-4 animate-pulse">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3 flex-1">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#F5F5F5] rounded-lg h-8 w-8" />
                <div className="h-4 w-12 bg-[#F5F5F5] rounded-full" />
              </div>
              <div className="flex-1">
                <div className="h-5 bg-[#F5F5F5] rounded w-3/4 mb-2" />
                <div className="h-4 bg-[#F5F5F5] rounded w-full mb-3" />
                <div className="flex gap-4">
                  <div className="h-3 bg-[#F5F5F5] rounded w-16" />
                  <div className="h-3 bg-[#F5F5F5] rounded w-20" />
                  <div className="h-3 bg-[#F5F5F5] rounded w-12" />
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="h-6 w-6 bg-[#F5F5F5] rounded" />
              <div className="h-6 w-6 bg-[#F5F5F5] rounded" />
              <div className="h-6 w-6 bg-[#F5F5F5] rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
// Progress loading with steps
export function ProgressLoading({ 
  steps, 
  currentStep = 0 
}: { 
  steps: string[]
  currentStep?: number 
}) {
  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="text-center mb-6">
        <Spinner size="large" className="text-[#555555] mb-4" />
        <h3 className="text-lg font-semibold text-[#1A1A1A]">Processing...</h3>
      </div>
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
              index < currentStep ? 'bg-[#8FBF7F] border-[#8FBF7F]' :
              index === currentStep ? 'border-[#7A8F78] animate-pulse' :
              'border-[#E6E6E6]'
            }`}>
              {index < currentStep && (
                <div className="h-2 w-2 bg-white rounded-full" />
              )}
            </div>
            <span className={`text-sm ${
              index <= currentStep ? 'text-[#1A1A1A] font-medium' : 'text-[#555555]'
            }`}>
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}