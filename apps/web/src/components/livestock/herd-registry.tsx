'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Calendar,
  MapPin,
  Users,
  Baby,
  Activity
} from 'lucide-react'

interface Animal {
  id: string
  tagNumber: string
  name?: string
  species: 'cattle' | 'pig' | 'sheep' | 'goat' | 'chicken' | 'horse' | 'other'
  breed: string
  gender: 'male' | 'female'
  birthDate: string
  weight?: number
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor' | 'sick'
  location: string
  motherId?: string
  fatherId?: string
  lastCheckup?: string
  vaccinations: number
  notes?: string
}

interface HerdRegistryProps {
  farmId: string
}

const mockAnimals: Animal[] = [
  {
    id: '1',
    tagNumber: 'C001',
    name: 'Bessie',
    species: 'cattle',
    breed: 'Holstein',
    gender: 'female',
    birthDate: '2020-03-15',
    weight: 650,
    healthStatus: 'excellent',
    location: 'Pasture A',
    lastCheckup: '2024-03-01',
    vaccinations: 12,
    notes: 'Top milk producer in herd'
  },
  {
    id: '2',
    tagNumber: 'C002',
    name: 'Duke',
    species: 'cattle',
    breed: 'Angus',
    gender: 'male',
    birthDate: '2019-08-20',
    weight: 890,
    healthStatus: 'good',
    location: 'Pasture B',
    lastCheckup: '2024-02-28',
    vaccinations: 15,
    notes: 'Breeding bull, excellent genetics'
  },
  {
    id: '3',
    tagNumber: 'S001',
    species: 'sheep',
    breed: 'Merino',
    gender: 'female',
    birthDate: '2021-01-10',
    weight: 65,
    healthStatus: 'fair',
    location: 'Sheep Pen',
    lastCheckup: '2024-02-15',
    vaccinations: 8,
    notes: 'Recent lambing, monitoring closely'
  },
  {
    id: '4',
    tagNumber: 'P001',
    species: 'pig',
    breed: 'Yorkshire',
    gender: 'female',
    birthDate: '2022-05-12',
    weight: 180,
    healthStatus: 'good',
    location: 'Barn 1',
    lastCheckup: '2024-03-05',
    vaccinations: 6,
    notes: 'Pregnant, due next month'
  }
]

const speciesIcons: Record<string, string> = {
  cattle: '🐄',
  pig: '🐷',
  sheep: '🐑',
  goat: '🐐',
  chicken: '🐓',
  horse: '🐎',
  other: '🐾'
}

const healthStatusColors: Record<string, string> = {
  excellent: 'bg-green-100 text-green-800 border-green-200',
  good: 'bg-blue-100 text-blue-800 border-blue-200',
  fair: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  poor: 'bg-orange-100 text-orange-800 border-orange-200',
  sick: 'bg-red-100 text-red-800 border-red-200'
}

export function HerdRegistry({ farmId }: HerdRegistryProps) {
  const [animals, setAnimals] = useState<Animal[]>(mockAnimals)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecies, setSelectedSpecies] = useState<string>('all')
  const [selectedHealth, setSelectedHealth] = useState<string>('all')

  // Filter animals
  const filteredAnimals = animals.filter(animal => {
    const matchesSearch = animal.tagNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.breed.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpecies = selectedSpecies === 'all' || animal.species === selectedSpecies
    const matchesHealth = selectedHealth === 'all' || animal.healthStatus === selectedHealth
    
    return matchesSearch && matchesSpecies && matchesHealth
  })

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate)
    const today = new Date()
    const ageInYears = Math.floor((today.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    const ageInMonths = Math.floor((today.getTime() - birth.getTime()) / (30.44 * 24 * 60 * 60 * 1000))
    
    if (ageInYears >= 1) {
      return `${ageInYears}y ${ageInMonths % 12}m`
    } else {
      return `${ageInMonths}m`
    }
  }

  const formatLastCheckup = (date: string) => {
    const checkup = new Date(date)
    const today = new Date()
    const diffDays = Math.floor((today.getTime() - checkup.getTime()) / (24 * 60 * 60 * 1000))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 30) return `${diffDays} days ago`
    
    return checkup.toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by tag, name, or breed..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedSpecies}
          onChange={(e) => setSelectedSpecies(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md bg-white"
        >
          <option value="all">All Species</option>
          <option value="cattle">Cattle</option>
          <option value="pig">Pigs</option>
          <option value="sheep">Sheep</option>
          <option value="goat">Goats</option>
          <option value="chicken">Chickens</option>
          <option value="horse">Horses</option>
          <option value="other">Other</option>
        </select>
        <select
          value={selectedHealth}
          onChange={(e) => setSelectedHealth(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md bg-white"
        >
          <option value="all">All Health Status</option>
          <option value="excellent">Excellent</option>
          <option value="good">Good</option>
          <option value="fair">Fair</option>
          <option value="poor">Poor</option>
          <option value="sick">Sick</option>
        </select>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredAnimals.length} of {animals.length} animals
        </p>
        <Button className="bg-sage-600 hover:bg-sage-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Animal
        </Button>
      </div>

      {/* Animals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAnimals.map((animal) => (
          <Card key={animal.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    {speciesIcons[animal.species]}
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {animal.name || animal.tagNumber}
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      {animal.tagNumber} • {animal.breed}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Health Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Health Status</span>
                <Badge className={healthStatusColors[animal.healthStatus]}>
                  {animal.healthStatus}
                </Badge>
              </div>

              {/* Key Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Age</p>
                  <p className="font-medium">{calculateAge(animal.birthDate)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Weight</p>
                  <p className="font-medium">{animal.weight ? `${animal.weight} kg` : 'Not recorded'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Location</p>
                  <p className="font-medium flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {animal.location}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Vaccinations</p>
                  <p className="font-medium">{animal.vaccinations} total</p>
                </div>
              </div>

              {/* Last Checkup */}
              {animal.lastCheckup && (
                <div className="flex items-center gap-2 text-sm text-gray-600 pt-2 border-t">
                  <Calendar className="h-4 w-4" />
                  <span>Last checkup: {formatLastCheckup(animal.lastCheckup)}</span>
                </div>
              )}

              {/* Notes */}
              {animal.notes && (
                <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                  <p className="font-medium mb-1">Notes:</p>
                  <p>{animal.notes}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Activity className="h-4 w-4 mr-1" />
                  Health Log
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredAnimals.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No animals found
          </h3>
          <p className="text-gray-600 mb-4">
            {animals.length === 0 
              ? "Start building your herd registry by adding your first animal."
              : "Try adjusting your search or filter criteria."
            }
          </p>
          <Button className="bg-sage-600 hover:bg-sage-700">
            <Plus className="h-4 w-4 mr-2" />
            Add First Animal
          </Button>
        </div>
      )}
    </div>
  )
}