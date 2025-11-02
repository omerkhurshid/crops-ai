import { redirect } from 'next/navigation'
import { getAuthenticatedUser } from '../../../../lib/auth/server'
import { DashboardLayout } from '../../../../components/layout/dashboard-layout'
import { AddFeedForm } from '../../../../components/livestock/add-feed-form'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../../../../components/ui/modern-card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { prisma } from '../../../../lib/prisma'

export const dynamic = 'force-dynamic'

export default async function AddFeedPage() {
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
    redirect('/farms/create?from=feed')
  }

  // Get animals for feeding
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
            href="/livestock/feed"
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Feed Management
          </Link>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">Record Feeding</h1>
          <p className="text-gray-600">Track feed costs and nutrition information</p>
        </div>

        {/* Add Feed Form */}
        <ModernCard>
          <ModernCardHeader>
            <ModernCardTitle>Feed Information</ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent>
            <AddFeedForm 
              farms={userFarms} 
              animals={animals}
              userId={user.id}
            />
          </ModernCardContent>
        </ModernCard>
      </div>
    </DashboardLayout>
  )
}