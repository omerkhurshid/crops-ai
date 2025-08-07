import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '../../lib/auth/session'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Navbar } from '../../components/navigation/navbar'
import { Sprout, MapPin, Activity, AlertTriangle, TrendingUp, Clock } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getDashboardStats() {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/dashboard/stats`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats')
    }
    
    const data = await response.json()
    return data.data
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return null
  }
}

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const stats = await getDashboardStats()

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
                <Link href="/farms/create" className="block w-full text-left p-3 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/10 transition-colors">
                  <div className="font-medium text-gray-900">Create New Farm</div>
                  <div className="text-sm text-gray-500">Add a new farm to your portfolio</div>
                </Link>
                <Link href="/weather" className="block w-full text-left p-3 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/10 transition-colors">
                  <div className="font-medium text-gray-900">View Weather Data</div>
                  <div className="text-sm text-gray-500">Check current weather conditions</div>
                </Link>
                <Link href="/crop-health" className="block w-full text-left p-3 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/10 transition-colors">
                  <div className="font-medium text-gray-900">Crop Health Analytics</div>
                  <div className="text-sm text-gray-500">Monitor vegetation health via satellite</div>
                </Link>
                <Link href="/recommendations" className="block w-full text-left p-3 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/10 transition-colors">
                  <div className="font-medium text-gray-900">AI Insights</div>
                  <div className="text-sm text-gray-500">Get intelligent recommendations</div>
                </Link>
                <Link href="/weather/alerts" className="block w-full text-left p-3 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/10 transition-colors">
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