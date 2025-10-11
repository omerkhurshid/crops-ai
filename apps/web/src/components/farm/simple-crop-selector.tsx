'use client'

import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../ui/modern-card'
import { Badge } from '../ui/badge'
import { Search, Clock, MapPin, TrendingUp, Droplets } from 'lucide-react'
import { COMPREHENSIVE_CROP_DATABASE, CROP_CATEGORIES, getCropsByCategory } from '../../lib/farm/comprehensive-crops'

interface SimpleCropSelectorProps {
  selectedCrop?: string
  onCropSelect: (cropId: string) => void
  showDetails?: boolean
}

export function SimpleCropSelector({ selectedCrop, onCropSelect, showDetails = true }: SimpleCropSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  
  const cropsByCategory = getCropsByCategory()
  
  // Filter crops based on search term across all categories
  const searchResults = searchTerm.length > 2 ? 
    Object.values(COMPREHENSIVE_CROP_DATABASE).filter(crop =>
      crop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crop.scientificName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crop.category.toLowerCase().includes(searchTerm.toLowerCase())
    ) : []

  const selectedCropData = selectedCrop ? COMPREHENSIVE_CROP_DATABASE[selectedCrop] : null

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search crops, livestock, or scientific names..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div>
          <Label className="text-sm font-medium text-sage-700 mb-2 block">
            Search Results ({searchResults.length} found)
          </Label>
          <Select value={selectedCrop || ''} onValueChange={onCropSelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select from search results...">
                {selectedCropData && searchResults.find(c => c.id === selectedCrop) && (
                  <div className="flex items-center space-x-2">
                    <span>{selectedCropData.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {selectedCropData.category}
                    </Badge>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {searchResults.map((crop) => (
                <SelectItem key={crop.id} value={crop.id}>
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <div className="font-medium">{crop.name}</div>
                      <div className="text-xs text-gray-500 italic">{crop.scientificName}</div>
                    </div>
                    <div className="text-right ml-4">
                      <Badge variant="outline" className="text-xs">
                        {crop.category}
                      </Badge>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Category Dropdown */}
      {searchTerm.length <= 2 && (
        <div>
          <Label className="text-sm font-medium text-sage-700 mb-2 block">
            1. Select Category
          </Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose crop category...">
                {selectedCategory && CROP_CATEGORIES[selectedCategory as keyof typeof CROP_CATEGORIES] && (
                  <div className="flex items-center space-x-2">
                    <span>{CROP_CATEGORIES[selectedCategory as keyof typeof CROP_CATEGORIES].name}</span>
                    <Badge variant="outline" className="text-xs">
                      {cropsByCategory[selectedCategory]?.length || 0} crops
                    </Badge>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CROP_CATEGORIES).map(([key, category]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <div className="font-medium">{category.name}</div>
                      <div className="text-xs text-gray-500">{category.description}</div>
                    </div>
                    <Badge variant="outline" className="ml-4 text-xs">
                      {cropsByCategory[key]?.length || 0}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Crop Dropdown */}
      {selectedCategory && cropsByCategory[selectedCategory] && searchTerm.length <= 2 && (
        <div>
          <Label className="text-sm font-medium text-sage-700 mb-2 block">
            2. Select Specific Crop
          </Label>
          <Select value={selectedCrop || ''} onValueChange={onCropSelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={`Choose your ${CROP_CATEGORIES[selectedCategory as keyof typeof CROP_CATEGORIES]?.name || 'crop'}...`}>
                {selectedCropData && (
                  <div className="flex items-center space-x-2">
                    <span>{selectedCropData.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {selectedCropData.yield?.typical} {selectedCropData.yield?.unit}/acre
                    </Badge>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-[400px]">
              {cropsByCategory[selectedCategory].map((crop: any) => (
                <SelectItem key={crop.id} value={crop.id}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex-1">
                      <div className="font-medium">{crop.name}</div>
                      <div className="text-xs text-gray-500 italic">{crop.scientificName}</div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-xs text-gray-600">
                        {crop.yield?.typical} {crop.yield?.unit}/acre
                      </div>
                      <div className="text-xs font-medium text-green-600">
                        ${crop.marketValue?.avgPrice}
                      </div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Selected Crop Details */}
      {selectedCropData && showDetails && (
        <ModernCard>
          <ModernCardHeader>
            <ModernCardTitle className="flex items-center justify-between">
              <span>{selectedCropData.name}</span>
              <Badge variant="outline" className="text-xs">
                {selectedCropData.category}
              </Badge>
            </ModernCardTitle>
            <p className="text-sm text-gray-600 italic">{selectedCropData.scientificName}</p>
            <p className="text-xs text-blue-600 font-medium">
              Family: {selectedCropData.botanicalFamily}
            </p>
          </ModernCardHeader>
          
          <ModernCardContent className="space-y-4">
            {/* Key Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-sage-50 rounded-lg">
                <Clock className="h-5 w-5 text-sage-600 mx-auto mb-1" />
                <div className="text-sm font-medium text-sage-800">
                  {selectedCropData.harvestWindow.duration} days
                </div>
                <div className="text-xs text-gray-600">Growing Season</div>
              </div>
              
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600 mx-auto mb-1" />
                <div className="text-sm font-medium text-green-800">
                  {selectedCropData.yield.typical} {selectedCropData.yield.unit}
                </div>
                <div className="text-xs text-gray-600">Expected Yield/acre</div>
              </div>
              
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <Droplets className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                <div className="text-sm font-medium text-blue-800 capitalize">
                  {selectedCropData.waterRequirements}
                </div>
                <div className="text-xs text-gray-600">Water Needs</div>
              </div>
              
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <MapPin className="h-5 w-5 text-yellow-600 mx-auto mb-1" />
                <div className="text-sm font-medium text-yellow-800">
                  ${selectedCropData.marketValue.avgPrice}
                </div>
                <div className="text-xs text-gray-600">Market Price</div>
              </div>
            </div>

            {/* Growing Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Best Planting:</span>
                <p className="text-sage-800">{selectedCropData.plantingWindow.optimal}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Climate Zones:</span>
                <p className="text-sage-800">{selectedCropData.climateZones.slice(0, 3).join(', ')}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Soil Needs:</span>
                <p className="text-sage-800 capitalize">
                  {selectedCropData.soilRequirements.fertility} fertility, pH {selectedCropData.soilRequirements.ph.min}-{selectedCropData.soilRequirements.ph.max}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Market Demand:</span>
                <p className="text-sage-800 capitalize">{selectedCropData.marketValue.demand}</p>
              </div>
            </div>

            {/* Benefits */}
            {selectedCropData.benefits.length > 0 && (
              <div>
                <span className="font-medium text-gray-700 block mb-2">Key Benefits:</span>
                <div className="flex flex-wrap gap-2">
                  {selectedCropData.benefits.slice(0, 4).map((benefit, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {benefit}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </ModernCardContent>
        </ModernCard>
      )}
    </div>
  )
}