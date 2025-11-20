'use client'
import { useState, useEffect } from 'react'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../ui/modern-card'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { 
  BarChart3, TrendingUp, Users, MapPin, 
  Calendar, Clock, Globe, DollarSign 
} from 'lucide-react'
interface AdminMetricsProps {
  totalUsers: number
  totalFarms: number
  totalFields: number
  activeUsers: number
  userGrowthRate: number
}
interface MetricData {
  label: string
  value: number
  change: number
  period: string
}
export function AdminMetrics({ 
  totalUsers, 
  totalFarms, 
  totalFields, 
  activeUsers, 
  userGrowthRate 
}: AdminMetricsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('7d')
  const [metrics, setMetrics] = useState<MetricData[]>([])
  useEffect(() => {
    // Generate some sample metrics data
    const generateMetrics = () => {
      const baseMetrics = [
        { label: 'Daily Active Users', value: Math.round(activeUsers * 0.3), change: 12.5, period: selectedPeriod },
        { label: 'New Farm Registrations', value: Math.round(totalFarms * 0.1), change: 8.3, period: selectedPeriod },
        { label: 'Field Additions', value: Math.round(totalFields * 0.15), change: 15.7, period: selectedPeriod },
        { label: 'Feature Usage Rate', value: Math.round(activeUsers * 0.75), change: 5.2, period: selectedPeriod },
        { label: 'API Requests', value: totalUsers * 150, change: 22.1, period: selectedPeriod },
        { label: 'Support Tickets', value: Math.round(totalUsers * 0.05), change: -3.4, period: selectedPeriod }
      ]
      setMetrics(baseMetrics)
    }
    generateMetrics()
  }, [selectedPeriod, totalUsers, totalFarms, totalFields, activeUsers])
  const overallHealth = () => {
    const userRetention = (activeUsers / totalUsers) * 100
    const growthScore = Math.min(Math.max(userGrowthRate, -50), 50) + 50
    const adoptionScore = ((totalFarms / totalUsers) * 100) * 2 // Assuming good adoption is 50%
    return Math.round((userRetention + growthScore + adoptionScore) / 3)
  }
  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }
  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600'
    if (change < 0) return 'text-red-600'
    return 'text-[#555555]'
  }
  const businessMetrics = [
    {
      title: 'User Engagement',
      value: `${Math.round((activeUsers / totalUsers) * 100)}%`,
      description: 'Users active in last 30 days',
      icon: <Users className="h-5 w-5 text-blue-600" />
    },
    {
      title: 'Farm Adoption',
      value: `${Math.round((totalFarms / totalUsers) * 100)}%`,
      description: 'Users who created farms',
      icon: <MapPin className="h-5 w-5 text-green-600" />
    },
    {
      title: 'Platform Health',
      value: `${overallHealth()}%`,
      description: 'Overall system performance',
      icon: <BarChart3 className="h-5 w-5 text-purple-600" />
    },
    {
      title: 'Growth Rate',
      value: `${userGrowthRate > 0 ? '+' : ''}${userGrowthRate.toFixed(1)}%`,
      description: 'Month-over-month growth',
      icon: <TrendingUp className="h-5 w-5 text-[#555555]" />
    }
  ]
  return (
    <ModernCard variant="floating">
      <ModernCardHeader>
        <ModernCardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Detailed Analytics
        </ModernCardTitle>
      </ModernCardHeader>
      <ModernCardContent>
        <Tabs defaultValue="business" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="business">Business</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="technical">Technical</TabsTrigger>
          </TabsList>
          <TabsContent value="business" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {businessMetrics.map((metric, index) => (
                <div key={index} className="p-4 bg-[#FAFAF7] rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    {metric.icon}
                    <h4 className="font-semibold">{metric.title}</h4>
                  </div>
                  <div className="text-2xl font-bold mb-1">{metric.value}</div>
                  <div className="text-sm text-[#555555]">{metric.description}</div>
                </div>
              ))}
            </div>
            <div>
              <h4 className="font-semibold text-[#1A1A1A] mb-3">Key Performance Indicators</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white border rounded-lg">
                  <span>Customer Acquisition Cost</span>
                  <Badge variant="outline">$24.50</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-white border rounded-lg">
                  <span>Average Revenue Per User</span>
                  <Badge variant="outline">$0.00</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-white border rounded-lg">
                  <span>Churn Rate</span>
                  <Badge variant="outline">2.3%</Badge>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="engagement" className="space-y-6">
            <div className="flex items-center gap-4 mb-4">
              <label className="text-sm font-medium">Time Period:</label>
              <select 
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="1d">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
            <div className="space-y-3">
              {metrics.map((metric, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-[#FAFAF7] rounded-lg">
                  <div>
                    <div className="font-medium">{metric.label}</div>
                    <div className="text-sm text-[#555555]">
                      {getChangeColor(metric.change) === 'text-green-600' ? '↗' : 
                       getChangeColor(metric.change) === 'text-red-600' ? '↘' : '→'} 
                      <span className={getChangeColor(metric.change)}>
                        {metric.change > 0 ? '+' : ''}{metric.change}%
                      </span> vs previous period
                    </div>
                  </div>
                  <div className="text-2xl font-bold">{metric.value.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="technical" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[#FAFAF7] rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  API Performance
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Avg Response Time</span>
                    <span className="font-medium">245ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Success Rate</span>
                    <span className="font-medium text-green-600">99.8%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Requests/min</span>
                    <span className="font-medium">1,247</span>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-[#FAFAF7] rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  System Resources
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">CPU Usage</span>
                    <span className="font-medium">34%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Memory Usage</span>
                    <span className="font-medium">67%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Disk Usage</span>
                    <span className="font-medium">23%</span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-[#1A1A1A] mb-3">Database Statistics</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white border rounded-lg">
                  <span>Total Database Size</span>
                  <Badge variant="outline">2.4 GB</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-white border rounded-lg">
                  <span>Active Connections</span>
                  <Badge variant="outline">12/100</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-white border rounded-lg">
                  <span>Query Performance</span>
                  <Badge variant="outline" className="text-green-600">Excellent</Badge>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </ModernCardContent>
    </ModernCard>
  )
}