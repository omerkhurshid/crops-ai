'use client'
import { farmTypeOptions, FarmType } from '../../lib/farm-categories'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Check } from 'lucide-react'
interface FarmTypeSelectorProps {
  selectedType?: FarmType
  onSelect: (type: FarmType) => void
}
export function FarmTypeSelector({ selectedType, onSelect }: FarmTypeSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {farmTypeOptions.map((option) => (
        <Card 
          key={option.id}
          className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
            selectedType === option.id 
              ? 'ring-2 ring-sage-500 bg-sage-50' 
              : 'hover:ring-1 hover:ring-gray-300'
          }`}
          onClick={() => onSelect(option.id)}
        >
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-4xl mb-3">{option.icon}</div>
              <div className="flex items-center justify-center mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {option.name}
                </h3>
                {selectedType === option.id && (
                  <Check className="w-5 h-5 ml-2 text-sage-600" />
                )}
              </div>
              <p className="text-sm text-gray-600 mb-4">
                {option.description}
              </p>
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-700 mb-2">Key Benefits:</p>
                <div className="flex flex-wrap gap-1 justify-center">
                  {option.benefits.slice(0, 3).map((benefit, index) => (
                    <Badge 
                      key={index}
                      variant="secondary" 
                      className="text-xs px-2 py-1"
                    >
                      {benefit}
                    </Badge>
                  ))}
                  {option.benefits.length > 3 && (
                    <Badge variant="outline" className="text-xs px-2 py-1">
                      +{option.benefits.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}