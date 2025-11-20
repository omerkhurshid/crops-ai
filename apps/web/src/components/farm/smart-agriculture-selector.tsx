'use client'
import { useState, useMemo } from 'react'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { 
  Search, Filter, ChevronDown, ChevronUp, Info, 
  Sprout, Users, TreePine, Apple, Fish, Beef,
  Clock, Thermometer, MapPin, Target
} from 'lucide-react'
import { cropCategories, livestockCategories, farmTypeOptions } from '../../lib/farm-categories'
import { cn } from '../../lib/utils'
interface SelectedItem {
  id: string
  name: string
  category: string
  type: 'crop' | 'livestock'
  scientificName?: string
  monitoringParameters: string[]
  additionalInfo?: {
    growingSeasonDays?: number
    primaryHarvestSeason?: string[]
    primaryPurpose?: string[]
    typicalHerdSize?: string
  }
}
interface SmartAgricultureSelectorProps {
  selectedFarmType: string
  onSelectionChange: (items: SelectedItem[]) => void
  className?: string
  showRecommendations?: boolean
}
export function SmartAgricultureSelector({ 
  selectedFarmType, 
  onSelectionChange, 
  className,
  showRecommendations = true 
}: SmartAgricultureSelectorProps) {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [showCropDetails, setShowCropDetails] = useState<Record<string, boolean>>({})
  const [showRecommendationPanel, setShowRecommendationPanel] = useState(false)
  // Filter items based on farm type
  const availableItems = useMemo(() => {
    let items: SelectedItem[] = []
    // Add crops if relevant
    if (selectedFarmType === 'crops' || selectedFarmType === 'mixed') {
      cropCategories.forEach(category => {
        category.items.forEach(crop => {
          items.push({
            id: crop.id,
            name: crop.name,
            category: category.name,
            type: 'crop',
            scientificName: crop.scientificName,
            monitoringParameters: crop.monitoringParameters,
            additionalInfo: {
              growingSeasonDays: crop.growingSeasonDays,
              primaryHarvestSeason: crop.primaryHarvestSeason
            }
          })
        })
      })
    }
    // Add livestock if relevant
    if (selectedFarmType === 'livestock' || selectedFarmType === 'mixed') {
      livestockCategories.forEach(category => {
        category.items.forEach(livestock => {
          items.push({
            id: livestock.id,
            name: livestock.name,
            category: category.name,
            type: 'livestock',
            scientificName: livestock.scientificName,
            monitoringParameters: livestock.monitoringParameters,
            additionalInfo: {
              primaryPurpose: livestock.primaryPurpose,
              typicalHerdSize: livestock.typicalHerdSize
            }
          })
        })
      })
    }
    return items
  }, [selectedFarmType])
  // Filter and search logic
  const filteredItems = useMemo(() => {
    let filtered = availableItems
    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(item => 
        item.category.toLowerCase().includes(activeCategory.toLowerCase())
      )
    }
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.scientificName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    return filtered
  }, [availableItems, activeCategory, searchTerm])
  // Get unique categories for filter
  const availableCategories = useMemo(() => {
    const categories = new Set(availableItems.map(item => item.category))
    return Array.from(categories)
  }, [availableItems])
  // Smart recommendations based on farm type and location
  const getRecommendations = () => {
    // This would ideally use location data and ML models
    // For now, showing popular choices per farm type
    const recommendations = {
      crops: ['corn', 'soybeans', 'wheat'],
      livestock: ['holstein', 'angus', 'laying-hens'],
      mixed: ['corn', 'soybeans', 'holstein'],
      orchard: ['apples', 'grapes'],
      forestry: [],
      greenhouse: ['tomatoes', 'lettuce']
    }
    return recommendations[selectedFarmType as keyof typeof recommendations] || []
  }
  const toggleItemSelection = (item: SelectedItem) => {
    const isSelected = selectedItems.some(selected => selected.id === item.id)
    let newSelection: SelectedItem[]
    if (isSelected) {
      newSelection = selectedItems.filter(selected => selected.id !== item.id)
    } else {
      newSelection = [...selectedItems, item]
    }
    setSelectedItems(newSelection)
    onSelectionChange(newSelection)
  }
  const toggleDetails = (itemId: string) => {
    setShowCropDetails(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }))
  }
  const getItemIcon = (item: SelectedItem) => {
    if (item.type === 'crop') {
      return <Sprout className="h-4 w-4 text-green-600" />
    } else {
      return <Users className="h-4 w-4 text-blue-600" />
    }
  }
  const isSelected = (itemId: string) => selectedItems.some(item => item.id === itemId)
  const recommendations = getRecommendations()
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with recommendations toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#1A1A1A]">
            Select Your {selectedFarmType === 'crops' ? 'Crops' : selectedFarmType === 'livestock' ? 'Livestock' : 'Agriculture'}
          </h3>
          <p className="text-sm text-[#555555]">
            Choose what you're growing or raising to get personalized insights
          </p>
        </div>
        {showRecommendations && recommendations.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRecommendationPanel(!showRecommendationPanel)}
          >
            <Target className="h-4 w-4 mr-1" />
            Recommendations
          </Button>
        )}
      </div>
      {/* Recommendations Panel */}
      {showRecommendationPanel && recommendations.length > 0 && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-900">Recommended for your farm type</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {recommendations.map(recId => {
              const item = availableItems.find(i => i.id === recId)
              if (!item) return null
              return (
                <Button
                  key={recId}
                  variant={isSelected(recId) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleItemSelection(item)}
                  className="h-8"
                >
                  {getItemIcon(item)}
                  <span className="ml-1">{item.name}</span>
                </Button>
              )
            })}
          </div>
        </div>
      )}
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search crops, livestock, or scientific names..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="sm:w-48">
          <select
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
            className="w-full px-3 py-2 border border-[#E6E6E6] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {availableCategories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>
      {/* Selected Items Summary */}
      {selectedItems.length > 0 && (
        <div className="p-4 bg-[#F8FAF8] rounded-lg border border-[#DDE4D8]">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-green-900">
              Selected ({selectedItems.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedItems.map(item => (
              <Badge
                key={item.id}
                variant="secondary"
                className="bg-[#F8FAF8] text-green-800 hover:bg-[#DDE4D8]"
              >
                {getItemIcon(item)}
                <span className="ml-1">{item.name}</span>
                <button
                  onClick={() => toggleItemSelection(item)}
                  className="ml-1 hover:text-green-600"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map(item => (
          <div
            key={item.id}
            className={cn(
              "border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md",
              isSelected(item.id)
                ? "border-[#8FBF7F] bg-[#F8FAF8]"
                : "border-[#E6E6E6] hover:border-[#E6E6E6]"
            )}
            onClick={() => toggleItemSelection(item)}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {getItemIcon(item)}
                <div>
                  <h4 className="font-medium text-[#1A1A1A]">{item.name}</h4>
                  {item.scientificName && (
                    <p className="text-xs text-[#555555] italic">{item.scientificName}</p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleDetails(item.id)
                }}
                className="h-6 w-6 p-0"
              >
                {showCropDetails[item.id] ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </Button>
            </div>
            <div className="mb-3">
              <Badge variant="outline" className="text-xs">
                {item.category}
              </Badge>
            </div>
            {/* Quick Info */}
            <div className="space-y-1 text-xs text-[#555555]">
              {item.additionalInfo?.growingSeasonDays && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{item.additionalInfo.growingSeasonDays} days</span>
                </div>
              )}
              {item.additionalInfo?.primaryPurpose && (
                <div className="flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  <span>{item.additionalInfo.primaryPurpose.join(', ')}</span>
                </div>
              )}
              {item.additionalInfo?.typicalHerdSize && (
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{item.additionalInfo.typicalHerdSize}</span>
                </div>
              )}
            </div>
            {/* Expandable Details */}
            {showCropDetails[item.id] && (
              <div className="mt-3 pt-3 border-t border-[#E6E6E6] space-y-2">
                <div>
                  <h5 className="text-xs font-medium text-[#555555] mb-1">Monitoring Parameters:</h5>
                  <div className="flex flex-wrap gap-1">
                    {item.monitoringParameters.slice(0, 3).map(param => (
                      <Badge key={param} variant="outline" className="text-xs">
                        {param}
                      </Badge>
                    ))}
                    {item.monitoringParameters.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{item.monitoringParameters.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
                {item.additionalInfo?.primaryHarvestSeason && (
                  <div>
                    <h5 className="text-xs font-medium text-[#555555] mb-1">Harvest Season:</h5>
                    <p className="text-xs text-[#555555]">
                      {item.additionalInfo.primaryHarvestSeason.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      {filteredItems.length === 0 && (
        <div className="text-center py-8 text-[#555555]">
          <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="font-medium">No items found</p>
          <p className="text-sm">Try adjusting your search or filter</p>
        </div>
      )}
    </div>
  )
}