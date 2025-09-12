import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../lib/auth/session'
import { DashboardLayout } from '../../components/layout/dashboard-layout'
import { CropCalendar } from '../../components/crops/crop-calendar'
import { FarmerFriendlyCropView } from '../../components/crops/farmer-friendly-crop-view'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '../../components/ui/modern-card'
import { InfoTooltip } from '../../components/ui/info-tooltip'
import { ClientFloatingButton } from '../../components/ui/client-floating-button'
import { Sprout, Plus, Calendar, TrendingUp, MapPin, Scissors } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function CropsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <DashboardLayout>
      {/* Floating Action Button */}
      <ClientFloatingButton
        icon={<Plus className="h-5 w-5" />}
        label="Add Crop Plan"
        variant="primary"
      />
      
      {/* Animated Background with Floating Elements */}
      <div className="absolute top-20 left-20 p-6 bg-white/70 backdrop-blur-md rounded-3xl shadow-floating animate-float">
        <Sprout className="h-8 w-8 text-sage-600" />
      </div>
      <div className="absolute bottom-20 right-20 p-6 bg-white/70 backdrop-blur-md rounded-3xl shadow-floating animate-float" style={{ animationDelay: '2s' }}>
        <Calendar className="h-8 w-8 text-sage-600" />
      </div>
      
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

        {/* Main Farmer-Friendly View */}
        <FarmerFriendlyCropView farmId={user.id} />

        {/* Advanced Planning Tools - Secondary */}
        <div className="mt-12">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Planning Tools</h2>
            <p className="text-gray-600">Advanced features for detailed crop management</p>
          </div>
          
          {/* Tabbed Interface for Advanced Features */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6 py-4">
                <button className="text-sage-600 border-b-2 border-sage-600 pb-2 font-medium">
                  📅 Timeline View
                </button>
                <button className="text-gray-500 hover:text-gray-700 pb-2">
                  🔄 Rotation Planner
                </button>
                <button className="text-gray-500 hover:text-gray-700 pb-2">
                  📊 Yield Forecasts
                </button>
              </nav>
            </div>
            
            <div className="p-6">
              <CropCalendar farmId={user.id} />
            </div>
          </div>
        </div>
      </main>
    </DashboardLayout>
  )
}