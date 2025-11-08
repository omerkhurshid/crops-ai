'use client'
import { useState } from 'react'
import { livestockCategories, LivestockCategory, LivestockItem } from '../../lib/farm-categories'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Search } from 'lucide-react'
import { InfoTooltip } from '../ui/info-tooltip'
interface LivestockCategorySelectorProps {
  selectedLivestock?: string
  onSelect: (livestock: LivestockItem, category: LivestockCategory) => void
}
export function LivestockCategorySelector({ selectedLivestock, onSelect }: LivestockCategorySelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const filteredCategories = livestockCategories.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.scientificName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.primaryPurpose.some(purpose => 
        purpose.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  })).filter(category => category.items.length > 0)
  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search livestock (e.g., cattle, chickens, sheep)..."
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
                    {category.items.length} types
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {category.items.map((livestock) => (
                    <div
                      key={livestock.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                        selectedLivestock === livestock.id
                          ? 'bg-sage-50 border-sage-300 ring-1 ring-sage-500'
                          : 'bg-white hover:bg-gray-50 border-gray-200'
                      }`}
                      onClick={() => onSelect(livestock, category)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{livestock.name}</h4>
                        <InfoTooltip
                          title={livestock.name}
                          description={`${livestock.scientificName ? `Scientific: ${livestock.scientificName}. ` : ''}${livestock.typicalHerdSize ? `Typical size: ${livestock.typicalHerdSize}. ` : ''}${livestock.housingRequirements ? `Housing: ${livestock.housingRequirements}. ` : ''}Purpose: ${livestock.primaryPurpose.join(', ')}`}
                        />
                      </div>
                      {livestock.scientificName && (
                        <p className="text-xs text-gray-500 italic mb-2">
                          {livestock.scientificName}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {livestock.primaryPurpose.map((purpose) => (
                          <Badge key={purpose} variant="secondary" className="text-xs px-2 py-0">
                            {purpose}
                          </Badge>
                        ))}
                      </div>
                      {livestock.typicalHerdSize && (
                        <p className="text-xs text-gray-600 mb-2">
                          <strong>Size:</strong> {livestock.typicalHerdSize}
                        </p>
                      )}
                      <div className="text-xs text-gray-600">
                        <p className="mb-1"><strong>Monitors:</strong></p>
                        <p>{livestock.monitoringParameters.slice(0, 3).join(', ')}</p>
                        {livestock.monitoringParameters.length > 3 && (
                          <p className="text-gray-500">+{livestock.monitoringParameters.length - 3} more</p>
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
          <h3 className="text-lg font-medium mb-2">No livestock found</h3>
          <p>Try adjusting your search terms or browse categories above.</p>
        </div>
      )}
    </div>
  )
}