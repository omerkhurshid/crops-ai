'use client'
import { useState, useEffect } from 'react'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../ui/modern-card'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { 
  CheckCircle, AlertTriangle, XCircle, Database, 
  Cpu, HardDrive, Wifi, Zap, RefreshCw 
} from 'lucide-react'
interface SystemStatus {
  database: 'healthy' | 'warning' | 'error'
  api: 'healthy' | 'warning' | 'error'
  satelliteService: 'healthy' | 'warning' | 'error'
  weatherService: 'healthy' | 'warning' | 'error'
  uptime: number
  responseTime: number
  errorRate: number
  lastUpdate: Date
}
export function SystemHealth() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    database: 'healthy',
    api: 'healthy',
    satelliteService: 'healthy',
    weatherService: 'warning',
    uptime: 99.8,
    responseTime: 245,
    errorRate: 0.12,
    lastUpdate: new Date()
  })
  const [loading, setLoading] = useState(false)
  const fetchSystemHealth = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/system-health')
      if (response.ok) {
        const data = await response.json()
        setSystemStatus({
          ...data,
          lastUpdate: new Date()
        })
      }
    } catch (error) {
      console.error('Failed to fetch system health:', error)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchSystemHealth()
    // Refresh every 30 seconds
    const interval = setInterval(fetchSystemHealth, 30000)
    return () => clearInterval(interval)
  }, [])
  const getStatusIcon = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-[#8FBF7F]" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />
    }
  }
  const getStatusColor = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy':
        return 'bg-[#F8FAF8] text-[#7A8F78] border-[#DDE4D8]'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200'
    }
  }
  const services = [
    {
      name: 'Database',
      status: systemStatus.database,
      icon: <Database className="h-4 w-4" />,
      description: 'PostgreSQL connection and query performance'
    },
    {
      name: 'API Layer',
      status: systemStatus.api,
      icon: <Zap className="h-4 w-4" />,
      description: 'REST API endpoints and authentication'
    },
    {
      name: 'Satellite Service',
      status: systemStatus.satelliteService,
      icon: <Wifi className="h-4 w-4" />,
      description: 'Copernicus and satellite data processing'
    },
    {
      name: 'Weather Service',
      status: systemStatus.weatherService,
      icon: <Cpu className="h-4 w-4" />,
      description: 'OpenWeatherMap and forecasting APIs'
    }
  ]
  return (
    <ModernCard variant="floating">
      <ModernCardHeader>
        <div className="flex items-center justify-between">
          <ModernCardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            System Health
          </ModernCardTitle>
          <button
            onClick={fetchSystemHealth}
            disabled={loading}
            className="p-2 hover:bg-[#F5F5F5] rounded-lg transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </ModernCardHeader>
      <ModernCardContent className="space-y-6">
        {/* Service Status */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Service Status</h4>
          <div className="space-y-3">
            {services.map((service) => (
              <div key={service.name} className="flex items-center justify-between p-3 bg-[#FAFAF7] rounded-lg">
                <div className="flex items-center gap-3">
                  {service.icon}
                  <div>
                    <div className="font-medium">{service.name}</div>
                    <div className="text-xs text-[#555555]">{service.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(service.status)}
                  <Badge className={getStatusColor(service.status)}>
                    {service.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Performance Metrics */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Performance Metrics</h4>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Uptime</span>
                <span className="text-sm font-bold text-[#8FBF7F]">{systemStatus.uptime}%</span>
              </div>
              <Progress value={systemStatus.uptime} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{systemStatus.responseTime}ms</div>
                <div className="text-xs text-blue-600">Avg Response Time</div>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{systemStatus.errorRate}%</div>
                <div className="text-xs text-red-600">Error Rate</div>
              </div>
            </div>
          </div>
        </div>
        {/* Last Update */}
        <div className="text-xs text-[#555555] text-center">
          Last updated: {systemStatus.lastUpdate.toLocaleTimeString()}
        </div>
      </ModernCardContent>
    </ModernCard>
  )
}