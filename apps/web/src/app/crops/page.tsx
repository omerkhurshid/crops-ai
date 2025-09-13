import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../lib/auth/session'
import { DashboardLayout } from '../../components/layout/dashboard-layout'
import { CropCalendar } from '../../components/crops/crop-calendar'
import { FarmerFriendlyCropView } from '../../components/crops/farmer-friendly-crop-view'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '../../components/ui/modern-card'
import { InfoTooltip } from '../../components/ui/info-tooltip'
import { ClientFloatingButton } from '../../components/ui/client-floating-button'
import { Sprout, Plus, Calendar, TrendingUp, MapPin, Scissors, Phone } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { FarmerFriendlyActionsList } from '../../components/crops/farmer-friendly-actions-list'
import { prisma } from '../../lib/prisma'

export const dynamic = 'force-dynamic'

export default async function CropsPage() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      redirect('/login')
    }

    // Get the user's first farm or create a default farm ID
    let farmId = user.id // fallback - use user ID if no farm found
    
    // Try to get farm data, but don't fail if database is unavailable
    try {
      // Add a timeout to prevent hanging
      const farmPromise = prisma.farm.findFirst({
        where: { ownerId: user.id },
        select: { id: true }
      })
      
      // Race condition: either get the farm or timeout after 3 seconds
      const farm = await Promise.race([
        farmPromise,
        new Promise<null>((_, reject) => 
          setTimeout(() => reject(new Error('Farm query timeout')), 3000)
        )
      ])
      
      if (farm) {
        farmId = farm.id
      }
    } catch (error) {
      console.warn('Database connection issue or timeout, using user ID as farm fallback:', error)
      // Continue with user.id as farmId - components will handle the fallback gracefully
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
          {/* Simplified Header - More Farmer-Friendly */}
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="text-6xl">🌱</div>
              <div>
                <h1 className="text-4xl md:text-5xl font-semibold text-sage-800 tracking-tight">
                  Your Crops
                </h1>
                <p className="text-lg text-sage-600 font-normal mt-2">
                  Track what's growing and what needs your attention
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid - Timeline Featured */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Timeline View - 2/3 width on desktop */}
          <div className="lg:col-span-2">
            <ModernCard variant="floating">
              <ModernCardContent className="p-6">
                <CropCalendar farmId={farmId} />
              </ModernCardContent>
            </ModernCard>
          </div>

          {/* Right Sidebar - What Needs Attention */}
          <div className="space-y-6">
            {/* Quick Actions Card */}
            <ModernCard variant="soft" className="border-l-4 border-l-orange-500">
              <ModernCardHeader>
                <ModernCardTitle className="flex items-center gap-2 text-lg">
                  📌 What Needs Your Attention
                </ModernCardTitle>
              </ModernCardHeader>
              <ModernCardContent>
                <FarmerFriendlyActionsList farmId={farmId} />
              </ModernCardContent>
            </ModernCard>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <ModernCard variant="soft" className="text-center p-4">
                <div className="text-2xl mb-1">🌱</div>
                <div className="text-xl font-bold text-green-600">3</div>
                <div className="text-xs text-gray-600">Growing</div>
              </ModernCard>
              
              <ModernCard variant="soft" className="text-center p-4">
                <div className="text-2xl mb-1">💰</div>
                <div className="text-xl font-bold text-purple-600">$23.3k</div>
                <div className="text-xs text-gray-600">Expected</div>
              </ModernCard>
            </div>

            {/* Mobile View Toggle */}
            <ModernCard variant="glass">
              <ModernCardContent className="p-4">
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() => window.scrollTo({ top: document.getElementById('mobile-view')?.offsetTop || 0, behavior: 'smooth' })}
                >
                  <Phone className="h-4 w-4" />
                  Mobile Card View
                </Button>
              </ModernCardContent>
            </ModernCard>
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
  } catch (error) {
    console.error('Error in CropsPage:', error)
    throw error
  }
}