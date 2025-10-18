import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../../lib/auth/session'
import { DashboardLayout } from '../../../components/layout/dashboard-layout'
import { MarketAnalysis } from '../../../components/livestock/market-analysis'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../../../components/ui/modern-card'
import { TrendingUp, DollarSign, Calendar, Target, AlertTriangle } from 'lucide-react'
import { prisma } from '../../../lib/prisma'

export const dynamic = 'force-dynamic'

export default async function LivestockMarketPage() {
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
    redirect('/farms/create?from=market')
  }

  // Get animals ready for market analysis
  let animals: any[] = []
  let marketData = {
    readyForSale: 0,
    optimalWeight: 0,
    totalValue: 0,
    avgDaysToMarket: 0,
    marketOpportunities: [] as any[]
  }

  try {
    animals = await prisma.animal.findMany({
      where: { 
        userId: user.id,
        status: 'active'
      },
      include: {
        farm: { select: { name: true } },
        weightRecords: {
          orderBy: { weighDate: 'desc' },
          take: 5
        },
        feedRecords: {
          orderBy: { feedDate: 'desc' },
          take: 10
        }
      }
    })

    // Market weight targets by species
    const marketWeightTargets: { [key: string]: { min: number, max: number, optimal: number } } = {
      cattle: { min: 1000, max: 1400, optimal: 1200 },
      pig: { min: 240, max: 280, optimal: 260 },
      sheep: { min: 100, max: 140, optimal: 120 },
      goat: { min: 60, max: 90, optimal: 75 },
      chicken: { min: 4, max: 6, optimal: 5 }
    }

    // Analyze each animal for market readiness
    marketData.marketOpportunities = animals.map(animal => {
      const target = marketWeightTargets[animal.species] || { min: 0, max: 0, optimal: 0 }
      const currentWeight = animal.currentWeight || 0
      
      // Calculate growth rate
      let growthRate = 0
      if (animal.weightRecords.length >= 2) {
        const recentRecords = animal.weightRecords.slice(0, 2)
        const weightChange = recentRecords[0].weight - recentRecords[1].weight
        const daysDiff = Math.abs(
          new Date(recentRecords[0].weighDate).getTime() - 
          new Date(recentRecords[1].weighDate).getTime()
        ) / (1000 * 60 * 60 * 24)
        
        if (daysDiff > 0) {
          growthRate = weightChange / daysDiff // lbs per day
        }
      }

      // Calculate days to optimal weight
      let daysToOptimal = 0
      if (growthRate > 0 && currentWeight < target.optimal) {
        daysToOptimal = Math.ceil((target.optimal - currentWeight) / growthRate)
      }

      // Calculate market readiness score
      let readinessScore = 0
      let readinessStatus = 'not_ready'
      
      if (currentWeight >= target.min) {
        readinessScore = Math.min(100, ((currentWeight - target.min) / (target.optimal - target.min)) * 100)
        
        if (currentWeight >= target.optimal) {
          readinessStatus = 'ready'
        } else if (currentWeight >= target.min) {
          readinessStatus = 'approaching'
        }
      }

      // Calculate projected sale value (simplified)
      const basePrice = {
        cattle: 1.50, // per lb
        pig: 1.25,
        sheep: 2.00,
        goat: 2.50,
        chicken: 3.00
      }
      
      const pricePerLb = basePrice[animal.species as keyof typeof basePrice] || 1.00
      const projectedValue = currentWeight * pricePerLb

      return {
        ...animal,
        marketTarget: target,
        growthRate: growthRate,
        daysToOptimal: daysToOptimal,
        readinessScore: readinessScore,
        readinessStatus: readinessStatus,
        projectedValue: projectedValue,
        pricePerLb: pricePerLb
      }
    })

    // Calculate summary stats
    marketData.readyForSale = marketData.marketOpportunities.filter(
      animal => animal.readinessStatus === 'ready'
    ).length

    marketData.optimalWeight = marketData.marketOpportunities.filter(
      animal => animal.currentWeight >= animal.marketTarget.optimal
    ).length

    marketData.totalValue = marketData.marketOpportunities.reduce(
      (sum, animal) => sum + animal.projectedValue, 0
    )

    const readyAnimals = marketData.marketOpportunities.filter(
      animal => animal.readinessStatus === 'approaching'
    )
    marketData.avgDaysToMarket = readyAnimals.length > 0 
      ? readyAnimals.reduce((sum, animal) => sum + animal.daysToOptimal, 0) / readyAnimals.length
      : 0

  } catch (error: any) {
    console.error('Error fetching market data:', error)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Market Analysis</h1>
            <p className="text-gray-600">Optimize timing for livestock sales and market performance</p>
          </div>
        </div>

        {/* Market Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <ModernCard>
            <ModernCardContent className="p-6">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ready for Sale</p>
                  <p className="text-2xl font-bold text-gray-900">{marketData.readyForSale}</p>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>

          <ModernCard>
            <ModernCardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">At Optimal Weight</p>
                  <p className="text-2xl font-bold text-gray-900">{marketData.optimalWeight}</p>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>

          <ModernCard>
            <ModernCardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Est. Market Value</p>
                  <p className="text-2xl font-bold text-gray-900">${marketData.totalValue.toLocaleString()}</p>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>

          <ModernCard>
            <ModernCardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Days to Market</p>
                  <p className="text-2xl font-bold text-gray-900">{Math.round(marketData.avgDaysToMarket)}</p>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>
        </div>

        {/* Market Alerts */}
        {marketData.readyForSale > 0 && (
          <ModernCard>
            <ModernCardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-orange-500 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Market Opportunities</h3>
                  <p className="text-gray-600">
                    You have {marketData.readyForSale} animal{marketData.readyForSale !== 1 ? 's' : ''} ready for sale. 
                    Consider market conditions and timing for optimal pricing.
                  </p>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>
        )}

        {/* Market Analysis Table */}
        <ModernCard>
          <ModernCardHeader>
            <ModernCardTitle>Individual Market Analysis</ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent>
            <MarketAnalysis 
              animals={marketData.marketOpportunities} 
              farms={userFarms}
            />
          </ModernCardContent>
        </ModernCard>
      </div>
    </DashboardLayout>
  )
}