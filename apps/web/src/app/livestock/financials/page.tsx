import { redirect } from 'next/navigation'
import { getAuthenticatedUser } from '../../../lib/auth/server'
import { DashboardLayout } from '../../../components/layout/dashboard-layout'
import { LivestockFinancials } from '../../../components/livestock/livestock-financials'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../../../components/ui/modern-card'
import { DollarSign, TrendingUp, TrendingDown, Calculator, PieChart } from 'lucide-react'
import { prisma } from '../../../lib/prisma'

export const dynamic = 'force-dynamic'

export default async function LivestockFinancialsPage() {
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
    redirect('/farms/create?from=financials')
  }

  // Get comprehensive financial data
  let financialData = {
    totalInvestment: 0,
    totalValue: 0,
    profitLoss: 0,
    feedCosts30Days: 0,
    healthCosts30Days: 0,
    breedingCosts30Days: 0,
    revenueOpportunities: 0,
    animals: [] as any[],
    costBreakdown: {
      purchase: 0,
      feed: 0,
      health: 0,
      breeding: 0
    }
  }

  try {
    // Get all animals with financial data
    const animals = await prisma.animal.findMany({
      where: { userId: user.id },
      include: {
        farm: { select: { name: true } },
        healthRecords: true,
        feedRecords: true,
        breedingRecords: true
      }
    })

    // Calculate total investment and current value
    financialData.totalInvestment = animals.reduce((sum, animal) => {
      const purchasePrice = animal.purchasePrice || 0
      const healthCosts = animal.healthRecords.reduce((sum: number, record: any) => sum + (record.cost || 0), 0)
      const feedCosts = animal.feedRecords.reduce((sum: number, record: any) => sum + (record.totalCost || 0), 0)
      const breedingCosts = animal.breedingRecords.reduce((sum: number, record: any) => sum + (record.cost || 0), 0)
      
      return sum + purchasePrice + healthCosts + feedCosts + breedingCosts
    }, 0)

    financialData.totalValue = animals.reduce((sum, animal) => sum + (animal.currentValue || animal.purchasePrice || 0), 0)
    financialData.profitLoss = financialData.totalValue - financialData.totalInvestment

    // Calculate 30-day costs
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    financialData.feedCosts30Days = animals.reduce((sum, animal) => {
      return sum + animal.feedRecords
        .filter((record: any) => new Date(record.feedDate) >= thirtyDaysAgo)
        .reduce((sum: number, record: any) => sum + (record.totalCost || 0), 0)
    }, 0)

    financialData.healthCosts30Days = animals.reduce((sum, animal) => {
      return sum + animal.healthRecords
        .filter((record: any) => new Date(record.recordDate) >= thirtyDaysAgo)
        .reduce((sum: number, record: any) => sum + (record.cost || 0), 0)
    }, 0)

    financialData.breedingCosts30Days = animals.reduce((sum, animal) => {
      return sum + animal.breedingRecords
        .filter((record: any) => new Date(record.breedingDate) >= thirtyDaysAgo)
        .reduce((sum: number, record: any) => sum + (record.cost || 0), 0)
    }, 0)

    // Cost breakdown
    financialData.costBreakdown.purchase = animals.reduce((sum, animal) => sum + (animal.purchasePrice || 0), 0)
    financialData.costBreakdown.feed = animals.reduce((sum, animal) => {
      return sum + animal.feedRecords.reduce((sum: number, record: any) => sum + (record.totalCost || 0), 0)
    }, 0)
    financialData.costBreakdown.health = animals.reduce((sum, animal) => {
      return sum + animal.healthRecords.reduce((sum: number, record: any) => sum + (record.cost || 0), 0)
    }, 0)
    financialData.costBreakdown.breeding = animals.reduce((sum, animal) => {
      return sum + animal.breedingRecords.reduce((sum: number, record: any) => sum + (record.cost || 0), 0)
    }, 0)

    // Calculate revenue opportunities (animals ready for sale, breeding, etc.)
    financialData.revenueOpportunities = animals
      .filter(animal => animal.status === 'active')
      .reduce((sum, animal) => sum + (animal.currentValue || 0), 0)

    financialData.animals = animals.map(animal => ({
      ...animal,
      totalCosts: (animal.purchasePrice || 0) + 
        animal.healthRecords.reduce((sum: number, record: any) => sum + (record.cost || 0), 0) +
        animal.feedRecords.reduce((sum: number, record: any) => sum + (record.totalCost || 0), 0) +
        animal.breedingRecords.reduce((sum: number, record: any) => sum + (record.cost || 0), 0),
      profitLoss: (animal.currentValue || animal.purchasePrice || 0) - (
        (animal.purchasePrice || 0) + 
        animal.healthRecords.reduce((sum: number, record: any) => sum + (record.cost || 0), 0) +
        animal.feedRecords.reduce((sum: number, record: any) => sum + (record.totalCost || 0), 0) +
        animal.breedingRecords.reduce((sum: number, record: any) => sum + (record.cost || 0), 0)
      )
    }))
  } catch (error: any) {
    console.error('Error fetching financial data:', error)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Livestock Financials</h1>
            <p className="text-gray-600">Track costs, profits, and financial performance</p>
          </div>
        </div>

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <ModernCard>
            <ModernCardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Investment</p>
                  <p className="text-2xl font-bold text-gray-900">${financialData.totalInvestment.toLocaleString()}</p>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>

          <ModernCard>
            <ModernCardContent className="p-6">
              <div className="flex items-center">
                <Calculator className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Current Value</p>
                  <p className="text-2xl font-bold text-gray-900">${financialData.totalValue.toLocaleString()}</p>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>

          <ModernCard>
            <ModernCardContent className="p-6">
              <div className="flex items-center">
                {financialData.profitLoss >= 0 ? (
                  <TrendingUp className="h-8 w-8 text-green-600" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-red-600" />
                )}
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Profit/Loss</p>
                  <p className={`text-2xl font-bold ${
                    financialData.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {financialData.profitLoss >= 0 ? '+' : ''}${financialData.profitLoss.toLocaleString()}
                  </p>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>

          <ModernCard>
            <ModernCardContent className="p-6">
              <div className="flex items-center">
                <PieChart className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Monthly Costs</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${(financialData.feedCosts30Days + financialData.healthCosts30Days + financialData.breedingCosts30Days).toFixed(0)}
                  </p>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>
        </div>

        {/* Cost Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ModernCard>
            <ModernCardHeader>
              <ModernCardTitle>Cost Breakdown</ModernCardTitle>
            </ModernCardHeader>
            <ModernCardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Animal Purchases</span>
                  <span className="font-semibold">${financialData.costBreakdown.purchase.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Feed Costs</span>
                  <span className="font-semibold">${financialData.costBreakdown.feed.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Health & Veterinary</span>
                  <span className="font-semibold">${financialData.costBreakdown.health.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Breeding Costs</span>
                  <span className="font-semibold">${financialData.costBreakdown.breeding.toLocaleString()}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center font-bold">
                    <span>Total Costs</span>
                    <span>${financialData.totalInvestment.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>

          <ModernCard>
            <ModernCardHeader>
              <ModernCardTitle>Monthly Expenses (Last 30 Days)</ModernCardTitle>
            </ModernCardHeader>
            <ModernCardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Feed</span>
                  <span className="font-semibold">${financialData.feedCosts30Days.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Health & Veterinary</span>
                  <span className="font-semibold">${financialData.healthCosts30Days.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Breeding</span>
                  <span className="font-semibold">${financialData.breedingCosts30Days.toFixed(2)}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center font-bold">
                    <span>Total Monthly</span>
                    <span>${(financialData.feedCosts30Days + financialData.healthCosts30Days + financialData.breedingCosts30Days).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>
        </div>

        {/* Detailed Financial Tracking */}
        <ModernCard>
          <ModernCardHeader>
            <ModernCardTitle>Individual Animal Financials</ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent>
            <LivestockFinancials 
              animals={financialData.animals} 
              farms={userFarms}
            />
          </ModernCardContent>
        </ModernCard>
      </div>
    </DashboardLayout>
  )
}