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
  Eye
} from 'lucide-react'

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

  // Fetch crop planning data from API
  useEffect(() => {
    async function fetchPlannings() {
      try {
        const response = await fetch(`/api/crops?farmId=${farmId}&year=${currentYear}`)
        if (response.ok) {
          const data = await response.json()
          // Transform API data to component format if needed
          setPlannings(data)
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
  const uniqueCrops = Array.from(new Set(plannings.map(p => p.cropName)))
  const uniqueLocations = Array.from(new Set(plannings.map(p => p.location)))

  // Filter plannings based on selected filters
  const filteredPlannings = yearPlannings.filter(planning => {
    const matchesCrop = selectedCrop === 'all' || planning.cropName === selectedCrop
    const matchesLocation = selectedLocation === 'all' || planning.location === selectedLocation
    return matchesCrop && matchesLocation
  })

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

      {/* Simplified Single Column Timeline */}
      <Card className="bg-surface rounded-card shadow-fk-md border border-fk-border">
        <CardContent className="p-6">
          {filteredPlannings.length > 0 ? (
            <div className="space-y-4">
              {filteredPlannings.map((planning) => (
                <div key={planning.id} className="bg-canvas rounded-card border border-fk-border p-4 hover:shadow-fk-sm transition-all duration-micro">
                  {/* Crop Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-fk-text flex items-center gap-2">
                        {statusIcons[planning.status]}
                        {planning.cropName}
                        {planning.variety && <span className="text-fk-text-muted">({planning.variety})</span>}
                      </h3>
                      <p className="text-sm text-fk-text-muted">
                        {planning.location} {planning.bedNumber && `• ${planning.bedNumber}`} • {formatQuantity(planning.plantedQuantity, planning.unit)}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium text-white ${statusColors[planning.status]}`}>
                      {statusLabels[planning.status]}
                    </div>
                  </div>

                  {/* Timeline Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-semibold text-fk-text">Planted:</span>
                      <p className="text-fk-text-muted">{formatDate(planning.plantDate)}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-fk-text">Expected Harvest:</span>
                      <p className="text-fk-text-muted">{formatDate(planning.harvestDate)}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-fk-text">Expected Yield:</span>
                      <p className="text-fk-text-muted">{planning.estimatedYield} {planning.yieldUnit}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
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

                  {planning.notes && (
                    <div className="mt-3 p-3 bg-fk-primary/5 rounded-card">
                      <p className="text-sm text-fk-text-muted italic">{planning.notes}</p>
                    </div>
                  )}
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

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-surface rounded-card shadow-fk-sm border border-fk-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-fk-text-muted">Total Plantings</p>
                <p className="text-2xl font-bold text-fk-text">{filteredPlannings.length}</p>
              </div>
              <Sprout className="h-8 w-8 text-fk-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface rounded-card shadow-fk-sm border border-fk-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-fk-text-muted">Growing Now</p>
                <p className="text-2xl font-bold text-fk-success">
                  {filteredPlannings.filter(p => p.status === 'growing').length}
                </p>
              </div>
              <Sprout className="h-8 w-8 text-fk-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface rounded-card shadow-fk-sm border border-fk-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-fk-text-muted">Ready to Harvest</p>
                <p className="text-2xl font-bold text-fk-accent-wheat">
                  {filteredPlannings.filter(p => p.status === 'harvesting').length}
                </p>
              </div>
              <Scissors className="h-8 w-8 text-fk-accent-wheat" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface rounded-card shadow-fk-sm border border-fk-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-fk-text-muted">Expected Yield</p>
                <p className="text-2xl font-bold text-fk-earth">
                  {filteredPlannings.reduce((sum, p) => sum + p.estimatedYield, 0).toLocaleString()}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-fk-earth" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}