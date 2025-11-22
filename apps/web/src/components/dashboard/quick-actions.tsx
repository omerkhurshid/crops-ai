'use client'
import React, { useState, memo } from 'react'
import { Button } from '../ui/button'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../ui/modern-card'
import { 
  DollarSign, 
  Wheat, 
  Camera,
  Plus,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { cn } from '../../lib/utils'
interface QuickActionsProps {
  farmId: string
  className?: string
}
interface QuickExpense {
  amount: number
  category: string
  description?: string
}
interface QuickHarvest {
  fieldName: string
  cropType: string
  quantity: number
  unit: string
  qualityNotes?: string
}
export const QuickActions = memo(function QuickActions({ farmId, className }: QuickActionsProps) {
  const [expenseForm, setExpenseForm] = useState<QuickExpense>({
    amount: 0,
    category: 'fuel',
    description: ''
  })
  const [harvestForm, setHarvestForm] = useState<QuickHarvest>({
    fieldName: '',
    cropType: 'corn',
    quantity: 0,
    unit: 'tons',
    qualityNotes: ''
  })
  const [loading, setLoading] = useState<'expense' | 'harvest' | null>(null)
  const [success, setSuccess] = useState<'expense' | 'harvest' | null>(null)
  const handleExpenseSubmit = async () => {
    if (expenseForm.amount <= 0) return
    setLoading('expense')
    try {
      const response = await fetch('/api/quick-actions/expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmId,
          amount: expenseForm.amount,
          category: expenseForm.category,
          description: expenseForm.description
        })
      })
      if (response.ok) {
        setSuccess('expense')
        setExpenseForm({ amount: 0, category: 'fuel', description: '' })
        setTimeout(() => setSuccess(null), 3000)
      } else {
      }
    } catch (error) {
      console.error('Error creating expense:', error)
    } finally {
      setLoading(null)
    }
  }
  const handleHarvestSubmit = async () => {
    if (!harvestForm.fieldName || harvestForm.quantity <= 0) return
    setLoading('harvest')
    try {
      const response = await fetch('/api/quick-actions/harvest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmId,
          fieldName: harvestForm.fieldName,
          cropType: harvestForm.cropType,
          quantity: harvestForm.quantity,
          unit: harvestForm.unit,
          qualityNotes: harvestForm.qualityNotes
        })
      })
      if (response.ok) {
        setSuccess('harvest')
        setHarvestForm({
          fieldName: '',
          cropType: 'corn',
          quantity: 0,
          unit: 'tons',
          qualityNotes: ''
        })
        setTimeout(() => setSuccess(null), 3000)
      } else {
      }
    } catch (error) {
      console.error('Error creating harvest record:', error)
    } finally {
      setLoading(null)
    }
  }
  return (
    <div className={cn('grid grid-cols-1 lg:grid-cols-2 gap-6', className)}>
      {/* Quick Expense Entry */}
      <ModernCard variant="soft">
        <ModernCardHeader>
          <ModernCardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-[#8FBF7F]" />
            Record Farm Expense
          </ModernCardTitle>
        </ModernCardHeader>
        <ModernCardContent className="space-y-4">
          {success === 'expense' && (
            <div className="flex items-center gap-2 p-3 bg-[#F8FAF8] rounded-lg text-[#7A8F78]">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Expense recorded successfully!</span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#555555] mb-1">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555555]">$</span>
                <input
                  type="number"
                  value={expenseForm.amount || ''}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  className="w-full pl-8 pr-3 py-2 border border-[#E6E6E6] rounded-md focus:ring-2 focus:ring-green-500 focus:border-[#8FBF7F]"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#555555] mb-1">Category</label>
              <select
                value={expenseForm.category}
                onChange={(e) => setExpenseForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-[#E6E6E6] rounded-md focus:ring-2 focus:ring-green-500 focus:border-[#8FBF7F]"
              >
                <option value="fuel">Fuel</option>
                <option value="seeds">Seeds</option>
                <option value="fertilizer">Fertilizer</option>
                <option value="equipment">Equipment</option>
                <option value="labor">Labor</option>
                <option value="maintenance">Maintenance</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#555555] mb-1">Description (optional)</label>
            <input
              type="text"
              value={expenseForm.description}
              onChange={(e) => setExpenseForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-[#E6E6E6] rounded-md focus:ring-2 focus:ring-green-500 focus:border-[#8FBF7F]"
              placeholder="e.g., Diesel for harvester"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleExpenseSubmit}
              disabled={loading === 'expense' || expenseForm.amount <= 0}
              className="flex-1"
            >
              {loading === 'expense' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Recording...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expense
                </>
              )}
            </Button>
            <Button variant="outline" size="icon" title="Add Receipt Photo">
              <Camera className="h-4 w-4" />
            </Button>
          </div>
        </ModernCardContent>
      </ModernCard>
      {/* Quick Harvest Entry */}
      <ModernCard variant="soft">
        <ModernCardHeader>
          <ModernCardTitle className="flex items-center gap-2">
            <Wheat className="h-5 w-5 text-orange-600" />
            Record Harvest
          </ModernCardTitle>
        </ModernCardHeader>
        <ModernCardContent className="space-y-4">
          {success === 'harvest' && (
            <div className="flex items-center gap-2 p-3 bg-[#F8FAF8] rounded-lg text-[#7A8F78]">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Harvest recorded successfully!</span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#555555] mb-1">Field Name</label>
              <input
                type="text"
                value={harvestForm.fieldName}
                onChange={(e) => setHarvestForm(prev => ({ ...prev, fieldName: e.target.value }))}
                className="w-full px-3 py-2 border border-[#E6E6E6] rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="e.g., North Field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#555555] mb-1">Crop Type</label>
              <select
                value={harvestForm.cropType}
                onChange={(e) => setHarvestForm(prev => ({ ...prev, cropType: e.target.value }))}
                className="w-full px-3 py-2 border border-[#E6E6E6] rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="corn">Corn</option>
                <option value="wheat">Wheat</option>
                <option value="soybeans">Soybeans</option>
                <option value="barley">Barley</option>
                <option value="oats">Oats</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#555555] mb-1">Quantity</label>
              <input
                type="number"
                value={harvestForm.quantity || ''}
                onChange={(e) => setHarvestForm(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-[#E6E6E6] rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="0"
                min="0"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#555555] mb-1">Unit</label>
              <select
                value={harvestForm.unit}
                onChange={(e) => setHarvestForm(prev => ({ ...prev, unit: e.target.value }))}
                className="w-full px-3 py-2 border border-[#E6E6E6] rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="tons">Tons</option>
                <option value="bushels">Bushels</option>
                <option value="pounds">Pounds</option>
                <option value="kg">Kilograms</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#555555] mb-1">Quality Notes (optional)</label>
            <input
              type="text"
              value={harvestForm.qualityNotes}
              onChange={(e) => setHarvestForm(prev => ({ ...prev, qualityNotes: e.target.value }))}
              className="w-full px-3 py-2 border border-[#E6E6E6] rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="e.g., Excellent quality, 14% moisture"
            />
          </div>
          <Button 
            onClick={handleHarvestSubmit}
            disabled={loading === 'harvest' || !harvestForm.fieldName || harvestForm.quantity <= 0}
            className="w-full"
          >
            {loading === 'harvest' ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Recording...
              </>
            ) : (
              <>
                <Wheat className="h-4 w-4 mr-2" />
                Record Harvest
              </>
            )}
          </Button>
        </ModernCardContent>
      </ModernCard>
    </div>
  )
})