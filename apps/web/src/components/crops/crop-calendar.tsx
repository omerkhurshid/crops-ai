'use client'

import { useState, useEffect } from 'react'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '../ui/modern-card'
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

interface CropCalendarProps {
  farmId: string
  year?: number
}

// Removed mock data - will fetch from database

const months = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
]

const statusColors = {
  planned: 'bg-sage-300',
  planted: 'bg-blue-500',
  growing: 'bg-green-500',
  harvesting: 'bg-earth-500',
  completed: 'bg-sage-500'
}

const statusIcons = {
  planned: <Calendar className="h-4 w-4" />,
  planted: <Circle className="h-4 w-4" />,
  growing: <Sprout className="h-4 w-4" />,
  harvesting: <Scissors className="h-4 w-4" />,
  completed: <TrendingUp className="h-4 w-4" />
}

export function CropCalendar({ farmId, year = 2024 }: CropCalendarProps) {
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
  const uniqueCrops = Array.from(new Set(ensureArray(plannings).map(p => p.cropName)))
  const uniqueLocations = Array.from(new Set(ensureArray(plannings).map(p => p.location)))

  // Filter plannings based on selected filters
  const filteredPlannings = yearPlannings.filter(planning => {
    const matchesCrop = selectedCrop === 'all' || planning.cropName === selectedCrop
    const matchesLocation = selectedLocation === 'all' || planning.location === selectedLocation
    return matchesCrop && matchesLocation
  })

  const getTimelinePosition = (planning: CropPlanning) => {
    const startDate = new Date(planning.startDate)
    const endDate = new Date(planning.harvestDate)
    
    // Calculate position within the year
    const yearStart = new Date(currentYear, 0, 1)
    const yearEnd = new Date(currentYear, 11, 31)
    
    const startPos = Math.max(0, (startDate.getTime() - yearStart.getTime()) / (yearEnd.getTime() - yearStart.getTime())) * 100
    const endPos = Math.min(100, (endDate.getTime() - yearStart.getTime()) / (yearEnd.getTime() - yearStart.getTime())) * 100
    const width = Math.max(2, endPos - startPos)
    
    return { left: startPos, width }
  }

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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-600 mx-auto"></div>
          <p className="text-sage-600 mt-4">Loading crop planning data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-semibold text-sage-800 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-sage-600" />
            Crop Timeline
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentYear(currentYear - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Badge variant="outline" className="px-4 py-2 bg-sage-100 text-sage-800 border-sage-300 font-semibold">
              {currentYear} Season
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentYear(currentYear + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={selectedCrop} onValueChange={setSelectedCrop}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Crops" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Crops</SelectItem>
                {uniqueCrops.map(crop => (
                  <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {uniqueLocations.map(location => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button className="bg-sage-600 hover:bg-sage-700 text-white rounded-lg flex-1 sm:flex-none">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Add Planting</span>
              <span className="sm:hidden">Add</span>
            </Button>

            <Button variant="outline" className="flex-1 sm:flex-none">
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Export</span>
              <span className="sm:hidden">Export</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Calendar View */}
      <ModernCard variant="floating">
        <ModernCardContent className="p-0">
          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header Row */}
              <div className="grid grid-cols-12 gap-0 border-b border-sage-200/30 bg-white">
                <div className="col-span-5 p-4 border-r border-sage-200/30">
                  <div className="grid grid-cols-3 gap-2 text-sm font-semibold text-sage-800">
                    <span className="truncate">Crop</span>
                    <span className="truncate">Location</span>
                    <span className="truncate">Dates</span>
                  </div>
                </div>
                <div className="col-span-7 p-2">
                  <div className="grid grid-cols-12 gap-0">
                    {months.map((month, index) => (
                      <div key={month} className="text-center text-xs font-semibold text-sage-700 py-2 px-1">
                        {month}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Planning Rows */}
              <div className="divide-y">
                {filteredPlannings.length > 0 ? filteredPlannings.map((planning) => {
                  const timeline = getTimelinePosition(planning)
                  
                  return (
                    <div key={planning.id} className="grid grid-cols-12 gap-0 hover:bg-sage-50 transition-colors min-h-[80px]">
                      {/* Left Info Panel */}
                      <div className="col-span-5 p-3 border-r border-sage-200/30">
                        <div className="grid grid-cols-3 gap-2">
                          {/* Crop Name */}
                          <div className="min-w-0">
                            <h4 className="font-semibold text-sage-700 text-xs hover:text-sage-800 cursor-pointer truncate">
                              {planning.cropName}
                            </h4>
                            <p className="text-xs text-sage-500 truncate">
                              {formatQuantity(planning.plantedQuantity, planning.unit)}
                            </p>
                          </div>

                          {/* Location */}
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-sage-700 truncate">{planning.location}</p>
                            {planning.bedNumber && (
                              <p className="text-xs text-sage-500 truncate">{planning.bedNumber}</p>
                            )}
                          </div>

                          {/* Key Dates */}
                          <div className="min-w-0">
                            <div className="text-xs text-sage-600 space-y-1">
                              <div className="truncate">Start: {formatDate(planning.startDate)}</div>
                              <div className="truncate">Harvest: {formatDate(planning.harvestDate)}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Timeline Section */}
                      <div className="col-span-7 p-2 relative">
                        <div className="relative h-16 bg-sage-50/30">
                          {/* Month Grid Lines (subtle) */}
                          <div className="absolute inset-0 grid grid-cols-12 gap-0 pointer-events-none opacity-20">
                            {months.map((_, index) => (
                              <div key={index} className="border-r border-sage-200/20"></div>
                            ))}
                          </div>
                          
                          {/* Timeline Bar - FieldKit Enhanced */}
                          <div
                            className={`absolute top-2 h-12 rounded-lg ${statusColors[planning.status]} shadow-soft flex items-center px-2 text-white text-xs font-semibold transition-all hover:shadow-soft-lg cursor-pointer`}
                            style={{
                              left: `${Math.max(1, timeline.left)}%`,
                              width: `${Math.max(8, timeline.width)}%`,
                              minWidth: '40px'
                            }}
                            title={`${planning.cropName} - ${planning.status}`}
                          >
                            <div className="flex items-center gap-1 w-full">
                              <span className="w-3 h-3 flex-shrink-0">
                                {statusIcons[planning.status]}
                              </span>
                              <span className="truncate text-xs">
                                {planning.cropName.split(' ')[0]}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                }) : (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50 text-sage-400" />
                    <h3 className="text-lg font-semibold mb-2 text-sage-600">No crop planning data available yet</h3>
                    <p className="text-sage-500">Start planning your crops to see them on the timeline.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile View */}
          <div className="md:hidden">
            {filteredPlannings.length > 0 ? (
              <div className="divide-y divide-sage-200/30">
                {filteredPlannings.map((planning) => (
                  <div key={planning.id} className="p-4 hover:bg-sage-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sage-800 text-sm">{planning.cropName}</h4>
                        <p className="text-xs text-sage-600">{planning.location}</p>
                        {planning.bedNumber && (
                          <p className="text-xs text-sage-500">{planning.bedNumber}</p>
                        )}
                      </div>
                      <div className={`px-2 py-1 rounded-lg ${statusColors[planning.status]} text-white text-xs font-medium flex items-center gap-1`}>
                        {statusIcons[planning.status]}
                        <span className="capitalize">{planning.status}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-sage-500">Planted:</span>
                        <span className="ml-1 text-sage-700">{formatDate(planning.startDate)}</span>
                      </div>
                      <div>
                        <span className="text-sage-500">Harvest:</span>
                        <span className="ml-1 text-sage-700">{formatDate(planning.harvestDate)}</span>
                      </div>
                      <div>
                        <span className="text-sage-500">Quantity:</span>
                        <span className="ml-1 text-sage-700">{formatQuantity(planning.plantedQuantity, planning.unit)}</span>
                      </div>
                      <div>
                        <span className="text-sage-500">Expected Yield:</span>
                        <span className="ml-1 text-sage-700">{planning.estimatedYield.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50 text-sage-400" />
                <h3 className="text-lg font-semibold mb-2 text-sage-600">No crop planning data available yet</h3>
                <p className="text-sage-500">Start planning your crops to see them here.</p>
              </div>
            )}
          </div>
        </ModernCardContent>
      </ModernCard>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ModernCard variant="soft">
          <ModernCardContent className="p-3 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-semibold text-sage-600">Total Plantings</p>
                <p className="text-lg sm:text-2xl font-bold text-sage-800">{filteredPlannings.length}</p>
              </div>
              <Sprout className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
            </div>
          </ModernCardContent>
        </ModernCard>

        <ModernCard variant="soft">
          <ModernCardContent className="p-3 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-semibold text-sage-600">Growing Now</p>
                <p className="text-lg sm:text-2xl font-bold text-green-600">
                  {filteredPlannings.filter(p => p.status === 'growing').length}
                </p>
              </div>
              <Sprout className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
            </div>
          </ModernCardContent>
        </ModernCard>

        <ModernCard variant="soft">
          <ModernCardContent className="p-3 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-semibold text-sage-600">Ready to Harvest</p>
                <p className="text-lg sm:text-2xl font-bold text-earth-600">
                  {filteredPlannings.filter(p => p.status === 'harvesting').length}
                </p>
              </div>
              <Scissors className="h-6 w-6 sm:h-8 sm:w-8 text-earth-600" />
            </div>
          </ModernCardContent>
        </ModernCard>

        <ModernCard variant="soft">
          <ModernCardContent className="p-3 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-semibold text-sage-600">Planned Yield</p>
                <p className="text-lg sm:text-2xl font-bold text-blue-600">
                  {filteredPlannings.reduce((sum, p) => sum + p.estimatedYield, 0).toLocaleString()}
                </p>
              </div>
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            </div>
          </ModernCardContent>
        </ModernCard>
      </div>

      {/* Legend */}
      <ModernCard variant="soft">
        <ModernCardHeader>
          <ModernCardTitle className="text-lg">Status Legend</ModernCardTitle>
        </ModernCardHeader>
        <ModernCardContent>
          <div className="flex flex-wrap gap-4">
            {Object.entries(statusColors).map(([status, color]) => (
              <div key={status} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-lg ${color}`}></div>
                <span className="text-sm capitalize font-medium text-sage-700">{status}</span>
              </div>
            ))}
          </div>
        </ModernCardContent>
      </ModernCard>
    </div>
  )
}