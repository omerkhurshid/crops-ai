'use client'
import { useState } from 'react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { 
  Search, 
  Filter,
  Target,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Eye,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'
interface MarketAnalysisProps {
  animals: any[]
  farms: any[]
}
export function MarketAnalysis({ animals, farms }: MarketAnalysisProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFarm, setSelectedFarm] = useState('all')
  const [selectedSpecies, setSelectedSpecies] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  // Filter animals
  const filteredAnimals = animals.filter(animal => {
    const matchesSearch = animal.tagNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (animal.name && animal.name.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesFarm = selectedFarm === 'all' || animal.farm?.name === selectedFarm
    const matchesSpecies = selectedSpecies === 'all' || animal.species === selectedSpecies
    const matchesStatus = selectedStatus === 'all' || animal.readinessStatus === selectedStatus
    return matchesSearch && matchesFarm && matchesSpecies && matchesStatus
  })
  // Sort by readiness score (highest first)
  const sortedAnimals = [...filteredAnimals].sort((a, b) => b.readinessScore - a.readinessScore)
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-[#F8FAF8] text-green-800'
      case 'approaching': return 'bg-yellow-100 text-yellow-800'
      case 'not_ready': return 'bg-[#F5F5F5] text-[#1A1A1A]'
      default: return 'bg-[#F5F5F5] text-[#1A1A1A]'
    }
  }
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'approaching': return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case 'not_ready': return <Calendar className="h-4 w-4 text-[#555555]" />
      default: return <Calendar className="h-4 w-4 text-[#555555]" />
    }
  }
  const getGrowthTrendIcon = (growthRate: number) => {
    if (growthRate > 0.5) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (growthRate > 0) return <TrendingUp className="h-4 w-4 text-blue-500" />
    if (growthRate < -0.5) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <TrendingDown className="h-4 w-4 text-gray-400" />
  }
  // Get unique values for filters
  const uniqueFarms = Array.from(new Set(animals.map(animal => animal.farm?.name).filter(Boolean)))
  const uniqueSpecies = Array.from(new Set(animals.map(animal => animal.species)))
  const uniqueStatuses = ['ready', 'approaching', 'not_ready']
  if (animals.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <Target className="h-16 w-16 mx-auto mb-4" />
        </div>
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">No Market Data Available</h3>
        <p className="text-[#555555] mb-6">Add animals and weight records to see market analysis.</p>
        <Link href="/livestock/animals/add">
          <Button>Add Your First Animal</Button>
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
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 border border-[#E6E6E6] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Statuses</option>
          {uniqueStatuses.map(status => (
            <option key={status} value={status}>
              {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </option>
          ))}
        </select>
      </div>
      {/* Market Analysis Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#FAFAF7]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#555555] uppercase tracking-wider">
                Animal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#555555] uppercase tracking-wider">
                Current Weight
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#555555] uppercase tracking-wider">
                Market Target
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#555555] uppercase tracking-wider">
                Growth Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#555555] uppercase tracking-wider">
                Market Readiness
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#555555] uppercase tracking-wider">
                Est. Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#555555] uppercase tracking-wider">
                Time to Market
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#555555] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedAnimals.map((animal) => (
              <tr key={animal.id} className="hover:bg-[#FAFAF7]">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-[#1A1A1A]">
                        #{animal.tagNumber}
                      </div>
                      {animal.name && (
                        <div className="text-sm text-[#555555]">{animal.name}</div>
                      )}
                      <div className="text-xs text-gray-400">
                        {animal.species} • {animal.farm?.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-[#1A1A1A]">
                    {animal.currentWeight || 0} lbs
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[#1A1A1A]">
                    {animal.marketTarget.optimal} lbs
                  </div>
                  <div className="text-xs text-[#555555]">
                    Range: {animal.marketTarget.min}-{animal.marketTarget.max} lbs
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {getGrowthTrendIcon(animal.growthRate)}
                    <span className="text-sm text-[#1A1A1A]">
                      {animal.growthRate > 0 ? '+' : ''}{animal.growthRate.toFixed(2)} lbs/day
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon(animal.readinessStatus)}
                    <Badge className={`${getStatusColor(animal.readinessStatus)}`}>
                      {animal.readinessStatus.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="w-full bg-[#F5F5F5] rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        animal.readinessScore >= 90 ? 'bg-[#8FBF7F]' :
                        animal.readinessScore >= 70 ? 'bg-yellow-500' :
                        'bg-gray-400'
                      }`}
                      style={{ width: `${Math.min(100, animal.readinessScore)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-[#555555] mt-1">
                    {animal.readinessScore.toFixed(0)}% ready
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-[#1A1A1A]">
                    ${animal.projectedValue.toFixed(0)}
                  </div>
                  <div className="text-xs text-[#555555]">
                    ${animal.pricePerLb.toFixed(2)}/lb
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {animal.readinessStatus === 'ready' ? (
                    <span className="text-sm font-medium text-green-600">Ready Now</span>
                  ) : animal.daysToOptimal > 0 ? (
                    <div>
                      <div className="text-sm text-[#1A1A1A]">
                        {animal.daysToOptimal} days
                      </div>
                      <div className="text-xs text-[#555555]">
                        {new Date(Date.now() + animal.daysToOptimal * 24 * 60 * 60 * 1000).toLocaleDateString()}
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-[#555555]">No growth data</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <Link href={`/livestock/animals/${animal.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filteredAnimals.length === 0 && searchTerm && (
        <div className="text-center py-8">
          <p className="text-[#555555]">No animals found matching your search criteria.</p>
        </div>
      )}
    </div>
  )
}