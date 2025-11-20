'use client'
import dynamic from 'next/dynamic'
import { ComponentType, ReactElement } from 'react'
import { Spinner, SkeletonText } from '../ui/loading-states'
// Loading components with proper styling
const MapLoading = () => (
  <div className="w-full h-[400px] flex items-center justify-center bg-[#FAFAF7] rounded-lg flex-col gap-3">
    <Spinner size="large" />
    <span className="text-sm text-[#555555]">Loading map...</span>
  </div>
)
const CardLoading = () => (
  <div className="space-y-6">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="p-6 bg-[#FAFAF7] rounded-lg animate-pulse">
        <div className="h-4 bg-[#F5F5F5] rounded w-1/4 mb-2"></div>
        <div className="h-6 bg-[#F5F5F5] rounded w-1/2"></div>
      </div>
    ))}
  </div>
)
const SkeletonLoading = ({ className = "h-64" }: { className?: string }) => (
  <div className={`bg-[#FAFAF7] rounded-lg animate-pulse ${className} flex items-center justify-center`}>
    <Spinner />
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
  () => import('../dashboard/farmer-dashboard').then(mod => ({ default: mod.FarmerDashboard })),
  { 
    loading: CardLoading,
  }
) as ComponentType<any>
export const LazyOptimizedFarmerDashboard = dynamic(
  () => import('../dashboard/farmer-dashboard-optimized').then(mod => ({ default: mod.FarmerDashboardOptimized })),
  { 
    loading: CardLoading,
  }
) as ComponentType<any>
// Lazy-loaded charts and analytics (only load if components exist)
export const LazyWeatherAnalytics = dynamic(
  () => Promise.resolve({ default: () => <SkeletonLoading /> }),
  { 
    loading: () => <SkeletonLoading />,
  }
) as ComponentType<any>
export const LazyFinancialDashboard = dynamic(
  () => Promise.resolve({ default: () => <SkeletonLoading /> }),
  { 
    loading: () => <SkeletonLoading />,
  }
) as ComponentType<any>
// Lazy-loaded satellite components (only load if components exist)
export const LazySatelliteViewer = dynamic(
  () => Promise.resolve({ default: () => <SkeletonLoading className="h-96" /> }),
  { 
    loading: () => <SkeletonLoading className="h-96" />,
    ssr: false
  }
) as ComponentType<any>
export const LazyFieldHealthMonitor = dynamic(
  () => Promise.resolve({ default: () => <SkeletonLoading className="h-96" /> }),
  { 
    loading: () => <SkeletonLoading className="h-96" />,
    ssr: false
  }
) as ComponentType<any>
// Lazy-loaded reports (only load if components exist)
export const LazyCropHealthReport = dynamic(
  () => Promise.resolve({ default: () => <SkeletonLoading className="h-64" /> }),
  { 
    loading: () => <SkeletonLoading className="h-64" />,
  }
) as ComponentType<any>
export const LazyFinancialReport = dynamic(
  () => Promise.resolve({ default: () => <SkeletonLoading className="h-64" /> }),
  { 
    loading: () => <SkeletonLoading className="h-64" />,
  }
) as ComponentType<any>
// Lazy-loaded heavy forms (only load if components exist)
export const LazyUnifiedFarmCreator = dynamic(
  () => Promise.resolve({ default: () => <SkeletonLoading /> }),
  { 
    loading: () => <SkeletonLoading />,
  }
) as ComponentType<any>
// Utility function to preload components
export const preloadComponent = (component: ComponentType<any>) => {
  if ('preload' in component && typeof component.preload === 'function') {
    component.preload()
  }
}