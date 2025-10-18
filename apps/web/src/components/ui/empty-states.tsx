'use client'

import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from './modern-card'
import { InlineFloatingButton } from './floating-button'
import Link from 'next/link'
import { 
  Sprout, MapPin, Activity, CloudRain, Brain, BarChart3, 
  DollarSign, FileText, Settings, Plus, ArrowRight,
  Target, Lightbulb, Users, Calendar, Satellite
} from 'lucide-react'

interface EmptyStateProps {
  title: string
  description: string
  icon: React.ReactNode
  action?: {
    label: string
    href?: string
    onClick?: () => void
    variant?: 'primary' | 'secondary' | 'ghost'
  }
  secondaryAction?: {
    label: string
    href?: string
    onClick?: () => void
  }
  suggestions?: string[]
  className?: string
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  secondaryAction,
  suggestions,
  className = ""
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}>
      <div className="relative mb-6">
        <div className="p-4 bg-sage-50 rounded-2xl">
          <div className="text-sage-400">
            {icon}
          </div>
        </div>
        <div className="absolute inset-0 bg-sage-100 rounded-2xl opacity-20 animate-pulse"></div>
      </div>
      
      <h3 className="text-xl font-semibold text-sage-800 mb-3">{title}</h3>
      <p className="text-sage-600 max-w-md mx-auto leading-relaxed mb-6">{description}</p>
      
      {suggestions && (
        <div className="mb-6">
          <p className="text-sm font-medium text-sage-700 mb-3">What you can do:</p>
          <ul className="text-sm text-sage-600 space-y-1 text-left">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className="w-1 h-1 bg-sage-400 rounded-full mt-2 flex-shrink-0"></div>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row gap-3">
        {action && (
          action.href ? (
            <Link href={action.href}>
              <InlineFloatingButton
                icon={<Plus className="h-4 w-4" />}
                label={action.label}
                variant={action.variant || 'primary'}
                size="md"
                showLabel={true}
              />
            </Link>
          ) : (
            <InlineFloatingButton
              icon={<Plus className="h-4 w-4" />}
              label={action.label}
              variant={action.variant || 'primary'}
              size="md"
              showLabel={true}
              onClick={action.onClick}
            />
          )
        )}
        
        {secondaryAction && (
          secondaryAction.href ? (
            <Link href={secondaryAction.href}>
              <InlineFloatingButton
                icon={<ArrowRight className="h-4 w-4" />}
                label={secondaryAction.label}
                variant="ghost"
                size="md"
                showLabel={true}
              />
            </Link>
          ) : (
            <InlineFloatingButton
              icon={<ArrowRight className="h-4 w-4" />}
              label={secondaryAction.label}
              variant="ghost"
              size="md"
              showLabel={true}
              onClick={secondaryAction.onClick}
            />
          )
        )}
      </div>
    </div>
  )
}

// Pre-configured empty states for common scenarios
export function NoFarmsEmptyState() {
  return (
    <EmptyState
      icon={<Sprout className="h-12 w-12" />}
      title="No farms yet"
      description="Create your first farm to start monitoring your agricultural operations with AI-powered insights and satellite data."
      action={{
        label: "Create Your First Farm",
        href: "/farms/create",
        variant: "primary"
      }}
      secondaryAction={{
        label: "Learn More",
        href: "/features"
      }}
      suggestions={[
        "Add your farm location and basic details",
        "Enable satellite monitoring for your fields",
        "Get weather alerts and crop health insights",
        "Access AI-powered farming recommendations"
      ]}
    />
  )
}

export function NoFieldsEmptyState({ farmId }: { farmId: string }) {
  return (
    <EmptyState
      icon={<MapPin className="h-12 w-12" />}
      title="No fields defined"
      description="Add fields to your farm to enable precision satellite monitoring, crop health analysis, and field-specific recommendations."
      action={{
        label: "Add Your First Field",
        href: `/farms/${farmId}/fields/create`,
        variant: "primary"
      }}
      secondaryAction={{
        label: "View Field Guide",
        href: "/help/fields"
      }}
      suggestions={[
        "Define field boundaries on the map",
        "Add crop types and planting information",
        "Enable satellite health monitoring",
        "Get field-specific weather alerts"
      ]}
    />
  )
}

export function NoHealthDataEmptyState() {
  return (
    <EmptyState
      icon={<Activity className="h-12 w-12" />}
      title="No health data available"
      description="Crop health monitoring requires defined fields with satellite coverage. Add fields to your farms to start receiving health insights."
      action={{
        label: "Add Fields",
        href: "/farms",
        variant: "primary"
      }}
      secondaryAction={{
        label: "Learn About Health Monitoring",
        href: "/features"
      }}
      suggestions={[
        "Add fields to existing farms",
        "Wait 2-3 days for initial satellite data",
        "Ensure fields are larger than 1 hectare",
        "Check that fields have clear boundaries"
      ]}
    />
  )
}

export function NoRecommendationsEmptyState() {
  return (
    <EmptyState
      icon={<Brain className="h-12 w-12" />}
      title="No recommendations available"
      description="AI recommendations require farm and field data to provide personalized insights. Set up your farms and fields to receive intelligent farming advice."
      action={{
        label: "Set Up Farm Data",
        href: "/farms",
        variant: "primary"
      }}
      secondaryAction={{
        label: "Explore AI Features",
        href: "/features"
      }}
      suggestions={[
        "Add farms with complete location details",
        "Define fields with crop types",
        "Allow time for AI model analysis",
        "Ensure weather data is available for your region"
      ]}
    />
  )
}

export function NoWeatherDataEmptyState() {
  return (
    <EmptyState
      icon={<CloudRain className="h-12 w-12" />}
      title="No weather data available"
      description="Weather monitoring requires farm locations to provide hyperlocal forecasts and agricultural alerts for your specific region."
      action={{
        label: "Add Farm Location",
        href: "/farms",
        variant: "primary"
      }}
      secondaryAction={{
        label: "View Weather Features",
        href: "/features"
      }}
      suggestions={[
        "Add farms with precise GPS coordinates",
        "Enable location services for better accuracy",
        "Check that your region is supported",
        "Wait a few minutes for data synchronization"
      ]}
    />
  )
}

export function NoFinancialDataEmptyState() {
  return (
    <EmptyState
      icon={<DollarSign className="h-12 w-12" />}
      title="No financial data recorded"
      description="Track your agricultural expenses, income, and profitability by adding financial transactions and connecting to your accounting systems."
      action={{
        label: "Add Transaction",
        href: "/financial",
        variant: "primary"
      }}
      secondaryAction={{
        label: "Learn About Financial Tracking",
        href: "/help/financial"
      }}
      suggestions={[
        "Record input costs (seeds, fertilizer, fuel)",
        "Track labor and equipment expenses",
        "Add harvest sales and income",
        "Set up automated data imports"
      ]}
    />
  )
}

export function NoReportsEmptyState() {
  return (
    <EmptyState
      icon={<FileText className="h-12 w-12" />}
      title="No reports generated"
      description="Generate comprehensive reports on farm performance, financial analysis, and crop health once you have operational data in the system."
      action={{
        label: "Generate First Report",
        href: "/reports",
        variant: "primary"
      }}
      secondaryAction={{
        label: "View Report Types",
        href: "/features"
      }}
      suggestions={[
        "Add farms and fields to enable reporting",
        "Record financial transactions",
        "Allow satellite data collection",
        "Wait for seasonal data accumulation"
      ]}
    />
  )
}

// Empty state card wrapper for consistent layouts
export function EmptyStateCard({ 
  children, 
  className = "",
  title,
  description 
}: { 
  children: React.ReactNode
  className?: string
  title?: string
  description?: string
}) {
  return (
    <ModernCard variant="soft" className={`${className}`}>
      {title && (
        <ModernCardHeader>
          <ModernCardTitle>{title}</ModernCardTitle>
          {description && <ModernCardDescription>{description}</ModernCardDescription>}
        </ModernCardHeader>
      )}
      <ModernCardContent className="p-0">
        {children}
      </ModernCardContent>
    </ModernCard>
  )
}