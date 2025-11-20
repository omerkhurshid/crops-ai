'use client'
import React from 'react'
import { 
  Leaf, 
  Database, 
  Wifi, 
  AlertCircle,
  Plus,
  RefreshCw,
  TrendingUp,
  MapPin,
  Calendar,
  DollarSign,
  Cloud,
  Sprout,
  Heart
} from 'lucide-react'
import { Button } from './button'
import { ModernCard, ModernCardContent } from './modern-card'
interface NoDataStateProps {
  type: 'farms' | 'fields' | 'crops' | 'tasks' | 'livestock' | 'financial' | 'weather' | 'analytics' | 'general'
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  isLoading?: boolean
  error?: string
  className?: string
}
const noDataConfig = {
  farms: {
    icon: MapPin,
    title: 'No farms added yet',
    description: 'Create your first farm to start monitoring your agricultural operations.',
    actionLabel: 'Add Farm'
  },
  fields: {
    icon: Leaf,
    title: 'No fields defined',
    description: 'Add fields to your farm to track crop health and monitor NDVI data.',
    actionLabel: 'Add Field'
  },
  crops: {
    icon: Sprout,
    title: 'No crops planted',
    description: 'Add crops to track growth stages, yields, and harvest dates.',
    actionLabel: 'Add Crop'
  },
  tasks: {
    icon: Calendar,
    title: 'No tasks scheduled',
    description: 'Create tasks to stay organized with farm activities and deadlines.',
    actionLabel: 'Add Task'
  },
  livestock: {
    icon: Heart,
    title: 'No livestock registered',
    description: 'Add livestock to monitor health, breeding, and production records.',
    actionLabel: 'Add Livestock'
  },
  financial: {
    icon: DollarSign,
    title: 'No financial data',
    description: 'Track income, expenses, and profitability for better farm management.',
    actionLabel: 'Add Transaction'
  },
  weather: {
    icon: Cloud,
    title: 'Weather data unavailable',
    description: 'Weather information is currently unavailable. Please try again later.',
    actionLabel: 'Retry'
  },
  analytics: {
    icon: TrendingUp,
    title: 'No analytics data',
    description: 'Analytics will appear once you have sufficient farm data.',
    actionLabel: 'Learn More'
  },
  general: {
    icon: Database,
    title: 'No data available',
    description: 'Data will appear here once you start using the system.',
    actionLabel: 'Get Started'
  }
}
export function NoDataState({ 
  type, 
  title, 
  description, 
  action, 
  isLoading = false,
  error,
  className = ''
}: NoDataStateProps) {
  const config = noDataConfig[type]
  const IconComponent = config.icon
  if (isLoading) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
        <RefreshCw className="h-8 w-8 animate-spin text-sage-400 mb-4" />
        <p className="text-[#555555]">Loading data...</p>
      </div>
    )
  }
  if (error) {
    return (
      <ModernCard className={`border-red-200 bg-red-50 ${className}`}>
        <ModernCardContent className="p-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Failed to load data
            </h3>
            <p className="text-red-600 mb-4 max-w-sm">
              {error}
            </p>
            {action && (
              <Button
                onClick={action.onClick}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                {action.label}
              </Button>
            )}
          </div>
        </ModernCardContent>
      </ModernCard>
    )
  }
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      <div className="w-20 h-20 bg-[#F8FAF8] rounded-full flex items-center justify-center mb-6">
        <IconComponent className="h-10 w-10 text-[#555555]" />
      </div>
      <h3 className="text-xl font-semibold text-[#1A1A1A] mb-2 text-center">
        {title || config.title}
      </h3>
      <p className="text-[#555555] mb-6 text-center max-w-md">
        {description || config.description}
      </p>
      {action && (
        <Button
          onClick={action.onClick}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {action.label}
        </Button>
      )}
    </div>
  )
}
// Specialized no-data states for common scenarios
export function NoFarmsState({ onAddFarm }: { onAddFarm?: () => void }) {
  return (
    <NoDataState
      type="farms"
      action={onAddFarm ? { label: 'Create Your First Farm', onClick: onAddFarm } : undefined}
    />
  )
}
export function NoFieldsState({ onAddField }: { onAddField?: () => void }) {
  return (
    <NoDataState
      type="fields"
      action={onAddField ? { label: 'Add Field', onClick: onAddField } : undefined}
    />
  )
}
export function NoCropsState({ onAddCrop }: { onAddCrop?: () => void }) {
  return (
    <NoDataState
      type="crops"
      action={onAddCrop ? { label: 'Plant First Crop', onClick: onAddCrop } : undefined}
    />
  )
}
export function NoTasksState({ onAddTask }: { onAddTask?: () => void }) {
  return (
    <NoDataState
      type="tasks"
      action={onAddTask ? { label: 'Create Task', onClick: onAddTask } : undefined}
    />
  )
}
export function NoLivestockState({ onAddLivestock }: { onAddLivestock?: () => void }) {
  return (
    <NoDataState
      type="livestock"
      action={onAddLivestock ? { label: 'Register Livestock', onClick: onAddLivestock } : undefined}
    />
  )
}
export function NoFinancialDataState({ onAddTransaction }: { onAddTransaction?: () => void }) {
  return (
    <NoDataState
      type="financial"
      action={onAddTransaction ? { label: 'Add Transaction', onClick: onAddTransaction } : undefined}
    />
  )
}
export function NoAnalyticsDataState() {
  return (
    <NoDataState
      type="analytics"
      description="Start adding farms, fields, and crops to see detailed analytics and insights."
    />
  )
}
// Data pending state for when data is being calculated/processed
export function DataPendingState({ 
  message = 'Processing data...', 
  className = '' 
}: { 
  message?: string
  className?: string 
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-8 ${className}`}>
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
        <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
      <p className="text-blue-600 font-medium">{message}</p>
      <p className="text-[#555555] text-sm mt-1">This may take a few moments</p>
    </div>
  )
}
// Connection error state for offline/network issues
export function ConnectionErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
        <Wifi className="h-8 w-8 text-orange-600" />
      </div>
      <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">
        Connection Problem
      </h3>
      <p className="text-[#555555] mb-4 text-center max-w-sm">
        Unable to connect to our servers. Please check your internet connection.
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Try Again
        </Button>
      )}
    </div>
  )
}