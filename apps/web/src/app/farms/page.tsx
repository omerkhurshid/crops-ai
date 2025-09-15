import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '../../lib/auth/session'
import { Badge } from '../../components/ui/badge'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '../../components/ui/modern-card'
import { InlineFloatingButton } from '../../components/ui/floating-button'
import { NoFarmsEmptyState, EmptyStateCard } from '../../components/ui/empty-states'
import { Sprout, MapPin, BarChart, Plus, Activity } from 'lucide-react'
import { DashboardLayout } from '../../components/layout/dashboard-layout'
import { ExpandableFarmRow } from '../../components/farms/expandable-farm-row'
import { prisma } from '../../lib/prisma'
// import { FarmFieldsMap } from '../../components/farm/farm-fields-map' // Temporarily disabled

export const dynamic = 'force-dynamic'

async function getUserFarms(userId: string) {
  try {
    const farms = await prisma.farm.findMany({
      where: { ownerId: userId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        fields: {
          select: {
            id: true,
            name: true,
            area: true
          }
        },
        _count: {
          select: {
            fields: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })
    
    return farms.map(farm => ({
      id: farm.id,
      name: farm.name,
      totalArea: farm.totalArea,
      latitude: farm.latitude,
      longitude: farm.longitude,
      address: farm.address,
      region: farm.region,
      country: farm.country,
      location: farm.location,
      fieldsCount: farm._count.fields,
      fields: farm.fields,
      createdAt: farm.createdAt,
      updatedAt: farm.updatedAt,
      owner: farm.owner
    }))
  } catch (error) {
    console.error('Error fetching user farms:', error)
    return []
  }
}

export default async function FarmsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const userFarms = await getUserFarms(user.id)

  return (
    <DashboardLayout>
      
      <div className="max-w-7xl mx-auto pt-8 pb-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-16">
          {/* Page Header - Consistent with other pages */}
          <div className="mb-8">
            <h1 className="text-4xl font-light text-sage-800 mb-2">My Farms</h1>
            <p className="text-lg text-sage-600 mb-6">
              View and manage all your farm locations
            </p>
            
            <Link href="/farms/create-unified">
              <button className="bg-sage-600 hover:bg-sage-700 text-white px-6 py-2 rounded-lg flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Farm
              </button>
            </Link>
          </div>
        
          {/* Stats Cards - Mobile Optimized (Removed Regions) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12 lg:mb-16">
            <div className="polished-card card-sage rounded-xl lg:rounded-2xl p-4 sm:p-6 text-white">
              <div className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">{userFarms.length}</div>
              <div className="text-base sm:text-xl font-medium mb-1 sm:mb-2">Total Farms</div>
              <div className="text-xs sm:text-sm opacity-90 hidden sm:block">Farm locations</div>
            </div>

            <div className="polished-card card-forest rounded-xl lg:rounded-2xl p-4 sm:p-6 text-white">
              <div className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">
                {userFarms.reduce((total: number, farm: any) => total + (farm.totalArea || 0), 0).toFixed(1)} ha
              </div>
              <div className="text-base sm:text-xl font-medium mb-1 sm:mb-2">Total Area</div>
              <div className="text-xs sm:text-sm opacity-90 hidden sm:block">Hectares farmed</div>
            </div>

            <div className="polished-card card-earth rounded-xl lg:rounded-2xl p-4 sm:p-6 text-white">
              <div className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">
                {userFarms.reduce((total: number, farm: any) => total + (farm.fieldsCount || 0), 0)}
              </div>
              <div className="text-base sm:text-xl font-medium mb-1 sm:mb-2">Active Fields</div>
              <div className="text-xs sm:text-sm opacity-90 hidden sm:block">Fields created</div>
            </div>
          </div>


          {/* Modern Farms Table */}
          <ModernCard variant="floating" className="overflow-hidden">
            <ModernCardHeader className="bg-gradient-to-r from-sage-50 to-cream-50 border-b border-sage-200/30">
              <ModernCardTitle className="text-sage-800">Your Farms</ModernCardTitle>
              <ModernCardDescription>
                Manage and monitor your agricultural operations
              </ModernCardDescription>
            </ModernCardHeader>
            <ModernCardContent className="p-0">
              {userFarms.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-sage-50/50 border-b border-sage-200/30">
                      <tr>
                        <th className="text-left p-4 text-sm font-semibold text-sage-700">Farm Name</th>
                        <th className="text-left p-4 text-sm font-semibold text-sage-700">Location</th>
                        <th className="text-left p-4 text-sm font-semibold text-sage-700">Area</th>
                        <th className="text-left p-4 text-sm font-semibold text-sage-700">Fields</th>
                        <th className="text-left p-4 text-sm font-semibold text-sage-700">Health Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sage-200/30">
                      {userFarms.map((farm: any) => (
                        <ExpandableFarmRow 
                          key={farm.id} 
                          farm={farm}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8">
                  <EmptyStateCard>
                    <NoFarmsEmptyState />
                  </EmptyStateCard>
                </div>
              )}
            </ModernCardContent>
          </ModernCard>

          {/* Quick Actions */}
          <ModernCard variant="floating" className="overflow-hidden">
            <ModernCardHeader className="bg-gradient-to-r from-sage-50 to-cream-50">
              <ModernCardTitle className="text-sage-800">Quick Actions</ModernCardTitle>
              <ModernCardDescription>Common farm management tasks</ModernCardDescription>
            </ModernCardHeader>
            <ModernCardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link href="/weather">
                  <div className="polished-card card-moss rounded-xl p-4 text-white hover:scale-105 transition-all duration-300 cursor-pointer">
                    <div className="font-medium mb-2">Weather Monitoring</div>
                    <div className="text-sm opacity-90">Check weather conditions for all farms</div>
                  </div>
                </Link>
                
                <Link href="/crop-health">
                  <div className="polished-card card-clay rounded-xl p-4 text-white hover:scale-105 transition-all duration-300 cursor-pointer">
                    <div className="font-medium mb-2">Satellite Analysis</div>
                    <div className="text-sm opacity-90">View NDVI and crop health data</div>
                  </div>
                </Link>
                
                <Link href="/reports">
                  <div className="polished-card card-wheat rounded-xl p-4 text-white hover:scale-105 transition-all duration-300 cursor-pointer">
                    <div className="font-medium mb-2">Yield Predictions</div>
                    <div className="text-sm opacity-90">Generate ML-powered yield forecasts</div>
                  </div>
                </Link>
              </div>
            </ModernCardContent>
          </ModernCard>
        </div>
      </div>
    </DashboardLayout>
  )
}