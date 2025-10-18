import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../../lib/auth/session'
import { DashboardLayout } from '../../../components/layout/dashboard-layout'
import { BreedingManagement } from '../../../components/livestock/breeding-management'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../../../components/ui/modern-card'
import { ClientFloatingButton } from '../../../components/ui/client-floating-button'
import { Plus, Heart, Calendar, Users, TrendingUp } from 'lucide-react'
import { prisma } from '../../../lib/prisma'

export const dynamic = 'force-dynamic'

export default async function BreedingPage() {
  const user = await getCurrentUser()

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
    redirect('/farms/create?from=breeding')
  }

  // Get breeding records for the user
  let breedingRecords: any[] = []
  let stats = { 
    total: 0, 
    activePregnancies: 0, 
    upcomingBirths: 0, 
    successRate: 0 
  }
  
  try {
    breedingRecords = await prisma.breedingRecord.findMany({
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
            farm: { select: { name: true } }
          }
        },
        mate: {
          select: { 
            id: true, 
            tagNumber: true, 
            name: true 
          }
        }
      },
      orderBy: { breedingDate: 'desc' }
    })

    // Calculate stats
    stats.total = breedingRecords.length
    stats.activePregnancies = breedingRecords.filter(record => 
      record.status === 'pregnant' || record.status === 'breeding'
    ).length
    
    // Upcoming births in next 30 days
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    stats.upcomingBirths = breedingRecords.filter(record => 
      record.expectedDueDate && 
      new Date(record.expectedDueDate) <= thirtyDaysFromNow &&
      new Date(record.expectedDueDate) >= new Date() &&
      !record.actualBirthDate
    ).length

    // Success rate (births vs breeding attempts)
    const completedBreedings = breedingRecords.filter(record => 
      record.status === 'completed' || record.actualBirthDate
    )
    const successfulBreedings = breedingRecords.filter(record => 
      record.actualBirthDate && (record.numberOfOffspring || 0) > 0
    )
    stats.successRate = completedBreedings.length > 0 
      ? (successfulBreedings.length / completedBreedings.length) * 100 
      : 0
  } catch (error: any) {
    console.error('Error fetching breeding records:', error)
  }

  // Get eligible animals for breeding
  let breedingAnimals: any[] = []
  try {
    breedingAnimals = await prisma.animal.findMany({
      where: { 
        userId: user.id,
        status: 'active'
      },
      select: {
        id: true,
        tagNumber: true,
        name: true,
        species: true,
        gender: true,
        birthDate: true,
        farm: {
          select: { name: true }
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
            <h1 className="text-3xl font-bold text-gray-900">Breeding Management</h1>
            <p className="text-gray-600">Track breeding cycles and reproductive performance</p>
          </div>
          <div className="flex gap-3">
            <ClientFloatingButton
              href="/livestock/breeding/add"
              icon={<Plus className="h-5 w-5" />}
              label="Add Breeding Record"
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
                  <p className="text-sm font-medium text-gray-600">Total Breeding Records</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>

          <ModernCard>
            <ModernCardContent className="p-6">
              <div className="flex items-center">
                <Heart className="h-8 w-8 text-pink-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Pregnancies</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activePregnancies}</p>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>

          <ModernCard>
            <ModernCardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Upcoming Births (30d)</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.upcomingBirths}</p>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>

          <ModernCard>
            <ModernCardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.successRate.toFixed(1)}%</p>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>
        </div>

        {/* Breeding Management */}
        <ModernCard>
          <ModernCardHeader>
            <ModernCardTitle>Breeding Records</ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent>
            <BreedingManagement 
              breedingRecords={breedingRecords} 
              farms={userFarms}
              animals={breedingAnimals}
            />
          </ModernCardContent>
        </ModernCard>
      </div>
    </DashboardLayout>
  )
}