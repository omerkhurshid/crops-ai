import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../lib/auth/session'
import { DashboardLayout } from '../../components/layout/dashboard-layout'
import { LivestockDashboard } from '../../components/livestock/livestock-dashboard'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '../../components/ui/modern-card'
import { InfoTooltip } from '../../components/ui/info-tooltip'
import { ClientFloatingButton } from '../../components/ui/client-floating-button'
import { Users, Plus, Stethoscope, Heart, Activity, TrendingUp } from 'lucide-react'
import { prisma } from '../../lib/prisma'

export const dynamic = 'force-dynamic'

export default async function LivestockPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  // Get real livestock data from database
  const livestockEvents = await prisma.livestockEvent.findMany({
    where: {
      farm: {
        ownerId: user.id
      }
    },
    include: {
      farm: {
        select: {
          name: true
        }
      }
    }
  })

  // Calculate real statistics from livestockEvent data
  const totalAnimals = livestockEvents.reduce((sum, event) => sum + event.animalCount, 0)
  const healthEvents = livestockEvents.filter(event => 
    event.eventType?.toLowerCase().includes('health') || 
    event.eventType?.toLowerCase().includes('vaccination') ||
    event.eventType?.toLowerCase().includes('treatment')
  )
  const healthAlerts = healthEvents.filter(event => 
    event.notes?.toLowerCase().includes('alert') || 
    event.notes?.toLowerCase().includes('sick') ||
    event.notes?.toLowerCase().includes('urgent')
  ).length
  
  // Calculate health score based on recent events
  const recentHealthEvents = healthEvents.filter(event => {
    const eventDate = new Date(event.eventDate)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return eventDate >= thirtyDaysAgo
  })
  
  const healthScore = totalAnimals > 0 ? 
    Math.max(1, 10 - (healthAlerts / totalAnimals) * 2) : 0
  
  // Calculate average daily gain from weight/growth related events
  const weightEvents = livestockEvents.filter(event => 
    event.eventType?.toLowerCase().includes('weight') ||
    event.eventType?.toLowerCase().includes('growth') ||
    event.eventType?.toLowerCase().includes('gain')
  )
  const avgDailyGain = weightEvents.length > 0 ? 
    weightEvents.reduce((sum, event) => {
      const weight = parseFloat(event.notes?.match(/(\d+\.?\d*)/)?.[1] || '0')
      return sum + (isNaN(weight) ? 0 : weight)
    }, 0) / weightEvents.length : 0

  return (
    <DashboardLayout>
      {/* Floating Action Button */}
      <ClientFloatingButton
        icon={<Plus className="h-5 w-5" />}
        label="Add Animal"
        variant="primary"
      />
      
      
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
                <div className="text-3xl font-bold text-blue-600 mb-2">{totalAnimals || 0}</div>
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
                <div className="text-3xl font-bold text-green-600 mb-2">{totalAnimals > 0 ? `${healthScore.toFixed(1)}/10` : '--'}</div>
                <div className="text-sm text-green-600">{totalAnimals > 0 ? (healthScore >= 8 ? 'excellent condition' : healthScore >= 6 ? 'good condition' : 'needs attention') : 'no data'}</div>
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
                <div className="text-3xl font-bold text-orange-600 mb-2">{healthAlerts || 0}</div>
                <div className="text-sm text-orange-600">{healthAlerts === 1 ? 'requires attention' : 'require attention'}</div>
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
                <div className="text-3xl font-bold text-purple-600 mb-2">{avgDailyGain > 0 ? `${avgDailyGain.toFixed(1)}kg` : '--'}</div>
                <div className="text-sm text-purple-600">daily average</div>
              </div>
            </ModernCardContent>
          </ModernCard>
        </div>

        {/* Main Livestock Dashboard */}
        <ModernCard variant="floating">
          <ModernCardContent className="p-6">
            {livestockEvents.length > 0 ? (
              <LivestockDashboard farmId={livestockEvents[0].farmId} />
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Livestock Data</h3>
                <p className="text-gray-600 mb-6">Start by adding your first livestock event to track your animals.</p>
                <button className="bg-sage-600 text-white px-4 py-2 rounded-lg hover:bg-sage-700">
                  Add Livestock Event
                </button>
              </div>
            )}
          </ModernCardContent>
        </ModernCard>
      </main>
    </DashboardLayout>
  )
}