import { redirect } from 'next/navigation'
import { getAuthenticatedUser } from '../../../../lib/auth/server'
import { DashboardLayout } from '../../../../components/layout/dashboard-layout'
import { AddAnimalForm } from '../../../../components/livestock/add-animal-form'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../../../../components/ui/modern-card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { prisma } from '../../../../lib/prisma'

export const dynamic = 'force-dynamic'

export default async function AddAnimalPage() {
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

  // Get existing animals for parent selection
  let parentAnimals: any[] = []
  try {
    parentAnimals = await prisma.animal.findMany({
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
        farm: {
          select: { name: true }
        }
      },
      orderBy: { tagNumber: 'asc' }
    })
  } catch (error: any) {
    console.error('Error fetching parent animals:', error)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link 
            href="/livestock/animals"
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Animals
          </Link>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Animal</h1>
          <p className="text-gray-600">Register a new animal in your herd</p>
        </div>

        {/* Add Animal Form */}
        <ModernCard>
          <ModernCardHeader>
            <ModernCardTitle>Animal Information</ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent>
            <AddAnimalForm 
              farms={userFarms} 
              parentAnimals={parentAnimals}
              userId={user.id}
            />
          </ModernCardContent>
        </ModernCard>
      </div>
    </DashboardLayout>
  )
}