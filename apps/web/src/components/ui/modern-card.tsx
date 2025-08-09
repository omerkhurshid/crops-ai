'use client'

import React from 'react'
import { cn } from '../../lib/utils'
import { InfoTooltip } from './info-tooltip'

interface ModernCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'floating' | 'soft' | 'glow'
  children: React.ReactNode
}

interface ModernCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

interface ModernCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

interface ModernCardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode
}

interface ModernCardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode
}

const cardVariants = {
  default: 'bg-white/90 backdrop-blur-xs border border-sage-200/50 shadow-soft',
  glass: 'bg-white/70 backdrop-blur-md border border-white/20 shadow-glass',
  floating: 'bg-white/95 backdrop-blur-sm border border-sage-100/30 shadow-floating hover:shadow-soft-lg transition-all duration-300',
  soft: 'bg-cream-50/90 backdrop-blur-xs border border-sage-200/30 shadow-soft',
  glow: 'bg-white/85 backdrop-blur-sm border border-sage-300/40 shadow-glow'
}

export function ModernCard({ 
  className, 
  variant = 'default', 
  children, 
  ...props 
}: ModernCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl p-0 transition-all duration-300 hover:scale-[1.01] group',
        cardVariants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function ModernCardHeader({ 
  className, 
  children, 
  ...props 
}: ModernCardHeaderProps) {
  return (
    <div
      className={cn(
        'px-6 py-5 border-b border-sage-200/30',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function ModernCardContent({ 
  className, 
  children, 
  ...props 
}: ModernCardContentProps) {
  return (
    <div
      className={cn(
        'px-6 py-5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function ModernCardTitle({ 
  className, 
  children, 
  ...props 
}: ModernCardTitleProps) {
  return (
    <h3
      className={cn(
        'text-xl font-semibold leading-none tracking-tight text-sage-800',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  )
}

export function ModernCardDescription({ 
  className, 
  children, 
  ...props 
}: ModernCardDescriptionProps) {
  return (
    <p
      className={cn(
        'text-sm text-sage-600 mt-1.5 leading-relaxed',
        className
      )}
      {...props}
    >
      {children}
    </p>
  )
}

// Metric card specifically for displaying data with tooltips
interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  unit?: string
  trend?: 'up' | 'down' | 'stable'
  description?: string
  icon?: React.ReactNode
  tooltip?: {
    title: string
    description: string
  }
  variant?: 'default' | 'glass' | 'floating' | 'soft' | 'glow'
  className?: string
}

export function MetricCard({
  title,
  value,
  change,
  unit = '',
  trend,
  description,
  icon,
  tooltip,
  variant = 'floating',
  className = ''
}: MetricCardProps) {
  const getTrendColor = () => {
    if (trend === 'up') return 'text-sage-600'
    if (trend === 'down') return 'text-earth-600'
    return 'text-sage-500'
  }

  const getTrendIcon = () => {
    if (trend === 'up') return '↗'
    if (trend === 'down') return '↘'
    return '→'
  }

  return (
    <ModernCard variant={variant} className={`group hover:bg-white/95 ${className}`}>
      <ModernCardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <p className="text-sm font-medium text-sage-700">{title}</p>
              {tooltip && (
                <div className="opacity-70 group-hover:opacity-100 transition-opacity">
                  <InfoTooltip 
                    title={tooltip.title}
                    description={tooltip.description}
                    size="sm"
                  />
                </div>
              )}
            </div>
            
            <div className="flex items-baseline gap-2 mb-2">
              <p className="text-2xl font-bold text-sage-800">
                {typeof value === 'number' ? value.toLocaleString() : value}{unit}
              </p>
              {change !== undefined && (
                <div className={`flex items-center text-sm font-medium ${getTrendColor()}`}>
                  <span className="mr-1">{getTrendIcon()}</span>
                  <span>
                    {change > 0 ? '+' : ''}{change}%
                  </span>
                </div>
              )}
            </div>
            
            {description && (
              <p className="text-xs text-sage-500 leading-relaxed">{description}</p>
            )}
          </div>
          
          {icon && (
            <div className="ml-4 p-3 bg-sage-100/50 rounded-xl group-hover:bg-sage-200/50 transition-colors">
              {icon}
            </div>
          )}
        </div>
      </ModernCardContent>
    </ModernCard>
  )
}