import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../lib/auth/session'
import { DashboardLayout } from '../../components/layout/dashboard-layout'
import { CropCalendar } from '../../components/crops/crop-calendar'
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
        <div className="mb-16">
          {/* Modern Header */}
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="p-4 bg-gradient-to-br from-sage-100 to-earth-100 rounded-2xl">
                <Sprout className="h-10 w-10 text-sage-700" />
              </div>
              <div>
                <h1 className="text-4xl md:text-6xl font-light text-sage-800 tracking-tight">
                  Crop Planning
                </h1>
                <div className="flex items-center justify-center gap-3 mt-2">
                  <p className="text-xl text-sage-600 font-light">
                    Plan, track and manage your crop rotations from seed to sale
                  </p>
                  <InfoTooltip 
                    title="Crop Calendar" 
                    description="Comprehensive crop planning system with Gantt timeline, yield estimates, and rotation management."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Overview */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <ModernCard variant="soft" className="group hover:shadow-soft transition-all duration-300">
            <ModernCardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl">
                  <Calendar className="h-6 w-6 text-blue-700" />
                </div>
                <InfoTooltip title="Active Plantings" description="Current crops in various growth stages across all fields" />
              </div>
              <ModernCardTitle>Active Plantings</ModernCardTitle>
              <ModernCardDescription>
                Crops currently growing or planned
              </ModernCardDescription>
            </ModernCardHeader>
            <ModernCardContent>
              <div className="text-center py-4">
                <div className="text-3xl font-bold text-blue-600 mb-2">8</div>
                <div className="text-sm text-blue-600">different varieties</div>
              </div>
            </ModernCardContent>
          </ModernCard>

          <ModernCard variant="soft" className="group hover:shadow-soft transition-all duration-300">
            <ModernCardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-green-100 to-green-50 rounded-2xl">
                  <Sprout className="h-6 w-6 text-green-700" />
                </div>
                <InfoTooltip title="Growing Crops" description="Actively growing crops between planting and harvest" />
              </div>
              <ModernCardTitle>Currently Growing</ModernCardTitle>
              <ModernCardDescription>
                Crops in active growth stage
              </ModernCardDescription>
            </ModernCardHeader>
            <ModernCardContent>
              <div className="text-center py-4">
                <div className="text-3xl font-bold text-green-600 mb-2">3</div>
                <div className="text-sm text-green-600">crops growing</div>
              </div>
            </ModernCardContent>
          </ModernCard>

          <ModernCard variant="soft" className="group hover:shadow-soft transition-all duration-300">
            <ModernCardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-2xl">
                  <Scissors className="h-6 w-6 text-yellow-700" />
                </div>
                <InfoTooltip title="Harvest Ready" description="Crops ready for harvesting or currently being harvested" />
              </div>
              <ModernCardTitle>Ready to Harvest</ModernCardTitle>
              <ModernCardDescription>
                Crops approaching harvest time
              </ModernCardDescription>
            </ModernCardHeader>
            <ModernCardContent>
              <div className="text-center py-4">
                <div className="text-3xl font-bold text-yellow-600 mb-2">1</div>
                <div className="text-sm text-yellow-600">ready now</div>
              </div>
            </ModernCardContent>
          </ModernCard>

          <ModernCard variant="soft" className="group hover:shadow-soft transition-all duration-300">
            <ModernCardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-50 rounded-2xl">
                  <TrendingUp className="h-6 w-6 text-purple-700" />
                </div>
                <InfoTooltip title="Estimated Yield" description="Total expected yield from all current plantings" />
              </div>
              <ModernCardTitle>Projected Yield</ModernCardTitle>
              <ModernCardDescription>
                Total estimated harvest
              </ModernCardDescription>
            </ModernCardHeader>
            <ModernCardContent>
              <div className="text-center py-4">
                <div className="text-3xl font-bold text-purple-600 mb-2">5,575</div>
                <div className="text-sm text-purple-600">mixed units</div>
              </div>
            </ModernCardContent>
          </ModernCard>
        </div>

        {/* Main Crop Calendar */}
        <ModernCard variant="floating">
          <ModernCardContent className="p-6">
            <CropCalendar farmId={user.id} />
          </ModernCardContent>
        </ModernCard>

        {/* Additional Planning Tools */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <ModernCard variant="glow">
            <ModernCardHeader>
              <ModernCardTitle className="text-sage-800 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Field Rotation Planning
              </ModernCardTitle>
              <ModernCardDescription>
                Optimize crop rotations for soil health and yield
              </ModernCardDescription>
            </ModernCardHeader>
            <ModernCardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-sage-50 rounded-lg">
                  <span className="text-sm font-medium">North Field - Corn → Soy rotation</span>
                  <span className="text-xs text-sage-600">Next: Spring 2025</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-sage-50 rounded-lg">
                  <span className="text-sm font-medium">South Field - Wheat → Fallow</span>
                  <span className="text-xs text-sage-600">Rest period: 6 months</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-sage-50 rounded-lg">
                  <span className="text-sm font-medium">East Field - Cover crop planted</span>
                  <span className="text-xs text-sage-600">Soil restoration</span>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>

          <ModernCard variant="soft">
            <ModernCardHeader>
              <ModernCardTitle className="text-sage-800 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Yield Forecasting
              </ModernCardTitle>
              <ModernCardDescription>
                Predictive analytics for harvest planning
              </ModernCardDescription>
            </ModernCardHeader>
            <ModernCardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Winter Wheat</span>
                    <span className="font-medium">1,500 bushels</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <span className="text-xs text-gray-600">85% confidence</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Cucumber Market</span>
                    <span className="font-medium">800 lbs</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <span className="text-xs text-gray-600">75% confidence</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Apple Orchard</span>
                    <span className="font-medium">950 lbs</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '90%' }}></div>
                  </div>
                  <span className="text-xs text-gray-600">90% confidence</span>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>
        </div>
      </main>
    </DashboardLayout>
  )
}