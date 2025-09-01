import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '../../lib/auth/session'
import { Badge } from '../../components/ui/badge'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '../../components/ui/modern-card'
import { InlineFloatingButton } from '../../components/ui/floating-button'
import { NoFarmsEmptyState, EmptyStateCard } from '../../components/ui/empty-states'
import { Sprout, MapPin, BarChart, Plus, Eye } from 'lucide-react'
import { Navbar } from '../../components/navigation/navbar'
import { prisma } from '../../lib/prisma'

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
        _count: {
          select: {
            fields: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
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
    <div className="minimal-page">
      <Navbar />
      
      {/* Animated Background with Floating Elements */}
      <div className="absolute top-20 left-20 p-6 bg-white/70 backdrop-blur-md rounded-3xl shadow-floating animate-float">
        <Sprout className="h-8 w-8 text-sage-600" />
      </div>
      <div className="absolute bottom-20 right-20 p-6 bg-white/70 backdrop-blur-md rounded-3xl shadow-floating animate-float" style={{ animationDelay: '2s' }}>
        <MapPin className="h-8 w-8 text-sage-600" />
      </div>
      
      <main className="max-w-7xl mx-auto pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-16">
          {/* Enhanced Header */}
          <div className="text-center max-w-4xl mx-auto mb-12">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-br from-sage-100 to-earth-100 rounded-2xl relative overflow-hidden">
                <Sprout className="h-10 w-10 text-sage-700 relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-br from-sage-200/30 to-earth-200/30 animate-pulse-soft"></div>
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-sage-800 mb-4 sm:mb-6 tracking-tight">
              My Farms
            </h1>
            <p className="text-lg sm:text-xl text-sage-600 font-light leading-relaxed mb-4 sm:mb-6">
              Manage and monitor your agricultural operations with AI-powered insights
            </p>
            
            <div className="flex justify-center">
              <Link href="/farms/create">
                <InlineFloatingButton
                  icon={<Plus className="h-5 w-5" />}
                  label="Add New Farm"
                  showLabel={true}
                  variant="primary"
                  size="lg"
                  className="min-w-[200px]"
                />
              </Link>
            </div>
          </div>
        
          {/* Stats Cards - Mobile Optimized */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-12 lg:mb-16">
            <div className="polished-card card-sage rounded-xl lg:rounded-2xl p-4 sm:p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <Sprout className="h-8 w-8 text-white" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">{userFarms.length}</div>
              <div className="text-base sm:text-xl font-medium mb-1 sm:mb-2">Total Farms</div>
              <div className="text-xs sm:text-sm opacity-90 hidden sm:block">Active operations</div>
            </div>

            <div className="polished-card card-forest rounded-xl lg:rounded-2xl p-4 sm:p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">
                {userFarms.reduce((total: number, farm: any) => total + (farm.totalArea || 0), 0).toFixed(1)} ha
              </div>
              <div className="text-base sm:text-xl font-medium mb-1 sm:mb-2">Total Area</div>
              <div className="text-xs sm:text-sm opacity-90 hidden sm:block">Under management</div>
            </div>

            <div className="polished-card card-earth rounded-xl lg:rounded-2xl p-4 sm:p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <BarChart className="h-8 w-8 text-white" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">
                {userFarms.reduce((total: number, farm: any) => total + (farm.fieldsCount || 0), 0)}
              </div>
              <div className="text-base sm:text-xl font-medium mb-1 sm:mb-2">Active Fields</div>
              <div className="text-xs sm:text-sm opacity-90 hidden sm:block">In production</div>
            </div>

            <div className="polished-card card-golden rounded-xl lg:rounded-2xl p-4 sm:p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">
                {new Set(userFarms.map((farm: any) => farm.region || 'Unknown').filter((r: string) => r !== 'Unknown')).size}
              </div>
              <div className="text-base sm:text-xl font-medium mb-1 sm:mb-2">Regions</div>
              <div className="text-xs sm:text-sm opacity-90 hidden sm:block">Geographic coverage</div>
            </div>
          </div>

          {/* Farms Grid - Mobile Optimized */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12 lg:mb-16">
            {userFarms.length > 0 ? userFarms.map((farm: any) => (
              <Link key={farm.id} href={`/farms/${farm.id}`}>
                <ModernCard variant="floating" className="hover:scale-105 transition-all duration-300 cursor-pointer group">
                  <ModernCardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <ModernCardTitle className="text-lg text-sage-800">{farm.name}</ModernCardTitle>
                        <ModernCardDescription>
                          {farm.address || `${farm.region || 'Unknown'}, ${farm.country || 'Unknown'}`}
                        </ModernCardDescription>
                      </div>
                      <Badge className="bg-sage-100 text-sage-700 border-sage-200">
                        Active
                      </Badge>
                    </div>
                  </ModernCardHeader>
                  <ModernCardContent>
                    <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-sage-600">Area:</span>
                      <span className="text-sm font-medium text-sage-800">{farm.totalArea?.toFixed(1) || 0} ha</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-sage-600">Fields:</span>
                      <span className="text-sm font-medium text-sage-800">{farm.fieldsCount || 0} fields</span>
                    </div>

                    {farm.fieldsTotalArea && (
                      <div className="flex justify-between">
                        <span className="text-sm text-sage-600">Field Area:</span>
                        <span className="text-sm font-medium text-sage-800">{farm.fieldsTotalArea} ha</span>
                      </div>
                    )}

                    <div className="pt-3 border-t border-sage-200/50">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-sage-500">
                          Created {new Date(farm.createdAt).toLocaleDateString()}
                        </span>
                        <InlineFloatingButton
                          icon={<Eye className="h-4 w-4" />}
                          label="View Details"
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                    </div>
                  </div>
                </ModernCardContent>
                </ModernCard>
              </Link>
            )) : (
              <div className="col-span-full">
                <EmptyStateCard className="max-w-3xl mx-auto">
                  <NoFarmsEmptyState />
                </EmptyStateCard>
              </div>
            )}
          </div>

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
      </main>
    </div>
  )
}