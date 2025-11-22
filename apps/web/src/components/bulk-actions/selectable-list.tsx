'use client'
import { useState, useEffect } from 'react'
import { ModernCard, ModernCardContent } from '../ui/modern-card'
import { Badge } from '../ui/badge'
import { BulkActionsToolbar, useBulkSelection, BulkAction } from './bulk-actions-toolbar'
import { CheckSquare, Square } from 'lucide-react'
interface SelectableItem {
  id: string
  [key: string]: any
}
interface SelectableListProps<T extends SelectableItem> {
  items: T[]
  renderItem: (item: T, isSelected: boolean, onToggle: () => void) => React.ReactNode
  bulkActions: BulkAction[]
  onBulkAction: (actionId: string, selectedItems: string[]) => Promise<void>
  className?: string
  showBulkToolbar?: boolean
  emptyMessage?: string
  listClassName?: string
}
export function SelectableList<T extends SelectableItem>({
  items,
  renderItem,
  bulkActions,
  onBulkAction,
  className = "",
  showBulkToolbar = true,
  emptyMessage = "No items found",
  listClassName = ""
}: SelectableListProps<T>) {
  const {
    selectedItems,
    selectedItemsData,
    toggleItem,
    selectAll,
    deselectAll,
    isSelected,
    hasSelection
  } = useBulkSelection(items)
  return (
    <div className={className}>
      {/* Bulk Actions Toolbar */}
      {showBulkToolbar && hasSelection && (
        <div className="mb-6">
          <BulkActionsToolbar
            selectedItems={selectedItems}
            totalItems={items.length}
            onSelectAll={selectAll}
            onDeselectAll={deselectAll}
            actions={bulkActions}
            onActionExecute={onBulkAction}
          />
        </div>
      )}
      {/* Items List */}
      <div className={`space-y-4 ${listClassName}`}>
        {items.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-[#555555] mb-2">{emptyMessage}</div>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="relative">
              {renderItem(item, isSelected(item.id), () => toggleItem(item.id))}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
// Wrapper component for individual selectable items
interface SelectableItemWrapperProps {
  isSelected: boolean
  onToggle: () => void
  children: React.ReactNode
  className?: string
  showCheckbox?: boolean
}
export function SelectableItemWrapper({
  isSelected,
  onToggle,
  children,
  className = "",
  showCheckbox = true
}: SelectableItemWrapperProps) {
  return (
    <div
      className={`group relative border rounded-lg transition-all ${
        isSelected
          ? 'border-[#7A8F78] bg-[#F8FAF8] shadow-sm'
          : 'border-[#DDE4D8] hover:border-[#DDE4D8] hover:shadow-sm'
      } ${className}`}
    >
      {/* Selection Checkbox */}
      {showCheckbox && (
        <div className="absolute top-3 left-3 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggle()
            }}
            className={`p-1 rounded transition-all ${
              isSelected
                ? 'text-[#555555]'
                : 'text-sage-400 opacity-0 group-hover:opacity-100'
            }`}
          >
            {isSelected ? (
              <CheckSquare className="h-5 w-5" />
            ) : (
              <Square className="h-5 w-5" />
            )}
          </button>
        </div>
      )}
      {/* Item Content */}
      <div
        onClick={onToggle}
        className={`cursor-pointer ${showCheckbox ? 'pl-12' : ''}`}
      >
        {children}
      </div>
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-0 left-0 w-1 h-full bg-[#7A8F78] rounded-l-lg" />
      )}
    </div>
  )
}
// Pre-built selectable list items for common data types
interface FarmItemProps {
  farm: {
    id: string
    name: string
    location?: string
    totalArea?: number
    fieldsCount?: number
    status?: string
    createdAt?: string
  }
  isSelected: boolean
  onToggle: () => void
}
export function SelectableFarmItem({ farm, isSelected, onToggle }: FarmItemProps) {
  return (
    <SelectableItemWrapper isSelected={isSelected} onToggle={onToggle}>
      <ModernCard variant="soft" className="border-none shadow-none">
        <ModernCardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">{farm.name}</h3>
              {farm.location && (
                <p className="text-sm text-[#555555] mb-2">📍 {farm.location}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-#555555">
                {farm.totalArea && (
                  <span>{farm.totalArea} hectares</span>
                )}
                {farm.fieldsCount && (
                  <span>{farm.fieldsCount} fields</span>
                )}
                {farm.createdAt && (
                  <span>Created {new Date(farm.createdAt).toLocaleDateString()}</span>
                )}
              </div>
            </div>
            {farm.status && (
              <Badge variant={farm.status === 'Active' ? 'default' : 'secondary'}>
                {farm.status}
              </Badge>
            )}
          </div>
        </ModernCardContent>
      </ModernCard>
    </SelectableItemWrapper>
  )
}
interface FieldItemProps {
  field: {
    id: string
    name: string
    cropType?: string
    area?: number
    healthScore?: number
    status?: string
    lastUpdated?: string
  }
  isSelected: boolean
  onToggle: () => void
}
export function SelectableFieldItem({ field, isSelected, onToggle }: FieldItemProps) {
  const getHealthScoreColor = (score?: number) => {
    if (!score) return 'text-#555555'
    if (score >= 80) return 'text-[#8FBF7F]'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }
  return (
    <SelectableItemWrapper isSelected={isSelected} onToggle={onToggle}>
      <ModernCard variant="soft" className="border-none shadow-none">
        <ModernCardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">{field.name}</h3>
              <div className="flex items-center gap-4 text-sm text-[#555555] mb-2">
                {field.cropType && (
                  <span>🌱 {field.cropType}</span>
                )}
                {field.area && (
                  <span>📐 {field.area} ha</span>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-#555555">
                {field.healthScore !== undefined && (
                  <span className={getHealthScoreColor(field.healthScore)}>
                    Health: {field.healthScore}%
                  </span>
                )}
                {field.lastUpdated && (
                  <span>Updated {new Date(field.lastUpdated).toLocaleDateString()}</span>
                )}
              </div>
            </div>
            {field.status && (
              <Badge 
                variant={
                  field.status === 'Healthy' ? 'default' : 
                  field.status === 'Warning' ? 'secondary' : 'destructive'
                }
              >
                {field.status}
              </Badge>
            )}
          </div>
        </ModernCardContent>
      </ModernCard>
    </SelectableItemWrapper>
  )
}
interface TransactionItemProps {
  transaction: {
    id: string
    description: string
    amount: number
    category?: string
    type: 'income' | 'expense'
    date: string
    status?: string
  }
  isSelected: boolean
  onToggle: () => void
}
export function SelectableTransactionItem({ transaction, isSelected, onToggle }: TransactionItemProps) {
  return (
    <SelectableItemWrapper isSelected={isSelected} onToggle={onToggle}>
      <ModernCard variant="soft" className="border-none shadow-none">
        <ModernCardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-1">{transaction.description}</h3>
              <div className="flex items-center gap-4 text-sm text-#555555">
                <span>{new Date(transaction.date).toLocaleDateString()}</span>
                {transaction.category && (
                  <Badge variant="outline">{transaction.category}</Badge>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className={`font-semibold ${
                transaction.type === 'income' ? 'text-[#8FBF7F]' : 'text-red-600'
              }`}>
                {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString()}
              </div>
              {transaction.status && (
                <Badge variant="secondary" className="mt-1">
                  {transaction.status}
                </Badge>
              )}
            </div>
          </div>
        </ModernCardContent>
      </ModernCard>
    </SelectableItemWrapper>
  )
}