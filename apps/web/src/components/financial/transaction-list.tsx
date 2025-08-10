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

export function TransactionList({ farmId, onRefresh }: TransactionListProps) {
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
  }, [farmId, currentPage, typeFilter, categoryFilter]);

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
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            </Card>
          </div>
        ))}
      </div>
    );
  }\n\n  return (\n    <div className=\"space-y-6\">\n      {/* Filters */}\n      <Card className=\"p-4\">\n        <div className=\"flex flex-col sm:flex-row gap-4\">\n          <div className=\"flex-1\">\n            <div className=\"relative\">\n              <Search className=\"absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4\" />\n              <Input\n                placeholder=\"Search transactions...\"\n                value={searchTerm}\n                onChange={(e) => setSearchTerm(e.target.value)}\n                className=\"pl-10\"\n              />\n            </div>\n          </div>\n          \n          <Select value={typeFilter} onValueChange={setTypeFilter}>\n            <SelectTrigger className=\"w-full sm:w-48\">\n              <SelectValue placeholder=\"Filter by type\" />\n            </SelectTrigger>\n            <SelectContent>\n              <SelectItem value=\"all\">All Types</SelectItem>\n              <SelectItem value=\"INCOME\">Income</SelectItem>\n              <SelectItem value=\"EXPENSE\">Expenses</SelectItem>\n            </SelectContent>\n          </Select>\n          \n          <Select value={categoryFilter} onValueChange={setCategoryFilter}>\n            <SelectTrigger className=\"w-full sm:w-48\">\n              <SelectValue placeholder=\"Filter by category\" />\n            </SelectTrigger>\n            <SelectContent>\n              <SelectItem value=\"all\">All Categories</SelectItem>\n              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (\n                <SelectItem key={value} value={value}>{label}</SelectItem>\n              ))}\n            </SelectContent>\n          </Select>\n        </div>\n      </Card>\n\n      {/* Transaction List */}\n      <div className=\"space-y-3\">\n        {filteredTransactions.length === 0 ? (\n          <Card className=\"p-8 text-center\">\n            <DollarSign className=\"h-12 w-12 text-gray-400 mx-auto mb-4\" />\n            <h3 className=\"text-lg font-medium text-gray-900 mb-2\">No transactions found</h3>\n            <p className=\"text-gray-600\">Start by adding your first income or expense transaction.</p>\n          </Card>\n        ) : (\n          filteredTransactions.map((transaction) => (\n            <Card key={transaction.id} className=\"p-4 hover:shadow-md transition-shadow\">\n              <div className=\"flex items-start justify-between\">\n                <div className=\"flex-1\">\n                  <div className=\"flex items-center space-x-3 mb-2\">\n                    <Badge \n                      variant={transaction.type === 'INCOME' ? 'default' : 'secondary'}\n                      className={transaction.type === 'INCOME' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}\n                    >\n                      {transaction.type === 'INCOME' ? '↗' : '↙'} {CATEGORY_LABELS[transaction.category] || transaction.category}\n                    </Badge>\n                    \n                    {transaction.subcategory && (\n                      <Badge variant=\"outline\" className=\"text-xs\">\n                        {transaction.subcategory}\n                      </Badge>\n                    )}\n                  </div>\n                  \n                  <div className=\"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600\">\n                    <div className=\"flex items-center space-x-1\">\n                      <Calendar className=\"h-3 w-3\" />\n                      <span>{formatDate(transaction.transactionDate)}</span>\n                    </div>\n                    \n                    {transaction.field && (\n                      <div className=\"flex items-center space-x-1\">\n                        <MapPin className=\"h-3 w-3\" />\n                        <span>{transaction.field.name}</span>\n                      </div>\n                    )}\n                    \n                    {transaction.crop && (\n                      <div className=\"flex items-center space-x-1\">\n                        <span>🌾</span>\n                        <span>{transaction.crop.cropType}</span>\n                      </div>\n                    )}\n                    \n                    {transaction.tags && transaction.tags.length > 0 && (\n                      <div className=\"flex items-center space-x-1\">\n                        <Tag className=\"h-3 w-3\" />\n                        <span>{transaction.tags.join(', ')}</span>\n                      </div>\n                    )}\n                  </div>\n                  \n                  {transaction.notes && (\n                    <p className=\"mt-2 text-sm text-gray-700\">{transaction.notes}</p>\n                  )}\n                  \n                  {transaction.quantity && transaction.unitPrice && (\n                    <p className=\"mt-1 text-xs text-gray-500\">\n                      {transaction.quantity} × {formatCurrency(transaction.unitPrice)}\n                    </p>\n                  )}\n                </div>\n                \n                <div className=\"flex items-center space-x-3 ml-4\">\n                  <span className={`text-lg font-semibold ${\n                    transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'\n                  }`}>\n                    {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}\n                  </span>\n                  \n                  <div className=\"flex items-center space-x-1\">\n                    <Button size=\"sm\" variant=\"outline\" className=\"h-8 w-8 p-0\">\n                      <Edit className=\"h-3 w-3\" />\n                    </Button>\n                    <Button \n                      size=\"sm\" \n                      variant=\"outline\" \n                      className=\"h-8 w-8 p-0 text-red-600 hover:text-red-700\"\n                      onClick={() => handleDelete(transaction.id)}\n                    >\n                      <Trash2 className=\"h-3 w-3\" />\n                    </Button>\n                  </div>\n                </div>\n              </div>\n            </Card>\n          ))\n        )}\n      </div>\n\n      {/* Pagination */}\n      {totalPages > 1 && (\n        <Card className=\"p-4\">\n          <div className=\"flex items-center justify-between\">\n            <div className=\"text-sm text-gray-600\">\n              Page {currentPage} of {totalPages}\n            </div>\n            \n            <div className=\"flex items-center space-x-2\">\n              <Button\n                size=\"sm\"\n                variant=\"outline\"\n                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}\n                disabled={currentPage === 1}\n              >\n                <ChevronLeft className=\"h-4 w-4\" />\n                Previous\n              </Button>\n              \n              <Button\n                size=\"sm\"\n                variant=\"outline\"\n                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}\n                disabled={currentPage === totalPages}\n              >\n                Next\n                <ChevronRight className=\"h-4 w-4\" />\n              </Button>\n            </div>\n          </div>\n        </Card>\n      )}\n    </div>\n  );\n}