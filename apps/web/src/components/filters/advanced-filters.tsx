'use client'
import { useState, useEffect } from 'react'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../ui/modern-card'
import { Badge } from '../ui/badge'
import { InlineFloatingButton } from '../ui/floating-button'
import { 
  Filter, X, Calendar, MapPin, DollarSign, Activity,
  ChevronDown, Check, Search, SlidersHorizontal
} from 'lucide-react'
interface FilterOption {
  id: string
  label: string
  value: string
  count?: number
}
interface FilterGroup {
  id: string
  label: string
  type: 'select' | 'multiselect' | 'range' | 'date' | 'search'
  icon: React.ReactNode
  options?: FilterOption[]
  value?: any
  min?: number
  max?: number
  placeholder?: string
}
interface AdvancedFiltersProps {
  filters: FilterGroup[]
  onFilterChange: (filterId: string, value: any) => void
  onClearAll: () => void
  activeFiltersCount?: number
  className?: string
  showAsModal?: boolean
}
export function AdvancedFilters({
  filters,
  onFilterChange,
  onClearAll,
  activeFiltersCount = 0,
  className = "",
  showAsModal = false
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(!showAsModal)
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([])
  const [searchValues, setSearchValues] = useState<{ [key: string]: string }>({})
  const toggleDropdown = (filterId: string) => {
    setOpenDropdowns(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    )
  }
  const handleMultiselectChange = (filterId: string, optionValue: string, currentValues: string[] = []) => {
    const newValues = currentValues.includes(optionValue)
      ? currentValues.filter(v => v !== optionValue)
      : [...currentValues, optionValue]
    onFilterChange(filterId, newValues)
  }
  const renderFilterControl = (filter: FilterGroup) => {
    switch (filter.type) {
      case 'search':
        return (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-#555555" />
            <input
              type="text"
              placeholder={filter.placeholder || `Search ${filter.label.toLowerCase()}...`}
              value={searchValues[filter.id] || ''}
              onChange={(e) => {
                setSearchValues(prev => ({ ...prev, [filter.id]: e.target.value }))
                onFilterChange(filter.id, e.target.value)
              }}
              className="w-full pl-10 pr-4 py-2 border border-[#DDE4D8] rounded-lg focus:ring-2 focus:ring-#555555 focus:border-transparent text-sm"
            />
          </div>
        )
      case 'select':
        return (
          <div className="relative">
            <button
              onClick={() => toggleDropdown(filter.id)}
              className="w-full flex items-center justify-between p-2 border border-[#DDE4D8] rounded-lg hover:bg-[#F8FAF8] transition-colors text-sm"
            >
              <span className={filter.value ? 'text-[#1A1A1A]' : 'text-#555555'}>
                {filter.value 
                  ? filter.options?.find(opt => opt.value === filter.value)?.label 
                  : `Select ${filter.label.toLowerCase()}`
                }
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${
                openDropdowns.includes(filter.id) ? 'rotate-180' : ''
              }`} />
            </button>
            {openDropdowns.includes(filter.id) && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#DDE4D8] rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                {filter.options?.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      onFilterChange(filter.id, option.value)
                      setOpenDropdowns(prev => prev.filter(id => id !== filter.id))
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-[#F8FAF8] transition-colors text-sm flex items-center justify-between"
                  >
                    <span>{option.label}</span>
                    {option.count && (
                      <Badge variant="secondary" className="text-xs">
                        {option.count}
                      </Badge>
                    )}
                    {filter.value === option.value && (
                      <Check className="h-4 w-4 text-[#555555]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      case 'multiselect':
        const selectedValues = Array.isArray(filter.value) ? filter.value : []
        return (
          <div className="relative">
            <button
              onClick={() => toggleDropdown(filter.id)}
              className="w-full flex items-center justify-between p-2 border border-[#DDE4D8] rounded-lg hover:bg-[#F8FAF8] transition-colors text-sm"
            >
              <span className={selectedValues.length ? 'text-[#1A1A1A]' : 'text-#555555'}>
                {selectedValues.length 
                  ? `${selectedValues.length} selected`
                  : `Select ${filter.label.toLowerCase()}`
                }
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${
                openDropdowns.includes(filter.id) ? 'rotate-180' : ''
              }`} />
            </button>
            {openDropdowns.includes(filter.id) && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#DDE4D8] rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                {filter.options?.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleMultiselectChange(filter.id, option.value, selectedValues)}
                    className="w-full text-left px-3 py-2 hover:bg-[#F8FAF8] transition-colors text-sm flex items-center justify-between"
                  >
                    <span>{option.label}</span>
                    <div className="flex items-center gap-2">
                      {option.count && (
                        <Badge variant="secondary" className="text-xs">
                          {option.count}
                        </Badge>
                      )}
                      {selectedValues.includes(option.value) && (
                        <Check className="h-4 w-4 text-[#555555]" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
            {selectedValues.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedValues.map((value) => {
                  const option = filter.options?.find(opt => opt.value === value)
                  return option ? (
                    <Badge key={value} variant="secondary" className="text-xs flex items-center gap-1">
                      {option.label}
                      <button
                        onClick={() => handleMultiselectChange(filter.id, value, selectedValues)}
                        className="ml-1 hover:bg-[#DDE4D8] rounded-full p-0.5"
                      >
                        <X className="h-2 w-2" />
                      </button>
                    </Badge>
                  ) : null
                })}
              </div>
            )}
          </div>
        )
      case 'range':
        return (
          <div className="space-y-2">
            <div className="flex gap-2 items-center">
              <input
                type="number"
                placeholder={filter.min?.toString() || "Min"}
                min={filter.min}
                max={filter.max}
                value={filter.value?.min || ''}
                onChange={(e) => onFilterChange(filter.id, { 
                  ...filter.value, 
                  min: e.target.value ? Number(e.target.value) : undefined 
                })}
                className="flex-1 p-2 border border-[#DDE4D8] rounded-lg focus:ring-2 focus:ring-#555555 focus:border-transparent text-sm"
              />
              <span className="text-#555555">to</span>
              <input
                type="number"
                placeholder={filter.max?.toString() || "Max"}
                min={filter.min}
                max={filter.max}
                value={filter.value?.max || ''}
                onChange={(e) => onFilterChange(filter.id, { 
                  ...filter.value, 
                  max: e.target.value ? Number(e.target.value) : undefined 
                })}
                className="flex-1 p-2 border border-[#DDE4D8] rounded-lg focus:ring-2 focus:ring-#555555 focus:border-transparent text-sm"
              />
            </div>
          </div>
        )
      case 'date':
        return (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="date"
                value={filter.value?.start || ''}
                onChange={(e) => onFilterChange(filter.id, { 
                  ...filter.value, 
                  start: e.target.value 
                })}
                className="flex-1 p-2 border border-[#DDE4D8] rounded-lg focus:ring-2 focus:ring-#555555 focus:border-transparent text-sm"
              />
              <input
                type="date"
                value={filter.value?.end || ''}
                onChange={(e) => onFilterChange(filter.id, { 
                  ...filter.value, 
                  end: e.target.value 
                })}
                className="flex-1 p-2 border border-[#DDE4D8] rounded-lg focus:ring-2 focus:ring-#555555 focus:border-transparent text-sm"
              />
            </div>
          </div>
        )
      default:
        return null
    }
  }
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Filter Groups */}
      {filters.map((filter) => (
        <div key={filter.id} className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="text-[#555555]">
              {filter.icon}
            </div>
            <label className="text-sm font-medium text-[#1A1A1A]">
              {filter.label}
            </label>
          </div>
          {renderFilterControl(filter)}
        </div>
      ))}
      {/* Clear All Button */}
      {activeFiltersCount > 0 && (
        <div className="pt-4 border-t border-[#DDE4D8]">
          <InlineFloatingButton
            icon={<X className="h-4 w-4" />}
            label={`Clear all filters (${activeFiltersCount})`}
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="w-full justify-center"
          />
        </div>
      )}
    </div>
  )
  if (showAsModal) {
    return (
      <div className={className}>
        {/* Filter Toggle Button */}
        <InlineFloatingButton
          icon={<SlidersHorizontal className="h-4 w-4" />}
          label={`Filters${activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ''}`}
          variant="secondary"
          onClick={() => setIsOpen(!isOpen)}
          showLabel={true}
        />
        {/* Filter Modal */}
        {isOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <ModernCard variant="floating" className="w-full max-w-md max-h-[80vh] overflow-hidden">
              <ModernCardHeader>
                <div className="flex items-center justify-between">
                  <ModernCardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Advanced Filters
                  </ModernCardTitle>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-[#F8FAF8] rounded-full transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </ModernCardHeader>
              <ModernCardContent className="p-6 overflow-y-auto">
                <FilterContent />
              </ModernCardContent>
            </ModernCard>
          </div>
        )}
      </div>
    )
  }
  return (
    <div className={className}>
      <ModernCard variant="soft">
        <ModernCardHeader>
          <ModernCardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Advanced Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount}</Badge>
            )}
          </ModernCardTitle>
        </ModernCardHeader>
        <ModernCardContent className="p-6">
          <FilterContent />
        </ModernCardContent>
      </ModernCard>
    </div>
  )
}
// Pre-configured filter sets for common use cases
export const farmFilters: FilterGroup[] = [
  {
    id: 'search',
    label: 'Search Farms',
    type: 'search',
    icon: <Search className="h-4 w-4" />,
    placeholder: 'Search by farm name or location...'
  },
  {
    id: 'location',
    label: 'Location',
    type: 'multiselect',
    icon: <MapPin className="h-4 w-4" />,
    options: [
      { id: 'iowa', label: 'Iowa', value: 'iowa', count: 12 },
      { id: 'illinois', label: 'Illinois', value: 'illinois', count: 8 },
      { id: 'nebraska', label: 'Nebraska', value: 'nebraska', count: 5 }
    ]
  },
  {
    id: 'size',
    label: 'Farm Size (hectares)',
    type: 'range',
    icon: <Activity className="h-4 w-4" />,
    min: 0,
    max: 1000
  },
  {
    id: 'created',
    label: 'Date Created',
    type: 'date',
    icon: <Calendar className="h-4 w-4" />
  }
]
export const fieldFilters: FilterGroup[] = [
  {
    id: 'search',
    label: 'Search Fields',
    type: 'search',
    icon: <Search className="h-4 w-4" />,
    placeholder: 'Search by field name or crop type...'
  },
  {
    id: 'crop',
    label: 'Crop Type',
    type: 'multiselect',
    icon: <Activity className="h-4 w-4" />,
    options: [
      { id: 'corn', label: 'Corn', value: 'corn', count: 45 },
      { id: 'soybean', label: 'Soybean', value: 'soybean', count: 32 },
      { id: 'wheat', label: 'Wheat', value: 'wheat', count: 18 },
      { id: 'cotton', label: 'Cotton', value: 'cotton', count: 12 }
    ]
  },
  {
    id: 'health',
    label: 'Health Score',
    type: 'range',
    icon: <Activity className="h-4 w-4" />,
    min: 0,
    max: 100
  },
  {
    id: 'status',
    label: 'Status',
    type: 'select',
    icon: <Activity className="h-4 w-4" />,
    options: [
      { id: 'healthy', label: 'Healthy', value: 'healthy' },
      { id: 'warning', label: 'Needs Attention', value: 'warning' },
      { id: 'critical', label: 'Critical', value: 'critical' }
    ]
  }
]
export const financialFilters: FilterGroup[] = [
  {
    id: 'search',
    label: 'Search Transactions',
    type: 'search',
    icon: <Search className="h-4 w-4" />,
    placeholder: 'Search by description or category...'
  },
  {
    id: 'type',
    label: 'Transaction Type',
    type: 'select',
    icon: <DollarSign className="h-4 w-4" />,
    options: [
      { id: 'income', label: 'Income', value: 'income' },
      { id: 'expense', label: 'Expense', value: 'expense' }
    ]
  },
  {
    id: 'category',
    label: 'Category',
    type: 'multiselect',
    icon: <DollarSign className="h-4 w-4" />,
    options: [
      { id: 'seeds', label: 'Seeds', value: 'seeds', count: 34 },
      { id: 'fertilizer', label: 'Fertilizer', value: 'fertilizer', count: 28 },
      { id: 'equipment', label: 'Equipment', value: 'equipment', count: 15 },
      { id: 'labor', label: 'Labor', value: 'labor', count: 22 }
    ]
  },
  {
    id: 'amount',
    label: 'Amount ($)',
    type: 'range',
    icon: <DollarSign className="h-4 w-4" />,
    min: 0,
    max: 50000
  },
  {
    id: 'date',
    label: 'Date Range',
    type: 'date',
    icon: <Calendar className="h-4 w-4" />
  }
]