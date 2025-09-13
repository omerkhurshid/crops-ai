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
  ;(weatherAlerts || []).forEach(alert => {
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
  
  // Field inspection tasks based on farm health
  ;(farms || []).forEach(farm => {
    farm.fields?.forEach((field: any) => {
      // Simulate NDVI-based recommendations
      const randomNdvi = Math.random()
      if (randomNdvi < 0.3) { // Low NDVI = stress detected
        tasks.push({
          id: `inspect-${field.id}`,
          title: `Inspect ${field.name} - Stress Detected`,
          description: `Field showing signs of stress. Check for pest damage, nutrient deficiency, or irrigation issues.`,
          urgency: 'high',
          estimatedTime: '45 min',
          action: 'Field Inspection',
          estimatedImpact: '+$1,200 potential savings'
        })
      }
    })
  })
  
  // Financial tasks
  const recentExpenses = (financialData || []).filter(t => 
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

// Generate market-based recommendations
function generateMarketInsights(marketPrices: any[]) {
  if (!(marketPrices || []).length) return []
  
  return (marketPrices || []).slice(0, 2).map(price => ({
    commodity: price.commodity,
    price: price.price,
    change: ((Math.random() - 0.5) * 10).toFixed(1),
    recommendation: Math.random() > 0.5 ? 'SELL' : 'HOLD',
    confidence: Math.floor(Math.random() * 30 + 70)
  }))
}

export default async function DashboardPage() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      redirect('/login')
    }

    const { farms, weatherAlerts, financialData, marketPrices } = await getFarmData(user.id)
    
    // Calculate key metrics
    const totalFarms = farms.length
    const totalArea = (farms || []).reduce((sum, farm) => sum + (farm.totalArea || 0), 0)
    const totalFields = (farms || []).reduce((sum, farm) => sum + (farm.fields?.length || 0), 0)
    
    // Calculate financials
    const currentYear = new Date().getFullYear()
    const yearlyFinancials = (financialData || []).filter(t => 
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
          <div className="max-w-4xl mx-auto pt-12 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="mb-6">
                <Sprout className="h-16 w-16 text-corn-accent mx-auto mb-4" />
                <h1 className="text-4xl font-light text-corn-light mb-4">Welcome to Your Farm Command Center</h1>
                <p className="text-xl text-corn-muted max-w-2xl mx-auto">
                  Get started by adding your first farm to unlock AI-powered insights, weather alerts, and financial tracking.
                </p>
              </div>
              <Link href="/farms/create">
                <Button className="bg-sage-600 hover:bg-sage-700 text-white px-8 py-3 text-lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Add Your First Farm
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="p-6 bg-white rounded-lg shadow-sm border">
                <CloudRain className="h-8 w-8 text-sage-600 mx-auto mb-3" />
                <h3 className="font-semibold text-sage-800 mb-2">Weather Intelligence</h3>
                <p className="text-sage-600 text-sm">Get hyperlocal weather alerts and optimal timing for farming operations.</p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-sm border">
                <Activity className="h-8 w-8 text-sage-600 mx-auto mb-3" />
                <h3 className="font-semibold text-sage-800 mb-2">Crop Health Monitoring</h3>
                <p className="text-sage-600 text-sm">Satellite-powered NDVI analysis to detect stress before it's visible.</p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-sm border">
                <DollarSign className="h-8 w-8 text-sage-600 mx-auto mb-3" />
                <h3 className="font-semibold text-sage-800 mb-2">Financial Tracking</h3>
                <p className="text-sage-600 text-sm">Track costs, revenue, and profitability with automated insights.</p>
              </div>
            </div>
          </div>
        </DashboardLayout>
      )
    }
    
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto pt-8 pb-12 px-4 sm:px-6 lg:px-8">
          {/* Use the new farmer-friendly dashboard */}
          <FarmerDashboard farmId={farms[0]?.id || 'default'} />
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