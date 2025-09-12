import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../lib/auth/session'
import { DashboardLayout } from '../../components/layout/dashboard-layout'
import { LivestockDashboard } from '../../components/livestock/livestock-dashboard'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '../../components/ui/modern-card'
import { InfoTooltip } from '../../components/ui/info-tooltip'
import { ClientFloatingButton } from '../../components/ui/client-floating-button'
import { Users, Plus, Stethoscope, Heart, Activity, TrendingUp } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function LivestockPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <DashboardLayout>
      {/* Floating Action Button */}
      <ClientFloatingButton
        icon={<Plus className="h-5 w-5" />}
        label="Add Animal"
        variant="primary"
      />
      
      {/* Animated Background with Floating Elements */}
      <div className="absolute top-20 left-20 p-6 bg-white/70 backdrop-blur-md rounded-3xl shadow-floating animate-float">
        <Users className="h-8 w-8 text-sage-600" />
      </div>
      <div className="absolute bottom-20 right-20 p-6 bg-white/70 backdrop-blur-md rounded-3xl shadow-floating animate-float" style={{ animationDelay: '2s' }}>
        <Heart className="h-8 w-8 text-sage-600" />
      </div>
      
      <main className="max-w-7xl mx-auto pt-8 pb-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-16">
          {/* Modern Header */}
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="p-4 bg-gradient-to-br from-sage-100 to-earth-100 rounded-2xl">
                <Users className="h-10 w-10 text-sage-700" />
              </div>
              <div>
                <h1 className="text-4xl md:text-6xl font-light text-sage-800 tracking-tight">
                  Livestock Management
                </h1>
                <div className="flex items-center justify-center gap-3 mt-2">
                  <p className="text-xl text-sage-600 font-light">
                    Monitor herd health and track animal performance
                  </p>
                  <InfoTooltip 
                    title="Livestock Module" 
                    description="Comprehensive livestock management system for tracking animal health, breeding, and performance metrics."
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
                  <Users className="h-6 w-6 text-blue-700" />
                </div>
                <InfoTooltip title="Total Animals" description="Complete count of all animals in your herd registry" />
              </div>
              <ModernCardTitle>Total Livestock</ModernCardTitle>
              <ModernCardDescription>
                Animals registered across all species
              </ModernCardDescription>
            </ModernCardHeader>
            <ModernCardContent>
              <div className="text-center py-4">
                <div className="text-3xl font-bold text-blue-600 mb-2">247</div>
                <div className="text-sm text-blue-600">animals registered</div>
              </div>
            </ModernCardContent>
          </ModernCard>

          <ModernCard variant="soft" className="group hover:shadow-soft transition-all duration-300">
            <ModernCardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-green-100 to-green-50 rounded-2xl">
                  <Heart className="h-6 w-6 text-green-700" />
                </div>
                <InfoTooltip title="Health Score" description="Average health rating across your entire herd" />
              </div>
              <ModernCardTitle>Health Score</ModernCardTitle>
              <ModernCardDescription>
                Overall herd health rating
              </ModernCardDescription>
            </ModernCardHeader>
            <ModernCardContent>
              <div className="text-center py-4">
                <div className="text-3xl font-bold text-green-600 mb-2">8.7/10</div>
                <div className="text-sm text-green-600">excellent condition</div>
              </div>
            </ModernCardContent>
          </ModernCard>

          <ModernCard variant="soft" className="group hover:shadow-soft transition-all duration-300">
            <ModernCardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-orange-100 to-orange-50 rounded-2xl">
                  <Stethoscope className="h-6 w-6 text-orange-700" />
                </div>
                <InfoTooltip title="Health Alerts" description="Animals requiring immediate medical attention or follow-up care" />
              </div>
              <ModernCardTitle>Health Alerts</ModernCardTitle>
              <ModernCardDescription>
                Animals needing attention
              </ModernCardDescription>
            </ModernCardHeader>
            <ModernCardContent>
              <div className="text-center py-4">
                <div className="text-3xl font-bold text-orange-600 mb-2">3</div>
                <div className="text-sm text-orange-600">require attention</div>
              </div>
            </ModernCardContent>
          </ModernCard>

          <ModernCard variant="soft" className="group hover:shadow-soft transition-all duration-300">
            <ModernCardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-50 rounded-2xl">
                  <TrendingUp className="h-6 w-6 text-purple-700" />
                </div>
                <InfoTooltip title="Performance" description="Average daily weight gain across growing animals" />
              </div>
              <ModernCardTitle>Avg Daily Gain</ModernCardTitle>
              <ModernCardDescription>
                Weight gain performance
              </ModernCardDescription>
            </ModernCardHeader>
            <ModernCardContent>
              <div className="text-center py-4">
                <div className="text-3xl font-bold text-purple-600 mb-2">2.3kg</div>
                <div className="text-sm text-purple-600">daily average</div>
              </div>
            </ModernCardContent>
          </ModernCard>
        </div>

        {/* Main Livestock Dashboard */}
        <ModernCard variant="floating">
          <ModernCardContent className="p-6">
            <LivestockDashboard farmId={user.id} />
          </ModernCardContent>
        </ModernCard>
      </main>
    </DashboardLayout>
  )
}