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
        <span className="text-xs text-[#555555]">
          {isLoading ? 'Updating...' : isActive ? 'Active' : 'Inactive'}
        </span>
      </div>
      <Badge 
        className={`text-xs ${
          isActive 
            ? 'bg-[#F8FAF8] text-[#555555] border-[#DDE4D8]' 
            : 'bg-[#F5F5F5] text-[#555555] border-[#F3F4F6]'
        }`}
      >
        {isActive ? 'Active' : 'Inactive'}
      </Badge>
    </div>
  )
}