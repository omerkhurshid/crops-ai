/**
 * Offline Page
 * Displayed when the user is offline and the requested page is not cached
 */

import { Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { ColorCombinations } from '../../lib/design-system/color-standards'

export default function OfflinePage() {
  const handleRefresh = () => {
    window.location.reload()
  }

  const handleRetryConnection = async () => {
    if ('serviceWorker' in navigator) {
      try {
        // Try to sync any pending data
        const registration = await navigator.serviceWorker.ready
        if ('sync' in registration) {
          await registration.sync.register('background-sync')
        }
      } catch (error) {
        console.error('Failed to trigger background sync:', error)
      }
    }
    
    // Attempt to reload
    handleRefresh()
  }

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Offline Icon */}
        <div className="mb-8">
          <div className="relative inline-flex">
            <WifiOff className="h-24 w-24 text-fk-text-muted mx-auto" />
            <div className="absolute -bottom-2 -right-2 bg-fk-danger rounded-full p-2">
              <div className="w-3 h-3 bg-white rounded-full" />
            </div>
          </div>
        </div>

        {/* Title and Description */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-fk-text mb-4">
            You're Offline
          </h1>
          <p className="text-fk-text-muted text-lg leading-relaxed">
            No internet connection detected. Some features may not be available, 
            but you can still view your cached farm data.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button 
            onClick={handleRetryConnection}
            className={`w-full ${ColorCombinations.primaryButton}`}
            size="lg"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Try Again
          </Button>

          <Button 
            onClick={() => window.history.back()}
            variant="outline"
            className={`w-full ${ColorCombinations.secondaryButton}`}
            size="lg"
          >
            Go Back
          </Button>
        </div>

        {/* Offline Features */}
        <div className={`mt-12 p-6 rounded-lg ${ColorCombinations.cardDefault}`}>
          <h3 className="text-lg font-semibold text-fk-text mb-4">
            Available Offline
          </h3>
          <ul className="text-sm text-fk-text-muted space-y-2 text-left">
            <li className="flex items-center">
              <div className="w-2 h-2 bg-fk-success rounded-full mr-3" />
              View cached farm data
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-fk-success rounded-full mr-3" />
              Access previous weather reports
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-fk-success rounded-full mr-3" />
              Review task lists
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-fk-warning rounded-full mr-3" />
              Create new entries (will sync later)
            </li>
          </ul>
        </div>

        {/* Connection Status */}
        <div className="mt-6">
          <div className="flex items-center justify-center text-sm text-fk-text-muted">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-fk-danger rounded-full mr-2 animate-pulse" />
              Connection Status: Offline
            </div>
          </div>
          <p className="text-xs text-fk-text-muted mt-2">
            Data will automatically sync when connection is restored
          </p>
        </div>
      </div>
    </div>
  )
}