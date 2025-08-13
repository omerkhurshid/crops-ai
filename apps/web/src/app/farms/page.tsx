import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '../../lib/auth/session'
import { Badge } from '../../components/ui/badge'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '../../components/ui/modern-card'
import { InlineFloatingButton } from '../../components/ui/floating-button'
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
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 relative z-10">
        <div className="px-8 lg:px-16 py-12 sm:px-0">
          {/* Header */}
          <div className="mb-12 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">My Farms</h1>
              <p className="text-2xl text-white/80 font-light">Manage and monitor your agricultural operations</p>
            </div>
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

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="polished-card card-sage rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <Sprout className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold mb-2">{userFarms.length}</div>
              <div className="text-xl font-medium mb-2">Total Farms</div>
              <div className="text-sm opacity-90">Active agricultural operations</div>
            </div>

            <div className="polished-card card-forest rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold mb-2">
                {userFarms.reduce((total: number, farm: any) => total + (farm.totalArea || 0), 0).toFixed(1)} ha
              </div>
              <div className="text-xl font-medium mb-2">Total Area</div>
              <div className="text-sm opacity-90">Hectares under management</div>
            </div>

            <div className="polished-card card-earth rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <BarChart className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold mb-2">
                {userFarms.reduce((total: number, farm: any) => total + (farm.fieldsCount || 0), 0)}
              </div>
              <div className="text-xl font-medium mb-2">Active Fields</div>
              <div className="text-sm opacity-90">Fields in production</div>
            </div>

            <div className="polished-card card-golden rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold mb-2">
                {new Set(userFarms.map((farm: any) => farm.region || 'Unknown').filter((r: string) => r !== 'Unknown')).size}
              </div>
              <div className="text-xl font-medium mb-2">Regions</div>
              <div className="text-sm opacity-90">Geographic coverage</div>
            </div>
          </div>

          {/* Farms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <div className="col-span-full text-center py-12">
                <ModernCard variant="soft" className="max-w-md mx-auto">
                  <ModernCardContent className="p-8">
                    <Sprout className="h-16 w-16 text-sage-300 mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2 text-sage-700">No farms yet</p>
                    <p className="text-sm mb-6 text-sage-600">Create your first farm to get started with agricultural monitoring</p>
                    <Link href="/farms/create">
                      <InlineFloatingButton
                        icon={<Plus className="h-4 w-4" />}
                        label="Create Your First Farm"
                        showLabel={true}
                        variant="primary"
                      />
                    </Link>
                  </ModernCardContent>
                </ModernCard>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <ModernCard variant="floating" className="overflow-hidden">
              <ModernCardHeader className="bg-gradient-to-r from-sage-50 to-cream-50">
                <ModernCardTitle className="text-sage-800">Quick Actions</ModernCardTitle>
                <ModernCardDescription>Common farm management tasks</ModernCardDescription>
              </ModernCardHeader>
              <ModernCardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      </main>
    </div>
  )
}