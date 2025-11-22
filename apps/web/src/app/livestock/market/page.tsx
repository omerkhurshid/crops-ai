'use client'
import { useRouter } from 'next/navigation'
import { useSession } from '../../../lib/auth-unified'
import { useEffect, useState } from 'react'
import { DashboardLayout } from '../../../components/layout/dashboard-layout'
import { MarketAnalysis } from '../../../components/livestock/market-analysis'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../../../components/ui/modern-card'
import { TrendingUp, DollarSign, Calendar, Target, AlertTriangle } from 'lucide-react'
export default function LivestockMarketPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userFarms, setUserFarms] = useState<any[]>([])
  const [marketData, setMarketData] = useState({
    readyForSale: 0,
    optimalWeight: 0,
    totalValue: 0,
    avgDaysToMarket: 0,
    marketOpportunities: [] as any[]
  })
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
    const fetchData = async () => {
      try {
        // Fetch farms
        const farmsResponse = await fetch('/api/farms')
        if (farmsResponse.ok) {
          const farms = await farmsResponse.json()
          setUserFarms(farms)
          // If no farms, redirect to farm creation
          if (farms.length === 0) {
            router.push('/farms/create-unifiedfrom=market')
            return
          }
          // Fetch animals and related records
          const [animalsResponse, weightResponse, feedResponse] = await Promise.all([
            fetch('/api/livestock/animals'),
            fetch('/api/livestock/weight'),
            fetch('/api/livestock/feed')
          ])
          if (animalsResponse.ok && weightResponse.ok && feedResponse.ok) {
            const animals = await animalsResponse.json()
            const weightRecords = await weightResponse.json()
            const feedRecords = await feedResponse.json()
            // Group records by animal ID
            const animalWeightMap = weightRecords.reduce((acc: any, record: any) => {
              if (!acc[record.animalId]) acc[record.animalId] = []
              acc[record.animalId].push(record)
              return acc
            }, {})
            const animalFeedMap = feedRecords.reduce((acc: any, record: any) => {
              if (!acc[record.animalId]) acc[record.animalId] = []
              acc[record.animalId].push(record)
              return acc
            }, {})
            // Sort and limit records per animal
            Object.keys(animalWeightMap).forEach(animalId => {
              animalWeightMap[animalId] = animalWeightMap[animalId]
                .sort((a: any, b: any) => new Date(b.weighDate).getTime() - new Date(a.weighDate).getTime())
                .slice(0, 5)
            })
            Object.keys(animalFeedMap).forEach(animalId => {
              animalFeedMap[animalId] = animalFeedMap[animalId]
                .sort((a: any, b: any) => new Date(b.feedDate).getTime() - new Date(a.feedDate).getTime())
                .slice(0, 10)
            })
            // Filter for active animals and enrich with records
            const activeAnimals = animals
              .filter((animal: any) => animal.status === 'active')
              .map((animal: any) => ({
                ...animal,
                weightRecords: animalWeightMap[animal.id] || [],
                feedRecords: animalFeedMap[animal.id] || []
              }))
            // Perform market analysis calculations
            calculateMarketData(activeAnimals)
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [session, status, router])
  const calculateMarketData = (animals: any[]) => {
    // Market weight targets by species
    const marketWeightTargets: { [key: string]: { min: number, max: number, optimal: number } } = {
      cattle: { min: 1000, max: 1400, optimal: 1200 },
      pig: { min: 240, max: 280, optimal: 260 },
      sheep: { min: 100, max: 140, optimal: 120 },
      goat: { min: 60, max: 90, optimal: 75 },
      chicken: { min: 4, max: 6, optimal: 5 }
    }
    // Analyze each animal for market readiness
    const marketOpportunities = animals.map(animal => {
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
    const newMarketData = {
      readyForSale: marketOpportunities.filter(
        animal => animal.readinessStatus === 'ready'
      ).length,
      optimalWeight: marketOpportunities.filter(
        animal => animal.currentWeight >= animal.marketTarget.optimal
      ).length,
      totalValue: marketOpportunities.reduce(
        (sum, animal) => sum + animal.projectedValue, 0
      ),
      avgDaysToMarket: 0,
      marketOpportunities: marketOpportunities
    }
    const readyAnimals = marketOpportunities.filter(
      animal => animal.readinessStatus === 'approaching'
    )
    newMarketData.avgDaysToMarket = readyAnimals.length > 0 
      ? readyAnimals.reduce((sum, animal) => sum + animal.daysToOptimal, 0) / readyAnimals.length
      : 0
    setMarketData(newMarketData)
  }
  if (status === 'loading' || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7A8F78]"></div>
          <p className="ml-4 text-[#555555]">Loading market analysis...</p>
        </div>
      </DashboardLayout>
    )
  }
  if (!session) {
    return null
  }
  // If no farms, show empty state (this is also handled in useEffect)
  if (userFarms.length === 0) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto pt-8 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Farms Available</h2>
            <p className="text-[#555555] mb-6">You need to create a farm before viewing market analysis.</p>
            <button 
              onClick={() => router.push('/farms/create-unifiedfrom=market')}
              className="bg-[#7A8F78] text-white px-4 py-2 rounded-lg"
            >
              Create Farm
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Market Analysis</h1>
            <p className="text-[#555555]">Optimize timing for livestock sales and market performance</p>
          </div>
        </div>
        {/* Market Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <ModernCard>
            <ModernCardContent className="p-6">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-[#7A8F78]" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-[#555555]">Ready for Sale</p>
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
                  <p className="text-sm font-medium text-[#555555]">At Optimal Weight</p>
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
                  <p className="text-sm font-medium text-[#555555]">Est. Market Value</p>
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
                  <p className="text-sm font-medium text-[#555555]">Avg Days to Market</p>
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
                  <p className="text-[#555555]">
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