'use client'

import { useState, useEffect } from 'react'
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
  useComprehensiveDB?: boolean // Flag to use comprehensive database
}

interface ComprehensiveCrop {
  id: string;
  name: string;
  scientific_name: string;
  common_names: string[];
  crop_type: string;
  days_to_maturity_min: number;
  days_to_maturity_max: number;
  climate_zones: string[];
  varieties?: {
    variety_name: string;
    yield_potential_kg_per_hectare: number;
    disease_resistance: string[];
  }[];
}

export function CropCategorySelector({ selectedCrop, onSelect, useComprehensiveDB = false }: CropCategorySelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [comprehensiveCrops, setComprehensiveCrops] = useState<ComprehensiveCrop[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch comprehensive crop data when useComprehensiveDB is enabled
  useEffect(() => {
    if (useComprehensiveDB && searchTerm.length > 2) {
      setLoading(true)
      fetch(`/api/agriculture/crops/search?q=${encodeURIComponent(searchTerm)}`)
        .then(res => res.json())
        .then(data => {
          setComprehensiveCrops(data.crops || [])
          setLoading(false)
        })
        .catch(err => {
          console.error('Failed to fetch comprehensive crops:', err)
          setLoading(false)
        })
    } else if (!useComprehensiveDB) {
      setComprehensiveCrops([])
    }
  }, [searchTerm, useComprehensiveDB])

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
                          title={crop.name}
                          description={`${crop.scientificName ? `Scientific: ${crop.scientificName}. ` : ''}${crop.growingSeasonDays ? `Growing season: ${crop.growingSeasonDays} days. ` : ''}${crop.primaryHarvestSeason ? `Harvest: ${crop.primaryHarvestSeason.join(', ')}. ` : ''}${crop.commonVarieties ? `Varieties: ${crop.commonVarieties.slice(0, 3).join(', ')}` : ''}`}
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

      {/* Comprehensive Database Results */}
      {useComprehensiveDB && comprehensiveCrops.length > 0 && (
        <Card className="overflow-hidden">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🌾</span>
              <div>
                <CardTitle className="text-lg">Comprehensive Agricultural Database</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {comprehensiveCrops.length} crops found with detailed agricultural data
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {comprehensiveCrops.map((crop) => (
                <div
                  key={crop.id}
                  className="p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md bg-white hover:bg-gray-50 border-gray-200"
                  onClick={() => {
                    // Convert comprehensive crop to CropItem format
                    const cropItem: CropItem = {
                      id: crop.id,
                      name: crop.name,
                      scientificName: crop.scientific_name,
                      commonVarieties: crop.common_names,
                      growingSeasonDays: crop.days_to_maturity_max || undefined,
                      primaryHarvestSeason: crop.climate_zones,
                      monitoringParameters: [
                        'growth_stage',
                        'pest_pressure',
                        'disease_monitoring',
                        'nutrient_status'
                      ]
                    };
                    const category: CropCategory = {
                      id: crop.crop_type,
                      name: crop.crop_type.charAt(0).toUpperCase() + crop.crop_type.slice(1),
                      description: `${crop.crop_type} crops from comprehensive database`,
                      icon: '🌾',
                      items: [cropItem]
                    };
                    onSelect(cropItem, category);
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{crop.name}</h4>
                    <InfoTooltip
                      title={crop.name}
                      description={`Scientific: ${crop.scientific_name}. Type: ${crop.crop_type}. Maturity: ${crop.days_to_maturity_min}-${crop.days_to_maturity_max} days. ${crop.varieties?.length ? `${crop.varieties.length} varieties available.` : ''}`}
                    />
                  </div>
                  
                  <p className="text-xs text-gray-500 italic mb-2">
                    {crop.scientific_name}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-2">
                    <Badge variant="secondary" className="text-xs px-2 py-0">
                      {crop.crop_type}
                    </Badge>
                    {crop.days_to_maturity_max && (
                      <Badge variant="outline" className="text-xs px-2 py-0">
                        {crop.days_to_maturity_min}-{crop.days_to_maturity_max}d
                      </Badge>
                    )}
                    {crop.varieties && crop.varieties.length > 0 && (
                      <Badge variant="outline" className="text-xs px-2 py-0">
                        {crop.varieties.length} varieties
                      </Badge>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-600">
                    <p className="mb-1"><strong>Climate zones:</strong></p>
                    <p>{crop.climate_zones.slice(0, 2).join(', ')}</p>
                    {crop.climate_zones.length > 2 && (
                      <p className="text-gray-500">+{crop.climate_zones.length - 2} more</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Searching comprehensive database...</p>
        </div>
      )}

      {filteredCategories.length === 0 && comprehensiveCrops.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No crops found</h3>
          <p>Try adjusting your search terms or browse categories above.</p>
        </div>
      )}
    </div>
  )
}