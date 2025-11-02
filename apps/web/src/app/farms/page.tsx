import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getAuthenticatedUser } from '../../lib/auth/server'
import { Badge } from '../../components/ui/badge'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription, MetricCard } from '../../components/ui/modern-card'
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
  const user = await getAuthenticatedUser()

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
            
            <Link href="/farms/create">
              <button className="bg-sage-600 hover:bg-sage-700 text-white px-6 py-2 rounded-lg flex items-center gap-2">
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
            <ModernCardHeader className="bg-gradient-to-r from-sage-50 to-cream-50 border-b border-sage-200/30">
              <ModernCardTitle className="text-sage-800">Your Farms</ModernCardTitle>
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
                      <div className="p-4 border border-sage-200 rounded-lg hover:shadow-md transition-shadow bg-white">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-sage-800">{farm.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {farm.fieldsCount || 0} fields
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          <MapPin className="h-4 w-4 inline mr-1" />
                          {farm.location || 'Location not set'}
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">
                            {farm.totalArea?.toFixed(1) || '0'} ha
                          </span>
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-green-700 text-xs">Healthy</span>
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