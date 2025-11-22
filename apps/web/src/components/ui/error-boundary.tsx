'use client'
import { Component, ReactNode } from 'react'
import { AlertCircle, RefreshCw, Home, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}
interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }
  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo)
  }
  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      return <ErrorFallback error={this.state.error} />
    }
    return this.props.children
  }
}
interface ErrorFallbackProps {
  error?: Error
  retry?: () => void
}
export function ErrorFallback({ error, retry }: ErrorFallbackProps) {
  const handleRetry = () => {
    if (retry) {
      retry()
    } else {
      window.location.reload()
    }
  }
  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div className="text-center max-w-md mx-auto">
        <div className="p-4 bg-red-50 rounded-full w-fit mx-auto mb-6">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Something went wrong
        </h2>
        <p className="text-[#555555] mb-6 leading-relaxed">
          We encountered an unexpected error while processing your request. 
          This has been logged and our team will investigate.
        </p>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm font-mono text-red-800">
              {error.message}
            </p>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 px-4 py-2 bg-[#7A8F78] hover:bg-[#5E6F5A] text-white rounded-lg font-medium transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
          <Link 
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 border border-[#DDE4D8] hover:bg-[#F8FAF8] text-[#555555] rounded-lg font-medium transition-colors"
          >
            <Home className="h-4 w-4" />
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
interface ErrorStateProps {
  title?: string
  message?: string
  action?: {
    label: string
    onClick: () => void
  }
  showRetry?: boolean
  onRetry?: () => void
}
export function ErrorState({ 
  title = "Unable to load data", 
  message = "We encountered an error while fetching your information. Please try again.",
  action,
  showRetry = true,
  onRetry
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="p-3 bg-red-50 rounded-full mb-4">
        <AlertCircle className="h-6 w-6 text-red-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
        {title}
      </h3>
      <p className="text-[#555555] text-center mb-6 max-w-md leading-relaxed">
        {message}
      </p>
      <div className="flex gap-3">
        {showRetry && onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 bg-[#7A8F78] hover:bg-[#5E6F5A] text-white rounded-lg font-medium transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        )}
        {action && (
          <button
            onClick={action.onClick}
            className="px-4 py-2 border border-[#DDE4D8] hover:bg-[#F8FAF8] text-[#555555] rounded-lg font-medium transition-colors"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  )
}
interface AsyncErrorProps {
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
}: AsyncErrorProps) {
  if (loading) {
    return loadingComponent || (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-sage-400" />
      </div>
    )
  }
  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />
  }
  if (isEmpty && emptyState) {
    return emptyState
  }
  return <>{children}</>
}