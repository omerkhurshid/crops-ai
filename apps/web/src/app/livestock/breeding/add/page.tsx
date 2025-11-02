import { redirect } from 'next/navigation'
import { getAuthenticatedUser } from '../../../../lib/auth/server'
import { DashboardLayout } from '../../../../components/layout/dashboard-layout'
import { AddBreedingForm } from '../../../../components/livestock/add-breeding-form'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../../../../components/ui/modern-card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { prisma } from '../../../../lib/prisma'

export const dynamic = 'force-dynamic'

export default async function AddBreedingPage() {
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
    redirect('/farms/create?from=breeding')
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
        <div className="flex items-center gap-4">
          <Link 
            href="/livestock/breeding"
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Breeding Management
          </Link>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Breeding Record</h1>
          <p className="text-gray-600">Record a new breeding event or pregnancy</p>
        </div>

        {/* Add Breeding Form */}
        <ModernCard>
          <ModernCardHeader>
            <ModernCardTitle>Breeding Information</ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent>
            <AddBreedingForm 
              farms={userFarms} 
              animals={breedingAnimals}
              userId={user.id}
            />
          </ModernCardContent>
        </ModernCard>
      </div>
    </DashboardLayout>
  )
}