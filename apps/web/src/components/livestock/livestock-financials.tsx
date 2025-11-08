'use client'
import { useState } from 'react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { 
  Search, 
  Filter,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  Calculator,
  PieChart
} from 'lucide-react'
import Link from 'next/link'
interface LivestockFinancialsProps {
  animals: any[]
  farms: any[]
}
export function LivestockFinancials({ animals, farms }: LivestockFinancialsProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFarm, setSelectedFarm] = useState('all')
  const [selectedSpecies, setSelectedSpecies] = useState('all')
  const [sortBy, setSortBy] = useState('profitLoss') // profitLoss, totalCosts, currentValue
  // Filter animals
  const filteredAnimals = animals.filter(animal => {
    const matchesSearch = animal.tagNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (animal.name && animal.name.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesFarm = selectedFarm === 'all' || animal.farm?.name === selectedFarm
    const matchesSpecies = selectedSpecies === 'all' || animal.species === selectedSpecies
    return matchesSearch && matchesFarm && matchesSpecies
  })
  // Sort animals
  const sortedAnimals = [...filteredAnimals].sort((a, b) => {
    switch (sortBy) {
      case 'profitLoss':
        return b.profitLoss - a.profitLoss
      case 'totalCosts':
        return b.totalCosts - a.totalCosts
      case 'currentValue':
        return (b.currentValue || 0) - (a.currentValue || 0)
      default:
        return 0
    }
  })
  // Calculate summary stats for filtered animals
  const summaryStats = {
    totalInvestment: filteredAnimals.reduce((sum, animal) => sum + animal.totalCosts, 0),
    totalValue: filteredAnimals.reduce((sum, animal) => sum + (animal.currentValue || 0), 0),
    totalProfitLoss: filteredAnimals.reduce((sum, animal) => sum + animal.profitLoss, 0),
    avgROI: filteredAnimals.length > 0 
      ? (filteredAnimals.reduce((sum, animal) => {
          const roi = animal.totalCosts > 0 ? ((animal.currentValue || 0) - animal.totalCosts) / animal.totalCosts * 100 : 0
          return sum + roi
        }, 0) / filteredAnimals.length)
      : 0
  }
  // Get unique values for filters
  const uniqueFarms = Array.from(new Set(animals.map(animal => animal.farm?.name).filter(Boolean)))
  const uniqueSpecies = Array.from(new Set(animals.map(animal => animal.species)))
  const getROI = (animal: any) => {
    if (animal.totalCosts <= 0) return 0
    return ((animal.currentValue || 0) - animal.totalCosts) / animal.totalCosts * 100
  }
  const getProfitabilityColor = (profitLoss: number) => {
    if (profitLoss > 0) return 'text-green-600'
    if (profitLoss < 0) return 'text-red-600'
    return 'text-gray-600'
  }
  if (animals.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <DollarSign className="h-16 w-16 mx-auto mb-4" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Financial Data Yet</h3>
        <p className="text-gray-600 mb-6">Add animals and track costs to see financial performance.</p>
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
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Farms</option>
          {uniqueFarms.map(farm => (
            <option key={farm} value={farm}>{farm}</option>
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
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="profitLoss">Sort by Profit/Loss</option>
          <option value="totalCosts">Sort by Total Costs</option>
          <option value="currentValue">Sort by Current Value</option>
        </select>
      </div>
      {/* Summary Stats */}
      {filteredAnimals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
              <span className="font-medium text-gray-700">Total Investment</span>
            </div>
            <p className="text-xl font-bold text-gray-900">${summaryStats.totalInvestment.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Calculator className="h-5 w-5 text-green-600 mr-2" />
              <span className="font-medium text-gray-700">Current Value</span>
            </div>
            <p className="text-xl font-bold text-gray-900">${summaryStats.totalValue.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              {summaryStats.totalProfitLoss >= 0 ? (
                <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-600 mr-2" />
              )}
              <span className="font-medium text-gray-700">Net Profit/Loss</span>
            </div>
            <p className={`text-xl font-bold ${getProfitabilityColor(summaryStats.totalProfitLoss)}`}>
              {summaryStats.totalProfitLoss >= 0 ? '+' : ''}${summaryStats.totalProfitLoss.toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <PieChart className="h-5 w-5 text-purple-600 mr-2" />
              <span className="font-medium text-gray-700">Avg ROI</span>
            </div>
            <p className={`text-xl font-bold ${getProfitabilityColor(summaryStats.avgROI)}`}>
              {summaryStats.avgROI >= 0 ? '+' : ''}{summaryStats.avgROI.toFixed(1)}%
            </p>
          </div>
        </div>
      )}
      {/* Animals Financial Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Animal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Investment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Profit/Loss
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ROI
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Performance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedAnimals.map((animal) => {
              const roi = getROI(animal)
              return (
                <tr key={animal.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          #{animal.tagNumber}
                        </div>
                        {animal.name && (
                          <div className="text-sm text-gray-500">{animal.name}</div>
                        )}
                        <div className="text-xs text-gray-400">
                          {animal.species} • {animal.farm?.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ${animal.totalCosts.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      Purchase: ${(animal.purchasePrice || 0).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ${(animal.currentValue || 0).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${getProfitabilityColor(animal.profitLoss)}`}>
                      {animal.profitLoss >= 0 ? '+' : ''}${animal.profitLoss.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${getProfitabilityColor(roi)}`}>
                      {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {roi >= 20 && (
                      <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                    )}
                    {roi >= 10 && roi < 20 && (
                      <Badge className="bg-blue-100 text-blue-800">Good</Badge>
                    )}
                    {roi >= 0 && roi < 10 && (
                      <Badge className="bg-yellow-100 text-yellow-800">Fair</Badge>
                    )}
                    {roi < 0 && (
                      <Badge className="bg-red-100 text-red-800">Loss</Badge>
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
              )
            })}
          </tbody>
        </table>
      </div>
      {filteredAnimals.length === 0 && searchTerm && (
        <div className="text-center py-8">
          <p className="text-gray-500">No animals found matching your search criteria.</p>
        </div>
      )}
    </div>
  )
}