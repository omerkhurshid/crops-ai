'use client'
import React, { useState, useEffect } from 'react'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../ui/modern-card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { 
  Bug, 
  AlertTriangle, 
  Shield, 
  Calendar,
  DollarSign,
  Clock,
  TrendingUp,
  Eye,
  Zap
} from 'lucide-react'
import { cn } from '../../lib/utils'
interface DiseasePestAlertsWidgetProps {
  farmId: string
  className?: string
}
interface ThreatData {
  name: string
  type: 'disease' | 'pest'
  riskLevel: 'very_low' | 'low' | 'moderate' | 'high' | 'severe'
  affectedFields: number
  economicImpact: number
  timeToAction?: number
  recommendations?: string[]
}
interface FarmRiskSummary {
  overallRiskLevel: 'low' | 'moderate' | 'high' | 'severe'
  highRiskFields: string[]
  immediateActions: number
  monitoring: number
}
export function DiseasePestAlertsWidget({ farmId, className }: DiseasePestAlertsWidgetProps) {
  const [loading, setLoading] = useState(true)
  const [threats, setThreats] = useState<ThreatData[]>([])
  const [riskSummary, setRiskSummary] = useState<FarmRiskSummary | null>(null)
  const [seasonalOutlook, setSeasonalOutlook] = useState<{
    nextWeek: string
    nextMonth: string
    nextSeason: string
  } | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  useEffect(() => {
    // Don't make API calls if no valid farmId is provided
    if (!farmId || farmId === 'default') {
      setLoading(false)
      return
    }

    const fetchDiseasePestData = async () => {
      try {
        const response = await fetch(`/api/crop-health/disease-pest-analysis?farmId=${farmId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.farmAnalysis) {
            setThreats(data.farmAnalysis.topThreats || [])
            setRiskSummary(data.farmAnalysis.farmRiskSummary)
            setSeasonalOutlook(data.farmAnalysis.seasonalOutlook)
          }
        }
      } catch (error) {
        console.error('Error fetching disease/pest data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchDiseasePestData()
  }, [farmId])
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'very_low': return 'text-[#8FBF7F] bg-[#F8FAF8] border-[#DDE4D8]'
      case 'low': return 'text-[#8FBF7F] bg-[#F8FAF8] border-[#DDE4D8]'
      case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'severe': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-[#555555] bg-[#FAFAF7] border-[#E6E6E6]'
    }
  }
  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'severe':
      case 'high': return <AlertTriangle className="h-4 w-4" />
      case 'moderate': return <Eye className="h-4 w-4" />
      default: return <Shield className="h-4 w-4" />
    }
  }
  if (loading) {
    return (
      <ModernCard variant="soft" className={cn("p-6", className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-[#F5F5F5] rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-[#F5F5F5] rounded w-full"></div>
            <div className="h-4 bg-[#F5F5F5] rounded w-5/6"></div>
          </div>
        </div>
      </ModernCard>
    )
  }
  return (
    <ModernCard variant="soft" data-tour="health-section" className={cn("overflow-hidden", className)}>
      <ModernCardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <ModernCardTitle className="text-lg font-semibold text-[#1A1A1A] flex items-center gap-2">
              <div className="p-2 bg-red-50 rounded-lg">
                <Bug className="h-5 w-5 text-red-600" />
              </div>
              Disease & Pest Alert
            </ModernCardTitle>
            <p className="text-[#555555] mt-1">
              AI-powered threat detection and risk assessment
            </p>
          </div>
          {riskSummary && (
            <Badge 
              variant="outline" 
              className={cn(
                'px-3 py-1 font-medium border',
                getRiskColor(riskSummary.overallRiskLevel)
              )}
            >
              {riskSummary.overallRiskLevel.replace('_', ' ').toUpperCase()} RISK
            </Badge>
          )}
        </div>
      </ModernCardHeader>
      <ModernCardContent className="space-y-6">
        {riskSummary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#1A1A1A]">
                {riskSummary.highRiskFields.length}
              </div>
              <div className="text-sm text-[#555555]">High Risk Fields</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {riskSummary.immediateActions}
              </div>
              <div className="text-sm text-[#555555]">Immediate Actions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {riskSummary.monitoring}
              </div>
              <div className="text-sm text-[#555555]">Fields Monitored</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#8FBF7F]">
                {threats.length}
              </div>
              <div className="text-sm text-[#555555]">Active Threats</div>
            </div>
          </div>
        )}
        {/* Top Threats */}
        {threats.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-[#1A1A1A] flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Top Threats This Week
            </h4>
            <div className="space-y-2">
              {threats.slice(0, showDetails ? threats.length : 3).map((threat, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-[#F5F5F5]"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'p-2 rounded-lg',
                      threat.type === 'disease' ? 'bg-red-50' : 'bg-orange-50'
                    )}>
                      {threat.type === 'disease' ? (
                        <Zap className={cn(
                          'h-4 w-4',
                          threat.type === 'disease' ? 'text-red-600' : 'text-orange-600'
                        )} />
                      ) : (
                        <Bug className="h-4 w-4 text-orange-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-[#1A1A1A]">
                        {threat.name}
                      </div>
                      <div className="text-sm text-[#555555]">
                        {threat.affectedFields} field{threat.affectedFields !== 1 ? 's' : ''} affected
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        'px-2 py-1 text-xs font-medium border mb-1',
                        getRiskColor(threat.riskLevel)
                      )}
                    >
                      {getRiskIcon(threat.riskLevel)}
                      <span className="ml-1">
                        {threat.riskLevel.replace('_', ' ').toUpperCase()}
                      </span>
                    </Badge>
                    <div className="text-xs text-#555555 flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      ${threat.economicImpact}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {threats.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="w-full text-[#555555] hover:text-[#1A1A1A]"
              >
                {showDetails ? 'Show Less' : `Show ${threats.length - 3} More Threats`}
              </Button>
            )}
          </div>
        )}
        {/* Seasonal Outlook */}
        {seasonalOutlook && (
          <div className="space-y-3">
            <h4 className="font-medium text-[#1A1A1A] flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              Seasonal Outlook
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <div className="font-medium text-[#555555] min-w-[80px]">Next Week:</div>
                <div className="text-[#555555]">{seasonalOutlook.nextWeek}</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="font-medium text-[#555555] min-w-[80px]">Next Month:</div>
                <div className="text-[#555555]">{seasonalOutlook.nextMonth}</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="font-medium text-[#555555] min-w-[80px]">Next Season:</div>
                <div className="text-[#555555]">{seasonalOutlook.nextSeason}</div>
              </div>
            </div>
          </div>
        )}
        {/* Action Button */}
        <div className="pt-4 border-t border-[#F5F5F5]">
          <Button 
            variant="outline"
            className="w-full"
            onClick={() => window.location.href = `/crop-health?farmId=${farmId}`}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Detailed Crop Health Analysis
          </Button>
        </div>
        {/* No Data State */}
        {threats.length === 0 && !loading && (
          <div className="text-center py-8">
            <Shield className="h-12 w-12 mx-auto mb-4 text-[#8FBF7F]" />
            <h3 className="font-medium text-[#1A1A1A] mb-2">All Clear!</h3>
            <p className="text-[#555555] text-sm">
              No immediate disease or pest threats detected. Continue monitoring.
            </p>
          </div>
        )}
      </ModernCardContent>
    </ModernCard>
  )
}