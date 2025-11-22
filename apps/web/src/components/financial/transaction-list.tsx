'use client';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  DollarSign,
  Calendar,
  MapPin,
  Tag
} from 'lucide-react';
interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  subcategory?: string;
  amount: number;
  quantity?: number;
  unitPrice?: number;
  transactionDate: string;
  paymentDate?: string;
  notes?: string;
  tags?: string[];
  field?: {
    id: string;
    name: string;
  };
  crop?: {
    id: string;
    cropType: string;
    variety?: string;
  };
}
interface TransactionListProps {
  farmId: string;
  fieldId?: string;
  onRefresh: () => void;
}
const CATEGORY_LABELS: Record<string, string> = {
  CROP_SALES: 'Crop Sales',
  LIVESTOCK_SALES: 'Livestock Sales',
  SUBSIDIES: 'Subsidies',
  LEASE_INCOME: 'Lease Income',
  OTHER_INCOME: 'Other Income',
  SEEDS: 'Seeds',
  FERTILIZER: 'Fertilizer',
  PESTICIDES: 'Pesticides',
  LABOR: 'Labor',
  MACHINERY: 'Machinery',
  FUEL: 'Fuel',
  IRRIGATION: 'Irrigation',
  STORAGE: 'Storage',
  INSURANCE: 'Insurance',
  OVERHEAD: 'Overhead',
  OTHER_EXPENSE: 'Other Expenses',
};
export function TransactionList({ farmId, fieldId, onRefresh }: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 20;
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        farmId,
        limit: itemsPerPage.toString(),
        offset: ((currentPage - 1) * itemsPerPage).toString(),
      });
      if (fieldId) {
        params.append('fieldId', fieldId);
      }
      if (typeFilter !== 'all') {
        params.append('type', typeFilter);
      }
      if (categoryFilter !== 'all') {
        params.append('category', categoryFilter);
      }
      const response = await fetch(`/api/financial/transactions?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions);
        setTotalPages(Math.ceil(data.pagination.total / itemsPerPage));
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchTransactions();
  }, [farmId, fieldId, currentPage, typeFilter, categoryFilter]);
  const handleDelete = async (transactionId: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) {
      return;
    }
    try {
      const response = await fetch(`/api/financial/transactions/${transactionId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchTransactions();
        onRefresh();
      } else {
        alert('Failed to delete transaction');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Failed to delete transaction');
    }
  };
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = !searchTerm || 
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.subcategory?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.field?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.crop?.cropType.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-[#F5F5F5] rounded w-32"></div>
                  <div className="h-3 bg-[#F5F5F5] rounded w-24"></div>
                </div>
                <div className="h-6 bg-[#F5F5F5] rounded w-20"></div>
              </div>
            </Card>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#555555] h-4 w-4" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="INCOME">Income</SelectItem>
              <SelectItem value="EXPENSE">Expenses</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>
      {/* Transaction List */}
      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
          <Card className="p-8 text-center">
            <DollarSign className="h-12 w-12 text-[#555555] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#1A1A1A] mb-2">No transactions found</h3>
            <p className="text-[#555555]">Start by adding your first income or expense transaction.</p>
          </Card>
        ) : (
          filteredTransactions.map((transaction) => (
            <Card key={transaction.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Badge 
                      variant={transaction.type === 'INCOME' ? 'default' : 'secondary'}
                      className={transaction.type === 'INCOME' ? 'bg-[#F8FAF8] text-[#7A8F78] border-[#DDE4D8]' : 'bg-red-100 text-red-800 border-red-200'}
                    >
                      {transaction.type === 'INCOME' ? '↗' : '↙'} {CATEGORY_LABELS[transaction.category] || transaction.category}
                    </Badge>
                    {transaction.subcategory && (
                      <Badge variant="outline" className="text-xs">
                        {transaction.subcategory}
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-[#555555]">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(transaction.transactionDate)}</span>
                    </div>
                    {transaction.field && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>{transaction.field.name}</span>
                      </div>
                    )}
                    {transaction.crop && (
                      <div className="flex items-center space-x-1">
                        <span>🌾</span>
                        <span>{transaction.crop.cropType}</span>
                      </div>
                    )}
                    {transaction.tags && transaction.tags.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <Tag className="h-3 w-3" />
                        <span>{transaction.tags.join(', ')}</span>
                      </div>
                    )}
                  </div>
                  {transaction.notes && (
                    <p className="mt-2 text-sm text-[#555555]">{transaction.notes}</p>
                  )}
                  {transaction.quantity && transaction.unitPrice && (
                    <p className="mt-1 text-xs text-[#555555]">
                      {transaction.quantity} × {formatCurrency(transaction.unitPrice)}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-3 ml-4">
                  <span className={`text-lg font-semibold ${
                    transaction.type === 'INCOME' ? 'text-[#8FBF7F]' : 'text-red-600'
                  }`}>
                    {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(transaction.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-[#555555]">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}