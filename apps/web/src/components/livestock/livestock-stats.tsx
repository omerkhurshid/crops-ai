'use client'

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

// Mock data for livestock overview
const mockStats = {
  totalAnimals: 247,
  bySpecies: {
    cattle: 89,
    sheep: 76,
    pigs: 52,
    goats: 18,
    chickens: 12
  },
  healthOverview: {
    excellent: 156,
    good: 72,
    fair: 15,
    poor: 3,
    sick: 1
  },
  vaccinations: {
    current: 231,
    overdue: 12,
    upcoming: 25
  },
  breeding: {
    pregnant: 18,
    breeding_age: 89,
    calving_due: 6
  },
  performance: {
    avgWeightGain: 2.3,
    mortalityRate: 0.8,
    feedConversion: 6.2,
    reproductionRate: 92
  },
  recentActivity: [
    {
      id: '1',
      type: 'vaccination',
      animal: 'C045',
      description: 'Annual vaccination completed',
      date: '2024-03-12',
      status: 'completed'
    },
    {
      id: '2', 
      type: 'health_check',
      animal: 'S023',
      description: 'Routine health examination',
      date: '2024-03-11',
      status: 'completed'
    },
    {
      id: '3',
      type: 'treatment',
      animal: 'P012',
      description: 'Hoof trimming and treatment',
      date: '2024-03-10',
      status: 'in_progress'
    },
    {
      id: '4',
      type: 'birth',
      animal: 'C033',
      description: 'Healthy calf born',
      date: '2024-03-09',
      status: 'completed'
    }
  ]
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
  const healthPercentage = ((mockStats.healthOverview.excellent + mockStats.healthOverview.good) / mockStats.totalAnimals) * 100
  const vaccinationCompliance = (mockStats.vaccinations.current / mockStats.totalAnimals) * 100

  return (
    <div className="space-y-6">
      {/* Species Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Herd Composition
          </CardTitle>
          <CardDescription>
            Breakdown of animals by species across your farm
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(mockStats.bySpecies).map(([species, count]) => (
              <div key={species} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-2">{speciesIcons[species]}</div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{count}</div>
                <div className="text-sm text-gray-600 capitalize">{species}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {((count / mockStats.totalAnimals) * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Health & Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Health Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Health Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Health Score</span>
              <Badge className="bg-green-100 text-green-800">
                {healthPercentage.toFixed(1)}% Healthy
              </Badge>
            </div>
            <Progress value={healthPercentage} className="h-2" />
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Excellent</span>
                  <span className="font-medium text-green-600">{mockStats.healthOverview.excellent}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Good</span>
                  <span className="font-medium text-blue-600">{mockStats.healthOverview.good}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Fair</span>
                  <span className="font-medium text-yellow-600">{mockStats.healthOverview.fair}</span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Poor</span>
                  <span className="font-medium text-orange-600">{mockStats.healthOverview.poor}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Sick</span>
                  <span className="font-medium text-red-600">{mockStats.healthOverview.sick}</span>
                </div>
                {mockStats.healthOverview.sick > 0 && (
                  <Badge variant="destructive" className="text-xs mt-2">
                    Immediate attention needed
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vaccination Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Vaccination Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Compliance Rate</span>
              <Badge className={vaccinationCompliance >= 95 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                {vaccinationCompliance.toFixed(1)}%
              </Badge>
            </div>
            <Progress value={vaccinationCompliance} className="h-2" />
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Up to date</span>
                <span className="font-medium text-green-600">{mockStats.vaccinations.current}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Overdue</span>
                <span className="font-medium text-red-600">{mockStats.vaccinations.overdue}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Due soon</span>
                <span className="font-medium text-yellow-600">{mockStats.vaccinations.upcoming}</span>
              </div>
            </div>
            
            {mockStats.vaccinations.overdue > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800">
                    {mockStats.vaccinations.overdue} animals need immediate vaccination
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Metrics
          </CardTitle>
          <CardDescription>
            Key performance indicators for herd management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {mockStats.performance.avgWeightGain}kg
              </div>
              <div className="text-sm text-gray-600">Avg Daily Gain</div>
              <div className="text-xs text-green-600 mt-1">↑ 12% vs last month</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {mockStats.performance.mortalityRate}%
              </div>
              <div className="text-sm text-gray-600">Mortality Rate</div>
              <div className="text-xs text-green-600 mt-1">↓ 0.3% vs last month</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {mockStats.performance.feedConversion}:1
              </div>
              <div className="text-sm text-gray-600">Feed Conversion</div>
              <div className="text-xs text-green-600 mt-1">↓ 0.2 vs last month</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {mockStats.performance.reproductionRate}%
              </div>
              <div className="text-sm text-gray-600">Reproduction Rate</div>
              <div className="text-xs text-green-600 mt-1">↑ 3% vs last month</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Breeding Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pregnant Animals</p>
                <p className="text-2xl font-bold text-purple-900">{mockStats.breeding.pregnant}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-400" />
            </div>
            <div className="mt-2">
              <span className="text-xs text-purple-600">{mockStats.breeding.calving_due} due this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Breeding Age</p>
                <p className="text-2xl font-bold text-blue-900">{mockStats.breeding.breeding_age}</p>
              </div>
              <Heart className="h-8 w-8 text-blue-400" />
            </div>
            <div className="mt-2">
              <span className="text-xs text-blue-600">Ready for breeding program</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Birth Rate</p>
                <p className="text-2xl font-bold text-green-900">96.5%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
            <div className="mt-2">
              <span className="text-xs text-green-600">Above industry average</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Latest health events and livestock activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockStats.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  {activityTypeIcons[activity.type]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {activity.animal}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {activity.type.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">
                    {new Date(activity.date).toLocaleDateString()}
                  </div>
                  <Badge 
                    className={activity.status === 'completed' ? 
                      'bg-green-100 text-green-800 text-xs' : 
                      'bg-yellow-100 text-yellow-800 text-xs'
                    }
                  >
                    {activity.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}