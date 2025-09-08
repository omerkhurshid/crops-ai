'use client'

import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '../ui/modern-card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Cat, Heart, Calendar, AlertTriangle, Plus } from 'lucide-react'

interface LivestockOverviewProps {
  farmId: string
}

const mockLivestockData = {
  totalAnimals: 156,
  species: [
    { type: 'Cattle', count: 124, health: 'good' },
    { type: 'Sheep', count: 32, health: 'excellent' }
  ],
  alerts: [
    {
      id: '1',
      type: 'Vaccination Due',
      message: '12 cattle due for annual vaccination',
      priority: 'high',
      dueDate: '2025-01-15'
    },
    {
      id: '2', 
      type: 'Breeding Schedule',
      message: '5 cows entering optimal breeding window',
      priority: 'medium',
      dueDate: '2025-01-12'
    }
  ],
  recentEvents: [
    {
      id: '1',
      type: 'Calving',
      description: 'Cow #47 delivered healthy calf',
      date: '2025-01-08',
      status: 'completed'
    },
    {
      id: '2',
      type: 'Health Check',
      description: 'Monthly herd health inspection',
      date: '2025-01-07',
      status: 'completed'
    }
  ],
  healthMetrics: {
    avgWeight: 580,
    birthsThisMonth: 3,
    mortalityRate: 0.02,
    milkProduction: 2450
  }
}

export function LivestockOverview({ farmId }: LivestockOverviewProps) {
  const data = mockLivestockData

  if (data.totalAnimals === 0) {
    return (
      <ModernCard>
        <ModernCardHeader>
          <ModernCardTitle className="text-sage-800 flex items-center gap-2">
            <Cat className="h-5 w-5" />
            Livestock Management
          </ModernCardTitle>
          <ModernCardDescription>
            Track herd health, breeding, and production metrics
          </ModernCardDescription>
        </ModernCardHeader>
        <ModernCardContent className="text-center py-8">
          <Cat className="h-12 w-12 text-sage-300 mx-auto mb-4" />
          <h3 className="font-medium text-sage-700 mb-2">No Livestock Registered</h3>
          <p className="text-sage-500 text-sm mb-4">
            Add your livestock to track health, breeding, and production
          </p>
          <Button className="bg-amber-600 hover:bg-amber-700 text-white">
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
          <ModernCardTitle className="text-sage-800 flex items-center gap-2">
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
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-800">{data.healthMetrics.birthsThisMonth}</div>
              <div className="text-sm text-green-600">Births (MTD)</div>
            </div>
            <div className="text-center p-4 bg-sage-50 rounded-lg">
              <div className="text-2xl font-bold text-sage-800">98%</div>
              <div className="text-sm text-sage-600">Health Score</div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-sage-800">Species Breakdown</h4>
            {data.species.map((species, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-sage-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Cat className="h-5 w-5 text-sage-600" />
                  <div>
                    <div className="font-medium text-sage-800">{species.type}</div>
                    <div className="text-sm text-sage-600">{species.count} animals</div>
                  </div>
                </div>
                <Badge className={`${
                  species.health === 'excellent' ? 'bg-green-100 text-green-700' :
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
          <ModernCardTitle className="text-sage-800 flex items-center gap-2">
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
            {data.alerts.map((alert, index) => (
              <div key={alert.id} className={`p-4 border-b border-sage-100 hover:bg-sage-50 transition-colors ${
                index === data.alerts.length - 1 ? 'border-b-0' : ''
              }`}>
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                      alert.priority === 'high' ? 'text-red-500' : 'text-orange-500'
                    }`} />
                    <div>
                      <div className="font-medium text-sage-800">{alert.type}</div>
                      <div className="text-sm text-sage-600 mb-2">{alert.message}</div>
                      <div className="flex items-center gap-2 text-xs text-sage-500">
                        <Calendar className="h-3 w-3" />
                        Due: {new Date(alert.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="text-sage-700 border-sage-200">
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
          <ModernCardTitle className="text-sage-800">Recent Activity</ModernCardTitle>
          <ModernCardDescription>
            Latest livestock events and health records
          </ModernCardDescription>
        </ModernCardHeader>
        <ModernCardContent>
          <div className="space-y-3">
            {data.recentEvents.map((event) => (
              <div key={event.id} className="flex items-center gap-3 p-3 bg-sage-50 rounded-lg">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Heart className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sage-800">{event.type}</div>
                  <div className="text-sm text-sage-600">{event.description}</div>
                  <div className="text-xs text-sage-500">
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700">
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