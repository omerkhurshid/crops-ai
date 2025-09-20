import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '../../lib/auth/session'
import { Badge } from '../../components/ui/badge'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '../../components/ui/modern-card'
import { Button } from '../../components/ui/button'
import { DashboardLayout } from '../../components/layout/dashboard-layout'
import { FarmerDashboard } from '../../components/dashboard/farmer-dashboard'
import { GlobalFAB, MobileFAB } from '../../components/ui/global-fab'
import NBARecommendations from '../../components/dashboard/nba-recommendations'
import { 
  Sprout, MapPin, AlertTriangle, TrendingUp, Clock, Plus, Brain, CloudRain, DollarSign,
  ThermometerSun, Droplets, Bell, ChevronDown, BarChart3, Activity, Zap, Cat
} from 'lucide-react'
import { prisma } from '../../lib/prisma'
import { ensureArray } from '../../lib/utils'

export const dynamic = 'force-dynamic'

async function getFarmData(userId: string) {
  try {
    const farms = await prisma.farm.findMany({
      where: { ownerId: userId },
      include: {
        fields: {
          select: {
            id: true,
            name: true,
            area: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const [weatherAlerts, financialData, marketPrices] = await Promise.all([
      prisma.weatherAlert.findMany({
        where: {
          userId: userId,
          isActive: true
        },
        orderBy: { triggeredAt: 'desc' },
        take: 5
      }).catch(() => []),

      prisma.financialTransaction.findMany({
        where: { userId: userId },
        orderBy: { transactionDate: 'desc' },
        take: 10
      }).catch(() => []),

      prisma.marketPrice.findMany({
        orderBy: { date: 'desc' },
        take: 5
      }).catch(() => [])
    ])

    return {
      farms,
      weatherAlerts,
      financialData,
      marketPrices
    }
  } catch (error) {
    console.error('Error fetching farm data:', error)
    return {
      farms: [],
      weatherAlerts: [],
      financialData: [],
      marketPrices: []
    }
  }
}

// Generate action-oriented tasks based on real farm data
function generateActionableTasks(farms: any[], weatherAlerts: any[], financialData: any[]) {
  const tasks = []
  const now = new Date()
  
  // Weather-based urgent tasks
  ensureArray(weatherAlerts).forEach(alert => {
    if (alert.severity === 'high' || alert.severity === 'severe') {
      tasks.push({
        id: `weather-${alert.id}`,
        title: alert.alertType.replace(/_/g, ' ').toUpperCase(),
        description: alert.message,
        urgency: 'urgent',
        estimatedTime: '15 min',
        action: 'Review Weather Alert'
      })
    }
  })
  
  // Field inspection tasks - remove placeholder data, will be populated by client-side components
  
  // Financial tasks
  const recentExpenses = ensureArray(financialData).filter(t => 
    t.type === 'EXPENSE' && 
    new Date(t.transactionDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  )
  
  if (recentExpenses.length > 10) {
    tasks.push({
      id: 'expense-review',
      title: 'Review Monthly Expenses',
      description: `${recentExpenses.length} transactions this month. Review for accuracy and categorization.`,
      urgency: 'medium',
      estimatedTime: '20 min',
      action: 'Review Financials'
    })
  }
  
  return tasks.slice(0, 8) // Top 8 most important tasks
}

// Generate market-based recommendations using real data
function generateMarketInsights(marketPrices: any[]) {
  if (!ensureArray(marketPrices).length) return []
  
  return ensureArray(marketPrices).slice(0, 2).map(price => {
    // Calculate real price change if we have historical data
    const priceChange = price.previousPrice ? 
      ((price.price - price.previousPrice) / price.previousPrice * 100).toFixed(1) : 
      '0.0'
    
    // Determine recommendation based on actual price trends and market conditions
    let recommendation = 'HOLD'
    let confidence = 75
    
    if (price.price > (price.averagePrice || price.price) * 1.05) {
      recommendation = 'SELL'
      confidence = 85
    } else if (price.price < (price.averagePrice || price.price) * 0.95) {
      recommendation = 'BUY'
      confidence = 80
    }
    
    return {
      commodity: price.commodity,
      price: price.price,
      change: priceChange,
      recommendation,
      confidence
    }
  })
}

export default async function DashboardPage() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      redirect('/login')
    }

    const { farms, weatherAlerts, financialData, marketPrices } = await getFarmData(user.id)
    
    // Get crops and livestock data
    const [crops, livestock] = await Promise.all([
      prisma.crop.findMany({
        where: { 
          field: {
            farm: {
              ownerId: user.id
            }
          }
        },
        include: {
          field: true
        },
        orderBy: { plantingDate: 'desc' }
      }).catch(() => []),
      
      prisma.livestockEvent.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      }).catch(() => [])
    ])
    
    // Calculate key metrics
    const totalFarms = farms.length
    const totalArea = ensureArray(farms).reduce((sum, farm) => sum + (farm.totalArea || 0), 0)
    const totalFields = ensureArray(farms).reduce((sum, farm) => sum + (farm.fields?.length || 0), 0)
    
    // Calculate financials
    const currentYear = new Date().getFullYear()
    const yearlyFinancials = ensureArray(financialData).filter(t => 
      new Date(t.transactionDate).getFullYear() === currentYear
    )
    const totalRevenue = yearlyFinancials
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0)
    const totalExpenses = yearlyFinancials
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0)
    
    // Generate action-oriented data
    const actionableTasks = generateActionableTasks(farms, weatherAlerts, financialData)
    const marketInsights = generateMarketInsights(marketPrices)
    
    // Show onboarding for new users
    if (totalFarms === 0) {
      return (
        <DashboardLayout>
          <div className="max-w-4xl mx-auto pt-8 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="text-left mb-12">
              <div className="mb-6">
                <h1 className="text-4xl font-light text-sage-800 mb-4">Welcome to Your Farm Dashboard</h1>
                <p className="text-xl text-sage-600 max-w-2xl">
                  Add your first farm to start tracking crops, weather, and financials
                </p>
              </div>
              <Link href="/farms/create">
                <Button className="bg-sage-600 hover:bg-sage-700 text-white px-8 py-3 text-lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Add Your First Farm
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-white rounded-lg shadow-sm border">
                <h3 className="font-semibold text-sage-800 mb-2">Weather Tracking</h3>
                <p className="text-sage-600 text-sm">Get weather alerts to help you time planting, irrigation, and harvests</p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-sm border">
                <h3 className="font-semibold text-sage-800 mb-2">Crop Health</h3>
                <p className="text-sage-600 text-sm">Monitor your fields to catch problems early and maximize yields</p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-sm border">
                <h3 className="font-semibold text-sage-800 mb-2">Financial Reports</h3>
                <p className="text-sage-600 text-sm">Track your income and expenses to improve farm profitability</p>
              </div>
            </div>
          </div>
        </DashboardLayout>
      )
    }
    
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto pt-8 pb-12 px-4 sm:px-6 lg:px-8">
          {/* Page Header - Consistent with other pages */}
          <div className="mb-8">
            <h1 className="text-4xl font-light text-sage-800 mb-2">Farm Dashboard</h1>
            <p className="text-lg text-sage-600">Monitor your operations and stay on top of important tasks</p>
          </div>
          
          {/* Use the new farmer-friendly dashboard */}
          <FarmerDashboard 
            farmId={farms[0]?.id || 'default'}
            farmData={farms[0]}
            allFarms={farms}
            financialData={financialData}
            weatherAlerts={weatherAlerts}
            crops={crops}
            livestock={livestock}
            user={user}
          />
        </div>

        {/* Global Floating Action Button */}
        <GlobalFAB role="farmer" />
      </DashboardLayout>
    )
  } catch (error) {
    console.error('Dashboard page error:', error)
    redirect('/login')
  }
}