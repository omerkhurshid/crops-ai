import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../lib/auth/session'
import { DashboardLayout } from '../../components/layout/dashboard-layout'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '../../components/ui/modern-card'
import { 
  FarmPerformancePreview,
  WeatherImpactPreview,
  CropHealthPreview,
  FinancialSummaryPreview,
  SustainabilityPreview,
  CustomReportPreview
} from '../../components/reports/report-preview-cards'
import { RecentReports } from '../../components/reports/recent-reports'
import { InfoTooltip } from '../../components/ui/info-tooltip'
import { TOOLTIP_CONTENT } from '../../lib/tooltip-content'
import { ClientFloatingButton } from '../../components/ui/client-floating-button'
import { BarChart, FileText, TrendingUp, DollarSign, Leaf, Plus, CloudRain, TreePine } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <DashboardLayout>
      {/* Floating Action Button */}
      <ClientFloatingButton
        icon={<Plus className="h-5 w-5" />}
        label="New Report"
        variant="primary"
      />
      
      {/* Animated Background with Floating Elements */}
      <div className="absolute top-20 left-20 p-6 bg-white/70 backdrop-blur-md rounded-3xl shadow-floating animate-float">
        <BarChart className="h-8 w-8 text-sage-600" />
      </div>
      <div className="absolute bottom-20 right-20 p-6 bg-white/70 backdrop-blur-md rounded-3xl shadow-floating animate-float" style={{ animationDelay: '2s' }}>
        <FileText className="h-8 w-8 text-sage-600" />
      </div>
      
      <div className="max-w-7xl mx-auto pt-8 pb-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-16">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-light text-sage-800 mb-6 tracking-tight">
              Reports & Analytics
            </h1>
            <p className="text-xl text-sage-600 font-light leading-relaxed">
              Generate comprehensive insights and detailed reports for your agricultural operations.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-16">
          <ModernCard variant="floating" className="group hover:scale-105 transition-all duration-300">
            <ModernCardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-sage-100 to-sage-50 rounded-2xl">
                  <BarChart className="h-6 w-6 text-sage-700" />
                </div>
                <InfoTooltip {...TOOLTIP_CONTENT.yieldPrediction} />
              </div>
              <ModernCardTitle>Farm Performance</ModernCardTitle>
              <ModernCardDescription>
                Comprehensive analysis of farm productivity and efficiency
              </ModernCardDescription>
            </ModernCardHeader>
            <ModernCardContent>
              <FarmPerformancePreview farmId={user.id} />
            </ModernCardContent>
          </ModernCard>

          <ModernCard variant="floating" className="group hover:scale-105 transition-all duration-300">
            <ModernCardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl">
                  <CloudRain className="h-6 w-6 text-blue-700" />
                </div>
                <InfoTooltip {...TOOLTIP_CONTENT.precipitation} />
              </div>
              <ModernCardTitle>Weather Impact</ModernCardTitle>
              <ModernCardDescription>
                How weather conditions affected your crops
              </ModernCardDescription>
            </ModernCardHeader>
            <ModernCardContent>
              <WeatherImpactPreview farmId={user.id} />
            </ModernCardContent>
          </ModernCard>

          <ModernCard variant="floating" className="group hover:scale-105 transition-all duration-300">
            <ModernCardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-cream-100 to-cream-50 rounded-2xl">
                  <Leaf className="h-6 w-6 text-sage-700" />
                </div>
                <InfoTooltip {...TOOLTIP_CONTENT.healthScore} />
              </div>
              <ModernCardTitle>Crop Health</ModernCardTitle>
              <ModernCardDescription>
                Satellite and sensor data analysis
              </ModernCardDescription>
            </ModernCardHeader>
            <ModernCardContent>
              <CropHealthPreview farmId={user.id} />
            </ModernCardContent>
          </ModernCard>

          <ModernCard variant="floating" className="group hover:scale-105 transition-all duration-300">
            <ModernCardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-sage-100 to-sage-50 rounded-2xl">
                  <DollarSign className="h-6 w-6 text-sage-700" />
                </div>
                <InfoTooltip {...TOOLTIP_CONTENT.commodityPrice} />
              </div>
              <ModernCardTitle>Financial Summary</ModernCardTitle>
              <ModernCardDescription>
                Revenue, costs, and profitability analysis
              </ModernCardDescription>
            </ModernCardHeader>
            <ModernCardContent>
              <FinancialSummaryPreview farmId={user.id} />
            </ModernCardContent>
          </ModernCard>

          <ModernCard variant="floating" className="group hover:scale-105 transition-all duration-300">
            <ModernCardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-green-100 to-green-50 rounded-2xl">
                  <TreePine className="h-6 w-6 text-green-700" />
                </div>
                <InfoTooltip title="Sustainability Metrics" description="Environmental impact tracking and sustainable farming practice analysis." />
              </div>
              <ModernCardTitle>Sustainability</ModernCardTitle>
              <ModernCardDescription>
                Environmental impact and sustainability metrics
              </ModernCardDescription>
            </ModernCardHeader>
            <ModernCardContent>
              <SustainabilityPreview farmId={user.id} />
            </ModernCardContent>
          </ModernCard>

          <ModernCard variant="glow" className="group hover:scale-105 transition-all duration-300">
            <ModernCardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-cream-100 to-cream-50 rounded-2xl">
                  <FileText className="h-6 w-6 text-sage-700" />
                </div>
                <InfoTooltip title="Custom Reports" description="Create tailored reports with specific metrics and date ranges for your unique needs." />
              </div>
              <ModernCardTitle>Custom Report</ModernCardTitle>
              <ModernCardDescription>
                Create a tailored report with specific metrics
              </ModernCardDescription>
            </ModernCardHeader>
            <ModernCardContent>
              <CustomReportPreview farmId={user.id} />
            </ModernCardContent>
          </ModernCard>
        </div>

        <ModernCard variant="soft">
          <ModernCardHeader>
            <ModernCardTitle>Recent Reports</ModernCardTitle>
            <ModernCardDescription>Your previously generated reports</ModernCardDescription>
          </ModernCardHeader>
          <ModernCardContent>
            <RecentReports farmId={user.id} />
          </ModernCardContent>
        </ModernCard>
      </div>
    </DashboardLayout>
  )
}