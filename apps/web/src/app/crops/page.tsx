'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '../../components/layout/dashboard-layout'
import { CropCalendar } from '../../components/crops/crop-calendar'
import { ModernCard, ModernCardContent } from '../../components/ui/modern-card'
import { ClientFloatingButton } from '../../components/ui/client-floating-button'
import { Plus } from 'lucide-react'

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