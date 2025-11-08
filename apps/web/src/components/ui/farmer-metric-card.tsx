'use client'
import React from 'react'
import { cn } from '../../lib/utils'
import { ModernCard, ModernCardContent } from './modern-card'
import { TrafficLightStatus, getHealthStatus, getStressStatus } from './traffic-light-status'
import { ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react'
interface FarmerMetricCardProps {
  title: string
  value: string | number
  unit?: string
  subtitle?: string
  status?: 'excellent' | 'good' | 'warning' | 'critical'
  trend?: {
    direction: 'up' | 'down' | 'stable'
    percentage?: number
    label?: string
  }
  showMore?: boolean
  onShowMore?: () => void
  icon?: React.ReactNode
  className?: string
  variant?: 'default' | 'glass' | 'floating' | 'soft' | 'glow'
}
const trendConfig = {
  up: {
    icon: TrendingUp,
    color: 'text-green-600'
  },
  down: {
    icon: TrendingDown,
    color: 'text-red-600'
  },
  stable: {
    icon: Minus,
    color: 'text-gray-500'
  }
}
export function FarmerMetricCard({
  title,
  value,
  unit = '',
  subtitle,
  status,
  trend,
  showMore = false,
  onShowMore,
  icon,
  className,
  variant = 'floating'
}: FarmerMetricCardProps) {
  const TrendIcon = trend ? trendConfig[trend.direction].icon : null
  return (
    <ModernCard 
      variant={variant} 
      className={cn(
        'group hover:shadow-soft-lg transition-all duration-300',
        showMore && 'cursor-pointer hover:scale-[1.02] active:scale-[0.98] touch-manipulation',
        className
      )}
      onClick={showMore ? onShowMore : undefined}
    >
      <ModernCardContent className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="p-2 bg-sage-100/70 rounded-xl">
                {icon}
              </div>
            )}
            <div>
              <h3 className="text-base font-semibold text-sage-800 mb-1">
                {title}
              </h3>
              {status && (
                <TrafficLightStatus 
                  status={status} 
                  size="sm"
                  showIcon={true}
                  showText={true}
                />
              )}
            </div>
          </div>
          {showMore && (
            <ChevronRight className="h-4 w-4 text-sage-400 group-hover:text-sage-600 transition-colors" />
          )}
        </div>
        {/* Main Value */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-bold text-sage-800">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </span>
            {unit && (
              <span className="text-lg text-sage-600 font-medium">
                {unit}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-sage-600 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
        {/* Trend Indicator */}
        {trend && (
          <div className="flex items-center gap-2 pt-3 border-t border-sage-200/30">
            {TrendIcon && (
              <TrendIcon className={cn('h-4 w-4', trendConfig[trend.direction].color)} />
            )}
            <div className="flex items-center gap-1 text-sm">
              {trend.percentage !== undefined && (
                <span className={cn('font-medium', trendConfig[trend.direction].color)}>
                  {trend.direction === 'up' ? '+' : ''}
                  {trend.percentage}%
                </span>
              )}
              {trend.label && (
                <span className="text-sage-600">
                  {trend.label}
                </span>
              )}
            </div>
          </div>
        )}
      </ModernCardContent>
    </ModernCard>
  )
}
// Preset cards for common farming metrics
export function CropHealthCard({
  healthScore,
  healthTrend = 0,
  showMore,
  onShowMore,
  className
}: {
  healthScore: number
  healthTrend?: number
  showMore?: boolean
  onShowMore?: () => void
  className?: string
}) {
  const status = getHealthStatus(healthScore)
  return (
    <FarmerMetricCard
      title="Crop Health"
      value={`${healthScore}%`}
      subtitle="Overall condition of your crops"
      status={status}
      trend={
        healthTrend !== 0 ? {
          direction: healthTrend > 0 ? 'up' : 'down',
          percentage: Math.abs(healthTrend),
          label: 'from last week'
        } : undefined
      }
      showMore={showMore}
      onShowMore={onShowMore}
      icon={<div className="w-5 h-5 bg-green-500 rounded-full" />}
      className={className}
    />
  )
}
export function StressLevelCard({
  stressPercentage,
  stressTrend = 0,
  showMore,
  onShowMore,
  className
}: {
  stressPercentage: number
  stressTrend?: number
  showMore?: boolean
  onShowMore?: () => void
  className?: string
}) {
  const status = getStressStatus(stressPercentage)
  return (
    <FarmerMetricCard
      title="Stress Level"
      value={`${stressPercentage.toFixed(1)}%`}
      subtitle="Areas needing attention"
      status={status}
      trend={
        stressTrend !== 0 ? {
          direction: stressTrend > 0 ? 'up' : stressTrend < 0 ? 'down' : 'stable',
          percentage: Math.abs(stressTrend),
          label: 'from last week'
        } : undefined
      }
      showMore={showMore}
      onShowMore={onShowMore}
      icon={<div className="w-5 h-5 bg-orange-500 rounded-full" />}
      className={className}
    />
  )
}
export function YieldPotentialCard({
  currentYield,
  potentialYield,
  unit,
  showMore,
  onShowMore,
  className
}: {
  currentYield: number
  potentialYield: number
  unit: string
  showMore?: boolean
  onShowMore?: () => void
  className?: string
}) {
  const gapPercentage = ((potentialYield - currentYield) / currentYield * 100)
  const status = gapPercentage <= 10 ? 'excellent' : gapPercentage <= 25 ? 'good' : 'warning'
  return (
    <FarmerMetricCard
      title="Yield Potential"
      value={currentYield}
      unit={unit}
      subtitle={`${potentialYield} ${unit} possible with optimization`}
      status={status}
      trend={{
        direction: 'up',
        percentage: Math.round(gapPercentage),
        label: 'potential gain'
      }}
      showMore={showMore}
      onShowMore={onShowMore}
      icon={<div className="w-5 h-5 bg-blue-500 rounded-full" />}
      className={className}
    />
  )
}