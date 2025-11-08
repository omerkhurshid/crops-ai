'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { 
  Plus, 
  Calendar, 
  Sprout, 
  MapPin, 
  TrendingUp,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Circle,
  Scissors,
  Eye,
  AlertTriangle,
  Clock,
  Thermometer,
  CloudRain,
  Bug
} from 'lucide-react'
import { ensureArray } from '../../lib/utils'
interface CropPlanning {
  id: string
  cropName: string
  variety: string
  location: string
  bedNumber: string
  plantedQuantity: number
  unit: 'sqft' | 'acres' | 'plants' | 'beds'
  startDate: string
  plantDate: string
  harvestDate: string
  estimatedYield: number
  yieldUnit: string
  status: 'planned' | 'planted' | 'growing' | 'harvesting' | 'completed'
  notes?: string
}
interface SimplifiedCropTimelineProps {
  farmId: string
  year?: number
}
const statusColors = {
  planned: 'bg-fk-text-muted',
  planted: 'bg-fk-info',
  growing: 'bg-fk-success',
  harvesting: 'bg-fk-accent-wheat',
  completed: 'bg-fk-neutral'
}
const statusLabels = {
  planned: 'Planned',
  planted: 'Planted',
  growing: 'Growing',
  harvesting: 'Ready to Harvest',
  completed: 'Harvested'
}
const statusIcons = {
  planned: <Calendar className="h-4 w-4" />,
  planted: <Circle className="h-4 w-4" />,
  growing: <Sprout className="h-4 w-4" />,
  harvesting: <Scissors className="h-4 w-4" />,
  completed: <TrendingUp className="h-4 w-4" />
}
export function SimplifiedCropTimeline({ farmId, year = 2024 }: SimplifiedCropTimelineProps) {
  const [currentYear, setCurrentYear] = useState(year)
  const [selectedCrop, setSelectedCrop] = useState<string>('all')
  const [selectedLocation, setSelectedLocation] = useState<string>('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [plannings, setPlannings] = useState<CropPlanning[]>([])
  const [loading, setLoading] = useState(true)
  // Calculate attention items based on real logic
  const getAttentionItems = (plannings: CropPlanning[]) => {
    const today = new Date()
    const items: Array<{
      type: 'harvest' | 'overdue' | 'weather' | 'pest'
      priority: 'high' | 'medium' | 'low'
      message: string
      crop: string
      location: string
    }> = []
    plannings.forEach(planning => {
      const harvestDate = new Date(planning.harvestDate)
      const plantDate = new Date(planning.plantDate)
      const daysToHarvest = Math.ceil((harvestDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      const daysFromPlant = Math.ceil((today.getTime() - plantDate.getTime()) / (1000 * 60 * 60 * 24))
      // Approaching harvest window (within 7 days)
      if (daysToHarvest > 0 && daysToHarvest <= 7 && planning.status === 'growing') {
        items.push({
          type: 'harvest',
          priority: daysToHarvest <= 3 ? 'high' : 'medium',
          message: `Ready to harvest in ${daysToHarvest} days`,
          crop: planning.cropName,
          location: planning.location
        })
      }
      // Overdue harvest
      if (daysToHarvest < 0 && planning.status !== 'completed') {
        items.push({
          type: 'harvest',
          priority: 'high',
          message: `Harvest overdue by ${Math.abs(daysToHarvest)} days`,
          crop: planning.cropName,
          location: planning.location
        })
      }
      // Overdue planting (planned but not planted past plant date)
      if (planning.status === 'planned' && today > plantDate) {
        const overdueDays = Math.ceil((today.getTime() - plantDate.getTime()) / (1000 * 60 * 60 * 24))
        items.push({
          type: 'overdue',
          priority: overdueDays > 14 ? 'high' : 'medium',
          message: `Planting overdue by ${overdueDays} days`,
          crop: planning.cropName,
          location: planning.location
        })
      }
      // Pest risk based on growth stage (30-60 days from planting)
      if (planning.status === 'growing' && daysFromPlant >= 30 && daysFromPlant <= 60) {
        items.push({
          type: 'pest',
          priority: 'medium',
          message: `Monitor for pests - peak vulnerability period`,
          crop: planning.cropName,
          location: planning.location
        })
      }
    })
    return items.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }
  // Fetch crop planning data from API
  useEffect(() => {
    async function fetchPlannings() {
      try {
        const response = await fetch(`/api/crops?farmId=${farmId}&year=${currentYear}`)
        if (response.ok) {
          const data = await response.json()
          // Transform API data from Crop entities to CropPlanning format
          const transformedData = data.map((crop: any): CropPlanning => ({
            id: crop.id,
            cropName: crop.cropType || 'Unknown Crop',
            variety: crop.variety || '',
            location: crop.field?.name || 'Unknown Field',
            bedNumber: crop.field?.name || '',
            plantedQuantity: crop.field?.area || 0,
            unit: 'acres' as const,
            startDate: crop.plantingDate || crop.createdAt,
            plantDate: crop.plantingDate || crop.createdAt,
            harvestDate: crop.expectedHarvestDate || crop.actualHarvestDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
            estimatedYield: crop.yield || 0,
            yieldUnit: 'kg/ha',
            status: crop.status?.toLowerCase() === 'planned' ? 'planned' :
                   crop.status?.toLowerCase() === 'planted' ? 'planted' :
                   crop.status?.toLowerCase() === 'growing' ? 'growing' :
                   crop.status?.toLowerCase() === 'ready_to_harvest' ? 'harvesting' :
                   crop.status?.toLowerCase() === 'harvested' ? 'completed' :
                   'planned',
            notes: `Field: ${crop.field?.name || 'Unknown'}, Area: ${crop.field?.area || 0} acres`
          }))
          setPlannings(transformedData)
        }
      } catch (error) {
        console.error('Failed to fetch crop planning data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPlannings()
  }, [farmId, currentYear])
  // Filter plannings by year
  const yearPlannings = plannings.filter(planning => {
    const startYear = new Date(planning.startDate).getFullYear()
    const endYear = new Date(planning.harvestDate).getFullYear()
    return startYear === currentYear || endYear === currentYear
  })
  // Get unique crops and locations for filtering
  const uniqueCrops = Array.from(new Set(ensureArray(plannings).map(p => p.cropName)))
  const uniqueLocations = Array.from(new Set(ensureArray(plannings).map(p => p.location)))
  // Filter plannings based on selected filters
  const filteredPlannings = yearPlannings.filter(planning => {
    const matchesCrop = selectedCrop === 'all' || planning.cropName === selectedCrop
    const matchesLocation = selectedLocation === 'all' || planning.location === selectedLocation
    return matchesCrop && matchesLocation
  })
  // Calculate summary statistics
  const totalPlanned = filteredPlannings.filter(p => p.status === 'planned').length
  const growingNow = filteredPlannings.filter(p => p.status === 'growing').length
  const inHarvestWindow = filteredPlannings.filter(p => {
    const today = new Date()
    const harvestDate = new Date(p.harvestDate)
    const daysToHarvest = Math.ceil((harvestDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysToHarvest >= 0 && daysToHarvest <= 14
  }).length
  const attentionItems = getAttentionItems(filteredPlannings)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  const formatQuantity = (quantity: number, unit: string) => {
    if (quantity >= 1000000) {
      return `${(quantity / 1000000).toFixed(1)}M ${unit}`
    } else if (quantity >= 1000) {
      return `${(quantity / 1000).toFixed(0)}K ${unit}`
    }
    return `${quantity} ${unit}`
  }
  const getSeasonProgress = (planning: CropPlanning) => {
    const today = new Date()
    const startDate = new Date(planning.plantDate)
    const endDate = new Date(planning.harvestDate)
    if (today < startDate) return 0
    if (today > endDate) return 100
    const totalDuration = endDate.getTime() - startDate.getTime()
    const elapsedDuration = today.getTime() - startDate.getTime()
    return Math.max(0, Math.min(100, Math.round((elapsedDuration / totalDuration) * 100)))
  }
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fk-primary mx-auto"></div>
          <p className="text-fk-text-muted mt-4">Loading crop planning data...</p>
        </div>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-fk-text flex items-center gap-2">
            <Calendar className="h-6 w-6 text-fk-primary" />
            Crop Timeline
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentYear(currentYear - 1)}
              className="border-fk-border text-fk-text hover:bg-fk-primary/10"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="px-4 py-2 bg-fk-primary/10 border-2 border-fk-primary rounded-control font-semibold text-fk-primary">
              {currentYear} Season
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentYear(currentYear + 1)}
              className="border-fk-border text-fk-text hover:bg-fk-primary/10"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            className="border-fk-border text-fk-text hover:bg-fk-primary/10"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button 
            className="bg-fk-primary hover:bg-fk-primary-600 text-white rounded-control"
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Crop
          </Button>
        </div>
      </div>
      {/* Filter Controls */}
      <div className="flex flex-wrap gap-4 p-4 bg-surface rounded-card border border-fk-border">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-fk-text">Crop:</span>
          <Select value={selectedCrop} onValueChange={setSelectedCrop}>
            <SelectTrigger className="w-32 border-fk-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Crops</SelectItem>
              {uniqueCrops.map(crop => (
                <SelectItem key={crop} value={crop}>{crop}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-fk-text">Location:</span>
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-32 border-fk-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {uniqueLocations.map(location => (
                <SelectItem key={location} value={location}>{location}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {/* Summary Stats - Moved to Top */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-surface rounded-card shadow-fk-sm border border-fk-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-fk-text-muted">Total Planned</p>
                <p className="text-2xl font-bold text-fk-info">{totalPlanned}</p>
              </div>
              <Calendar className="h-8 w-8 text-fk-info" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-surface rounded-card shadow-fk-sm border border-fk-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-fk-text-muted">Growing Now</p>
                <p className="text-2xl font-bold text-fk-success">{growingNow}</p>
              </div>
              <Sprout className="h-8 w-8 text-fk-success" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-surface rounded-card shadow-fk-sm border border-fk-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-fk-text-muted">In Harvest Window</p>
                <p className="text-2xl font-bold text-fk-accent-wheat">{inHarvestWindow}</p>
              </div>
              <Scissors className="h-8 w-8 text-fk-accent-wheat" />
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Timeline */}
      <Card className="bg-surface rounded-card shadow-fk-md border border-fk-border">
        <CardHeader>
          <CardTitle className="text-lg text-fk-text flex items-center gap-2">
            <Sprout className="h-5 w-5 text-fk-primary" />
            Crop Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {filteredPlannings.length > 0 ? (
            <div className="space-y-4">
              {filteredPlannings.map((planning) => (
                <div key={planning.id} className="bg-canvas rounded-card border border-fk-border p-4 hover:shadow-fk-sm transition-all duration-micro">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-base text-fk-text flex items-center gap-2">
                        {statusIcons[planning.status]}
                        {planning.cropName}
                        {planning.variety && <span className="text-fk-text-muted font-normal">({planning.variety})</span>}
                      </h3>
                      <p className="text-sm text-fk-text-muted">
                        {planning.location} {planning.bedNumber && `• ${planning.bedNumber}`}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium text-white ${statusColors[planning.status]}`}>
                      {statusLabels[planning.status]}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-fk-text-muted">Planted:</span>
                      <p className="text-fk-text">{formatDate(planning.plantDate)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-fk-text-muted">Harvest:</span>
                      <p className="text-fk-text">{formatDate(planning.harvestDate)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-fk-text-muted">Quantity:</span>
                      <p className="text-fk-text">{formatQuantity(planning.plantedQuantity, planning.unit)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-fk-text-muted">Est. Yield:</span>
                      <p className="text-fk-text">{planning.estimatedYield} {planning.yieldUnit}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-fk-text-muted">Season Progress</span>
                      <span className="text-fk-text">{getSeasonProgress(planning)}%</span>
                    </div>
                    <div className="w-full bg-fk-border rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-standard ${statusColors[planning.status]}`}
                        style={{ width: `${getSeasonProgress(planning)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50 text-fk-text-muted" />
              <h3 className="text-lg font-semibold mb-2 text-fk-text-muted">No crop planning data available yet</h3>
              <p className="text-fk-text-muted">Start planning your crops to see them here.</p>
            </div>
          )}
        </CardContent>
      </Card>
      {/* What Needs Your Attention - Real Logic */}
      {attentionItems.length > 0 && (
        <Card className="bg-surface rounded-card shadow-fk-md border border-fk-border">
          <CardHeader>
            <CardTitle className="text-lg text-fk-text flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              What Needs Your Attention
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {attentionItems.map((item, index) => {
                const priorityColors = {
                  high: 'border-red-200 bg-red-50',
                  medium: 'border-orange-200 bg-orange-50',
                  low: 'border-yellow-200 bg-yellow-50'
                }
                const priorityIcons = {
                  harvest: <Scissors className="h-4 w-4" />,
                  overdue: <Clock className="h-4 w-4" />,
                  weather: <CloudRain className="h-4 w-4" />,
                  pest: <Bug className="h-4 w-4" />
                }
                const priorityTextColors = {
                  high: 'text-red-700',
                  medium: 'text-orange-700',
                  low: 'text-yellow-700'
                }
                return (
                  <div key={index} className={`p-3 rounded-card border ${priorityColors[item.priority]}`}>
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 ${priorityTextColors[item.priority]}`}>
                        {priorityIcons[item.type]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-medium ${priorityTextColors[item.priority]}`}>
                            {item.crop} • {item.location}
                          </span>
                          <Badge variant="outline" className={`text-xs ${priorityTextColors[item.priority]} border-current`}>
                            {item.priority.toUpperCase()}
                          </Badge>
                        </div>
                        <p className={`text-sm ${priorityTextColors[item.priority]}`}>
                          {item.message}
                        </p>
                      </div>
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