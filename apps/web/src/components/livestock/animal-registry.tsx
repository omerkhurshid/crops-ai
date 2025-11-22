'use client'
import { useState } from 'react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { 
  Eye, 
  Heart, 
  TrendingUp, 
  Search, 
  Filter,
  MoreVertical,
  Edit,
  Trash2
} from 'lucide-react'
import Link from 'next/link'
interface AnimalRegistryProps {
  animals: any[]
  farms: any[]
}
export function AnimalRegistry({ animals, farms }: AnimalRegistryProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFarm, setSelectedFarm] = useState('all')
  const [selectedSpecies, setSelectedSpecies] = useState('all')
  // Filter animals based on search and filters
  const filteredAnimals = animals.filter(animal => {
    const matchesSearch = animal.tagNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (animal.name && animal.name.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesFarm = selectedFarm === 'all' || animal.farmId === selectedFarm
    const matchesSpecies = selectedSpecies === 'all' || animal.species === selectedSpecies
    return matchesSearch && matchesFarm && matchesSpecies
  })
  const getHealthStatus = (animal: any) => {
    const recentHealthIssues = animal.healthRecords?.filter((record: any) => 
      ['illness', 'injury'].includes(record.recordType) && 
      new Date(record.recordDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ) || []
    if (recentHealthIssues.length > 0) return 'needs-attention'
    return 'healthy'
  }
  const getWeightTrend = (animal: any) => {
    if (!animal.weightRecords || animal.weightRecords.length < 2) return 'stable'
    const [latest, previous] = animal.weightRecords
    const change = latest.weight - previous.weight
    if (change > 5) return 'up'
    if (change < -5) return 'down'
    return 'stable'
  }
  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 'Unknown'
    const birth = new Date(birthDate)
    const now = new Date()
    const monthsDiff = (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth()
    if (monthsDiff < 12) return `${monthsDiff} months`
    const years = Math.floor(monthsDiff / 12)
    const remainingMonths = monthsDiff % 12
    if (remainingMonths === 0) return `${years} ${years === 1 ? 'year' : 'years'}`
    return `${years}y ${remainingMonths}m`
  }
  // Get unique species for filter
  const uniqueSpecies = Array.from(new Set(animals.map(animal => animal.species)))
  if (animals.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-[#555555] mb-4">
          <Heart className="h-16 w-16 mx-auto mb-4" />
        </div>
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">No Animals Yet</h3>
        <p className="text-[#555555] mb-6">Start building your herd by adding your first animal.</p>
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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#555555]" />
          <Input
            placeholder="Search by tag number or name..."
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
          {farms.map(farm => (
            <option key={farm.id} value={farm.id}>{farm.name}</option>
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
      </div>
      {/* Animal Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAnimals.map(animal => (
          <div key={animal.id} className="bg-white rounded-lg border border-[#E6E6E6] shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#1A1A1A]">
                    #{animal.tagNumber}
                  </h3>
                  {animal.name && (
                    <p className="text-sm text-[#555555]">{animal.name}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {/* Health Status */}
                  <div className={`w-3 h-3 rounded-full ${
                    getHealthStatus(animal) === 'healthy' ? 'bg-[#8FBF7F]' : 'bg-yellow-500'
                  }`} />
                  {/* Weight Trend */}
                  <TrendingUp className={`h-4 w-4 ${
                    getWeightTrend(animal) === 'up' ? 'text-[#8FBF7F]' : 
                    getWeightTrend(animal) === 'down' ? 'text-red-500' : 'text-[#555555]'
                  }`} />
                </div>
              </div>
              {/* Animal Info */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[#555555]">Species:</span>
                  <span className="font-medium">{animal.species}</span>
                </div>
                {animal.breed && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#555555]">Breed:</span>
                    <span className="font-medium">{animal.breed}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-[#555555]">Gender:</span>
                  <span className="font-medium">{animal.gender}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#555555]">Age:</span>
                  <span className="font-medium">{calculateAge(animal.birthDate)}</span>
                </div>
                {animal.currentWeight && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#555555]">Weight:</span>
                    <span className="font-medium">{animal.currentWeight} lbs</span>
                  </div>
                )}
              </div>
              {/* Status Badge */}
              <div className="flex items-center justify-between mb-4">
                <Badge 
                  variant={animal.status === 'active' ? 'default' : 'secondary'}
                  className="capitalize"
                >
                  {animal.status}
                </Badge>
                <span className="text-xs text-[#555555]">
                  {animal.farm?.name}
                </span>
              </div>
              {/* Actions */}
              <div className="flex items-center gap-2">
                <Link href={`/livestock/animals/${animal.id}`} className="flex-1">
                  <Button variant="outline" className="w-full flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    View Profile
                  </Button>
                </Link>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {filteredAnimals.length === 0 && searchTerm && (
        <div className="text-center py-8">
          <p className="text-[#555555]">No animals found matching your search criteria.</p>
        </div>
      )}
    </div>
  )
}