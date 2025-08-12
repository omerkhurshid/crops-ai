import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../lib/auth/session'
import { Navbar } from '../../components/navigation/navbar'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '../../components/ui/modern-card'
import { FarmPerformanceReport } from '../../components/reports/farm-performance-report'
import { WeatherImpactReport } from '../../components/reports/weather-impact-report' 
import { CropHealthReport } from '../../components/reports/crop-health-report'
import { FinancialReport } from '../../components/reports/financial-report'
import { SustainabilityReport } from '../../components/reports/sustainability-report'
import { CustomReportBuilder } from '../../components/reports/custom-report-builder'
import { RecentReports } from '../../components/reports/recent-reports'
import { InfoTooltip } from '../../components/ui/info-tooltip'
import { TOOLTIP_CONTENT } from '../../lib/tooltip-content'
import { ClientFloatingButton } from '../../components/ui/client-floating-button'
import { BarChart, FileText, TrendingUp, DollarSign, Leaf, Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="minimal-page">
      <Navbar />
      
      {/* Floating Action Button */}
      <ClientFloatingButton
        icon={<Plus className="h-5 w-5" />}
        label="New Report"
        variant="primary"
      />
      
      <main className="max-w-7xl mx-auto pt-24 pb-12 px-4 sm:px-6 lg:px-8">
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
              <FarmPerformanceReport farmId={user.id} />
            </ModernCardContent>
          </ModernCard>

          <ModernCard variant="floating" className="group hover:scale-105 transition-all duration-300">
            <ModernCardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-earth-100 to-earth-50 rounded-2xl">
                  <TrendingUp className="h-6 w-6 text-earth-700" />
                </div>
                <InfoTooltip {...TOOLTIP_CONTENT.precipitation} />
              </div>
              <ModernCardTitle>Weather Impact</ModernCardTitle>
              <ModernCardDescription>
                How weather conditions affected your crops
              </ModernCardDescription>
            </ModernCardHeader>
            <ModernCardContent>
              <WeatherImpactReport farmId={user.id} />
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
              <CropHealthReport farmId={user.id} />
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
              <FinancialReport farmId={user.id} />
            </ModernCardContent>
          </ModernCard>

          <ModernCard variant="floating" className="group hover:scale-105 transition-all duration-300">
            <ModernCardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-earth-100 to-earth-50 rounded-2xl">
                  <Leaf className="h-6 w-6 text-earth-700" />
                </div>
                <InfoTooltip title="Sustainability Metrics" description="Environmental impact tracking and sustainable farming practice analysis." />
              </div>
              <ModernCardTitle>Sustainability</ModernCardTitle>
              <ModernCardDescription>
                Environmental impact and sustainability metrics
              </ModernCardDescription>
            </ModernCardHeader>
            <ModernCardContent>
              <SustainabilityReport farmId={user.id} />
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
              <CustomReportBuilder farmId={user.id} />
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
      </main>
    </div>
  )
}