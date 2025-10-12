'use client'

import { useState } from 'react'
import { ModernCard, ModernCardContent } from '../ui/modern-card'
import { Badge } from '../ui/badge'
import { InlineFloatingButton } from '../ui/floating-button'
import { Alert, AlertDescription } from '../ui/alert'
import { 
  CheckSquare, Square, Trash2, Edit3, Download, Archive,
  Tag, Send, Copy, Move, MoreHorizontal, AlertTriangle,
  CheckCircle2, X, Loader2, ChevronDown
} from 'lucide-react'

export interface BulkAction {
  id: string
  label: string
  icon: React.ReactNode
  variant: 'primary' | 'secondary' | 'ghost' | 'success' | 'warning'
  requiresConfirmation?: boolean
  confirmationMessage?: string
  disabled?: boolean
  description?: string
}

interface BulkActionsToolbarProps {
  selectedItems: string[]
  totalItems: number
  onSelectAll: (selected: boolean) => void
  onDeselectAll: () => void
  actions: BulkAction[]
  onActionExecute: (actionId: string, selectedItems: string[]) => Promise<void>
  className?: string
  showSelectAll?: boolean
}

export function BulkActionsToolbar({
  selectedItems,
  totalItems,
  onSelectAll,
  onDeselectAll,
  actions,
  onActionExecute,
  className = "",
  showSelectAll = true
}: BulkActionsToolbarProps) {
  const [isExecuting, setIsExecuting] = useState<string | null>(null)
  const [showConfirmation, setShowConfirmation] = useState<string | null>(null)
  const [showActions, setShowActions] = useState(false)

  const allSelected = selectedItems.length === totalItems
  const someSelected = selectedItems.length > 0 && selectedItems.length < totalItems

  const handleSelectAllToggle = () => {
    if (allSelected || someSelected) {
      onDeselectAll()
    } else {
      onSelectAll(true)
    }
  }

  const handleActionClick = (action: BulkAction) => {
    if (action.requiresConfirmation) {
      setShowConfirmation(action.id)
    } else {
      executeAction(action.id)
    }
  }

  const executeAction = async (actionId: string) => {
    setIsExecuting(actionId)
    setShowConfirmation(null)
    setShowActions(false)

    try {
      await onActionExecute(actionId, selectedItems)
      onDeselectAll() // Clear selection after successful action
    } catch (error) {
      console.error('Bulk action failed:', error)
      // Error handling could be improved with toast notifications
    } finally {
      setIsExecuting(null)
    }
  }

  const primaryActions = actions.filter(action => action.variant === 'primary').slice(0, 2)
  const secondaryActions = actions.filter(action => action.variant !== 'primary')

  if (selectedItems.length === 0) {
    return null
  }

  return (
    <div className={`sticky top-20 z-40 ${className}`}>
      <ModernCard variant="floating" className="shadow-lg border-sage-300">
        <ModernCardContent className="p-4">
          <div className="flex items-center justify-between">
            {/* Selection Info */}
            <div className="flex items-center gap-4">
              {showSelectAll && (
                <button
                  onClick={handleSelectAllToggle}
                  className="flex items-center gap-2 p-2 hover:bg-sage-100 rounded-lg transition-colors"
                >
                  {allSelected ? (
                    <CheckSquare className="h-5 w-5 text-sage-600" />
                  ) : someSelected ? (
                    <div className="h-5 w-5 border-2 border-sage-600 rounded bg-sage-200 flex items-center justify-center">
                      <div className="h-2 w-2 bg-sage-600 rounded-sm"></div>
                    </div>
                  ) : (
                    <Square className="h-5 w-5 text-sage-600" />
                  )}
                  <span className="text-sm font-medium text-sage-800">
                    {allSelected ? 'Deselect all' : 'Select all'}
                  </span>
                </button>
              )}
              
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-sage-100 text-sage-800">
                  {selectedItems.length} selected
                </Badge>
                <span className="text-sm text-sage-600">
                  of {totalItems} items
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Primary Actions - Always Visible */}
              {primaryActions.map((action) => (
                <InlineFloatingButton
                  key={action.id}
                  icon={isExecuting === action.id ? <Loader2 className="h-4 w-4 animate-spin" /> : action.icon}
                  label={action.label}
                  variant={action.variant}
                  showLabel={true}
                  disabled={action.disabled || isExecuting !== null}
                  onClick={() => handleActionClick(action)}
                />
              ))}

              {/* Secondary Actions - Dropdown */}
              {secondaryActions.length > 0 && (
                <div className="relative">
                  <InlineFloatingButton
                    icon={<MoreHorizontal className="h-4 w-4" />}
                    label="More actions"
                    variant="ghost"
                    onClick={() => setShowActions(!showActions)}
                  />
                  
                  {showActions && (
                    <div className="absolute top-full right-0 mt-2 bg-white border border-sage-200 rounded-lg shadow-lg z-50 min-w-48">
                      <div className="py-2">
                        {secondaryActions.map((action) => (
                          <button
                            key={action.id}
                            onClick={() => handleActionClick(action)}
                            disabled={action.disabled || isExecuting !== null}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-sage-50 transition-colors flex items-center gap-3 ${
                              action.disabled ? 'opacity-50 cursor-not-allowed' : ''
                            } ${
                              action.variant === 'warning' ? 'text-red-600 hover:bg-red-50' : 'text-sage-700'
                            }`}
                          >
                            {isExecuting === action.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              action.icon
                            )}
                            <div>
                              <div>{action.label}</div>
                              {action.description && (
                                <div className="text-xs text-sage-500 mt-0.5">
                                  {action.description}
                                </div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Clear Selection */}
              <button
                onClick={onDeselectAll}
                className="p-2 hover:bg-sage-100 rounded-lg transition-colors text-sage-500 hover:text-sage-700"
                title="Clear selection"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Confirmation Dialog */}
          {showConfirmation && (
            <div className="mt-4 pt-4 border-t border-sage-200">
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <div className="mb-3">
                    {actions.find(a => a.id === showConfirmation)?.confirmationMessage ||
                     `Are you sure you want to perform this action on ${selectedItems.length} selected items?`}
                  </div>
                  <div className="flex gap-2">
                    <InlineFloatingButton
                      icon={<CheckCircle2 className="h-4 w-4" />}
                      label="Confirm"
                      variant="destructive"
                      size="sm"
                      onClick={() => executeAction(showConfirmation)}
                      disabled={isExecuting !== null}
                    />
                    <InlineFloatingButton
                      icon={<X className="h-4 w-4" />}
                      label="Cancel"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowConfirmation(null)}
                    />
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Click outside to close actions dropdown */}
          {showActions && (
            <div 
              className="fixed inset-0 z-30" 
              onClick={() => setShowActions(false)}
            />
          )}
        </ModernCardContent>
      </ModernCard>
    </div>
  )
}

// Hook for managing bulk selection
export function useBulkSelection<T extends { id: string }>(items: T[]) {
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  const toggleItem = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const selectAll = () => {
    setSelectedItems(items.map(item => item.id))
  }

  const deselectAll = () => {
    setSelectedItems([])
  }

  const isSelected = (itemId: string) => selectedItems.includes(itemId)

  const selectedItemsData = items.filter(item => selectedItems.includes(item.id))

  return {
    selectedItems,
    selectedItemsData,
    toggleItem,
    selectAll,
    deselectAll,
    isSelected,
    hasSelection: selectedItems.length > 0,
    selectionCount: selectedItems.length
  }
}

// Pre-configured bulk actions for different data types
export const farmBulkActions: BulkAction[] = [
  {
    id: 'export',
    label: 'Export Data',
    icon: <Download className="h-4 w-4" />,
    variant: 'primary',
    description: 'Export selected farms data'
  },
  {
    id: 'archive',
    label: 'Archive Farms',
    icon: <Archive className="h-4 w-4" />,
    variant: 'secondary',
    requiresConfirmation: true,
    confirmationMessage: 'Archived farms will be hidden from the main view but can be restored later.',
    description: 'Move to archived folder'
  },
  {
    id: 'add-tags',
    label: 'Add Tags',
    icon: <Tag className="h-4 w-4" />,
    variant: 'secondary',
    description: 'Add tags to selected farms'
  },
  {
    id: 'delete',
    label: 'Delete Farms',
    icon: <Trash2 className="h-4 w-4" />,
    variant: 'warning',
    requiresConfirmation: true,
    confirmationMessage: 'This will permanently delete the selected farms and all associated data. This action cannot be undone.',
    description: 'Permanently remove farms'
  }
]

export const fieldBulkActions: BulkAction[] = [
  {
    id: 'update-crop',
    label: 'Update Crop Type',
    icon: <Edit3 className="h-4 w-4" />,
    variant: 'primary',
    description: 'Change crop type for selected fields'
  },
  {
    id: 'generate-report',
    label: 'Generate Health Report',
    icon: <Download className="h-4 w-4" />,
    variant: 'primary',
    description: 'Create health analysis report'
  },
  {
    id: 'move-farm',
    label: 'Move to Farm',
    icon: <Move className="h-4 w-4" />,
    variant: 'secondary',
    description: 'Transfer fields to another farm'
  },
  {
    id: 'duplicate',
    label: 'Duplicate Fields',
    icon: <Copy className="h-4 w-4" />,
    variant: 'secondary',
    description: 'Create copies of selected fields'
  },
  {
    id: 'delete',
    label: 'Delete Fields',
    icon: <Trash2 className="h-4 w-4" />,
    variant: 'warning',
    requiresConfirmation: true,
    confirmationMessage: 'This will permanently delete the selected fields and all associated data.',
    description: 'Permanently remove fields'
  }
]

export const financialBulkActions: BulkAction[] = [
  {
    id: 'categorize',
    label: 'Update Category',
    icon: <Tag className="h-4 w-4" />,
    variant: 'primary',
    description: 'Change category for selected transactions'
  },
  {
    id: 'export',
    label: 'Export Transactions',
    icon: <Download className="h-4 w-4" />,
    variant: 'primary',
    description: 'Export selected transactions'
  },
  {
    id: 'approve',
    label: 'Approve All',
    icon: <CheckCircle2 className="h-4 w-4" />,
    variant: 'secondary',
    description: 'Mark transactions as approved'
  },
  {
    id: 'duplicate',
    label: 'Duplicate Entries',
    icon: <Copy className="h-4 w-4" />,
    variant: 'secondary',
    description: 'Create copies of selected transactions'
  },
  {
    id: 'delete',
    label: 'Delete Transactions',
    icon: <Trash2 className="h-4 w-4" />,
    variant: 'warning',
    requiresConfirmation: true,
    confirmationMessage: 'This will permanently delete the selected transactions. This action cannot be undone.',
    description: 'Permanently remove transactions'
  }
]