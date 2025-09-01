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
    // Get user's farms and fields data
    const [farms, fields, weatherAlerts] = await Promise.all([
      // Get farms count and basic info
      prisma.farm.findMany({
        where: { ownerId: userId },
        include: {
          fields: {
            select: {
              id: true,
              name: true,
              area: true,
              satelliteData: {
                where: {
                  captureDate: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                  }
                },
                orderBy: { captureDate: 'desc' },
                take: 5
              }
            }
          }
        }
      }),
      
      // Get active fields count
      prisma.field.count({
        where: {
          farm: { ownerId: userId }
        }
      }),

      // Simulate weather alerts count (would be real API call)
      Promise.resolve(Math.floor(Math.random() * 3)) // 0-2 alerts
    ])

    // Calculate statistics
    const totalFarms = farms.length
    const activeFields = fields
    const totalFields = farms.reduce((sum, farm) => sum + farm.fields.length, 0)
    
    // Generate recent activity from satellite data and farm operations
    const activityItems: Array<{
      id: string
      type: string
      title: string
      description: string
      timestamp: Date
      farmId: string
      farmName: string
      fieldId?: string
      fieldName?: string
    }> = []
    
    // Add farm creation activities
    farms.forEach(farm => {
      if (farm.createdAt && farm.createdAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) {
        activityItems.push({
          id: `farm-created-${farm.id}`,
          type: 'farm_created',
          title: `Farm "${farm.name}" created`,
          description: `New farm added to your portfolio`,
          timestamp: farm.createdAt,
          farmId: farm.id,
          farmName: farm.name
        })
      }
    })

    // Add field activity from satellite data
    farms.forEach(farm => {
      farm.fields.forEach(field => {
        field.satelliteData?.forEach(data => {
          activityItems.push({
            id: `satellite-${data.id}`,
            type: 'satellite_analysis',
            title: `Health analysis for ${field.name}`,
            description: `NDVI: ${data.ndvi?.toFixed(3)} | Stress: ${data.stressLevel?.toLowerCase()}`,
            timestamp: data.captureDate,
            farmId: farm.id,
            farmName: farm.name,
            fieldId: field.id,
            fieldName: field.name
          })
        })
      })
    })

    // Sort activities by date and take most recent
    activityItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    const recentActivities = activityItems.slice(0, 5)

    // Calculate total farm area
    const totalArea = farms.reduce((sum, farm) => {
      return sum + farm.fields.reduce((fieldSum, field) => fieldSum + (field.area || 0), 0)
    }, 0)

    // Health score simulation (would be from actual satellite analysis)
    const avgHealthScore = totalFields > 0 ? 75 + Math.random() * 20 : 0

    return {
      overview: {
        totalFarms,
        activeFields,
        totalFields,
        totalArea: Math.round(totalArea * 100) / 100, // hectares
        weatherAlerts,
        avgHealthScore: Math.round(avgHealthScore)
      },
      farms: farms.map(farm => ({
        id: farm.id,
        name: farm.name,
        totalArea: farm.totalArea,
        fieldsCount: farm.fields.length,
        activeFieldsCount: farm.fields.length, // All fields are considered active for now
        fieldsTotalArea: Math.round(farm.fields.reduce((sum, field) => sum + (field.area || 0), 0) * 100) / 100,
        createdAt: farm.createdAt
      })),
      recentActivity: recentActivities.map(activity => ({
        ...activity,
        timestamp: activity.timestamp.toISOString(),
        timeAgo: getTimeAgo(activity.timestamp)
      })),
      insights: {
        mostProductiveFarm: farms.length > 0 ? farms.reduce((prev, current) => 
          prev.fields.length > current.fields.length ? prev : current
        ).name : null,
        recommendedActions: generateRecommendations(farms, weatherAlerts),
        upcomingTasks: generateUpcomingTasks(farms)
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
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const stats = await getDashboardStats(user.id)

  return (
    <div className="minimal-page">
      <Navbar />
      
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-sage-50/80 to-earth-50/80 -z-10"></div>
      
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
                        <div className="text-2xl font-bold text-green-800">0.72</div>
                        <div className="text-sm text-green-600">Avg NDVI</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-800">22°C</div>
                        <div className="text-sm text-blue-600">Avg Temp</div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-800">65%</div>
                        <div className="text-sm text-orange-600">Humidity</div>
                      </div>
                    </div>

                    {/* Farm List */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-sage-800 mb-3">Your Farms</h3>
                      {[...Array(Math.min(stats?.overview?.totalFarms || 0, 3))].map((_, index) => (
                        <div key={index} className="border border-sage-200 rounded-lg p-4 hover:bg-sage-50 transition-colors cursor-pointer">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium text-sage-800">Farm {index + 1}</div>
                              <div className="text-sm text-sage-600">{Math.floor(Math.random() * 50 + 10)} hectares • {Math.floor(Math.random() * 5 + 2)} fields</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={`${Math.random() > 0.3 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {Math.random() > 0.3 ? 'Healthy' : 'Monitor'}
                              </Badge>
                              <div className="text-sm text-sage-500">NDVI: {(0.6 + Math.random() * 0.2).toFixed(2)}</div>
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
                  <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                    <div className="text-xl font-bold text-green-800">$6.85</div>
                    <div className="text-sm text-green-600">Corn ($/bushel)</div>
                    <div className="text-xs text-green-500">+2.3% today</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg">
                    <div className="text-xl font-bold text-yellow-800">$15.20</div>
                    <div className="text-sm text-yellow-600">Soybeans ($/bushel)</div>
                    <div className="text-xs text-yellow-500">-0.8% today</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg">
                    <div className="text-xl font-bold text-orange-800">$7.45</div>
                    <div className="text-sm text-orange-600">Wheat ($/bushel)</div>
                    <div className="text-xs text-orange-500">+1.2% today</div>
                  </div>
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
                    <span className="font-semibold text-green-700">$425,340</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sage-600">Total Expenses</span>
                    <span className="font-semibold text-red-600">$287,920</span>
                  </div>
                  <hr className="border-sage-200" />
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sage-800">Net Profit</span>
                    <span className="font-bold text-green-700 text-lg">$137,420</span>
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
                  {[
                    { type: 'income', desc: 'Corn harvest sale', amount: '+$12,450', date: '2 days ago' },
                    { type: 'expense', desc: 'Fertilizer purchase', amount: '-$3,200', date: '5 days ago' },
                    { type: 'income', desc: 'Soybean contract', amount: '+$8,750', date: '1 week ago' },
                    { type: 'expense', desc: 'Equipment maintenance', amount: '-$1,850', date: '1 week ago' },
                    { type: 'income', desc: 'Wheat delivery', amount: '+$6,900', date: '2 weeks ago' }
                  ].map((transaction, index) => (
                    <div key={index} className="flex justify-between items-center py-2">
                      <div>
                        <div className="text-sm font-medium text-sage-800">{transaction.desc}</div>
                        <div className="text-xs text-sage-500">{transaction.date}</div>
                      </div>
                      <div className={`font-semibold ${transaction.type === 'income' ? 'text-green-700' : 'text-red-600'}`}>
                        {transaction.amount}
                      </div>
                    </div>
                  ))}
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
                  {(stats?.overview?.weatherAlerts || 0) > 0 && (
                    <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-orange-800">Weather Alert</div>
                        <div className="text-sm text-orange-600">Heavy rain expected in 48 hours</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <Activity className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-red-800">Stress Alert</div>
                      <div className="text-sm text-red-600">Field 3A showing water stress</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-blue-800">Action Required</div>
                      <div className="text-sm text-blue-600">Irrigation schedule needs update</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-green-800">Good News</div>
                      <div className="text-sm text-green-600">NDVI improved 8% this week</div>
                    </div>
                  </div>
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
}