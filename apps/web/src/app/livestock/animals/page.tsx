import { useRouter } from 'next/navigation'
import { getAuthenticatedUser } from '../../../lib/auth/server'
import { DashboardLayout } from '../../../components/layout/dashboard-layout'
import { AnimalRegistry } from '../../../components/livestock/animal-registry'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../../../components/ui/modern-card'
import { ClientFloatingButton } from '../../../components/ui/client-floating-button'
import { Plus, Users, Heart, TrendingUp } from 'lucide-react'
import { prisma } from '../../../lib/prisma'


export default function AnimalsPage() {
  const user = await getAuthenticatedUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's farms
  let userFarms: any[] = []
  try {
    userFarms = await prisma.farm.findMany({
      where: { ownerId: user.id },
      select: { id: true, name: true }
    })
  } catch (error: any) {
    console.error('Error fetching farms:', error)
  }

  // If no farms, redirect to farm creation
  if (userFarms.length === 0) {
    redirect('/farms/create?from=animals')
  }

  // Get animals for the user
  let animals: any[] = []
  let stats = { total: 0, healthy: 0, needingAttention: 0, growthRate: 0 }
  
  try {
    animals = await prisma.animal.findMany({
      where: { userId: user.id },
      include: {
        farm: { select: { name: true } },
        healthRecords: {
          take: 1,
          orderBy: { recordDate: 'desc' }
        },
        weightRecords: {
          take: 2,
          orderBy: { weighDate: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate stats
    stats.total = animals.length
    stats.healthy = animals.filter(animal => 
      animal.status === 'active' && 
      !animal.healthRecords.some((record: any) => 
        ['illness', 'injury'].includes(record.recordType) && 
        new Date(record.recordDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      )
    ).length
    stats.needingAttention = stats.total - stats.healthy

    // Calculate growth rate from weight records
    const animalsWithGrowth = animals.filter(animal => animal.weightRecords.length >= 2)
    if (animalsWithGrowth.length > 0) {
      const growthRates = animalsWithGrowth.map(animal => {
        const [latest, previous] = animal.weightRecords
        const weightGain = latest.weight - previous.weight
        const daysDiff = Math.abs(new Date(latest.weighDate).getTime() - new Date(previous.weighDate).getTime()) / (1000 * 60 * 60 * 24)
        return daysDiff > 0 ? (weightGain / daysDiff) * 30 : 0 // Monthly growth rate
      })
      stats.growthRate = growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length
    }
  } catch (error: any) {
    console.error('Error fetching animals:', error)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Animal Registry</h1>
            <p className="text-gray-600">Individual animal profiles and tracking</p>
          </div>
          <div className="flex gap-3">
            <ClientFloatingButton
              href="/livestock/animals/add"
              icon={<Plus className="h-5 w-5" />}
              label="Add Animal"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <ModernCard>
            <ModernCardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Animals</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>

          <ModernCard>
            <ModernCardContent className="p-6">
              <div className="flex items-center">
                <Heart className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Healthy</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.healthy}</p>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>

          <ModernCard>
            <ModernCardContent className="p-6">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <div className="h-4 w-4 bg-yellow-600 rounded-full"></div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Needing Attention</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.needingAttention}</p>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>

          <ModernCard>
            <ModernCardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-indigo-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Growth (lbs/month)</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.growthRate.toFixed(1)}</p>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>
        </div>

        {/* Animal Registry */}
        <ModernCard>
          <ModernCardHeader>
            <ModernCardTitle>Your Animals</ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent>
            <AnimalRegistry animals={animals} farms={userFarms} />
          </ModernCardContent>
        </ModernCard>
      </div>
    </DashboardLayout>
  )
}