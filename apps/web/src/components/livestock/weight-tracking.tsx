'use client'
import { useState } from 'react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { 
  Search, 
  Filter,
  Edit,
  Trash2,
  Eye,
  Plus,
  Weight,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react'
import Link from 'next/link'
interface WeightTrackingProps {
  weightRecords: any[]
  farms: any[]
  animals: any[]
}
export function WeightTracking({ weightRecords, farms, animals }: WeightTrackingProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFarm, setSelectedFarm] = useState('all')
  const [selectedAnimal, setSelectedAnimal] = useState('all')
  const [selectedSpecies, setSelectedSpecies] = useState('all')
  const [dateRange, setDateRange] = useState('90') // days
  // Filter weight records
  const filteredRecords = weightRecords.filter(record => {
    const matchesSearch = record.animal.tagNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (record.animal.name && record.animal.name.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesFarm = selectedFarm === 'all' || record.animal.farm?.name === selectedFarm
    const matchesAnimal = selectedAnimal === 'all' || record.animalId === selectedAnimal
    const matchesSpecies = selectedSpecies === 'all' || record.animal.species === selectedSpecies
    // Date range filter
    let matchesDate = true
    if (dateRange !== 'all') {
      const daysAgo = parseInt(dateRange)
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo)
      matchesDate = new Date(record.weighDate) >= cutoffDate
    }
    return matchesSearch && matchesFarm && matchesAnimal && matchesSpecies && matchesDate
  })
  // Calculate weight trends for each animal
  const getWeightTrend = (animalId: string) => {
    const animalRecords = weightRecords
      .filter(record => record.animalId === animalId)
      .sort((a, b) => new Date(b.weighDate).getTime() - new Date(a.weighDate).getTime())
    if (animalRecords.length < 2) return { trend: 'stable', change: 0, percentage: 0 }
    const latest = animalRecords[0]
    const previous = animalRecords[1]
    const change = latest.weight - previous.weight
    const percentage = ((change / previous.weight) * 100)
    if (change > 5) return { trend: 'up', change, percentage }
    if (change < -5) return { trend: 'down', change, percentage }
    return { trend: 'stable', change, percentage }
  }
  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 'Unknown'
    const birth = new Date(birthDate)
    const now = new Date()
    const monthsDiff = (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth()
    if (monthsDiff < 12) return `${monthsDiff}m`
    const years = Math.floor(monthsDiff / 12)
    const remainingMonths = monthsDiff % 12
    if (remainingMonths === 0) return `${years}y`
    return `${years}y ${remainingMonths}m`
  }
  // Get unique values for filters
  const uniqueFarms = Array.from(new Set(weightRecords.map(record => record.animal.farm?.name).filter(Boolean)))
  const uniqueSpecies = Array.from(new Set(weightRecords.map(record => record.animal.species)))
  if (weightRecords.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <Weight className="h-16 w-16 mx-auto mb-4" />
        </div>
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">No Weight Records Yet</h3>
        <p className="text-[#555555] mb-6">Start tracking growth by recording your first weight measurement.</p>
        <Link href="/livestock/weight/add">
          <Button>Record First Weight</Button>
        </Link>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by animal tag number or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedFarm}
          onChange={(e) => setSelectedFarm(e.target.value)}
          className="px-3 py-2 border border-[#E6E6E6] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Farms</option>
          {uniqueFarms.map(farm => (
            <option key={farm} value={farm}>{farm}</option>
          ))}
        </select>
        <select
          value={selectedAnimal}
          onChange={(e) => setSelectedAnimal(e.target.value)}
          className="px-3 py-2 border border-[#E6E6E6] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Animals</option>
          {animals.map(animal => (
            <option key={animal.id} value={animal.id}>
              #{animal.tagNumber} {animal.name && `(${animal.name})`}
            </option>
          ))}
        </select>
        <select
          value={selectedSpecies}
          onChange={(e) => setSelectedSpecies(e.target.value)}
          className="px-3 py-2 border border-[#E6E6E6] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Species</option>
          {uniqueSpecies.map(species => (
            <option key={species} value={species}>
              {species.charAt(0).toUpperCase() + species.slice(1)}
            </option>
          ))}
        </select>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-3 py-2 border border-[#E6E6E6] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="180">Last 6 months</option>
          <option value="365">Last year</option>
          <option value="all">All time</option>
        </select>
      </div>
      {/* Weight Records Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#FAFAF7]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#555555] uppercase tracking-wider">
                Animal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#555555] uppercase tracking-wider">
                Weight
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#555555] uppercase tracking-wider">
                Trend
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#555555] uppercase tracking-wider">
                Body Condition
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#555555] uppercase tracking-wider">
                Age at Weighing
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#555555] uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#555555] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRecords.map((record) => {
              const trend = getWeightTrend(record.animalId)
              return (
                <tr key={record.id} className="hover:bg-[#FAFAF7]">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-[#1A1A1A]">
                          #{record.animal.tagNumber}
                        </div>
                        {record.animal.name && (
                          <div className="text-sm text-[#555555]">{record.animal.name}</div>
                        )}
                        <div className="text-xs text-gray-400">
                          {record.animal.species} • {record.animal.farm?.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-[#1A1A1A]">
                      {record.weight} lbs
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {trend.trend === 'up' && (
                        <>
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-600">
                            +{trend.change.toFixed(1)} lbs ({trend.percentage.toFixed(1)}%)
                          </span>
                        </>
                      )}
                      {trend.trend === 'down' && (
                        <>
                          <TrendingDown className="h-4 w-4 text-red-500" />
                          <span className="text-sm text-red-600">
                            {trend.change.toFixed(1)} lbs ({trend.percentage.toFixed(1)}%)
                          </span>
                        </>
                      )}
                      {trend.trend === 'stable' && (
                        <>
                          <Minus className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-[#555555]">Stable</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {record.bodyConditionScore ? (
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          record.bodyConditionScore <= 2 ? 'bg-red-500' :
                          record.bodyConditionScore <= 3 ? 'bg-yellow-500' :
                          record.bodyConditionScore <= 4 ? 'bg-[#8FBF7F]' :
                          'bg-blue-500'
                        }`} />
                        <span className="text-sm text-[#1A1A1A]">
                          {record.bodyConditionScore}/5
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Not recorded</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-[#1A1A1A]">
                      {calculateAge(record.animal.birthDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-[#1A1A1A]">
                      {new Date(record.weighDate).toLocaleDateString()}
                    </div>
                    {record.notes && (
                      <div className="text-xs text-[#555555] truncate max-w-32">
                        {record.notes}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {filteredRecords.length === 0 && searchTerm && (
        <div className="text-center py-8">
          <p className="text-[#555555]">No weight records found matching your search criteria.</p>
        </div>
      )}
    </div>
  )
}