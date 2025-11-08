import { cn } from "../../lib/utils"
import { Loader2, RefreshCw, Activity, Brain, Satellite, Sprout } from "lucide-react"
import { ReactNode } from "react"
interface LoadingSpinnerProps {
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
}
export function LoadingSpinner({ className, size = "md" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8",
    xl: "h-12 w-12"
  }
  return (
    <Loader2 className={cn("animate-spin", sizeClasses[size], className)} />
  )
}
interface LoadingStateProps {
  message?: string
  type?: "default" | "dashboard" | "farm" | "health" | "ai" | "satellite"
  size?: "sm" | "md" | "lg"
  className?: string
}
export function LoadingState({ 
  message = "Loading...", 
  type = "default", 
  size = "md",
  className 
}: LoadingStateProps) {
  const icons = {
    default: RefreshCw,
    dashboard: Activity,
    farm: Sprout,
    health: Activity,
    ai: Brain,
    satellite: Satellite
  }
  const Icon = icons[type]
  const sizeClasses = {
    sm: {
      icon: "h-6 w-6",
      text: "text-sm",
      container: "py-8"
    },
    md: {
      icon: "h-8 w-8",
      text: "text-base",
      container: "py-12"
    },
    lg: {
      icon: "h-12 w-12",
      text: "text-lg",
      container: "py-16"
    }
  }
  const sizes = sizeClasses[size]
  return (
    <div className={cn("flex flex-col items-center justify-center", sizes.container, className)}>
      <div className="relative mb-4">
        <Icon className={cn("animate-spin text-sage-400", sizes.icon)} />
        <div className="absolute inset-0 rounded-full bg-sage-100 opacity-20 animate-pulse"></div>
      </div>
      <p className={cn("text-sage-600 font-medium", sizes.text)}>{message}</p>
    </div>
  )
}
interface LoadingCardProps {
  title?: string
  message?: string
  type?: "default" | "dashboard" | "farm" | "health" | "ai" | "satellite"
}
export function LoadingCard({ 
  title = "Loading", 
  message = "Please wait while we fetch your data...",
  type = "default" 
}: LoadingCardProps) {
  return (
    <div className="border border-sage-200 rounded-xl p-6 bg-white/80 backdrop-blur-sm">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <LoadingSpinner size="md" className="text-sage-500" />
          <h3 className="font-semibold text-sage-800">{title}</h3>
        </div>
        <div className="space-y-2">
          <div className="h-2 bg-sage-100 rounded-full animate-pulse"></div>
          <div className="h-2 bg-sage-100 rounded-full animate-pulse w-3/4"></div>
          <div className="h-2 bg-sage-100 rounded-full animate-pulse w-1/2"></div>
        </div>
        <p className="text-sm text-sage-600">{message}</p>
      </div>
    </div>
  )
}
interface LoadingButtonProps {
  loading: boolean
  children: React.ReactNode
  className?: string
  disabled?: boolean
  onClick?: () => void
}
export function LoadingButton({ 
  loading, 
  children, 
  className, 
  disabled,
  onClick 
}: LoadingButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
        "bg-sage-600 hover:bg-sage-700 text-white",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    >
      {loading && <LoadingSpinner size="sm" />}
      {children}
    </button>
  )
}
interface SkeletonProps {
  className?: string
}
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("animate-pulse rounded-md bg-sage-100", className)} />
  )
}
export function SkeletonCard() {
  return (
    <div className="border border-sage-200 rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  )
}
interface AsyncWrapperProps {
  error: string | null
  loading: boolean
  children: ReactNode
  onRetry?: () => void
  loadingComponent?: ReactNode
  emptyState?: ReactNode
  isEmpty?: boolean
}
export function AsyncWrapper({ 
  error, 
  loading, 
  children, 
  onRetry,
  loadingComponent,
  emptyState,
  isEmpty = false
}: AsyncWrapperProps) {
  if (loading) {
    return <>{loadingComponent || (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-sage-400" />
      </div>
    )}</>
  }
  if (error) {
    return <div className="py-8 text-center text-red-600">{error}</div>
  }
  if (isEmpty && emptyState) {
    return <>{emptyState}</>
  }
  return <>{children}</>
}