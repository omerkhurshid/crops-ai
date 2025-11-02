import { redirect } from 'next/navigation'
import { getAuthenticatedUser } from '../../../lib/auth/server'
import { DashboardLayout } from '../../../components/layout/dashboard-layout'
import { WeightTracking } from '../../../components/livestock/weight-tracking'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../../../components/ui/modern-card'
import { ClientFloatingButton } from '../../../components/ui/client-floating-button'
import { Plus, Weight, TrendingUp, Activity, Target } from 'lucide-react'
import { prisma } from '../../../lib/prisma'

export const dynamic = 'force-dynamic'

export default async function WeightPage() {
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
    redirect('/farms/create?from=weight')
  }

  // Get weight records for the user
  let weightRecords: any[] = []
  let stats = { 
    totalRecords: 0, 
    animalsTracked: 0, 
    avgGrowthRate: 0, 
    recentMeasurements: 0 
  }
  
  try {
    weightRecords = await prisma.weightRecord.findMany({
      where: { 
        animal: { userId: user.id }
      },
      include: {
        animal: {
          select: { 
            id: true, 
            tagNumber: true, 
            name: true, 
            species: true,
            birthDate: true,
            farm: { select: { name: true } }
          }
        }
      },
      orderBy: { weighDate: 'desc' }
    })

    // Calculate stats
    stats.totalRecords = weightRecords.length
    
    // Count unique animals with weight records
    const uniqueAnimals = new Set(weightRecords.map(record => record.animalId))
    stats.animalsTracked = uniqueAnimals.size

    // Calculate average growth rate
    const animalGrowthRates: number[] = []
    uniqueAnimals.forEach(animalId => {
      const animalRecords = weightRecords
        .filter(record => record.animalId === animalId)
        .sort((a, b) => new Date(a.weighDate).getTime() - new Date(b.weighDate).getTime())
      
      if (animalRecords.length >= 2) {
        const firstRecord = animalRecords[0]
        const lastRecord = animalRecords[animalRecords.length - 1]
        const weightChange = lastRecord.weight - firstRecord.weight
        const daysDiff = Math.abs(
          new Date(lastRecord.weighDate).getTime() - new Date(firstRecord.weighDate).getTime()
        ) / (1000 * 60 * 60 * 24)
        
        if (daysDiff > 0) {
          const growthRatePerDay = weightChange / daysDiff
          animalGrowthRates.push(growthRatePerDay * 30) // Monthly growth rate
        }
      }
    })

    if (animalGrowthRates.length > 0) {
      stats.avgGrowthRate = animalGrowthRates.reduce((sum, rate) => sum + rate, 0) / animalGrowthRates.length
    }

    // Count recent measurements (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    stats.recentMeasurements = weightRecords.filter(record => 
      new Date(record.weighDate) >= thirtyDaysAgo
    ).length
  } catch (error: any) {
    console.error('Error fetching weight records:', error)
  }

  // Get animals for weight tracking
  let animals: any[] = []
  try {
    animals = await prisma.animal.findMany({
      where: { 
        userId: user.id,
        status: 'active'
      },
      select: {
        id: true,
        tagNumber: true,
        name: true,
        species: true,
        birthDate: true,
        currentWeight: true,
        farm: {
          select: { id: true, name: true }
        }
      },
      orderBy: { tagNumber: 'asc' }
    })
  } catch (error: any) {
    console.error('Error fetching animals:', error)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Weight Tracking</h1>
            <p className="text-gray-600">Monitor growth and body condition of your livestock</p>
          </div>
          <div className="flex gap-3">
            <ClientFloatingButton
              href="/livestock/weight/add"
              icon={<Plus className="h-5 w-5" />}
              label="Record Weight"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <ModernCard>
            <ModernCardContent className="p-6">
              <div className="flex items-center">
                <Weight className="h-8 w-8 text-indigo-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Records</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalRecords}</p>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>

          <ModernCard>
            <ModernCardContent className="p-6">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Animals Tracked</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.animalsTracked}</p>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>

          <ModernCard>
            <ModernCardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Growth (lbs/month)</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.avgGrowthRate.toFixed(1)}</p>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>

          <ModernCard>
            <ModernCardContent className="p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Recent Measurements</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.recentMeasurements}</p>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>
        </div>

        {/* Weight Tracking */}
        <ModernCard>
          <ModernCardHeader>
            <ModernCardTitle>Weight Records</ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent>
            <WeightTracking 
              weightRecords={weightRecords} 
              farms={userFarms}
              animals={animals}
            />
          </ModernCardContent>
        </ModernCard>
      </div>
    </DashboardLayout>
  )
}