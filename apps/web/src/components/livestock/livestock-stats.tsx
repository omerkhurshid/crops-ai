'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { 
  Users, 
  Heart, 
  Calendar, 
  TrendingUp, 
  AlertTriangle,
  Zap,
  DollarSign,
  Activity
} from 'lucide-react'
interface LivestockStatsProps {
  farmId: string
}
interface LivestockData {
  totalAnimals: number
  events: any[]
}
const speciesIcons: Record<string, string> = {
  cattle: '🐄',
  sheep: '🐑',
  pigs: '🐷',
  goats: '🐐',
  chickens: '🐓'
}
const activityTypeIcons: Record<string, any> = {
  vaccination: <Heart className="h-4 w-4 text-blue-600" />,
  health_check: <Activity className="h-4 w-4 text-green-600" />,
  treatment: <AlertTriangle className="h-4 w-4 text-orange-600" />,
  birth: <TrendingUp className="h-4 w-4 text-purple-600" />
}
export function LivestockStats({ farmId }: LivestockStatsProps) {
  const [livestockData, setLivestockData] = useState<LivestockData | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const fetchLivestockData = async () => {
      try {
        const response = await fetch(`/api/livestock?farmId=${farmId}`)
        if (response.ok) {
          const data = await response.json()
          setLivestockData(data)
        }
      } catch (error) {
        console.error('Error fetching livestock data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchLivestockData()
  }, [farmId])
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-32 bg-[#F5F5F5] rounded-lg mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-48 bg-[#F5F5F5] rounded-lg"></div>
            <div className="h-48 bg-[#F5F5F5] rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }
  if (!livestockData || livestockData.totalAnimals === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#1A1A1A] mb-2">No Livestock Data</h3>
            <p className="text-[#555555] mb-6">Start by adding your first livestock events to track your animals.</p>
            <a 
              href="/livestock/add-event"
              className="inline-block bg-[#7A8F78] text-white px-4 py-2 rounded-lg hover:bg-[#5E6F5A]"
            >
              Add Livestock Event
            </a>
          </CardContent>
        </Card>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      {/* Basic Stats from Real Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Livestock Overview
          </CardTitle>
          <CardDescription>
            Statistics based on your recorded livestock events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-[#FAFAF7] rounded-lg">
              <div className="text-2xl font-bold text-[#1A1A1A] mb-1">{livestockData.totalAnimals}</div>
              <div className="text-sm text-[#555555]">Total Animal Events</div>
              <div className="text-xs text-[#555555] mt-1">Recorded in system</div>
            </div>
            <div className="text-center p-4 bg-[#FAFAF7] rounded-lg">
              <div className="text-2xl font-bold text-[#1A1A1A] mb-1">{livestockData.events.length}</div>
              <div className="text-sm text-[#555555]">Health Events</div>
              <div className="text-xs text-[#555555] mt-1">Total recorded</div>
            </div>
            <div className="text-center p-4 bg-[#FAFAF7] rounded-lg">
              <div className="text-2xl font-bold text-[#1A1A1A] mb-1">
                {livestockData.events.filter(e => {
                  const eventDate = new Date(e.eventDate)
                  const thirtyDaysAgo = new Date()
                  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
                  return eventDate >= thirtyDaysAgo
                }).length}
              </div>
              <div className="text-sm text-[#555555]">Recent Events</div>
              <div className="text-xs text-[#555555] mt-1">Last 30 days</div>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Recent Events from Real Data */}
      {livestockData.events && livestockData.events.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Livestock Events
            </CardTitle>
            <CardDescription>
              Latest recorded livestock activities and health events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {livestockData.events.slice(0, 5).map((event, index) => (
                <div key={event.id || index} className="flex items-center gap-4 p-3 bg-[#FAFAF7] rounded-lg">
                  <div className="flex-shrink-0">
                    <Activity className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[#1A1A1A]">
                        {event.eventType || 'Livestock Event'}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {event.animalType || 'Animal'}
                      </Badge>
                    </div>
                    <p className="text-sm text-[#555555]">
                      {event.notes || event.description || 'No description available'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-[#555555]">
                      {new Date(event.eventDate).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-[#555555]">
                      {event.animalCount} animal{event.animalCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {livestockData.events.length > 5 && (
              <div className="mt-4 text-center">
                <a 
                  href="/livestock/events"
                  className="text-[#555555] hover:text-[#555555] text-sm font-medium"
                >
                  View all {livestockData.events.length} events →
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}