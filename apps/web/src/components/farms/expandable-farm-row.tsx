'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronRight, MapPin } from 'lucide-react'
import { FarmHealthCard } from './farm-health-card'
import { cn } from '../../lib/utils'

interface Field {
  id: string
  name: string
  area: number
}

interface Farm {
  id: string
  name: string
  totalArea: number
  latitude?: number
  longitude?: number
  address?: string
  location?: string
  fieldsCount: number
  fields: Field[]
}

interface ExpandableFarmRowProps {
  farm: Farm
}

export function ExpandableFarmRow({ farm }: ExpandableFarmRowProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <>
      <tr className="hover:bg-sage-50/30 transition-colors">
        <td className="p-4">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleExpanded}
              className="p-1 rounded hover:bg-sage-100 transition-colors"
              disabled={!farm.fields || farm.fields.length === 0}
            >
              {farm.fields && farm.fields.length > 0 ? (
                isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-sage-600" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-sage-600" />
                )
              ) : (
                <div className="h-4 w-4" />
              )}
            </button>
            <Link href={`/farms/${farm.id}`} className="block hover:text-sage-900 transition-colors">
              <div className="font-medium text-sage-800 hover:text-sage-900">{farm.name}</div>
              <div className="text-sm text-sage-500 capitalize">{farm.location || 'No location'}</div>
            </Link>
          </div>
        </td>
        <td className="p-4">
          <div className="text-sm text-sage-600">
            {farm.address || (farm.latitude && farm.longitude ? `${farm.latitude.toFixed(4)}, ${farm.longitude.toFixed(4)}` : 'Location not set')}
          </div>
        </td>
        <td className="p-4">
          <div className="text-sm font-medium text-sage-800">
            {farm.totalArea?.toFixed(1) || '0.0'} <span className="text-sage-500">ha</span>
          </div>
        </td>
        <td className="p-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-sage-800">{farm.fieldsCount || 0}</span>
            <span className="text-xs text-sage-500">fields</span>
          </div>
        </td>
        <td className="p-4">
          <FarmHealthCard 
            farmId={farm.id} 
            farmName={farm.name} 
            compact={true} 
          />
        </td>
      </tr>
      
      {/* Expanded Fields Row */}
      {isExpanded && farm.fields && farm.fields.length > 0 && (
        <tr className="bg-sage-25/50">
          <td colSpan={5} className="p-0">
            <div className="px-4 py-3 border-t border-sage-200/30">
              <div className="ml-6">
                <h4 className="text-sm font-medium text-sage-700 mb-2">Fields ({farm.fields.length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {farm.fields.map((field) => (
                    <div 
                      key={field.id} 
                      className="bg-white rounded-lg border border-sage-200/50 p-3 hover:border-sage-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-sage-800 text-sm">{field.name}</div>
                          <div className="text-xs text-sage-500 mt-1 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {field.area.toFixed(1)} ha
                          </div>
                        </div>
                        <Link 
                          href={`/farms/${farm.id}/fields/${field.id}`}
                          className="text-xs text-sage-600 hover:text-sage-800 transition-colors"
                        >
                          View →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}