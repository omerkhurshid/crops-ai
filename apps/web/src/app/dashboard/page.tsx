import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '../../lib/auth/session'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Navbar } from '../../components/navigation/navbar'
import { Sprout, MapPin, Activity, AlertTriangle, TrendingUp, Clock } from 'lucide-react'
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
    <div className="min-h-screen bg-agricultural">
      <div className="absolute inset-0 agricultural-overlay"></div>
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 relative z-10">
        <div className="px-8 lg:px-16 py-12 sm:px-0">
          <div className="mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">Dashboard</h1>
            <p className="text-2xl text-white/80 font-light">Welcome back, {user.name}!</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card-gradient">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-gradient-crops rounded-full mr-3">
                  <Sprout className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Total Farms</h3>
                  <p className="text-sm text-gray-600">Farms under your management</p>
                </div>
              </div>
              <div className="text-3xl font-bold text-gradient mb-2">
                {stats?.overview?.totalFarms || 0}
              </div>
              <p className="text-sm text-gray-500">
                {stats?.overview?.totalFarms ? `${stats.overview.totalArea} hectares total` : 'No farms yet'}
              </p>
            </div>

            <div className="card-gradient">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-blue-500 rounded-full mr-3">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Active Fields</h3>
                  <p className="text-sm text-gray-600">Fields currently in production</p>
                </div>
              </div>
              <div className="text-3xl font-bold text-gradient mb-2">
                {stats?.overview?.activeFields || 0}
              </div>
              <p className="text-sm text-gray-500">
                {stats?.overview?.totalFields ? `${stats.overview.totalFields} total fields` : 'No fields yet'}
              </p>
            </div>

            <div className="card-gradient">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-emerald-500 rounded-full mr-3">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Health Score</h3>
                  <p className="text-sm text-gray-600">Average crop health</p>
                </div>
              </div>
              <div className="text-3xl font-bold text-gradient mb-2">
                {stats?.overview?.avgHealthScore || 0}
              </div>
              <p className="text-sm text-gray-500">
                {stats?.overview?.avgHealthScore ? `${stats.overview.avgHealthScore}/100 average` : 'No data yet'}
              </p>
            </div>

            <div className="card-gradient">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-yellow-500 rounded-full mr-3">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Weather Alerts</h3>
                  <p className="text-sm text-gray-600">Current notifications</p>
                </div>
              </div>
              <div className="text-3xl font-bold text-gradient mb-2">
                {stats?.overview?.weatherAlerts || 0}
              </div>
              <p className="text-sm text-gray-500">
                {stats?.overview?.weatherAlerts ? 'Active alerts' : 'No alerts'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="card-gradient">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-blue-500 rounded-full mr-3">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Recent Activity</h3>
                  <p className="text-gray-600">Your latest farm management activities</p>
                </div>
              </div>
              <div className="space-y-4">
                {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                  stats.recentActivity.map((activity: any) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 bg-white/50 rounded-lg">
                      <div className={`p-2 rounded-full ${
                        activity.type === 'farm_created' ? 'bg-green-100 text-green-600' :
                        activity.type === 'satellite_analysis' ? 'bg-blue-100 text-blue-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {activity.type === 'farm_created' ? <Sprout className="h-4 w-4" /> :
                         activity.type === 'satellite_analysis' ? <TrendingUp className="h-4 w-4" /> :
                         <Activity className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900">{activity.title}</div>
                        <div className="text-sm text-gray-600">{activity.description}</div>
                        <div className="text-xs text-gray-500 mt-1">{activity.timeAgo}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No recent activity</p>
                    <p className="text-sm">Start by creating your first farm</p>
                  </div>
                )}
              </div>
            </div>

            <div className="card-gradient">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Quick Actions</h3>
                <p className="text-gray-600">Common tasks and recommended actions</p>
              </div>
              <div className="space-y-3">
                <Link href="/farms/create" className="block w-full text-left p-3 rounded-lg border-2 border-gray-200 hover:border-primary hover:bg-primary/10 transition-colors">
                  <div className="font-medium text-gray-900">Create New Farm</div>
                  <div className="text-sm text-gray-500">Add a new farm to your portfolio</div>
                </Link>
                <Link href="/weather" className="block w-full text-left p-3 rounded-lg border-2 border-gray-200 hover:border-primary hover:bg-primary/10 transition-colors">
                  <div className="font-medium text-gray-900">View Weather Data</div>
                  <div className="text-sm text-gray-500">Check current weather conditions</div>
                </Link>
                <Link href="/crop-health" className="block w-full text-left p-3 rounded-lg border-2 border-gray-200 hover:border-primary hover:bg-primary/10 transition-colors">
                  <div className="font-medium text-gray-900">Crop Health Analytics</div>
                  <div className="text-sm text-gray-500">Monitor vegetation health via satellite</div>
                </Link>
                <Link href="/recommendations" className="block w-full text-left p-3 rounded-lg border-2 border-gray-200 hover:border-primary hover:bg-primary/10 transition-colors">
                  <div className="font-medium text-gray-900">AI Insights</div>
                  <div className="text-sm text-gray-500">Get intelligent recommendations</div>
                </Link>
                <Link href="/weather/alerts" className="block w-full text-left p-3 rounded-lg border-2 border-gray-200 hover:border-primary hover:bg-primary/10 transition-colors">
                  <div className="font-medium text-gray-900">Weather Alerts</div>
                  <div className="text-sm text-gray-500">Monitor extreme weather conditions</div>
                </Link>
              </div>
            </div>
          </div>

          {/* Additional Insights */}
          {stats?.insights && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card-gradient">
                <div className="flex items-center mb-6">
                  <div className="p-2 bg-blue-500 rounded-full mr-3">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Recommendations</h3>
                    <p className="text-gray-600">AI-powered suggestions for your farm</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {stats.insights.recommendedActions?.map((action: string, index: number) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700">{action}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card-gradient">
                <div className="flex items-center mb-6">
                  <div className="p-2 bg-orange-500 rounded-full mr-3">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Upcoming Tasks</h3>
                    <p className="text-gray-600">Scheduled activities and reminders</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {stats.insights.upcomingTasks?.slice(0, 3).map((task: any) => (
                    <div key={task.id} className="flex items-start justify-between p-2 bg-white/50 rounded">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{task.title}</div>
                        <div className="text-sm text-gray-600">{task.description}</div>
                      </div>
                      <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}>
                        {task.priority}
                      </Badge>
                    </div>
                  ))}
                  {(!stats.insights.upcomingTasks || stats.insights.upcomingTasks.length === 0) && (
                    <div className="text-center text-gray-500 py-4">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No upcoming tasks</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}