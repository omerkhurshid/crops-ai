'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '../../components/layout/dashboard-layout'
import { CropCalendar } from '../../components/crops/crop-calendar'
import { FarmerFriendlyCropView } from '../../components/crops/farmer-friendly-crop-view'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '../../components/ui/modern-card'
import { InfoTooltip } from '../../components/ui/info-tooltip'
import { ClientFloatingButton } from '../../components/ui/client-floating-button'
import { Sprout, Plus, Calendar, TrendingUp, MapPin, Scissors, Phone } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { FarmerFriendlyActionsList } from '../../components/crops/farmer-friendly-actions-list'

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
        <div className="mb-12">
          {/* FieldKit Header */}
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="text-6xl">🌱</div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-fk-text tracking-tight">
                  Your Crops
                </h1>
                <p className="text-lg text-fk-text-muted font-normal mt-2">
                  Track what's growing and what needs your attention
                </p>
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

        {/* What Needs Attention Section - Bottom */}
        <div className="mt-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* What Needs Attention - Main Section */}
            <div className="lg:col-span-3">
              <ModernCard variant="soft" className="border-l-4 border-l-orange-500">
                <ModernCardHeader>
                  <ModernCardTitle className="flex items-center gap-2 text-xl">
                    📌 What Needs Your Attention
                  </ModernCardTitle>
                  <ModernCardDescription>
                    Key actions and reminders for your crops
                  </ModernCardDescription>
                </ModernCardHeader>
                <ModernCardContent>
                  <FarmerFriendlyActionsList farmId={farmId} />
                </ModernCardContent>
              </ModernCard>
            </div>

            {/* Quick Stats Sidebar */}
            <div className="space-y-4">
              <ModernCard variant="soft" className="text-center p-4">
                <div className="text-3xl mb-2">🌱</div>
                <div className="text-2xl font-bold text-green-600">3</div>
                <div className="text-sm text-gray-600">Growing Now</div>
              </ModernCard>
              
              <ModernCard variant="soft" className="text-center p-4">
                <div className="text-3xl mb-2">💰</div>
                <div className="text-2xl font-bold text-purple-600">$23.3k</div>
                <div className="text-sm text-gray-600">Expected Value</div>
              </ModernCard>

              <ModernCard variant="glass" className="text-center p-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() => window.scrollTo({ top: document.getElementById('mobile-view')?.offsetTop || 0, behavior: 'smooth' })}
                >
                  <Phone className="h-4 w-4" />
                  Mobile View
                </Button>
              </ModernCard>
            </div>
          </div>
        </div>

        {/* Mobile-Friendly Card View - Below the fold */}
        <div id="mobile-view" className="mt-12">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Mobile View</h2>
            <p className="text-gray-600">Simplified cards for easy field access</p>
          </div>
          <FarmerFriendlyCropView farmId={farmId} />
        </div>
      </main>
    </DashboardLayout>
  )
}