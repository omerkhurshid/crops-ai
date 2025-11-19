'use client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from '../../lib/auth-unified'
import { useEffect, useState } from 'react'
import { Badge } from '../../components/ui/badge'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription, MetricCard } from '../../components/ui/modern-card'
import { InlineFloatingButton } from '../../components/ui/floating-button'
import { NoFarmsEmptyState, EmptyStateCard } from '../../components/ui/empty-states'
import { Sprout, MapPin, BarChart, Plus, Activity } from 'lucide-react'
import { DashboardLayout } from '../../components/layout/dashboard-layout'
import { ExpandableFarmRow } from '../../components/farms/expandable-farm-row'
// import { FarmFieldsMap } from '../../components/farm/farm-fields-map' // Temporarily disabled

export default function FarmsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userFarms, setUserFarms] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [componentError, setComponentError] = useState<string | null>(null)

  // Add error boundary logic
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Farms page error:', event.error || event.message)
      setComponentError(event.error?.message || event.message || 'Unknown error')
    }
    
    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }

    async function fetchFarms() {
      try {
        setError(null)
        console.log('Fetching farms...')
        const response = await fetch('/api/farms', {
          credentials: 'include'
        })
        
        console.log('Farms response status:', response.status)
        
        if (response.ok) {
          const farmsData = await response.json()
          console.log('Farms data received:', farmsData)
          
          // Handle both array response and object with farms property
          const farms = Array.isArray(farmsData) ? farmsData : (farmsData.farms || [])
          setUserFarms(farms)
        } else if (response.status === 401) {
          setError('Authentication failed. Please log in again.')
          router.push('/login')
        } else {
          const errorText = await response.text()
          console.error('Farms API error:', response.status, errorText)
          setError(`Failed to load farms: ${response.status}`)
        }
      } catch (error) {
        console.error('Error fetching farms:', error)
        setError(`Failed to load farms: ${error instanceof Error ? error.message : 'Unknown error'}`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFarms()
  }, [session, status, router])

  if (status === 'loading' || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7A8F78]"></div>
          <p className="ml-4 text-[#555555]">Loading farms...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!session) {
    return null
  }

  if (componentError) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto pt-8 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-[#1A1A1A] mb-4">Component Error</h1>
            <p className="text-[#555555] mb-6">{componentError}</p>
            <button 
              onClick={() => {
                setComponentError(null)
                window.location.reload()
              }}
              className="bg-[#7A8F78] hover:bg-[#5E6F5A] text-white px-6 py-2 rounded-lg"
            >
              Try again
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto pt-8 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-[#1A1A1A] mb-4">Something went wrong</h1>
            <p className="text-[#555555] mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-[#7A8F78] hover:bg-[#5E6F5A] text-white px-6 py-2 rounded-lg"
            >
              Try again
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto pt-8 pb-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-16">
          {/* Page Header - Consistent with other pages */}
          <div className="mb-8">
            <h1 className="text-4xl font-light text-[#7A8F78] mb-2">My Farms</h1>
            <p className="text-lg text-[#555555] mb-6">
              View and manage all your farm locations
            </p>
            <Link href="/farms/create-unified">
              <button className="bg-[#7A8F78] hover:bg-[#5E6F5A] text-white px-6 py-2 rounded-lg flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Farm
              </button>
            </Link>
          </div>

          {/* Stats Cards - Mobile Optimized (Removed Regions) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12 lg:mb-16">
            <MetricCard
              title="Total Farms"
              value={userFarms.length.toString()}
              description="Farm locations"
              icon={<Sprout className="h-6 w-6" />}
              variant="soft"
            />
            <MetricCard
              title="Total Area"
              value={`${userFarms.reduce((total: number, farm: any) => total + (farm.totalArea || 0), 0).toFixed(1)} ha`}
              description="Hectares farmed"
              icon={<MapPin className="h-6 w-6" />}
              variant="glass"
            />
            <MetricCard
              title="Active Fields"
              value={userFarms.reduce((total: number, farm: any) => total + (farm.fieldsCount || 0), 0).toString()}
              description="Fields created"
              icon={<Activity className="h-6 w-6" />}
              variant="glow"
            />
          </div>

          {/* Modern Farms Table */}
          <ModernCard variant="floating" className="overflow-hidden">
            <ModernCardHeader className="bg-gradient-to-r from-[#F8FAF8] to-[#FAFAF7] border-b border-[#E6E6E6]/30">
              <ModernCardTitle className="text-[#1A1A1A]">Your Farms</ModernCardTitle>
              <ModernCardDescription>
                Manage and monitor your agricultural operations
              </ModernCardDescription>
            </ModernCardHeader>
            <ModernCardContent className="p-0">
              {userFarms.length > 0 ? (
                /* Mobile-First Card Layout */
                <div className="block md:hidden p-4 space-y-4">
                  {userFarms.map((farm: any) => (
                    <Link key={farm.id} href={`/farms/${farm.id}`}>
                      <div className="p-4 border border-[#E6E6E6] rounded-lg hover:shadow-md transition-shadow bg-white">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-[#1A1A1A]">{farm.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {farm.fieldsCount || 0} fields
                          </Badge>
                        </div>
                        <div className="text-sm text-[#555555] mb-2">
                          <MapPin className="h-4 w-4 inline mr-1" />
                          {farm.location || 'Location not set'}
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-[#555555]">
                            {farm.totalArea?.toFixed(1) || '0'} ha
                          </span>
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-[#7A8F78] text-xs">Healthy</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : null}

              {userFarms.length > 0 && (
                /* Desktop Table Layout */
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#F8FAF8]/50 border-b border-[#E6E6E6]/30">
                      <tr>
                        <th className="text-left p-4 text-sm font-semibold text-[#555555]">Farm Name</th>
                        <th className="text-left p-4 text-sm font-semibold text-[#555555]">Location</th>
                        <th className="text-left p-4 text-sm font-semibold text-[#555555]">Area</th>
                        <th className="text-left p-4 text-sm font-semibold text-[#555555]">Fields</th>
                        <th className="text-left p-4 text-sm font-semibold text-[#555555]">Health Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E6E6E6]/30">
                      {userFarms.map((farm: any) => {
                        try {
                          return (
                            <ExpandableFarmRow 
                              key={farm.id} 
                              farm={farm}
                            />
                          )
                        } catch (error) {
                          console.error('Error rendering farm row:', error, farm)
                          return (
                            <tr key={farm.id}>
                              <td colSpan={5} className="p-4 text-[#DC2626]">
                                Error displaying farm: {farm.name}
                              </td>
                            </tr>
                          )
                        }
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {userFarms.length === 0 && (
                <div className="p-8">
                  <EmptyStateCard>
                    <NoFarmsEmptyState />
                  </EmptyStateCard>
                </div>
              )}
            </ModernCardContent>
          </ModernCard>
        </div>
      </div>
    </DashboardLayout>
  )
}