'use client'
import { useRouter } from 'next/navigation'
import { useSession } from '../../../lib/auth-unified'
import { useEffect, useState } from 'react'
import { DashboardLayout } from '../../../components/layout/dashboard-layout'
import { LivestockFinancials } from '../../../components/livestock/livestock-financials'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../../../components/ui/modern-card'
import { DollarSign, TrendingUp, TrendingDown, Calculator, PieChart } from 'lucide-react'
export default function LivestockFinancialsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userFarms, setUserFarms] = useState<any[]>([])
  const [financialData, setFinancialData] = useState({
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
            router.push('/farms/create-unifiedfrom=financials')
            return
          }
          // Fetch comprehensive financial data
          const [animalsResponse, healthResponse, feedResponse, breedingResponse] = await Promise.all([
            fetch('/api/livestock/animals'),
            fetch('/api/livestock/health'),
            fetch('/api/livestock/feed'),
            fetch('/api/livestock/breeding')
          ])
          if (animalsResponse.ok && healthResponse.ok && feedResponse.ok && breedingResponse.ok) {
            const animals = await animalsResponse.json()
            const healthRecords = await healthResponse.json()
            const feedRecords = await feedResponse.json()
            const breedingRecords = await breedingResponse.json()
            // Group records by animal ID
            const animalHealthMap = healthRecords.reduce((acc: any, record: any) => {
              if (!acc[record.animalId]) acc[record.animalId] = []
              acc[record.animalId].push(record)
              return acc
            }, {})
            const animalFeedMap = feedRecords.reduce((acc: any, record: any) => {
              if (!acc[record.animalId]) acc[record.animalId] = []
              acc[record.animalId].push(record)
              return acc
            }, {})
            const animalBreedingMap = breedingRecords.reduce((acc: any, record: any) => {
              if (!acc[record.animalId]) acc[record.animalId] = []
              acc[record.animalId].push(record)
              return acc
            }, {})
            // Combine all data and calculate financials
            const enrichedAnimals = animals.map((animal: any) => ({
              ...animal,
              healthRecords: animalHealthMap[animal.id] || [],
              feedRecords: animalFeedMap[animal.id] || [],
              breedingRecords: animalBreedingMap[animal.id] || []
            }))
            // Calculate financial metrics
            const newFinancialData = {
              totalInvestment: 0,
              totalValue: 0,
              profitLoss: 0,
              feedCosts30Days: 0,
              healthCosts30Days: 0,
              breedingCosts30Days: 0,
              revenueOpportunities: 0,
              animals: [],
              costBreakdown: {
                purchase: 0,
                feed: 0,
                health: 0,
                breeding: 0
              }
            }
            const thirtyDaysAgo = new Date()
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
            // Calculate total investment and current value
            newFinancialData.totalInvestment = enrichedAnimals.reduce((sum: number, animal: any) => {
              const purchasePrice = animal.purchasePrice || 0
              const healthCosts = animal.healthRecords.reduce((sum: number, record: any) => sum + (record.cost || 0), 0)
              const feedCosts = animal.feedRecords.reduce((sum: number, record: any) => sum + (record.totalCost || 0), 0)
              const breedingCosts = animal.breedingRecords.reduce((sum: number, record: any) => sum + (record.cost || 0), 0)
              return sum + purchasePrice + healthCosts + feedCosts + breedingCosts
            }, 0)
            newFinancialData.totalValue = enrichedAnimals.reduce((sum: number, animal: any) => sum + (animal.currentValue || animal.purchasePrice || 0), 0)
            newFinancialData.profitLoss = newFinancialData.totalValue - newFinancialData.totalInvestment
            // Calculate 30-day costs
            newFinancialData.feedCosts30Days = enrichedAnimals.reduce((sum: number, animal: any) => {
              return sum + animal.feedRecords
                .filter((record: any) => new Date(record.feedDate) >= thirtyDaysAgo)
                .reduce((sum: number, record: any) => sum + (record.totalCost || 0), 0)
            }, 0)
            newFinancialData.healthCosts30Days = enrichedAnimals.reduce((sum: number, animal: any) => {
              return sum + animal.healthRecords
                .filter((record: any) => new Date(record.recordDate) >= thirtyDaysAgo)
                .reduce((sum: number, record: any) => sum + (record.cost || 0), 0)
            }, 0)
            newFinancialData.breedingCosts30Days = enrichedAnimals.reduce((sum: number, animal: any) => {
              return sum + animal.breedingRecords
                .filter((record: any) => new Date(record.breedingDate) >= thirtyDaysAgo)
                .reduce((sum: number, record: any) => sum + (record.cost || 0), 0)
            }, 0)
            // Cost breakdown
            newFinancialData.costBreakdown.purchase = enrichedAnimals.reduce((sum: number, animal: any) => sum + (animal.purchasePrice || 0), 0)
            newFinancialData.costBreakdown.feed = enrichedAnimals.reduce((sum: number, animal: any) => {
              return sum + animal.feedRecords.reduce((sum: number, record: any) => sum + (record.totalCost || 0), 0)
            }, 0)
            newFinancialData.costBreakdown.health = enrichedAnimals.reduce((sum: number, animal: any) => {
              return sum + animal.healthRecords.reduce((sum: number, record: any) => sum + (record.cost || 0), 0)
            }, 0)
            newFinancialData.costBreakdown.breeding = enrichedAnimals.reduce((sum: number, animal: any) => {
              return sum + animal.breedingRecords.reduce((sum: number, record: any) => sum + (record.cost || 0), 0)
            }, 0)
            // Calculate revenue opportunities
            newFinancialData.revenueOpportunities = enrichedAnimals
              .filter((animal: any) => animal.status === 'active')
              .reduce((sum: number, animal: any) => sum + (animal.currentValue || 0), 0)
            newFinancialData.animals = enrichedAnimals.map((animal: any) => ({
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
            setFinancialData(newFinancialData)
          }
        }
      } catch (error) {
        console.error('Error fetching financial data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [session, status, router])
  if (status === 'loading' || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="ml-4 text-gray-600">Loading financial data...</p>
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
            <p className="text-gray-600 mb-6">You need to create a farm before viewing financial data.</p>
            <button 
              onClick={() => router.push('/farms/create-unifiedfrom=financials')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg"
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