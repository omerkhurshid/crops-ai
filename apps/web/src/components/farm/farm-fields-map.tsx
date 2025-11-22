'use client'
import React, { useEffect, useState } from 'react'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../ui/modern-card'
import { MapPin, Leaf, AlertTriangle, Sprout } from 'lucide-react'
import { cn } from '../../lib/utils'
interface Field {
  id: string
  name: string
  area: number
  cropType?: string | null
  healthScore?: number
  stressLevel?: 'none' | 'low' | 'moderate' | 'high' | 'severe'
  coordinates?: number[][][]
}
interface Farm {
  id: string
  name: string
  latitude?: number | null
  longitude?: number | null
  fields?: Field[]
}
interface FarmFieldsMapProps {
  farms: Farm[]
}
// Mock field health data for visualization
function generateMockFieldData(field: Field): Field {
  const healthScore = Math.floor(Math.random() * 40) + 60 // 60-100
  const stressScore = 100 - healthScore
  let stressLevel: Field['stressLevel'] = 'none'
  if (stressScore > 40) stressLevel = 'severe'
  else if (stressScore > 30) stressLevel = 'high'
  else if (stressScore > 20) stressLevel = 'moderate'
  else if (stressScore > 10) stressLevel = 'low'
  return {
    ...field,
    healthScore,
    stressLevel,
    cropType: field.cropType || ['Corn', 'Wheat', 'Soybeans', 'Cotton'][Math.floor(Math.random() * 4)]
  }
}
export function FarmFieldsMap({ farms }: FarmFieldsMapProps) {
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null)
  const [fields, setFields] = useState<Field[]>([])
  useEffect(() => {
    // Aggregate all fields from all farms
    const allFields: Field[] = []
    farms.forEach(farm => {
      if (farm.fields) {
        farm.fields.forEach(field => {
          allFields.push(generateMockFieldData(field))
        })
      }
    })
    setFields(allFields)
  }, [farms])
  const getFieldColor = (field: Field) => {
    if (field.stressLevel === 'severe') return 'bg-red-500'
    if (field.stressLevel === 'high') return 'bg-orange-500'
    if (field.stressLevel === 'moderate') return 'bg-yellow-500'
    if (field.stressLevel === 'low') return 'bg-[#8FBF7F]'
    return 'bg-[#7A8F78]'
  }
  const getFieldBorderColor = (field: Field) => {
    if (field.stressLevel === 'severe') return 'border-red-600'
    if (field.stressLevel === 'high') return 'border-orange-600'
    if (field.stressLevel === 'moderate') return 'border-yellow-600'
    if (field.stressLevel === 'low') return 'border-[#8FBF7F]'
    return 'border-[#7A8F78]'
  }
  // Calculate summary stats
  const totalFields = fields.length
  const healthyFields = fields.filter(f => f.healthScore && f.healthScore >= 80).length
  const stressedFields = fields.filter(f => f.stressLevel === 'high' || f.stressLevel === 'severe').length
  const totalArea = fields.reduce((sum, f) => sum + (f.area || 0), 0)
  return (
    <ModernCard variant="floating" className="mb-8">
      <ModernCardHeader>
        <ModernCardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-[#555555]" />
          Farm Fields Overview
        </ModernCardTitle>
      </ModernCardHeader>
      <ModernCardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#F8FAF8] rounded-lg p-3 border border-[#DDE4D8]">
            <div className="text-2xl font-bold text-[#1A1A1A]">{totalFields}</div>
            <div className="text-sm text-[#555555]">Total Fields</div>
          </div>
          <div className="bg-[#F8FAF8] rounded-lg p-3 border border-[#DDE4D8]">
            <div className="text-2xl font-bold text-[#7A8F78]">{healthyFields}</div>
            <div className="text-sm text-[#8FBF7F]">Healthy</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
            <div className="text-2xl font-bold text-orange-700">{stressedFields}</div>
            <div className="text-sm text-orange-600">Need Attention</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="text-2xl font-bold text-blue-700">{totalArea.toFixed(1)} ha</div>
            <div className="text-sm text-[#7A8F78]">Total Area</div>
          </div>
        </div>
        {/* Visual Map Representation */}
        <div className="bg-[#FAFAF7] rounded-lg p-6 border border-[#F3F4F6] mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {fields.map((field) => (
              <div
                key={field.id}
                className={cn(
                  "relative rounded-lg p-3 border-2 cursor-pointer hover:shadow-lg transition-all duration-200",
                  getFieldColor(field),
                  getFieldBorderColor(field),
                  "text-white"
                )}
                title={`${field.name} - Health: ${field.healthScore}%`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm truncate">{field.name}</h4>
                    <p className="text-xs opacity-90">{field.area?.toFixed(1)} ha</p>
                    <p className="text-xs opacity-90">{field.cropType}</p>
                  </div>
                  {field.stressLevel === 'high' || field.stressLevel === 'severe' ? (
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <Leaf className="h-4 w-4 flex-shrink-0" />
                  )}
                </div>
                <div className="mt-2">
                  <div className="text-xs font-semibold">Health: {field.healthScore}%</div>
                  <div className="w-full bg-white/20 rounded-full h-1.5 mt-1">
                    <div 
                      className="bg-white/80 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${field.healthScore}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="font-medium text-[#555555]">Field Health Status:</div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#7A8F78] rounded"></div>
            <span className="text-[#555555]">Excellent (80-100%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#8FBF7F] rounded"></div>
            <span className="text-[#555555]">Good (70-79%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-[#555555]">Fair (60-69%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span className="text-[#555555]">Poor (50-59%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-[#555555]">Critical (&lt;50%)</span>
          </div>
        </div>
      </ModernCardContent>
    </ModernCard>
  )
}