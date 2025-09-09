'use client'

import React from 'react'
import { cn } from '../../lib/utils'
import { ModernCard, ModernCardContent } from './modern-card'
import { TrafficLightStatus } from './traffic-light-status'
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ArrowRight,
  Droplets,
  Zap,
  Bug,
  Thermometer
} from 'lucide-react'

interface PriorityAction {
  id: string
  title: string
  description: string
  urgency: 'high' | 'medium' | 'low'
  category: 'watering' | 'nutrition' | 'pest' | 'weather' | 'general'
  timeframe: string
  status: 'pending' | 'in_progress' | 'completed'
  confidence: number
}

interface PriorityActionCardProps {
  action: PriorityAction
  onMarkComplete?: (actionId: string) => void
  onStartAction?: (actionId: string) => void
  className?: string
}

interface PriorityActionsListProps {
  actions: PriorityAction[]
  maxActions?: number
  onActionUpdate?: (actionId: string, status: 'pending' | 'in_progress' | 'completed') => void
  className?: string
}

const urgencyConfig = {
  high: {
    status: 'critical' as const,
    label: 'Urgent',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  medium: {
    status: 'warning' as const,
    label: 'Important',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  },
  low: {
    status: 'good' as const,
    label: 'When possible',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  }
}

const categoryIcons = {
  watering: Droplets,
  nutrition: Zap,
  pest: Bug,
  weather: Thermometer,
  general: CheckCircle2
}

const statusConfig = {
  pending: {
    icon: Clock,
    label: 'Not started',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100'
  },
  in_progress: {
    icon: ArrowRight,
    label: 'In progress',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  completed: {
    icon: CheckCircle2,
    label: 'Completed',
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  }
}

export function PriorityActionCard({
  action,
  onMarkComplete,
  onStartAction,
  className
}: PriorityActionCardProps) {
  const urgency = urgencyConfig[action.urgency]
  const CategoryIcon = categoryIcons[action.category]
  const statusInfo = statusConfig[action.status]
  const StatusIcon = statusInfo.icon

  const handleActionClick = () => {
    if (action.status === 'pending' && onStartAction) {
      onStartAction(action.id)
    } else if (action.status === 'in_progress' && onMarkComplete) {
      onMarkComplete(action.id)
    }
  }

  return (
    <ModernCard 
      variant="soft"
      className={cn(
        'group transition-all duration-300 hover:shadow-soft-lg touch-manipulation',
        urgency.bgColor,
        urgency.borderColor,
        'border-2',
        className
      )}
    >
      <ModernCardContent className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/70 rounded-xl">
              <CategoryIcon className="h-5 w-5 text-sage-700" />
            </div>
            <div>
              <TrafficLightStatus 
                status={urgency.status} 
                size="sm"
                showText={true}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-sage-600">
            <StatusIcon className={cn('h-4 w-4', statusInfo.color)} />
            <span className={statusInfo.color}>{statusInfo.label}</span>
          </div>
        </div>

        {/* Content */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-sage-800 mb-2">
            {action.title}
          </h3>
          <p className="text-sm text-sage-700 leading-relaxed mb-3">
            {action.description}
          </p>
          
          <div className="flex items-center justify-between text-xs text-sage-600">
            <span>Complete within: {action.timeframe}</span>
            <span>{action.confidence}% confidence</span>
          </div>
        </div>

        {/* Action Button */}
        {action.status !== 'completed' && (
          <button
            onClick={handleActionClick}
            className={cn(
              'w-full py-4 px-4 rounded-xl font-medium transition-all duration-200',
              'flex items-center justify-center gap-2 touch-manipulation',
              'min-h-[48px] text-base sm:text-sm sm:py-3 sm:min-h-[auto]',
              action.status === 'pending' 
                ? 'bg-sage-700 hover:bg-sage-800 active:bg-sage-900 text-white'
                : 'bg-white hover:bg-sage-50 active:bg-sage-100 text-sage-700 border border-sage-200'
            )}
          >
            {action.status === 'pending' ? (
              <>
                <ArrowRight className="h-4 w-4" />
                Start This Action
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Mark Complete
              </>
            )}
          </button>
        )}

        {action.status === 'completed' && (
          <div className="w-full py-3 px-4 rounded-xl bg-green-100 text-green-800 font-medium text-center">
            ✓ Action Completed
          </div>
        )}
      </ModernCardContent>
    </ModernCard>
  )
}

export function PriorityActionsList({
  actions,
  maxActions = 2,
  onActionUpdate,
  className
}: PriorityActionsListProps) {
  const prioritizedActions = actions
    .filter(action => action.status !== 'completed')
    .sort((a, b) => {
      const urgencyOrder = { high: 3, medium: 2, low: 1 }
      return urgencyOrder[b.urgency] - urgencyOrder[a.urgency]
    })
    .slice(0, maxActions)

  const handleStartAction = (actionId: string) => {
    if (onActionUpdate) {
      onActionUpdate(actionId, 'in_progress')
    }
  }

  const handleCompleteAction = (actionId: string) => {
    if (onActionUpdate) {
      onActionUpdate(actionId, 'completed')
    }
  }

  if (prioritizedActions.length === 0) {
    return (
      <ModernCard variant="soft" className={className}>
        <ModernCardContent className="p-8 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-sage-800 mb-2">
            All caught up!
          </h3>
          <p className="text-sage-600">
            No urgent actions needed right now. Keep monitoring your crops.
          </p>
        </ModernCardContent>
      </ModernCard>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {prioritizedActions.map((action) => (
        <PriorityActionCard
          key={action.id}
          action={action}
          onStartAction={handleStartAction}
          onMarkComplete={handleCompleteAction}
        />
      ))}
      
      {actions.length > maxActions && (
        <div className="text-center pt-4">
          <p className="text-sm text-sage-600">
            Showing top {maxActions} priority actions. 
            <button className="ml-1 text-sage-700 font-medium hover:text-sage-800">
              View all {actions.length} recommendations →
            </button>
          </p>
        </div>
      )}
    </div>
  )
}

// Helper function to create sample actions for testing
export function createSampleActions(): PriorityAction[] {
  return [
    {
      id: '1',
      title: 'Check soil moisture in North Field',
      description: 'Some areas showing signs of water stress. Check irrigation system and soil moisture levels.',
      urgency: 'high',
      category: 'watering',
      timeframe: '24 hours',
      status: 'pending',
      confidence: 85
    },
    {
      id: '2',
      title: 'Apply nitrogen fertilizer to South Field',
      description: 'Crops could benefit from additional nitrogen. Consider side-dress application.',
      urgency: 'medium',
      category: 'nutrition',
      timeframe: '3-5 days',
      status: 'pending',
      confidence: 78
    }
  ]
}