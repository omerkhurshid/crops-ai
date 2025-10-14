'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '../../components/layout/dashboard-layout'
import { CropCalendar } from '../../components/crops/crop-calendar'
import { ModernCard, ModernCardContent } from '../../components/ui/modern-card'
import { ClientFloatingButton } from '../../components/ui/client-floating-button'
import { Plus, Sprout } from 'lucide-react'

export default function CropsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [farmId, setFarmId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    // Set initial farmId - use user ID as fallback
    const initialFarmId = session.user?.id || 'default-farm'
    setFarmId(initialFarmId)

    // Try to fetch actual farm data in the background
    const fetchFarmData = async () => {
      try {
        const response = await fetch('/api/farms')
        if (response.ok) {
          const farms = await response.json()
          if (farms && farms.length > 0) {
            setFarmId(farms[0].id)
          }
        }
      } catch (error) {
        console.warn('Could not fetch farm data, using fallback ID')
      } finally {
        setIsLoading(false)
      }
    }

    fetchFarmData()
  }, [session, status, router])

  if (status === 'loading' || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="ml-4 text-gray-600">Loading crops...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!session) {
    return null // Will redirect
  }

  return (
    <DashboardLayout>
      {/* Floating Action Button */}
      <ClientFloatingButton
        icon={<Plus className="h-5 w-5" />}
        label="Add Crop Plan"
        variant="primary"
      />
      
      
      <main className="max-w-7xl mx-auto pt-8 pb-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-8">
          {/* Page Header - Consistent with other pages */}
          <h1 className="text-4xl font-light text-sage-800 mb-2">Crop Planning</h1>
          <p className="text-lg text-sage-600 mb-6">
            Plan your plantings and track crop progress throughout the season
          </p>
          
          {/* Getting Started Guide */}
          <div className="bg-gradient-to-r from-sage-50 to-earth-50 rounded-xl p-4 mb-6 border border-sage-200">
            <h3 className="font-semibold text-sage-800 mb-2 flex items-center gap-2">
              <Sprout className="h-5 w-5 text-sage-600" />
              New to Crop Planning?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-sage-700">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-sage-200 flex items-center justify-center text-xs font-bold text-sage-800 flex-shrink-0 mt-0.5">1</div>
                <div>
                  <p className="font-medium">Choose Your Crops</p>
                  <p className="text-sage-600">Select what you want to grow based on your region and soil</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-sage-200 flex items-center justify-center text-xs font-bold text-sage-800 flex-shrink-0 mt-0.5">2</div>
                <div>
                  <p className="font-medium">Plan Timing</p>
                  <p className="text-sage-600">Set planting and harvest dates for optimal yields</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-sage-200 flex items-center justify-center text-xs font-bold text-sage-800 flex-shrink-0 mt-0.5">3</div>
                <div>
                  <p className="font-medium">Track Progress</p>
                  <p className="text-sage-600">Monitor growth stages and get AI recommendations</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Timeline View - Full Width */}
        <div className="space-y-6">
          <ModernCard variant="floating">
            <ModernCardContent className="p-6">
              <CropCalendar farmId={farmId} />
            </ModernCardContent>
          </ModernCard>
        </div>

      </main>
    </DashboardLayout>
  )
}