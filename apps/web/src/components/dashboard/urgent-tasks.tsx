'use client'
import React from 'react'
import { cn, ensureArray } from '../../lib/utils'
import { 
  AlertTriangle, 
  Clock, 
  ArrowRight, 
  Droplets,
  Bug,
  Thermometer,
  DollarSign,
  ChevronRight
} from 'lucide-react'
interface UrgentTask {
  id: string
  title: string
  field?: string
  urgency: 'critical' | 'high'
  timeframe: string
  impact?: string
  category: 'water' | 'pest' | 'weather' | 'financial' | 'health'
}
interface UrgentTasksProps {
  tasks: UrgentTask[]
  onTaskClick?: (taskId: string) => void
  className?: string
}
const categoryConfig = {
  water: {
    icon: Droplets,
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  pest: {
    icon: Bug,
    color: 'bg-orange-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  },
  weather: {
    icon: Thermometer,
    color: 'bg-purple-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  financial: {
    icon: DollarSign,
    color: 'bg-green-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  health: {
    icon: AlertTriangle,
    color: 'bg-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  }
}
export function UrgentTasks({ tasks, onTaskClick, className }: UrgentTasksProps) {
  if (tasks.length === 0) {
    return null
  }
  return (
    <div className={cn('space-y-4', className)}>
      {/* Urgent Alert Header */}
      <div className="bg-red-600 text-white p-4 rounded-xl shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg animate-pulse">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Urgent Actions Required</h2>
              <p className="text-red-100 text-sm">
                {tasks.length} critical task{tasks.length > 1 ? 's' : ''} need immediate attention
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm text-red-100">
            <Clock className="h-4 w-4" />
            <span>Act within next 24 hours</span>
          </div>
        </div>
      </div>
      {/* Urgent Task Cards */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4">
        {ensureArray(tasks).slice(0, 2).map((task) => {
          const config = categoryConfig[task.category as keyof typeof categoryConfig] || categoryConfig.health
          const Icon = config.icon
          return (
            <button
              key={task.id}
              onClick={() => onTaskClick?.(task.id)}
              className={cn(
                'relative overflow-hidden rounded-xl p-6 text-left',
                'transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]',
                'shadow-md hover:shadow-xl touch-manipulation',
                'border-2',
                config.bgColor,
                config.borderColor,
                'group'
              )}
            >
              {/* Background Pattern */}
              <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-10">
                <Icon className="h-32 w-32" />
              </div>
              {/* Content */}
              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className={cn('p-3 rounded-xl', config.color)}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  {task.urgency === 'critical' && (
                    <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full animate-pulse">
                      CRITICAL
                    </span>
                  )}
                </div>
                {/* Task Details */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                  {task.title}
                </h3>
                {task.field && (
                  <p className="text-gray-700 font-medium mb-3">
                    📍 {task.field}
                  </p>
                )}
                {/* Timeframe and Impact */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>Complete within: <strong>{task.timeframe}</strong></span>
                  </div>
                  {task.impact && (
                    <div className="text-sm font-medium text-gray-700">
                      💰 Potential impact: {task.impact}
                    </div>
                  )}
                </div>
                {/* Action Button */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900 group-hover:text-gray-700">
                    Start Task
                  </span>
                  <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-all">
                    <ArrowRight className="h-5 w-5 text-gray-700" />
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
      {/* More Tasks Indicator */}
      {tasks.length > 2 && (
        <button className="w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border-2 border-gray-200 transition-colors">
          <div className="flex items-center justify-center gap-2 text-gray-700">
            <span className="font-medium">View {tasks.length - 2} more urgent tasks</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </button>
      )}
    </div>
  )
}
// Compact version for mobile
export function UrgentTasksMobile({ tasks, onTaskClick, className }: UrgentTasksProps) {
  if (tasks.length === 0) return null
  return (
    <div className={cn('space-y-3', className)}>
      <div className="bg-red-600 text-white p-3 rounded-lg">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 animate-pulse" />
          <span className="font-bold text-sm">
            {tasks.length} Urgent Task{tasks.length > 1 ? 's' : ''}
          </span>
        </div>
      </div>
      {ensureArray(tasks).slice(0, 2).map((task) => {
        const config = categoryConfig[task.category as keyof typeof categoryConfig] || categoryConfig.health
        const Icon = config.icon
        return (
          <button
            key={task.id}
            onClick={() => onTaskClick?.(task.id)}
            className={cn(
              'w-full p-4 rounded-lg text-left',
              'border-2 active:scale-[0.98] transition-transform',
              config.bgColor,
              config.borderColor
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn('p-2 rounded-lg', config.color)}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-sm leading-tight">
                  {task.title}
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  {task.timeframe} • {task.field}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </div>
          </button>
        )
      })}
    </div>
  )
}