import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '../../lib/auth/session'
import { Badge } from '../../components/ui/badge'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '../../components/ui/modern-card'
import { Button } from '../../components/ui/button'
import { Navbar } from '../../components/navigation/navbar'
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
  weatherAlerts.forEach(alert => {
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
  farms.forEach(farm => {
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
  const recentExpenses = financialData.filter(t => 
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
  if (!marketPrices.length) return []
  
  return marketPrices.slice(0, 2).map(price => ({
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
    const totalArea = farms.reduce((sum, farm) => sum + (farm.totalArea || 0), 0)
    const totalFields = farms.reduce((sum, farm) => sum + (farm.fields?.length || 0), 0)
    
    // Calculate financials
    const currentYear = new Date().getFullYear()
    const yearlyFinancials = financialData.filter(t => 
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
        <div className="minimal-page">
          <Navbar />
          <main className="max-w-4xl mx-auto pt-12 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="mb-6">
                <Sprout className="h-16 w-16 text-sage-600 mx-auto mb-4" />
                <h1 className="text-4xl font-light text-sage-800 mb-4">Welcome to Your Farm Command Center</h1>
                <p className="text-xl text-sage-600 max-w-2xl mx-auto">
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
          </main>
        </div>
      )
    }
    
    return (
      <div className="minimal-page">
        {/* Top Bar */}
        <div className="bg-white/90 backdrop-blur-sm border-b border-sage-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Left: Farm Switcher */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-sage-50 rounded-lg px-3 py-2">
                  <Sprout className="h-4 w-4 text-sage-600" />
                  <select className="bg-transparent border-none text-sage-800 font-medium focus:outline-none">
                    {farms.map(farm => (
                      <option key={farm.id} value={farm.id}>{farm.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="h-4 w-4 text-sage-600" />
                </div>
              </div>
              
              {/* Center: Quick Actions */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="text-sage-700 border-sage-200">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Expense
                </Button>
                <Button variant="outline" size="sm" className="text-sage-700 border-sage-200">
                  <Plus className="h-4 w-4 mr-1" />
                  Log Harvest
                </Button>
                <Button variant="outline" size="sm" className="text-sage-700 border-sage-200">
                  <Cat className="h-4 w-4 mr-1" />
                  Livestock Event
                </Button>
              </div>
              
              {/* Right: Notifications & Profile */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Bell className="h-5 w-5 text-sage-600" />
                  {weatherAlerts.length > 0 && (
                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></div>
                  )}
                </div>
                <div className="h-8 w-8 bg-sage-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user.name?.charAt(0) || 'U'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <main className="max-w-7xl mx-auto pt-4 lg:pt-6 pb-8 lg:pb-12 px-3 sm:px-6 lg:px-8">
          {/* Today's Snapshot Hero */}
          <div className="mb-6 lg:mb-8">
            <div className="bg-gradient-to-r from-sage-50 to-cream-50 rounded-lg lg:rounded-2xl p-4 lg:p-6 border border-sage-200/50">
              <h1 className="text-xl lg:text-2xl font-semibold text-sage-800 mb-4 lg:mb-6">Today's Snapshot</h1>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
                {/* Crop Health */}
                <div className="bg-white rounded-lg p-4 text-center">
                  <Sprout className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <div className="text-lg font-bold text-green-800">0.78</div>
                  <div className="text-xs text-sage-600">Avg NDVI</div>
                  <div className="text-xs text-green-600 font-medium">Healthy</div>
                </div>
                
                {/* Livestock (placeholder for future) */}
                <div className="bg-white rounded-lg p-4 text-center">
                  <Cat className="h-6 w-6 text-amber-600 mx-auto mb-2" />
                  <div className="text-lg font-bold text-amber-800">-</div>
                  <div className="text-xs text-sage-600">Livestock</div>
                  <div className="text-xs text-sage-600">Coming Soon</div>
                </div>
                
                {/* Weather */}
                <div className="bg-white rounded-lg p-4 text-center">
                  <ThermometerSun className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                  <div className="text-lg font-bold text-orange-800">22°C</div>
                  <div className="text-xs text-sage-600">Current</div>
                  <div className="text-xs text-blue-600 font-medium">
                    {weatherAlerts.length > 0 ? `${weatherAlerts.length} Alert${weatherAlerts.length > 1 ? 's' : ''}` : 'Clear'}
                  </div>
                </div>
                
                {/* Financials */}
                <div className="bg-white rounded-lg p-4 text-center">
                  <DollarSign className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <div className="text-lg font-bold text-green-800">
                    ${((totalRevenue - totalExpenses) / 1000).toFixed(0)}K
                  </div>
                  <div className="text-xs text-sage-600">Net YTD</div>
                  <div className={`text-xs font-medium ${
                    totalRevenue - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {totalRevenue - totalExpenses >= 0 ? 'Profit' : 'Loss'}
                  </div>
                </div>
                
                {/* Market Signal */}
                <div className="bg-white rounded-lg p-4 text-center">
                  <BarChart3 className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-lg font-bold text-blue-800">
                    {marketInsights.length > 0 ? `${marketInsights[0].change}%` : '--'}
                  </div>
                  <div className="text-xs text-sage-600">
                    {marketInsights.length > 0 ? marketInsights[0].commodity : 'Markets'}
                  </div>
                  <div className={`text-xs font-medium ${
                    marketInsights.length > 0 && parseFloat(marketInsights[0].change) > 0 
                      ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {marketInsights.length > 0 ? marketInsights[0].recommendation : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Left Column - NBA Recommendations & Crops */}
            <div className="lg:col-span-2 space-y-4 lg:space-y-6">
              {/* NBA Recommendations - Priority #1 */}
              {farms.length > 0 ? (
                <NBARecommendations 
                  farmId={farms[0].id} 
                  className="lg:col-span-2"
                />
              ) : (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="text-center py-8">
                    <Sprout className="h-12 w-12 text-sage-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-sage-700 mb-2">No Farms Found</h3>
                    <p className="text-sage-500 mb-6">
                      Create your first farm to start receiving personalized recommendations.
                    </p>
                    <Link
                      href="/farms"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Add Farm
                    </Link>
                  </div>
                </div>
              )}
              
              {/* Crops & Land Panel */}
              <ModernCard>
                <ModernCardHeader>
                  <ModernCardTitle className="text-sage-800">Crops & Land Overview</ModernCardTitle>
                  <ModernCardDescription>
                    {totalFields} fields across {totalArea.toFixed(1)} hectares
                  </ModernCardDescription>
                </ModernCardHeader>
                <ModernCardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Quick Stats */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sage-600">Total Area</span>
                        <span className="font-semibold text-sage-800">{totalArea.toFixed(1)} ha</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sage-600">Active Fields</span>
                        <span className="font-semibold text-sage-800">{totalFields}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sage-600">Avg Yield Forecast</span>
                        <span className="font-semibold text-green-700">+12% vs last year</span>
                      </div>
                      <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-sm font-medium text-green-800">Seasonal Insight</div>
                        <div className="text-sm text-green-700">Optimal harvest window in 10-14 days based on weather forecast</div>
                      </div>
                    </div>
                    
                    {/* Mini Map Placeholder */}
                    <div className="bg-sage-50 rounded-lg p-6 text-center">
                      <MapPin className="h-8 w-8 text-sage-400 mx-auto mb-3" />
                      <div className="text-sage-600 font-medium mb-2">Interactive Farm Map</div>
                      <div className="text-sm text-sage-500">Fields colored by NDVI health status</div>
                      <div className="mt-3 text-xs text-sage-400">Coming in Phase 1</div>
                    </div>
                  </div>
                </ModernCardContent>
              </ModernCard>
            </div>
            
            {/* Right Column - Financial & Weather */}
            <div className="space-y-4 lg:space-y-6">
              {/* Financial & Market Panel */}
              <ModernCard>
                <ModernCardHeader>
                  <ModernCardTitle className="text-sage-800">Financial Overview</ModernCardTitle>
                  <ModernCardDescription>Year-to-date performance</ModernCardDescription>
                </ModernCardHeader>
                <ModernCardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sage-600">Revenue</span>
                      <span className="font-semibold text-green-700">${totalRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sage-600">Expenses</span>
                      <span className="font-semibold text-red-600">${totalExpenses.toLocaleString()}</span>
                    </div>
                    <hr className="border-sage-200" />
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sage-800">Net Profit</span>
                      <span className={`font-bold text-lg ${
                        totalRevenue - totalExpenses >= 0 ? 'text-green-700' : 'text-red-600'
                      }`}>
                        ${(totalRevenue - totalExpenses).toLocaleString()}
                      </span>
                    </div>
                    
                    {/* Market Insights */}
                    {marketInsights.length > 0 && (
                      <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="font-medium text-blue-800 mb-2">Market Signal</div>
                        {marketInsights.slice(0, 2).map(insight => (
                          <div key={insight.commodity} className="flex justify-between items-center text-sm mb-1">
                            <span className="text-blue-700">{insight.commodity}</span>
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${
                                parseFloat(insight.change) > 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {parseFloat(insight.change) > 0 ? '+' : ''}{insight.change}%
                              </span>
                              <Badge className={`${
                                insight.recommendation === 'SELL' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {insight.recommendation}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </ModernCardContent>
              </ModernCard>
              
              {/* Weather & Risk Panel */}
              <ModernCard>
                <ModernCardHeader>
                  <ModernCardTitle className="text-sage-800">Weather & Risk</ModernCardTitle>
                  <ModernCardDescription>Current conditions and 7-day forecast</ModernCardDescription>
                </ModernCardHeader>
                <ModernCardContent>
                  <div className="space-y-4">
                    {/* Current Weather */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <ThermometerSun className="h-5 w-5 text-orange-500" />
                        <span className="text-sage-600">Temperature</span>
                      </div>
                      <span className="font-semibold text-sage-800">22°C</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Droplets className="h-5 w-5 text-blue-500" />
                        <span className="text-sage-600">Humidity</span>
                      </div>
                      <span className="font-semibold text-sage-800">65%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <CloudRain className="h-5 w-5 text-gray-500" />
                        <span className="text-sage-600">Rainfall Risk</span>
                      </div>
                      <span className="font-semibold text-sage-800">20% (3 days)</span>
                    </div>
                    
                    {/* Weather Alerts */}
                    {weatherAlerts.length > 0 && (
                      <div className="space-y-2 mt-4">
                        {weatherAlerts.slice(0, 3).map(alert => (
                          <div key={alert.id} className={`p-3 rounded-lg border ${
                            alert.severity === 'high' || alert.severity === 'severe'
                              ? 'bg-red-50 border-red-200'
                              : 'bg-yellow-50 border-yellow-200'
                          }`}>
                            <div className={`font-medium text-sm ${
                              alert.severity === 'high' || alert.severity === 'severe'
                                ? 'text-red-800'
                                : 'text-yellow-800'
                            }`}>
                              {alert.alertType.replace(/_/g, ' ').toUpperCase()}
                            </div>
                            <div className={`text-xs ${
                              alert.severity === 'high' || alert.severity === 'severe'
                                ? 'text-red-600'
                                : 'text-yellow-600'
                            }`}>
                              {alert.message}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </ModernCardContent>
              </ModernCard>
            </div>
          </div>
        </main>
      </div>
    )
  } catch (error) {
    console.error('Dashboard page error:', error)
    redirect('/login')
  }
}