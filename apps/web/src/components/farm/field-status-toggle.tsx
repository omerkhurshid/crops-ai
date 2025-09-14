'use client'

import { useState } from 'react'
import { Switch } from '../ui/switch'
import { Badge } from '../ui/badge'
import { toast } from 'react-hot-toast'

interface FieldStatusToggleProps {
  fieldId: string
  fieldName: string
  initialStatus: boolean
  onStatusChange?: (fieldId: string, isActive: boolean) => void
}

export function FieldStatusToggle({ 
  fieldId, 
  fieldName, 
  initialStatus, 
  onStatusChange 
}: FieldStatusToggleProps) {
  const [isActive, setIsActive] = useState(initialStatus)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async (newStatus: boolean) => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/fields', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fieldId,
          isActive: newStatus
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update field status')
      }

      setIsActive(newStatus)
      onStatusChange?.(fieldId, newStatus)
      
      toast.success(
        `${fieldName} ${newStatus ? 'activated' : 'deactivated'} successfully`
      )
    } catch (error) {
      console.error('Error updating field status:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to update field status'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Switch
          checked={isActive}
          onCheckedChange={handleToggle}
          disabled={isLoading}
          size="sm"
          aria-label={`Toggle ${fieldName} active status`}
        />
        <span className="text-xs text-sage-600">
          {isLoading ? 'Updating...' : isActive ? 'Active' : 'Inactive'}
        </span>
      </div>
      
      <Badge 
        className={`text-xs ${
          isActive 
            ? 'bg-sage-100 text-sage-700 border-sage-200' 
            : 'bg-gray-100 text-gray-600 border-gray-200'
        }`}
      >
        {isActive ? 'Active' : 'Inactive'}
      </Badge>
    </div>
  )
}