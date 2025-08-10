'use client'

import { useState } from 'react'
import { cropCategories, CropCategory, CropItem } from '../../lib/farm-categories'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Search, Info } from 'lucide-react'
import { InfoTooltip } from '../ui/info-tooltip'

interface CropCategorySelectorProps {
  selectedCrop?: string
  onSelect: (crop: CropItem, category: CropCategory) => void
}

export function CropCategorySelector({ selectedCrop, onSelect }: CropCategorySelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredCategories = cropCategories.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.scientificName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.commonVarieties?.some(variety => 
        variety.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  })).filter(category => category.items.length > 0)

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search crops (e.g., wheat, tomatoes, corn)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Categories */}
      <div className="space-y-4">
        {filteredCategories.map((category) => (
          <Card key={category.id} className="overflow-hidden">
            <CardHeader 
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setSelectedCategory(
                selectedCategory === category.id ? null : category.id
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {category.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {category.items.length} crops
                  </Badge>
                  <div className={`transition-transform duration-200 ${
                    selectedCategory === category.id ? 'rotate-90' : ''
                  }`}>
                    →
                  </div>
                </div>
              </div>
            </CardHeader>
            
            {selectedCategory === category.id && (
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {category.items.map((crop) => (
                    <div
                      key={crop.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                        selectedCrop === crop.id
                          ? 'bg-sage-50 border-sage-300 ring-1 ring-sage-500'
                          : 'bg-white hover:bg-gray-50 border-gray-200'
                      }`}
                      onClick={() => onSelect(crop, category)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{crop.name}</h4>
                        <InfoTooltip
                          content={
                            <div className="space-y-2">
                              {crop.scientificName && (
                                <p><strong>Scientific:</strong> {crop.scientificName}</p>
                              )}
                              {crop.growingSeasonDays && (
                                <p><strong>Growing Season:</strong> {crop.growingSeasonDays} days</p>
                              )}
                              {crop.primaryHarvestSeason && (
                                <p><strong>Harvest:</strong> {crop.primaryHarvestSeason.join(', ')}</p>
                              )}
                              {crop.commonVarieties && (
                                <p><strong>Varieties:</strong> {crop.commonVarieties.slice(0, 3).join(', ')}</p>
                              )}
                            </div>
                          }
                        />
                      </div>
                      
                      {crop.scientificName && (
                        <p className="text-xs text-gray-500 italic mb-2">
                          {crop.scientificName}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-1 mb-2">
                        {crop.primaryHarvestSeason?.slice(0, 2).map((season) => (
                          <Badge key={season} variant="secondary" className="text-xs px-2 py-0">
                            {season}
                          </Badge>
                        ))}
                        {crop.growingSeasonDays && (
                          <Badge variant="outline" className="text-xs px-2 py-0">
                            {crop.growingSeasonDays}d
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-600">
                        <p className="mb-1"><strong>Monitors:</strong></p>
                        <p>{crop.monitoringParameters.slice(0, 3).join(', ')}</p>
                        {crop.monitoringParameters.length > 3 && (
                          <p className="text-gray-500">+{crop.monitoringParameters.length - 3} more</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No crops found</h3>
          <p>Try adjusting your search terms or browse categories above.</p>
        </div>
      )}
    </div>
  )
}