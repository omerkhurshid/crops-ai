'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { 
  Sprout, 
  Calendar, 
  Droplets, 
  Scissors, 
  AlertTriangle,
  TrendingUp,
  MapPin,
  Clock,
  Bell,
  CheckCircle,
  Circle,
  DollarSign,
  Target
} from 'lucide-react'

interface CropAction {
  id: string
  cropName: string
  action: string
  dueDate: string
  priority: 'urgent' | 'due_soon' | 'upcoming'
  location: string
  daysUntil: number
  icon: React.ReactNode
}

interface CropCard {
  id: string
  cropName: string
  variety: string
  location: string
  status: 'planned' | 'planted' | 'growing' | 'ready_harvest' | 'completed'
  progress: number
  nextAction: string
  nextActionDate: string
  plantedArea: number
  unit: string
  expectedYield: number
  yieldUnit: string
  expectedRevenue: number
  daysToHarvest?: number
  healthScore: number
  icon: string
}

const mockCropCards: CropCard[] = [
  {
    id: '1',
    cropName: 'Winter Wheat',
    variety: 'Hard Red',
    location: 'North Field',
    status: 'growing',
    progress: 65,
    nextAction: 'Apply nitrogen fertilizer',
    nextActionDate: '2024-03-20',
    plantedArea: 45.2,
    unit: 'acres',
    expectedYield: 1500,
    yieldUnit: 'bushels',
    expectedRevenue: 7500,
    daysToHarvest: 85,
    healthScore: 92,
    icon: '🌾'
  },
  {
    id: '2',
    cropName: 'Sweet Corn',
    variety: 'Silver Queen',
    location: 'South Field A',
    status: 'ready_harvest',
    progress: 100,
    nextAction: 'Start harvesting',
    nextActionDate: '2024-03-15',
    plantedArea: 12.5,
    unit: 'acres',
    expectedYield: 850,
    yieldUnit: 'dozen ears',
    expectedRevenue: 3400,
    daysToHarvest: 0,
    healthScore: 88,
    icon: '🌽'
  },
  {
    id: '3',
    cropName: 'Cucumbers',
    variety: 'Marketmore 76',
    location: 'Greenhouse B',
    status: 'growing',
    progress: 45,
    nextAction: 'Check for cucumber beetles',
    nextActionDate: '2024-03-18',
    plantedArea: 0.8,
    unit: 'acres',
    expectedYield: 800,
    yieldUnit: 'lbs',
    expectedRevenue: 1600,
    daysToHarvest: 35,
    healthScore: 85,
    icon: '🥒'
  },
  {
    id: '4',
    cropName: 'Tomatoes',
    variety: 'Cherokee Purple',
    location: 'Greenhouse A',
    status: 'planted',
    progress: 15,
    nextAction: 'Transplant seedlings',
    nextActionDate: '2024-03-25',
    plantedArea: 1.2,
    unit: 'acres',
    expectedYield: 2400,
    yieldUnit: 'lbs',
    expectedRevenue: 4800,
    daysToHarvest: 75,
    healthScore: 95,
    icon: '🍅'
  },
  {
    id: '5',
    cropName: 'Potatoes',
    variety: 'Yukon Gold',
    location: 'East Field',
    status: 'planned',
    progress: 0,
    nextAction: 'Prepare soil and plant',
    nextActionDate: '2024-04-01',
    plantedArea: 8.0,
    unit: 'acres',
    expectedYield: 1200,
    yieldUnit: 'cwt',
    expectedRevenue: 6000,
    daysToHarvest: 120,
    healthScore: 0,
    icon: '🥔'
  }
]

const mockNextActions: CropAction[] = [
  {
    id: '1',
    cropName: 'Sweet Corn',
    action: 'Start harvesting',
    dueDate: '2024-03-15',
    priority: 'urgent',
    location: 'South Field A',
    daysUntil: 0,
    icon: <Scissors className="h-5 w-5" />
  },
  {
    id: '2',
    cropName: 'Cucumbers',
    action: 'Pest inspection',
    dueDate: '2024-03-18',
    priority: 'due_soon',
    location: 'Greenhouse B',
    daysUntil: 3,
    icon: <AlertTriangle className="h-5 w-5" />
  },
  {
    id: '3',
    cropName: 'Winter Wheat',
    action: 'Fertilizer application',
    dueDate: '2024-03-20',
    priority: 'due_soon',
    location: 'North Field',
    daysUntil: 5,
    icon: <Droplets className="h-5 w-5" />
  }
]

const statusConfig = {
  planned: {
    label: 'Planned',
    color: 'bg-fk-info',
    textColor: 'text-fk-info',
    bgColor: 'bg-fk-info/10',
    borderColor: 'border-fk-info/30'
  },
  planted: {
    label: 'Planted',
    color: 'bg-fk-success',
    textColor: 'text-fk-success',
    bgColor: 'bg-fk-success/10',
    borderColor: 'border-fk-success/30'
  },
  growing: {
    label: 'Growing',
    color: 'bg-fk-primary',
    textColor: 'text-fk-primary',
    bgColor: 'bg-fk-primary/10',
    borderColor: 'border-fk-primary/30'
  },
  ready_harvest: {
    label: 'Ready to Harvest',
    color: 'bg-fk-accent-wheat',
    textColor: 'text-fk-accent-wheat',
    bgColor: 'bg-fk-accent-wheat/10',
    borderColor: 'border-fk-accent-wheat/30'
  },
  completed: {
    label: 'Harvested',
    color: 'bg-fk-neutral',
    textColor: 'text-fk-neutral',
    bgColor: 'bg-fk-neutral/10',
    borderColor: 'border-fk-neutral/30'
  }
}

const priorityConfig = {
  urgent: {
    color: 'bg-fk-danger/10 text-fk-danger border-fk-danger/30',
    label: 'Urgent'
  },
  due_soon: {
    color: 'bg-fk-warning/10 text-fk-warning border-fk-warning/30',
    label: 'Due Soon'
  },
  upcoming: {
    color: 'bg-fk-info/10 text-fk-info border-fk-info/30',
    label: 'Upcoming'
  }
}

interface FarmerFriendlyCropViewProps {
  farmId: string
}

export function FarmerFriendlyCropView({ farmId }: FarmerFriendlyCropViewProps) {
  const [viewMode, setViewMode] = useState<'cards' | 'timeline'>('cards')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatArea = (area: number, unit: string) => {
    if (unit === 'acres') {
      return `${area} acres`
    }
    return `${area} ${unit}`
  }

  const getDaysText = (days: number) => {
    if (days === 0) return 'Today!'
    if (days === 1) return 'Tomorrow'
    if (days < 7) return `${days} days`
    const weeks = Math.floor(days / 7)
    return weeks === 1 ? '1 week' : `${weeks} weeks`
  }

  const totalExpectedRevenue = mockCropCards.reduce((sum, crop) => sum + crop.expectedRevenue, 0)
  const growingCrops = mockCropCards.filter(c => c.status === 'growing' || c.status === 'planted')
  const readyToHarvest = mockCropCards.filter(c => c.status === 'ready_harvest')

  return (
    <div className="space-y-6">
      {/* Quick Actions - Most Important */}
      {mockNextActions.length > 0 && (
        <Card className="border-l-4 border-l-fk-warning bg-surface rounded-card shadow-fk-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-fk-text">
              <Bell className="h-5 w-5 text-fk-warning" />
              📌 What Needs Your Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockNextActions.slice(0, 3).map((action) => (
                <div key={action.id} className="flex items-center justify-between p-4 bg-canvas rounded-card border border-fk-border hover:border-fk-primary/30 hover:shadow-fk-sm transition-all duration-micro">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{action.icon}</div>
                    <div>
                      <h4 className="font-semibold text-fk-text">
                        {action.action}
                      </h4>
                      <p className="text-sm text-fk-text-muted">
                        {action.cropName} • {action.location}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={priorityConfig[action.priority].color}>
                      {action.daysUntil === 0 ? 'Today!' : getDaysText(action.daysUntil)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Overview Stats - FieldKit KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center p-5 bg-surface rounded-card shadow-fk-sm border border-fk-border">
          <div className="text-3xl mb-2">🌱</div>
          <div className="text-2xl font-bold text-fk-success">{growingCrops.length}</div>
          <div className="text-sm font-medium text-fk-text-muted">Crops Growing</div>
        </Card>
        
        <Card className="text-center p-5 bg-surface rounded-card shadow-fk-sm border border-fk-border">
          <div className="text-3xl mb-2">✂️</div>
          <div className="text-2xl font-bold text-fk-accent-wheat">{readyToHarvest.length}</div>
          <div className="text-sm font-medium text-fk-text-muted">Ready to Harvest</div>
        </Card>

        <Card className="text-center p-5 bg-surface rounded-card shadow-fk-sm border border-fk-border">
          <div className="text-3xl mb-2">🎯</div>
          <div className="text-2xl font-bold text-fk-accent-sky">{mockNextActions.length}</div>
          <div className="text-sm font-medium text-fk-text-muted">Tasks Due</div>
        </Card>

        <Card className="text-center p-5 bg-surface rounded-card shadow-fk-sm border border-fk-border">
          <div className="text-3xl mb-2">💰</div>
          <div className="text-2xl font-bold text-fk-earth">{formatCurrency(totalExpectedRevenue)}</div>
          <div className="text-sm font-medium text-fk-text-muted">Expected Income</div>
        </Card>
      </div>

      {/* View Toggle */}
      <div className="flex justify-center">
        <div className="bg-fk-border/30 rounded-control p-1 flex">
          <Button
            variant={viewMode === 'cards' ? 'default' : 'ghost'}
            size="sm"
            className={viewMode === 'cards' ? 'bg-fk-primary hover:bg-fk-primary-600 text-white' : 'text-fk-text hover:text-fk-primary'}
            onClick={() => setViewMode('cards')}
          >
            📱 Card View
          </Button>
          <Button
            variant={viewMode === 'timeline' ? 'default' : 'ghost'}
            size="sm"
            className={viewMode === 'timeline' ? 'bg-fk-primary hover:bg-fk-primary-600 text-white' : 'text-fk-text hover:text-fk-primary'}
            onClick={() => setViewMode('timeline')}
          >
            📅 Timeline
          </Button>
        </div>
      </div>

      {/* Mobile-First Crop Cards */}
      {viewMode === 'cards' && (
        <div className="space-y-4">
          {mockCropCards.map((crop) => {
            const statusInfo = statusConfig[crop.status]
            return (
              <Card key={crop.id} className={`${statusInfo.borderColor} border-2 bg-surface rounded-card shadow-fk-sm hover:shadow-fk-md transition-all duration-micro`}>
                <CardContent className="p-5">
                  {/* Header Row */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{crop.icon}</div>
                      <div>
                        <h3 className="font-bold text-lg text-fk-text">
                          {crop.cropName}
                        </h3>
                        <p className="text-sm text-fk-text-muted">
                          {crop.variety} • {crop.location}
                        </p>
                      </div>
                    </div>
                    <Badge className={`${statusInfo.color} text-white font-semibold`}>
                      {statusInfo.label}
                    </Badge>
                  </div>

                  {/* Progress Bar for Growing Crops */}
                  {(crop.status === 'growing' || crop.status === 'planted') && (
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Growth Progress</span>
                        <span className="font-medium">{crop.progress}%</span>
                      </div>
                      <Progress value={crop.progress} className="h-3" />
                      {crop.daysToHarvest && crop.daysToHarvest > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          About {getDaysText(crop.daysToHarvest)} to harvest
                        </p>
                      )}
                    </div>
                  )}

                  {/* Next Action - Most Important */}
                  <div className={`p-3 ${statusInfo.bgColor} rounded-lg mb-3`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="h-4 w-4 text-gray-600" />
                      <span className="font-semibold text-sm">Next Step:</span>
                    </div>
                    <p className="font-medium text-gray-900">{crop.nextAction}</p>
                    <p className="text-sm text-gray-600">Due: {crop.nextActionDate}</p>
                  </div>

                  {/* Key Stats Row */}
                  <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div>
                      <div className="font-semibold text-gray-900">
                        {formatArea(crop.plantedArea, crop.unit)}
                      </div>
                      <div className="text-gray-500">Planted</div>
                    </div>
                    <div>
                      <div className="font-semibold text-green-600">
                        {crop.expectedYield.toLocaleString()} {crop.yieldUnit}
                      </div>
                      <div className="text-gray-500">Expected</div>
                    </div>
                    <div>
                      <div className="font-semibold text-purple-600">
                        {formatCurrency(crop.expectedRevenue)}
                      </div>
                      <div className="text-gray-500">Revenue</div>
                    </div>
                  </div>

                  {/* Health Score */}
                  {crop.healthScore > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <span className={crop.healthScore >= 90 ? 'text-green-600' : crop.healthScore >= 70 ? 'text-yellow-600' : 'text-red-600'}>
                            {crop.healthScore >= 90 ? '💚' : crop.healthScore >= 70 ? '💛' : '❤️'}
                          </span>
                          Crop Health
                        </span>
                        <span className="font-semibold">{crop.healthScore}/100</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Timeline View - Simplified */}
      {viewMode === 'timeline' && (
        <Card>
          <CardHeader>
            <CardTitle>📅 Your Growing Season Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockCropCards.map((crop) => {
                const statusInfo = statusConfig[crop.status]
                return (
                  <div key={crop.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl">{crop.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{crop.cropName}</h4>
                        <Badge className={`${statusInfo.color} text-white text-xs`}>
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{crop.location}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">
                        {formatCurrency(crop.expectedRevenue)}
                      </div>
                      {crop.daysToHarvest && crop.daysToHarvest > 0 && (
                        <div className="text-sm text-gray-500">
                          {getDaysText(crop.daysToHarvest)}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}