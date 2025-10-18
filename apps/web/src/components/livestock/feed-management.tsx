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
  Wheat,
  DollarSign
} from 'lucide-react'
import Link from 'next/link'

interface FeedManagementProps {
  feedRecords: any[]
  farms: any[]
  animals: any[]
}

export function FeedManagement({ feedRecords, farms, animals }: FeedManagementProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFarm, setSelectedFarm] = useState('all')
  const [selectedAnimal, setSelectedAnimal] = useState('all')
  const [selectedFeedType, setSelectedFeedType] = useState('all')
  const [dateRange, setDateRange] = useState('30') // days

  // Filter feed records
  const filteredRecords = feedRecords.filter(record => {
    const matchesSearch = record.animal.tagNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (record.animal.name && record.animal.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         record.feedType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (record.brand && record.brand.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesFarm = selectedFarm === 'all' || record.animal.farm?.name === selectedFarm
    const matchesAnimal = selectedAnimal === 'all' || record.animalId === selectedAnimal
    const matchesFeedType = selectedFeedType === 'all' || record.feedType === selectedFeedType
    
    // Date range filter
    let matchesDate = true
    if (dateRange !== 'all') {
      const daysAgo = parseInt(dateRange)
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo)
      matchesDate = new Date(record.feedDate) >= cutoffDate
    }
    
    return matchesSearch && matchesFarm && matchesAnimal && matchesFeedType && matchesDate
  })

  // Calculate summary stats for filtered records
  const totalCost = filteredRecords.reduce((sum, record) => sum + (record.totalCost || 0), 0)
  const totalQuantity = filteredRecords.reduce((sum, record) => sum + record.quantity, 0)
  const avgCostPerPound = totalQuantity > 0 ? totalCost / totalQuantity : 0

  // Get unique values for filters
  const uniqueFarms = Array.from(new Set(feedRecords.map(record => record.animal.farm?.name).filter(Boolean)))
  const uniqueFeedTypes = Array.from(new Set(feedRecords.map(record => record.feedType)))

  if (feedRecords.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <Wheat className="h-16 w-16 mx-auto mb-4" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Feed Records Yet</h3>
        <p className="text-gray-600 mb-6">Start tracking feed costs and nutrition by recording your first feeding.</p>
        <Link href="/livestock/feed/add">
          <Button>Record First Feeding</Button>
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
            placeholder="Search by animal, feed type, or brand..."
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
          value={selectedAnimal}
          onChange={(e) => setSelectedAnimal(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Animals</option>
          {animals.map(animal => (
            <option key={animal.id} value={animal.id}>
              #{animal.tagNumber} {animal.name && `(${animal.name})`}
            </option>
          ))}
        </select>

        <select
          value={selectedFeedType}
          onChange={(e) => setSelectedFeedType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Feed Types</option>
          {uniqueFeedTypes.map(feedType => (
            <option key={feedType} value={feedType}>
              {feedType.charAt(0).toUpperCase() + feedType.slice(1)}
            </option>
          ))}
        </select>

        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
          <option value="all">All time</option>
        </select>
      </div>

      {/* Summary Stats */}
      {filteredRecords.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <DollarSign className="h-5 w-5 text-green-600 mr-2" />
              <span className="font-medium text-gray-700">Total Cost</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">${totalCost.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Wheat className="h-5 w-5 text-orange-600 mr-2" />
              <span className="font-medium text-gray-700">Total Quantity</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalQuantity.toFixed(1)} lbs</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <span className="font-medium text-gray-700">Avg Cost/lb</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">${avgCostPerPound.toFixed(2)}</p>
          </div>
        </div>
      )}

      {/* Feed Records Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Animal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Feed Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cost
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nutrition
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRecords.map((record) => (
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
                  <div>
                    <div className="text-sm font-medium text-gray-900 capitalize">
                      {record.feedType.replace('_', ' ')}
                    </div>
                    {record.brand && (
                      <div className="text-sm text-gray-500">{record.brand}</div>
                    )}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {record.quantity} {record.unit}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    {record.totalCost && (
                      <div className="text-sm font-medium text-gray-900">
                        ${record.totalCost.toFixed(2)}
                      </div>
                    )}
                    {record.costPerUnit && (
                      <div className="text-sm text-gray-500">
                        ${record.costPerUnit.toFixed(2)}/{record.unit}
                      </div>
                    )}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-xs space-y-1">
                    {record.protein && (
                      <div>Protein: {record.protein}%</div>
                    )}
                    {record.fat && (
                      <div>Fat: {record.fat}%</div>
                    )}
                    {record.fiber && (
                      <div>Fiber: {record.fiber}%</div>
                    )}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(record.feedDate).toLocaleDateString()}
                  </div>
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
            ))}
          </tbody>
        </table>
      </div>

      {filteredRecords.length === 0 && searchTerm && (
        <div className="text-center py-8">
          <p className="text-gray-500">No feed records found matching your search criteria.</p>
        </div>
      )}
    </div>
  )
}