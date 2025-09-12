import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../../../lib/auth/session'
import { Navbar } from '../../../../components/navigation/navbar'
import { FarmPerformanceReport } from '../../../../components/reports/farm-performance-report'
import { Button } from '../../../../components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function FarmPerformanceReportPage({ 
  params 
}: { 
  params: { farmId: string } 
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-cream-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/reports" className="inline-flex items-center gap-2 text-sage-600 hover:text-sage-800 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Reports
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-sage-800 mb-2">
                Farm Performance Report
              </h1>
              <p className="text-sage-600">
                Comprehensive analysis of your farm's productivity and efficiency
              </p>
            </div>
          </div>
        </div>

        <FarmPerformanceReport farmId={params.farmId} />
      </main>
    </div>
  )
}