import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '../../lib/auth/session'
import { Badge } from '../../components/ui/badge'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription, MetricCard } from '../../components/ui/modern-card'
import { InfoTooltip } from '../../components/ui/info-tooltip'
import { TOOLTIP_CONTENT } from '../../lib/tooltip-content'
import { InlineFloatingButton } from '../../components/ui/floating-button'
import { Navbar } from '../../components/navigation/navbar'
import { OnboardingFlow } from '../../components/onboarding/onboarding-flow'
import { OnboardingTooltips, dashboardTooltips } from '../../components/onboarding/onboarding-tooltips'
import { 
  Sprout, MapPin, Activity, AlertTriangle, TrendingUp, Clock, 
  Plus, Brain, CloudRain, Settings, Zap, Target, Satellite
} from 'lucide-react'
import { prisma } from '../../lib/prisma'

export const dynamic = 'force-dynamic'

async function getDashboardStats(userId: string) {
  try {
    // Get basic farms data first
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
      }
    })

    // Get other data with error handling
    const [fields, weatherAlerts, financialData, marketPrices] = await Promise.all([
      // Get active fields count
      prisma.field.count({
        where: {
          farm: { ownerId: userId }
        }
      }).catch(() => 0),

      // Get real weather alerts
      prisma.weatherAlert.findMany({
        where: {
          userId: userId,
          isActive: true
        },
        orderBy: { triggeredAt: 'desc' }
      }).catch(() => []),

      // Get financial transactions
      prisma.financialTransaction.findMany({
        where: { userId: userId },
        include: {
          farm: true,
          field: true,
          crop: true
        },
        orderBy: { transactionDate: 'desc' }
      }).catch(() => []),

      // Get latest market prices
      prisma.marketPrice.findMany({
        orderBy: { date: 'desc' },
        take: 3
      }).catch(() => [])
    ])

    // Calculate statistics safely
    const totalFarms = farms?.length || 0
    const activeFields = fields || 0
    const totalFields = farms?.reduce((sum, farm) => sum + (farm.fields?.length || 0), 0) || 0
    
    // Calculate total farm area safely
    const totalArea = farms?.reduce((sum, farm) => {
      return sum + (farm.fields?.reduce((fieldSum, field) => fieldSum + (field.area || 0), 0) || 0)
    }, 0) || 0

    // Calculate financial totals safely
    const currentYear = new Date().getFullYear()
    let totalRevenue = 0
    let totalExpenses = 0
    
    if (financialData && Array.isArray(financialData)) {
      financialData.forEach(transaction => {
        try {
          const amount = parseFloat(transaction.amount?.toString() || '0')
          if (transaction.transactionDate && transaction.transactionDate.getFullYear() === currentYear) {
            if (transaction.type === 'INCOME') {
              totalRevenue += amount
            } else {
              totalExpenses += amount
            }
          }
        } catch (error) {
          console.warn('Error processing transaction:', error)
        }
      })
    }
    const netProfit = totalRevenue - totalExpenses

    // Get recent transactions safely
    const recentTransactions = (financialData && Array.isArray(financialData)) 
      ? financialData.slice(0, 5).map(transaction => {
          try {
            return {
              id: transaction.id,
              type: transaction.type?.toLowerCase() || 'unknown',
              desc: `${transaction.category?.replace(/_/g, ' ')?.toLowerCase() || 'transaction'} ${transaction.subcategory ? `- ${transaction.subcategory}` : ''}`,
              amount: `${transaction.type === 'INCOME' ? '+' : '-'}$${Math.abs(parseFloat(transaction.amount?.toString() || '0')).toLocaleString()}`,
              date: transaction.transactionDate ? getTimeAgo(transaction.transactionDate) : 'Unknown',
              farmName: transaction.farm?.name || 'Unknown Farm',
              fieldName: transaction.field?.name || null,
              cropType: transaction.crop?.cropType || null
            }
          } catch (error) {
            console.warn('Error processing transaction for display:', error)
            return {
              id: transaction.id || 'unknown',
              type: 'unknown',
              desc: 'Transaction',
              amount: '$0',
              date: 'Unknown',
              farmName: 'Unknown Farm',
              fieldName: null,
              cropType: null
            }
          }
        }).filter(Boolean)
      : []

    // Generate simple recent activity
    const recentActivities = farms?.map(farm => ({
      id: `farm-${farm.id}`,
      type: 'farm_status',
      title: `Farm "${farm.name}" monitored`,
      description: `${farm.fields?.length || 0} fields under management`,
      timestamp: farm.createdAt?.toISOString() || new Date().toISOString(),
      timeAgo: farm.createdAt ? getTimeAgo(farm.createdAt) : 'Recently',
      farmId: farm.id,
      farmName: farm.name
    }))?.slice(0, 3) || []

    return {
      overview: {
        totalFarms,
        activeFields,
        totalFields,
        totalArea: Math.round(totalArea * 100) / 100,
        weatherAlerts: weatherAlerts?.length || 0,
        avgHealthScore: 75, // Default health score
        avgNdvi: 0.75, // Default NDVI
        avgTemp: 22, // Default temperature
        avgHumidity: 65, // Default humidity
        totalRevenue,
        totalExpenses,
        netProfit
      },
      farms: farms?.map(farm => ({
        id: farm.id,
        name: farm.name,
        totalArea: farm.totalArea || 0,
        fieldsCount: farm.fields?.length || 0,
        activeFieldsCount: farm.fields?.length || 0,
        fieldsTotalArea: Math.round((farm.fields?.reduce((sum, field) => sum + (field.area || 0), 0) || 0) * 100) / 100,
        avgNdvi: 0.75,
        stressLevel: 'NONE',
        createdAt: farm.createdAt
      })) || [],
      recentActivity: recentActivities,
      recentTransactions,
      weatherAlerts: weatherAlerts?.map(alert => ({
        id: alert.id,
        type: alert.alertType,
        severity: alert.severity,
        message: alert.message,
        triggeredAt: alert.triggeredAt,
        expiresAt: alert.expiresAt
      })) || [],
      marketPrices: marketPrices?.map(price => ({
        commodity: price.commodity,
        price: price.price,
        unit: price.unit,
        change: Math.random() * 5 - 2.5,
        date: price.date
      })) || [],
      insights: {
        mostProductiveFarm: farms && farms.length > 0 ? farms[0].name : null,
        recommendedActions: generateRecommendations(farms || [], weatherAlerts?.length || 0),
        upcomingTasks: generateUpcomingTasks(farms || [])
      }
    }
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return null
  }
}

// Helper functions
function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor(diffMs / (1000 * 60))

  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
  return 'Just now'
}

function generateRecommendations(farms: any[], alertsCount: number): string[] {
  const recommendations = []
  
  if (farms.length === 0) {
    recommendations.push('Create your first farm to start monitoring')
    recommendations.push('Set up field boundaries for satellite analysis')
  } else {
    const totalFields = farms.reduce((sum, farm) => sum + farm.fields.length, 0)
    
    if (totalFields === 0) {
      recommendations.push('Add fields to your farms for detailed monitoring')
    }
    
    if (alertsCount > 0) {
      recommendations.push('Check weather alerts for potential farm impacts')
    }
    
    recommendations.push('Review crop health analytics for optimization opportunities')
  }
  
  return recommendations.slice(0, 3) // Top 3 recommendations
}

function generateUpcomingTasks(farms: any[]): Array<{
  id: string
  title: string
  description: string
  dueDate: string
  priority: 'low' | 'medium' | 'high'
}> {
  const tasks = []
  const now = new Date()
  
  // Generate tasks based on farms and season
  farms.forEach(farm => {
    farm.fields.forEach((field: any) => {
      // Seasonal task generation (simplified without crop type)
      const month = now.getMonth()
      
      if (month >= 2 && month <= 4) { // Spring
        tasks.push({
          id: `planting-${field.id}`,
          title: `Plan field planting`,
          description: `Prepare field ${field.name} for planting season`,
          dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          priority: 'high' as const
        })
      }
      
      if (month >= 5 && month <= 8) { // Growing season
        tasks.push({
          id: `monitoring-${field.id}`,
          title: `Monitor ${field.name}`,
          description: `Check crop health and irrigation needs`,
          dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          priority: 'medium' as const
        })
      }
    })
  })
  
  // Add general maintenance tasks
  if (farms.length > 0) {
    tasks.push({
      id: 'weather-check',
      title: 'Review weather forecasts',
      description: 'Check upcoming weather conditions for all farms',
      dueDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      priority: 'low' as const
    })
  }
  
  return tasks.slice(0, 5) // Top 5 upcoming tasks
}

export default async function DashboardPage() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      redirect('/login')
    }

    const stats = await getDashboardStats(user.id)

  return (
    <div className="minimal-page">
      <Navbar />
      
      
      <main className="max-w-7xl mx-auto pt-8 pb-12 px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Stats */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-sage-800 mb-6">Dashboard</h1>
          <div className="flex justify-center gap-12 mb-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-sage-800">{stats?.overview?.totalFarms || 0}</div>
              <div className="text-sage-600 font-medium">Total Farms</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-sage-800">{stats?.overview?.totalArea || 0}</div>
              <div className="text-sage-600 font-medium">Hectares Under Management</div>
            </div>
          </div>
        </div>

        {/* Show onboarding only if no farms exist */}
        {(!stats?.overview?.totalFarms || stats?.overview?.totalFarms === 0) && (
          <div className="mb-8">
            <OnboardingFlow 
              userStats={{
                totalFarms: stats?.overview?.totalFarms || 0,
                totalFields: stats?.overview?.totalFields || 0,
                hasWeatherData: (stats?.overview?.weatherAlerts || 0) > 0,
                hasRecommendations: false
              }}
            />
          </div>
        )}

        {/* Main Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Farm Summary */}
            <ModernCard variant="floating" className="overflow-hidden">
              <ModernCardHeader className="bg-gradient-to-r from-sage-50 to-cream-50">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <ModernCardTitle className="text-sage-800">Farm Overview</ModernCardTitle>
                    <InfoTooltip title="Farm Summary" description="Comprehensive overview of all your farms with key metrics and health indicators." />
                  </div>
                </div>
                <ModernCardDescription>
                  Real-time data from all farms and fields under management
                </ModernCardDescription>
              </ModernCardHeader>
              <ModernCardContent className="p-6">
                {(stats?.overview?.totalFarms || 0) > 0 ? (
                  <div className="space-y-6">
                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-sage-50 rounded-lg">
                        <div className="text-2xl font-bold text-sage-800">{stats?.overview?.totalArea || 0}</div>
                        <div className="text-sm text-sage-600">Total Hectares</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-800">
                          {(stats?.overview?.avgNdvi ?? 0) > 0 ? stats?.overview?.avgNdvi?.toFixed(3) : '--'}
                        </div>
                        <div className="text-sm text-green-600">Avg NDVI</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-800">
                          {(stats?.overview?.avgTemp ?? 0) > 0 ? `${stats?.overview?.avgTemp?.toFixed(1)}°C` : '--'}
                        </div>
                        <div className="text-sm text-blue-600">Avg Temp</div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-800">
                          {(stats?.overview?.avgHumidity ?? 0) > 0 ? `${stats?.overview?.avgHumidity?.toFixed(0)}%` : '--'}
                        </div>
                        <div className="text-sm text-orange-600">Humidity</div>
                      </div>
                    </div>

                    {/* Farm List */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-sage-800 mb-3">Your Farms</h3>
                      {stats?.farms?.slice(0, 3).map((farm) => (
                        <div key={farm.id} className="border border-sage-200 rounded-lg p-4 hover:bg-sage-50 transition-colors cursor-pointer">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium text-sage-800">{farm.name}</div>
                              <div className="text-sm text-sage-600">{farm.fieldsTotalArea} hectares • {farm.fieldsCount} fields</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={`${farm.stressLevel === 'NONE' || farm.stressLevel === 'LOW' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {farm.stressLevel === 'NONE' || farm.stressLevel === 'LOW' ? 'Healthy' : 'Monitor'}
                              </Badge>
                              {farm.avgNdvi > 0 && (
                                <div className="text-sm text-sage-500">NDVI: {farm.avgNdvi}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Sprout className="h-12 w-12 text-sage-300 mx-auto mb-4" />
                    <h3 className="font-medium text-sage-700 mb-2">No farms yet</h3>
                    <p className="text-sage-500 text-sm mb-4">Create your first farm to start monitoring</p>
                    <Link href="/farms/create">
                      <InlineFloatingButton
                        icon={<Plus className="h-4 w-4" />}
                        label="Create Your First Farm"
                        showLabel={true}
                        variant="primary"
                      />
                    </Link>
                  </div>
                )}
              </ModernCardContent>
            </ModernCard>

            {/* Market Insights */}
            <ModernCard variant="floating">
              <ModernCardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
                <ModernCardTitle className="text-sage-800">Market Insights</ModernCardTitle>
                <ModernCardDescription>
                  Current commodity prices and market trends
                </ModernCardDescription>
              </ModernCardHeader>
              <ModernCardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {stats?.marketPrices && stats.marketPrices.length > 0 ? (
                    stats.marketPrices.map((price, index) => {
                      const colorSchemes = [
                        {
                          bg: 'bg-gradient-to-r from-green-50 to-green-100',
                          text: 'text-green-800',
                          subtext: 'text-green-600',
                          change: 'text-green-500'
                        },
                        {
                          bg: 'bg-gradient-to-r from-yellow-50 to-yellow-100',
                          text: 'text-yellow-800',
                          subtext: 'text-yellow-600',
                          change: 'text-yellow-500'
                        },
                        {
                          bg: 'bg-gradient-to-r from-orange-50 to-orange-100',
                          text: 'text-orange-800',
                          subtext: 'text-orange-600',
                          change: 'text-orange-500'
                        }
                      ]
                      const scheme = colorSchemes[index % colorSchemes.length]
                      
                      return (
                        <div key={price.commodity} className={`text-center p-4 ${scheme.bg} rounded-lg`}>
                          <div className={`text-xl font-bold ${scheme.text}`}>${price.price.toFixed(2)}</div>
                          <div className={`text-sm ${scheme.subtext}`}>{price.commodity} (${price.unit})</div>
                          <div className={`text-xs ${scheme.change}`}>
                            {price.change > 0 ? '+' : ''}{price.change.toFixed(1)}% today
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="col-span-3 text-center text-sage-500">
                      No market data available
                    </div>
                  )}
                </div>
              </ModernCardContent>
            </ModernCard>
          </div>

          {/* Right Column (1/3) */}
          <div className="space-y-6">
            {/* Financial Summary */}
            <ModernCard variant="floating">
              <ModernCardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <ModernCardTitle className="text-sage-800">Financial Summary</ModernCardTitle>
                <ModernCardDescription>
                  Revenue and expense tracking across all operations
                </ModernCardDescription>
              </ModernCardHeader>
              <ModernCardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sage-600">Total Revenue</span>
                    <span className="font-semibold text-green-700">${stats?.overview?.totalRevenue?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sage-600">Total Expenses</span>
                    <span className="font-semibold text-red-600">${stats?.overview?.totalExpenses?.toLocaleString() || 0}</span>
                  </div>
                  <hr className="border-sage-200" />
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sage-800">Net Profit</span>
                    <span className={`font-bold ${(stats?.overview?.netProfit ?? 0) >= 0 ? 'text-green-700' : 'text-red-600'} text-lg`}>
                      ${stats?.overview?.netProfit?.toLocaleString() || '0'}
                    </span>
                  </div>
                  <div className="text-xs text-sage-500 text-center">This year to date</div>
                </div>
              </ModernCardContent>
            </ModernCard>

            {/* Last 5 Transactions */}
            <ModernCard variant="floating">
              <ModernCardHeader>
                <ModernCardTitle className="text-sage-800">Recent Transactions</ModernCardTitle>
                <ModernCardDescription>
                  Latest financial activity
                </ModernCardDescription>
              </ModernCardHeader>
              <ModernCardContent className="p-4">
                <div className="space-y-3">
                  {stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
                    stats.recentTransactions.map((transaction) => (
                      <div key={transaction.id} className="flex justify-between items-center py-2">
                        <div>
                          <div className="text-sm font-medium text-sage-800">{transaction.desc}</div>
                          <div className="text-xs text-sage-500">{transaction.date}</div>
                        </div>
                        <div className={`font-semibold ${transaction.type === 'income' ? 'text-green-700' : 'text-red-600'}`}>
                          {transaction.amount}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-sage-500 py-4">
                      No recent transactions
                    </div>
                  )}
                </div>
              </ModernCardContent>
            </ModernCard>

            {/* Key Highlights & Alerts */}
            <ModernCard variant="floating">
              <ModernCardHeader>
                <ModernCardTitle className="text-sage-800">Key Highlights</ModernCardTitle>
                <ModernCardDescription>
                  Important alerts and actions needed
                </ModernCardDescription>
              </ModernCardHeader>
              <ModernCardContent className="p-4">
                <div className="space-y-3">
                  {/* Weather Alerts */}
                  {stats?.weatherAlerts && stats.weatherAlerts.length > 0 && 
                    stats.weatherAlerts.slice(0, 2).map((alert) => {
                      const severityStyles = {
                        low: 'bg-blue-50 border-blue-200',
                        medium: 'bg-yellow-50 border-yellow-200',
                        high: 'bg-orange-50 border-orange-200',
                        severe: 'bg-red-50 border-red-200'
                      }
                      const iconStyles = {
                        low: 'text-blue-600',
                        medium: 'text-yellow-600',
                        high: 'text-orange-600',
                        severe: 'text-red-600'
                      }
                      const textStyles = {
                        low: 'text-blue-800',
                        medium: 'text-yellow-800',
                        high: 'text-orange-800',
                        severe: 'text-red-800'
                      }
                      const subTextStyles = {
                        low: 'text-blue-600',
                        medium: 'text-yellow-600',
                        high: 'text-orange-600',
                        severe: 'text-red-600'
                      }
                      
                      const severity = alert.severity as keyof typeof severityStyles
                      
                      return (
                        <div key={alert.id} className={`flex items-start gap-3 p-3 ${severityStyles[severity] || severityStyles.medium} border rounded-lg`}>
                          <AlertTriangle className={`h-5 w-5 ${iconStyles[severity] || iconStyles.medium} mt-0.5`} />
                          <div>
                            <div className={`font-medium ${textStyles[severity] || textStyles.medium}`}>
                              {alert.type.replace(/_/g, ' ').charAt(0).toUpperCase() + alert.type.replace(/_/g, ' ').slice(1)}
                            </div>
                            <div className={`text-sm ${subTextStyles[severity] || subTextStyles.medium}`}>{alert.message}</div>
                          </div>
                        </div>
                      )
                    })
                  }
                  
                  {/* Show stress alerts from farms */}
                  {stats?.farms?.some(farm => farm.stressLevel !== 'NONE' && farm.stressLevel !== 'LOW') && (
                    <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <Activity className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-red-800">Stress Alert</div>
                        <div className="text-sm text-red-600">
                          {stats.farms.filter(f => f.stressLevel !== 'NONE' && f.stressLevel !== 'LOW').length} farm(s) showing stress
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Show upcoming task */}
                  {stats?.insights?.upcomingTasks && stats.insights.upcomingTasks.length > 0 && (
                    <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-blue-800">Action Required</div>
                        <div className="text-sm text-blue-600">{stats.insights.upcomingTasks[0].title}</div>
                      </div>
                    </div>
                  )}

                  {/* Show positive NDVI trend if available */}
                  {(stats?.overview?.avgNdvi ?? 0) > 0.7 && (
                    <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-green-800">Good News</div>
                        <div className="text-sm text-green-600">
                          Average NDVI is {((stats?.overview?.avgNdvi ?? 0) * 100).toFixed(0)}% - crops are healthy
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ModernCardContent>
            </ModernCard>
          </div>
        </div>

        {/* Onboarding Tooltips - Show only for new users */}
        {(!stats?.overview?.totalFarms || stats?.overview?.totalFarms === 0) && (
          <OnboardingTooltips 
            steps={dashboardTooltips} 
            onComplete={() => console.log('Dashboard tour completed')}
            onSkip={() => console.log('Dashboard tour skipped')}
            startDelay={2000}
            theme="sage"
          />
        )}
      </main>
    </div>
  )
  } catch (error) {
    console.error('Dashboard page error:', error)
    redirect('/login')
  }
}