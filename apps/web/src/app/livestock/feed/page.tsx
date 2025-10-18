import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../../lib/auth/session'
import { DashboardLayout } from '../../../components/layout/dashboard-layout'
import { FeedManagement } from '../../../components/livestock/feed-management'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../../../components/ui/modern-card'
import { ClientFloatingButton } from '../../../components/ui/client-floating-button'
import { Plus, Activity, DollarSign, TrendingUp, Wheat } from 'lucide-react'
import { prisma } from '../../../lib/prisma'

export const dynamic = 'force-dynamic'

export default async function FeedPage() {
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
    redirect('/farms/create?from=feed')
  }

  // Get feed records for the user
  let feedRecords: any[] = []
  let stats = { 
    totalRecords: 0, 
    totalCost30Days: 0, 
    avgCostPerDay: 0, 
    totalQuantity30Days: 0 
  }
  
  try {
    feedRecords = await prisma.feedRecord.findMany({
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
        }
      },
      orderBy: { feedDate: 'desc' }
    })

    // Calculate stats for last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const recentRecords = feedRecords.filter(record => 
      new Date(record.feedDate) >= thirtyDaysAgo
    )

    stats.totalRecords = feedRecords.length
    stats.totalCost30Days = recentRecords.reduce((sum, record) => sum + (record.totalCost || 0), 0)
    stats.avgCostPerDay = stats.totalCost30Days / 30
    stats.totalQuantity30Days = recentRecords.reduce((sum, record) => sum + record.quantity, 0)
  } catch (error: any) {
    console.error('Error fetching feed records:', error)
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Feed Management</h1>
            <p className="text-gray-600">Track feed costs and nutrition for your livestock</p>
          </div>
          <div className="flex gap-3">
            <ClientFloatingButton
              href="/livestock/feed/add"
              icon={<Plus className="h-5 w-5" />}
              label="Record Feeding"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <ModernCard>
            <ModernCardContent className="p-6">
              <div className="flex items-center">
                <Wheat className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Feed Records</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalRecords}</p>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>

          <ModernCard>
            <ModernCardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Feed Cost (30 days)</p>
                  <p className="text-2xl font-bold text-gray-900">${stats.totalCost30Days.toFixed(0)}</p>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>

          <ModernCard>
            <ModernCardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Daily Avg Cost</p>
                  <p className="text-2xl font-bold text-gray-900">${stats.avgCostPerDay.toFixed(0)}</p>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>

          <ModernCard>
            <ModernCardContent className="p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Quantity (30d)</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalQuantity30Days.toFixed(0)} lbs</p>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>
        </div>

        {/* Feed Management */}
        <ModernCard>
          <ModernCardHeader>
            <ModernCardTitle>Feed Records</ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent>
            <FeedManagement 
              feedRecords={feedRecords} 
              farms={userFarms}
              animals={animals}
            />
          </ModernCardContent>
        </ModernCard>
      </div>
    </DashboardLayout>
  )
}