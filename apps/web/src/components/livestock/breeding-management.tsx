'use client'
import { useState } from 'react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { 
  Calendar, 
  Heart, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Eye,
  Plus,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
interface BreedingManagementProps {
  breedingRecords: any[]
  farms: any[]
  animals: any[]
}
export function BreedingManagement({ breedingRecords, farms, animals }: BreedingManagementProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFarm, setSelectedFarm] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedSpecies, setSelectedSpecies] = useState('all')
  // Filter breeding records
  const filteredRecords = breedingRecords.filter(record => {
    const matchesSearch = record.animal.tagNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (record.animal.name && record.animal.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (record.mate?.tagNumber && record.mate.tagNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesFarm = selectedFarm === 'all' || record.animal.farm?.name === selectedFarm
    const matchesStatus = selectedStatus === 'all' || record.status === selectedStatus
    const matchesSpecies = selectedSpecies === 'all' || record.animal.species === selectedSpecies
    return matchesSearch && matchesFarm && matchesStatus && matchesSpecies
  })
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'breeding': return 'bg-blue-100 text-blue-800'
      case 'pregnant': return 'bg-pink-100 text-pink-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  const getDaysUntilDue = (expectedDueDate: string) => {
    if (!expectedDueDate) return null
    const due = new Date(expectedDueDate)
    const now = new Date()
    const diffTime = due.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }
  const isOverdue = (expectedDueDate: string, actualBirthDate: string | null) => {
    if (!expectedDueDate || actualBirthDate) return false
    const due = new Date(expectedDueDate)
    const now = new Date()
    return now > due
  }
  // Get unique values for filters
  const uniqueStatuses = Array.from(new Set(breedingRecords.map(record => record.status)))
  const uniqueSpecies = Array.from(new Set(breedingRecords.map(record => record.animal.species)))
  const uniqueFarms = Array.from(new Set(breedingRecords.map(record => record.animal.farm?.name).filter(Boolean)))
  if (breedingRecords.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <Heart className="h-16 w-16 mx-auto mb-4" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Breeding Records Yet</h3>
        <p className="text-gray-600 mb-6">Start tracking your breeding program by adding your first breeding record.</p>
        <Link href="/livestock/breeding/add">
          <Button>Add First Breeding Record</Button>
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
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Farms</option>
          {uniqueFarms.map(farm => (
            <option key={farm} value={farm}>{farm}</option>
          ))}
        </select>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Statuses</option>
          {uniqueStatuses.map(status => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
        <select
          value={selectedSpecies}
          onChange={(e) => setSelectedSpecies(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Species</option>
          {uniqueSpecies.map(species => (
            <option key={species} value={species}>
              {species.charAt(0).toUpperCase() + species.slice(1)}
            </option>
          ))}
        </select>
      </div>
      {/* Breeding Records Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Animal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Breeding Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expected Due
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRecords.map((record) => {
              const daysUntilDue = getDaysUntilDue(record.expectedDueDate)
              const overdue = isOverdue(record.expectedDueDate, record.actualBirthDate)
              return (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          #{record.animal.tagNumber}
                        </div>
                        {record.animal.name && (
                          <div className="text-sm text-gray-500">{record.animal.name}</div>
                        )}
                        <div className="text-xs text-gray-400">
                          {record.animal.species} • {record.animal.farm?.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {record.mate ? (
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          #{record.mate.tagNumber}
                        </div>
                        {record.mate.name && (
                          <div className="text-sm text-gray-500">{record.mate.name}</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">No mate specified</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(record.breedingDate).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {record.breedingType}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {record.expectedDueDate ? (
                      <div>
                        <div className="text-sm text-gray-900">
                          {new Date(record.expectedDueDate).toLocaleDateString()}
                        </div>
                        {daysUntilDue !== null && (
                          <div className={`text-xs flex items-center gap-1 ${
                            overdue ? 'text-red-600' : 
                            daysUntilDue <= 7 ? 'text-orange-600' : 'text-gray-500'
                          }`}>
                            {overdue && <AlertCircle className="h-3 w-3" />}
                            {overdue ? `${Math.abs(daysUntilDue)} days overdue` :
                             daysUntilDue === 0 ? 'Due today' :
                             daysUntilDue > 0 ? `${daysUntilDue} days to go` :
                             `${Math.abs(daysUntilDue)} days ago`}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Not calculated</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge 
                      className={`capitalize ${getStatusColor(record.status)}`}
                    >
                      {record.status}
                    </Badge>
                    {record.actualBirthDate && (
                      <div className="text-xs text-gray-500 mt-1">
                        Born: {new Date(record.actualBirthDate).toLocaleDateString()}
                      </div>
                    )}
                    {record.numberOfOffspring && (
                      <div className="text-xs text-gray-500">
                        {record.numberOfOffspring} offspring
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
          <p className="text-gray-500">No breeding records found matching your search criteria.</p>
        </div>
      )}
    </div>
  )
}