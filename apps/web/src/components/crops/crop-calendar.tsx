'use client'

import { useState } from 'react'
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

interface CropCalendarProps {
  farmId: string
  year?: number
}

const mockCropPlannings: CropPlanning[] = [
  {
    id: '1',
    cropName: 'Asparagus Giant',
    variety: 'ASGI',
    location: 'Southwest Growing',
    bedNumber: 'Row 1',
    plantedQuantity: 43200,
    unit: 'sqft',
    startDate: '2024-09-30',
    plantDate: '2024-09-30',
    harvestDate: '2024-09-30',
    estimatedYield: 2000,
    yieldUnit: 'lbs',
    status: 'harvesting'
  },
  {
    id: '2',
    cropName: 'Cucumber Marketmore 76',
    variety: 'Cucumber',
    location: 'Market garden 1',
    bedNumber: 'G5',
    plantedQuantity: 1200,
    unit: 'sqft',
    startDate: '2024-10-12',
    plantDate: '2024-10-12',
    harvestDate: '2025-01-20',
    estimatedYield: 800,
    yieldUnit: 'lbs',
    status: 'growing'
  },
  {
    id: '3',
    cropName: 'Winter Wheat',
    variety: 'WWI',
    location: 'Wheat Field',
    bedNumber: '',
    plantedQuantity: 31275840,
    unit: 'sqft',
    startDate: '2024-11-23',
    plantDate: '2024-11-23',
    harvestDate: '2025-07-22',
    estimatedYield: 1500,
    yieldUnit: 'bushels',
    status: 'growing'
  },
  {
    id: '4',
    cropName: 'Apple Walla Walla',
    variety: 'APWA',
    location: 'Orchard',
    bedNumber: 'O3',
    plantedQuantity: 25,
    unit: 'plants',
    startDate: '2024-01-13',
    plantDate: '2024-01-13',
    harvestDate: '2025-02-07',
    estimatedYield: 500,
    yieldUnit: 'lbs',
    status: 'growing'
  },
  {
    id: '5',
    cropName: 'Apple Walla Walla',
    variety: 'APWA',
    location: 'Orchard',
    bedNumber: 'O2',
    plantedQuantity: 25,
    unit: 'plants',
    startDate: '2024-11-30',
    plantDate: '2024-11-30',
    harvestDate: '2024-12-25',
    estimatedYield: 450,
    yieldUnit: 'lbs',
    status: 'completed'
  },
  {
    id: '6',
    cropName: 'Arugula Market',
    variety: 'ARMA',
    location: 'Garden tower',
    bedNumber: 'O5',
    plantedQuantity: 288,
    unit: 'sqft',
    startDate: '2024-01-21',
    plantDate: '2024-01-21',
    harvestDate: '2024-03-13',
    estimatedYield: 50,
    yieldUnit: 'lbs',
    status: 'completed'
  },
  {
    id: '7',
    cropName: 'Arugula Market',
    variety: 'ARMA',
    location: 'Greens Beds',
    bedNumber: 'G2',
    plantedQuantity: 14400,
    unit: 'sqft',
    startDate: '2024-02-14',
    plantDate: '2024-02-14',
    harvestDate: '2024-04-06',
    estimatedYield: 200,
    yieldUnit: 'lbs',
    status: 'completed'
  },
  {
    id: '8',
    cropName: 'Arugula Market',
    variety: 'ARMA',
    location: 'Greens Beds',
    bedNumber: 'G1',
    plantedQuantity: 1000,
    unit: 'sqft',
    startDate: '2024-12-14',
    plantDate: '2024-12-14',
    harvestDate: '2025-02-03',
    estimatedYield: 75,
    yieldUnit: 'lbs',
    status: 'planned'
  }
]

const months = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
]

const statusColors = {
  planned: 'bg-gray-200',
  planted: 'bg-blue-400',
  growing: 'bg-green-400',
  harvesting: 'bg-yellow-400',
  completed: 'bg-gray-400'
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

  // Filter plannings by year
  const yearPlannings = mockCropPlannings.filter(planning => {
    const startYear = new Date(planning.startDate).getFullYear()
    const endYear = new Date(planning.harvestDate).getFullYear()
    return startYear === currentYear || endYear === currentYear
  })

  // Get unique crops and locations for filtering
  const uniqueCrops = Array.from(new Set(mockCropPlannings.map(p => p.cropName)))
  const uniqueLocations = Array.from(new Set(mockCropPlannings.map(p => p.location)))

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

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-semibold text-gray-900">Crop Plan</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentYear(currentYear - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="px-4 py-2 bg-white border rounded-md font-medium">
              Planting Year {currentYear}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentYear(currentYear + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select value={selectedCrop} onValueChange={setSelectedCrop}>
            <SelectTrigger className="w-40">
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
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {uniqueLocations.map(location => (
                <SelectItem key={location} value={location}>{location}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button className="bg-sage-600 hover:bg-sage-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Planting
          </Button>

          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Main Calendar View */}
      <Card>
        <CardContent className="p-0">
          {/* Header Row */}
          <div className="grid grid-cols-12 gap-0 border-b bg-gray-50">
            <div className="col-span-4 p-4 border-r">
              <div className="grid grid-cols-3 gap-4 text-sm font-medium text-gray-700">
                <span># Planted</span>
                <span>Location</span>
                <span>Key Dates</span>
              </div>
            </div>
            <div className="col-span-8 p-2">
              <div className="grid grid-cols-12 gap-0">
                {months.map((month, index) => (
                  <div key={month} className="text-center text-sm font-medium text-gray-700 py-2">
                    {month}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Planning Rows */}
          <div className="divide-y">
            {filteredPlannings.map((planning) => {
              const timeline = getTimelinePosition(planning)
              
              return (
                <div key={planning.id} className="grid grid-cols-12 gap-0 hover:bg-gray-50 transition-colors">
                  {/* Left Info Panel */}
                  <div className="col-span-4 p-4 border-r">
                    <div className="grid grid-cols-3 gap-4">
                      {/* Planted Quantity */}
                      <div>
                        <h4 className="font-semibold text-blue-600 text-sm hover:text-blue-700 cursor-pointer">
                          {planning.cropName} {planning.variety}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {formatQuantity(planning.plantedQuantity, planning.unit)}
                        </p>
                      </div>

                      {/* Location */}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{planning.location}</p>
                        {planning.bedNumber && (
                          <p className="text-xs text-gray-500">Beds: {planning.bedNumber}</p>
                        )}
                      </div>

                      {/* Key Dates */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs">
                          <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                          <span>Start: {formatDate(planning.startDate)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span>Plant: {formatDate(planning.plantDate)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <span>Harvest: {formatDate(planning.harvestDate)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline Section */}
                  <div className="col-span-8 p-2 relative">
                    <div className="relative h-12 bg-white">
                      {/* Timeline Bar */}
                      <div
                        className={`absolute top-2 h-8 rounded-md ${statusColors[planning.status]} shadow-sm flex items-center px-2 text-white text-xs font-medium transition-all hover:shadow-md cursor-pointer`}
                        style={{
                          left: `${timeline.left}%`,
                          width: `${timeline.width}%`,
                          minWidth: '40px'
                        }}
                        title={`${planning.cropName} - ${planning.status}`}
                      >
                        <div className="flex items-center gap-1">
                          {statusIcons[planning.status]}
                          <span className="hidden sm:inline truncate">
                            {planning.cropName}
                          </span>
                        </div>
                      </div>

                      {/* Month Grid Lines (subtle) */}
                      <div className="absolute inset-0 grid grid-cols-12 gap-0 pointer-events-none opacity-20">
                        {months.map((_, index) => (
                          <div key={index} className="border-r border-gray-200"></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Plantings</p>
                <p className="text-2xl font-bold text-gray-900">{filteredPlannings.length}</p>
              </div>
              <Sprout className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Growing Now</p>
                <p className="text-2xl font-bold text-green-900">
                  {filteredPlannings.filter(p => p.status === 'growing').length}
                </p>
              </div>
              <Sprout className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ready to Harvest</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {filteredPlannings.filter(p => p.status === 'harvesting').length}
                </p>
              </div>
              <Scissors className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Planned Yield</p>
                <p className="text-2xl font-bold text-blue-900">
                  {filteredPlannings.reduce((sum, p) => sum + p.estimatedYield, 0).toLocaleString()}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Status Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {Object.entries(statusColors).map(([status, color]) => (
              <div key={status} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${color}`}></div>
                <span className="text-sm capitalize text-gray-700">{status}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}