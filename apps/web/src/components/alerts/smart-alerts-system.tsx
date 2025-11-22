'use client'
import { useState, useEffect } from 'react'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../ui/modern-card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Alert, AlertDescription } from '../ui/alert'
import { 
  Bell, 
  BellRing, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp,
  CloudRain,
  Bug,
  DollarSign,
  Settings,
  X
} from 'lucide-react'
import { convertHealthScore, convertStressLevel } from '../../lib/farmer-language'
interface SmartAlert {
  id: string
  type: 'weather' | 'crop_health' | 'pest' | 'market' | 'financial'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  actionRequired: boolean
  timeframe: string
  farmField?: string
  confidence: number
  createdAt: Date
  dismissed?: boolean
}
interface SmartAlertsSystemProps {
  farmId: string
  userId: string
  isPremium?: boolean
}
export function SmartAlertsSystem({ farmId, userId, isPremium = false }: SmartAlertsSystemProps) {
  const [alerts, setAlerts] = useState<SmartAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  // Sample premium alerts to demonstrate value
  const generatePremiumAlerts = (): SmartAlert[] => [
    {
      id: '1',
      type: 'crop_health',
      severity: 'high',
      title: 'Corn Field Health Declining',
      message: 'North Field corn showing 15% decline in NDVI over past week. Potential nitrogen deficiency detected.',
      actionRequired: true,
      timeframe: 'Next 48 hours',
      farmField: 'North Field',
      confidence: 92,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    },
    {
      id: '2',
      type: 'weather',
      severity: 'critical',
      title: 'Frost Warning Tonight',
      message: 'Temperature dropping to 28°F tonight. Protect sensitive crops or expect 20-30% yield loss.',
      actionRequired: true,
      timeframe: 'Tonight (8 PM - 6 AM)',
      confidence: 95,
      createdAt: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
    },
    {
      id: '3',
      type: 'pest',
      severity: 'medium',
      title: 'Soybean Aphid Risk Increasing',
      message: 'Weather conditions favorable for aphid outbreak. Scout fields this week.',
      actionRequired: false,
      timeframe: 'This week',
      farmField: 'South Field',
      confidence: 78,
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
    },
    {
      id: '4',
      type: 'market',
      severity: 'medium',
      title: 'Corn Prices Trending Up',
      message: 'Corn futures up 8% this week. Consider selling stored grain if you have inventory.',
      actionRequired: false,
      timeframe: 'Next 2 weeks',
      confidence: 85,
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
    },
    {
      id: '5',
      type: 'financial',
      severity: 'low',
      title: 'Fertilizer Costs Rising',
      message: 'Nitrogen prices up 12% regionally. Consider bulk purchasing for next season.',
      actionRequired: false,
      timeframe: 'Next month',
      confidence: 73,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
    }
  ]
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        if (isPremium) {
          // In premium mode, show real AI-generated alerts
          const response = await fetch(`/api/alerts?farmId=${farmId}&userId=${userId}`)
          if (response.ok) {
            const data = await response.json()
            setAlerts(data.alerts || generatePremiumAlerts())
          } else {
            setAlerts(generatePremiumAlerts())
          }
        } else {
          // Show limited free alerts
          setAlerts(generatePremiumAlerts().slice(0, 2))
        }
      } catch (error) {
        console.error('Failed to fetch alerts:', error)
        setAlerts(isPremium ? generatePremiumAlerts() : generatePremiumAlerts().slice(0, 2))
      } finally {
        setLoading(false)
      }
    }
    fetchAlerts()
  }, [farmId, userId, isPremium])
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'weather': return <CloudRain className="h-5 w-5" />
      case 'crop_health': return <TrendingUp className="h-5 w-5" />
      case 'pest': return <Bug className="h-5 w-5" />
      case 'market': return <DollarSign className="h-5 w-5" />
      case 'financial': return <DollarSign className="h-5 w-5" />
      default: return <Bell className="h-5 w-5" />
    }
  }
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-blue-100 text-[#7A8F78] border-blue-200'
      default: return 'bg-[#F5F5F5] text-[#1A1A1A] border-[#F3F4F6]'
    }
  }
  const dismissAlert = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, dismissed: true } : alert
    ))
  }
  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }
  const activeAlerts = alerts.filter(alert => !alert.dismissed)
  const criticalAlerts = activeAlerts.filter(alert => alert.severity === 'critical' || alert.severity === 'high')
  if (loading) {
    return (
      <ModernCard>
        <ModernCardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#7A8F78]"></div>
            <span className="ml-3 text-[#555555]">Loading alerts...</span>
          </div>
        </ModernCardContent>
      </ModernCard>
    )
  }
  return (
    <div className="space-y-4">
      {/* Alert Summary Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <BellRing className="h-6 w-6 text-[#555555]" />
            {criticalAlerts.length > 0 && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                {criticalAlerts.length}
              </div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#1A1A1A]">Smart Alerts</h3>
            <p className="text-sm text-[#555555]">
              {activeAlerts.length} active alert{activeAlerts.length !== 1 ? 's' : ''}
              {criticalAlerts.length > 0 && (
                <span className="text-red-600 font-medium ml-2">
                  • {criticalAlerts.length} urgent
                </span>
              )}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)}>
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>
      {/* Premium Upgrade Notice for Free Users */}
      {!isPremium && (
        <Alert className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <div className="flex items-center justify-between">
              <div>
                <strong>Limited Alert Access</strong> - Upgrade to Premium for personalized AI alerts, 
                real-time crop monitoring, and advanced early warning systems.
              </div>
              <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-white ml-4">
                Upgrade Now
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      {/* Active Alerts List */}
      <div className="space-y-3">
        {activeAlerts.length === 0 ? (
          <ModernCard variant="soft">
            <ModernCardContent className="p-6 text-center">
              <CheckCircle2 className="h-12 w-12 text-[#8FBF7F] mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">All Clear!</h3>
              <p className="text-[#555555]">No active alerts for your farm right now.</p>
            </ModernCardContent>
          </ModernCard>
        ) : (
          activeAlerts.map((alert) => (
            <ModernCard key={alert.id} variant="soft" className={`border-l-4 ${
              alert.severity === 'critical' ? 'border-l-red-500' :
              alert.severity === 'high' ? 'border-l-orange-500' :
              alert.severity === 'medium' ? 'border-l-yellow-500' :
              'border-l-blue-500'
            }`}>
              <ModernCardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${
                      alert.type === 'weather' ? 'bg-blue-100 text-[#7A8F78]' :
                      alert.type === 'crop_health' ? 'bg-[#F8FAF8] text-[#8FBF7F]' :
                      alert.type === 'pest' ? 'bg-red-100 text-red-600' :
                      alert.type === 'market' ? 'bg-purple-100 text-purple-600' :
                      'bg-yellow-100 text-yellow-600'
                    }`}>
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-[#1A1A1A]">{alert.title}</h4>
                        <Badge className={getSeverityColor(alert.severity)} variant="outline">
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {alert.confidence}% confidence
                        </Badge>
                      </div>
                      <p className="text-[#555555] mb-3">{alert.message}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-[#555555]">
                        {alert.farmField && (
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Field:</span>
                            <span>{alert.farmField}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Timeframe:</span>
                          <span>{alert.timeframe}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>{formatTimeAgo(alert.createdAt)}</span>
                        </div>
                      </div>
                      {alert.actionRequired && (
                        <div className="mt-3 flex gap-2">
                          <Button size="sm" className="bg-[#7A8F78] hover:bg-[#5E6F5A]">
                            Take Action
                          </Button>
                          <Button size="sm" variant="outline">
                            Learn More
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissAlert(alert.id)}
                    className="flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </ModernCardContent>
            </ModernCard>
          ))
        )}
      </div>
      {/* Alert Settings Panel */}
      {showSettings && (
        <ModernCard>
          <ModernCardHeader>
            <ModernCardTitle>Alert Settings</ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-[#1A1A1A] mb-2">Alert Types</h4>
                  <div className="space-y-2">
                    {['Weather', 'Crop Health', 'Pest & Disease', 'Market', 'Financial'].map((type) => (
                      <label key={type} className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="rounded border-[#DDE4D8]" />
                        <span className="text-sm text-[#555555]">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-[#1A1A1A] mb-2">Notification Methods</h4>
                  <div className="space-y-2">
                    {['In-App', 'Email', 'SMS (Premium)', 'Push Notifications'].map((method) => (
                      <label key={method} className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          defaultChecked={method !== 'SMS (Premium)' || isPremium}
                          disabled={method === 'SMS (Premium)' && !isPremium}
                          className="rounded border-[#DDE4D8]" 
                        />
                        <span className={`text-sm ${method === 'SMS (Premium)' && !isPremium ? 'text-sage-400' : 'text-[#555555]'}`}>
                          {method}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-[#DDE4D8]">
                <Button className="bg-[#7A8F78] hover:bg-[#5E6F5A]">
                  Save Settings
                </Button>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>
      )}
    </div>
  )
}