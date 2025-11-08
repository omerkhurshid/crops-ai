'use client';
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, DollarSign, Calendar, Tag, FileText, AlertCircle } from 'lucide-react';
interface Field {
  id: string;
  name: string;
  area: number;
}
interface Crop {
  id: string;
  fieldId: string;
  cropType: string;
  variety?: string;
}
interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  farmId: string;
  fieldId?: string;
  type: 'INCOME' | 'EXPENSE';
  onSuccess: () => void;
  editTransaction?: any;
}
const INCOME_CATEGORIES = [
  { value: 'CROP_SALES', label: 'Crop Sales', icon: '🌾' },
  { value: 'LIVESTOCK_SALES', label: 'Livestock Sales', icon: '🐄' },
  { value: 'SUBSIDIES', label: 'Subsidies', icon: '💰' },
  { value: 'LEASE_INCOME', label: 'Lease Income', icon: '🏡' },
  { value: 'OTHER_INCOME', label: 'Other Income', icon: '📈' },
];
const EXPENSE_CATEGORIES = [
  { value: 'SEEDS', label: 'Seeds', icon: '🌱' },
  { value: 'FERTILIZER', label: 'Fertilizer', icon: '🧪' },
  { value: 'PESTICIDES', label: 'Pesticides', icon: '🚿' },
  { value: 'LABOR', label: 'Labor', icon: '👨‍🌾' },
  { value: 'MACHINERY', label: 'Machinery', icon: '🚜' },
  { value: 'FUEL', label: 'Fuel', icon: '⛽' },
  { value: 'IRRIGATION', label: 'Irrigation', icon: '💧' },
  { value: 'STORAGE', label: 'Storage', icon: '🏪' },
  { value: 'INSURANCE', label: 'Insurance', icon: '🛡️' },
  { value: 'OVERHEAD', label: 'Overhead', icon: '🏢' },
  { value: 'OTHER_EXPENSE', label: 'Other Expense', icon: '📄' },
];
export function TransactionModal({
  isOpen,
  onClose,
  farmId,
  fieldId,
  type,
  onSuccess,
  editTransaction,
}: TransactionModalProps) {
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState<Field[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    type,
    category: '',
    subcategory: '',
    amount: '',
    quantity: '',
    unitPrice: '',
    transactionDate: new Date().toISOString().split('T')[0],
    paymentDate: '',
    fieldId: fieldId || '',
    cropId: '',
    notes: '',
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');
  useEffect(() => {
    if (isOpen) {
      fetchFields();
      if (editTransaction) {
        populateForm(editTransaction);
      } else {
        resetForm();
      }
    }
  }, [isOpen, editTransaction]);
  useEffect(() => {
    if (formData.fieldId) {
      fetchCrops(formData.fieldId);
    }
  }, [formData.fieldId]);
  useEffect(() => {
    // Auto-calculate amount if quantity and unit price are provided
    if (formData.quantity && formData.unitPrice) {
      const calculatedAmount = parseFloat(formData.quantity) * parseFloat(formData.unitPrice);
      setFormData(prev => ({ ...prev, amount: calculatedAmount.toFixed(2) }));
    }
  }, [formData.quantity, formData.unitPrice]);
  const resetForm = () => {
    setFormData({
      type,
      category: '',
      subcategory: '',
      amount: '',
      quantity: '',
      unitPrice: '',
      transactionDate: new Date().toISOString().split('T')[0],
      paymentDate: '',
      fieldId: '',
      cropId: '',
      notes: '',
      tags: [],
    });
    setTagInput('');
    setErrors({});
  };
  const populateForm = (transaction: any) => {
    setFormData({
      type: transaction.type,
      category: transaction.category,
      subcategory: transaction.subcategory || '',
      amount: transaction.amount.toString(),
      quantity: transaction.quantity?.toString() || '',
      unitPrice: transaction.unitPrice?.toString() || '',
      transactionDate: transaction.transactionDate.split('T')[0],
      paymentDate: transaction.paymentDate?.split('T')[0] || '',
      fieldId: transaction.fieldId || '',
      cropId: transaction.cropId || '',
      notes: transaction.notes || '',
      tags: transaction.tags || [],
    });
  };
  const fetchFields = async () => {
    try {
      const response = await fetch(`/api/fields?farmId=${farmId}`);
      if (response.ok) {
        const data = await response.json();
        setFields(data.fields || []);
      }
    } catch (error) {
      console.error('Error fetching fields:', error);
    }
  };
  const fetchCrops = async (fieldId: string) => {
    try {
      const response = await fetch(`/api/crops?fieldId=${fieldId}`);
      if (response.ok) {
        const data = await response.json();
        setCrops(data.crops || []);
      }
    } catch (error) {
      console.error('Error fetching crops:', error);
    }
  };
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }
    if (!formData.transactionDate) {
      newErrors.transactionDate = 'Transaction date is required';
    }
    if (formData.quantity && (!formData.unitPrice || parseFloat(formData.unitPrice) <= 0)) {
      newErrors.unitPrice = 'Unit price is required when quantity is specified';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    try {
      const payload = {
        farmId,
        ...formData,
        amount: parseFloat(formData.amount),
        quantity: formData.quantity ? parseFloat(formData.quantity) : undefined,
        unitPrice: formData.unitPrice ? parseFloat(formData.unitPrice) : undefined,
        transactionDate: new Date(formData.transactionDate).toISOString(),
        paymentDate: formData.paymentDate ? new Date(formData.paymentDate).toISOString() : undefined,
        fieldId: formData.fieldId || undefined,
        cropId: formData.cropId || undefined,
      };
      const url = editTransaction
        ? `/api/financial/transactions/${editTransaction.id}`
        : '/api/financial/transactions';
      const method = editTransaction ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const errorData = await response.json();
        if (errorData.details) {
          const fieldErrors: Record<string, string> = {};
          errorData.details.forEach((error: any) => {
            fieldErrors[error.path[0]] = error.message;
          });
          setErrors(fieldErrors);
        } else {
          setErrors({ general: errorData.error || 'Failed to save transaction' });
        }
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
      setErrors({ general: 'Failed to save transaction' });
    } finally {
      setLoading(false);
    }
  };
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };
  const categories = type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const selectedCategory = categories.find(cat => cat.value === formData.category);
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div className={`p-2 rounded-full ${
              type === 'INCOME' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            }`}>
              <DollarSign className="h-5 w-5" />
            </div>
            <span>
              {editTransaction ? 'Edit' : 'Add'} {type === 'INCOME' ? 'Income' : 'Expense'}
            </span>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-700">{errors.general}</span>
            </div>
          )}
          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select category">
                  {selectedCategory && (
                    <div className="flex items-center space-x-2">
                      <span>{selectedCategory.icon}</span>
                      <span>{selectedCategory.label}</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    <div className="flex items-center space-x-2">
                      <span>{category.icon}</span>
                      <span>{category.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
          </div>
          {/* Subcategory */}
          <div className="space-y-2">
            <Label htmlFor="subcategory">Subcategory</Label>
            <Input
              id="subcategory"
              value={formData.subcategory}
              onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
              placeholder="Optional subcategory"
            />
          </div>
          {/* Amount, Quantity, Unit Price */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                className={errors.amount ? 'border-red-500' : ''}
                placeholder="0.00"
              />
              {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                placeholder="Optional"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unitPrice">Unit Price ($)</Label>
              <Input
                id="unitPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.unitPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, unitPrice: e.target.value }))}
                className={errors.unitPrice ? 'border-red-500' : ''}
                placeholder="0.00"
              />
              {errors.unitPrice && <p className="text-sm text-red-500">{errors.unitPrice}</p>}
            </div>
          </div>
          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="transactionDate">Transaction Date *</Label>
              <Input
                id="transactionDate"
                type="date"
                value={formData.transactionDate}
                onChange={(e) => setFormData(prev => ({ ...prev, transactionDate: e.target.value }))}
                className={errors.transactionDate ? 'border-red-500' : ''}
              />
              {errors.transactionDate && <p className="text-sm text-red-500">{errors.transactionDate}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentDate">Payment Date</Label>
              <Input
                id="paymentDate"
                type="date"
                value={formData.paymentDate}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentDate: e.target.value }))}
                placeholder="Optional"
              />
            </div>
          </div>
          {/* Field and Crop Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="field">Field</Label>
              <Select
                value={formData.fieldId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, fieldId: value, cropId: '' }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select field (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {fields.map(field => (
                    <SelectItem key={field.id} value={field.id}>
                      {field.name} ({field.area.toFixed(1)} ha)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="crop">Crop</Label>
              <Select
                value={formData.cropId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, cropId: value }))}
                disabled={!formData.fieldId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select crop (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {crops.map(crop => (
                    <SelectItem key={crop.id} value={crop.id}>
                      {crop.cropType} {crop.variety && `(${crop.variety})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Optional notes..."
              rows={3}
            />
          </div>
          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                  <span>{tag}</span>
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleRemoveTag(tag)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex space-x-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add tag..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <Button type="button" variant="outline" onClick={handleAddTag}>
                <Tag className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className={type === 'INCOME' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {loading ? 'Saving...' : editTransaction ? 'Update' : 'Add'} {type === 'INCOME' ? 'Income' : 'Expense'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}