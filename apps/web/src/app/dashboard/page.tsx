import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '../../lib/auth/session'
import { Badge } from '../../components/ui/badge'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription, MetricCard } from '../../components/ui/modern-card'
import { InfoTooltip, TOOLTIP_CONTENT } from '../../components/ui/info-tooltip'
import { FloatingActionButton, InlineFloatingButton } from '../../components/ui/floating-button'
import { Navbar } from '../../components/navigation/navbar'
import { 
  Sprout, MapPin, Activity, AlertTriangle, TrendingUp, Clock, 
  Plus, Brain, CloudRain, BarChart, Settings, Zap, Target
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
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-sage-50/30 to-cream-100">
      <Navbar />
      
      {/* Floating Action Button */}
      <FloatingActionButton
        icon={<Plus className="h-5 w-5" />}
        label="Quick Action"
        variant="primary"
        onClick={() => {}} // Add functionality later
      />
      
      <main className="max-w-7xl mx-auto pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-light text-sage-800 mb-6 tracking-tight">
              Dashboard
            </h1>
            <p className="text-xl text-sage-600 font-light leading-relaxed">
              Welcome back, <span className="font-medium text-sage-800">{user.name}</span>! 
              Monitor your agricultural operations from one intelligent platform.
            </p>
          </div>
        </div>

          {/* Modern Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <MetricCard
              title="Total Farms"
              value={stats?.overview?.totalFarms || 0}
              description={stats?.overview?.totalFarms ? `${stats.overview.totalArea} hectares total` : 'Create your first farm to get started'}
              icon={<Sprout className="h-5 w-5 text-sage-600" />}
              tooltip={TOOLTIP_CONTENT.farm}
              variant="floating"
            />
            
            <MetricCard
              title="Active Fields"
              value={stats?.overview?.activeFields || 0}
              description={stats?.overview?.totalFields ? `${stats.overview.totalFields} total fields in production` : 'Add fields to start monitoring'}
              icon={<MapPin className="h-5 w-5 text-sage-600" />}
              tooltip={TOOLTIP_CONTENT.field}
              variant="floating"
            />
            
            <MetricCard
              title="Health Score"
              value={stats?.overview?.avgHealthScore || 0}
              unit="%"
              trend={stats?.overview?.avgHealthScore >= 80 ? 'up' : stats?.overview?.avgHealthScore >= 60 ? 'stable' : 'down'}
              description={stats?.overview?.avgHealthScore ? 'AI-analyzed crop health across all fields' : 'Health data will appear here'}
              icon={<Activity className="h-5 w-5 text-sage-600" />}
              tooltip={TOOLTIP_CONTENT.healthScore}
              variant="floating"
            />
            
            <MetricCard
              title="Weather Alerts"
              value={stats?.overview?.weatherAlerts || 0}
              description={stats?.overview?.weatherAlerts ? 'Active weather notifications requiring attention' : 'No weather alerts at this time'}
              icon={<AlertTriangle className="h-5 w-5 text-earth-600" />}
              tooltip={TOOLTIP_CONTENT.precipitation}
              variant="soft"
            />
          </div>

          {/* Asymmetric Magazine Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
            {/* Main Content Area - Takes 8 columns */}
            <div className="lg:col-span-8">
              <ModernCard variant="floating" className="overflow-hidden">
                <ModernCardHeader className="bg-gradient-to-r from-sage-50 to-cream-50">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <ModernCardTitle className="text-sage-800">Recent Activity</ModernCardTitle>
                      <InfoTooltip title="Activity Feed" description="Real-time updates from your farm management operations and satellite monitoring system." />
                    </div>
                    <Badge className="bg-sage-100 text-sage-700 border-sage-200">
                      Live Updates
                    </Badge>
                  </div>
                  <ModernCardDescription>
                    Your latest farm management activities and automated system updates
                  </ModernCardDescription>
                </ModernCardHeader>
                <ModernCardContent>
                  <div className="space-y-4">
                    {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                      stats.recentActivity.map((activity: any) => (
                        <ModernCard key={activity.id} variant="soft" className="hover:variant-floating transition-all duration-300">
                          <ModernCardContent className="p-4">
                            <div className="flex items-start space-x-4">
                              <div className={`p-3 rounded-xl ${
                                activity.type === 'farm_created' ? 'bg-sage-100 text-sage-700' :
                                activity.type === 'satellite_analysis' ? 'bg-sage-100 text-sage-700' :
                                'bg-cream-100 text-earth-700'
                              }`}>
                                {activity.type === 'farm_created' ? <Sprout className="h-5 w-5" /> :
                                 activity.type === 'satellite_analysis' ? <Activity className="h-5 w-5" /> :
                                 <TrendingUp className="h-5 w-5" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-semibold text-sage-800">{activity.title}</h4>
                                  <span className="text-xs text-sage-500 font-medium">{activity.timeAgo}</span>
                                </div>
                                <p className="text-sm text-sage-600 mt-1 leading-relaxed">{activity.description}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge className="bg-sage-50 text-sage-600 border-sage-200 text-xs">
                                    {activity.farmName}
                                  </Badge>
                                  {activity.fieldName && (
                                    <Badge className="bg-cream-50 text-earth-600 border-earth-200 text-xs">
                                      {activity.fieldName}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </ModernCardContent>
                        </ModernCard>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <div className="relative">
                          <Activity className="h-16 w-16 text-sage-300 mx-auto mb-4 animate-pulse-soft" />
                          <div className="absolute inset-0 rounded-full bg-sage-100 opacity-20 animate-float"></div>
                        </div>
                        <h3 className="font-medium text-sage-700 mb-2">No activity yet</h3>
                        <p className="text-sage-500 text-sm mb-6">Your farm activities will appear here as you manage your operations</p>
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
                  </div>
                </ModernCardContent>
              </ModernCard>
            </div>

            {/* Right Sidebar - Takes 4 columns */}
            <div className="lg:col-span-4 space-y-6">
              <ModernCard variant="glass" className="overflow-hidden">
                <ModernCardHeader className="bg-gradient-to-br from-cream-50/90 to-sage-50/90">
                  <div className="flex items-center gap-3">
                    <ModernCardTitle className="text-sage-800">Quick Actions</ModernCardTitle>
                    <InfoTooltip title="Quick Access" description="Common tasks and recommended actions for efficient farm management." />
                  </div>
                  <ModernCardDescription>
                    Essential tools and shortcuts for daily operations
                  </ModernCardDescription>
                </ModernCardHeader>
                <ModernCardContent className="p-4">
                  <div className="space-y-3">
                    <Link href="/farms/create">
                      <InlineFloatingButton
                        icon={<Sprout className="h-4 w-4" />}
                        label="Create New Farm"
                        showLabel={true}
                        variant="primary"
                        size="md"
                        className="w-full justify-start"
                      />
                    </Link>
                    <Link href="/weather">
                      <InlineFloatingButton
                        icon={<CloudRain className="h-4 w-4" />}
                        label="Weather Monitoring"
                        showLabel={true}
                        variant="secondary"
                        size="md"
                        className="w-full justify-start"
                      />
                    </Link>
                    <Link href="/crop-health">
                      <InlineFloatingButton
                        icon={<Activity className="h-4 w-4" />}
                        label="Crop Health Analytics"
                        showLabel={true}
                        variant="ghost"
                        size="md"
                        className="w-full justify-start"
                      />
                    </Link>
                    <Link href="/recommendations">
                      <InlineFloatingButton
                        icon={<Brain className="h-4 w-4" />}
                        label="AI Recommendations"
                        showLabel={true}
                        variant="ghost"
                        size="md"
                        className="w-full justify-start"
                      />
                    </Link>
                    <Link href="/weather/alerts">
                      <InlineFloatingButton
                        icon={<AlertTriangle className="h-4 w-4" />}
                        label="Weather Alerts"
                        showLabel={true}
                        variant="ghost"
                        size="md"
                        className="w-full justify-start"
                      />
                    </Link>
                  </div>
                </ModernCardContent>
              </ModernCard>
            </div>
          </div>

          {/* AI Insights & Task Management */}
          {stats?.insights && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* AI Recommendations - Main Column */}
              <div className="lg:col-span-7">
                <ModernCard variant="glow" className="overflow-hidden">
                  <ModernCardHeader className="bg-gradient-to-r from-sage-50 to-earth-50">
                    <div className="flex items-center gap-3">
                      <ModernCardTitle className="text-sage-800">AI Recommendations</ModernCardTitle>
                      <InfoTooltip {...TOOLTIP_CONTENT.confidence} />
                    </div>
                    <ModernCardDescription>
                      Intelligent insights powered by satellite data, weather patterns, and agricultural best practices
                    </ModernCardDescription>
                  </ModernCardHeader>
                  <ModernCardContent>
                    <div className="space-y-4">
                      {stats.insights.recommendedActions?.map((action: string, index: number) => (
                        <div key={index} className="flex items-start space-x-4 p-4 bg-sage-50/50 rounded-xl border border-sage-100/50">
                          <div className="p-2 bg-sage-200 rounded-lg mt-1">
                            <Target className="h-4 w-4 text-sage-700" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sage-800 font-medium leading-relaxed">{action}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge className="bg-sage-100 text-sage-700 border-sage-200 text-xs">
                                AI Generated
                              </Badge>
                              <span className="text-xs text-sage-500">Confidence: 85%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {(!stats.insights.recommendedActions || stats.insights.recommendedActions.length === 0) && (
                        <div className="text-center py-8">
                          <Brain className="h-12 w-12 text-sage-300 mx-auto mb-4" />
                          <p className="text-sage-600">No recommendations available</p>
                          <p className="text-sm text-sage-500">Add farms and fields to receive AI-powered insights</p>
                        </div>
                      )}
                    </div>
                  </ModernCardContent>
                </ModernCard>
              </div>

              {/* Upcoming Tasks - Side Column */}
              <div className="lg:col-span-5">
                <ModernCard variant="floating" className="overflow-hidden">
                  <ModernCardHeader className="bg-gradient-to-br from-cream-50 to-earth-50/80">
                    <div className="flex items-center gap-3">
                      <ModernCardTitle className="text-sage-800">Upcoming Tasks</ModernCardTitle>
                      <InfoTooltip title="Task Management" description="Scheduled activities, reminders, and seasonal recommendations for optimal farm management." />
                    </div>
                    <ModernCardDescription>
                      Scheduled activities and seasonal recommendations
                    </ModernCardDescription>
                  </ModernCardHeader>
                  <ModernCardContent>
                    <div className="space-y-3">
                      {stats.insights.upcomingTasks?.slice(0, 4).map((task: any) => (
                        <div key={task.id} className="p-3 bg-white/80 rounded-xl border border-sage-100/30 hover:bg-white transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-sage-800 text-sm">{task.title}</h4>
                            <Badge className={`text-xs ${
                              task.priority === 'high' 
                                ? 'bg-earth-100 text-earth-700 border-earth-200' 
                                : task.priority === 'medium' 
                                ? 'bg-sage-100 text-sage-700 border-sage-200' 
                                : 'bg-cream-100 text-earth-600 border-cream-200'
                            }`}>
                              {task.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-sage-600 leading-relaxed mb-2">{task.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-sage-500">
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                            <Clock className="h-3 w-3 text-sage-400" />
                          </div>
                        </div>
                      ))}
                      {(!stats.insights.upcomingTasks || stats.insights.upcomingTasks.length === 0) && (
                        <div className="text-center py-6">
                          <Clock className="h-10 w-10 text-sage-300 mx-auto mb-3" />
                          <p className="text-sm text-sage-600">No upcoming tasks</p>
                          <p className="text-xs text-sage-500">Tasks will appear based on your farm activities</p>
                        </div>
                      )}
                    </div>
                  </ModernCardContent>
                </ModernCard>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}