import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/session'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/navigation/navbar'

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user.name}!</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Farms</CardTitle>
                <CardDescription>Farms under your management</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-crops-green-700">0</div>
                <p className="text-sm text-gray-500">No farms yet</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Active Fields</CardTitle>
                <CardDescription>Fields currently in production</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-crops-green-700">0</div>
                <p className="text-sm text-gray-500">No fields yet</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Weather Alerts</CardTitle>
                <CardDescription>Current weather notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">0</div>
                <p className="text-sm text-gray-500">No alerts</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest farm management activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center text-gray-500 py-8">
                    <p>No recent activity</p>
                    <p className="text-sm">Start by creating your first farm</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks to get you started</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-crops-green-300 hover:bg-crops-green-50 transition-colors">
                    <div className="font-medium text-gray-900">Create New Farm</div>
                    <div className="text-sm text-gray-500">Add a new farm to your portfolio</div>
                  </button>
                  <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-crops-green-300 hover:bg-crops-green-50 transition-colors">
                    <div className="font-medium text-gray-900">View Weather Data</div>
                    <div className="text-sm text-gray-500">Check current weather conditions</div>
                  </button>
                  <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-crops-green-300 hover:bg-crops-green-50 transition-colors">
                    <div className="font-medium text-gray-900">Generate Report</div>
                    <div className="text-sm text-gray-500">Create analysis reports</div>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}