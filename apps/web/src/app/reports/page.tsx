import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../lib/auth/session'
import { Navbar } from '../../components/navigation/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-agricultural">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600">Generate comprehensive reports for your farm operations</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span>Farm Performance</span>
                </CardTitle>
                <CardDescription>
                  Comprehensive analysis of farm productivity and efficiency
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    • Yield analysis by field
                  </div>
                  <div className="text-sm text-gray-600">
                    • Cost-benefit analysis
                  </div>
                  <div className="text-sm text-gray-600">
                    • Resource utilization
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    Generate Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weather Impact</CardTitle>
                <CardDescription>
                  How weather conditions affected your crops
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    • Rainfall vs irrigation needs
                  </div>
                  <div className="text-sm text-gray-600">
                    • Temperature stress analysis
                  </div>
                  <div className="text-sm text-gray-600">
                    • Weather-yield correlation
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    Generate Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Crop Health</CardTitle>
                <CardDescription>
                  Satellite and sensor data analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    • NDVI trends over time
                  </div>
                  <div className="text-sm text-gray-600">
                    • Stress detection areas
                  </div>
                  <div className="text-sm text-gray-600">
                    • Growth pattern analysis
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    Generate Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
                <CardDescription>
                  Revenue, costs, and profitability analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    • Revenue by crop type
                  </div>
                  <div className="text-sm text-gray-600">
                    • Operating cost breakdown
                  </div>
                  <div className="text-sm text-gray-600">
                    • Profit margin analysis
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    Generate Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sustainability</CardTitle>
                <CardDescription>
                  Environmental impact and sustainability metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    • Water usage efficiency
                  </div>
                  <div className="text-sm text-gray-600">
                    • Carbon footprint
                  </div>
                  <div className="text-sm text-gray-600">
                    • Soil health indicators
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    Generate Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Custom Report</CardTitle>
                <CardDescription>
                  Create a tailored report with specific metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    • Choose date range
                  </div>
                  <div className="text-sm text-gray-600">
                    • Select farms/fields
                  </div>
                  <div className="text-sm text-gray-600">
                    • Pick metrics to include
                  </div>
                  <Button className="w-full mt-4">
                    Create Custom Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
              <CardDescription>Your previously generated reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="text-gray-500 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 mb-2">No reports generated yet</p>
                <p className="text-sm text-gray-400">Generate your first report using one of the options above</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}