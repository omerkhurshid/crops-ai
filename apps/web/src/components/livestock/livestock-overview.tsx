'use client'
import { useState, useEffect } from 'react'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '../ui/modern-card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Cat, Heart, Calendar, AlertTriangle, Plus } from 'lucide-react'
import { ensureArray } from '../../lib/utils'
interface LivestockOverviewProps {
  farmId: string
}
// Removed mock data - will fetch from database
export function LivestockOverview({ farmId }: LivestockOverviewProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  // Fetch livestock data from API
  useEffect(() => {
    async function fetchLivestockData() {
      try {
        const response = await fetch(`/api/livestock?farmId=${farmId}`)
        if (response.ok) {
          const livestockData = await response.json()
          setData(livestockData)
        }
      } catch (error) {
        console.error('Failed to fetch livestock data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchLivestockData()
  }, [farmId])
  if (loading) {
    return (
      <ModernCard>
        <ModernCardContent className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7A8F78] mx-auto"></div>
          <p className="text-[#555555] mt-4">Loading livestock data...</p>
        </ModernCardContent>
      </ModernCard>
    )
  }
  if (!data || data.totalAnimals === 0) {
    return (
      <ModernCard>
        <ModernCardHeader>
          <ModernCardTitle className="text-[#1A1A1A] flex items-center gap-2">
            <Cat className="h-5 w-5" />
            Livestock Management
          </ModernCardTitle>
          <ModernCardDescription>
            Track herd health, breeding, and production metrics
          </ModernCardDescription>
        </ModernCardHeader>
        <ModernCardContent className="text-center py-8">
          <Cat className="h-12 w-12 text-sage-300 mx-auto mb-4" />
          <h3 className="font-medium text-[#555555] mb-2">No Livestock Registered</h3>
          <p className="text-sage-500 text-sm mb-4">
            Add your livestock to track health, breeding, and production
          </p>
          <Button className="bg-[#7A8F78] hover:bg-[#5E6F5A] text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Livestock
          </Button>
        </ModernCardContent>
      </ModernCard>
    )
  }
  return (
    <div className="space-y-6">
      <ModernCard>
        <ModernCardHeader>
          <ModernCardTitle className="text-[#1A1A1A] flex items-center gap-2">
            <Cat className="h-5 w-5" />
            Herd Overview
          </ModernCardTitle>
          <ModernCardDescription>
            {data.totalAnimals} animals across {data.species.length} species
          </ModernCardDescription>
        </ModernCardHeader>
        <ModernCardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <div className="text-2xl font-bold text-amber-800">{data.totalAnimals}</div>
              <div className="text-sm text-amber-600">Total Animals</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-800">{data.healthMetrics.avgWeight}kg</div>
              <div className="text-sm text-blue-600">Avg Weight</div>
            </div>
            <div className="text-center p-4 bg-[#F8FAF8] rounded-lg">
              <div className="text-2xl font-bold text-green-800">{data.healthMetrics.birthsThisMonth}</div>
              <div className="text-sm text-green-600">Births (MTD)</div>
            </div>
            <div className="text-center p-4 bg-[#F8FAF8] rounded-lg">
              <div className="text-2xl font-bold text-[#1A1A1A]">98%</div>
              <div className="text-sm text-[#555555]">Health Score</div>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-[#1A1A1A]">Species Breakdown</h4>
            {ensureArray(data.species).map((species: any, index: number) => (
              <div key={index} className="flex justify-between items-center p-3 bg-[#F8FAF8] rounded-lg">
                <div className="flex items-center gap-3">
                  <Cat className="h-5 w-5 text-[#555555]" />
                  <div>
                    <div className="font-medium text-[#1A1A1A]">{species.type}</div>
                    <div className="text-sm text-[#555555]">{species.count} animals</div>
                  </div>
                </div>
                <Badge className={`${
                  species.health === 'excellent' ? 'bg-[#F8FAF8] text-green-700' :
                  species.health === 'good' ? 'bg-blue-100 text-blue-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {species.health}
                </Badge>
              </div>
            ))}
          </div>
        </ModernCardContent>
      </ModernCard>
      <ModernCard>
        <ModernCardHeader>
          <ModernCardTitle className="text-[#1A1A1A] flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Health & Breeding Alerts
            <Badge className="bg-red-100 text-red-700 ml-2">
              {data.alerts.length} Active
            </Badge>
          </ModernCardTitle>
          <ModernCardDescription>
            Upcoming vaccinations, breeding schedules, and health checks
          </ModernCardDescription>
        </ModernCardHeader>
        <ModernCardContent className="p-0">
          <div className="space-y-0">
            {ensureArray(data.alerts).map((alert: any, index: number) => (
              <div key={alert.id} className={`p-4 border-b border-[#F8FAF8] hover:bg-[#F8FAF8] transition-colors ${
                index === ensureArray(data.alerts).length - 1 ? 'border-b-0' : ''
              }`}>
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                      alert.priority === 'high' ? 'text-red-500' : 'text-orange-500'
                    }`} />
                    <div>
                      <div className="font-medium text-[#1A1A1A]">{alert.type}</div>
                      <div className="text-sm text-[#555555] mb-2">{alert.message}</div>
                      <div className="flex items-center gap-2 text-xs text-sage-500">
                        <Calendar className="h-3 w-3" />
                        Due: {new Date(alert.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="text-[#555555] border-[#DDE4D8]">
                    Schedule
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ModernCardContent>
      </ModernCard>
      <ModernCard>
        <ModernCardHeader>
          <ModernCardTitle className="text-[#1A1A1A]">Recent Activity</ModernCardTitle>
          <ModernCardDescription>
            Latest livestock events and health records
          </ModernCardDescription>
        </ModernCardHeader>
        <ModernCardContent>
          <div className="space-y-3">
            {ensureArray(data.recentEvents).map((event: any) => (
              <div key={event.id} className="flex items-center gap-3 p-3 bg-[#F8FAF8] rounded-lg">
                <div className="p-2 bg-[#F8FAF8] rounded-lg">
                  <Heart className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-[#1A1A1A]">{event.type}</div>
                  <div className="text-sm text-[#555555]">{event.description}</div>
                  <div className="text-xs text-sage-500">
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                </div>
                <Badge className="bg-[#F8FAF8] text-green-700">
                  {event.status}
                </Badge>
              </div>
            ))}
          </div>
        </ModernCardContent>
      </ModernCard>
    </div>
  )
}