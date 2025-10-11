'use client'

import dynamic from 'next/dynamic'
import { ComponentType, ReactElement } from 'react'
import { LoadingStates } from '../ui/loading-states'

// Loading component with proper styling
const MapLoading = () => (
  <div className="w-full h-[400px] flex items-center justify-center bg-gray-50 rounded-lg">
    <LoadingStates type="spinner" message="Loading map..." />
  </div>
)

// Lazy-loaded Google Maps components
export const LazyGoogleMap = dynamic(
  () => import('../farm/visual-farm-map').then(mod => mod.VisualFarmMap as any),
  { 
    loading: MapLoading,
    ssr: false // Disable SSR for maps
  }
) as ComponentType<any>

export const LazyEnhancedFarmMap = dynamic(
  () => import('../farm/enhanced-farm-map').then(mod => mod.EnhancedFarmMap as any),
  { 
    loading: MapLoading,
    ssr: false
  }
) as ComponentType<any>

export const LazyFarmFieldsMap = dynamic(
  () => import('../farm/farm-fields-map').then(mod => mod.FarmFieldsMap as any),
  { 
    loading: MapLoading,
    ssr: false
  }
) as ComponentType<any>

// Lazy-loaded heavy dashboard components
export const LazyFarmerDashboard = dynamic(
  () => import('../dashboard/farmer-dashboard'),
  { 
    loading: () => <LoadingStates type="card" count={4} />,
  }
)

export const LazyOptimizedFarmerDashboard = dynamic(
  () => import('../dashboard/optimized-farmer-dashboard'),
  { 
    loading: () => <LoadingStates type="card" count={4} />,
  }
)

// Lazy-loaded charts and analytics
export const LazyWeatherAnalytics = dynamic(
  () => import('../weather/weather-analytics').then(mod => mod.WeatherAnalytics as any),
  { 
    loading: () => <LoadingStates type="chart" />,
  }
) as ComponentType<any>

export const LazyFinancialDashboard = dynamic(
  () => import('../financial/financial-dashboard').then(mod => mod.FinancialDashboard as any),
  { 
    loading: () => <LoadingStates type="chart" />,
  }
) as ComponentType<any>

// Lazy-loaded satellite components
export const LazySatelliteViewer = dynamic(
  () => import('../satellite/satellite-viewer').then(mod => mod.SatelliteViewer as any),
  { 
    loading: () => <LoadingStates type="skeleton" className="h-96" />,
    ssr: false
  }
) as ComponentType<any>

export const LazyFieldHealthMonitor = dynamic(
  () => import('../satellite/field-health-monitor').then(mod => mod.FieldHealthMonitor as any),
  { 
    loading: () => <LoadingStates type="skeleton" className="h-96" />,
    ssr: false
  }
) as ComponentType<any>

// Lazy-loaded reports
export const LazyCropHealthReport = dynamic(
  () => import('../reports/crop-health-report').then(mod => mod.CropHealthReport as any),
  { 
    loading: () => <LoadingStates type="skeleton" className="h-64" />,
  }
) as ComponentType<any>

export const LazyFinancialReport = dynamic(
  () => import('../reports/financial-report').then(mod => mod.FinancialReport as any),
  { 
    loading: () => <LoadingStates type="skeleton" className="h-64" />,
  }
) as ComponentType<any>

// Lazy-loaded heavy forms
export const LazyUnifiedFarmCreator = dynamic(
  () => import('../farm/unified-farm-creator').then(mod => mod.UnifiedFarmCreator as any),
  { 
    loading: () => <LoadingStates type="form" />,
  }
) as ComponentType<any>

// Utility function to preload components
export const preloadComponent = (component: ComponentType<any>) => {
  if ('preload' in component && typeof component.preload === 'function') {
    component.preload()
  }
}