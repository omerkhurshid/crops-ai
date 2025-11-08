'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '../../lib/auth-unified'
import { DashboardLayout } from '../../components/layout/dashboard-layout'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '../../components/ui/modern-card'
import { 
  FarmPerformancePreview,
  WeatherImpactPreview,
  CropHealthPreview,
  FinancialSummaryPreview,
  SustainabilityPreview,
  CustomReportPreview
} from '../../components/reports/farmer-friendly-preview-cards'
import { RecentReports } from '../../components/reports/recent-reports'
import { BenchmarkingSection } from '../../components/reports/benchmarking-section'
import { ClientFloatingButton } from '../../components/ui/client-floating-button'
import { BarChart, FileText, TrendingUp, DollarSign, Leaf, Plus, CloudRain, TreePine } from 'lucide-react'
export default function ReportsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    setIsLoading(false)
  }, [status, router])
  if (status === 'loading' || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-sage-600">Loading...</div>
        </div>
      </DashboardLayout>
    )
  }
  if (!session?.user) {
    return null
  }
  return (
    <DashboardLayout>
      {/* Floating Action Button */}
      <ClientFloatingButton
        icon={<Plus className="h-5 w-5" />}
        label="New Report"
        variant="primary"
      />
      <div className="max-w-7xl mx-auto pt-8 pb-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-8">
          {/* Page Header - Consistent with other pages */}
          <h1 className="text-4xl font-light text-sage-800 mb-2">Farm Reports</h1>
          <p className="text-lg text-sage-600 mb-6">
            View performance reports and analytics for your farming operations
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-8">
          <ModernCard variant="floating" className="group hover:scale-105 transition-all duration-300">
            <ModernCardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-sage-100 to-sage-50 rounded-2xl">
                  <BarChart className="h-6 w-6 text-sage-700" />
                </div>
              </div>
              <ModernCardTitle>How's Your Farm Doing?</ModernCardTitle>
              <ModernCardDescription>
                See if you're making more money than your neighbors and where you stand
              </ModernCardDescription>
            </ModernCardHeader>
            <ModernCardContent>
              <FarmPerformancePreview farmId={session.user.id} />
            </ModernCardContent>
          </ModernCard>
          <ModernCard variant="floating" className="group hover:scale-105 transition-all duration-300">
            <ModernCardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl">
                  <CloudRain className="h-6 w-6 text-blue-700" />
                </div>
              </div>
              <ModernCardTitle>Did Weather Help or Hurt?</ModernCardTitle>
              <ModernCardDescription>
                Find out if Mother Nature was on your side this season
              </ModernCardDescription>
            </ModernCardHeader>
            <ModernCardContent>
              <WeatherImpactPreview farmId={session.user.id} />
            </ModernCardContent>
          </ModernCard>
          <ModernCard variant="floating" className="group hover:scale-105 transition-all duration-300">
            <ModernCardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-cream-100 to-cream-50 rounded-2xl">
                  <Leaf className="h-6 w-6 text-sage-700" />
                </div>
              </div>
              <ModernCardTitle>Are Your Crops Happy?</ModernCardTitle>
              <ModernCardDescription>
                Spot problem areas before they cost you money
              </ModernCardDescription>
            </ModernCardHeader>
            <ModernCardContent>
              <CropHealthPreview farmId={session.user.id} />
            </ModernCardContent>
          </ModernCard>
          <ModernCard variant="floating" className="group hover:scale-105 transition-all duration-300">
            <ModernCardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-sage-100 to-sage-50 rounded-2xl">
                  <DollarSign className="h-6 w-6 text-sage-700" />
                </div>
              </div>
              <ModernCardTitle>Show Me the Money</ModernCardTitle>
              <ModernCardDescription>
                Where your dollars come from and where they go
              </ModernCardDescription>
            </ModernCardHeader>
            <ModernCardContent>
              <FinancialSummaryPreview farmId={session.user.id} />
            </ModernCardContent>
          </ModernCard>
          <ModernCard variant="floating" className="group hover:scale-105 transition-all duration-300">
            <ModernCardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-green-100 to-green-50 rounded-2xl">
                  <TreePine className="h-6 w-6 text-green-700" />
                </div>
              </div>
              <ModernCardTitle>Taking Care of the Land</ModernCardTitle>
              <ModernCardDescription>
                See how you're protecting the environment (and find incentive money)
              </ModernCardDescription>
            </ModernCardHeader>
            <ModernCardContent>
              <SustainabilityPreview farmId={session.user.id} />
            </ModernCardContent>
          </ModernCard>
          <ModernCard variant="glow" className="group hover:scale-105 transition-all duration-300">
            <ModernCardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-cream-100 to-cream-50 rounded-2xl">
                  <FileText className="h-6 w-6 text-sage-700" />
                </div>
              </div>
              <ModernCardTitle>Build Your Own</ModernCardTitle>
              <ModernCardDescription>
                Mix and match the information that matters most to you
              </ModernCardDescription>
            </ModernCardHeader>
            <ModernCardContent>
              <CustomReportPreview farmId={session.user.id} />
            </ModernCardContent>
          </ModernCard>
        </div>
        {/* Benchmarking Section */}
        <div className="mb-8">
          <BenchmarkingSection farm={{ id: session.user.id, name: 'Your Farm', totalArea: 100, region: 'Midwest' }} />
        </div>
        <ModernCard variant="soft">
          <ModernCardHeader>
            <ModernCardTitle>Your Recent Reports</ModernCardTitle>
            <ModernCardDescription>Reports you've looked at before</ModernCardDescription>
          </ModernCardHeader>
          <ModernCardContent>
            <RecentReports farmId={session.user.id} />
          </ModernCardContent>
        </ModernCard>
      </div>
    </DashboardLayout>
  )
}