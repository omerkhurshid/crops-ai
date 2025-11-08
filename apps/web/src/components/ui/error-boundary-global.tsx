'use client'
import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from './button'
import { ModernCard, ModernCardContent } from './modern-card'
interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}
interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}
export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Global error boundary caught error:', error, errorInfo)
    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // Log to monitoring service
      this.logErrorToService(error, errorInfo)
    }
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
    this.setState({
      error,
      errorInfo
    })
  }
  logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // Send to logging service
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'SSR',
      url: typeof window !== 'undefined' ? window.location.href : 'SSR'
    }
    // Log to API endpoint
    fetch('/api/logs/error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorData)
    }).catch(err => {
      console.error('Failed to log error to service:', err)
    })
  }
  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.reload()
  }
  handleGoHome = () => {
    window.location.href = '/'
  }
  render() {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return <>{this.props.fallback}</>
      }
      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <ModernCard className="max-w-lg w-full">
            <ModernCardContent className="p-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                  <AlertTriangle className="w-10 h-10 text-red-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Oops! Something went wrong
                </h1>
                <p className="text-gray-600 mb-8">
                  We're sorry for the inconvenience. The application encountered an unexpected error.
                </p>
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="w-full mb-6 text-left">
                    <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                      Error Details (Development Only)
                    </summary>
                    <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto">
                      <code>{this.state.error.toString()}</code>
                      {this.state.errorInfo && (
                        <>
                          {'\n\n'}
                          <code>{this.state.errorInfo.componentStack}</code>
                        </>
                      )}
                    </pre>
                  </details>
                )}
                <div className="flex gap-4">
                  <Button
                    onClick={this.handleReset}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </Button>
                  <Button
                    onClick={this.handleGoHome}
                    className="flex items-center gap-2"
                  >
                    <Home className="w-4 h-4" />
                    Go to Home
                  </Button>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>
        </div>
      )
    }
    return this.props.children
  }
}
// Component-level error boundary with custom UI
interface ComponentErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  componentName?: string
}
export function ComponentErrorBoundary({ 
  children, 
  fallback,
  componentName = 'This component' 
}: ComponentErrorBoundaryProps) {
  return (
    <GlobalErrorBoundary
      fallback={
        fallback || (
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-800">
                  {componentName} couldn't load
                </p>
                <p className="text-sm text-red-600 mt-1">
                  Please try refreshing the page or contact support if the issue persists.
                </p>
              </div>
            </div>
          </div>
        )
      }
    >
      {children}
    </GlobalErrorBoundary>
  )
}
// Higher-order component for easy error boundary wrapping
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<ComponentErrorBoundaryProps>
) {
  const WrappedComponent = (props: P) => (
    <ComponentErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ComponentErrorBoundary>
  )
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  return WrappedComponent
}