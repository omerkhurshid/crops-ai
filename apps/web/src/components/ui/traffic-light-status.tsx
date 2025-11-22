'use client'
import React from 'react'
import { cn } from '../../lib/utils'
import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react'
interface TrafficLightStatusProps {
  status: 'excellent' | 'good' | 'warning' | 'critical'
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  showText?: boolean
  className?: string
}
const statusConfig = {
  excellent: {
    color: 'bg-[#8FBF7F]',
    textColor: 'text-[#7A8F78]',
    icon: CheckCircle2,
    label: 'Excellent',
    description: 'Your crops are thriving!'
  },
  good: {
    color: 'bg-yellow-400',
    textColor: 'text-yellow-700',
    icon: Info,
    label: 'Good',
    description: 'Crops are doing well'
  },
  warning: {
    color: 'bg-orange-500',
    textColor: 'text-orange-700',
    icon: AlertTriangle,
    label: 'Needs Attention',
    description: 'Some issues detected'
  },
  critical: {
    color: 'bg-red-500',
    textColor: 'text-red-700',
    icon: XCircle,
    label: 'Action Required',
    description: 'Immediate attention needed'
  }
}
const sizeConfig = {
  sm: {
    circle: 'w-3 h-3',
    icon: 'h-3 w-3',
    text: 'text-xs',
    container: 'gap-1.5'
  },
  md: {
    circle: 'w-4 h-4',
    icon: 'h-4 w-4',
    text: 'text-sm',
    container: 'gap-2'
  },
  lg: {
    circle: 'w-6 h-6',
    icon: 'h-5 w-5',
    text: 'text-base',
    container: 'gap-3'
  }
}
export function TrafficLightStatus({
  status,
  size = 'md',
  showIcon = true,
  showText = true,
  className
}: TrafficLightStatusProps) {
  const config = statusConfig[status]
  const sizes = sizeConfig[size]
  const Icon = config.icon
  return (
    <div className={cn('flex items-center', sizes.container, className)}>
      {showIcon ? (
        <Icon className={cn(sizes.icon, config.textColor)} />
      ) : (
        <div 
          className={cn(
            'rounded-full shadow-inner',
            sizes.circle,
            config.color
          )} 
        />
      )}
      {showText && (
        <span className={cn('font-medium', sizes.text, config.textColor)}>
          {config.label}
        </span>
      )}
    </div>
  )
}
export function getHealthStatus(healthScore: number): 'excellent' | 'good' | 'warning' | 'critical' {
  if (healthScore >= 85) return 'excellent'
  if (healthScore >= 70) return 'good'
  if (healthScore >= 50) return 'warning'
  return 'critical'
}
export function getStressStatus(stressPercentage: number): 'excellent' | 'good' | 'warning' | 'critical' {
  if (stressPercentage <= 5) return 'excellent'
  if (stressPercentage <= 15) return 'good'
  if (stressPercentage <= 30) return 'warning'
  return 'critical'
}